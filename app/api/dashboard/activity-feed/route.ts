import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api/auth'
import {
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@/lib/api/responses'
import { ZodError, z } from 'zod'

const activityFeedQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
})

/**
 * GET /api/dashboard/activity-feed
 * Get recent activity logs for the dashboard
 * Query params: limit (default 20), offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = activityFeedQuerySchema.parse({
      limit: searchParams.get('limit') || '20',
      offset: searchParams.get('offset') || '0',
    })

    // Get user's homes
    const homes = await prisma.home.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (homes.length === 0) {
      return successResponse({
        activities: [],
        total: 0,
        limit: query.limit,
        offset: query.offset,
      })
    }

    const homeIds = homes.map((h) => h.id)

    // Fetch activities with pagination
    // OPTIMIZED: Parallel query + count, indexed sort, selective fields
    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: {
          homeId: { in: homeIds },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: query.limit,
        skip: query.offset,
        select: {
          id: true,
          activityType: true,
          entityType: true,
          entityId: true,
          entityName: true,
          description: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.activityLog.count({
        where: {
          homeId: { in: homeIds },
        },
      }),
    ])

    // Parse metadata JSON strings
    const activitiesWithParsedMetadata = activities.map((activity) => ({
      ...activity,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
    }))

    return successResponse({
      activities: activitiesWithParsedMetadata,
      total,
      limit: query.limit,
      offset: query.offset,
      hasMore: query.offset + query.limit < total,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }
    return serverErrorResponse(error)
  }
}

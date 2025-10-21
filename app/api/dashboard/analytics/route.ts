import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api/auth'
import {
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@/lib/api/responses'
import {
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  eachDayOfInterval,
  format,
} from 'date-fns'
import { ZodError, z } from 'zod'
import { dashboardCache } from '@/lib/utils/cache'

const analyticsQuerySchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
})

/**
 * GET /api/dashboard/analytics
 * Get dashboard analytics data for charts
 * Query params: period (week, month, quarter, year)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = analyticsQuerySchema.parse({
      period: searchParams.get('period') || 'month',
    })

    // PERFORMANCE OPTIMIZATION: Use cache for dashboard analytics
    const result = await dashboardCache.getAnalytics(
      session.user.id,
      query.period,
      async () => await fetchAnalytics(session.user.id, query.period)
    )

    return successResponse(result)
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

/**
 * Fetch analytics data (cacheable function)
 */
async function fetchAnalytics(
  userId: string,
  period: 'week' | 'month' | 'quarter' | 'year'
) {
  // OPTIMIZED: Get user's homes with single query
  const homes = await prisma.home.findMany({
    where: { userId },
    select: { id: true },
  })

  if (homes.length === 0) {
    return {
      completionTrend: [],
      categoryBreakdown: [],
      priorityDistribution: [],
    }
  }

  const homeIds = homes.map((h) => h.id)

  // Calculate date range based on period
  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'week':
      startDate = startOfWeek(now)
      break
    case 'quarter':
      startDate = startOfQuarter(now)
      break
    case 'year':
      startDate = startOfYear(now)
      break
    case 'month':
    default:
      startDate = startOfMonth(now)
      break
  }

  // 1. Completion Trend - Tasks completed over time
  const completedTasks = await prisma.task.findMany({
    where: {
      homeId: { in: homeIds },
      status: 'COMPLETED',
      completedAt: {
        gte: startDate,
        lte: now,
      },
    },
    select: {
      completedAt: true,
    },
    orderBy: {
      completedAt: 'asc',
    },
  })

  // Group by day
  const dayInterval = eachDayOfInterval({ start: startDate, end: now })
  const completionTrend = dayInterval.map((day) => {
    const count = completedTasks.filter((task) => {
      const completedDate = new Date(task.completedAt!)
      return format(completedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    }).length

    return {
      date: format(day, 'yyyy-MM-dd'),
      count,
    }
  })

  // 2. Category Breakdown - Tasks by asset category
  // OPTIMIZED: Fetch tasks with asset info in single query, group in memory
  const tasksByCategory = await prisma.task.findMany({
    where: {
      homeId: { in: homeIds },
      status: { not: 'CANCELLED' },
      assetId: { not: null },
    },
    select: {
      id: true,
      asset: {
        select: {
          category: true,
        },
      },
    },
  })

  const categoryMap = new Map<string, number>()
  tasksByCategory.forEach((task) => {
    if (task.asset) {
      const category = task.asset.category
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    }
  })

  const categoryBreakdown = Array.from(categoryMap.entries()).map(
    ([category, count]) => ({
      category,
      count,
    })
  )

  // 3. Priority Distribution - Tasks by priority
  const tasksByPriority = await prisma.task.groupBy({
    by: ['priority'],
    where: {
      homeId: { in: homeIds },
      status: { notIn: ['COMPLETED', 'CANCELLED'] },
    },
    _count: {
      priority: true,
    },
  })

  const priorityDistribution = tasksByPriority.map((item) => ({
    priority: item.priority,
    count: item._count.priority,
  }))

  return {
    period,
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    completionTrend,
    categoryBreakdown,
    priorityDistribution,
  }
}

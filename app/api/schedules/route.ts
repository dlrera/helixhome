import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const assetId = searchParams.get('assetId')
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build query conditions
    const where: any = {
      asset: {
        home: {
          userId: session.user.id
        }
      }
    }

    // Only filter by isActive if not including inactive schedules
    if (!includeInactive) {
      where.isActive = true
    }

    if (assetId) {
      where.assetId = assetId
    }

    // Fetch schedules with related data
    const [schedules, total] = await Promise.all([
      prisma.recurringSchedule.findMany({
        where,
        include: {
          asset: {
            select: {
              id: true,
              name: true,
              category: true
            }
          },
          template: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              defaultFrequency: true,
              difficulty: true,
              estimatedDurationMinutes: true
            }
          }
        },
        orderBy: [
          { nextDueDate: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.recurringSchedule.count({ where })
    ])

    return NextResponse.json({
      schedules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}
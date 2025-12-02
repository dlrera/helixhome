import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api/auth'

/**
 * GET /api/notifications/count
 * Returns count of actionable items requiring user attention:
 * - Overdue tasks
 * - Tasks due within the next 7 days
 */
export async function GET() {
  try {
    const session = await requireAuth()

    // Get user's homes
    const homes = await prisma.home.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (homes.length === 0) {
      return NextResponse.json({ count: 0 })
    }

    const homeIds = homes.map((h) => h.id)

    // Calculate date 7 days from now
    const now = new Date()
    const sevenDaysFromNow = new Date(now)
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    // Count overdue tasks + tasks due within 7 days
    const count = await prisma.task.count({
      where: {
        homeId: { in: homeIds },
        OR: [
          // Overdue tasks
          { status: 'OVERDUE' },
          // Tasks due within 7 days that are pending or in progress
          {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
            dueDate: {
              gte: now,
              lte: sevenDaysFromNow,
            },
          },
        ],
      },
    })

    return NextResponse.json({ count })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching notification count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification count' },
      { status: 500 }
    )
  }
}

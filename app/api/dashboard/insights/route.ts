import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api/auth'
import {
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api/responses'
import { differenceInDays, startOfDay, subDays } from 'date-fns'

/**
 * Insight type definition for dashboard insights
 */
interface Insight {
  type: 'info' | 'warning' | 'success' | 'alert'
  title: string
  description: string
  actionable?: boolean
  metadata?: Record<string, unknown>
}

/**
 * GET /api/dashboard/insights
 * Generate real maintenance insights based on user's data
 */
export async function GET() {
  try {
    const session = await requireAuth()

    // Get user's homes for data isolation
    const homes = await prisma.home.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (homes.length === 0) {
      return successResponse<Insight[]>([])
    }

    const homeIds = homes.map((h) => h.id)
    const insights: Insight[] = []

    // Generate all insights in parallel for performance
    const [
      mostMaintainedAsset,
      longestOverdueTask,
      completionStreak,
      highPriorityTasksDueSoon,
    ] = await Promise.all([
      getMostMaintainedAsset(homeIds),
      getLongestOverdueTask(homeIds),
      getCompletionStreak(homeIds),
      getHighPriorityTasksDueSoon(homeIds),
    ])

    // Add insights that have data
    if (mostMaintainedAsset) {
      insights.push(mostMaintainedAsset)
    }
    if (longestOverdueTask) {
      insights.push(longestOverdueTask)
    }
    if (completionStreak) {
      insights.push(completionStreak)
    }
    if (highPriorityTasksDueSoon) {
      insights.push(highPriorityTasksDueSoon)
    }

    return successResponse(insights)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return serverErrorResponse(error)
  }
}

/**
 * Find the asset with the most COMPLETED tasks
 */
async function getMostMaintainedAsset(
  homeIds: string[]
): Promise<Insight | null> {
  // Get completed tasks grouped by asset
  const completedTasksByAsset = await prisma.task.groupBy({
    by: ['assetId'],
    where: {
      homeId: { in: homeIds },
      status: 'COMPLETED',
      assetId: { not: null },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 1,
  })

  const topAssetData = completedTasksByAsset[0]
  if (!topAssetData || !topAssetData.assetId) {
    return null
  }

  const assetId = topAssetData.assetId
  const completedCount = topAssetData._count.id

  // Only show if at least 2 completed tasks
  if (completedCount < 2) {
    return null
  }

  // Get asset name
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { name: true },
  })

  if (!asset) {
    return null
  }

  return {
    type: 'success',
    title: 'Most Maintained Asset',
    description: `${asset.name} has ${completedCount} completed maintenance tasks`,
    metadata: {
      assetId,
      completedCount,
    },
  }
}

/**
 * Find the OVERDUE task with the oldest dueDate
 */
async function getLongestOverdueTask(
  homeIds: string[]
): Promise<Insight | null> {
  const overdueTask = await prisma.task.findFirst({
    where: {
      homeId: { in: homeIds },
      status: 'OVERDUE',
    },
    orderBy: {
      dueDate: 'asc',
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
    },
  })

  if (!overdueTask) {
    return null
  }

  const daysOverdue = differenceInDays(new Date(), overdueTask.dueDate)

  return {
    type: 'alert',
    title: 'Longest Overdue Task',
    description: `${overdueTask.title} is ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} overdue`,
    actionable: true,
    metadata: {
      taskId: overdueTask.id,
      filterType: 'overdue',
      daysOverdue,
    },
  }
}

/**
 * Count consecutive days where at least one task was completed
 * Only show if streak >= 2 days
 */
async function getCompletionStreak(homeIds: string[]): Promise<Insight | null> {
  // Get completed tasks from last 30 days to find streak
  const thirtyDaysAgo = subDays(new Date(), 30)

  const completedTasks = await prisma.task.findMany({
    where: {
      homeId: { in: homeIds },
      status: 'COMPLETED',
      completedAt: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      completedAt: true,
    },
    orderBy: {
      completedAt: 'desc',
    },
  })

  if (completedTasks.length === 0) {
    return null
  }

  // Build set of unique completion dates
  const completionDates = new Set<string>()
  for (const task of completedTasks) {
    if (task.completedAt) {
      const dateKey = startOfDay(task.completedAt).toISOString()
      completionDates.add(dateKey)
    }
  }

  // Count consecutive days starting from today (or yesterday if no task today)
  let streak = 0
  const today = startOfDay(new Date())

  // Check if today has completions
  const todayKey = today.toISOString()
  let checkDate = completionDates.has(todayKey) ? today : subDays(today, 1)

  // Count consecutive days
  while (completionDates.has(startOfDay(checkDate).toISOString())) {
    streak++
    checkDate = subDays(checkDate, 1)
  }

  // Only show if streak >= 2 days
  if (streak < 2) {
    return null
  }

  return {
    type: 'success',
    title: 'Completion Streak',
    description: `You've completed tasks for ${streak} consecutive days!`,
    metadata: {
      streakDays: streak,
    },
  }
}

/**
 * Count HIGH or URGENT priority tasks with dueDate within next 7 days
 * that are PENDING or IN_PROGRESS
 */
async function getHighPriorityTasksDueSoon(
  homeIds: string[]
): Promise<Insight | null> {
  const now = new Date()
  const sevenDaysFromNow = new Date(now)
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

  const count = await prisma.task.count({
    where: {
      homeId: { in: homeIds },
      priority: { in: ['HIGH', 'URGENT'] },
      status: { in: ['PENDING', 'IN_PROGRESS'] },
      dueDate: {
        gte: now,
        lte: sevenDaysFromNow,
      },
    },
  })

  if (count === 0) {
    return null
  }

  return {
    type: 'info',
    title: 'High-Priority Tasks Due Soon',
    description: `${count} high-priority ${count === 1 ? 'task needs' : 'tasks need'} attention within the next 7 days`,
    actionable: true,
    metadata: {
      filterType: 'high-priority',
      count,
    },
  }
}

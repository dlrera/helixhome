import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Cron job to mark overdue tasks
 *
 * This endpoint should be called daily by a cron service (e.g., Vercel Cron, GitHub Actions)
 * to automatically mark tasks that have passed their due date as OVERDUE.
 *
 * Authentication: Requires CRON_SECRET environment variable to match the request header
 *
 * Usage with Vercel Cron:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/mark-overdue",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 *
 * @returns {Object} JSON response with count of tasks marked as overdue
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('CRON_SECRET environment variable is not set')
      return NextResponse.json(
        { error: 'Cron job is not configured' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron job access attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find all tasks that are pending and past their due date
    const overdueTasks = await prisma.task.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: new Date()
        }
      },
      select: {
        id: true,
        title: true,
        dueDate: true
      }
    })

    // Update all overdue tasks to OVERDUE status
    const result = await prisma.task.updateMany({
      where: {
        id: {
          in: overdueTasks.map((task) => task.id)
        }
      },
      data: {
        status: 'OVERDUE'
      }
    })

    const response = {
      success: true,
      tasksUpdated: result.count,
      timestamp: new Date().toISOString(),
      tasks: overdueTasks.map((task) => ({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate
      }))
    }

    console.log(`[Cron] Marked ${result.count} tasks as overdue`, {
      timestamp: response.timestamp,
      taskIds: overdueTasks.map((t) => t.id)
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Cron] Error marking tasks as overdue:', error)
    return NextResponse.json(
      {
        error: 'Failed to mark tasks as overdue',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request)
}

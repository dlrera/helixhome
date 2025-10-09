import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateNextDueDate } from '@/lib/utils/template-helpers'
import { TaskStatus, Priority } from '@prisma/client'

// This cron job should run daily to process recurring schedules
// In production, you'd configure this with Vercel Cron or similar service
// Example cron config: 0 0 * * * (midnight every day)

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security (in production)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // In production, uncomment this security check
    // if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    console.log('[CRON] Starting schedule processing...')

    // Find all active schedules where nextDueDate is today or in the past
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Start of today

    const dueSchedules = await prisma.recurringSchedule.findMany({
      where: {
        isActive: true,
        nextDueDate: {
          lte: now
        }
      },
      include: {
        template: true,
        asset: {
          include: {
            home: true
          }
        }
      }
    })

    console.log(`[CRON] Found ${dueSchedules.length} schedules to process`)

    const results = {
      processed: 0,
      tasksCreated: 0,
      errors: [] as Array<{ scheduleId: string; error: string }>
    }

    // Process each due schedule
    for (const schedule of dueSchedules) {
      try {
        // Create a task from the template
        const task = await prisma.task.create({
          data: {
            homeId: schedule.asset.homeId,
            assetId: schedule.assetId,
            templateId: schedule.templateId,
            title: schedule.template.name,
            description: schedule.template.description || '',
            dueDate: schedule.nextDueDate,
            priority: Priority.MEDIUM,
            status: TaskStatus.PENDING,
            notes: `Scheduled maintenance: ${schedule.template.name}`
          }
        })

        console.log(`[CRON] Created task for schedule ${schedule.id}: ${task.id}`)
        results.tasksCreated++

        // Calculate and update the next due date
        const nextDueDate = calculateNextDueDate(
          schedule.nextDueDate,
          schedule.frequency,
          schedule.customFrequencyDays ?? undefined
        )

        await prisma.recurringSchedule.update({
          where: { id: schedule.id },
          data: { nextDueDate }
        })

        console.log(`[CRON] Updated next due date for schedule ${schedule.id}: ${nextDueDate.toISOString()}`)
        results.processed++

        // TODO: Send notification to user about the new task
        // This would integrate with your notification system
        // await sendNotification({
        //   userId: schedule.asset.home.userId,
        //   type: 'TASK_CREATED',
        //   taskId: task.id,
        //   message: `Maintenance due: ${schedule.template.name} for ${schedule.asset.name}`
        // })

      } catch (error: any) {
        console.error(`[CRON] Error processing schedule ${schedule.id}:`, error)
        results.errors.push({
          scheduleId: schedule.id,
          error: error.message
        })
      }
    }

    // Also check for overdue tasks and update their status
    const overdueTasks = await prisma.task.updateMany({
      where: {
        status: TaskStatus.PENDING,
        dueDate: {
          lt: now
        }
      },
      data: {
        status: TaskStatus.OVERDUE
      }
    })

    console.log(`[CRON] Marked ${overdueTasks.count} tasks as overdue`)

    // Log summary
    const summary = {
      timestamp: new Date().toISOString(),
      schedulesProcessed: results.processed,
      tasksCreated: results.tasksCreated,
      overdueTasksMarked: overdueTasks.count,
      errors: results.errors.length,
      errorDetails: results.errors
    }

    console.log('[CRON] Schedule processing complete:', summary)

    return NextResponse.json(summary, { status: 200 })

  } catch (error: any) {
    console.error('[CRON] Fatal error in schedule processing:', error)
    return NextResponse.json(
      {
        error: 'Failed to process schedules',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Manual trigger endpoint for testing (POST request)
export async function POST(request: NextRequest) {
  // In production, you might want to restrict this to admin users only
  console.log('[CRON] Manual trigger initiated')
  return GET(request)
}
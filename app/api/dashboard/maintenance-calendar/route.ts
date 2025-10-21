import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api/auth'
import {
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@/lib/api/responses'
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns'
import { ZodError, z } from 'zod'

const calendarQuerySchema = z.object({
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2000).max(2100).optional(),
})

/**
 * GET /api/dashboard/maintenance-calendar
 * Get maintenance tasks grouped by date for calendar view
 * Query params: month (1-12, optional), year (optional)
 * Defaults to current month if not provided
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const now = new Date()
    const query = calendarQuerySchema.parse({
      month: searchParams.get('month') || undefined,
      year: searchParams.get('year') || undefined,
    })

    // Use current month/year if not provided
    const targetMonth = query.month || now.getMonth() + 1 // getMonth() is 0-indexed
    const targetYear = query.year || now.getFullYear()

    // Get user's homes
    const homes = await prisma.home.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (homes.length === 0) {
      return successResponse({
        month: targetMonth,
        year: targetYear,
        calendar: [],
      })
    }

    const homeIds = homes.map((h) => h.id)

    // Calculate month boundaries (JavaScript Date months are 0-indexed)
    const monthStart = startOfMonth(new Date(targetYear, targetMonth - 1, 1))
    const monthEnd = endOfMonth(new Date(targetYear, targetMonth - 1, 1))

    // Fetch all tasks in this month
    // OPTIMIZED: Single query with date range filter, selective fields, efficient asset join
    const tasks = await prisma.task.findMany({
      where: {
        homeId: { in: homeIds },
        dueDate: {
          gte: monthStart,
          lte: monthEnd,
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        status: true,
        priority: true,
        asset: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    })

    // Group tasks by date
    const dayInterval = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const calendar = dayInterval.map((day) => {
      const dayKey = format(day, 'yyyy-MM-dd')

      const dayTasks = tasks.filter((task) => {
        const taskDate = format(new Date(task.dueDate), 'yyyy-MM-dd')
        return taskDate === dayKey
      })

      // Count by status
      const statusCounts = {
        pending: dayTasks.filter((t) => t.status === 'PENDING').length,
        inProgress: dayTasks.filter((t) => t.status === 'IN_PROGRESS').length,
        completed: dayTasks.filter((t) => t.status === 'COMPLETED').length,
        overdue: dayTasks.filter((t) => t.status === 'OVERDUE').length,
      }

      // Count by priority
      const priorityCounts = {
        high: dayTasks.filter((t) => t.priority === 'HIGH').length,
        medium: dayTasks.filter((t) => t.priority === 'MEDIUM').length,
        low: dayTasks.filter((t) => t.priority === 'LOW').length,
      }

      return {
        date: dayKey,
        dayOfMonth: day.getDate(),
        totalTasks: dayTasks.length,
        statusCounts,
        priorityCounts,
        tasks: dayTasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          asset: task.asset,
        })),
      }
    })

    return successResponse({
      month: targetMonth,
      year: targetYear,
      startDate: monthStart.toISOString(),
      endDate: monthEnd.toISOString(),
      calendar,
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

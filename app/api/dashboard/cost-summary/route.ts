import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api/auth';
import {
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@/lib/api/responses';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { ZodError, z } from 'zod';

const costSummaryQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * GET /api/dashboard/cost-summary
 * Get maintenance cost summary and budget tracking
 * Query params: startDate (optional), endDate (optional)
 * Defaults to current month if no dates provided
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = costSummaryQuerySchema.parse({
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    });

    // Get user's homes and budget settings
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        maintenanceBudget: true,
        budgetStartDate: true,
      },
    });

    const homes = await prisma.home.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (homes.length === 0) {
      return successResponse({
        totalSpent: 0,
        budgetProgress: null,
        categoryBreakdown: [],
        monthOverMonth: [],
      });
    }

    const homeIds = homes.map((h) => h.id);

    // Calculate date range - default to current month
    const now = new Date();
    const startDate = query.startDate ? new Date(query.startDate) : startOfMonth(now);
    const endDate = query.endDate ? new Date(query.endDate) : endOfMonth(now);

    // 1. Total Spent - Sum of actualCost for completed tasks in date range
    const tasksWithCosts = await prisma.task.findMany({
      where: {
        homeId: { in: homeIds },
        status: 'COMPLETED',
        completedAt: {
          gte: startDate,
          lte: endDate,
        },
        actualCost: {
          not: null,
        },
      },
      select: {
        actualCost: true,
        asset: {
          select: {
            category: true,
          },
        },
        completedAt: true,
      },
    });

    const totalSpent = tasksWithCosts.reduce(
      (sum, task) => sum + (task.actualCost || 0),
      0
    );

    // 2. Budget Progress - Compare to user's maintenance budget
    let budgetProgress = null;
    if (user?.maintenanceBudget) {
      const budgetAmount = user.maintenanceBudget;
      const percentageUsed = (totalSpent / budgetAmount) * 100;
      const remaining = budgetAmount - totalSpent;

      budgetProgress = {
        budget: budgetAmount,
        spent: totalSpent,
        remaining,
        percentageUsed: Math.round(percentageUsed * 100) / 100, // Round to 2 decimals
        isOverBudget: totalSpent > budgetAmount,
      };
    }

    // 3. Category Breakdown - Costs grouped by asset category
    const categoryMap = new Map<string, number>();
    tasksWithCosts.forEach((task) => {
      if (task.asset) {
        const category = task.asset.category;
        const currentTotal = categoryMap.get(category) || 0;
        categoryMap.set(category, currentTotal + (task.actualCost || 0));
      }
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, total]) => ({
        category,
        total: Math.round(total * 100) / 100, // Round to 2 decimals
      }))
      .sort((a, b) => b.total - a.total); // Sort by highest cost first

    // 4. Month-over-Month Trend - Last 6 months including current
    const monthOverMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));

      const monthTasks = await prisma.task.findMany({
        where: {
          homeId: { in: homeIds },
          status: 'COMPLETED',
          completedAt: {
            gte: monthStart,
            lte: monthEnd,
          },
          actualCost: {
            not: null,
          },
        },
        select: {
          actualCost: true,
        },
      });

      const monthTotal = monthTasks.reduce(
        (sum, task) => sum + (task.actualCost || 0),
        0
      );

      monthOverMonth.push({
        month: format(monthStart, 'MMM yyyy'),
        total: Math.round(monthTotal * 100) / 100,
        count: monthTasks.length,
      });
    }

    return successResponse({
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      totalSpent: Math.round(totalSpent * 100) / 100,
      budgetProgress,
      categoryBreakdown,
      monthOverMonth,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return serverErrorResponse(error);
  }
}

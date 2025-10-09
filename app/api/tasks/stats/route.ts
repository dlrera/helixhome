import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api/auth";
import {
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/api/responses";

/**
 * GET /api/tasks/stats
 * Get task statistics for the user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Parse optional date range
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;

    // Get user's homes
    const homes = await prisma.home.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (homes.length === 0) {
      return successResponse({
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        overdue: 0,
        cancelled: 0,
        completionRate: 0,
        byStatus: {},
        byPriority: {},
      });
    }

    const homeIds = homes.map((h) => h.id);

    // Build base where clause
    const where: any = {
      homeId: { in: homeIds },
    };

    // Add date range if provided
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Get counts by status
    const [totalTasks, completedTasks, pendingTasks, inProgressTasks, overdueTasks, cancelledTasks] =
      await Promise.all([
        prisma.task.count({ where }),
        prisma.task.count({ where: { ...where, status: "COMPLETED" } }),
        prisma.task.count({ where: { ...where, status: "PENDING" } }),
        prisma.task.count({ where: { ...where, status: "IN_PROGRESS" } }),
        prisma.task.count({ where: { ...where, status: "OVERDUE" } }),
        prisma.task.count({ where: { ...where, status: "CANCELLED" } }),
      ]);

    // Get counts by priority
    const [lowPriority, mediumPriority, highPriority, urgentPriority] = await Promise.all([
      prisma.task.count({ where: { ...where, priority: "LOW" } }),
      prisma.task.count({ where: { ...where, priority: "MEDIUM" } }),
      prisma.task.count({ where: { ...where, priority: "HIGH" } }),
      prisma.task.count({ where: { ...where, priority: "URGENT" } }),
    ]);

    // Calculate completion rate (exclude cancelled tasks)
    const totalExcludingCancelled = totalTasks - cancelledTasks;
    const completionRate =
      totalExcludingCancelled > 0
        ? Math.round((completedTasks / totalExcludingCancelled) * 100)
        : 0;

    const stats = {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      inProgress: inProgressTasks,
      overdue: overdueTasks,
      cancelled: cancelledTasks,
      completionRate,
      byStatus: {
        PENDING: pendingTasks,
        IN_PROGRESS: inProgressTasks,
        COMPLETED: completedTasks,
        OVERDUE: overdueTasks,
        CANCELLED: cancelledTasks,
      },
      byPriority: {
        LOW: lowPriority,
        MEDIUM: mediumPriority,
        HIGH: highPriority,
        URGENT: urgentPriority,
      },
    };

    return successResponse(stats);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

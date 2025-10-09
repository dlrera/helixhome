import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api/auth";
import {
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/api/responses";
import { createTaskSchema, taskFilterSchema } from "@/lib/validation/task";
import { logTaskCreated } from "@/lib/utils/activity-logger";
import { ZodError } from "zod";

/**
 * GET /api/tasks
 * List tasks with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      status: searchParams.get("status")?.split(","),
      priority: searchParams.get("priority")?.split(","),
      assetId: searchParams.get("assetId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    };

    const filters = taskFilterSchema.parse(queryParams);

    // Get user's homes
    const homes = await prisma.home.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (homes.length === 0) {
      return successResponse({
        tasks: [],
        total: 0,
        page: filters.page,
        limit: filters.limit,
        totalPages: 0
      });
    }

    const homeIds = homes.map((h) => h.id);

    // Build where clause for filtering
    const where: any = {
      homeId: { in: homeIds },
    };

    // Status filter
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority };
    }

    // Asset filter
    if (filters.assetId) {
      where.assetId = filters.assetId;
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      where.dueDate = {};
      if (filters.startDate) {
        where.dueDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.dueDate.lte = filters.endDate;
      }
    }

    // Search filter (title and description)
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    // Mark overdue tasks before fetching
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.task.updateMany({
      where: {
        homeId: { in: homeIds },
        status: "PENDING",
        dueDate: { lt: today },
      },
      data: {
        status: "OVERDUE",
      },
    });

    // Get total count for pagination
    const total = await prisma.task.count({ where });

    // Calculate pagination
    const skip = (filters.page - 1) * filters.limit;
    const totalPages = Math.ceil(total / filters.limit);

    // Fetch tasks with relations
    const tasks = await prisma.task.findMany({
      where,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // OVERDUE first (alphabetically)
        { priority: "desc" }, // Then by priority
        { dueDate: "asc" }, // Then by due date
      ],
      skip,
      take: filters.limit,
    });

    return successResponse({
      tasks,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return serverErrorResponse(error);
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = createTaskSchema.parse(body);

    // Verify user owns the home
    const home = await prisma.home.findFirst({
      where: {
        id: data.homeId,
        userId: session.user.id,
      },
    });

    if (!home) {
      return unauthorizedResponse("Home not found or unauthorized");
    }

    // If assetId provided, verify user owns the asset
    if (data.assetId) {
      const asset = await prisma.asset.findFirst({
        where: {
          id: data.assetId,
          homeId: data.homeId,
        },
      });

      if (!asset) {
        return unauthorizedResponse("Asset not found or unauthorized");
      }
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        dueDate: data.dueDate,
        priority: data.priority,
        homeId: data.homeId,
        assetId: data.assetId || null,
        status: "PENDING",
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    await logTaskCreated({
      userId: session.user.id,
      homeId: data.homeId,
      taskId: task.id,
      taskTitle: task.title,
      priority: task.priority,
    });

    return successResponse({ task }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return serverErrorResponse(error);
  }
}

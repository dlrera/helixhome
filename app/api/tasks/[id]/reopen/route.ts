import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api/auth";
import {
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
  notFoundResponse,
} from "@/lib/api/responses";

/**
 * POST /api/tasks/[id]/reopen
 * Reopen a completed or cancelled task
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Fetch task and verify ownership
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        home: {
          select: { userId: true },
        },
      },
    });

    if (!task) {
      return notFoundResponse("Task");
    }

    if (task.home.userId !== session.user.id) {
      return unauthorizedResponse("Not authorized to reopen this task");
    }

    // Verify task is completed or cancelled
    if (task.status !== "COMPLETED" && task.status !== "CANCELLED") {
      return unauthorizedResponse("Only completed or cancelled tasks can be reopened");
    }

    // Reopen the task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: "PENDING",
        completedAt: null,
        completedBy: null,
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

    return successResponse({ task: updatedTask });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

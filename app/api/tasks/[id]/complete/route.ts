import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api/auth";
import {
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
  successResponse,
  notFoundResponse,
} from "@/lib/api/responses";
import { completeTaskSchema } from "@/lib/validation/task";
import { logTaskCompleted } from "@/lib/utils/activity-logger";
import { ZodError } from "zod";

/**
 * POST /api/tasks/[id]/complete
 * Mark task as complete with optional notes and photos
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const data = completeTaskSchema.parse(body);

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
      return unauthorizedResponse("Not authorized to complete this task");
    }

    // Check if task is already completed
    if (task.status === "COMPLETED") {
      return unauthorizedResponse("Task is already completed");
    }

    // Use transaction to update task and schedule if applicable
    const updatedTask = await prisma.$transaction(async (tx) => {
      // Update task
      const updated = await tx.task.update({
        where: { id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          completedBy: session.user.id,
          completionNotes: data.completionNotes || null,
          completionPhotos: data.completionPhotos
            ? JSON.stringify(data.completionPhotos)
            : null,
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

      // If task has a template, update the recurring schedule
      if (task.templateId && task.assetId) {
        await tx.recurringSchedule.updateMany({
          where: {
            templateId: task.templateId,
            assetId: task.assetId,
            isActive: true,
          },
          data: {
            lastCompletedDate: new Date(),
          },
        });
      }

      return updated;
    });

    // Log activity
    await logTaskCompleted({
      userId: session.user.id,
      homeId: task.homeId,
      taskId: updatedTask.id,
      taskTitle: updatedTask.title,
      cost: updatedTask.actualCost ? Number(updatedTask.actualCost) : undefined,
    });

    return successResponse({ task: updatedTask });
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

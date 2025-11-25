import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api/auth'
import {
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
  successResponse,
  notFoundResponse,
} from '@/lib/api/responses'
import { updateTaskSchema } from '@/lib/validation/task'
import { ZodError } from 'zod'

/**
 * GET /api/tasks/[id]
 * Get single task with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    // Fetch task with all relations
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            category: true,
            modelNumber: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            difficulty: true,
          },
        },
        home: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
      },
    })

    if (!task) {
      return notFoundResponse('Task')
    }

    // Verify user owns the task (via home)
    if (task.home.userId !== session.user.id) {
      return unauthorizedResponse('Not authorized to access this task')
    }

    return successResponse({ task })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return serverErrorResponse(error)
  }
}

/**
 * PUT /api/tasks/[id]
 * Update task details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const body = await request.json()
    const data = updateTaskSchema.parse(body)

    // Fetch existing task and verify ownership
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        home: {
          select: { userId: true },
        },
      },
    })

    if (!existingTask) {
      return notFoundResponse('Task')
    }

    if (existingTask.home.userId !== session.user.id) {
      return unauthorizedResponse('Not authorized to update this task')
    }

    // If changing assetId, verify user owns the new asset
    if (data.assetId !== undefined && data.assetId !== null) {
      const asset = await prisma.asset.findFirst({
        where: {
          id: data.assetId,
          homeId: existingTask.homeId,
        },
      })

      if (!asset) {
        return unauthorizedResponse('Asset not found or unauthorized')
      }
    }

    // Update the task
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.dueDate && { dueDate: data.dueDate }),
        ...(data.priority && { priority: data.priority }),
        ...(data.status && { status: data.status }),
        ...(data.assetId !== undefined && { assetId: data.assetId }),
        ...(data.estimatedCost !== undefined && {
          estimatedCost: data.estimatedCost,
        }),
        ...(data.actualCost !== undefined && { actualCost: data.actualCost }),
        ...(data.costNotes !== undefined && { costNotes: data.costNotes }),
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
    })

    return successResponse({ task })
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

/**
 * DELETE /api/tasks/[id]
 * Delete task (soft delete by setting status to CANCELLED)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    // Fetch task and verify ownership
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        home: {
          select: { userId: true },
        },
      },
    })

    if (!task) {
      return notFoundResponse('Task')
    }

    if (task.home.userId !== session.user.id) {
      return unauthorizedResponse('Not authorized to delete this task')
    }

    // Soft delete by setting status to CANCELLED
    await prisma.task.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    return successResponse({ message: 'Task cancelled successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return serverErrorResponse(error)
  }
}

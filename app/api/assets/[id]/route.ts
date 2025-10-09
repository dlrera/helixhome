import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, verifyAssetOwnership } from '@/lib/api/auth'
import {
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
  successResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api/responses'
import { updateAssetSchema } from '@/lib/validation/asset'
import { logAssetUpdated, logAssetDeleted } from '@/lib/utils/activity-logger'
import { ZodError } from 'zod'

// GET /api/assets/[id] - Get single asset
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const { authorized, reason } = await verifyAssetOwnership(id, session.user.id)

    if (!authorized) {
      if (reason === 'not_found') {
        return notFoundResponse('Asset')
      }
      return forbiddenResponse('You do not own this asset')
    }

    // Fetch with full details
    const assetWithDetails = await prisma.asset.findUnique({
      where: { id },
      include: {
        home: {
          select: {
            id: true,
            name: true,
            address: true,
          }
        },
        _count: {
          select: {
            tasks: true,
            recurringSchedules: true,
          }
        }
      }
    })

    return successResponse(assetWithDetails)

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return serverErrorResponse(error)
  }
}

// PUT /api/assets/[id] - Update asset
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const body = await request.json()

    // Verify ownership
    const { authorized, reason } = await verifyAssetOwnership(id, session.user.id)

    if (!authorized) {
      if (reason === 'not_found') {
        return notFoundResponse('Asset')
      }
      return forbiddenResponse('You do not own this asset')
    }

    // Validate input
    const data = updateAssetSchema.parse(body)

    // Update asset
    const updatedAsset = await prisma.asset.update({
      where: { id },
      data,
      include: {
        home: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    // Log activity
    await logAssetUpdated({
      userId: session.user.id,
      homeId: updatedAsset.homeId,
      assetId: updatedAsset.id,
      assetName: updatedAsset.name,
      changes: Object.keys(data),
    })

    return successResponse(updatedAsset)

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

// DELETE /api/assets/[id] - Delete asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    // Verify ownership
    const { authorized, reason } = await verifyAssetOwnership(id, session.user.id)

    if (!authorized) {
      if (reason === 'not_found') {
        return notFoundResponse('Asset')
      }
      return forbiddenResponse('You do not own this asset')
    }

    // Get asset details before deletion for logging
    const asset = await prisma.asset.findUnique({
      where: { id },
      select: { name: true, homeId: true }
    })

    // Delete asset (cascades to tasks and recurring schedules)
    await prisma.asset.delete({
      where: { id }
    })

    // Log activity
    if (asset) {
      await logAssetDeleted({
        userId: session.user.id,
        homeId: asset.homeId,
        assetId: id,
        assetName: asset.name,
      })
    }

    return new Response(null, { status: 204 })

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return serverErrorResponse(error)
  }
}

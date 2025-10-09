import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api/auth'
import {
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
  successResponse,
  forbiddenResponse,
} from '@/lib/api/responses'
import { createAssetSchema, assetQuerySchema } from '@/lib/validation/asset'
import { logAssetCreated } from '@/lib/utils/activity-logger'
import { ZodError } from 'zod'

// GET /api/assets - List user's assets
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      homeId: searchParams.get('homeId') || undefined,
    }

    const query = assetQuerySchema.parse(queryParams)

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    // Filter by user's homes
    const userHomes = await prisma.home.findMany({
      where: { userId: session.user.id },
      select: { id: true }
    })

    where.homeId = { in: userHomes.map((h) => h.id) }

    // Apply filters
    if (query.homeId) {
      where.homeId = query.homeId
    }

    if (query.category) {
      where.category = query.category
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { modelNumber: { contains: query.search } },
        { serialNumber: { contains: query.search } },
      ]
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        home: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            tasks: true,
            recurringSchedules: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return successResponse({ assets })

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

// POST /api/assets - Create new asset
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    // Validate input
    const data = createAssetSchema.parse(body)

    // Verify user owns the home
    const home = await prisma.home.findUnique({
      where: { id: data.homeId },
      select: { userId: true }
    })

    if (!home || home.userId !== session.user.id) {
      return forbiddenResponse('You do not own this home')
    }

    // Create asset
    const asset = await prisma.asset.create({
      data: {
        homeId: data.homeId,
        name: data.name,
        category: data.category,
        modelNumber: data.modelNumber,
        serialNumber: data.serialNumber,
        purchaseDate: data.purchaseDate,
        warrantyExpiryDate: data.warrantyExpiryDate,
        photoUrl: data.photoUrl,
        metadata: data.metadata,
      },
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
    await logAssetCreated({
      userId: session.user.id,
      homeId: data.homeId,
      assetId: asset.id,
      assetName: asset.name,
      category: asset.category,
    })

    return successResponse(asset, 201)

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

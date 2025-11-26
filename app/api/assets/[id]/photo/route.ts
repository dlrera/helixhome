import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, verifyAssetOwnership } from '@/lib/api/auth'
import {
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api/responses'
import { uploadImage } from '@/lib/utils/storage'

// POST /api/assets/[id]/photo - Upload asset photo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    // Verify ownership
    const { authorized, reason } = await verifyAssetOwnership(
      id,
      session.user.id
    )

    if (!authorized) {
      if (reason === 'not_found') {
        return notFoundResponse('Asset')
      }
      return forbiddenResponse('You do not own this asset')
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('photo') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const result = await uploadImage(file, session.user.id, id)

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Update asset with photo URL
    await prisma.asset.update({
      where: { id },
      data: { photoUrl: result.url },
    })

    return successResponse({ photoUrl: result.url })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    console.error('Photo upload error:', error)
    return serverErrorResponse(error)
  }
}

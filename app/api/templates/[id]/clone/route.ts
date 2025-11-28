import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cloneTemplateSchema } from '@/lib/validation/template'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/templates/[id]/clone
 * Clone a template to create a user-customized version
 *
 * Body:
 * - name: Optional custom name (defaults to "Copy of {original}")
 * - description: Optional custom description
 * - frequency: Optional frequency override
 * - estimatedDurationMinutes: Optional duration override
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Parse and validate request body
    const body = await request.json()
    const validation = cloneTemplateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { name, description, frequency, estimatedDurationMinutes } =
      validation.data

    // Fetch the original template
    const originalTemplate = await prisma.maintenanceTemplate.findUnique({
      where: {
        id,
        isActive: true,
      },
    })

    if (!originalTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Create the cloned template
    const clonedTemplate = await prisma.maintenanceTemplate.create({
      data: {
        name: name || `Copy of ${originalTemplate.name}`,
        description: description || originalTemplate.description,
        category: originalTemplate.category,
        defaultFrequency: frequency || originalTemplate.defaultFrequency,
        estimatedDurationMinutes:
          estimatedDurationMinutes || originalTemplate.estimatedDurationMinutes,
        difficulty: originalTemplate.difficulty,
        instructions: originalTemplate.instructions,
        requiredTools: originalTemplate.requiredTools,
        safetyPrecautions: originalTemplate.safetyPrecautions,
        isSystemTemplate: false,
        isActive: true,
        // Link to original template
        originalTemplateId: originalTemplate.id,
        // User ownership
        userId: session.user.id,
        // Copy tags from original
        tags: originalTemplate.tags,
        season: originalTemplate.season,
        // Note: packId is NOT copied - custom templates are standalone
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        defaultFrequency: true,
        estimatedDurationMinutes: true,
        difficulty: true,
        isSystemTemplate: true,
        originalTemplateId: true,
        tags: true,
        season: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Template cloned successfully',
        template: clonedTemplate,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error cloning template:', error)
    return NextResponse.json(
      { error: 'Failed to clone template' },
      { status: 500 }
    )
  }
}

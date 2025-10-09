import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch template with full details
    const template = await prisma.maintenanceTemplate.findUnique({
      where: {
        id,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        defaultFrequency: true,
        estimatedDurationMinutes: true,
        difficulty: true,
        instructions: true,
        requiredTools: true,
        safetyPrecautions: true,
        isSystemTemplate: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const formattedTemplate = {
      ...template,
      instructions: template.instructions ? JSON.parse(template.instructions as string) : [],
      requiredTools: template.requiredTools ? JSON.parse(template.requiredTools as string) : [],
      safetyPrecautions: template.safetyPrecautions ? JSON.parse(template.safetyPrecautions as string) : []
    }

    return NextResponse.json(formattedTemplate)
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}
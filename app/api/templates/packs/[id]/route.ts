import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/templates/packs/[id]
 * Get a single template pack with all its templates
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch pack with full template list
    const pack = await prisma.templatePack.findUnique({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        tags: true,
        applicableClimateZones: true,
        minHomeAge: true,
        maxHomeAge: true,
        isSystemPack: true,
        createdAt: true,
        templates: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            defaultFrequency: true,
            estimatedDurationMinutes: true,
            difficulty: true,
            tags: true,
            season: true,
          },
          orderBy: [{ category: 'asc' }, { name: 'asc' }],
        },
        _count: {
          select: {
            templates: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    })

    if (!pack) {
      return NextResponse.json(
        { error: 'Template pack not found' },
        { status: 404 }
      )
    }

    // Transform response
    const response = {
      id: pack.id,
      name: pack.name,
      description: pack.description,
      category: pack.category,
      tags: pack.tags,
      applicableClimateZones: pack.applicableClimateZones,
      minHomeAge: pack.minHomeAge,
      maxHomeAge: pack.maxHomeAge,
      isSystemPack: pack.isSystemPack,
      createdAt: pack.createdAt,
      templateCount: pack._count.templates,
      templates: pack.templates,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching template pack:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template pack' },
      { status: 500 }
    )
  }
}

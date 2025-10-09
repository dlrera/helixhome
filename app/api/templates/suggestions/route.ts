import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get assetId from query
    const searchParams = request.nextUrl.searchParams
    const assetId = searchParams.get('assetId')

    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      )
    }

    // Fetch asset to get category and verify ownership
    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        home: {
          userId: session.user.id
        }
      },
      include: {
        recurringSchedules: {
          where: {
            isActive: true
          },
          select: {
            templateId: true
          }
        }
      }
    })

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found or unauthorized' },
        { status: 404 }
      )
    }

    // Get IDs of already applied templates
    const appliedTemplateIds = asset.recurringSchedules.map(s => s.templateId)

    // Fetch templates matching the asset category, excluding already applied ones
    const templates = await prisma.maintenanceTemplate.findMany({
      where: {
        category: asset.category,
        isActive: true,
        id: {
          notIn: appliedTemplateIds
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        defaultFrequency: true,
        estimatedDurationMinutes: true,
        difficulty: true,
        isSystemTemplate: true
      },
      orderBy: [
        { difficulty: 'asc' },
        { defaultFrequency: 'asc' },
        { name: 'asc' }
      ],
      take: 5
    })

    // If we don't have enough templates from the same category, get some general ones
    if (templates.length < 5) {
      const additionalTemplates = await prisma.maintenanceTemplate.findMany({
        where: {
          category: {
            in: ['OTHER', 'ELECTRICAL'] // General categories
          },
          isActive: true,
          id: {
            notIn: [...appliedTemplateIds, ...templates.map(t => t.id)]
          }
        },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          defaultFrequency: true,
          estimatedDurationMinutes: true,
          difficulty: true,
          isSystemTemplate: true
        },
        orderBy: [
          { difficulty: 'asc' },
          { defaultFrequency: 'asc' }
        ],
        take: 5 - templates.length
      })

      templates.push(...additionalTemplates)
    }

    return NextResponse.json({
      asset: {
        id: asset.id,
        name: asset.name,
        category: asset.category
      },
      suggestions: templates,
      appliedCount: appliedTemplateIds.length
    })
  } catch (error) {
    console.error('Error fetching template suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}
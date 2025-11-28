import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AssetCategory } from '@prisma/client'

/**
 * GET /api/templates/packs
 * List all template packs with optional filtering
 *
 * Query params:
 * - category: Filter by AssetCategory
 * - includeSystem: Include system packs (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') as AssetCategory | null
    const includeSystem = searchParams.get('includeSystem') !== 'false' // Default true

    // Build filter conditions
    const where: {
      isActive: boolean
      isSystemPack?: boolean
      OR?: Array<{ category: AssetCategory | null }>
    } = {
      isActive: true,
    }

    // Filter by system packs
    if (includeSystem) {
      where.isSystemPack = true
    }

    // Filter by category (packs can be category-specific or general)
    if (category) {
      where.OR = [
        { category: category },
        { category: null }, // Include general packs that apply to all categories
      ]
    }

    // Fetch packs with template count
    const packs = await prisma.templatePack.findMany({
      where,
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
      orderBy: [{ name: 'asc' }],
    })

    // Transform response to match API spec
    const response = packs.map((pack) => ({
      id: pack.id,
      name: pack.name,
      description: pack.description,
      category: pack.category,
      tags: pack.tags,
      applicableClimateZones: pack.applicableClimateZones,
      minHomeAge: pack.minHomeAge,
      maxHomeAge: pack.maxHomeAge,
      isSystemPack: pack.isSystemPack,
      templateCount: pack._count.templates,
    }))

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching template packs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template packs' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AssetCategory, Difficulty } from '@prisma/client'
import { templateCache } from '@/lib/utils/cache'

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
    const difficulty = searchParams.get('difficulty') as Difficulty | null
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Create cache key based on parameters
    const cacheKey = `templates:${category || 'all'}:${difficulty || 'all'}:${search || 'none'}:${page}:${limit}`

    // Build filter conditions
    const where: any = {
      isActive: true
    }

    if (category) {
      where.category = category
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }

    // Try to get from cache or fetch from database
    const result = await templateCache.getTemplates(
      cacheKey,
      async () => {
        // Fetch templates with pagination
        const [templates, total] = await Promise.all([
          prisma.maintenanceTemplate.findMany({
            where,
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
              { category: 'asc' },
              { name: 'asc' }
            ],
            skip,
            take: limit
          }),
          prisma.maintenanceTemplate.count({ where })
        ])

        return {
          templates,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      },
      10 * 60 * 1000 // Cache for 10 minutes
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}
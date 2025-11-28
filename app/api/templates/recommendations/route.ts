import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RecommendationResult {
  reason: string
  score: number
  pack: {
    id: string
    name: string
    description: string
    category: string | null
    tags: string[]
    templateCount: number
  }
  templates: Array<{
    id: string
    name: string
    description: string
    category: string
    defaultFrequency: string
    estimatedDurationMinutes: number
    difficulty: string
  }>
}

/**
 * GET /api/templates/recommendations
 * Get personalized template pack recommendations based on user's home profile and assets
 *
 * Scoring Logic:
 * - Climate Zone Match: +30 points if pack's applicableClimateZones includes user's climate
 * - Home Age Match: +30 points if home age falls within pack's min/maxHomeAge range
 * - Asset Category Match: +20 points per matching asset category
 * - Has Templates: +10 points base score if pack has active templates
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
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : 5 // Default to top 5 recommendations

    // Fetch user's home profile
    const home = await prisma.home.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        climateZone: true,
        yearBuilt: true,
        assets: {
          select: {
            category: true,
          },
        },
      },
    })

    if (!home) {
      // Return empty recommendations if user has no home
      return NextResponse.json([])
    }

    // Calculate home age
    const currentYear = new Date().getFullYear()
    const homeAge = home.yearBuilt ? currentYear - home.yearBuilt : null

    // Get unique asset categories the user owns
    const userAssetCategories = [...new Set(home.assets.map((a) => a.category))]

    // Fetch all active system packs with their templates
    const packs = await prisma.templatePack.findMany({
      where: {
        isActive: true,
        isSystemPack: true,
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
          },
          take: 5, // Limit templates per pack in response
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

    // Score and rank packs
    const recommendations: RecommendationResult[] = packs
      .map((pack) => {
        let score = 0
        const reasons: string[] = []

        // Base score for having templates
        if (pack._count.templates > 0) {
          score += 10
        }

        // Climate Zone Match (+30)
        if (home.climateZone && pack.applicableClimateZones.length > 0) {
          const climateMatch = pack.applicableClimateZones.some(
            (zone) => zone.toLowerCase() === home.climateZone?.toLowerCase()
          )
          if (climateMatch) {
            score += 30
            reasons.push(`Perfect for ${home.climateZone} climate`)
          }
        } else if (pack.applicableClimateZones.length === 0) {
          // Packs without climate restrictions are generally applicable
          score += 10
        }

        // Home Age Match (+30)
        if (homeAge !== null) {
          const withinMinAge =
            pack.minHomeAge === null || homeAge >= pack.minHomeAge
          const withinMaxAge =
            pack.maxHomeAge === null || homeAge <= pack.maxHomeAge

          if (withinMinAge && withinMaxAge) {
            if (pack.minHomeAge !== null || pack.maxHomeAge !== null) {
              score += 30
              if (pack.minHomeAge && pack.minHomeAge > 15) {
                reasons.push(`Recommended for your ${homeAge}-year-old home`)
              } else if (pack.maxHomeAge && pack.maxHomeAge < 10) {
                reasons.push('Great for newer homes')
              }
            }
          }
        } else if (pack.minHomeAge === null && pack.maxHomeAge === null) {
          // Pack has no age restrictions - slightly boost
          score += 5
        }

        // Asset Category Match (+20 per match)
        if (pack.category) {
          // Pack is category-specific
          if (userAssetCategories.includes(pack.category)) {
            score += 20
            const categoryLabel =
              pack.category.charAt(0) + pack.category.slice(1).toLowerCase()
            reasons.push(`You have ${categoryLabel} assets`)
          }
        } else {
          // General pack - check template categories
          const packCategories = [
            ...new Set(pack.templates.map((t) => t.category)),
          ]
          const matchingCategories = packCategories.filter((c) =>
            userAssetCategories.includes(c)
          )

          if (matchingCategories.length > 0) {
            score += matchingCategories.length * 20
            if (matchingCategories.length === 1) {
              const cat =
                matchingCategories[0].charAt(0) +
                matchingCategories[0].slice(1).toLowerCase()
              reasons.push(`Includes ${cat} maintenance`)
            } else {
              reasons.push(
                `Covers ${matchingCategories.length} of your asset types`
              )
            }
          }
        }

        // Seasonal relevance (bonus for current season)
        const currentMonth = new Date().getMonth()
        const currentSeason = getCurrentSeason(currentMonth)
        if (
          pack.tags.some(
            (tag) => tag.toLowerCase() === currentSeason.toLowerCase()
          )
        ) {
          score += 15
          reasons.push(`${currentSeason} season essentials`)
        }

        // Compile final reason
        const reason =
          reasons.length > 0
            ? reasons[0] // Use the most relevant reason
            : 'Recommended maintenance pack'

        return {
          reason,
          score,
          pack: {
            id: pack.id,
            name: pack.name,
            description: pack.description,
            category: pack.category,
            tags: pack.tags,
            templateCount: pack._count.templates,
          },
          templates: pack.templates,
        }
      })
      .filter((r) => r.score > 0 && r.pack.templateCount > 0) // Only recommend packs with templates
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, limit)

    // Remove scores from response (internal use only)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = recommendations.map(({ score, ...rest }) => rest)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

/**
 * Get current season based on month (Northern Hemisphere)
 */
function getCurrentSeason(month: number): string {
  if (month >= 2 && month <= 4) return 'Spring'
  if (month >= 5 && month <= 7) return 'Summer'
  if (month >= 8 && month <= 10) return 'Fall'
  return 'Winter'
}

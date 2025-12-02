import { AssetCategory, Difficulty, Frequency } from '@prisma/client'

/**
 * Template interface - represents a maintenance template
 */
export interface Template {
  id: string
  name: string
  description: string
  category: AssetCategory
  defaultFrequency: Frequency
  estimatedDurationMinutes: number
  difficulty: Difficulty
  isSystemTemplate: boolean
  isActive: boolean
  tags: string[]
  season: string | null
  packId: string | null
  // UI state
  isApplied?: boolean
}

/**
 * Template with full details including instructions and tools
 */
export interface TemplateDetails extends Template {
  instructions: string[] | null
  requiredTools: string[] | null
  safetyPrecautions: string[] | null
  originalTemplateId: string | null
  userId: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Template Pack interface - represents a group of related templates
 */
export interface TemplatePack {
  id: string
  name: string
  description: string
  category: AssetCategory | null
  tags: string[]
  applicableClimateZones: string[]
  minHomeAge: number | null
  maxHomeAge: number | null
  isSystemPack: boolean
  templateCount: number
}

/**
 * Template Pack with full template list
 */
export interface TemplatePackDetails extends TemplatePack {
  createdAt: string
  templates: PackTemplate[]
}

/**
 * Template as returned within a pack (subset of fields)
 */
export interface PackTemplate {
  id: string
  name: string
  description: string
  category: AssetCategory
  defaultFrequency: Frequency
  estimatedDurationMinutes: number
  difficulty: Difficulty
  tags: string[]
  season: string | null
}

/**
 * Individual template recommendation (legacy - for individual template recommendations)
 */
export interface TemplateRecommendation {
  id: string
  name: string
  description: string
  category: AssetCategory
  defaultFrequency: Frequency
  estimatedDurationMinutes: number
  difficulty: Difficulty
  score: number
  matchReasons: string[]
}

/**
 * Pack recommendation response from the API
 */
export interface PackRecommendation {
  reason: string
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
 * View mode for template browser
 */
export type TemplateViewMode = 'grid' | 'list'

/**
 * Browse mode for template browser (templates vs packs)
 */
export type BrowseMode = 'templates' | 'packs'

/**
 * Category icons type mapping
 */
export type CategoryIconsMap = Record<
  AssetCategory,
  React.ComponentType<{ className?: string }>
>

/**
 * Difficulty colors type mapping
 */
export type DifficultyColorsMap = Record<Difficulty, string>

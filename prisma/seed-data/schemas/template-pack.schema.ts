import { z } from 'zod'

// Enum validators matching Prisma schema exactly
export const AssetCategoryEnum = z.enum([
  'APPLIANCE',
  'HVAC',
  'PLUMBING',
  'ELECTRICAL',
  'STRUCTURAL',
  'OUTDOOR',
  'OTHER',
])

export const FrequencyEnum = z.enum([
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'SEMIANNUAL',
  'ANNUAL',
  'CUSTOM',
])

export const DifficultyEnum = z.enum([
  'EASY',
  'MODERATE',
  'HARD',
  'PROFESSIONAL',
])

// Template within a pack
export const TemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  category: AssetCategoryEnum,
  defaultFrequency: FrequencyEnum,
  estimatedDurationMinutes: z.number().int().positive().max(480),
  difficulty: DifficultyEnum,
  tags: z.array(z.string()).default([]),
  season: z.string().nullable().default(null),
  instructions: z.array(z.string()).default([]),
  requiredTools: z.array(z.string()).default([]),
  safetyPrecautions: z.array(z.string()).default([]),
})

// Full pack schema
export const TemplatePackSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'ID must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  category: AssetCategoryEnum.nullable().default(null),
  tags: z.array(z.string()).default([]),
  applicableClimateZones: z.array(z.string()).default([]),
  minHomeAge: z.number().int().positive().nullable().default(null),
  maxHomeAge: z.number().int().positive().nullable().default(null),
  isPseudoPack: z.boolean().optional().default(false), // For standalone templates (no pack record)
  templates: z.array(TemplateSchema).min(1),
})

// Manifest schema for _index.json
export const ManifestSchema = z.object({
  version: z.string(),
  packs: z.array(
    z.object({
      file: z.string(),
      priority: z.number().int().nonnegative(),
    })
  ),
})

// Inferred types for use in content-loader
export type TemplateJSON = z.infer<typeof TemplateSchema>
export type TemplatePackJSON = z.infer<typeof TemplatePackSchema>
export type ManifestJSON = z.infer<typeof ManifestSchema>

import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  TemplatePackSchema,
  ManifestSchema,
  type TemplatePackJSON,
} from './schemas/template-pack.schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const LIBRARY_DIR = path.join(__dirname, 'library')

/**
 * Load template content from JSON files in the library directory.
 * This is the main entry point for JSON-based content seeding.
 */
export async function loadContentFromJSON(prisma: PrismaClient): Promise<void> {
  console.log('📦 Loading template content from JSON files...')

  // 1. Load and validate manifest
  const manifestPath = path.join(LIBRARY_DIR, '_index.json')
  let manifestRaw: string

  try {
    manifestRaw = await fs.readFile(manifestPath, 'utf-8')
  } catch {
    console.log(
      '⚠️  No _index.json manifest found. Skipping JSON content loading.'
    )
    return
  }

  const manifestResult = ManifestSchema.safeParse(JSON.parse(manifestRaw))
  if (!manifestResult.success) {
    console.error(
      '❌ Invalid manifest _index.json:',
      manifestResult.error.format()
    )
    throw new Error('Manifest validation failed')
  }

  const manifest = manifestResult.data

  if (manifest.packs.length === 0) {
    console.log('📭 Manifest is empty. No packs to load.')
    return
  }

  // 2. Sort packs by priority (lower = earlier)
  const sortedPacks = [...manifest.packs].sort(
    (a, b) => a.priority - b.priority
  )

  // 3. Track all template IDs for collision detection
  const seenTemplateIds = new Set<string>()

  // 4. Process each pack
  for (const packRef of sortedPacks) {
    const packPath = path.join(LIBRARY_DIR, packRef.file)

    let packRaw: string
    try {
      packRaw = await fs.readFile(packPath, 'utf-8')
    } catch (error) {
      console.error(`❌ Failed to read pack file: ${packRef.file}`)
      throw error
    }

    const parsed = JSON.parse(packRaw)
    const packs = Array.isArray(parsed) ? parsed : [parsed]

    for (const packData of packs) {
      const packResult = TemplatePackSchema.safeParse(packData)
      if (!packResult.success) {
        console.error(
          `❌ Invalid pack in ${packRef.file}:`,
          packResult.error.format()
        )
        throw new Error(`Schema validation failed for ${packRef.file}`)
      }
      await upsertPack(prisma, packResult.data, seenTemplateIds)
    }
  }

  console.log(`✅ Loaded content from ${sortedPacks.length} file(s)`)
}

/**
 * Upsert a single template pack and all its templates.
 */
async function upsertPack(
  prisma: PrismaClient,
  pack: TemplatePackJSON,
  seenTemplateIds: Set<string>
): Promise<void> {
  const isPseudoPack = pack.isPseudoPack ?? false

  // For pseudo-packs (standalone templates), don't create a pack record
  if (!isPseudoPack) {
    await prisma.templatePack.upsert({
      where: { id: pack.id },
      update: {
        name: pack.name,
        description: pack.description,
        category: pack.category,
        tags: pack.tags,
        applicableClimateZones: pack.applicableClimateZones,
        minHomeAge: pack.minHomeAge,
        maxHomeAge: pack.maxHomeAge,
        isSystemPack: true,
        isActive: true,
      },
      create: {
        id: pack.id,
        name: pack.name,
        description: pack.description,
        category: pack.category,
        tags: pack.tags,
        applicableClimateZones: pack.applicableClimateZones,
        minHomeAge: pack.minHomeAge,
        maxHomeAge: pack.maxHomeAge,
        isSystemPack: true,
        isActive: true,
      },
    })
  }

  // Upsert templates
  for (const template of pack.templates) {
    const templateId = generateTemplateId(pack.id, template.name, isPseudoPack)

    // Check for ID collisions
    if (seenTemplateIds.has(templateId)) {
      throw new Error(`Duplicate template ID detected: ${templateId}`)
    }
    seenTemplateIds.add(templateId)

    await prisma.maintenanceTemplate.upsert({
      where: { id: templateId },
      update: {
        name: template.name,
        description: template.description,
        category: template.category,
        defaultFrequency: template.defaultFrequency,
        estimatedDurationMinutes: template.estimatedDurationMinutes,
        difficulty: template.difficulty,
        tags: template.tags,
        season: template.season,
        instructions: JSON.stringify(template.instructions),
        requiredTools: JSON.stringify(template.requiredTools),
        safetyPrecautions: JSON.stringify(template.safetyPrecautions),
        packId: isPseudoPack ? null : pack.id,
        isSystemTemplate: true,
        isActive: true,
      },
      create: {
        id: templateId,
        name: template.name,
        description: template.description,
        category: template.category,
        defaultFrequency: template.defaultFrequency,
        estimatedDurationMinutes: template.estimatedDurationMinutes,
        difficulty: template.difficulty,
        tags: template.tags,
        season: template.season,
        instructions: JSON.stringify(template.instructions),
        requiredTools: JSON.stringify(template.requiredTools),
        safetyPrecautions: JSON.stringify(template.safetyPrecautions),
        packId: isPseudoPack ? null : pack.id,
        isSystemTemplate: true,
        isActive: true,
      },
    })
  }

  console.log(`  📄 ${pack.name}: ${pack.templates.length} template(s)`)
}

/**
 * Generate a deterministic template ID.
 * CRITICAL: This must match the existing ID generation in TypeScript seed files
 * to avoid breaking existing task/schedule references.
 */
function generateTemplateId(
  packId: string,
  templateName: string,
  isPseudoPack: boolean
): string {
  const slug = templateName.toLowerCase().replace(/\s+/g, '-')
  return isPseudoPack ? `standalone-${slug}` : `${packId}-${slug}`
}

// Run when invoked directly via `tsx prisma/seed-data/content-loader.ts`
// Only run standalone if this file is the actual entry point (not imported)
const scriptPath = process.argv[1]
const isMainModule =
  scriptPath &&
  (scriptPath.endsWith('content-loader.ts') ||
    scriptPath.endsWith('content-loader.js'))

if (isMainModule) {
  const prisma = new PrismaClient()

  loadContentFromJSON(prisma)
    .then(() => {
      console.log('🎉 Content loading complete')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Content loading failed:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

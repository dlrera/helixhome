# JSON-Based Content Migration Plan

## Executive Summary

Migrate from hardcoded TypeScript seed files to a JSON-based content definition system for template packs. This enables easier content additions by non-developers or AI agents without modifying code.

---

## Current State Analysis

### Existing Files

| File                                    | Purpose                         | Content                                           |
| --------------------------------------- | ------------------------------- | ------------------------------------------------- |
| `prisma/seed.ts`                        | Orchestrator                    | Calls seeders for users, homes, assets, templates |
| `prisma/seeds/maintenance-templates.ts` | 20 standalone templates         | TypeScript array export                           |
| `prisma/seed-data/template-packs.ts`    | 6 template packs (23 templates) | TypeScript interfaces                             |

### Database Models

- **MaintenanceTemplate**: 18 fields + relations
- **TemplatePack**: 12 fields + relations
- **Enums**: `AssetCategory`, `Frequency`, `Difficulty`

### ID Generation Strategy (Critical)

```
Standalone: standalone-${name.toLowerCase().replace(/\s+/g, '-')}
Pack templates: ${pack.id}-${template.name.toLowerCase().replace(/\s+/g, '-')}
```

---

## Proposed Architecture

### Directory Structure

```
prisma/
├── seed.ts                          # Main orchestrator (modified)
├── seed-data/
│   ├── content-loader.ts            # [NEW] JSON loader utility
│   ├── schemas/
│   │   └── template-pack.schema.ts  # [NEW] Zod validation schema
│   ├── library/
│   │   ├── _index.json              # [NEW] Manifest of all packs
│   │   ├── standalone-templates.json # [NEW] Converted from maintenance-templates.ts
│   │   ├── seasonal-essentials.json  # [NEW] Converted from template-packs.ts
│   │   ├── safety-first.json
│   │   ├── appliance-care.json
│   │   ├── older-home-care.json
│   │   ├── cold-climate.json
│   │   └── humid-climate.json
│   └── template-packs.ts            # [DEPRECATED] Keep for rollback
├── seeds/
│   └── maintenance-templates.ts     # [DEPRECATED] Keep for rollback
```

---

## JSON Schema Definition

### Template Pack Schema (`*.json`)

```json
{
  "$schema": "./template-pack.schema.json",
  "id": "pack-seasonal-essentials",
  "name": "Seasonal Essentials",
  "description": "Core maintenance tasks for changing seasons",
  "category": null,
  "tags": ["Seasonal", "General", "Preventive"],
  "applicableClimateZones": ["Humid", "Cold", "Temperate", "Arid"],
  "minHomeAge": null,
  "maxHomeAge": null,
  "templates": [
    {
      "name": "Gutter Cleaning",
      "description": "Clear gutters and downspouts of debris...",
      "category": "OUTDOOR",
      "defaultFrequency": "SEMIANNUAL",
      "estimatedDurationMinutes": 120,
      "difficulty": "MODERATE",
      "tags": ["Fall", "Spring", "Water Damage Prevention"],
      "season": "Fall",
      "instructions": [
        "Set up ladder safely on level ground",
        "Remove large debris by hand",
        "Flush gutters with garden hose"
      ],
      "requiredTools": ["Ladder", "Work gloves", "Garden hose", "Gutter scoop"],
      "safetyPrecautions": [
        "Use ladder stabilizer",
        "Work with a spotter",
        "Avoid power lines"
      ]
    }
  ]
}
```

### Standalone Templates Schema

```json
{
  "$schema": "./template-pack.schema.json",
  "id": "standalone",
  "name": "Standalone Templates",
  "description": "Individual maintenance templates not part of a pack",
  "isPseudoPack": true,
  "templates": [
    {
      "name": "Change HVAC Filter",
      "description": "Replace air filter...",
      "category": "HVAC",
      "defaultFrequency": "MONTHLY",
      "estimatedDurationMinutes": 10,
      "difficulty": "EASY",
      "tags": [],
      "season": null,
      "instructions": ["..."],
      "requiredTools": ["..."],
      "safetyPrecautions": ["..."]
    }
  ]
}
```

### Manifest (`_index.json`)

```json
{
  "version": "1.0.0",
  "packs": [
    { "file": "standalone-templates.json", "priority": 0 },
    { "file": "seasonal-essentials.json", "priority": 1 },
    { "file": "safety-first.json", "priority": 2 },
    { "file": "appliance-care.json", "priority": 3 },
    { "file": "older-home-care.json", "priority": 4 },
    { "file": "cold-climate.json", "priority": 5 },
    { "file": "humid-climate.json", "priority": 6 }
  ]
}
```

---

## Implementation Components

### 1. Zod Validation Schema (`schemas/template-pack.schema.ts`)

```typescript
import { z } from 'zod'

// Enum validators matching Prisma
const AssetCategoryEnum = z.enum([
  'APPLIANCE',
  'HVAC',
  'PLUMBING',
  'ELECTRICAL',
  'STRUCTURAL',
  'OUTDOOR',
  'OTHER',
])

const FrequencyEnum = z.enum([
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'SEMIANNUAL',
  'ANNUAL',
  'CUSTOM',
])

const DifficultyEnum = z.enum(['EASY', 'MODERATE', 'HARD', 'PROFESSIONAL'])

// Template within a pack
const TemplateSchema = z.object({
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
  isPseudoPack: z.boolean().optional().default(false), // For standalone templates
  templates: z.array(TemplateSchema).min(1),
})

// Manifest schema
export const ManifestSchema = z.object({
  version: z.string(),
  packs: z.array(
    z.object({
      file: z.string(),
      priority: z.number().int().nonnegative(),
    })
  ),
})

export type TemplatePackJSON = z.infer<typeof TemplatePackSchema>
export type TemplateJSON = z.infer<typeof TemplateSchema>
```

### 2. Content Loader (`content-loader.ts`)

```typescript
import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import {
  TemplatePackSchema,
  ManifestSchema,
  type TemplatePackJSON,
} from './schemas/template-pack.schema'

const LIBRARY_DIR = path.join(__dirname, 'library')

export async function loadContentFromJSON(prisma: PrismaClient): Promise<void> {
  console.log('📦 Loading template content from JSON files...')

  // 1. Load manifest
  const manifestPath = path.join(LIBRARY_DIR, '_index.json')
  const manifestRaw = await fs.readFile(manifestPath, 'utf-8')
  const manifest = ManifestSchema.parse(JSON.parse(manifestRaw))

  // 2. Sort packs by priority
  const sortedPacks = [...manifest.packs].sort(
    (a, b) => a.priority - b.priority
  )

  // 3. Process each pack
  for (const packRef of sortedPacks) {
    const packPath = path.join(LIBRARY_DIR, packRef.file)
    const packRaw = await fs.readFile(packPath, 'utf-8')
    const packData = TemplatePackSchema.parse(JSON.parse(packRaw))

    await upsertPack(prisma, packData)
  }

  console.log(`✅ Loaded ${sortedPacks.length} template packs from JSON`)
}

async function upsertPack(
  prisma: PrismaClient,
  pack: TemplatePackJSON
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

  console.log(`  📄 ${pack.name}: ${pack.templates.length} templates`)
}

function generateTemplateId(
  packId: string,
  templateName: string,
  isPseudoPack: boolean
): string {
  const slug = templateName.toLowerCase().replace(/\s+/g, '-')
  return isPseudoPack ? `standalone-${slug}` : `${packId}-${slug}`
}
```

### 3. Modified Seed Orchestrator (`seed.ts`)

```typescript
import { loadContentFromJSON } from './seed-data/content-loader'

async function main() {
  // ... existing user/home/asset seeding ...

  // Replace TypeScript template seeding with JSON loader
  await loadContentFromJSON(prisma)

  // ... rest of seeding ...
}
```

---

## Migration Phases

### Phase 1: Foundation (Non-Breaking)

**Goal**: Create new infrastructure without breaking existing functionality

1. Create `prisma/seed-data/schemas/template-pack.schema.ts`
2. Create `prisma/seed-data/content-loader.ts`
3. Create `prisma/seed-data/library/_index.json` (empty manifest)
4. Add npm script: `"db:seed:json": "tsx prisma/seed-data/content-loader.ts"`

**Testing**: Run new loader independently, verify no conflicts

### Phase 2: Content Conversion

**Goal**: Convert existing TypeScript content to JSON

1. Convert `maintenance-templates.ts` → `library/standalone-templates.json`
2. Convert `template-packs.ts` → 6 individual JSON files:
   - `seasonal-essentials.json`
   - `safety-first.json`
   - `appliance-care.json`
   - `older-home-care.json`
   - `cold-climate.json`
   - `humid-climate.json`
3. Update `_index.json` manifest with all files

**Testing**:

- Validate all JSON files against schema
- Run JSON loader, compare database state to TypeScript loader
- Ensure ID generation matches exactly

### Phase 3: Integration

**Goal**: Switch seed.ts to use JSON loader

1. Modify `seed.ts` to import and call `loadContentFromJSON`
2. Comment out (don't delete) TypeScript template seeding
3. Run full seed, verify all data correct

**Testing**:

- `pnpm db:seed` produces identical results
- API routes return same data
- Template application still works

### Phase 4: Cleanup (Optional)

**Goal**: Remove deprecated TypeScript files

1. Delete `prisma/seeds/maintenance-templates.ts`
2. Delete `prisma/seed-data/template-packs.ts`
3. Update any imports in seed.ts

**Rollback Plan**: Git revert to Phase 3 commit

---

## Validation Strategy

### Schema Validation (Build Time)

```typescript
// In content-loader.ts
const result = TemplatePackSchema.safeParse(packData)
if (!result.success) {
  console.error(`❌ Invalid pack ${packRef.file}:`, result.error.format())
  throw new Error(`Schema validation failed for ${packRef.file}`)
}
```

### ID Collision Detection

```typescript
const seenIds = new Set<string>()
for (const template of pack.templates) {
  const id = generateTemplateId(pack.id, template.name, isPseudoPack)
  if (seenIds.has(id)) {
    throw new Error(`Duplicate template ID: ${id}`)
  }
  seenIds.add(id)
}
```

### Enum Validation

Zod schema already validates enums match Prisma definitions

---

## Future Extensibility

### Adding New Content

1. Create new JSON file in `library/`
2. Add entry to `_index.json` manifest
3. Run `pnpm db:seed`

No code changes required!

### AI Agent Integration

```typescript
// Example: AI generates new pack
const newPack = {
  id: 'ai-generated-pool-care',
  name: 'Pool & Spa Care',
  description: 'Generated maintenance templates for pools',
  templates: [
    /* ... */
  ],
}

// Validate before saving
const result = TemplatePackSchema.safeParse(newPack)
if (result.success) {
  await fs.writeFile(
    path.join(LIBRARY_DIR, 'pool-care.json'),
    JSON.stringify(newPack, null, 2)
  )
}
```

### CLI Tool (Future)

```bash
# Validate all JSON files
pnpm content:validate

# Add single pack
pnpm content:add ./new-pack.json

# Export TypeScript to JSON (one-time migration)
pnpm content:migrate
```

---

## Risk Assessment

| Risk                              | Likelihood | Impact | Mitigation                           |
| --------------------------------- | ---------- | ------ | ------------------------------------ |
| ID mismatch breaks existing tasks | Medium     | High   | Verify ID generation matches exactly |
| JSON parsing errors in production | Low        | Medium | Schema validation at load time       |
| Missing fields cause null errors  | Low        | Medium | Zod defaults for optional fields     |
| Rollback needed                   | Low        | Low    | Keep deprecated TS files in Phase 3  |

---

## File Changes Summary

| File                                                 | Action    | Description                        |
| ---------------------------------------------------- | --------- | ---------------------------------- |
| `prisma/seed-data/schemas/template-pack.schema.ts`   | CREATE    | Zod validation schemas             |
| `prisma/seed-data/content-loader.ts`                 | CREATE    | JSON loading utility               |
| `prisma/seed-data/library/_index.json`               | CREATE    | Pack manifest                      |
| `prisma/seed-data/library/standalone-templates.json` | CREATE    | Converted from TS                  |
| `prisma/seed-data/library/*.json`                    | CREATE    | 6 pack files                       |
| `prisma/seed.ts`                                     | MODIFY    | Replace TS loader with JSON loader |
| `prisma/seeds/maintenance-templates.ts`              | DEPRECATE | Keep for rollback                  |
| `prisma/seed-data/template-packs.ts`                 | DEPRECATE | Keep for rollback                  |

---

## Acceptance Criteria

- [ ] All JSON files validate against Zod schema
- [ ] `pnpm db:seed` produces identical database state
- [ ] Template IDs match existing (no broken references)
- [ ] API routes return correct data
- [ ] Template application to assets works
- [ ] Recommendations endpoint works with new data
- [ ] No TypeScript compilation errors
- [ ] Rollback tested and documented

---

## Estimated Effort

| Phase   | Tasks | Complexity                            |
| ------- | ----- | ------------------------------------- |
| Phase 1 | 4     | Low                                   |
| Phase 2 | 7     | Medium (mostly mechanical conversion) |
| Phase 3 | 3     | Low                                   |
| Phase 4 | 3     | Low                                   |

---

## Next Steps

1. **Approve this plan** or request modifications
2. **Phase 1**: Create schema and loader infrastructure
3. **Phase 2**: Convert content files
4. **Phase 3**: Integrate and test
5. **Phase 4**: Cleanup (optional, can defer)

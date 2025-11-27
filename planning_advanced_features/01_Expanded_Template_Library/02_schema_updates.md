# Schema Updates: Expanded Template Library

## Overview

We need to introduce `TemplatePack` and enhance `MaintenanceTemplate` to support the new features.

## Proposed Changes

### 1. New Model: `TemplatePack`

Groups templates together. A template can belong to one pack (strict hierarchy) or we could use a many-to-many if needed. For simplicity, let's start with a template belonging to one primary pack, or use Tags for loose grouping. The requirements mention "Packs" as a distinct entity users can enable/disable.

```prisma
model TemplatePack {
  id          String   @id @default(cuid())
  name        String
  description String
  category    AssetCategory? // Optional: if the whole pack is category-specific
  tags        String[] // e.g., ["Seasonal", "Safety", "Old Home"]

  // Rules for recommendations
  applicableClimateZones String[] // e.g., ["Humid", "Cold"]
  minHomeAge             Int?     // e.g., 20 years
  maxHomeAge             Int?

  isSystemPack Boolean @default(true)
  isActive     Boolean @default(true)

  templates MaintenanceTemplate[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. Update Model: `MaintenanceTemplate`

Add fields for linking to packs and better metadata.

```prisma
model MaintenanceTemplate {
  // ... existing fields ...

  packId String?
  pack   TemplatePack? @relation(fields: [packId], references: [id])

  // Enhanced Metadata
  tags String[] // e.g., ["Filter", "Inspection"]

  // Frequency Enhancements (if Enum is not enough)
  // We might keep Frequency Enum but add "season" field if Frequency is SEASONAL
  season String? // "Spring", "Fall", "Winter", "Summer"

  // Customization Tracking
  originalTemplateId String? // If this is a clone
  originalTemplate   MaintenanceTemplate? @relation("TemplateClones", fields: [originalTemplateId], references: [id])
  clones             MaintenanceTemplate[] @relation("TemplateClones")

  // ... existing fields ...
}
```

### 3. User Preferences for Packs (Optional but recommended)

Users might want to "subscribe" to packs or hide them.

```prisma
model UserTemplatePackPreference {
  id        String @id @default(cuid())
  userId    String
  packId    String
  isEnabled Boolean @default(true) // If false, don't show recommendations from this pack

  user User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  pack TemplatePack @relation(fields: [packId], references: [id], onDelete: Cascade)

  @@unique([userId, packId])
}
```

## Migration Steps

1.  Create `TemplatePack` model.
2.  Add `packId` to `MaintenanceTemplate`.
3.  Run `npx prisma migrate dev --name add_template_packs`.
4.  Seed default packs.

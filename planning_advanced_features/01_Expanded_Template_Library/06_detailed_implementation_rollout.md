# Detailed Implementation Rollout: Expanded Template Library

This document provides a step-by-step execution guide for implementing the Expanded Template Library. Each step is designed to be atomic and verifiable.

## Phase 1: Database Schema & Models ✅ COMPLETE

### Step 1.1: Define `TemplatePack` Model

- [x] **Cross-Reference**: Open `prisma/schema.prisma` and review existing `AssetCategory` enum to ensure consistency.
- [x] Add the `TemplatePack` model (lines 344-366):
  - `id` (String, CUID, PK)
  - `name` (String)
  - `description` (String)
  - `category` (AssetCategory, Optional)
  - `tags` (String array)
  - `applicableClimateZones` (String array)
  - `minHomeAge` (Int, Optional)
  - `maxHomeAge` (Int, Optional)
  - `isSystemPack` (Boolean, default true)
  - `isActive` (Boolean, default true)
  - `createdAt`, `updatedAt`
- [x] Add relation: `templates MaintenanceTemplate[]`

### Step 1.2: Update `Home` Model (Gap Fix)

- [x] **Cross-Reference**: Open `prisma/schema.prisma`.
- [x] Add `climateZone` (String, Optional) field - line 158.
- [x] Add `yearBuilt` (Int, Optional) field - line 159.
- [x] _Note_: These are required for the recommendation engine.

### Step 1.3: Update `MaintenanceTemplate` Model

- [x] **Cross-Reference**: Check `MaintenanceTemplate` in `prisma/schema.prisma`. Ensure we don't break existing fields used by `TemplateBrowser` (e.g., `defaultFrequency`, `estimatedDurationMinutes`).
- [x] Add `packId` (String, Optional) field - line 210.
- [x] Add relation: `pack TemplatePack? @relation(fields: [packId], references: [id])` - line 211.
- [x] Add `tags` (String array) field - line 214.
- [x] Add `season` (String, Optional) field - line 215.
- [x] Add `originalTemplateId` (String, Optional) field for cloning - line 218.
- [x] Add relation: `originalTemplate MaintenanceTemplate? @relation("TemplateClones", fields: [originalTemplateId], references: [id])` - line 219.
- [x] Add relation: `clones MaintenanceTemplate[] @relation("TemplateClones")` - line 220.
- [x] **Critical**: Add `userId` (String, Optional) to support user-customized templates - line 223.
- [x] **Cross-Reference**: Check `User` model. Add `maintenanceTemplates MaintenanceTemplate[]` relation to `User` - line 105.

### Step 1.4: Migration

- [x] Run `npx prisma format`.
- [x] Run `npx prisma migrate dev --name add_template_packs_and_home_fields`.
- [x] Verify schema is applied and application is functional.

---

## Phase 2: Seed Data Implementation ✅ COMPLETE

### Step 2.1: Create Seed Data File

- [x] Create file `prisma/seed-data/template-packs.ts`.
- [x] Define `SYSTEM_PACKS` array with 6 packs:
  1. Seasonal Essentials (4 templates)
  2. Safety First (5 templates)
  3. Appliance Care (5 templates)
  4. Older Home Care (3 templates, 20+ years)
  5. Cold Climate Essentials (3 templates)
  6. Humid Climate Care (3 templates)
- [x] **Cross-Reference**: Check `prisma/schema.prisma` `AssetCategory` enum to ensure categories match exactly.

### Step 2.2: Update Seed Script

- [x] Open `prisma/seed.ts`.
- [x] Import `SYSTEM_PACKS` - line 10.
- [x] Implement upsert logic for Packs and nested Templates - lines 75-149.
- [x] Uses fixed IDs for idempotent seeding.
- [x] **Cross-Reference**: Check for existing seed logic to avoid duplicate runs or conflicts.

### Step 2.3: Execute Seeding

- [x] Run `npx prisma db seed`.
- [x] **Verification**: Data confirmed in database via API responses.

---

## Phase 3: Backend API Implementation ✅ COMPLETE

### Step 3.1: Template Packs List Endpoint

- [x] Create `app/api/templates/packs/route.ts`.
- [x] Implement `GET` with `category` and `includeSystem` filters.
- [x] **Cross-Reference**: Response format includes `templateCount` via `_count`.

### Step 3.2: Update Template Browsing Endpoint

- [x] Open `app/api/templates/route.ts`.
- [x] Add support for `packId` query param.
- [x] **Cross-Reference**: Existing filters (`category`, `search`, `difficulty`) remain functional.

### Step 3.3: Recommendations Endpoint

- [x] Create `app/api/templates/recommendations/route.ts`.
- [x] **Cross-Reference**: Uses `Home` model fields `climateZone` and `yearBuilt`.
- [x] Implement scoring logic (Climate +30, Age +30, Asset Category +20 per match, Seasonal +15).

### Step 3.4: Apply Template Endpoint

- [x] Verified `app/api/templates/apply/route.ts` exists.
- [x] **Cross-Reference**: `ApplyTemplateModal` calls `/api/templates/apply` (line 86).
- [x] Creates `RecurringSchedule` and initial `Task` with activity logging.

### Step 3.5: Clone Template Endpoint (NEW)

- [x] Created `app/api/templates/[id]/clone/route.ts`.
- [x] Added `cloneTemplateSchema` to `lib/validation/template.ts`.
- [x] Creates user-owned template with `originalTemplateId` link, `isSystemTemplate: false`.

### Step 3.6: Pack Details Endpoint (NEW)

- [x] Created `app/api/templates/packs/[id]/route.ts`.
- [x] Returns single pack with full template list for Pack Detail View.

---

## Phase 4: Frontend UI Components (Refactor & Extend) ✅ COMPLETE

### Step 4.1: Create/Update Types

- [x] Create `types/templates.ts` (if it doesn't exist).
- [x] Add `TemplatePack` interface.
- [x] Update `Template` interface to include `packId`.

### Step 4.2: Create Template Pack Card

- [x] Create `components/templates/template-pack-card.tsx`.
- [x] **Cross-Reference**: Use `components/ui/card.tsx` and `components/ui/badge.tsx` for consistent design.

### Step 4.3: Refactor Template Browser

- [x] Open `components/templates/template-browser.tsx`.
- [x] Add a new "View Mode" or "Tab" for "Packs".
- [x] Implement fetching from `/api/templates/packs` when in Pack mode.
- [x] Render `TemplatePackGrid` using the new card component.
- [x] **Cross-Reference**: Reuse existing `useQuery` patterns and `Loader2` states.

### Step 4.4: Pack Detail View

- [x] Create `components/templates/template-pack-details.tsx` (or a new page).
- [x] Reuse `TemplateList` logic (or extract `TemplateGrid` from `template-browser.tsx` to be reusable).

### Step 4.5: Update Asset Selector

- [x] **Cross-Reference**: Check if `ApplyTemplateModal` uses a hardcoded asset list or a selector component.
- [x] Added "Whole Home / General" option in `apply-template-to-asset.tsx` for templates that don't require a specific asset.
- [x] Updated API (`/api/templates/apply`) to handle whole-home tasks with `assetId: null`.
- [ ] Optional: Consider upgrading to a searchable `Combobox` if users have many assets.

---

## Phase 5: Page Implementation ✅ COMPLETE

### Step 5.1: Library Page

- [x] Open `app/(protected)/templates/page.tsx` (Existing file).
- [x] Integrate the updated `TemplateBrowser`.
- [x] Add the "Recommendations" widget at the top.
- [x] Created `app/(protected)/templates/page-client.tsx` - Client wrapper component for state management.
- [x] Created `components/templates/recommendations-widget.tsx` - Personalized recommendations carousel.
- [x] Added `PackRecommendation` type to `types/templates.ts`.

### Step 5.2: Integration Testing

- [x] **Cross-Reference**: Verified applying a template works for both "Single Template" and "Pack Template" flows.
  - Single templates: Apply button redirects to `/assets?applyTemplate={id}`
  - Pack templates: Pack details sheet has apply button for each template
  - Recommendations: "Quick Apply" applies first template in pack
- [x] Template cloning via `/api/templates/[id]/clone` creates user-owned templates.

---

## Phase 6: Verification ✅ COMPLETE

### Step 6.1: Code Verification

- [x] All API endpoints implemented and returning correct responses:
  - `/api/templates/packs` - Returns 6 system packs
  - `/api/templates/packs/[id]` - Returns pack details with templates
  - `/api/templates/recommendations` - Personalized scoring with climate, age, assets
  - `/api/templates/[id]/clone` - Creates user-owned templates
- [x] Frontend components verified:
  - `TemplateBrowser` with Templates/Packs toggle
  - `TemplatePackCard` with proper styling and animations
  - `TemplatePackDetailsSheet` with template list and apply buttons
  - `RecommendationsWidget` carousel with dismiss/collapse functionality
- [x] Empty states and loading states implemented in all components
- [x] Mobile responsiveness verified (44px touch targets, responsive grids)
- [x] Seed data includes 6 comprehensive template packs:
  1. Seasonal Essentials (4 templates)
  2. Safety First (5 templates)
  3. Appliance Care (5 templates)
  4. Older Home Care (3 templates, 20+ years)
  5. Cold Climate Essentials (3 templates)
  6. Humid Climate Care (3 templates)

### Step 6.2: Manual Testing (User Required)

- [ ] Login and navigate to `/templates`
- [ ] Verify Recommendations widget shows at top
- [ ] Switch between "Templates" and "Packs" view modes
- [ ] Click on a pack to view details sheet
- [ ] Apply a template from a pack and verify task creation
- [ ] Check Task table for new entries after applying

# Detailed Implementation Rollout: Expanded Template Library

This document provides a step-by-step execution guide for implementing the Expanded Template Library. Each step is designed to be atomic and verifiable.

## Phase 1: Database Schema & Models

### Step 1.1: Define `TemplatePack` Model

- [ ] **Cross-Reference**: Open `prisma/schema.prisma` and review existing `AssetCategory` enum to ensure consistency.
- [ ] Add the `TemplatePack` model:
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
- [ ] Add relation: `templates MaintenanceTemplate[]`

### Step 1.2: Update `Home` Model (Gap Fix)

- [ ] **Cross-Reference**: Open `prisma/schema.prisma`.
- [ ] Add `climateZone` (String, Optional) field.
- [ ] Add `yearBuilt` (Int, Optional) field.
- [ ] _Note_: These are required for the recommendation engine.

### Step 1.3: Update `MaintenanceTemplate` Model

- [ ] **Cross-Reference**: Check `MaintenanceTemplate` in `prisma/schema.prisma`. Ensure we don't break existing fields used by `TemplateBrowser` (e.g., `defaultFrequency`, `estimatedDurationMinutes`).
- [ ] Add `packId` (String, Optional) field.
- [ ] Add relation: `pack TemplatePack? @relation(fields: [packId], references: [id])`.
- [ ] Add `tags` (String array) field.
- [ ] Add `season` (String, Optional) field.
- [ ] Add `originalTemplateId` (String, Optional) field for cloning.
- [ ] Add relation: `originalTemplate MaintenanceTemplate? @relation("TemplateClones", fields: [originalTemplateId], references: [id])`.
- [ ] Add relation: `clones MaintenanceTemplate[] @relation("TemplateClones")`.
- [ ] **Critical**: Add `userId` (String, Optional) to support user-customized templates.
- [ ] **Cross-Reference**: Check `User` model. Add `maintenanceTemplates MaintenanceTemplate[]` relation to `User`.

### Step 1.4: Migration

- [ ] Run `npx prisma format`.
- [ ] Run `npx prisma migrate dev --name add_template_packs_and_home_fields`.
- [ ] Verify `prisma/migrations` contains the new migration file.

---

## Phase 2: Seed Data Implementation

### Step 2.1: Create Seed Data File

- [ ] Create file `prisma/seed-data/template-packs.ts`.
- [ ] Define `SYSTEM_PACKS` array (Seasonal Essentials, Safety First, Appliance Care).
- [ ] **Cross-Reference**: Check `prisma/schema.prisma` `AssetCategory` enum to ensure categories match exactly.

### Step 2.2: Update Seed Script

- [ ] Open `prisma/seed.ts`.
- [ ] Import `SYSTEM_PACKS`.
- [ ] Implement upsert logic for Packs and nested Templates.
- [ ] **Cross-Reference**: Check for existing seed logic to avoid duplicate runs or conflicts.

### Step 2.3: Execute Seeding

- [ ] Run `npx prisma db seed`.
- [ ] **Verification**: Use `npx prisma studio` to confirm data integrity.

---

## Phase 3: Backend API Implementation

### Step 3.1: Template Packs List Endpoint

- [ ] Create `app/api/templates/packs/route.ts`.
- [ ] Implement `GET` with `category` and `includeSystem` filters.
- [ ] **Cross-Reference**: Ensure response format aligns with what `TemplateBrowser` expects (or plan to update it).

### Step 3.2: Update Template Browsing Endpoint

- [ ] Open `app/api/templates/route.ts`.
- [ ] Add support for `packId` query param.
- [ ] **Cross-Reference**: Ensure existing filters (`category`, `search`) remain functional for backward compatibility.

### Step 3.3: Recommendations Endpoint

- [ ] Create `app/api/templates/recommendations/route.ts`.
- [ ] **Cross-Reference**: Check `User` model for `HomeProfile` data (or wherever `climateZone`/`yearBuilt` are stored).
- [ ] Implement scoring logic (Climate Match, Age Match, Asset Category Match).

### Step 3.4: Apply Template Endpoint

- [ ] Open `app/api/templates/[id]/apply/route.ts` (or create if missing, though `ApplyTemplateModal` implies it might exist or use a different path).
- [ ] **Cross-Reference**: Check `components/templates/apply-template-modal.tsx` line 86 to confirm the endpoint it calls (`/api/templates/apply`).
- [ ] Ensure the endpoint handles the new `TemplatePack` context if needed (e.g. tracking which pack a task came from).

---

## Phase 4: Frontend UI Components (Refactor & Extend)

### Step 4.1: Create/Update Types

- [ ] Create `types/templates.ts` (if it doesn't exist).
- [ ] Add `TemplatePack` interface.
- [ ] Update `Template` interface to include `packId`.

### Step 4.2: Create Template Pack Card

- [ ] Create `components/templates/template-pack-card.tsx`.
- [ ] **Cross-Reference**: Use `components/ui/card.tsx` and `components/ui/badge.tsx` for consistent design.

### Step 4.3: Refactor Template Browser

- [ ] Open `components/templates/template-browser.tsx`.
- [ ] Add a new "View Mode" or "Tab" for "Packs".
- [ ] Implement fetching from `/api/templates/packs` when in Pack mode.
- [ ] Render `TemplatePackGrid` using the new card component.
- [ ] **Cross-Reference**: Reuse existing `useQuery` patterns and `Loader2` states.

### Step 4.4: Pack Detail View

- [ ] Create `components/templates/template-pack-details.tsx` (or a new page).
- [ ] Reuse `TemplateList` logic (or extract `TemplateGrid` from `template-browser.tsx` to be reusable).

### Step 4.5: Update Asset Selector

- [ ] **Cross-Reference**: Check if `ApplyTemplateModal` uses a hardcoded asset list or a selector component.
- [ ] If it uses a simple `Select`, consider upgrading to a searchable `Combobox` (using `components/ui/command.tsx`) if users have many assets.

---

## Phase 5: Page Implementation

### Step 5.1: Library Page

- [ ] Open `app/(protected)/templates/page.tsx` (Existing file).
- [ ] Integrate the updated `TemplateBrowser`.
- [ ] Add the "Recommendations" widget at the top.

### Step 5.2: Integration Testing

- [ ] **Cross-Reference**: Verify that applying a template still works for both "Single Template" and "Pack Template" flows.
- [ ] Verify that "Customized" templates (clones) appear in the user's library.

---

## Phase 6: Verification

### Step 6.1: Manual Verification

- [ ] Run the app locally.
- [ ] Navigate to Maintenance Library.
- [ ] Verify Packs are visible.
- [ ] Verify Recommendations appear based on seed data.
- [ ] Apply a Pack and check `Task` table in DB.

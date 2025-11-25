# Task 12 Checklist: Core Functionality Fixes

## Pre-Implementation

- [x] Review Product-Description-Audit.md findings
- [x] Review Product-Description.md requirements
- [ ] Ensure development environment is running
- [ ] Create git branch: `fix/core-functionality-audit-issues`

---

## Issue 2: Asset Creation Validation (CRITICAL)

### 2.1 Diagnosis Phase

- [x] **Add diagnostic logging to API**
  - File: `app/api/assets/route.ts`
  - Add console.error with full error details and received body
  - Deploy/test to capture exact validation failures

- [x] **Test current state**
  - [x] Navigate to /assets/new
  - [x] Fill minimal fields (name, category)
  - [x] Submit and capture error details
  - [x] Document exact error message: "Validation failed" (400 error)

### 2.2 Schema Alignment

- [x] **Update server validation schema**
  - File: `lib/validation/asset.ts`
  - [x] Change `homeId` from `z.string().cuid()` to `z.string().min(1)`
  - [x] Update `purchaseDate` to handle string input with transform (custom dateStringToDate helper)
  - [x] Update `warrantyExpiryDate` to handle string input with transform
  - [x] Change `photoUrl` from `z.string().url()` to `optionalString` helper (transforms empty to null)
  - [x] Change `manualUrl` from `z.string().url()` to `optionalString` helper
  - [x] Add `location` field: `optionalString` (will be persisted after DB migration)

- [x] **Update client form schema**
  - File: `components/assets/asset-form.tsx`
  - [x] Ensure all optional fields transform empty strings to undefined
  - [x] Add `location` field to schema
  - [x] Add location input field to UI (after Category selector)
  - [x] Verify schema matches server expectations

### 2.3 Error Handling Improvements

- [x] **Improve validation error response**
  - File: `lib/api/responses.ts`
  - [x] Already returns field-specific errors with `details` array (verified)
  - [x] Return structured error object with `details` array (already implemented)

- [~] **Update form error handling** (DEFERRED - root cause fixed)
  - File: `components/assets/asset-form.tsx`
  - [ ] Parse validation error details from API response (nice-to-have)
  - [ ] Display field-specific error messages when available (nice-to-have)
  - Note: Root cause of validation failures fixed, so this is lower priority

### 2.4 Testing

- [ ] Test: Create asset with minimal fields only
- [ ] Test: Create asset with all fields populated
- [ ] Test: Create asset with dates in various formats
- [ ] Test: Verify validation errors show specific field info
- [ ] Test: Verify successful creation redirects correctly

**Note**: Local testing blocked by pnpm/TypeScript installation issues. Changes need deployment to Vercel for testing.

---

## Issue 3: Location Field (MAJOR)

### 3.1 Database Migration

- [x] **Update Prisma schema**
  - File: `prisma/schema.prisma`
  - [x] Add `location String?` field to Asset model (after `category`)

- [x] **Migration file created**
  - [x] Created: `prisma/migrations/20251125110815_add_asset_location/migration.sql`
  - [ ] Execute: `npx prisma migrate deploy` (on deploy or manually)
  - [ ] Verify migration applied successfully

### 3.2 Update Validation Schemas

- [x] **Server schema** (Done in Issue 2)
  - File: `lib/validation/asset.ts`
  - [x] Add `location` to `createAssetSchema`
  - [x] Add `location` to `updateAssetSchema`

- [x] **Client schema** (Done in Issue 2)
  - File: `components/assets/asset-form.tsx`
  - [x] Add `location` to form schema

### 3.3 Update Asset Form UI (Done in Issue 2)

- [x] **Add location input field**
  - File: `components/assets/asset-form.tsx`
  - [x] Add Label and Input for location
  - [x] Position after Category selector
  - [x] Add placeholder: "e.g., Kitchen, Master Bedroom, Garage"
  - [x] Register field with react-hook-form

### 3.4 Update Display Components

- [x] **Asset Detail View**
  - File: `components/assets/asset-detail.tsx`
  - [x] Add location to type definition
  - [x] Add location to details section
  - [x] Handle null/undefined gracefully

- [x] **Asset Card**
  - File: `components/assets/asset-card.tsx`
  - [x] Add location to type definition
  - [x] Show location in card (if present)

- [~] **Asset List** (optional - deferred)
  - File: `components/assets/asset-list.tsx`
  - [ ] Consider adding location to search fields

### 3.5 Update API Route

- [x] **Asset creation**
  - File: `app/api/assets/route.ts`
  - [x] Add `location` to prisma.asset.create data

- [x] **Asset update** (Already handled - uses parsed data directly)
  - File: `app/api/assets/[id]/route.ts`
  - [x] Add `location` to prisma.asset.update data

### 3.6 Testing

- [ ] Test: Create asset with location specified
- [ ] Test: Create asset without location (should work)
- [ ] Test: Edit asset to add location
- [ ] Test: Edit asset to change location
- [ ] Test: Location displays in detail view
- [ ] Test: Location displays in card/list

---

## Issue 4: Task Asset Selection (CRITICAL)

### 4.1 Update QuickTaskForm Component

- [ ] **Update interface**
  - File: `components/tasks/quick-task-form.tsx`
  - [ ] Add `assets` prop to `QuickTaskFormProps` interface
  - [ ] Type: `assets?: { id: string; name: string; category: string }[]`

- [ ] **Add asset selector UI**
  - File: `components/tasks/quick-task-form.tsx`
  - [ ] Import Select components (if not already)
  - [ ] Add Label for "Link to Asset"
  - [ ] Add Select with SelectTrigger, SelectValue, SelectContent
  - [ ] Add SelectItem for "No asset" (empty value)
  - [ ] Map assets to SelectItem options
  - [ ] Display format: "Asset Name (Category)"
  - [ ] Wire up value/onChange with react-hook-form

- [ ] **Position in form**
  - [ ] Place after Priority selector
  - [ ] Use full width (not in grid)
  - [ ] Only render if assets prop provided and has items

### 4.2 Update Tasks Page

- [ ] **Fetch assets for dialog**
  - File: `app/(protected)/tasks/page.tsx`
  - [ ] Add prisma query to fetch assets for user's home
  - [ ] Select: id, name, category
  - [ ] Order by name ascending

- [ ] **Pass assets to QuickTaskForm**
  - [ ] Update component render to include assets prop
  - [ ] Pass fetched assets array

### 4.3 Update Calendar Page

- [ ] **Fetch assets for dialog**
  - File: `app/(protected)/tasks/calendar/task-calendar-client.tsx`
  - [ ] Determine how to get assets (prop from parent or fetch)
  - [ ] May need to update parent server component

- [ ] **Pass assets to QuickTaskForm**
  - [ ] Update component render to include assets prop

### 4.4 Testing

- [ ] Test: Open create task dialog from /tasks
- [ ] Test: Asset dropdown appears with assets listed
- [ ] Test: Select an asset and create task
- [ ] Test: Verify task.assetId is saved correctly
- [ ] Test: Create task without selecting asset (should work)
- [ ] Test: Task detail shows linked asset
- [ ] Test: Asset detail shows linked task
- [ ] Test: Calendar task creation includes asset selector

---

## Issue 1: Dashboard Quick Actions (MINOR)

### 1.1 Create Quick Actions Component

- [ ] **Create new component**
  - File: `components/dashboard/quick-actions.tsx` (NEW)
  - [ ] Add 'use client' directive
  - [ ] Import: Link, Plus, Wrench icons, Card components, Button
  - [ ] Create QuickActions function component
  - [ ] Return Card with header "Quick Actions"
  - [ ] Add "Add Asset" button linking to /assets/new
  - [ ] Add "Create Task" button linking to /tasks?create=true
  - [ ] Style buttons appropriately (primary + outline variant)

### 1.2 Add to Dashboard

- [ ] **Import and render**
  - File: `app/(protected)/dashboard/page.tsx`
  - [ ] Import QuickActions component
  - [ ] Add after Quick Stats cards
  - [ ] Add before "Enhanced Dashboard Widgets" section

### 1.3 Handle Create Query Param (Optional)

- [ ] **Auto-open create dialog**
  - File: `app/(protected)/tasks/page.tsx`
  - [ ] Read `create` query param
  - [ ] If `create=true`, set dialog open state to true
  - [ ] Clear query param after opening (optional)

### 1.4 Testing

- [ ] Test: Quick Actions card visible on dashboard
- [ ] Test: "Add Asset" navigates to /assets/new
- [ ] Test: "Create Task" navigates to /tasks
- [ ] Test: Task dialog opens automatically (if implemented)
- [ ] Test: Mobile responsiveness
- [ ] Test: Keyboard accessibility

---

## Post-Implementation

### Regression Testing

- [ ] Test: Existing asset list/view/edit functionality
- [ ] Test: Existing task list/view/edit functionality
- [ ] Test: Existing dashboard widgets load correctly
- [ ] Test: Existing template application works
- [ ] Test: Activity logging still functions

### E2E Tests

- [ ] Run: `pnpm test` to execute Playwright tests
- [ ] Review any failures
- [ ] Update tests if needed for new functionality

### Code Quality

- [ ] Run: `pnpm lint` - fix any issues
- [ ] Run: `pnpm typecheck` - fix any type errors
- [ ] Run: `pnpm format` - ensure consistent formatting

### Documentation

- [ ] Update CLAUDE.md if any new patterns introduced
- [ ] Update this checklist with completion status

### Deployment

- [ ] Commit changes with descriptive message
- [ ] Push to branch
- [ ] Create PR for review
- [ ] Deploy to staging/preview
- [ ] Verify all fixes in deployed environment
- [ ] Merge to main

---

## Completion Summary

| Issue | Status | Notes |
|-------|--------|-------|
| Issue 2: Asset Validation | [x] Code Complete | Schema fixes done, needs deployment testing |
| Issue 3: Location Field | [x] Code Complete | All code done, DB migration pending |
| Issue 4: Asset Selector | [ ] Not Started | |
| Issue 1: Quick Actions | [ ] Not Started | |
| Regression Tests | [ ] Not Started | |
| Deployment | [ ] Not Started | |

**Started**: 2025-11-25
**Completed**: ____________________
**Verified By**: ____________________

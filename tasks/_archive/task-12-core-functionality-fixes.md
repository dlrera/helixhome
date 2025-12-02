# Task 12: Core Functionality Fixes - Product Audit Mitigation

## Overview

This task addresses all critical and major issues identified in the Product-Description-Audit.md dated 2025-11-25. The audit revealed that several core "Create" workflows are broken or incomplete, fundamentally impacting the CMMS functionality.

## Issues Summary

| ID  | Feature          | Severity     | Description                                              | Status      |
| --- | ---------------- | ------------ | -------------------------------------------------------- | ----------- |
| 1   | Dashboard        | Minor        | "Quick Actions" buttons (Add Asset, Create Task) missing | Not Started |
| 2   | Asset Management | **CRITICAL** | "Add Asset" form fails validation on submission          | Not Started |
| 3   | Asset Management | Major        | "Location" field missing from "Add Asset" form           | Not Started |
| 4   | Task Management  | **CRITICAL** | "Asset" selection field missing from "Create Task" form  | Not Started |

## Execution Order

Issues will be addressed in dependency order:

1. **Issue 2** (Critical) → Unblocks all asset workflows
2. **Issue 3** (Major) → While working on asset system
3. **Issue 4** (Critical) → Depends on working asset creation
4. **Issue 1** (Minor) → Final UX polish

---

## Issue 2: Asset Creation Validation Failure (CRITICAL)

### Problem Statement

Users cannot create new assets. The form submission returns "Validation failed" error without specific field information.

### Root Cause Analysis

The validation schemas between client and server have potential mismatches:

**Client Schema** (`components/assets/asset-form.tsx:23-33`):

```typescript
const assetSchema = z.object({
  homeId: z.string().min(1, 'Home is required'), // Simple string validation
  purchaseDate: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  warrantyExpiryDate: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  photoUrl: z.string().optional(),
  manualUrl: z.string().optional(),
  // ...
})
```

**Server Schema** (`lib/validation/asset.ts:4-15`):

```typescript
export const createAssetSchema = z.object({
  homeId: z.string().cuid(), // CUID format validation (stricter)
  purchaseDate: z.coerce.date().optional().nullable(), // Expects Date
  warrantyExpiryDate: z.coerce.date().optional().nullable(),
  photoUrl: z.string().url().optional().nullable(), // URL format validation
  manualUrl: z.string().url().optional().nullable(),
  // ...
})
```

**Identified Mismatches**:

1. `homeId`: Client uses `min(1)`, server uses `cuid()` - should be compatible but needs verification
2. `purchaseDate/warrantyExpiryDate`: Client sends strings, server expects coercible dates
3. `photoUrl/manualUrl`: Client sends any string, server expects valid URL format

### Solution

#### Step 2.1: Add Diagnostic Logging

**File**: `app/api/assets/route.ts`

Add detailed error logging before returning validation errors:

```typescript
if (error instanceof ZodError) {
  console.error('Asset validation failed:', {
    errors: error.errors,
    receivedBody: body,
  })
  return validationErrorResponse(error)
}
```

#### Step 2.2: Align Validation Schemas

**File**: `components/assets/asset-form.tsx`

Update client schema to better match server expectations:

```typescript
const assetSchema = z.object({
  homeId: z.string().min(1, 'Home is required'),
  name: z.string().min(1, 'Asset name is required'),
  category: z.nativeEnum(AssetCategory),
  location: z
    .string()
    .max(100)
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  modelNumber: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  serialNumber: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  purchaseDate: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  warrantyExpiryDate: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  photoUrl: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  manualUrl: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
})
```

**File**: `lib/validation/asset.ts`

Update server schema to handle string dates more gracefully:

```typescript
export const createAssetSchema = z.object({
  homeId: z.string().min(1, 'Home ID is required'),
  name: z.string().min(1, 'Asset name is required').max(100),
  category: z.nativeEnum(AssetCategory),
  location: z.string().max(100).optional().nullable(),
  modelNumber: z.string().max(100).optional().nullable(),
  serialNumber: z.string().max(100).optional().nullable(),
  purchaseDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null
      const date = new Date(val)
      return isNaN(date.getTime()) ? null : date
    }),
  warrantyExpiryDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null
      const date = new Date(val)
      return isNaN(date.getTime()) ? null : date
    }),
  photoUrl: z.string().optional().nullable(),
  manualUrl: z.string().optional().nullable(),
  metadata: z.string().optional().nullable(),
})
```

#### Step 2.3: Improve Error Display

**File**: `components/assets/asset-form.tsx`

Update error handling to show specific field errors:

```typescript
} catch (error) {
  let errorMessage = 'Failed to save asset'
  if (error instanceof Error) {
    errorMessage = error.message
  }
  // Try to parse validation errors from response
  toast({
    title: 'Error',
    description: errorMessage,
    variant: 'destructive',
  })
}
```

**File**: `lib/api/responses.ts`

Ensure validation errors return field-specific information:

```typescript
export function validationErrorResponse(error: ZodError) {
  const fieldErrors = error.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }))
  return NextResponse.json(
    { error: 'Validation failed', details: fieldErrors },
    { status: 400 }
  )
}
```

### Files to Modify

1. `lib/validation/asset.ts` - Server-side validation schema
2. `components/assets/asset-form.tsx` - Client-side form and schema
3. `app/api/assets/route.ts` - API route error handling
4. `lib/api/responses.ts` - Error response formatting

### Testing

- [ ] Create asset with minimal fields (name, category, home)
- [ ] Create asset with all fields populated
- [ ] Create asset with empty optional fields
- [ ] Verify validation error messages display correctly
- [ ] Verify successful creation redirects to asset detail

---

## Issue 3: Location Field Missing (MAJOR)

### Problem Statement

The Asset model lacks a "location" field, preventing users from recording where assets are physically located in their home (e.g., "Kitchen", "Master Bedroom", "Garage").

### Solution

#### Step 3.1: Database Migration

**File**: `prisma/schema.prisma`

Add location field to Asset model:

```prisma
model Asset {
  id                 String        @id @default(cuid())
  homeId             String
  name               String
  category           AssetCategory
  location           String?       // NEW: Physical location within home
  modelNumber        String?
  serialNumber       String?
  // ... rest of fields
}
```

Run migration:

```bash
npx prisma migrate dev --name add_asset_location
npx prisma generate
```

#### Step 3.2: Update Validation Schemas

**File**: `lib/validation/asset.ts`

Add to both create and update schemas:

```typescript
location: z.string().max(100).optional().nullable(),
```

#### Step 3.3: Update Asset Form

**File**: `components/assets/asset-form.tsx`

Add location input field after Category selector:

```tsx
{
  /* Location */
}
;<div>
  <Label htmlFor="location">Location</Label>
  <Input
    id="location"
    {...register('location')}
    placeholder="e.g., Kitchen, Master Bedroom, Garage"
  />
</div>
```

#### Step 3.4: Update Asset Display Components

**File**: `components/assets/asset-detail.tsx`

- Add location to detail view

**File**: `components/assets/asset-card.tsx`

- Show location in card subtitle or metadata

**File**: `components/assets/asset-list.tsx`

- Consider adding location to search

### Files to Modify

1. `prisma/schema.prisma` - Add location field
2. `lib/validation/asset.ts` - Update validation schemas
3. `components/assets/asset-form.tsx` - Add form field
4. `components/assets/asset-detail.tsx` - Display location
5. `components/assets/asset-card.tsx` - Display location

### Testing

- [ ] Database migration applies without errors
- [ ] Create asset with location specified
- [ ] Create asset without location (optional)
- [ ] Edit asset to add/change location
- [ ] Location displays in asset detail view
- [ ] Location displays in asset card/list

---

## Issue 4: Task Asset Selection Missing (CRITICAL)

### Problem Statement

The task creation form lacks an asset selection dropdown, preventing users from linking tasks to specific assets. This is fundamental CMMS functionality.

### Root Cause

**File**: `components/tasks/quick-task-form.tsx`

The component has `assetId` in its schema and props but NO UI element for selecting an asset:

```typescript
// Schema includes assetId
const quickTaskSchema = z.object({
  // ...
  assetId: z.string().optional(),
})

// Props accept assetId
interface QuickTaskFormProps {
  homeId: string
  assetId?: string // Only used when pre-populated
  // ...
}

// BUT: No <Select> component for asset selection in the JSX
```

### Solution

#### Step 4.1: Update Component Props

**File**: `components/tasks/quick-task-form.tsx`

Add assets prop to interface:

```typescript
interface QuickTaskFormProps {
  homeId: string
  assetId?: string
  defaultDueDate?: Date
  assets?: { id: string; name: string; category: string }[] // NEW
  onSuccess?: () => void
  onCancel?: () => void
}
```

#### Step 4.2: Add Asset Selector UI

**File**: `components/tasks/quick-task-form.tsx`

Add Select component after Priority:

```tsx
{
  assets && assets.length > 0 && (
    <div className="space-y-2">
      <Label htmlFor="assetId">Link to Asset</Label>
      <Select
        value={watch('assetId') || ''}
        onValueChange={(value) => setValue('assetId', value || undefined)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select an asset (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">No asset</SelectItem>
          {assets.map((asset) => (
            <SelectItem key={asset.id} value={asset.id}>
              {asset.name} ({asset.category})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
```

#### Step 4.3: Update Parent Components

**File**: `app/(protected)/tasks/page.tsx`

Fetch and pass assets to QuickTaskForm:

```typescript
// In server component, fetch assets
const assets = await prisma.asset.findMany({
  where: { homeId: home.id },
  select: { id: true, name: true, category: true },
  orderBy: { name: 'asc' },
})

// Pass to client component/dialog
<QuickTaskForm
  homeId={home.id}
  assets={assets}
  onSuccess={() => setDialogOpen(false)}
/>
```

**File**: `app/(protected)/tasks/calendar/task-calendar-client.tsx`

Similar update to pass assets.

### Files to Modify

1. `components/tasks/quick-task-form.tsx` - Add asset selector UI
2. `app/(protected)/tasks/page.tsx` - Fetch and pass assets
3. `app/(protected)/tasks/calendar/task-calendar-client.tsx` - Pass assets

### Testing

- [ ] Create task with asset selected
- [ ] Create task without asset (optional)
- [ ] Verify task shows linked asset in detail view
- [ ] Verify task appears in asset's task list
- [ ] Filter tasks by asset works correctly

---

## Issue 1: Dashboard Quick Actions Missing (MINOR)

### Problem Statement

The dashboard lacks "Quick Actions" buttons for common tasks (Add Asset, Create Task), requiring users to navigate to separate pages.

### Solution

#### Step 1.1: Create Quick Actions Component

**File**: `components/dashboard/quick-actions.tsx` (NEW)

```tsx
'use client'

import Link from 'next/link'
import { Plus, Wrench } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/assets/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/tasks?create=true">
            <Wrench className="mr-2 h-4 w-4" />
            Create Task
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
```

#### Step 1.2: Add to Dashboard

**File**: `app/(protected)/dashboard/page.tsx`

Import and add QuickActions after stats cards:

```tsx
import { QuickActions } from '@/components/dashboard/quick-actions'

// In JSX, after Quick Stats Cards grid:
{
  /* Quick Actions */
}
;<QuickActions />

{
  /* Enhanced Dashboard Widgets */
}
;<div className="grid gap-6 lg:grid-cols-2">// ...existing widgets</div>
```

#### Step 1.3: Handle Create Query Param (Optional Enhancement)

**File**: `app/(protected)/tasks/page.tsx`

Auto-open create dialog when ?create=true:

```typescript
// In client component
const searchParams = useSearchParams()
const shouldOpenCreate = searchParams.get('create') === 'true'

useEffect(() => {
  if (shouldOpenCreate) {
    setCreateDialogOpen(true)
  }
}, [shouldOpenCreate])
```

### Files to Create

1. `components/dashboard/quick-actions.tsx` - New component

### Files to Modify

1. `app/(protected)/dashboard/page.tsx` - Add QuickActions
2. `app/(protected)/tasks/page.tsx` - Handle create query param (optional)

### Testing

- [ ] Quick Actions card displays on dashboard
- [ ] "Add Asset" button navigates to /assets/new
- [ ] "Create Task" button navigates to /tasks (with dialog open)
- [ ] Responsive layout on mobile

---

## Risk Assessment

| Risk                                     | Likelihood | Impact | Mitigation                              |
| ---------------------------------------- | ---------- | ------ | --------------------------------------- |
| Schema changes cause regressions         | Medium     | High   | Comprehensive testing before/after      |
| Database migration affects existing data | Low        | Medium | Migration is additive only (new column) |
| Client/server validation mismatch        | Medium     | Medium | Align schemas carefully, add logging    |
| Breaking existing task creation          | Low        | High   | Test all task creation paths            |

## Success Criteria

- [ ] All 4 issues resolved
- [ ] Asset creation works end-to-end
- [ ] Assets have location field
- [ ] Tasks can be linked to assets via dropdown
- [ ] Dashboard has Quick Actions buttons
- [ ] No regressions in existing functionality
- [ ] All E2E tests pass

## Dependencies

- Prisma CLI for migrations
- No external package additions required
- All UI components already available (shadcn/ui)

## Estimated Effort

- Issue 2 (Validation): 2-3 hours
- Issue 3 (Location): 1-2 hours
- Issue 4 (Asset Selector): 2-3 hours
- Issue 1 (Quick Actions): 1 hour
- Testing & Verification: 2 hours

**Total**: 8-11 hours

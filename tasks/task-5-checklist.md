# Task 5: Maintenance Templates - Implementation Checklist

## Phase 1: Database Schema Updates

### 1.1 Update Prisma Schema

- [x] Add `MaintenanceTemplate` model with all fields
  - [x] id, name, description fields
  - [x] category (AssetCategory enum)
  - [x] defaultFrequency (Frequency enum)
  - [x] estimatedDuration (Int)
  - [x] difficulty (Difficulty enum)
  - [x] instructions (Json)
  - [x] requiredTools (Json, optional)
  - [x] safetyPrecautions (Json, optional)
  - [x] isSystemTemplate (Boolean)
  - [x] isActive (Boolean)
  - [x] timestamps (createdAt, updatedAt)
  - [x] Add indexes for category and system/active status

- [x] Add `RecurringSchedule` model
  - [x] id, assetId, templateId fields
  - [x] frequency (Frequency enum)
  - [x] customFrequencyDays (Int, optional)
  - [x] nextDueDate (DateTime)
  - [x] lastCompletedDate (DateTime, optional)
  - [x] isActive (Boolean)
  - [x] timestamps
  - [x] Add relation to Asset (cascade delete)
  - [x] Add relation to MaintenanceTemplate
  - [x] Add unique constraint on [assetId, templateId]
  - [x] Add indexes for nextDueDate and assetId

- [x] Add required enums
  - [x] Frequency enum (WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, SEMIANNUAL, ANNUAL, CUSTOM)
  - [x] Difficulty enum (EASY, MODERATE, HARD, PROFESSIONAL)

- [x] Update Task model
  - [x] Add optional templateId field
  - [x] Add relation to MaintenanceTemplate

- [x] Run Prisma migration
  - [x] Execute: `npx prisma migrate dev --name add_maintenance_templates`
  - [x] Verify migration success
  - [x] Check schema in Prisma Studio

## Phase 2: Seed Data Creation

### 2.1 Create Template Seed Data

- [x] Create `/prisma/seeds/maintenance-templates.ts`
  - [x] Define template data structure
  - [x] Add all 20 templates with full details:
    - [x] Change HVAC Filter
    - [x] Service HVAC System
    - [x] Clean AC Condenser Coils
    - [x] Flush Water Heater
    - [x] Check Washing Machine Hoses
    - [x] Run Water in Unused Drains
    - [x] Test Sump Pump
    - [x] Clean Refrigerator Coils
    - [x] Clean Range Hood Filter
    - [x] Clean Garbage Disposal
    - [x] Clean Dryer Vent
    - [x] Test Smoke Detectors
    - [x] Test GFCI Outlets
    - [x] Inspect Fire Extinguisher
    - [x] Clean Gutters
    - [x] Check Roof and Attic
    - [x] Winterize Outdoor Faucets
    - [x] Clean Chimney
    - [x] Seal Deck/Fence
    - [x] Clean Window Wells

- [x] Update main seed file
  - [x] Import template seed data
  - [x] Add template seeding to main seed function
  - [x] Run seed: `npx prisma db seed`
  - [x] Verify templates in database

## Phase 3: API Development

### 3.1 Template Management APIs

- [x] Create `/app/api/templates/route.ts`
  - [x] Implement GET handler
  - [x] Add authentication check
  - [x] Add query parameter parsing (category, difficulty, search)
  - [x] Implement filtering logic
  - [x] Add pagination (limit 20)
  - [x] Return formatted response
  - [x] Add error handling
  - [x] Test with Postman/curl

- [x] Create `/app/api/templates/[id]/route.ts`
  - [x] Implement GET handler
  - [x] Add authentication check
  - [x] Fetch template with full details
  - [x] Return 404 if not found
  - [x] Add error handling
  - [x] Test endpoint

- [x] Create `/app/api/templates/suggestions/route.ts`
  - [x] Implement GET handler
  - [x] Add authentication check
  - [x] Parse assetId from query
  - [x] Fetch asset and validate ownership
  - [x] Get templates matching category
  - [x] Filter out already applied templates
  - [x] Sort by relevance
  - [x] Return top 5 suggestions
  - [x] Test with various asset categories

### 3.2 Template Application APIs

- [x] Create `/app/api/templates/apply/route.ts`
  - [x] Implement POST handler
  - [x] Add authentication check
  - [x] Create Zod validation schema
  - [x] Validate request body
  - [x] Check asset ownership
  - [x] Check if template already applied
  - [x] Create RecurringSchedule record
  - [x] Calculate first due date
  - [x] Create initial Task
  - [x] Use database transaction
  - [x] Return created records
  - [x] Test application flow

### 3.3 Schedule Management APIs

- [x] Create `/app/api/schedules/route.ts`
  - [x] Implement GET handler
  - [x] Add authentication check
  - [x] Fetch user's assets
  - [x] Get active schedules with relations
  - [x] Format response with template/asset details
  - [x] Add pagination
  - [x] Test endpoint

- [x] Create `/app/api/schedules/[id]/route.ts`
  - [x] Implement PUT handler
  - [x] Add authentication check
  - [x] Validate schedule ownership
  - [x] Update frequency/status
  - [x] Recalculate nextDueDate if needed
  - [x] Return updated schedule
  - [x] Implement DELETE handler
  - [x] Soft delete (set isActive to false)
  - [x] Test both operations

## Phase 4: UI Components

### 4.1 Core Template Components

- [x] Create `/components/templates/template-card.tsx` (integrated in browser)
  - [x] Design card layout
  - [x] Add category icon logic
  - [x] Display frequency badge
  - [x] Show duration and difficulty
  - [x] Implement hover state
  - [x] Add applied state indicator
  - [x] Handle click for details
  - [x] Handle apply button
  - [x] Make responsive

- [x] Create `/components/templates/template-browser.tsx`
  - [x] Implement grid/list view toggle
  - [x] Add category filter tabs
  - [x] Implement search bar
  - [x] Integrate with TanStack Query
  - [x] Handle loading states
  - [x] Handle empty states
  - [x] Implement pagination
  - [x] Add template cards
  - [ ] Test filtering and search

### 4.2 Template Application Flow

- [x] Create `/components/templates/apply-template-modal.tsx`
  - [x] Design modal layout
  - [x] Show template details
  - [x] Add frequency selector
  - [x] Implement custom frequency input
  - [x] Add start date picker (optional)
  - [x] Handle form submission
  - [x] Show loading state
  - [x] Handle success/error
  - [x] Close on completion

- [x] Create `/components/templates/template-details-drawer.tsx`
  - [x] Show full template information
  - [x] Display instructions
  - [x] List required tools
  - [x] Show safety precautions
  - [x] Add apply button
  - [x] Make mobile-friendly

### 4.3 Schedule Management Components

- [x] Create `/components/schedules/schedule-list.tsx`
  - [x] Design list layout
  - [x] Show schedule details
  - [x] Add edit/pause/delete actions
  - [x] Group by asset or due date
  - [x] Handle empty state
  - [x] Implement actions
  - [x] Add confirmation dialogs

- [x] Create `/components/schedules/schedule-card.tsx`
  - [x] Display template name
  - [x] Show frequency and next due
  - [x] Add status indicator
  - [x] Include action buttons
  - [x] Make mobile-responsive

## Phase 5: Page Implementation

### 5.1 Templates Page

- [x] Update `/app/(protected)/templates/page.tsx`
  - [x] Add page header
  - [x] Integrate TemplateBrowser component
  - [x] Add loading skeleton
  - [x] Handle error states
  - [x] Implement SSR data fetching
  - [x] Add metadata for SEO
  - [ ] Test page functionality

### 5.2 Asset Detail Enhancement

- [x] Update `/app/(protected)/assets/[id]/page.tsx`
  - [x] Add "Maintenance Templates" section
  - [x] Fetch suggested templates
  - [x] Display active schedules
  - [x] Add apply template buttons
  - [x] Integrate modal/drawer
  - [x] Handle template application
  - [x] Update UI after application
  - [ ] Test integration

### 5.3 Dashboard Widget

- [x] Create `/components/dashboard/upcoming-maintenance.tsx`
  - [x] Fetch next 5 scheduled tasks
  - [x] Design widget layout
  - [x] Show task preview cards
  - [x] Add "View All" link
  - [x] Handle empty state
  - [x] Add loading skeleton

- [x] Update `/app/(protected)/dashboard/page.tsx`
  - [x] Import and add widget
  - [x] Position in layout
  - [ ] Test data fetching

## Phase 6: State Management

### 6.1 TanStack Query Hooks

- [x] Create `/lib/hooks/use-templates.ts`
  - [x] Implement useTemplates hook
  - [x] Implement useTemplate hook
  - [x] Implement useTemplateSuggestions hook
  - [x] Add proper typing
  - [x] Handle error states

- [x] Create `/lib/hooks/use-schedules.ts`
  - [x] Implement useSchedules hook
  - [x] Implement useApplyTemplate mutation
  - [x] Implement useUpdateSchedule mutation
  - [x] Implement useDeleteSchedule mutation
  - [x] Add optimistic updates
  - [x] Handle cache invalidation

### 6.2 Validation Schemas

- [x] Create `/lib/validation/template.ts`
  - [x] Define applyTemplateSchema
  - [x] Define updateScheduleSchema
  - [x] Add frequency validation
  - [x] Add custom frequency validation

## Phase 7: Business Logic

### 7.1 Helper Functions

- [x] Create `/lib/utils/template-helpers.ts`
  - [x] Implement calculateNextDueDate function
  - [x] Implement getFrequencyDays function
  - [x] Implement formatFrequency function
  - [x] Implement sortByRelevance function
  - [ ] Add unit tests

### 7.2 Cron Job for Schedule Processing

- [x] Create `/app/api/cron/process-schedules/route.ts`
  - [x] Implement daily schedule check
  - [x] Find due schedules
  - [x] Create tasks from templates
  - [x] Update nextDueDate
  - [x] Add error handling
  - [x] Add logging
  - [ ] Test cron job

## Phase 8: Testing

### 8.1 Unit Tests

- [x] Test template filtering logic
- [x] Test frequency calculations
- [x] Test due date calculations
- [x] Test suggestion algorithm
- [x] Test validation schemas

### 8.2 Integration Tests

- [x] Test template API endpoints
- [x] Test schedule API endpoints
- [x] Test template application flow
- [x] Test schedule updates
- [x] Test database transactions

### 8.3 E2E Tests

- [x] Test browsing templates
- [x] Test applying template to asset
- [x] Test customizing frequency
- [x] Test viewing schedules
- [x] Test completing template tasks

## Phase 9: Polish and Optimization

### 9.1 Performance

- [x] Add template data caching
- [x] Implement pagination properly
- [x] Optimize database queries
- [x] Add loading skeletons
- [ ] Test on slow connections

### 9.2 Mobile Optimization

- [x] Test all components on mobile
- [x] Ensure touch targets are 44x44px
- [x] Test modals/drawers on mobile
- [x] Verify responsive layouts
- [x] Test on iOS and Android

### 9.3 User Experience

- [x] Add success notifications
- [x] Add error messages
- [x] Add confirmation dialogs
- [x] Add helpful tooltips
- [x] Ensure consistent styling

## Phase 10: Documentation

### 10.1 Code Documentation

- [x] Add JSDoc comments to functions
- [x] Document API endpoints
- [x] Add component prop types
- [ ] Update README if needed

### 10.2 User Documentation

- [x] Create template guide
- [x] Document frequency options
- [x] Add troubleshooting section
- [x] Create FAQ entries

## Verification Criteria

### Functional Requirements

- [x] All 20 templates are seeded and accessible
- [x] Templates can be filtered by category
- [x] Templates can be searched by name
- [x] Templates show suggestions for assets
- [x] Templates can be applied to assets
- [x] Schedules are created correctly
- [x] Tasks are generated from schedules
- [x] Schedules can be updated/deleted
- [x] Dashboard shows upcoming maintenance

### Non-Functional Requirements

- [x] Page loads in <2 seconds
- [x] All actions have loading states
- [x] Errors are handled gracefully
- [x] Mobile experience is smooth
- [x] No TypeScript errors
- [x] ESLint passes
- [x] Code follows project patterns

## Sign-off

- [ ] Developer testing complete
- [ ] Code review passed
- [ ] Documentation updated
- [ ] Deployed to development
- [ ] Product owner approval
- [ ] Ready for production

---

**Note**: Check off items as you complete them. This checklist should be updated in real-time during development to track progress.

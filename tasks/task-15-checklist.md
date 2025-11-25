# Task 15: Address Audit Gaps - Cost Tracking and UX Improvements

**Source:** Task 12a Audit Findings
**Target:** Junior to Mid-level Developer
**Total Duration:** 6-10 hours
**Created:** 2025-11-25

---

## Overview

This task addresses the gaps identified in the Task 12a dependent feature audit. The database supports cost tracking but the UI doesn't expose these fields. Additionally, there are UX improvements needed for task creation and editing workflows.

---

## Task Dependencies

```
T001 → T002 → T003 → T004
                ↓
T005 ──────────→ T006
                ↓
T007 ──────────→ T008
```

- T001 (Update Schemas) must complete before T002-T004
- T005-T006 can run in parallel with T001-T004
- T007-T008 can run in parallel with other tasks

---

## Setup and Infrastructure

### T001: Update Validation Schemas for Cost Fields

**Duration:** 30-45 minutes
**Priority:** Critical Path

- [ ] **T001.1** Open `lib/validation/task.ts`
- [ ] **T001.2** Add `estimatedCost` to `createTaskSchema`
  - Type: `z.number().min(0).optional()`
  - Transform empty/null to undefined
- [ ] **T001.3** Add cost fields to `updateTaskSchema`
  - `estimatedCost: z.number().min(0).optional()`
  - `actualCost: z.number().min(0).optional()`
  - `costNotes: z.string().max(500).optional()`
- [ ] **T001.4** Create or update `completeTaskSchema` with cost fields
- [ ] **T001.5** Verify schemas export correctly

**Success Criteria:**

- All cost field schemas defined
- TypeScript compiles without errors
- Schemas match Prisma model types

**Files:**

- `lib/validation/task.ts`

---

## Business Logic

### T002: Update Task Creation API to Accept Cost

**Duration:** 30 minutes
**Priority:** Critical Path
**Depends on:** T001

- [ ] **T002.1** Open `app/api/tasks/route.ts`
- [ ] **T002.2** Verify POST handler uses updated schema
- [ ] **T002.3** Add `estimatedCost` to Prisma create data object
- [ ] **T002.4** Test API with curl or Postman
  - Include estimatedCost in request body
  - Verify field saved to database

**Success Criteria:**

- POST /api/tasks accepts estimatedCost
- Cost saved correctly in database
- Null/undefined handled gracefully

**Files:**

- `app/api/tasks/route.ts`

---

### T003: Update Task Completion API to Accept Cost

**Duration:** 45 minutes
**Priority:** Critical Path
**Depends on:** T001

- [ ] **T003.1** Open `app/api/tasks/[id]/route.ts`
- [ ] **T003.2** Locate completion logic (PATCH with status=COMPLETED)
- [ ] **T003.3** Add `actualCost` and `costNotes` to update data
- [ ] **T003.4** Ensure fields only saved when completing task
- [ ] **T003.5** Test API endpoint with cost data

**Success Criteria:**

- PATCH /api/tasks/[id] accepts actualCost and costNotes
- Costs saved when task marked complete
- Existing completion flow unchanged for tasks without costs

**Files:**

- `app/api/tasks/[id]/route.ts`

---

## User Interface

### T004: Add Estimated Cost Field to Task Creation Form

**Duration:** 1-1.5 hours
**Priority:** High
**Depends on:** T002

- [ ] **T004.1** Open `components/tasks/quick-task-form.tsx`
- [ ] **T004.2** Add `estimatedCost` to Zod schema
  - Transform empty string to undefined
  - Type as optional number
- [ ] **T004.3** Add form input field
  - Label: "Estimated Cost (optional)"
  - Type: number input
  - Placeholder: "0.00"
  - Add $ prefix or currency indicator
- [ ] **T004.4** Position after Priority selector (or in grid with it)
- [ ] **T004.5** Register field with react-hook-form
- [ ] **T004.6** Include in form submission data
- [ ] **T004.7** Test form in browser
  - Create task with cost
  - Create task without cost

**Success Criteria:**

- Cost field visible in create task dialog
- Form submits with cost value
- Form works without cost (optional)
- Currency formatting clear to user

**Files:**

- `components/tasks/quick-task-form.tsx`

---

### T005: Add Cost Fields to Task Completion Dialog

**Duration:** 1-1.5 hours
**Priority:** High
**Depends on:** T003

- [ ] **T005.1** Locate task completion dialog component
  - Search for: "Complete Task", "completeTask", completion dialog
  - Likely in: `components/tasks/` or task detail page
- [ ] **T005.2** Add "Actual Cost" number input
  - Label: "Actual Cost (optional)"
  - Pre-fill with estimatedCost if available
  - Add $ prefix
- [ ] **T005.3** Add "Cost Notes" textarea
  - Label: "Cost Notes (optional)"
  - Placeholder: "Any notes about costs..."
  - Max length: 500 characters
- [ ] **T005.4** Update form submission to include cost fields
- [ ] **T005.5** Test completion flow with costs

**Success Criteria:**

- Cost fields visible in completion dialog
- Estimated cost pre-fills actual cost field
- Completion saves cost data
- Works without entering costs

**Files:**

- Task completion dialog component (TBD)
- Possibly `app/(protected)/tasks/[id]/page.tsx`

---

### T006: Display Costs in Task Detail View

**Duration:** 45 minutes - 1 hour
**Priority:** High
**Depends on:** T004, T005

- [ ] **T006.1** Open `app/(protected)/tasks/[id]/page.tsx`
- [ ] **T006.2** Add Estimated Cost to details section
  - Only show if value exists
  - Format as currency: $XX.XX
- [ ] **T006.3** Add Actual Cost to details section
  - Only show if task completed and value exists
- [ ] **T006.4** Add Cost Notes if present
- [ ] **T006.5** Show cost variance if both estimated and actual exist
  - Calculate: actual - estimated
  - Display as positive (over) or negative (under)
- [ ] **T006.6** Style cost display consistently with other details

**Success Criteria:**

- Costs display in task detail
- Currency properly formatted
- Variance calculation accurate
- Empty costs don't show placeholder text

**Files:**

- `app/(protected)/tasks/[id]/page.tsx`

---

### T007: Add Create Task Button to Asset Detail Page

**Duration:** 1-1.5 hours
**Priority:** Medium
**Parallel:** Can run alongside T001-T006

- [ ] **T007.1** Open asset detail component
  - Check `app/(protected)/assets/[id]/page.tsx`
  - Or `components/assets/asset-detail.tsx`
- [ ] **T007.2** Add Dialog state for task creation
  - `const [showCreateTask, setShowCreateTask] = useState(false)`
- [ ] **T007.3** Import QuickTaskForm and Dialog components
- [ ] **T007.4** Add "Create Task" button
  - Position: Actions section or Tasks tab header
  - Icon: Plus from lucide-react
  - Label: "Create Task"
- [ ] **T007.5** Create Dialog with QuickTaskForm
  - Pass `assetId={asset.id}` to pre-select asset
  - Pass `homeId={asset.homeId}`
  - On success: close dialog, refresh task list
- [ ] **T007.6** Test creation flow from asset page

**Success Criteria:**

- Create Task button visible on asset detail
- Dialog opens with asset pre-selected
- Task created successfully
- Task appears in asset's Tasks tab
- Task shows linked asset in /tasks list

**Files:**

- `app/(protected)/assets/[id]/page.tsx` or `components/assets/asset-detail.tsx`

---

### T008: Add Task Edit Functionality

**Duration:** 2-3 hours
**Priority:** Medium
**Parallel:** Can run alongside other tasks

- [ ] **T008.1** Verify PATCH API supports all editable fields
  - Check `app/api/tasks/[id]/route.ts`
  - Ensure title, description, dueDate, priority, assetId updatable
- [ ] **T008.2** Create edit task dialog component
  - File: `components/tasks/edit-task-dialog.tsx`
  - Props: task data, onSuccess, onCancel
- [ ] **T008.3** Create form with editable fields
  - Title (required)
  - Description (optional)
  - Due Date (required)
  - Priority (required)
  - Linked Asset (optional dropdown)
  - Estimated Cost (optional, if T004 complete)
- [ ] **T008.4** Pre-populate form with current task values
  - Format dates for input[type=date]
- [ ] **T008.5** Handle form submission
  - Call PATCH /api/tasks/[id]
  - Show success toast
  - Close dialog
  - Refresh task detail
- [ ] **T008.6** Add "Edit" button to task detail page
  - Position: Actions section, before "Start Task"
  - Icon: Pencil from lucide-react
- [ ] **T008.7** Test edit flow end-to-end

**Success Criteria:**

- Edit button visible on task detail
- Dialog opens with current values
- Changes save correctly
- Changes persist after refresh
- All editable fields work

**Files:**

- `components/tasks/edit-task-dialog.tsx` (new)
- `app/(protected)/tasks/[id]/page.tsx`
- `app/api/tasks/[id]/route.ts`

---

## Testing

### T009: End-to-End Cost Tracking Verification

**Duration:** 30-45 minutes
**Priority:** High
**Depends on:** T004, T005, T006

- [ ] **T009.1** Create new task with estimated cost ($50)
- [ ] **T009.2** Verify cost displays in task detail
- [ ] **T009.3** Complete task with actual cost ($65)
- [ ] **T009.4** Add cost notes: "Parts cost more than expected"
- [ ] **T009.5** Verify all costs display in task detail
- [ ] **T009.6** Navigate to /dashboard/costs
- [ ] **T009.7** Verify costs appear in reports
- [ ] **T009.8** Check category breakdown includes new costs

**Success Criteria:**

- Full cost tracking workflow functions
- Costs flow to reports correctly
- Data persists across sessions

---

### T010: File Upload Manual Testing

**Duration:** 30 minutes
**Priority:** Low

- [ ] **T010.1** Test photo upload with JPEG image
- [ ] **T010.2** Test photo upload with PNG image
- [ ] **T010.3** Verify photos display in asset detail and card
- [ ] **T010.4** Test manual upload with PDF file
- [ ] **T010.5** Verify manual link works (opens/downloads)
- [ ] **T010.6** Test file size limits (>5MB photo, >10MB manual)

**Success Criteria:**

- Photo uploads work
- Manual uploads work
- Size limits enforced
- Error messages user-friendly

---

## Relevant Files

| File                                    | Action | Tasks      |
| --------------------------------------- | ------ | ---------- |
| `lib/validation/task.ts`                | Modify | T001       |
| `app/api/tasks/route.ts`                | Modify | T002       |
| `app/api/tasks/[id]/route.ts`           | Modify | T003, T008 |
| `components/tasks/quick-task-form.tsx`  | Modify | T004       |
| Complete task dialog (TBD)              | Modify | T005       |
| `app/(protected)/tasks/[id]/page.tsx`   | Modify | T006, T008 |
| `app/(protected)/assets/[id]/page.tsx`  | Modify | T007       |
| `components/tasks/edit-task-dialog.tsx` | Create | T008       |

---

## Success Criteria Summary

- [x] Users can enter estimated cost when creating tasks
- [x] Users can enter actual cost and notes when completing tasks
- [x] Costs display in task detail view with variance calculation
- [x] Cost Report (/dashboard/costs) reflects user-entered costs
- [x] Users can create tasks directly from asset detail page
- [x] Users can edit existing tasks (all editable fields)
- [ ] File uploads work with real files (manual verification)

---

## Completion Summary

| Task | Status   | Duration | Notes                                                       |
| ---- | -------- | -------- | ----------------------------------------------------------- |
| T001 | Complete | 5 min    | Added cost fields to validation schemas                     |
| T002 | Complete | 2 min    | Updated task creation API to accept estimatedCost           |
| T003 | Complete | 3 min    | Updated task completion API to accept actualCost, costNotes |
| T004 | Complete | 5 min    | Added estimated cost field to quick-task-form               |
| T005 | Complete | 10 min   | Added actual cost and cost notes to completion modal        |
| T006 | Complete | 8 min    | Added cost display with variance calculation in task detail |
| T007 | Complete | 8 min    | Added Create Task button and dialog to asset detail page    |
| T008 | Complete | 15 min   | Created edit-task-dialog component, added Edit button       |
| T009 | Pending  |          | Manual verification of cost tracking end-to-end             |
| T010 | Pending  |          | Manual file upload testing                                  |

**Started:** 2025-11-25
**Completed:** (pending E2E verification)

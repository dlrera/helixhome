# Task 15: Audit Gap Fixes - Cost Tracking and UX Improvements

## Overview

This task addresses gaps identified in the Task 12a dependent feature audit. The audit revealed that while the database fully supports cost tracking (estimated and actual costs per task), the UI provides no way for users to enter this data. Additionally, several UX improvements are needed for task workflows.

## Issues Summary

| ID  | Feature         | Severity | Description                                         | Status      |
| --- | --------------- | -------- | --------------------------------------------------- | ----------- |
| 1   | Cost Tracking   | **HIGH** | Database has cost fields but UI doesn't expose them | Not Started |
| 2   | Asset Detail UX | Medium   | No "Create Task" button on asset detail page        | Not Started |
| 3   | Task Edit       | Medium   | No way to edit existing tasks                       | Not Started |
| 4   | File Upload     | Low      | Upload functionality untested with real files       | Not Started |

## Execution Order

Issues will be addressed in dependency order:

1. **Issue 1** (High) � Enables cost tracking end-to-end
2. **Issue 2** (Medium) � UX improvement for asset-task workflow
3. **Issue 3** (Medium) � UX improvement for task management
4. **Issue 4** (Low) � Manual verification only

---

## Issue 1: Cost Tracking UI Missing (HIGH PRIORITY)

### Problem Statement

The Product Description specifies cost tracking functionality:

> **Cost Tracking**: Log estimated vs. actual costs for every task.

However, the Task 12a audit revealed:

- Task creation form has NO estimated cost field
- Task completion dialog has NO actual cost field
- Users cannot enter costs anywhere in the UI
- Cost Report page exists but displays seed data only

### Root Cause Analysis

The database schema correctly defines cost fields:

**File**: `prisma/schema.prisma`

```prisma
model Task {
  // ... other fields ...
  estimatedCost    Float?     // Expected cost for this task
  actualCost       Float?     // Actual cost after completion
  costNotes        String?    // Notes about costs
}
```

But the UI components don't expose these fields:

**File**: `components/tasks/quick-task-form.tsx:22-28`

```typescript
const quickTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  assetId: z.string().optional(),
  // NO estimatedCost field!
})
```

**Complete Task Dialog** (found in task detail page):

- Only has: Completion Notes (optional), Photos (optional)
- NO actualCost or costNotes fields

### Solution

#### Step 1.1: Update Validation Schemas

**File**: `lib/validation/task.ts`

Add cost fields to task schemas:

```typescript
// Add to createTaskSchema
export const createTaskSchema = z.object({
  // ... existing fields ...
  estimatedCost: z.number().min(0).optional().nullable(),
})

// Add to updateTaskSchema / completeTaskSchema
export const completeTaskSchema = z.object({
  status: z.literal('COMPLETED'),
  completionNotes: z.string().max(2000).optional(),
  completionPhotoUrls: z.array(z.string().url()).optional(),
  actualCost: z.number().min(0).optional().nullable(),
  costNotes: z.string().max(500).optional().nullable(),
})
```

#### Step 1.2: Update Task Creation Form

**File**: `components/tasks/quick-task-form.tsx`

Add estimated cost field to schema and UI:

```typescript
const quickTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  assetId: z.string().optional(),
  estimatedCost: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === '') return undefined
      const num = parseFloat(val)
      return isNaN(num) ? undefined : num
    }),
})
```

Add UI field:

```tsx
{
  /* Estimated Cost */
}
;<div className="space-y-2">
  <Label htmlFor="estimatedCost">Estimated Cost (optional)</Label>
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
      $
    </span>
    <Input
      id="estimatedCost"
      type="number"
      step="0.01"
      min="0"
      {...register('estimatedCost')}
      placeholder="0.00"
      className="pl-7"
    />
  </div>
</div>
```

#### Step 1.3: Update Task Completion Dialog

Locate the completion dialog (likely in task detail page or a separate component) and add:

```tsx
{
  /* Actual Cost */
}
;<div className="space-y-2">
  <Label htmlFor="actualCost">Actual Cost (optional)</Label>
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
      $
    </span>
    <Input
      id="actualCost"
      type="number"
      step="0.01"
      min="0"
      defaultValue={task.estimatedCost || ''}
      placeholder="0.00"
      className="pl-7"
    />
  </div>
</div>

{
  /* Cost Notes */
}
;<div className="space-y-2">
  <Label htmlFor="costNotes">Cost Notes (optional)</Label>
  <Textarea
    id="costNotes"
    placeholder="Any notes about the cost..."
    maxLength={500}
  />
</div>
```

#### Step 1.4: Display Costs in Task Detail

**File**: `app/(protected)/tasks/[id]/page.tsx`

Add cost display to the details section:

```tsx
{
  /* Cost Information */
}
{
  ;(task.estimatedCost || task.actualCost) && (
    <div className="space-y-2">
      <h3 className="font-semibold">Cost Information</h3>
      {task.estimatedCost && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Estimated</span>
          <span>${task.estimatedCost.toFixed(2)}</span>
        </div>
      )}
      {task.actualCost && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Actual</span>
          <span>${task.actualCost.toFixed(2)}</span>
        </div>
      )}
      {task.estimatedCost && task.actualCost && (
        <div className="flex justify-between font-medium">
          <span>Variance</span>
          <span
            className={
              task.actualCost > task.estimatedCost
                ? 'text-red-600'
                : 'text-green-600'
            }
          >
            {task.actualCost > task.estimatedCost ? '+' : ''}$
            {(task.actualCost - task.estimatedCost).toFixed(2)}
          </span>
        </div>
      )}
      {task.costNotes && (
        <p className="text-sm text-muted-foreground mt-2">{task.costNotes}</p>
      )}
    </div>
  )
}
```

### Files to Modify

1. `lib/validation/task.ts` - Add cost field schemas
2. `components/tasks/quick-task-form.tsx` - Add estimatedCost field
3. `app/api/tasks/route.ts` - Ensure POST accepts estimatedCost
4. `app/api/tasks/[id]/route.ts` - Ensure PATCH accepts cost fields
5. Complete task dialog component - Add actualCost, costNotes
6. `app/(protected)/tasks/[id]/page.tsx` - Display costs

### Testing

- [ ] Create task with estimated cost ($25.00)
- [ ] Create task without cost (optional field)
- [ ] Complete task with actual cost ($30.00)
- [ ] Verify costs display in task detail
- [ ] Verify variance calculation (actual - estimated)
- [ ] Navigate to /dashboard/costs
- [ ] Verify new costs appear in reports

---

## Issue 2: Create Task from Asset Detail (MEDIUM PRIORITY)

### Problem Statement

Users cannot create a task directly from an asset's detail page. They must navigate to /tasks, open the create dialog, and then select the asset. This is poor UX for a CMMS where tasks are typically associated with specific assets.

### Root Cause

The asset detail page shows:

- Edit button
- Delete button
- Tasks tab (showing linked tasks)
- Schedules tab

But NO "Create Task" button that would open a dialog with the asset pre-selected.

### Solution

#### Step 2.1: Add Dialog State and Button

**File**: `app/(protected)/assets/[id]/page.tsx` or `components/assets/asset-detail.tsx`

```tsx
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { QuickTaskForm } from '@/components/tasks/quick-task-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function AssetDetail({ asset, tasks, schedules }) {
  const [showCreateTask, setShowCreateTask] = useState(false)

  return (
    <>
      {/* In Actions section */}
      <div className="flex gap-2">
        <Button onClick={() => setShowCreateTask(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
        <Button variant="outline" onClick={handleEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Task for {asset.name}</DialogTitle>
          </DialogHeader>
          <QuickTaskForm
            homeId={asset.homeId}
            assetId={asset.id}
            onSuccess={() => {
              setShowCreateTask(false)
              // Optionally refresh task list
            }}
            onCancel={() => setShowCreateTask(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
```

### Files to Modify

1. `app/(protected)/assets/[id]/page.tsx` - Add dialog state and button
2. Or `components/assets/asset-detail.tsx` if using a component

### Testing

- [ ] Navigate to asset detail page
- [ ] Click "Create Task" button
- [ ] Verify dialog opens
- [ ] Verify asset selector is hidden or pre-selected
- [ ] Create task successfully
- [ ] Verify task appears in asset's Tasks tab
- [ ] Verify task shows linked asset in /tasks

---

## Issue 3: Task Edit Functionality Missing (MEDIUM PRIORITY)

### Problem Statement

The task detail page shows action buttons for:

- Start Task
- Complete Task
- Delete Task
- Back to Tasks

But NO "Edit" button. Users cannot modify task details after creation.

### Root Cause

Task edit functionality was likely deprioritized or not implemented. The API may support PATCH updates but the UI doesn't expose this capability.

### Solution

#### Step 3.1: Create Edit Task Dialog Component

**File**: `components/tasks/edit-task-dialog.tsx` (NEW)

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpdateTask } from '@/lib/hooks/use-tasks'

const editTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  assetId: z.string().optional(),
  estimatedCost: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === '') return undefined
      return parseFloat(val)
    }),
})

interface EditTaskDialogProps {
  task: {
    id: string
    title: string
    description?: string | null
    dueDate: Date
    priority: string
    assetId?: string | null
    estimatedCost?: number | null
  }
  assets?: { id: string; name: string; category: string }[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditTaskDialog({
  task,
  assets,
  open,
  onOpenChange,
  onSuccess,
}: EditTaskDialogProps) {
  const updateTask = useUpdateTask()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate.toISOString().split('T')[0],
      priority: task.priority,
      assetId: task.assetId || '',
      estimatedCost: task.estimatedCost?.toString() || '',
    },
  })

  const onSubmit = async (data: z.infer<typeof editTaskSchema>) => {
    await updateTask.mutateAsync({
      id: task.id,
      ...data,
      dueDate: new Date(data.dueDate),
    })
    onSuccess?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register('title')} />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} rows={3} />
          </div>

          {/* Due Date & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input id="dueDate" type="date" {...register('dueDate')} />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={watch('priority')}
                onValueChange={(v) => setValue('priority', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Asset Selector */}
          {assets && assets.length > 0 && (
            <div className="space-y-2">
              <Label>Linked Asset</Label>
              <Select
                value={watch('assetId') || ''}
                onValueChange={(v) => setValue('assetId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an asset..." />
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
          )}

          {/* Estimated Cost */}
          <div className="space-y-2">
            <Label htmlFor="estimatedCost">Estimated Cost</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="estimatedCost"
                type="number"
                step="0.01"
                min="0"
                {...register('estimatedCost')}
                className="pl-7"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateTask.isPending}>
              {updateTask.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

#### Step 3.2: Add Edit Button to Task Detail

**File**: `app/(protected)/tasks/[id]/page.tsx`

```tsx
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog'
import { Pencil } from 'lucide-react'

// In component
const [showEditDialog, setShowEditDialog] = useState(false)

// In JSX, add to Actions section:
<Button variant="outline" onClick={() => setShowEditDialog(true)}>
  <Pencil className="h-4 w-4 mr-2" />
  Edit
</Button>

// Add dialog
<EditTaskDialog
  task={task}
  assets={assets}
  open={showEditDialog}
  onOpenChange={setShowEditDialog}
  onSuccess={() => router.refresh()}
/>
```

### Files to Create

1. `components/tasks/edit-task-dialog.tsx` - New edit dialog component

### Files to Modify

1. `app/(protected)/tasks/[id]/page.tsx` - Add Edit button and dialog
2. `app/api/tasks/[id]/route.ts` - Verify PATCH supports all fields

### Testing

- [ ] Click "Edit" on task detail
- [ ] Dialog opens with current values
- [ ] Change title and save
- [ ] Change due date and save
- [ ] Change priority and save
- [ ] Change linked asset and save
- [ ] Changes persist after page refresh

---

## Issue 4: File Upload Testing (LOW PRIORITY)

### Problem Statement

The Task 12a audit verified that upload UI exists but actual file uploads were not tested with real files.

### Solution

Manual testing only - no code changes required.

### Testing Checklist

- [ ] Test photo upload with JPEG (<5MB)
- [ ] Test photo upload with PNG (<5MB)
- [ ] Test photo upload >5MB (should fail)
- [ ] Verify photos display in asset detail
- [ ] Verify photos display in asset cards
- [ ] Test manual upload with PDF (<10MB)
- [ ] Test manual upload >10MB (should fail)
- [ ] Verify manual download link works
- [ ] Verify unsupported file types rejected

---

## Risk Assessment

| Risk                                | Likelihood | Impact | Mitigation                                |
| ----------------------------------- | ---------- | ------ | ----------------------------------------- |
| Cost field validation errors        | Medium     | Medium | Test thoroughly, handle edge cases        |
| Breaking existing task creation     | Low        | High   | Maintain backwards compatibility          |
| Edit dialog state management issues | Medium     | Low    | Use proven patterns from existing dialogs |
| API not accepting new fields        | Low        | Medium | Verify API routes first                   |

## Success Criteria

- [ ] Users can enter estimated cost when creating tasks
- [ ] Users can enter actual cost when completing tasks
- [ ] Costs display in task detail view with variance
- [ ] Cost Report reflects user-entered costs
- [ ] Users can create tasks from asset detail page
- [ ] Users can edit existing tasks
- [ ] All existing functionality unchanged

## Dependencies

- No external packages required
- All UI components available (shadcn/ui)
- Database schema already supports cost fields
- Existing API patterns can be extended

## Estimated Effort

| Issue                            | Tasks           | Effort         |
| -------------------------------- | --------------- | -------------- |
| Issue 1 (Cost Tracking)          | T001-T006, T009 | 4-6 hours      |
| Issue 2 (Create Task from Asset) | T007            | 1-1.5 hours    |
| Issue 3 (Task Edit)              | T008            | 2-3 hours      |
| Issue 4 (File Upload Testing)    | T010            | 30 minutes     |
| **Total**                        |                 | **6-10 hours** |

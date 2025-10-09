# Task 6: Task Management System

## Overview

Implement a comprehensive task management system that enables users to create, view, filter, complete, and manage both ad-hoc and template-generated maintenance tasks. This system serves as the core workflow hub where homeowners interact with their maintenance schedule on a daily basis.

## Core Objectives

1. **Task Creation**: Enable quick creation of one-off maintenance tasks with minimal friction
2. **Task Organization**: Provide powerful filtering and sorting to help users prioritize work
3. **Task Completion**: Implement one-tap completion with optional notes and photos
4. **Calendar Views**: Display tasks in multiple views (list, calendar, timeline)
5. **Status Management**: Track task states (pending, in progress, completed, overdue, cancelled)

## Technical Requirements

### Database Schema

The Task model has already been created in Task 1. This task focuses on the business logic and UI for task management.

#### Existing Task Model (Reference)

```prisma
model Task {
  id              String       @id @default(cuid())
  homeId          String
  assetId         String?
  templateId      String?
  title           String
  description     String?
  dueDate         DateTime
  priority        Priority
  status          TaskStatus   @default(PENDING)
  completedAt     DateTime?
  completedBy     String?
  completionNotes String?
  completionPhotos Json?       // Array of photo URLs
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  home            Home         @relation(fields: [homeId], references: [id], onDelete: Cascade)
  asset           Asset?       @relation(fields: [assetId], references: [id], onDelete: SetNull)
  template        MaintenanceTemplate? @relation(fields: [templateId], references: [id], onDelete: SetNull)

  @@index([homeId])
  @@index([assetId])
  @@index([status])
  @@index([dueDate])
}
```

#### Enums (Reference)

```prisma
enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  OVERDUE
  CANCELLED
}
```

### API Endpoints

#### Task Management

- `GET /api/tasks` - List tasks with filtering and pagination
  - Query params: `status`, `priority`, `assetId`, `startDate`, `endDate`, `search`, `page`, `limit`
  - Returns paginated task list with asset and template details
  - Automatically marks overdue tasks (due date < today && status === PENDING)

- `GET /api/tasks/[id]` - Get single task with full details
  - Returns task with all relations (asset, template, home)

- `POST /api/tasks` - Create new task
  - Body: `{ title, description?, dueDate, priority, assetId?, homeId }`
  - Validates user owns the home/asset
  - Returns created task

- `PUT /api/tasks/[id]` - Update task
  - Body: `{ title?, description?, dueDate?, priority?, status?, assetId? }`
  - Validates ownership
  - Returns updated task

- `DELETE /api/tasks/[id]` - Delete task
  - Soft delete by setting status to CANCELLED
  - Only allow deletion of non-template tasks or mark template tasks as cancelled

#### Task Completion

- `POST /api/tasks/[id]/complete` - Mark task as complete
  - Body: `{ completionNotes?, completionPhotos? }`
  - Sets status to COMPLETED
  - Sets completedAt to current timestamp
  - Sets completedBy to current user
  - If task is from recurring schedule, updates schedule's lastCompletedDate
  - Returns updated task

- `POST /api/tasks/[id]/start` - Mark task as in progress
  - Sets status to IN_PROGRESS
  - Returns updated task

- `POST /api/tasks/[id]/reopen` - Reopen completed/cancelled task
  - Sets status back to PENDING
  - Clears completedAt and completedBy
  - Returns updated task

#### Task Analytics

- `GET /api/tasks/stats` - Get task statistics
  - Returns: total tasks, completed count, completion rate, overdue count
  - Grouped by status and priority
  - Date range filtering support

### UI Components

#### Task List (`/components/tasks/task-list.tsx`)

```typescript
interface TaskListProps {
  filters?: {
    status?: TaskStatus[]
    priority?: Priority[]
    assetId?: string
    dateRange?: { start: Date; end: Date }
  }
  view?: 'list' | 'compact' | 'calendar'
  onTaskClick?: (taskId: string) => void
  showAsset?: boolean
  showCompleteButton?: boolean
}
```

- Displays tasks in various layouts
- Supports infinite scroll/pagination
- Shows loading skeletons
- Handles empty states
- Implements optimistic updates

#### Task Card (`/components/tasks/task-card.tsx`)

```typescript
interface TaskCardProps {
  task: Task
  variant?: 'full' | 'compact' | 'minimal'
  showActions?: boolean
  onComplete?: () => void
  onEdit?: () => void
  onDelete?: () => void
}
```

- Visual card showing task details
- Priority color coding
- Status badges
- Due date with overdue highlighting
- Quick action buttons
- Asset and template links

#### Task Filter Bar (`/components/tasks/task-filter-bar.tsx`)

```typescript
interface TaskFilterBarProps {
  filters: TaskFilters
  onFilterChange: (filters: TaskFilters) => void
  showSearch?: boolean
  showDateRange?: boolean
}
```

- Status filter chips (All, Pending, Completed, Overdue)
- Priority filter dropdown
- Asset filter dropdown
- Date range picker
- Search input
- Clear all filters button
- Active filter count badge

#### Quick Task Creation (`/components/tasks/quick-task-form.tsx`)

```typescript
interface QuickTaskFormProps {
  assetId?: string // Pre-fill asset if provided
  defaultDueDate?: Date
  onSuccess?: (task: Task) => void
  onCancel?: () => void
}
```

- Minimal form with essential fields only
- Title (required)
- Due date (defaults to tomorrow)
- Priority (defaults to MEDIUM)
- Asset selection (optional)
- Inline validation
- Auto-focus on title

#### Task Detail Drawer (`/components/tasks/task-detail-drawer.tsx`)

```typescript
interface TaskDetailDrawerProps {
  taskId: string
  open: boolean
  onClose: () => void
  onUpdate?: (task: Task) => void
}
```

- Full task details in side drawer
- Edit mode toggle
- Complete task section with notes/photo upload
- Related asset information
- Template details (if applicable)
- Task history/audit log
- Delete/cancel confirmation

#### Task Completion Modal (`/components/tasks/task-completion-modal.tsx`)

```typescript
interface TaskCompletionModalProps {
  task: Task
  open: boolean
  onClose: () => void
  onComplete: (notes?: string, photos?: string[]) => void
}
```

- Optional completion notes textarea
- Photo upload for proof of completion
- Date/time stamp display
- Success animation on completion
- Quick "Mark Complete" button (skips notes)

#### Task Calendar View (`/components/tasks/task-calendar.tsx`)

```typescript
interface TaskCalendarProps {
  tasks: Task[]
  onDateClick?: (date: Date) => void
  onTaskClick?: (task: Task) => void
  view?: 'month' | 'week'
}
```

- Monthly/weekly calendar grid
- Tasks displayed on due dates
- Color coding by priority
- Hover preview
- Click to open details
- Drag-and-drop to reschedule (future enhancement)

### Implementation Pages

#### Main Tasks Page (`/app/(protected)/tasks/page.tsx`)

- Page header with title and create task button
- Task filter bar with all filter options
- View toggle (list/calendar)
- Task list/calendar component
- Floating action button on mobile
- Loading states with skeletons
- Empty state with CTA to create first task

#### Task Detail Page (`/app/(protected)/tasks/[id]/page.tsx`)

- Full task details display
- Edit functionality
- Complete task section
- Related information (asset, template)
- Breadcrumb navigation
- Back to tasks list link

#### Dashboard Task Widget (Enhancement)

- Update existing dashboard to show task summaries
- "This Week" tasks section (next 7 days)
- "Overdue" tasks alert
- Quick complete buttons
- Link to full tasks page

### Business Logic

#### Task Creation Flow

1. User opens quick task form or full task creation page
2. Enters task details (title required, other fields optional)
3. Selects asset (optional) - validates user owns asset
4. Sets due date (defaults to tomorrow)
5. Sets priority (defaults to MEDIUM)
6. Form validates inputs
7. API creates task with homeId from user's default home
8. Task appears immediately in task list (optimistic update)
9. Success notification shows

#### Task Completion Flow

1. User clicks complete button on task card
2. Completion modal opens (optional - can skip for quick complete)
3. User optionally adds notes and/or photos
4. On confirm:
   - Task status set to COMPLETED
   - completedAt set to now
   - completedBy set to current user
   - If template task, update RecurringSchedule.lastCompletedDate
   - If recurring, next task instance may be created
5. Success animation plays
6. Task moves to completed section
7. Completion stats update

#### Overdue Task Detection

- Background job runs daily (cron)
- Identifies tasks where:
  - status === PENDING
  - dueDate < current date
- Updates status to OVERDUE
- Optionally triggers notification
- UI automatically shows overdue styling

#### Task Filtering Logic

```typescript
function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  let filtered = tasks

  // Status filter
  if (filters.status?.length) {
    filtered = filtered.filter((t) => filters.status.includes(t.status))
  }

  // Priority filter
  if (filters.priority?.length) {
    filtered = filtered.filter((t) => filters.priority.includes(t.priority))
  }

  // Asset filter
  if (filters.assetId) {
    filtered = filtered.filter((t) => t.assetId === filters.assetId)
  }

  // Date range filter
  if (filters.dateRange) {
    filtered = filtered.filter(
      (t) =>
        t.dueDate >= filters.dateRange.start &&
        t.dueDate <= filters.dateRange.end
    )
  }

  // Search filter (title and description)
  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
    )
  }

  return filtered
}
```

#### Task Sorting Logic

Default sort order:

1. Overdue tasks (by oldest due date first)
2. In-progress tasks (by due date ascending)
3. Pending tasks (by due date ascending, then priority descending)
4. Completed tasks (by completedAt descending)
5. Cancelled tasks (last)

User can override with:

- Due date (ascending/descending)
- Priority (high to low / low to high)
- Created date (newest/oldest)
- Alphabetical (A-Z / Z-A)

### State Management

#### TanStack Query Hooks

Create `/lib/hooks/use-tasks.ts`:

```typescript
// Queries
useTasks(filters) // List tasks with filters
useTask(id) // Single task
useTaskStats() // Statistics

// Mutations
useCreateTask() // Create new task
useUpdateTask() // Update task
useCompleteTask() // Mark as complete
useDeleteTask() // Delete/cancel task
useStartTask() // Mark as in progress
useReopenTask() // Reopen completed task
```

Features:

- Automatic cache invalidation after mutations
- Optimistic updates for better UX
- Background refetching
- Pagination support
- Error handling

### Performance Optimizations

1. **Pagination**: Load tasks in batches of 20
2. **Virtual Scrolling**: For long task lists (100+ items)
3. **Optimistic Updates**: Update UI before server confirms
4. **Debounced Search**: Wait 300ms after typing before filtering
5. **Cached Filters**: Store last used filters in localStorage
6. **Lazy Load Images**: Load completion photos on demand
7. **Background Sync**: Sync task updates when app comes back online

### Testing Requirements

#### Unit Tests

- Task filtering logic
- Task sorting logic
- Due date calculations
- Overdue detection
- Validation schemas

#### Integration Tests

- Task CRUD operations via API
- Task completion flow with schedule updates
- Task filtering combinations
- Photo upload functionality

#### E2E Tests

- Create one-off task
- Complete task with notes
- Filter tasks by status
- Search for tasks
- View task in calendar
- Edit task details
- Delete/cancel task

### Success Metrics

1. **Task Creation**: Users create average of 2+ tasks per week
2. **Completion Rate**: 60%+ of tasks marked complete within due date
3. **Filter Usage**: 70%+ of users use filters to organize tasks
4. **Quick Complete**: 80%+ of completions use quick complete (no notes)
5. **Mobile Usage**: 60%+ of task completions happen on mobile
6. **Time to Complete**: <3 seconds from click to completion confirmation

### Security Considerations

1. **Authorization**: Verify user owns home/asset before task operations
2. **Input Validation**: Sanitize all text inputs (title, description, notes)
3. **Photo Upload**:
   - Validate file types (jpg, png, heic only)
   - Limit file size (5MB max)
   - Scan for malware if possible
   - Store in secure bucket with signed URLs
4. **Rate Limiting**: Limit task creation to 100 per day per user
5. **SQL Injection**: Use parameterized queries (Prisma handles this)
6. **XSS Prevention**: Escape user content in UI

### Edge Cases to Handle

1. **Task with deleted asset**: Show asset as "Deleted" but keep task
2. **Recurring task deleted mid-schedule**: Mark schedule as inactive
3. **User changes timezone**: Recalculate due dates appropriately
4. **Multiple users completing same task**: Use optimistic locking
5. **Task due date in past on creation**: Warn user but allow
6. **No home associated with user**: Prompt to create home first
7. **Large completion notes**: Truncate in list view, show full in detail
8. **Photo upload failure**: Allow task completion without photo, show retry

### Migration Strategy

1. **Existing Data**: Tasks already created via templates remain unchanged
2. **Default Home**: Use user's first home as default for new tasks
3. **Bulk Operations**: Provide admin tools for bulk task management
4. **Data Export**: Allow users to export task history as CSV

### Future Enhancements (Post-MVP)

1. **Task Templates**: Users create reusable task templates
2. **Task Assignments**: Assign tasks to family members
3. **Subtasks**: Break down complex tasks into steps
4. **Task Dependencies**: Chain tasks (task B starts after task A completes)
5. **Smart Scheduling**: AI suggests optimal task scheduling
6. **Voice Input**: Create tasks via voice command
7. **Integrations**: Sync with Google Calendar, Todoist, etc.
8. **Gamification**: Points and badges for task completion
9. **Cost Tracking**: Track maintenance costs per task
10. **Service Provider Integration**: Book professionals for hard tasks
11. **Batch Operations**: Complete/edit multiple tasks at once
12. **Custom Fields**: Add user-defined fields to tasks
13. **Task Comments**: Collaborative notes on tasks
14. **File Attachments**: Attach manuals, receipts, etc.
15. **Recurring Exceptions**: Skip specific instances of recurring tasks

## Development Checklist

See accompanying `task-6-checklist.md` for detailed implementation steps and verification criteria.

## Dependencies

- Task 1: Database Schema (completed)
- Task 2: Asset Management API (completed)
- Task 3: Asset UI Pages (completed)
- Task 4: Global Navigation (completed)
- Task 5: Maintenance Templates (completed) - for template-generated tasks

## Estimated Time

- API endpoints: 4 hours
- Core UI components: 8 hours
- Task list page: 3 hours
- Task detail page: 2 hours
- Completion flow: 2 hours
- Calendar view: 4 hours
- Dashboard integration: 2 hours
- Testing and refinement: 3 hours
- **Total: 28 hours**

## Notes

- Focus on making task completion as frictionless as possible (one-tap ideal)
- Overdue tasks should be visually prominent to drive action
- Mobile experience is critical - most completions will be on-the-go
- Template-generated tasks should be clearly marked
- Provide clear visual distinction between task priorities
- Empty states should encourage task creation
- Consider accessibility (keyboard navigation, screen readers)
- Photo upload should work smoothly on mobile cameras
- Offline support would be valuable for this feature
- Task list performance is critical - optimize for 1000+ tasks per user

---

_Task prepared for: HelixIntel CMMS MVP Implementation_
_Estimated completion: 28 development hours_
_Last updated: January 2025_

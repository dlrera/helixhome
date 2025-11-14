# UI Components Inventory & Patterns

## Component Library Strategy

**Approach**: shadcn/ui (owned components, not NPM package)
**Installation**: Via CLI (`npx shadcn-ui@latest add <component>`)
**Customization**: Direct file modification encouraged
**Location**: `components/ui/`

---

## UI Components (30+)

### Base Components (shadcn/ui)

#### 1. Button (`components/ui/button.tsx`)
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, icon
- Built on: Radix UI Slot
- Usage: Everywhere

#### 2. Input (`components/ui/input.tsx`)
- Standard text input
- Built on: Native <input>
- Usage: All forms

#### 3. Textarea (`components/ui/textarea.tsx`)
- Multi-line text input
- Usage: Task notes, descriptions

#### 4. Label (`components/ui/label.tsx`)
- Form labels
- Built on: Radix UI Label
- Accessibility: Proper for/htmlFor associations

#### 5. Form (`components/ui/form.tsx`)
- React Hook Form integration
- Built on: Radix UI Label
- Usage: All forms (asset, task, schedule)

#### 6. Select (`components/ui/select.tsx`)
- Dropdown select
- Built on: Radix UI Select
- Usage: Category, status, priority pickers

#### 7. Dialog (`components/ui/dialog.tsx`)
- Modal dialogs
- Built on: Radix UI Dialog
- Usage: Confirmations, forms, detail views

#### 8. Alert Dialog (`components/ui/alert-dialog.tsx`)
- Confirmation dialogs
- Built on: Radix UI AlertDialog
- Usage: Delete confirmations

#### 9. Sheet (`components/ui/sheet.tsx`)
- Side panel/drawer
- Built on: Radix UI Dialog
- Usage: Task detail drawer, template details

#### 10. Popover (`components/ui/popover.tsx`)
- Floating popovers
- Built on: Radix UI Popover
- Usage: Date picker, dropdowns

#### 11. Dropdown Menu (`components/ui/dropdown-menu.tsx`)
- Context menus
- Built on: Radix UI DropdownMenu
- Usage: User menu, row actions

#### 12. Command (`components/ui/command.tsx`)
- Command palette
- Built on: cmdk
- Usage: Global search (Cmd+K)

#### 13. Card (`components/ui/card.tsx`)
- Container component
- Variants: CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Usage: Everywhere

#### 14. Badge (`components/ui/badge.tsx`)
- Status badges
- Variants: default, secondary, destructive, outline
- Usage: Task status, priority, categories

#### 15. Toast (`components/ui/toast.tsx`)
- Toast notifications
- Built on: Radix UI Toast
- Library: sonner
- Usage: Success/error messages

#### 16. Toaster (`components/ui/toaster.tsx`)
- Toast container
- Required in root layout

#### 17. Tabs (`components/ui/tabs.tsx`)
- Tab navigation
- Built on: Radix UI Tabs
- Usage: Asset detail page, dashboard

#### 18. Avatar (`components/ui/avatar.tsx`)
- User avatars
- Built on: Radix UI Avatar
- Fallback: Initials

#### 19. Separator (`components/ui/separator.tsx`)
- Visual divider
- Built on: Radix UI Separator

#### 20. Progress (`components/ui/progress.tsx`)
- Progress bars
- Built on: Radix UI Progress
- Usage: Budget progress

#### 21. Tooltip (`components/ui/tooltip.tsx`)
- Hover tooltips
- Built on: Radix UI Tooltip
- Usage: Icon buttons, truncated text

#### 22. Skeleton (`components/ui/skeleton.tsx`)
- Loading placeholders
- Usage: Loading states throughout app

#### 23. Scroll Area (`components/ui/scroll-area.tsx`)
- Custom scrollbar
- Built on: Radix UI ScrollArea
- Usage: Long lists

#### 24. Calendar (`components/ui/calendar.tsx`)
- Date picker calendar
- Built on: react-day-picker
- Usage: Date selection in forms

#### 25. Table (`components/ui/table.tsx`)
- Data tables
- Components: Table, TableHeader, TableBody, TableRow, TableHead, TableCell
- Usage: Cost reports

#### 26. Alert (`components/ui/alert.tsx`)
- Alert messages
- Variants: default, destructive
- Usage: Warnings, errors

#### 27. Toggle (`components/ui/toggle.tsx`)
- Toggle buttons
- Built on: Radix UI Toggle
- Usage: View switchers

#### 28. Toggle Group (`components/ui/toggle-group.tsx`)
- Toggle button groups
- Built on: Radix UI ToggleGroup
- Usage: Filter buttons

#### 29. Navigation Menu (`components/ui/navigation-menu.tsx`)
- Navigation components
- Built on: Radix UI NavigationMenu
- Usage: Top navigation

#### 30. Breadcrumb (`components/ui/breadcrumb.tsx`)
- Breadcrumb navigation
- Usage: Page headers

---

## Custom Components

### Layout Components (`components/layout/`)

#### App Layout (`app-layout.tsx`)
**Purpose**: Main application shell
**Features**:
- Responsive sidebar
- Top bar with user menu
- Main content area
- Mobile bottom navigation
- Breadcrumb support
**Used In**: All protected pages

#### Sidebar (`sidebar.tsx`)
**Purpose**: Main navigation sidebar
**Features**:
- Collapsible (desktop)
- Bottom navigation (mobile)
- Active route highlighting
- Sub-menu support (Dashboard)
- Logo and branding
**State Management**: `lib/hooks/use-sidebar-state.ts`

#### Top Bar (`top-bar.tsx`)
**Purpose**: Header bar
**Features**:
- Search trigger (Cmd+K)
- User dropdown
- Mobile menu toggle
- Notification badge (future)

#### User Dropdown (`user-dropdown.tsx`)
**Purpose**: User account menu
**Features**:
- Profile link
- Settings link (disabled)
- Sign out
- Avatar display

#### Command Palette (`command-palette.tsx`)
**Purpose**: Quick navigation and search
**Features**:
- Global search (Cmd+K)
- Page navigation
- Quick actions
- Recent searches
**Built On**: cmdk library

#### Floating Action Button (`floating-action-button.tsx`)
**Purpose**: Mobile quick actions
**Features**:
- Fixed position FAB
- Quick task creation
**Display**: Mobile only

---

### Asset Components (`components/assets/`)

#### Asset List (`asset-list.tsx`)
**Purpose**: Display asset grid/list
**Features**:
- Grid layout (responsive)
- Empty state
- Loading state
**Used In**: `/assets` page

#### Asset Card (`asset-card.tsx`)
**Purpose**: Individual asset card
**Features**:
- Asset photo
- Name, category, model
- Action buttons
- Warranty badge
**Optimized**: React.memo

#### Asset Form (`asset-form.tsx`)
**Purpose**: Create/edit asset form
**Features**:
- All asset fields
- Photo upload
- Category select
- Date pickers
- Validation via Zod
**Used In**: `/assets/new`, `/assets/[id]/edit`

#### Asset Detail (`asset-detail.tsx`)
**Purpose**: Asset detail view with tabs
**Features**:
- Overview tab (details)
- Tasks tab (related tasks)
- Schedules tab (recurring schedules)
- Template application
- Edit/delete actions
**Used In**: `/assets/[id]`

#### Asset Filters (`asset-filters.tsx`)
**Purpose**: Search and filter controls
**Features**:
- Search input
- Category filter
- Clear filters
**Used In**: `/assets` page

#### Photo Upload Dialog (`photo-upload-dialog.tsx`)
**Purpose**: Photo upload modal
**Features**:
- File input
- Image preview
- Base64 conversion
- Crop/resize (future)

#### Delete Asset Dialog (`delete-asset-dialog.tsx`)
**Purpose**: Delete confirmation
**Features**:
- Warning message
- Cascade information
- Confirm/cancel

#### Apply Template to Asset (`apply-template-to-asset.tsx`)
**Purpose**: Template application workflow
**Features**:
- Template browser
- Frequency selection
- Next due date picker
- Creates recurring schedule
**Used In**: Asset detail page

---

### Task Components (`components/tasks/`)

#### Task List (`task-list.tsx`)
**Purpose**: Display task list
**Features**:
- Filterable list
- Group by status
- Empty state
- Loading state
**Used In**: `/tasks` page

#### Task Card (`task-card.tsx`)
**Purpose**: Individual task card
**Features**:
- Task title, description
- Due date with formatting
- Status badge
- Priority badge
- Asset link
- Quick actions
**Optimized**: React.memo

#### Task Detail Drawer (`task-detail-drawer.tsx`)
**Purpose**: Task detail sidebar
**Features**:
- Full task details
- Complete task button
- Edit/delete actions
- Asset/template links
- Cost information
**Used In**: Task list pages

#### Task Completion Modal (`task-completion-modal.tsx`)
**Purpose**: Task completion workflow
**Features**:
- Completion notes
- Photo upload (optional based on user preference)
- Actual cost entry
- Cost notes
**Used In**: Task detail views

#### Quick Task Form (`quick-task-form.tsx`)
**Purpose**: Rapid task creation
**Features**:
- Minimal fields (title, due date, priority)
- Asset selector
- Template link (optional)
**Used In**: Command palette, FAB

#### Task Filter Bar (`task-filter-bar.tsx`)
**Purpose**: Task filtering controls
**Features**:
- Status filter
- Priority filter
- Asset filter
- Date range picker
- Search
**Used In**: `/tasks` page

#### Task Calendar (`task-calendar.tsx`)
**Purpose**: Calendar view of tasks
**Features**:
- Month navigation
- Task count per day
- Status indicators
- Click to view tasks
**Used In**: `/tasks/calendar` page

**Client Component**: `app/(protected)/tasks/calendar/task-calendar-client.tsx`

---

### Template Components (`components/templates/`)

#### Template Browser (`template-browser.tsx`)
**Purpose**: Browse maintenance templates
**Features**:
- Grid layout
- Category filter
- Search
- Template cards
- Apply template action
**Used In**: `/templates` page

#### Template Details Drawer (`template-details-drawer.tsx`)
**Purpose**: Template detail sidebar
**Features**:
- Full description
- Instructions (step-by-step)
- Required tools
- Safety precautions
- Difficulty badge
- Estimated duration
- Apply to asset button
**Optimized**: Dynamic import (code splitting)

#### Apply Template Modal (`apply-template-modal.tsx`)
**Purpose**: Template application modal
**Features**:
- Asset selector
- Frequency selection
- Next due date
- Creates schedule
**Optimized**: Dynamic import (code splitting)

#### Template Skeleton (`template-skeleton.tsx`)
**Purpose**: Loading skeleton
**Used In**: Template pages during load

---

### Schedule Components (`components/schedules/`)

#### Schedule List (`schedule-list.tsx`)
**Purpose**: Display recurring schedules
**Features**:
- Schedule cards
- Grouped by asset
- Empty state
**Used In**: Asset detail page

#### Schedule Card (`schedule-card.tsx`)
**Purpose**: Individual schedule card
**Features**:
- Template name
- Frequency display
- Next due date
- Last completed date
- Active/inactive toggle
- Edit/delete actions
**Optimized**: React.memo

#### Edit Frequency Modal (`edit-frequency-modal.tsx`)
**Purpose**: Edit schedule frequency
**Features**:
- Frequency picker
- Custom days input (for CUSTOM)
- Next due date adjustment
**Used In**: Schedule cards

---

### Dashboard Components (`components/dashboard/`)

#### Analytics Chart (`analytics-chart.tsx`)
**Purpose**: Analytics visualizations
**Features**:
- Completion trend line chart
- Category breakdown pie chart
- Priority distribution bar chart
**Built On**: Recharts
**Optimized**: React.memo, useCallback

#### Analytics Charts Lazy (`analytics-charts-lazy.tsx`)
**Purpose**: Lazy-loaded chart components
**Features**:
- Dynamic import for Recharts
- Reduces initial bundle size
- Loading skeleton
**Performance**: Code splitting for ~2MB Recharts library

#### Activity Timeline (`activity-timeline.tsx`)
**Purpose**: Recent activity feed
**Features**:
- Chronological list
- Activity type icons
- Entity links
- Infinite scroll (future)
- Pagination
**Optimized**: React.memo

#### Maintenance Calendar Widget (`maintenance-calendar-widget.tsx`)
**Purpose**: Monthly calendar with task distribution
**Features**:
- Month navigation
- Task count badges
- Status indicators
- Click to view day details
**Optimized**: React.memo, useMemo for date calculations

#### Cost Summary (`cost-summary.tsx`)
**Purpose**: Budget and cost tracking
**Features**:
- Total spent
- Budget progress bar
- Category breakdown chart
- Month-over-month comparison
**Built On**: Recharts
**Optimized**: React.memo

#### Maintenance Insights (`maintenance-insights.tsx`)
**Purpose**: AI-generated recommendations
**Features**:
- Insight cards
- Priority badges
- Action buttons
**Current**: Mock data
**Future**: Real AI insights via Claude API

#### Upcoming Maintenance (`upcoming-maintenance.tsx`)
**Purpose**: Next tasks widget
**Features**:
- Next 5-10 upcoming tasks
- Quick complete action
- Link to full task list

#### Widget Container (`widget-container.tsx`)
**Purpose**: Wrapper for dashboard widgets
**Features**:
- Title and description
- Loading state
- Error boundary (future)
- Consistent styling

#### Dashboard Skeleton (`dashboard-skeleton.tsx`)
**Purpose**: Loading state for dashboard
**Features**:
- Skeleton cards matching layout
- Shimmer animation

#### Dashboard Settings Form (`dashboard-settings-form.tsx`)
**Purpose**: Dashboard preferences
**Features**:
- Budget amount
- Budget start date
- Completion photo requirement toggle
**Used In**: `/dashboard/settings`

#### Cost Report View (`cost-report-view.tsx`)
**Purpose**: Detailed cost analysis
**Features**:
- Summary cards
- Spending charts
- Category breakdown table
- Date range filter
- Export options (future)
**Used In**: `/dashboard/costs`

---

### Special Components

#### Helix Loader (`components/ui/helix-loader.tsx`)
**Purpose**: Branded loading spinner
**Features**:
- Custom HelixIntel loader
- Brand colors
- Used in loading.tsx files

#### Keyboard Shortcuts Dialog (`components/ui/keyboard-shortcuts-dialog.tsx`)
**Purpose**: Show available shortcuts
**Features**:
- Keyboard shortcut list
- Grouped by category
- Trigger: Cmd+/ or Help menu

#### Sign Out Button (`components/sign-out-button.tsx`)
**Purpose**: Sign out functionality
**Features**:
- NextAuth.js signOut
- Redirect to signin

---

## Component Patterns & Best Practices

### 1. Performance Optimizations

**React.memo Usage**:
All dashboard widgets and large list item components use React.memo:
- `AnalyticsChart`
- `ActivityTimeline`
- `MaintenanceCalendarWidget`
- `CostSummary`
- `AssetCard`
- `TaskCard`
- `ScheduleCard`

**useCallback for Event Handlers**:
Prevents unnecessary re-renders:
```tsx
const handleComplete = useCallback((taskId: string) => {
  // ...
}, [dependencies])
```

**useMemo for Expensive Computations**:
```tsx
const sortedTasks = useMemo(() =>
  tasks.sort((a, b) => ...),
  [tasks]
)
```

**Code Splitting**:
- Dashboard charts dynamically imported
- Template modals lazy-loaded
- Reduces initial bundle size

---

### 2. Loading States

**Skeleton Screens**:
Every list/page has loading skeletons:
- `DashboardSkeleton`
- `TemplateSkeleton`
- Asset/Task/Schedule loading states

**Progressive Loading**:
- Show UI shell immediately
- Load data asynchronously
- Display skeletons during load

---

### 3. Empty States

All lists handle empty states gracefully:
```tsx
{items.length === 0 && (
  <EmptyState
    title="No items found"
    description="..."
    action={<Button>Create</Button>}
  />
)}
```

---

### 4. Error Handling

**Toast Notifications**:
All mutations show success/error toasts via sonner:
```tsx
toast.success("Task created successfully")
toast.error("Failed to create task")
```

**Error Boundaries**:
Future improvement - wrap widgets in error boundaries

---

### 5. Accessibility

**WCAG 2.1 AA Compliance**:
- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Semantic HTML
- ✅ Focus management
- ✅ Color contrast (4.5:1 min)
- ✅ Screen reader support

**Documented In**: `docs/ACCESSIBILITY.md`

---

### 6. Responsive Design

**Mobile-First Approach**:
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Sidebar → Bottom nav on mobile
- Grid → Stack on mobile
- Touch-friendly targets (44x44px min)

**Testing**: Playwright tests include mobile viewport (375px)

---

### 7. Form Handling

**Pattern**:
```tsx
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... }
})

const onSubmit = async (data) => {
  try {
    await mutation.mutateAsync(data)
    toast.success("Saved")
  } catch (error) {
    toast.error("Failed")
  }
}

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    ...
  </form>
</Form>
```

**Validation**: Zod schemas in `lib/validation/`

---

### 8. Date Handling

**Library**: date-fns

**Common Functions**:
- `format(date, 'PPP')` - Pretty date
- `formatDistanceToNow(date)` - Relative time
- `isAfter`, `isBefore` - Comparisons
- `addDays`, `addMonths` - Calculations

**Memoized Formatters**:
```tsx
const formattedDate = useMemo(() =>
  format(date, 'PPP'),
  [date]
)
```

---

### 9. Currency Formatting

**Library**: numeral

**Usage**:
```tsx
import numeral from 'numeral'
numeral(450.75).format('$0,0.00') // "$450.75"
```

---

### 10. State Management

**TanStack Query Hooks**:
Custom hooks in `lib/hooks/`:
- `use-tasks.ts` - Task CRUD operations
- `use-templates.ts` - Template operations
- `use-schedules.ts` - Schedule operations
- `use-dashboard.ts` - Dashboard data

**Pattern**:
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['tasks'],
  queryFn: fetchTasks,
  staleTime: 5 * 60 * 1000 // 5 min
})

const mutation = useMutation({
  mutationFn: createTask,
  onSuccess: () => {
    queryClient.invalidateQueries(['tasks'])
    toast.success("Created")
  }
})
```

---

## Component Quality Assessment

**Strengths** ⭐⭐⭐⭐⭐:
- Comprehensive component library
- Consistent patterns
- Performance optimized
- Accessible
- Responsive
- Well-organized

**Areas for Improvement** ⚠️:
- Error boundaries not implemented
- Some components could be further split
- Testing coverage (E2E exists, unit tests limited)
- Storybook/component documentation

---

## Component Reusability Score

**Highly Reusable** (Used 5+ places):
- Button, Input, Label, Form
- Card, Badge
- Dialog, Sheet
- Toast notifications

**Moderately Reusable** (Used 2-4 places):
- Asset/Task/Schedule cards
- Filter bars
- List components

**Single-Use** (Page-specific):
- Dashboard widgets
- Specific forms
- Page layouts

**Recommendation**: Extract common patterns into shared components (e.g., EntityCard, FilterBar, EmptyState)

---

## Component Testing

**E2E Tests** (Playwright):
- Dashboard: 26 test cases
- Templates: Covered in e2e/templates.spec.ts
- Homepage: e2e/homepage.spec.ts
- Tasks: tests/tasks.spec.ts

**Unit Tests**: Limited coverage
**Recommendation**: Add Vitest for component unit tests

---

## Summary

The component architecture is **production-ready** with:
- ✅ 70+ components (30 base, 40+ feature)
- ✅ Consistent patterns
- ✅ Performance optimizations
- ✅ Accessibility compliance
- ✅ Mobile responsiveness

**Next Steps**:
1. Add error boundaries
2. Implement component unit tests
3. Create Storybook documentation
4. Extract common patterns into shared components

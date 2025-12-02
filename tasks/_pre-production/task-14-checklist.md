# Task 13 Implementation Checklist: UX Polish & Production Readiness

## Phase 1: Error Boundaries Implementation

### 1.1 Create Error Boundary Component

- [ ] Create error boundary file
  - [ ] Create `components/error-boundary.tsx`
  - [ ] Import React Component class
  - [ ] Add Props interface (children, fallback)
  - [ ] Add State interface (hasError, error)

- [ ] Implement error handling methods
  - [ ] Add constructor with initial state
  - [ ] Implement `getDerivedStateFromError()`
  - [ ] Implement `componentDidCatch()`
  - [ ] Add console.error logging
  - [ ] Optional: Add Sentry integration

- [ ] Create fallback UI
  - [ ] Add AlertTriangle icon from lucide-react
  - [ ] Create centered error message layout
  - [ ] Add "Something went wrong" heading
  - [ ] Add descriptive error message
  - [ ] Add "Try again" button that resets state
  - [ ] Style with HelixIntel colors

- [ ] Test error boundary component
  - [ ] Create test component that throws error
  - [ ] Wrap in ErrorBoundary
  - [ ] Verify fallback UI appears
  - [ ] Test "Try again" button
  - [ ] Verify error logged to console

### 1.2 Wrap Critical Components

- [ ] Identify components to wrap
  - [ ] List all dashboard widgets
  - [ ] List all data tables
  - [ ] List all chart components
  - [ ] List all forms
  - [ ] Prioritize by criticality

- [ ] Wrap dashboard components
  - [ ] Wrap AnalyticsChart component
  - [ ] Wrap CostSummary component
  - [ ] Wrap MaintenanceCalendarWidget
  - [ ] Wrap ActivityTimeline component
  - [ ] Wrap MaintenanceInsights component
  - [ ] Test each wrapped component

- [ ] Wrap data tables
  - [ ] Wrap AssetTable component
  - [ ] Wrap TaskTable component
  - [ ] Test table error handling

- [ ] Wrap chart components
  - [ ] Wrap individual Recharts instances
  - [ ] Or wrap parent chart containers
  - [ ] Test chart error scenarios

- [ ] Wrap forms
  - [ ] Wrap AssetForm (create/edit)
  - [ ] Wrap TaskForm
  - [ ] Test form error handling

### 1.3 Test Error Scenarios

- [ ] Test component errors
  - [ ] Force error in dashboard widget
  - [ ] Verify error boundary catches it
  - [ ] Verify page doesn't crash
  - [ ] Verify other widgets still work
  - [ ] Test "Try again" functionality

- [ ] Test API errors
  - [ ] Mock API to return 500 error
  - [ ] Verify error boundary catches component failure
  - [ ] Check error message is user-friendly
  - [ ] Verify error logged

- [ ] Test chart errors
  - [ ] Pass invalid data to chart
  - [ ] Verify error boundary handles it
  - [ ] Check fallback UI appears

## Phase 2: Breadcrumb Navigation

### 2.1 Create Breadcrumb Component

- [ ] Create breadcrumb component file
  - [ ] Create `components/ui/breadcrumb.tsx`
  - [ ] Import Link from next/link
  - [ ] Import ChevronRight from lucide-react

- [ ] Define interfaces
  - [ ] Define BreadcrumbItem interface (label, href?)
  - [ ] Define BreadcrumbProps interface (items array)

- [ ] Implement component
  - [ ] Create nav element with aria-label="Breadcrumb"
  - [ ] Create ordered list (ol)
  - [ ] Map over items
  - [ ] Add ChevronRight separator between items
  - [ ] Render Link for items with href
  - [ ] Render span for last item (no link)
  - [ ] Style with muted colors
  - [ ] Add hover states

- [ ] Test breadcrumb component
  - [ ] Create example usage
  - [ ] Verify visual appearance
  - [ ] Test link navigation
  - [ ] Test on mobile (touch targets)
  - [ ] Verify accessibility with screen reader

### 2.2 Add Breadcrumbs to Pages

- [ ] Add to Asset Detail page
  - [ ] Open `app/assets/[id]/page.tsx`
  - [ ] Import Breadcrumb component
  - [ ] Add breadcrumb above main content
  - [ ] Items: Dashboard → Assets → [Asset Name]
  - [ ] Test navigation works

- [ ] Add to Task Detail page (if separate page)
  - [ ] Open task detail page
  - [ ] Add breadcrumb
  - [ ] Items: Dashboard → Tasks → [Task Name]
  - [ ] Test navigation

- [ ] Add to Dashboard sub-pages
  - [ ] Dashboard/Costs: Dashboard → Cost Report
  - [ ] Dashboard/Settings: Dashboard → Settings
  - [ ] Test navigation

- [ ] Add to other detail pages (if any)
  - [ ] Template detail (if exists)
  - [ ] Other detail pages
  - [ ] Test all breadcrumbs

### 2.3 Test Breadcrumb Navigation

- [ ] Test link navigation
  - [ ] Click each breadcrumb link
  - [ ] Verify navigation works
  - [ ] Test back button after navigation
  - [ ] Verify URL updates correctly

- [ ] Test visual design
  - [ ] Check separators appear correctly
  - [ ] Verify colors (muted for links, bold for current)
  - [ ] Test hover states
  - [ ] Check spacing and alignment

- [ ] Test on mobile
  - [ ] Verify breadcrumbs display correctly at 375px
  - [ ] Check touch targets adequate (44x44px)
  - [ ] Test that breadcrumbs don't overflow
  - [ ] Verify wrapping if needed

- [ ] Test accessibility
  - [ ] Verify aria-label on nav element
  - [ ] Test with screen reader
  - [ ] Check keyboard navigation (Tab)
  - [ ] Verify semantic HTML (nav, ol, li)

## Phase 3: Toast Notifications Testing

### 3.1 Verify Toaster Setup

- [ ] Check Toaster in layout
  - [ ] Open `app/layout.tsx`
  - [ ] Verify `import { Toaster } from 'sonner'`
  - [ ] Verify `<Toaster />` in body
  - [ ] Check Toaster configuration (position, theme)

- [ ] Test basic toast
  - [ ] Add test button: `toast('Hello')`
  - [ ] Verify toast appears
  - [ ] Check toast dismisses after 4s
  - [ ] Verify toast is styled correctly

### 3.2 Add Toasts to Actions

- [ ] Asset CRUD toasts
  - [ ] Asset created: `toast.success('Asset created successfully!')`
  - [ ] Asset updated: `toast.success('Asset updated!')`
  - [ ] Asset deleted: `toast.success('Asset deleted')`
  - [ ] Asset creation error: `toast.error('Failed to create asset')`

- [ ] Task CRUD toasts
  - [ ] Task created: `toast.success('Task created!')`
  - [ ] Task completed: `toast.success('Task completed!')`
  - [ ] Task updated: `toast.success('Task updated!')`
  - [ ] Task deleted: `toast.success('Task deleted')`
  - [ ] Task error: `toast.error('Failed to save task')`

- [ ] Template toasts
  - [ ] Template applied: `toast.success('Template applied!')`
  - [ ] Template error: `toast.error('Failed to apply template')`

- [ ] Settings toasts
  - [ ] Settings saved: `toast.success('Settings saved!')`
  - [ ] Budget updated: `toast.success('Budget updated!')`
  - [ ] Settings error: `toast.error('Failed to save settings')`

- [ ] Form validation toasts
  - [ ] Consider: Show validation errors as toast
  - [ ] Or keep inline error messages
  - [ ] Decision: ******\_\_\_******

### 3.3 Test Toast Behavior

- [ ] Test success toasts
  - [ ] Create asset → toast appears
  - [ ] Update asset → toast appears
  - [ ] Delete asset → toast appears
  - [ ] Complete task → toast appears
  - [ ] Verify all success toasts work

- [ ] Test error toasts
  - [ ] Trigger API error
  - [ ] Verify error toast appears
  - [ ] Check error message is user-friendly
  - [ ] Verify error details not exposed

- [ ] Test toast duration
  - [ ] Verify default duration ~4 seconds
  - [ ] Test manual dismiss (click X)
  - [ ] Test auto-dismiss

- [ ] Test multiple toasts
  - [ ] Trigger multiple toasts rapidly
  - [ ] Verify they stack correctly
  - [ ] Check all are visible
  - [ ] Verify they dismiss in order

- [ ] Test toast accessibility
  - [ ] Test with screen reader
  - [ ] Verify toast content is announced
  - [ ] Check aria-live region works
  - [ ] Verify keyboard dismissable

## Phase 4: Empty States Implementation

### 4.1 Create Empty State Component

- [ ] Create empty state component file
  - [ ] Create `components/ui/empty-state.tsx`
  - [ ] Import icons from lucide-react
  - [ ] Import Button component

- [ ] Define interfaces
  - [ ] Define EmptyStateProps (icon?, title, description, action?)
  - [ ] Define action interface (label, onClick)

- [ ] Implement component
  - [ ] Create centered container
  - [ ] Add icon (default FileQuestion)
  - [ ] Add title (h3)
  - [ ] Add description (p)
  - [ ] Add action button (optional)
  - [ ] Style with muted colors
  - [ ] Add adequate spacing

- [ ] Test empty state component
  - [ ] Create example usage
  - [ ] Verify visual appearance
  - [ ] Test button click
  - [ ] Test without button
  - [ ] Test with custom icon

### 4.2 Add Empty States to Pages

- [ ] Add to Assets list page
  - [ ] Open `app/assets/page.tsx`
  - [ ] Check if `assets.length === 0`
  - [ ] Render EmptyState component
  - [ ] Icon: Package
  - [ ] Title: "No assets yet"
  - [ ] Description: "Start by adding your first home asset..."
  - [ ] Action: "Add Asset" → navigate to /assets/create

- [ ] Add to Tasks list page
  - [ ] Open `app/tasks/page.tsx`
  - [ ] Check if `tasks.length === 0`
  - [ ] Render EmptyState
  - [ ] Icon: CheckSquare
  - [ ] Title: "No tasks"
  - [ ] Description: "You're all caught up!"
  - [ ] Action: "Browse Templates"

- [ ] Add to Dashboard (optional)
  - [ ] If no data at all
  - [ ] Show helpful empty state
  - [ ] Guide user to add first asset

- [ ] Add to Activity Timeline
  - [ ] If no activities
  - [ ] Icon: Activity
  - [ ] Title: "No activity yet"
  - [ ] Description: "Activity will appear as you use the app"

- [ ] Add to Templates (unlikely)
  - [ ] Only if templates can be empty
  - [ ] Otherwise skip

### 4.3 Test Empty States

- [ ] Test with fresh database
  - [ ] Create new user or reset database
  - [ ] Login
  - [ ] Visit assets page
  - [ ] Verify empty state appears
  - [ ] Click CTA button
  - [ ] Verify navigation works

- [ ] Test tasks empty state
  - [ ] Delete all tasks (if any)
  - [ ] Visit tasks page
  - [ ] Verify empty state
  - [ ] Test CTA button

- [ ] Test activity empty state
  - [ ] Visit dashboard with no activity
  - [ ] Verify empty state in timeline
  - [ ] Check helpful message

- [ ] Test visual design
  - [ ] Verify icons display correctly
  - [ ] Check text is readable (not too faint)
  - [ ] Verify button is prominent
  - [ ] Test on mobile (adequate sizing)

## Phase 5: Loading States Verification

### 5.1 Verify Existing Skeletons

- [ ] Check dashboard skeletons
  - [ ] Load dashboard
  - [ ] Verify stat cards have skeleton
  - [ ] Check chart widgets have skeleton
  - [ ] Verify calendar has skeleton
  - [ ] Check activity timeline has skeleton

- [ ] Check data table skeletons
  - [ ] Load assets page
  - [ ] Verify table skeleton appears
  - [ ] Load tasks page
  - [ ] Verify table skeleton

- [ ] Check form skeletons
  - [ ] Load asset create page
  - [ ] Check if form has loading state
  - [ ] Or if loads instantly (may be fine)

### 5.2 Add Missing Skeletons

- [ ] Create breadcrumb skeleton (if needed)
  - [ ] Create BreadcrumbSkeleton component
  - [ ] Match breadcrumb layout
  - [ ] Use shimmer animation

- [ ] Check modal/drawer skeletons
  - [ ] Verify modals have loading states
  - [ ] Check drawers have skeletons
  - [ ] Add if missing

- [ ] Create empty state skeleton (unlikely)
  - [ ] Only if empty states lazy loaded
  - [ ] Otherwise skip

### 5.3 Test with Network Throttling

- [ ] Test dashboard loading
  - [ ] Open Chrome DevTools
  - [ ] Network tab → Throttling: Slow 3G
  - [ ] Navigate to dashboard
  - [ ] Verify skeletons appear immediately
  - [ ] Check smooth transition to content
  - [ ] Measure: No layout shift (CLS)

- [ ] Test assets page loading
  - [ ] Keep Slow 3G throttling
  - [ ] Navigate to assets
  - [ ] Verify table skeleton
  - [ ] Check smooth loading

- [ ] Test tasks page loading
  - [ ] Navigate to tasks with throttling
  - [ ] Verify loading state
  - [ ] Check smooth transition

- [ ] Test forms loading
  - [ ] Load asset create form
  - [ ] Verify no jarring layout shifts
  - [ ] Check form renders smoothly

- [ ] Measure perceived performance
  - [ ] Time to skeleton: Should be <100ms
  - [ ] Skeleton to content: Acceptable if shows progress
  - [ ] Overall perceived speed: Better than blank screen

## Phase 6: E2E Test Expansion

### 6.1 Add Error Boundary Tests

- [ ] Create error boundary test file
  - [ ] Add to existing test file or create new
  - [ ] Import necessary utilities

- [ ] Test dashboard widget error

  ```typescript
  test('Shows error boundary on widget failure', async ({ page }) => {
    // Mock API error
    await page.route('**/api/dashboard/analytics', (route) =>
      route.fulfill({ status: 500, body: 'Error' })
    )
    await page.goto('/dashboard')
    // Check error boundary appears
    await expect(page.getByText('Something went wrong')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  })
  ```

- [ ] Test "Try again" button
  - [ ] Click "Try again"
  - [ ] Verify component reloads
  - [ ] Check error cleared

- [ ] Test error doesn't crash page
  - [ ] Force widget error
  - [ ] Verify other widgets still work
  - [ ] Check overall page functional

### 6.2 Add Empty State Tests

- [ ] Test assets empty state

  ```typescript
  test('Shows empty state when no assets', async ({ page }) => {
    // Use fresh user or mock empty response
    await page.goto('/assets')
    await expect(page.getByText('No assets yet')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add Asset' })).toBeVisible()
  })
  ```

- [ ] Test tasks empty state
  - [ ] Navigate to tasks with no data
  - [ ] Verify empty state appears
  - [ ] Test CTA button

- [ ] Test empty state CTAs
  - [ ] Click "Add Asset" button
  - [ ] Verify navigation to create page
  - [ ] Test other CTA buttons

### 6.3 Add Toast Notification Tests

- [ ] Test success toast on asset creation

  ```typescript
  test('Shows success toast on asset creation', async ({ page }) => {
    await page.goto('/assets/create')
    await page.fill('[name="name"]', 'Test Asset')
    await page.selectOption('[name="category"]', 'APPLIANCE')
    await page.click('button[type="submit"]')
    await expect(page.getByText('Asset created successfully!')).toBeVisible({
      timeout: 5000,
    })
  })
  ```

- [ ] Test success toast on task completion
  - [ ] Navigate to task
  - [ ] Complete task
  - [ ] Verify toast appears

- [ ] Test error toast (optional)
  - [ ] Trigger error condition
  - [ ] Verify error toast
  - [ ] Check message is helpful

- [ ] Test toast dismissal
  - [ ] Wait for auto-dismiss
  - [ ] Or manually dismiss
  - [ ] Verify toast disappears

### 6.4 Add Breadcrumb Tests

- [ ] Test breadcrumb on asset detail

  ```typescript
  test('Breadcrumb navigation on asset detail', async ({ page }) => {
    await page.goto('/assets/1')
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(breadcrumb).toBeVisible()
    await expect(breadcrumb.getByText('Dashboard')).toBeVisible()
    await expect(breadcrumb.getByText('Assets')).toBeVisible()
  })
  ```

- [ ] Test breadcrumb navigation
  - [ ] Click "Assets" link in breadcrumb
  - [ ] Verify navigates to /assets
  - [ ] Click "Dashboard" link
  - [ ] Verify navigates to /dashboard

- [ ] Test breadcrumb on task detail
  - [ ] Similar test for task page
  - [ ] Verify breadcrumb works

### 6.5 Add Full User Flow Tests

- [ ] Test complete onboarding flow

  ```typescript
  test('Complete user onboarding', async ({ page }) => {
    // 1. Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // 2. Create first asset
    await page.goto('/assets/create')
    await page.fill('[name="name"]', 'HVAC System')
    await page.selectOption('[name="category"]', 'HVAC')
    await page.click('button[type="submit"]')
    await expect(page.getByText('Asset created successfully!')).toBeVisible()

    // 3. Apply template
    await page.goto('/templates')
    await page.getByText('HVAC Maintenance').click()
    await page.getByRole('button', { name: 'Apply Template' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(page.getByText('Template applied!')).toBeVisible()

    // 4. Verify task created
    await page.goto('/tasks')
    await expect(page.getByText('Change HVAC filter')).toBeVisible()
  })
  ```

- [ ] Test maintenance workflow
  - [ ] Create asset
  - [ ] Apply template
  - [ ] Complete task
  - [ ] Verify dashboard updated

- [ ] Test deletion workflow
  - [ ] Create asset
  - [ ] Delete asset
  - [ ] Verify confirmation dialog
  - [ ] Verify deleted

### 6.6 Run All E2E Tests

- [ ] Run full test suite
  - [ ] Execute: `pnpm test`
  - [ ] Note total tests run
  - [ ] Note pass count
  - [ ] Note fail count
  - [ ] Calculate pass rate: \_\_\_\_%

- [ ] Review failures
  - [ ] List all failing tests
  - [ ] Categorize by reason
  - [ ] Prioritize fixes

- [ ] Fix failing tests
  - [ ] Fix test code issues
  - [ ] Fix application bugs
  - [ ] Update assertions if needed
  - [ ] Re-run until passing

- [ ] Verify target met
  - [ ] Target: 250+ tests
  - [ ] Actual: \_\_\_\_ tests
  - [ ] Target: 85%+ pass rate
  - [ ] Actual: \_\_\_\_% pass rate
  - [ ] If not met, add more tests or fix failures

## Phase 7: Visual Regression Testing

### 7.1 Choose Visual Regression Tool

- [ ] Decide on tool
  - [ ] Option A: Playwright screenshots (free, built-in)
  - [ ] Option B: Percy (cloud-based, $$$)
  - [ ] Option C: Chromatic (Storybook integration, $$$)
  - [ ] Decision: ******\_\_\_******

### 7.2 Setup Playwright Screenshots (if chosen)

- [ ] Create visual regression test file
  - [ ] Create `tests/e2e/visual-regression.spec.ts`
  - [ ] Import test utilities

- [ ] Configure screenshot options
  - [ ] Set `maxDiffPixels` threshold
  - [ ] Configure full page or viewport
  - [ ] Set animation handling

- [ ] Add screenshot tests for key pages

  ```typescript
  test('Dashboard visual regression', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })
  ```

- [ ] Add screenshots for all major pages
  - [ ] Dashboard
  - [ ] Assets list
  - [ ] Asset detail
  - [ ] Asset create
  - [ ] Tasks list
  - [ ] Templates
  - [ ] Login

### 7.3 Capture Baseline Screenshots

- [ ] Run visual regression tests first time
  - [ ] Execute: `pnpm test tests/e2e/visual-regression.spec.ts`
  - [ ] This will generate baseline screenshots
  - [ ] Screenshots saved in test results folder
  - [ ] Review baselines visually

- [ ] Commit baselines to git
  - [ ] Add screenshots to git
  - [ ] Commit with message: "Add visual regression baselines"
  - [ ] Future runs will compare against these

### 7.4 Test Visual Regression Detection

- [ ] Make intentional visual change
  - [ ] Change button color
  - [ ] Or change spacing
  - [ ] Small visible change

- [ ] Run visual regression tests
  - [ ] Execute tests
  - [ ] Tests should fail (change detected)
  - [ ] Review diff images
  - [ ] Verify change is visible in diff

- [ ] Revert change
  - [ ] Undo visual change
  - [ ] Re-run tests
  - [ ] Tests should pass

- [ ] Document process
  - [ ] How to run visual regression tests
  - [ ] How to update baselines
  - [ ] When to review diffs

## Phase 8: Interactive Patterns Documentation

### 8.1 Create Pattern Library Document

- [ ] Create documentation file
  - [ ] Create `docs/INTERACTIVE-PATTERNS.md`
  - [ ] Or add section to existing docs
  - [ ] Use markdown format

### 8.2 Document Modal Pattern

- [ ] Document modal usage
  - [ ] When to use modals
  - [ ] Behavior: Focus trap, Escape closes, overlay dismisses
  - [ ] Example: Asset deletion confirmation
  - [ ] Code example
  - [ ] Screenshot

### 8.3 Document Drawer Pattern

- [ ] Document drawer usage
  - [ ] When to use drawers
  - [ ] Behavior: Slide animation, Escape closes
  - [ ] Example: Task detail drawer
  - [ ] Code example

### 8.4 Document Other Patterns

- [ ] Document tooltips
  - [ ] When to use
  - [ ] Behavior: Delay, keyboard accessible
  - [ ] Example

- [ ] Document dropdowns
  - [ ] When to use
  - [ ] Behavior: Arrow keys, Enter selects, outside click closes
  - [ ] Example

- [ ] Document toast notifications
  - [ ] When to use
  - [ ] Types: Success, error, info, loading
  - [ ] Auto-dismiss duration
  - [ ] Example

- [ ] Document loading states
  - [ ] When to use skeletons
  - [ ] Skeleton should match content
  - [ ] Example

- [ ] Document empty states
  - [ ] When to show
  - [ ] Include helpful message and CTA
  - [ ] Example

## Phase 9: Manual Color Audit

### 9.1 Brand Color Verification

- [ ] Audit primary color usage (#216093)
  - [ ] Check all buttons use primary color
  - [ ] Verify links use primary color
  - [ ] Check focus states use primary
  - [ ] Document any inconsistencies

- [ ] Check button variants
  - [ ] Primary button: #216093 background
  - [ ] Secondary button: Outline or muted
  - [ ] Destructive button: Red (#DB162F)
  - [ ] Ghost button: Transparent
  - [ ] Verify consistency across app

- [ ] Check text colors
  - [ ] Headings: #000000 (black) or primary
  - [ ] Body text: #000000
  - [ ] Muted text: Appropriate gray
  - [ ] Verify hierarchy clear

- [ ] Check status colors
  - [ ] Success: #2E933C (green)
  - [ ] Error: #DB162F (red)
  - [ ] Warning: #E18331 (orange)
  - [ ] Info: Primary or blue
  - [ ] Verify used consistently

### 9.2 Document Color Usage

- [ ] Create color usage guide
  - [ ] List all HelixIntel brand colors
  - [ ] Document where each is used
  - [ ] Provide hex codes
  - [ ] Show examples

- [ ] Update CLAUDE.md if needed
  - [ ] Ensure color palette documented
  - [ ] Note any deviations or additions
  - [ ] Provide usage guidelines

### 9.3 Fix Inconsistencies

- [ ] Fix any color inconsistencies found
  - [ ] Update components to use correct colors
  - [ ] Ensure CSS variables used
  - [ ] Test visual appearance
  - [ ] Verify brand consistency

## Phase 10: Production Deployment Checklist

### 10.1 Create Production Checklist

- [ ] Create checklist document
  - [ ] Create `docs/PRODUCTION-CHECKLIST.md`
  - [ ] Or add to CLAUDE.md
  - [ ] List all pre-launch items

### 10.2 Pre-Launch Verification

- [ ] Environment variables
  - [ ] Verify DATABASE_URL set
  - [ ] Check NEXTAUTH_SECRET set
  - [ ] Verify NEXTAUTH_URL correct
  - [ ] Check CRON_SECRET set
  - [ ] All required variables present

- [ ] Database
  - [ ] Run migrations: `npx prisma migrate deploy`
  - [ ] Seed database: `pnpm db:seed`
  - [ ] Verify admin user exists
  - [ ] Check database backups configured

- [ ] Build and deploy
  - [ ] Run: `pnpm build`
  - [ ] Verify build succeeds
  - [ ] No TypeScript errors
  - [ ] No ESLint errors
  - [ ] Deploy to production

- [ ] Post-deploy testing
  - [ ] Test login works
  - [ ] Create test asset
  - [ ] Apply template
  - [ ] Complete task
  - [ ] Check dashboard analytics
  - [ ] Verify all critical flows work

### 10.3 Performance Verification

- [ ] Run Lighthouse on production
  - [ ] Performance: >90
  - [ ] Accessibility: 100
  - [ ] Best Practices: >90
  - [ ] SEO: >90

- [ ] Test on real devices
  - [ ] iPhone
  - [ ] Android phone
  - [ ] iPad
  - [ ] Desktop Chrome
  - [ ] Desktop Safari

### 10.4 Monitoring Setup

- [ ] Error monitoring
  - [ ] Setup Sentry (optional)
  - [ ] Or configure error logging
  - [ ] Test error reporting

- [ ] Analytics
  - [ ] Setup Vercel Analytics
  - [ ] Or Google Analytics
  - [ ] Verify tracking works

- [ ] Uptime monitoring
  - [ ] Configure uptime checks
  - [ ] Set up alerts
  - [ ] Test notifications

## Phase 11: Final Verification & Sign-Off

### 11.1 Run All Tests

- [ ] Run E2E test suite
  - [ ] Execute: `pnpm test`
  - [ ] Verify 250+ tests exist
  - [ ] Verify 85%+ pass rate
  - [ ] Fix any failures
  - [ ] Document results

- [ ] Run accessibility tests
  - [ ] From Task 12
  - [ ] Verify still passing
  - [ ] Lighthouse: 100/100

- [ ] Run visual regression tests
  - [ ] Execute visual tests
  - [ ] Verify no unexpected changes
  - [ ] Approve any intentional changes

### 11.2 Manual Testing

- [ ] Test all error boundaries
  - [ ] Force errors in widgets
  - [ ] Verify graceful handling
  - [ ] Test "Try again" buttons

- [ ] Test all breadcrumbs
  - [ ] Asset detail breadcrumb
  - [ ] Task detail breadcrumb
  - [ ] Dashboard sub-pages
  - [ ] Verify navigation works

- [ ] Test all toast notifications
  - [ ] Create asset → toast
  - [ ] Update asset → toast
  - [ ] Delete asset → toast
  - [ ] Complete task → toast
  - [ ] All other actions → toast

- [ ] Test all empty states
  - [ ] Assets empty
  - [ ] Tasks empty
  - [ ] Activity empty
  - [ ] Verify helpful messages

- [ ] Test all loading states
  - [ ] Dashboard loads smoothly
  - [ ] Tables show skeletons
  - [ ] Forms load cleanly
  - [ ] Network throttling test

### 11.3 Cross-Browser Testing

- [ ] Test in Chrome (latest)
  - [ ] All features work
  - [ ] No console errors
  - [ ] Visual appearance correct

- [ ] Test in Firefox (latest)
  - [ ] All features work
  - [ ] No errors
  - [ ] Appearance correct

- [ ] Test in Safari (latest)
  - [ ] All features work
  - [ ] No errors
  - [ ] Appearance correct

- [ ] Test in Edge (latest)
  - [ ] All features work
  - [ ] Appearance correct

- [ ] Test on mobile Safari
  - [ ] iOS device or simulator
  - [ ] All features work
  - [ ] Touch interactions smooth

- [ ] Test on mobile Chrome
  - [ ] Android device or emulator
  - [ ] All features work
  - [ ] Appearance correct

### 11.4 Final Code Quality Checks

- [ ] Run linter
  - [ ] Execute: `pnpm lint`
  - [ ] Fix all errors
  - [ ] Address warnings

- [ ] Run type checker
  - [ ] Execute: `pnpm typecheck`
  - [ ] Fix all TypeScript errors
  - [ ] Verify strict mode compliance

- [ ] Format code
  - [ ] Execute: `pnpm format`
  - [ ] Verify all files formatted
  - [ ] Check `pnpm format:check` passes

- [ ] Review code
  - [ ] No TODO comments left
  - [ ] No console.logs in production code
  - [ ] No commented-out code
  - [ ] All imports used

## Phase 12: Documentation Updates

### 12.1 Update CLAUDE.md

- [ ] Add error boundary section
  - [ ] Document error handling pattern
  - [ ] List wrapped components
  - [ ] Provide usage examples

- [ ] Add breadcrumb section
  - [ ] Document breadcrumb pattern
  - [ ] List pages with breadcrumbs
  - [ ] Provide usage examples

- [ ] Add toast notification section
  - [ ] Document toast patterns
  - [ ] List when to use toasts
  - [ ] Provide examples

- [ ] Update testing section
  - [ ] Note 250+ E2E tests
  - [ ] Document test pass rate
  - [ ] Add visual regression info

### 12.2 Update Production Checklist

- [ ] Document pre-launch steps
  - [ ] Environment setup
  - [ ] Database migration
  - [ ] Build and deploy process
  - [ ] Post-deploy verification

- [ ] Document monitoring
  - [ ] Error tracking
  - [ ] Analytics
  - [ ] Uptime monitoring

### 12.3 Create Pattern Library

- [ ] Finalize interactive patterns doc
  - [ ] All patterns documented
  - [ ] Code examples included
  - [ ] Screenshots added
  - [ ] Usage guidelines clear

## Verification & Sign-Off

### Error Handling Requirements

- [ ] Error boundaries implemented: 10+ components wrapped
- [ ] All critical widgets protected
- [ ] Fallback UI user-friendly
- [ ] "Try again" functionality works
- [ ] Errors logged appropriately

### Navigation Requirements

- [ ] Breadcrumbs on asset detail
- [ ] Breadcrumbs on task detail
- [ ] Breadcrumbs on dashboard sub-pages
- [ ] All breadcrumb links work
- [ ] Accessible with keyboard/screen reader

### Toast Notification Requirements

- [ ] Success toasts on all CRUD operations
- [ ] Error toasts on failures
- [ ] Toast duration appropriate (4s)
- [ ] Multiple toasts stack correctly
- [ ] Accessible with screen reader

### Empty State Requirements

- [ ] Empty states on assets page
- [ ] Empty states on tasks page
- [ ] Empty states on activity timeline
- [ ] All empty states have helpful messages
- [ ] All CTAs work correctly

### Loading State Requirements

- [ ] Skeletons on dashboard
- [ ] Skeletons on data tables
- [ ] Skeletons match content layout
- [ ] No layout shift (CLS <0.1)
- [ ] Smooth transitions

### Testing Requirements

- [ ] E2E tests: 250+ total
- [ ] Pass rate: 85%+ (213+ passing)
- [ ] Error boundary tests passing
- [ ] Empty state tests passing
- [ ] Toast notification tests passing
- [ ] Breadcrumb tests passing
- [ ] Full user flow tests passing
- [ ] Visual regression tests passing

### UX Score Requirements

- [ ] Loading States: 6.0/10 → 8.0+/10
- [ ] Interactive Components: 7.0/10 → 8.5+/10
- [ ] Forms & Validation: 7.0/10 → 9.0+/10
- [ ] Visual Design: 7.5/10 → 9.0+/10
- [ ] Overall score: 7.8/10 → 8.5+/10

### Production Readiness

- [ ] All Tasks 9-13 complete
- [ ] Production checklist complete
- [ ] All critical issues resolved
- [ ] Monitoring configured
- [ ] Documentation complete
- [ ] Ready for launch 🚀

## Final Checks

- [ ] No console errors in production
- [ ] All TypeScript errors resolved
- [ ] ESLint passes
- [ ] All tests passing (85%+)
- [ ] Lighthouse scores met
- [ ] Cross-browser compatible
- [ ] Mobile-responsive
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Performance targets met
- [ ] Production deployed successfully

---

## Notes

### Issues Encountered

_Document any issues found during final polish:_

### Time Tracking

- **Estimated Time**: 36 hours (3-4 days)
- **Actual Time**: \_\_\_ hours
- **Day 1 (Error Handling & Navigation)**: \_\_\_ hours
- **Day 2 (UX Polish)**: \_\_\_ hours
- **Day 3 (Testing Expansion)**: \_\_\_ hours
- **Day 4 (Visual Regression & Finalization)**: \_\_\_ hours

### Success Metrics Achieved

- [ ] E2E tests: \_\_\_ total (target: 250+)
- [ ] Pass rate: \_\_\_% (target: 85%+)
- [ ] Loading States: \_\_\_/10 (target: 8.0+)
- [ ] Interactive Components: \_\_\_/10 (target: 8.5+)
- [ ] Forms & Validation: \_\_\_/10 (target: 9.0+)
- [ ] Visual Design: \_\_\_/10 (target: 9.0+)
- [ ] Overall audit score: \_\_\_/10 (target: 8.5+)

### Production Launch

- [ ] Launch date: ******\_\_\_******
- [ ] Deployed to: ******\_\_\_******
- [ ] URL: ******\_\_\_******
- [ ] Initial users: ******\_\_\_******
- [ ] Monitoring dashboard: ******\_\_\_******

---

_Checklist Created: November 2025_
_Total Items: 400+_
_Estimated Completion: 36 hours (3-4 days)_
_Final Task: Production Ready!_ 🎉

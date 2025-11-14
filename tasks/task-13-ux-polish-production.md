# Task 13: UX Polish & Production Readiness

## Overview

With critical issues resolved (Tasks 9-12), this final task polishes the user experience to production quality through comprehensive testing, error handling, and UX improvements. The audit identified gaps in loading states (6.0/10), interactive components (7.0/10), forms (7.0/10), and visual design (7.5/10). This task implements error boundaries for graceful failure handling, adds breadcrumbs for navigation context, tests empty states and toast notifications, expands E2E test coverage from 43% to 85%+, and establishes visual regression testing to prevent future regressions.

## Core Objectives

- **Implement error boundaries** for graceful error handling (React Error Boundary)
- **Test and verify toast notifications** work across all user actions
- **Add breadcrumbs** to detail pages (Assets, Tasks) for navigation context
- **Test empty states** comprehensively (no data scenarios)
- **Verify loading states** with network throttling (Slow 3G testing)
- **Expand E2E test coverage** from 183 tests (43% pass) to 250+ tests (85%+ pass)
- **Set up visual regression testing** (Percy, Chromatic, or Playwright screenshots)
- **Document interactive patterns** (modals, drawers, tooltips, dropdowns)
- **Perform manual color audit** for #216093 brand consistency
- **Create production deployment checklist** for final launch verification

## Audit Findings

### Loading States & Feedback (6.0/10 - Fair)

**Strengths**:
- ✅ Dashboard shows loading skeletons
- ✅ Toast container exists (sonner)
- ℹ️ Loading indicators present

**Issues**:
- ⚠️ Loading skeleton timing difficult to capture (too fast or too slow)
- ⚠️ Empty states not tested (requires empty data)
- ⚠️ Error states not verified (no error boundaries observed)
- ⚠️ Toast notifications not triggered during tests

**Recommendations from Audit**:
1. Verify loading states with slow 3G throttling
2. Test empty states with fresh user
3. Implement error boundaries
4. Test toast notifications comprehensively

### Interactive Components (7.0/10 - Good)

**Strengths**:
- ✅ Modals properly implemented
- ✅ Dropdowns detected
- ✅ Tooltips likely present
- ✅ Hover states functional
- ✅ Badge components present
- ✅ Drawer components work

**Issues**:
- ⚠️ Dropdown close-on-outside-click not verified
- ⚠️ Tooltip hover delay not tested
- ⚠️ Tab component existence unclear

### Forms & Validation (7.0/10 - Good)

**Strengths**:
- ✅ Validation triggers on submission
- ✅ Error messages displayed
- ✅ Required fields marked
- ✅ Date pickers present
- ✅ Select/dropdown inputs functional

**Issues**:
- ⚠️ Error message clarity not verified
- ⚠️ Success feedback not tested
- ❌ File upload test had syntax error

### Visual Design (7.5/10 - Good)

**Strengths**:
- ✅ Inter font applied
- ✅ Heading hierarchy exists
- ✅ Card components consistent
- ✅ Brand identity present

**Issues**:
- ⚠️ Primary brand color (#216093) verification incomplete
- ⚠️ Button variant consistency needs verification
- ℹ️ Spacing consistency requires review

### Navigation & UX (5.0/10 → 8.0+ after Tasks 9-13)

**Remaining Issue**:
- ⚠️ Breadcrumb navigation not implemented on detail pages

## Technical Requirements

### 1. Error Boundaries Implementation

**Purpose**: Prevent entire app crash when component errors occur

**Pattern**:
```tsx
// components/error-boundary.tsx
'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
    // Optional: Send to error tracking service (Sentry)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            We encountered an error while displaying this content.
          </p>
          <Button
            onClick={() => this.setState({ hasError: false })}
            variant="outline"
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usage**:
```tsx
// Wrap dashboard widgets
<ErrorBoundary>
  <DashboardAnalytics />
</ErrorBoundary>

// Wrap entire dashboard sections
<ErrorBoundary fallback={<DashboardWidgetSkeleton />}>
  <DashboardWidgets />
</ErrorBoundary>
```

**Where to Add**:
- Dashboard widgets (analytics, calendar, cost summary)
- Data tables (assets, tasks)
- Forms (asset create, task create)
- Chart components (Recharts)

### 2. Breadcrumb Navigation

**Purpose**: Help users understand their location and navigate back

**Implementation**:
```tsx
// components/ui/breadcrumb.tsx
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

**Usage**:
```tsx
// app/assets/[id]/page.tsx
<Breadcrumb
  items={[
    { label: 'Home', href: '/dashboard' },
    { label: 'Assets', href: '/assets' },
    { label: asset.name },
  ]}
/>

// app/tasks/[id]/page.tsx
<Breadcrumb
  items={[
    { label: 'Home', href: '/dashboard' },
    { label: 'Tasks', href: '/tasks' },
    { label: task.title },
  ]}
/>
```

**Pages to Add**:
- Asset detail page
- Task detail page
- Dashboard sub-pages (costs, settings)
- Template detail (if exists)

### 3. Toast Notifications Testing

**Verify sonner Implementation**:
```tsx
// Should exist in layout
import { Toaster } from 'sonner';

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

**Test Scenarios**:
```typescript
import { toast } from 'sonner';

// Success
toast.success('Asset created successfully!');

// Error
toast.error('Failed to save changes. Please try again.');

// Info
toast.info('Changes will be saved automatically.');

// Loading
const toastId = toast.loading('Saving changes...');
// Later: toast.success('Saved!', { id: toastId });

// Custom duration
toast.success('Saved!', { duration: 5000 });
```

**Actions to Test**:
- Asset created
- Asset updated
- Asset deleted
- Task completed
- Task created
- Template applied
- Settings saved
- Form validation errors
- Network errors

### 4. Empty States

**Pattern**:
```tsx
// components/ui/empty-state.tsx
import { FileQuestion } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <Icon className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
```

**Usage**:
```tsx
// No assets
<EmptyState
  icon={Package}
  title="No assets yet"
  description="Start by adding your first home asset to track its maintenance."
  action={{
    label: 'Add Asset',
    onClick: () => router.push('/assets/create'),
  }}
/>

// No tasks
<EmptyState
  icon={CheckSquare}
  title="No tasks"
  description="You're all caught up! Apply maintenance templates to generate tasks."
  action={{
    label: 'Browse Templates',
    onClick: () => router.push('/templates'),
  }}
/>
```

**Pages to Add**:
- Assets list (no assets)
- Tasks list (no tasks)
- Dashboard (no data)
- Activity timeline (no activities)
- Templates (no templates - unlikely)

### 5. Loading States with Skeletons

**Verify Existing Skeletons**:
- Dashboard widgets
- Data tables
- Forms
- Charts

**Add Missing Skeletons**:
```tsx
// components/ui/skeleton.tsx (should exist from shadcn)
import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

// Breadcrumb skeleton
export function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}
```

**Test with Network Throttling**:
- Chrome DevTools → Network tab → Throttling: Slow 3G
- Verify skeletons appear
- Check layout doesn't shift when content loads
- Measure perceived performance

## Implementation Details

### Phase 1: Error Boundaries

**Step 1: Create Error Boundary Component**

1. Create `components/error-boundary.tsx`
2. Implement React.Component with error handling
3. Add fallback UI with "Try again" button
4. Add error logging (console and optional Sentry)

**Step 2: Wrap Critical Components**

Identify components to wrap:
- Dashboard analytics charts
- Cost summary tables
- Calendar widget
- Activity timeline
- Asset data tables
- Task data tables
- Forms

**Step 3: Test Error Scenarios**

```typescript
// Force error for testing
function TestErrorComponent() {
  throw new Error('Test error');
  return <div>Content</div>;
}

// Wrap in error boundary
<ErrorBoundary>
  <TestErrorComponent />
</ErrorBoundary>
```

### Phase 2: Breadcrumbs

**Step 1: Create Breadcrumb Component**

1. Create `components/ui/breadcrumb.tsx`
2. Implement with proper semantics (`<nav>`, `<ol>`, `aria-label`)
3. Add ChevronRight separators
4. Style with muted colors, hover states

**Step 2: Add to Detail Pages**

```tsx
// app/assets/[id]/page.tsx
export default async function AssetDetailPage({ params }: Props) {
  const { id } = await params;
  const asset = await getAsset(id);

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Assets', href: '/assets' },
          { label: asset.name },
        ]}
      />
      {/* Rest of page */}
    </div>
  );
}
```

**Step 3: Test Navigation**

- Click breadcrumb links
- Verify navigation works
- Test on mobile (adequate touch targets)
- Check accessibility (screen reader)

### Phase 3: Toast Notifications

**Step 1: Verify Toaster Setup**

Check `app/layout.tsx` has `<Toaster />` from sonner.

**Step 2: Add Toasts to All Actions**

```tsx
// Example: Asset creation
async function handleSubmit(data: AssetFormData) {
  try {
    const result = await createAsset(data);
    toast.success('Asset created successfully!');
    router.push(`/assets/${result.id}`);
  } catch (error) {
    toast.error('Failed to create asset. Please try again.');
    console.error(error);
  }
}
```

**Actions to Add Toasts**:
- Asset CRUD operations
- Task CRUD operations
- Template application
- Settings updates
- Bulk operations
- Export/import operations

**Step 3: Test Toast Behavior**

- Trigger each action
- Verify toast appears
- Check toast dismisses after duration
- Test multiple toasts stack correctly
- Verify accessible (announced by screen reader)

### Phase 4: Empty States

**Step 1: Create Empty State Component**

Implement reusable `EmptyState` component with icon, title, description, and optional action button.

**Step 2: Add to List Pages**

Conditionally render empty state when no data:

```tsx
{assets.length === 0 ? (
  <EmptyState
    title="No assets yet"
    description="Start tracking your home assets..."
    action={{ label: 'Add Asset', onClick: ... }}
  />
) : (
  <AssetGrid assets={assets} />
)}
```

**Step 3: Test with Empty Data**

- Create new user (fresh database)
- Visit each page
- Verify empty states appear
- Check CTAs work
- Test helpful messaging

### Phase 5: Loading States

**Step 1: Verify Existing Skeletons**

Check these exist and match content:
- Dashboard widget skeletons
- Table skeletons
- Chart skeletons
- Form skeletons

**Step 2: Add Missing Skeletons**

Create skeletons for:
- Breadcrumbs
- Empty states (if lazy loaded)
- Modals/drawers

**Step 3: Test with Throttling**

- Chrome DevTools → Network → Slow 3G
- Navigate through app
- Verify skeletons appear immediately
- Check smooth transition to content
- Measure no layout shift (CLS)

### Phase 6: E2E Test Expansion

**Current State**: 183 tests, 78 passing (43%)
**Target**: 250+ tests, 213+ passing (85%+)

**New Tests to Add**:

**Error Scenarios**:
```typescript
test('Shows error boundary on chart failure', async ({ page }) => {
  // Mock API to return error
  await page.route('**/api/dashboard/analytics', route =>
    route.fulfill({ status: 500 })
  );
  await page.goto('/dashboard');
  await expect(page.getByText('Something went wrong')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});
```

**Empty State Tests**:
```typescript
test('Shows empty state when no assets', async ({ page }) => {
  // Use fresh database or mock empty response
  await page.goto('/assets');
  await expect(page.getByText('No assets yet')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Asset' })).toBeVisible();
});
```

**Toast Notification Tests**:
```typescript
test('Shows success toast on asset creation', async ({ page }) => {
  await page.goto('/assets/create');
  // Fill form
  await page.fill('[name="name"]', 'Test Asset');
  await page.click('button[type="submit"]');
  // Check toast
  await expect(page.getByText('Asset created successfully!')).toBeVisible();
});
```

**Breadcrumb Tests**:
```typescript
test('Breadcrumb navigation works on asset detail', async ({ page }) => {
  await page.goto('/assets/123');
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
  await page.click('a:has-text("Assets")');
  await expect(page).toHaveURL('/assets');
});
```

**Full User Flow Tests**:
```typescript
test('Complete maintenance workflow', async ({ page }) => {
  // 1. Login
  await page.goto('/login');
  await login(page);

  // 2. Create asset
  await page.goto('/assets/create');
  await createAsset(page, 'HVAC System');

  // 3. Apply template
  await page.goto('/templates');
  await page.click('text=HVAC Maintenance');
  await page.click('button:has-text("Apply Template")');
  await page.click('button:has-text("Confirm")');

  // 4. Complete task
  await page.goto('/tasks');
  await page.click('text=Change HVAC filter');
  await page.click('button:has-text("Complete")');
  await page.fill('[name="cost"]', '25.00');
  await page.click('button:has-text("Save")');

  // 5. Verify dashboard updated
  await page.goto('/dashboard');
  await expect(page.getByText('1 completed this month')).toBeVisible();
});
```

### Phase 7: Visual Regression Testing

**Option A: Playwright Screenshots**

```typescript
// tests/e2e/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test('Dashboard visual regression', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  // Take screenshot
  await expect(page).toHaveScreenshot('dashboard.png', {
    fullPage: true,
    maxDiffPixels: 100,
  });
});

test('Assets page visual regression', async ({ page }) => {
  await page.goto('/assets');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('assets.png');
});
```

**Option B: Percy (Cloud-based)**

```bash
# Install
npm install --save-dev @percy/cli @percy/playwright

# Run
npx percy exec -- playwright test
```

**Option C: Chromatic (for Storybook)**

Only if using Storybook (likely not for this project).

### Phase 8: Interactive Patterns Documentation

**Create Pattern Library Document**:

```markdown
# HelixIntel Interactive Patterns

## Modals
- Use for: Confirmations, forms, important messages
- Behavior: Focus trap, Escape closes, overlay dismisses
- Example: Asset deletion confirmation

## Drawers
- Use for: Detail views, side panels
- Behavior: Slide from right, Escape closes
- Example: Task detail drawer

## Tooltips
- Use for: Additional info, icon explanations
- Behavior: 300ms delay, keyboard accessible
- Example: Dashboard widget info icons

## Dropdowns
- Use for: Menus, select options
- Behavior: Arrow keys navigate, Enter selects, outside click closes
- Example: User menu, filter dropdowns

## Toast Notifications
- Use for: Success/error feedback
- Behavior: Auto-dismiss (4s), dismissible, stacks
- Example: "Asset created successfully!"

## Loading States
- Use for: Data fetching, async operations
- Behavior: Skeleton matches content layout
- Example: Dashboard widget skeletons
```

## Testing Requirements

### Manual Testing Checklist

**Error Boundaries**:
- [ ] Dashboard widget error shows fallback
- [ ] Chart error doesn't crash page
- [ ] "Try again" button works
- [ ] Console logs error details

**Breadcrumbs**:
- [ ] Breadcrumbs visible on asset detail
- [ ] Breadcrumbs visible on task detail
- [ ] Links navigate correctly
- [ ] Mobile touch targets adequate
- [ ] Screen reader announces navigation

**Toast Notifications**:
- [ ] Success toast on asset create
- [ ] Success toast on asset update
- [ ] Success toast on asset delete
- [ ] Success toast on task complete
- [ ] Error toast on API failure
- [ ] Toast dismisses after 4 seconds
- [ ] Multiple toasts stack correctly

**Empty States**:
- [ ] Assets page shows empty state (no assets)
- [ ] Tasks page shows empty state (no tasks)
- [ ] Dashboard shows empty state (no data)
- [ ] Activity shows empty state (no activities)
- [ ] CTA buttons work in empty states

**Loading States**:
- [ ] Skeletons appear on slow connection
- [ ] Skeletons match content layout
- [ ] No layout shift when content loads
- [ ] All pages have loading states

### E2E Testing

**Expanded Test Coverage**:
- [ ] Error boundary tests (new)
- [ ] Empty state tests (new)
- [ ] Toast notification tests (new)
- [ ] Breadcrumb navigation tests (new)
- [ ] Full user flow tests (new)
- [ ] Visual regression tests (new)

**Test Pass Rate**:
- Current: 78/183 (43%)
- Target: 213/250 (85%+)

### Visual Regression Testing

**Baseline Screenshots**:
- [ ] Dashboard (desktop, tablet, mobile)
- [ ] Assets list
- [ ] Asset detail
- [ ] Asset create form
- [ ] Tasks list
- [ ] Templates page
- [ ] Login page

**Comparison**:
- [ ] Run tests on each deploy
- [ ] Flag visual changes
- [ ] Review and approve or fix

## Success Metrics

### Quantifiable Targets

**Test Coverage**:
- E2E tests: 183 → 250+ tests
- Pass rate: 43% → 85%+
- New test categories: 6 (errors, empty, toasts, breadcrumbs, flows, visual)

**UX Scores**:
- Loading States: 6.0/10 → 8.0+/10
- Interactive Components: 7.0/10 → 8.5+/10
- Forms & Validation: 7.0/10 → 9.0+/10
- Visual Design: 7.5/10 → 9.0+/10
- Navigation & UX: 8.0/10 (after Tasks 9, 13)

**Error Handling**:
- Error boundaries: 0 → 10+ critical components wrapped
- Graceful failures: 0% → 100% of widget errors handled

**Navigation**:
- Breadcrumbs: 0 → 2+ pages (asset detail, task detail)
- User orientation: Improved with breadcrumbs

### User Experience Goals

- Users see helpful error messages, not crashes
- Users know where they are (breadcrumbs)
- Users get feedback on actions (toasts)
- Users see helpful empty states
- Users experience smooth loading
- Professional, polished application

## Security Considerations

**Error Boundaries**:
- Don't expose sensitive error details in production
- Sanitize error messages shown to users
- Log full errors securely (not to console in production)

**Toast Notifications**:
- Don't expose sensitive data in toasts
- Ensure error messages are user-friendly, not technical

## Development Checklist

See accompanying file: `task-13-checklist.md`

## Dependencies

### Prerequisites

- Tasks 9-12 complete (navigation, mobile, performance, accessibility)
- Application functionally complete
- Core user flows working

### External Tools

- Playwright (E2E testing)
- Percy or Chromatic (optional, for visual regression)
- Chrome DevTools (network throttling)

## Estimated Time

| Component | Hours |
|-----------|-------|
| Error boundaries implementation | 4h |
| Breadcrumbs implementation | 3h |
| Toast notifications testing | 3h |
| Empty states implementation | 4h |
| Loading states verification | 2h |
| E2E test expansion | 8h |
| Visual regression setup | 3h |
| Interactive patterns documentation | 2h |
| Manual color audit | 2h |
| Production checklist | 2h |
| Final verification & polish | 3h |
| **Total** | **36h (3-4 days)** |

## Implementation Plan

### Day 1: Error Handling & Navigation (8h)

**Morning** (4h):
1. Create error boundary component
2. Wrap critical components
3. Test error scenarios
4. Verify error handling works

**Afternoon** (4h):
5. Create breadcrumb component
6. Add to detail pages
7. Test navigation
8. Verify accessibility

### Day 2: UX Polish (8h)

**Morning** (4h):
1. Test toast notifications
2. Add missing toast calls
3. Create empty state component
4. Add to all list pages

**Afternoon** (4h):
5. Verify loading states
6. Test with network throttling
7. Add missing skeletons
8. Manual color audit

### Day 3: Testing Expansion (8h)

**Morning** (4h):
1. Add error boundary tests
2. Add empty state tests
3. Add toast tests
4. Add breadcrumb tests

**Afternoon** (4h):
5. Add full user flow tests
6. Run all tests
7. Fix failures
8. Verify 85%+ pass rate

### Day 4: Visual Regression & Finalization (8h)

**Morning** (4h):
1. Set up visual regression testing
2. Capture baseline screenshots
3. Run visual tests
4. Document patterns

**Afternoon** (4h):
5. Create production checklist
6. Final manual testing
7. Documentation updates
8. Task completion verification

### Buffer (4h)

- Address any unexpected issues
- Additional polish
- Extra testing

## Notes

### Important Considerations

- **Last Polish Task**: Final chance to improve UX before launch
- **Testing Focus**: Expand coverage to 85%+ for confidence
- **User-Centric**: All improvements focused on end-user experience
- **Production Ready**: This task completes production readiness

### Common Patterns

**Error Boundaries**:
- Wrap at widget level, not entire pages
- Provide recovery mechanism ("Try again")
- Log errors for debugging

**Empty States**:
- Always include helpful message
- Provide clear next action (CTA)
- Use appropriate icon

**Toast Notifications**:
- Success: Green, checkmark icon
- Error: Red, X icon
- Info: Blue, info icon
- Loading: Spinner, auto-dismiss when done

### Related Issues

This task addresses:
- **Loading States (6.0/10)**: "Loading state timing, empty states, error states"
- **Interactive Components (7.0/10)**: "Dropdown behavior, tooltip testing"
- **Forms & Validation (7.0/10)**: "Error message quality, success feedback"
- **Visual Design (7.5/10)**: "Brand color consistency, spacing"
- **Navigation & UX (8.0/10)**: "Breadcrumbs missing"

### Future Enhancements

- Storybook for component documentation
- Automated visual regression in CI
- User onboarding tour
- Micro-interactions and animations
- Advanced error tracking (Sentry)

---

_Task Created: November 2025_
_Estimated Completion: 3-4 days (36 hours)_
_Priority: MEDIUM (Final Polish)_
_Audit Score Impact: Loading 6.0→8.0+, Interactive 7.0→8.5+, Forms 7.0→9.0+, Visual 7.5→9.0+, Overall 7.8→8.5+_

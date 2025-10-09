# Task 4: Global Navigation System

## Objective

Implement a responsive, persistent navigation structure that provides access to all platform features across desktop and mobile devices.

## Navigation Architecture

### Desktop (≥1024px)

**Top Bar:**

- Left: Hamburger toggle (collapses/expands sidebar), HelixIntel logo (links to dashboard)
- Right: Search icon (command palette), notification bell (with badge count), user dropdown menu

**Sidebar:**

- Collapsed by default (icons only, ~64px width)
- Expands on hover or click (~240px width)
- Contains primary navigation items with icons and labels
- State persists per user preference (localStorage)
- Active page highlighted with background color and accent border

**User Dropdown Menu:**

- User name and email
- Profile
- Account Settings
- Sign Out

### Mobile (<1024px)

**Top Bar:**

- Left: Hamburger menu icon
- Center: HelixIntel logo (links to dashboard)
- Right: Search icon, notification bell

**Sidebar (Overlay):**

- Hidden by default
- Slides in from left when hamburger clicked
- Semi-transparent backdrop overlay
- Same navigation items as desktop
- Auto-closes after navigation selection

**Floating Action Button (FAB):**

- Fixed bottom-right position
- Primary action: "Create Task" (may change based on context)
- Circular button with plus icon
- Elevated shadow for prominence

### Tablet (768px-1023px)

- Uses mobile layout pattern
- Larger touch targets
- Sidebar slightly wider when open

## Navigation Items

### Primary Navigation (Sidebar)

1. **Dashboard** - Home icon - Route: `/dashboard`
2. **Assets** - Package icon - Route: `/assets`
3. **Tasks** - CheckSquare icon - Route: `/tasks`
4. **Templates** - FileText icon - Route: `/templates`

### Secondary Navigation (Sidebar, below divider)

5. **Reports** - BarChart icon - Route: `/reports` (placeholder)
6. **Settings** - Settings icon - Route: `/settings` (placeholder)
7. **Help** - HelpCircle icon - Route: `/help` (placeholder)

### User Dropdown

- **Profile** - User icon - Route: `/profile`
- **Account Settings** - Settings icon - Route: `/settings/account`
- **Sign Out** - LogOut icon - Action: Sign out

## Implementation Steps

### Step 1: Create Navigation Layout Component

**File:** `/components/layout/app-layout.tsx`

**Requirements:**

- Client component with state management
- Responsive layout wrapper for all protected pages
- Manages sidebar collapsed/expanded state
- Handles mobile overlay state
- Provides context for navigation state to child components

**State to manage:**

- `sidebarCollapsed: boolean` - Desktop sidebar state (persisted to localStorage)
- `mobileMenuOpen: boolean` - Mobile sidebar overlay state
- `isMobile: boolean` - Responsive breakpoint detection

### Step 2: Create Top Bar Component

**File:** `/components/layout/top-bar.tsx`

**Requirements:**

- Fixed position at top of viewport
- Height: 64px (consistent across breakpoints)
- Background: White with bottom border
- Z-index: 40 (above content, below modals)

**Elements:**

- Hamburger button (toggles sidebar)
- HelixIntel logo (clickable, links to `/dashboard`)
- Search button (triggers command palette - placeholder for now)
- Notification bell (fetches unread count from API)
- User dropdown menu (shows on click)

**Notification Bell:**

- Fetch unread notifications count: `GET /api/notifications/count`
- Display badge with count (max 99+)
- Red dot indicator for unread
- Click opens notifications panel (Task 7 feature)

**User Dropdown:**

- Avatar or initials circle
- Shows user name and email
- Menu items: Profile, Account Settings, Sign Out
- Sign Out calls NextAuth `signOut()` function

### Step 3: Create Sidebar Component

**File:** `/components/layout/sidebar.tsx`

**Requirements:**

- Desktop: Fixed position, left side, toggleable width
- Mobile: Overlay with slide-in animation
- Smooth transitions between states
- Active link highlighting

**Desktop Behavior:**

- Collapsed width: 64px (icon only)
- Expanded width: 240px (icon + label)
- Expands on hover if collapsed (temporary)
- Click hamburger to toggle persistent state
- State saved to `localStorage` key: `sidebar-collapsed`

**Mobile Behavior:**

- Full overlay (z-index: 50)
- Width: 280px
- Slides in from left (-280px to 0px)
- Backdrop overlay (semi-transparent black)
- Click backdrop or nav item to close

**Navigation Items:**

- Map through nav config array
- Each item: Icon (16x16), Label, Route, Badge (optional)
- Active state: Background color (#216093 at 10% opacity), left accent border (3px, #216093)
- Hover state: Background color (#F9FAFA)
- Use Next.js `Link` component with `prefetch={true}`
- Use `usePathname()` hook to determine active route

### Step 4: Create Mobile FAB Component

**File:** `/components/layout/floating-action-button.tsx`

**Requirements:**

- Only visible on mobile (<1024px)
- Fixed position: bottom-right
- Position: 16px from bottom, 16px from right
- Size: 56x56px (standard FAB size)
- Border radius: 28px (circular)
- Background: Primary brand color (#216093)
- Icon: Plus (white, 24x24px)
- Elevated shadow (elevation-6)
- Click opens "Create Task" modal (placeholder for now)

**Behavior:**

- Animates in with scale transition on mount
- Pulse animation on first load (attention grabber)
- Hides when scrolling down, shows when scrolling up (optional enhancement)

### Step 5: Create Command Palette Component

**File:** `/components/layout/command-palette.tsx`

**Requirements:**

- Modal dialog overlay
- Triggered by search icon or keyboard shortcut (Cmd+K / Ctrl+K)
- Input field with fuzzy search
- Results grouped by category (Assets, Tasks, Navigation)
- Keyboard navigation (arrow keys, enter to select)

**Search Categories:**

- Navigation items (Dashboard, Assets, etc.)
- Recent assets (last 5 viewed)
- Quick actions (Create Asset, Create Task)
- Placeholder for future: Search all assets, Search all tasks

**Implementation:**

- Use shadcn/ui Command component
- Implement using `cmdk` library (already included with shadcn)
- Install: `npx shadcn@latest add command`

### Step 6: Update Root Layout

**File:** `/app/(protected)/layout.tsx`

**Requirements:**

- Wrap all protected pages with `<AppLayout>`
- Apply consistent max-width container
- Handle authentication redirect
- Provide consistent spacing/padding

**Structure:**

```tsx
export default async function ProtectedLayout({ children }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return <AppLayout>{children}</AppLayout>
}
```

### Step 7: Create Navigation Configuration

**File:** `/lib/config/navigation.ts`

**Requirements:**

- Centralized navigation structure
- Type-safe navigation items
- Easy to extend with new items

**Structure:**

```typescript
import {
  Home,
  Package,
  CheckSquare,
  FileText,
  BarChart,
  Settings,
  HelpCircle,
} from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: typeof Home
  badge?: string | number
  disabled?: boolean
}

export const primaryNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Assets', href: '/assets', icon: Package },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Templates', href: '/templates', icon: FileText },
]

export const secondaryNavItems: NavItem[] = [
  { label: 'Reports', href: '/reports', icon: BarChart, disabled: true },
  { label: 'Settings', href: '/settings', icon: Settings, disabled: true },
  { label: 'Help', href: '/help', icon: HelpCircle, disabled: true },
]
```

### Step 8: Create Placeholder Pages

**Files:**

- `/app/(protected)/tasks/page.tsx`
- `/app/(protected)/templates/page.tsx`
- `/app/(protected)/reports/page.tsx`
- `/app/(protected)/settings/page.tsx`
- `/app/(protected)/help/page.tsx`
- `/app/(protected)/profile/page.tsx`

**Requirements:**

- Simple placeholder content
- Page title
- Brief description: "Coming soon - This feature will be implemented in Task X"
- Maintains navigation structure
- Proper authentication checks

**Template:**

```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function TasksPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Tasks</h1>
      <p className="text-gray-600">
        Coming soon - This feature will be implemented in Task 5.
      </p>
    </div>
  )
}
```

### Step 9: Create Notification Count API

**File:** `/app/api/notifications/count/route.ts`

**Requirements:**

- GET endpoint
- Requires authentication
- Returns count of unread notifications for current user
- For MVP: Return mock data (will be implemented in Task 7)

**Response:**

```json
{
  "count": 3,
  "hasUnread": true
}
```

### Step 10: Implement Responsive Behavior

**File:** `/lib/hooks/use-media-query.ts`

**Requirements:**

- Custom React hook for breakpoint detection
- Returns boolean for current breakpoint
- Server-side safe (returns false during SSR)
- Updates on window resize

**Usage:**

```typescript
const isMobile = useMediaQuery('(max-width: 1023px)')
const isDesktop = useMediaQuery('(min-width: 1024px)')
```

### Step 11: Add Keyboard Shortcuts

**File:** `/lib/hooks/use-keyboard-shortcuts.ts`

**Requirements:**

- Global keyboard shortcut handler
- Cmd+K / Ctrl+K: Open command palette
- Escape: Close any open overlays
- 1-4: Navigate to primary nav items (optional)

**Implementation:**

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      openCommandPalette()
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

### Step 12: Style and Polish

**Requirements:**

- Apply HelixIntel brand colors consistently
- Primary: #216093 (active states, accents)
- Backgrounds: #FFFFFF (components), #F9FAFA (hover states)
- Smooth transitions (200ms ease-in-out)
- Proper z-index layering
- Focus states for accessibility (visible outline)
- Mobile touch targets (min 44x44px)

**Animation Requirements:**

- Sidebar expand/collapse: 200ms ease-in-out
- Mobile menu slide: 300ms ease-out
- FAB appearance: scale from 0 to 1, 200ms
- Dropdown menus: fade + slide, 150ms

## Component Structure

After completion, the layout structure will be:

```
app/
  (protected)/
    layout.tsx                    # Wraps pages with AppLayout
    dashboard/
      page.tsx                    # Existing dashboard
    assets/
      page.tsx                    # Existing assets page
    tasks/
      page.tsx                    # New placeholder
    templates/
      page.tsx                    # New placeholder
    reports/
      page.tsx                    # New placeholder
    settings/
      page.tsx                    # New placeholder
    help/
      page.tsx                    # New placeholder
    profile/
      page.tsx                    # New placeholder

components/
  layout/
    app-layout.tsx                # Main layout wrapper
    top-bar.tsx                   # Top navigation bar
    sidebar.tsx                   # Collapsible sidebar
    floating-action-button.tsx    # Mobile FAB
    command-palette.tsx           # Search/command UI
    user-dropdown.tsx             # User menu

lib/
  config/
    navigation.ts                 # Nav items configuration
  hooks/
    use-media-query.ts            # Responsive breakpoint hook
    use-keyboard-shortcuts.ts     # Global keyboard shortcuts
    use-sidebar-state.ts          # Sidebar collapse state management

app/
  api/
    notifications/
      count/
        route.ts                  # Notification count endpoint
```

## Required Dependencies

All dependencies already installed:

- ✅ `lucide-react` - Icons
- ✅ `next` - Link, usePathname
- ✅ `next-auth` - Authentication
- ✅ shadcn/ui components - Button, Dropdown, Command

**New shadcn components to install:**

- `npx shadcn@latest add command` - Command palette
- `npx shadcn@latest add dropdown-menu` - User dropdown (if not already installed)

## Success Criteria

### Functional Requirements

- ✅ Navigation visible on all protected pages
- ✅ Sidebar toggles correctly on desktop
- ✅ Mobile menu opens/closes with hamburger
- ✅ Active page highlighted in navigation
- ✅ Logo links to dashboard
- ✅ User dropdown shows profile options
- ✅ Sign out functionality works
- ✅ Notification bell displays (placeholder count)
- ✅ Command palette opens with Cmd+K / Ctrl+K
- ✅ FAB visible on mobile only
- ✅ All placeholder pages accessible via navigation

### UX Requirements

- ✅ Smooth transitions between states
- ✅ Touch targets min 44x44px on mobile
- ✅ Sidebar state persists across sessions (desktop)
- ✅ Mobile menu auto-closes after navigation
- ✅ Backdrop overlay blocks content interaction
- ✅ No layout shift when sidebar expands/collapses
- ✅ Focus states visible for keyboard navigation
- ✅ No horizontal scroll on any viewport size

### Visual Requirements

- ✅ Consistent HelixIntel branding (#216093 primary color)
- ✅ Proper spacing and alignment
- ✅ Icons sized consistently (16x16 in nav, 20x20 in top bar)
- ✅ Active state clearly distinguishable
- ✅ Disabled items visually distinct (gray, lower opacity)
- ✅ Mobile FAB doesn't overlap content
- ✅ Top bar shadow/border separates from content

### Technical Requirements

- ✅ No TypeScript errors (`npm run typecheck`)
- ✅ No ESLint warnings (`npm run lint`)
- ✅ Authentication checks on all protected routes
- ✅ Proper use of Next.js Link with prefetch
- ✅ Client components use 'use client' directive
- ✅ Server components handle auth checks
- ✅ localStorage access wrapped in client-side checks
- ✅ Responsive design works 320px-4096px viewport widths

## Testing Checklist

### Desktop Testing

- [ ] Sidebar collapses to icon-only view
- [ ] Sidebar expands on hover when collapsed
- [ ] Click hamburger toggles persistent collapse state
- [ ] Sidebar state persists after page refresh
- [ ] Active page highlighted correctly
- [ ] User dropdown opens on click
- [ ] Sign out redirects to login page
- [ ] Command palette opens with Cmd+K
- [ ] Notification bell shows count badge
- [ ] All navigation links work
- [ ] No content shift when sidebar toggles
- [ ] Focus states visible with keyboard navigation

### Mobile Testing

- [ ] Top bar displays correctly
- [ ] Hamburger icon visible
- [ ] Sidebar slides in from left
- [ ] Backdrop overlay appears behind sidebar
- [ ] Click backdrop closes sidebar
- [ ] Click nav item closes sidebar
- [ ] FAB visible in bottom-right corner
- [ ] FAB click triggers action (placeholder)
- [ ] Touch targets large enough (44x44px min)
- [ ] No horizontal scroll
- [ ] Navigation usable in landscape orientation

### Responsive Testing

- [ ] Test at 320px width (iPhone SE)
- [ ] Test at 375px width (iPhone standard)
- [ ] Test at 768px width (iPad portrait)
- [ ] Test at 1024px width (desktop breakpoint)
- [ ] Test at 1920px width (large desktop)
- [ ] Smooth transition between mobile/desktop layouts

### Accessibility Testing

- [ ] Tab navigation works through all interactive elements
- [ ] Focus indicator visible on all focusable items
- [ ] Screen reader announces page changes
- [ ] Keyboard shortcuts work
- [ ] Escape key closes overlays
- [ ] Semantic HTML used throughout
- [ ] ARIA labels on icon-only buttons

## Performance Considerations

- **Code Splitting:** Navigation components load only once (persistent layout)
- **Prefetching:** All navigation links use `prefetch={true}` for instant navigation
- **Local Storage:** Sidebar state cached to prevent flash on load
- **Optimistic UI:** Navigation change happens immediately (before server response)
- **Animations:** Use CSS transforms (GPU-accelerated) not layout properties
- **Icon Loading:** Lucide icons tree-shaken, only used icons bundled

## Accessibility Standards

- **WCAG 2.1 AA Compliance:**
  - Color contrast ratios meet 4.5:1 for text
  - Focus indicators visible and consistent
  - Touch targets min 44x44px
  - Keyboard navigation fully supported
  - Screen reader friendly markup

- **Semantic HTML:**
  - `<nav>` element for navigation containers
  - `<button>` for interactive elements (not divs)
  - `<a>` elements for links (Next.js Link)
  - Proper heading hierarchy (h1, h2, etc.)

- **ARIA Attributes:**
  - `aria-label` on icon-only buttons
  - `aria-expanded` on collapsible elements
  - `aria-current="page"` on active navigation item
  - `aria-hidden` on decorative icons

## Future Enhancements

Features to consider after MVP:

1. **Navigation Search:** Fuzzy search through assets, tasks, and content in command palette
2. **Recent Items:** Show recently viewed assets/tasks in command palette
3. **Breadcrumbs:** Add breadcrumb navigation for nested pages
4. **Favorites:** Pin frequently used pages to top of sidebar
5. **Multi-Home Support:** Dropdown to switch between multiple homes
6. **Notification Panel:** Full notification history panel (Task 7)
7. **User Presence:** Show online/offline status
8. **Tour/Onboarding:** Interactive product tour for first-time users
9. **Dark Mode:** Toggle for dark theme (with persistence)
10. **Customization:** Allow users to reorder nav items

## Notes

- Use existing authentication patterns from `/app/api/auth`
- Follow existing component patterns from `/components/ui`
- Maintain TailwindCSS v4 syntax throughout
- Keep mobile-first approach consistent with project guidelines
- Ensure navigation works without JavaScript (progressive enhancement where possible)
- Test with actual users for usability feedback

## Time Estimate

**8-12 hours** for complete implementation including:

- Layout components (4-5 hours)
- Responsive behavior (2-3 hours)
- Placeholder pages (1 hour)
- Testing and polish (2-3 hours)

## Rollback Plan

If issues occur:

- Navigation is additive - can disable by reverting layout.tsx wrapper
- No database changes in this task
- No API route changes beyond placeholder notification count
- Can incrementally enable features (start with desktop, add mobile later)

---

**Status**: 🔲 NOT STARTED

**Assigned to**: AI Coding Agent

**Dependencies**:

- ✅ Authentication system (completed)
- ✅ Protected route structure (completed)
- ✅ Asset pages (completed - Task 3)

**Blocks**:

- Task 5: Task Management System (needs navigation to access)
- Task 6: Maintenance Templates (needs navigation to access)
- Task 7: Dashboard Enhancement (needs navigation framework)

**Last Updated**: 2025-10-06

# Front-End Performance Optimization Plan - Phase 2

## Executive Summary

Despite achieving a 97/100 Lighthouse score in Task 11, users still perceive slowness. This plan addresses **perceived performance** issues that Lighthouse doesn't fully capture, including client-side hydration, navigation transitions, and progressive loading patterns.

---

## Current State Analysis

### What's Already Optimized (Task 7a/11)

- Server-side caching (5-min TTL)
- TanStack Query with aligned staleTime
- Dynamic imports for Recharts
- React.memo on dashboard components
- Suspense boundaries with skeletons
- Database indexes
- optimizePackageImports in next.config.js

### Identified Gaps Causing Perceived Slowness

| Issue                             | Impact                             | Priority |
| --------------------------------- | ---------------------------------- | -------- |
| Missing route loading states      | High - blank screens on navigation | P0       |
| Heavy client components hydration | High - TTI delay                   | P0       |
| Image optimization gaps           | Medium - LCP affected              | P1       |
| Navigation prefetch missing       | Medium - navigation feels slow     | P1       |
| No virtualization for long lists  | Medium - scroll jank               | P2       |
| Template browser 1100+ lines      | Low - large component              | P2       |

---

## Phase 2 Optimization Plan

### 1. Add Route-Level Loading States (P0)

**Problem:** Only `/assets` routes have `loading.tsx`. Dashboard, tasks, and templates show blank screens during RSC fetches.

**Solution:** Add loading.tsx files with skeleton screens to all routes.

**Files to create:**

- `app/(protected)/dashboard/loading.tsx`
- `app/(protected)/tasks/loading.tsx`
- `app/(protected)/tasks/[id]/loading.tsx`
- `app/(protected)/templates/loading.tsx`
- `app/(protected)/settings/loading.tsx`

**Implementation:**

```tsx
// app/(protected)/dashboard/loading.tsx
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeletons'
export default function Loading() {
  return <DashboardSkeleton />
}
```

---

### 2. Optimize Client Component Hydration (P0)

**Problem:** `AppLayout` is a 'use client' component loaded on every page, causing hydration overhead.

**Solutions:**

#### 2a. Split Sidebar into Server/Client parts

```tsx
// components/layout/sidebar-nav.tsx (Server Component)
export function SidebarNav({ currentPath }) {
  return (
    <nav>
      {items.map((item) => (
        <SidebarLink
          key={item.href}
          item={item}
          active={currentPath === item.href}
        />
      ))}
    </nav>
  )
}

// components/layout/sidebar-client.tsx ('use client')
// Only handles interactive features like collapse toggle, tooltips
```

#### 2b. Defer CommandPalette Loading

```tsx
// Current: Always loaded
<CommandPalette open={isCommandPaletteOpen} ... />

// Optimized: Only load when triggered
{isCommandPaletteOpen && (
  <Suspense fallback={null}>
    <CommandPalette ... />
  </Suspense>
)}
```

---

### 3. Image Optimization (P1)

**Problem:** Asset cards missing `sizes` and `priority`, completion photos use raw `<img>`.

**Solutions:**

#### 3a. Add sizes to asset card images

```tsx
// components/assets/asset-card.tsx
<Image
  src={asset.photoUrl}
  alt={asset.name}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

#### 3b. Replace raw img tags with Next/Image

```tsx
// app/(protected)/tasks/[id]/task-detail-client.tsx
// Replace <img src={photo} ... /> with:
<Image
  src={photo}
  alt={`Completion photo ${index + 1}`}
  width={400}
  height={192}
  className="rounded-lg border object-cover"
/>
```

#### 3c. Add priority to above-fold images

```tsx
// First asset in grid should be priority
{
  filteredAssets.map((asset, index) => (
    <AssetCard key={asset.id} asset={asset} priority={index < 2} />
  ))
}
```

---

### 4. Navigation Prefetching (P1)

**Problem:** Sidebar links don't prefetch, template actions use `window.location.href`.

**Solutions:**

#### 4a. Add prefetch to sidebar links

```tsx
// components/layout/sidebar.tsx
<Link href={item.href} prefetch={true} ... />
```

#### 4b. Replace window.location with router.push

```tsx
// components/templates/template-browser.tsx
const router = useRouter()
// Replace: window.location.href = `/assets?applyTemplate=${template.id}`
// With: router.push(`/assets?applyTemplate=${template.id}`)
```

---

### 5. List Virtualization (P2)

**Problem:** react-window is installed but not used. Long asset/task lists render all items.

**Solution:** Virtualize lists with 20+ items.

```tsx
// components/assets/asset-list-virtualized.tsx
import { FixedSizeList } from 'react-window'

export function VirtualizedAssetList({ assets }) {
  if (assets.length < 20) {
    return <StandardAssetList assets={assets} />
  }

  return (
    <FixedSizeList
      height={600}
      itemCount={assets.length}
      itemSize={120}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <AssetCard asset={assets[index]} />
        </div>
      )}
    </FixedSizeList>
  )
}
```

---

### 6. Template Browser Optimization (P2)

**Problem:** 1100+ line component with many inline components.

**Solutions:**

#### 6a. Extract sub-components

- `TemplateGrid.tsx` - Grid view rendering
- `TemplateListView.tsx` - List view rendering
- `TemplatePagination.tsx` - Pagination controls
- `TemplateFilters.tsx` - Category tabs and search

#### 6b. Add intersection observer for lazy loading

```tsx
// Only render templates when in viewport
import { useInView } from 'react-intersection-observer'

function TemplateCard({ template }) {
  const { ref, inView } = useInView({ triggerOnce: true })

  return (
    <div ref={ref}>
      {inView ? (
        <ActualTemplateCard template={template} />
      ) : (
        <TemplateSkeleton />
      )}
    </div>
  )
}
```

---

### 7. Progressive Navigation Enhancement

**Problem:** No visual feedback during navigation transitions.

**Solution:** Add NProgress-style loading bar.

```tsx
// components/layout/navigation-progress.tsx
'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setIsNavigating(false)
  }, [pathname, searchParams])

  if (!isNavigating) return null

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-[#216093] animate-pulse z-50" />
  )
}
```

---

## Implementation Priority Matrix

| Phase | Items                  | Estimated Effort | Impact |
| ----- | ---------------------- | ---------------- | ------ |
| 1     | Route loading states   | 2-3 hours        | High   |
| 2     | Image optimization     | 1-2 hours        | Medium |
| 3     | Navigation prefetch    | 1 hour           | Medium |
| 4     | Command palette defer  | 30 mins          | Low    |
| 5     | List virtualization    | 3-4 hours        | Medium |
| 6     | Template browser split | 4-6 hours        | Low    |

---

## Metrics to Track

### Before/After Measurements

- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)

### User-Perceived Metrics

- Navigation transition time
- Time to first meaningful content
- Scroll performance (FPS)

---

## Testing Plan

1. **Lighthouse Audits** - Maintain 90+ score
2. **Chrome DevTools Performance** - Check hydration waterfall
3. **React DevTools Profiler** - Identify re-render issues
4. **Real Device Testing** - iPhone SE (375px), slower Android
5. **Network Throttling** - Test on "Slow 3G" preset

---

## Success Criteria

- Navigation between routes feels instant (< 200ms perceived)
- No blank screens during page transitions
- Asset/task lists scroll at 60fps with 50+ items
- LCP < 2.0s on dashboard
- TTI < 3.0s on initial load

---

## Files Modified/Created

### New Files

- `app/(protected)/dashboard/loading.tsx`
- `app/(protected)/tasks/loading.tsx`
- `app/(protected)/tasks/[id]/loading.tsx`
- `app/(protected)/templates/loading.tsx`
- `app/(protected)/settings/loading.tsx`
- `components/layout/navigation-progress.tsx`
- `components/assets/asset-list-virtualized.tsx`

### Modified Files

- `components/layout/app-layout.tsx`
- `components/layout/sidebar.tsx`
- `components/assets/asset-card.tsx`
- `components/assets/asset-list.tsx`
- `components/templates/template-browser.tsx`
- `app/(protected)/tasks/[id]/task-detail-client.tsx`

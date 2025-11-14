# Task 7a: Performance Optimization & Load Time Improvements

## Overview

Optimize the HelixIntel application to reduce page load times, improve perceived performance, and enhance the user experience. Current observations show slow initial page loads (3-5 seconds), massive JavaScript bundles (2,728+ modules), and inefficient database queries causing dashboard delays. This task addresses these bottlenecks through strategic code splitting, query optimization, and performance best practices.

## Core Objectives

- **Reduce initial page load time** from 3-5 seconds to under 2 seconds
- **Decrease JavaScript bundle size** by implementing dynamic imports for heavy libraries (Recharts, etc.)
- **Optimize database queries** to eliminate N+1 problems and reduce API response times from 1.2s to under 300ms
- **Implement database indexing** for frequently queried fields
- **Add proper loading states** with skeleton screens for better perceived performance

## Technical Requirements

### Bundle Size Optimization

**Current State:**

- Dashboard compiles 2,728 modules (3s compilation time)
- API routes compile 1,092 modules
- Recharts library loaded on initial page load

**Target State:**

- Reduce dashboard modules to ~500 by lazy loading charts
- Implement code splitting for heavy components
- Use dynamic imports with loading fallbacks

### Database Query Optimization

**Current Issues:**

- Cost summary API makes 7 sequential queries (one per month)
- Dashboard makes 4 parallel API calls each taking ~1.2 seconds
- Multiple redundant queries for home/user data
- No database indexes on frequently queried fields

**Optimizations:**

- Consolidate month-over-month queries into single aggregate query
- Add database indexes on foreign keys and date fields
- Implement query result caching for dashboard stats
- Use Prisma's `include` to reduce round trips

### Performance Monitoring

- Add performance logging to API routes
- Implement bundle analyzer to track size changes
- Monitor Core Web Vitals (LCP, FID, CLS)
- Add query performance tracking

## Implementation Details

### 1. Dynamic Import Strategy

**Components to Lazy Load:**

- Recharts library and chart components
- Template details drawer
- Apply template modal
- Task completion modal
- Heavy dashboard widgets

**Pattern:**

```typescript
const ChartComponent = dynamic(() => import('./chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});
```

### 2. Database Indexing

**Indexes to Add:**

```prisma
@@index([userId])           // User lookups
@@index([homeId])           // Home-based queries
@@index([status])           // Task filtering
@@index([dueDate])          // Task scheduling
@@index([completedAt])      // Analytics queries
@@index([homeId, status])   // Composite for common queries
```

### 3. Query Consolidation

**Cost Summary Optimization:**

- Replace 7 sequential month queries with single aggregate query
- Use Prisma's `groupBy` with date truncation
- Reduce API response time from 1.2s to ~200ms

**Dashboard Stats Optimization:**

- Combine multiple count queries into single transaction
- Use `_count` with nested includes
- Implement Redis/memory caching for 5-minute TTL

### 4. Code Splitting Targets

**High-Impact Pages:**

- Dashboard analytics widgets (Recharts)
- Template browser (large component tree)
- Task calendar view
- Asset photo upload

**Splitting Strategy:**

- Route-based splitting (Next.js automatic)
- Component-based splitting (manual dynamic imports)
- Library splitting (vendor chunks)

## UI Components

### Loading States

**Components to Create:**

- `ChartSkeleton` - Loading placeholder for analytics charts
- `DashboardWidgetSkeleton` - Generic widget loader
- `CalendarSkeleton` - Calendar loading state
- `TableSkeleton` - Data table loader

**Pattern:**

- Skeleton screens match final content layout
- Use shimmer animation for polish
- Show immediately (no loading spinner delay)

### Optimistic Updates

**Areas for Optimistic UI:**

- Task completion (instant feedback)
- Asset creation (show immediately)
- Template application (update UI before API)

## Performance Optimizations

### Bundle Size Targets

| Component   | Current       | Target         | Strategy        |
| ----------- | ------------- | -------------- | --------------- |
| Dashboard   | 2,728 modules | <500 modules   | Dynamic imports |
| Auth routes | 1,092 modules | <300 modules   | Code splitting  |
| Templates   | Unknown       | <400 modules   | Lazy modals     |
| Total JS    | Unknown       | <500KB gzipped | Tree shaking    |

### Query Performance Targets

| Endpoint                     | Current | Target | Method                   |
| ---------------------------- | ------- | ------ | ------------------------ |
| /api/dashboard/analytics     | 1,209ms | <300ms | Indexing + consolidation |
| /api/dashboard/cost-summary  | 1,218ms | <200ms | Single aggregate query   |
| /api/dashboard/calendar      | 1,200ms | <300ms | Optimized includes       |
| /api/dashboard/activity-feed | 1,203ms | <250ms | Pagination + indexing    |

### Caching Strategy

**Server-Side Caching:**

- Dashboard stats: 5-minute TTL (in-memory)
- Template list: 15-minute TTL
- User session data: Request-scoped cache

**Client-Side Caching:**

- TanStack Query staleTime: 5 minutes for dashboard data
- Aggressive prefetching on hover
- Optimistic updates with background revalidation

### Next.js Configuration

**Production Optimizations:**

```javascript
// next.config.js
{
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
  swcMinify: true,
}
```

## Testing Requirements

### Performance Tests

**Lighthouse Audits:**

- [ ] Performance score >90
- [ ] LCP <2.5 seconds
- [ ] FID <100ms
- [ ] CLS <0.1

**Bundle Analysis:**

- [ ] Run webpack-bundle-analyzer
- [ ] Verify code splitting effectiveness
- [ ] Check for duplicate dependencies

**Database Performance:**

- [ ] Verify all queries use indexes
- [ ] Measure query execution time
- [ ] Test with larger datasets (100+ assets, 1000+ tasks)

### Load Testing

- [ ] Measure cold start performance
- [ ] Test with slow 3G connection
- [ ] Verify skeleton screens appear instantly
- [ ] Confirm API responses under 300ms

## Success Metrics

### Quantifiable Targets

- **Initial Page Load:** <2 seconds (from 3-5s)
- **Dashboard Load:** <2 seconds total (from 5s+)
- **API Response Time:** <300ms average (from 1.2s)
- **Bundle Size:** <500KB gzipped total JS
- **Lighthouse Score:** >90 performance
- **Module Count:** <500 per route (from 2,728)

### User Experience Goals

- Instant visual feedback on all interactions
- No "white screen" during navigation
- Smooth animations and transitions
- Perceived performance improvement of 50%+

## Security Considerations

**Cache Security:**

- Never cache user-specific data globally
- Use user-scoped cache keys
- Implement proper cache invalidation on data changes
- Secure cache keys with user ID prefix

**Query Optimization Security:**

- Maintain authorization checks despite query consolidation
- Validate all input parameters before aggregation
- Prevent SQL injection through Prisma parameterization
- Rate limit expensive queries

## Development Checklist

See accompanying file: `task-7a-checklist.md`

## Dependencies

### Prerequisites

- Task 7 complete (Dashboard Enhancement)
- Working database with seed data
- TanStack Query configured

### External Libraries

- `next-bundle-analyzer` (devDependency)
- No new runtime dependencies required

### Database Changes

- Migration for adding indexes
- No schema changes required

## Estimated Time

| Component                        | Hours   |
| -------------------------------- | ------- |
| Database indexing & migration    | 1h      |
| Query optimization (4 endpoints) | 4h      |
| Dynamic imports implementation   | 3h      |
| Skeleton loading states          | 2h      |
| Caching layer implementation     | 2h      |
| Next.js config optimization      | 1h      |
| Testing & verification           | 2h      |
| Bundle analysis & refinement     | 2h      |
| Documentation updates            | 1h      |
| **Total**                        | **18h** |

## Implementation Plan

### Phase 1: Database Optimization (2h)

1. Add indexes to schema
2. Create migration
3. Optimize cost-summary query
4. Test query performance

### Phase 2: Code Splitting (3h)

1. Implement dynamic imports for Recharts
2. Lazy load dashboard widgets
3. Split template modals
4. Verify bundle size reduction

### Phase 3: Query Consolidation (3h)

1. Refactor dashboard APIs
2. Implement request caching
3. Optimize includes and selects
4. Add performance logging

### Phase 4: Loading States (2h)

1. Create skeleton components
2. Add to all async boundaries
3. Implement shimmer animations
4. Test UX improvements

### Phase 5: Configuration & Testing (8h)

1. Optimize Next.js config
2. Run bundle analyzer
3. Lighthouse audits
4. Load testing
5. Performance profiling
6. Documentation

## Notes

### Important Considerations

- **Development vs Production:** Many optimizations only visible in production build
- **Measurement First:** Always measure before and after each optimization
- **Incremental Approach:** Implement one optimization at a time to measure impact
- **User Perception:** Focus on perceived performance (skeleton screens) as much as actual speed

### Potential Gotchas

- Dynamic imports increase code complexity
- Caching can cause stale data issues if not invalidated properly
- Database indexes slow down writes (minimal impact for CMMS use case)
- Bundle analyzer requires production build

### Future Enhancements

- Implement Redis for distributed caching (when scaling)
- Add service worker for offline support
- Implement route prefetching on hover
- Consider edge caching with Vercel/Cloudflare
- Add real-user monitoring (RUM)

### Performance Baseline

**Before Optimization:**

- Dashboard: 3s first load, 5s+ with API calls
- Bundle: 2,728 modules on dashboard
- API: 1.2s average response time
- Database: No indexes on foreign keys

**After Optimization (Target):**

- Dashboard: <2s total load time
- Bundle: <500 modules per route
- API: <300ms average response time
- Database: Indexed on all query paths

---

_Task Created: October 2025_
_Estimated Completion: 18 hours_
_Priority: High (directly impacts user experience)_

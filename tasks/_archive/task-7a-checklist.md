# Task 7a Implementation Checklist: Performance Optimization

## Phase 1: Database Optimization & Indexing

### 1.1 Database Schema Updates

- [ ] Update Prisma schema with performance indexes
  - [ ] Add index on `Task.homeId`
  - [ ] Add index on `Task.status`
  - [ ] Add index on `Task.dueDate`
  - [ ] Add index on `Task.completedAt`
  - [ ] Add composite index on `Task(homeId, status)`
  - [ ] Add index on `Asset.homeId`
  - [ ] Add index on `ActivityLog.homeId`
  - [ ] Add index on `ActivityLog.createdAt`
  - [ ] Add index on `RecurringSchedule.assetId`
  - [ ] Verify schema changes compile without errors

- [ ] Create and test migration
  - [ ] Run `npx prisma migrate dev --name add_performance_indexes`
  - [ ] Verify migration applied successfully
  - [ ] Test rollback procedure
  - [ ] Update seed script if needed

### 1.2 Query Performance Testing

- [ ] Establish baseline metrics
  - [ ] Measure current API response times
  - [ ] Document slow queries with Prisma query logging
  - [ ] Record bundle sizes before optimization
  - [ ] Take Lighthouse audit screenshots

## Phase 2: API Query Optimization

### 2.1 Cost Summary API Refactoring

- [ ] Optimize month-over-month query
  - [ ] Replace 7 sequential queries with single aggregate
  - [ ] Implement date grouping with Prisma
  - [ ] Add query result caching (5-minute TTL)
  - [ ] Test with various date ranges
  - [ ] Verify response time <200ms

- [ ] Update `/api/dashboard/cost-summary/route.ts`
  - [ ] Consolidate task queries
  - [ ] Use `groupBy` for monthly aggregation
  - [ ] Optimize category breakdown query
  - [ ] Add performance logging
  - [ ] Test edge cases (no data, single month)

### 2.2 Dashboard Analytics API Optimization

- [ ] Optimize `/api/dashboard/analytics/route.ts`
  - [ ] Consolidate home lookups into single query
  - [ ] Optimize completion trend query with date indexing
  - [ ] Use efficient groupBy for category breakdown
  - [ ] Cache results with 5-minute expiry
  - [ ] Verify response time <300ms

### 2.3 Calendar API Optimization

- [ ] Optimize `/api/dashboard/maintenance-calendar/route.ts`
  - [ ] Use single query with date range filter
  - [ ] Optimize task includes (only needed fields)
  - [ ] Add query caching
  - [ ] Reduce asset lookups with efficient joins
  - [ ] Test with large task counts (100+)

### 2.4 Activity Feed API Optimization

- [ ] Optimize `/api/dashboard/activity-feed/route.ts`
  - [ ] Verify pagination uses indexes
  - [ ] Optimize count query
  - [ ] Use cursor-based pagination if needed
  - [ ] Cache recent activities
  - [ ] Test scroll performance

## Phase 3: Code Splitting & Dynamic Imports

### 3.1 Dashboard Widget Code Splitting

- [ ] Implement dynamic imports for chart components
  - [ ] Create `ChartSkeleton` component
  - [ ] Lazy load `AnalyticsChart` component
  - [ ] Add loading fallback with skeleton
  - [ ] Verify chart still renders correctly
  - [ ] Test on slow 3G connection

- [ ] Lazy load other heavy widgets
  - [ ] Dynamic import for `CostSummary` (if using charts)
  - [ ] Lazy load `MaintenanceCalendarWidget`
  - [ ] Add appropriate skeleton screens
  - [ ] Verify all widgets load properly

### 3.2 Recharts Library Optimization

- [ ] Implement selective Recharts imports
  - [ ] Replace bulk import with named imports
  - [ ] Only import used chart components
  - [ ] Verify bundle size reduction
  - [ ] Test all chart types still work

- [ ] Add chart loading states
  - [ ] Create reusable `ChartSkeleton` component
  - [ ] Match skeleton to actual chart dimensions
  - [ ] Add shimmer animation
  - [ ] Test perceived performance improvement

### 3.3 Template Page Code Splitting

- [ ] Optimize template modals
  - [ ] Lazy load `ApplyTemplateModal` component
  - [ ] Lazy load `TemplateDetailsDrawer` component
  - [ ] Add loading indicators
  - [ ] Verify modal functionality unchanged
  - [ ] Test open/close performance

### 3.4 Task Components Code Splitting

- [ ] Lazy load task-related modals
  - [ ] Dynamic import `TaskCompletionModal`
  - [ ] Dynamic import `TaskDetailDrawer`
  - [ ] Add skeleton loading states
  - [ ] Test task completion flow

## Phase 4: Loading States & Skeleton Screens

### 4.1 Create Skeleton Components

- [ ] Build reusable skeleton components
  - [ ] `DashboardWidgetSkeleton` - generic widget loader
  - [ ] `ChartSkeleton` - for analytics charts
  - [ ] `TableSkeleton` - for data tables
  - [ ] `CalendarSkeleton` - for calendar views
  - [ ] `CardGridSkeleton` - for asset/template grids
  - [ ] Add shimmer animation CSS

### 4.2 Implement Skeleton Screens

- [ ] Add skeletons to dashboard page
  - [ ] Replace loading spinners with skeletons
  - [ ] Match skeleton layout to actual content
  - [ ] Ensure instant display (no delay)
  - [ ] Test on slow connections

- [ ] Add skeletons to other pages
  - [ ] Assets list page
  - [ ] Tasks list page
  - [ ] Templates browser
  - [ ] Task calendar view

### 4.3 Optimistic UI Updates

- [ ] Implement optimistic updates
  - [ ] Task completion shows immediately
  - [ ] Asset creation updates list instantly
  - [ ] Template application provides instant feedback
  - [ ] Handle rollback on errors
  - [ ] Test error scenarios

## Phase 5: Caching Implementation

### 5.1 API Response Caching

- [ ] Create caching utility
  - [ ] Build in-memory cache with TTL
  - [ ] Implement user-scoped cache keys
  - [ ] Add cache invalidation helpers
  - [ ] Test cache expiry behavior

- [ ] Implement caching in dashboard APIs
  - [ ] Cache analytics data (5-minute TTL)
  - [ ] Cache cost summary (5-minute TTL)
  - [ ] Cache calendar data (5-minute TTL)
  - [ ] Invalidate on data changes (mutations)

### 5.2 Client-Side Cache Tuning

- [ ] Optimize TanStack Query configuration
  - [ ] Set appropriate `staleTime` for dashboard hooks
  - [ ] Configure `gcTime` for cache retention
  - [ ] Implement prefetching on hover
  - [ ] Test cache behavior on navigation

## Phase 6: Next.js Configuration Optimization

### 6.1 Production Optimizations

- [ ] Update `next.config.js`
  - [ ] Enable SWC minification
  - [ ] Add `removeConsole` for production
  - [ ] Configure `optimizePackageImports` for Recharts
  - [ ] Enable compression
  - [ ] Test production build

### 6.2 Bundle Analysis

- [ ] Install and configure bundle analyzer
  - [ ] Add `@next/bundle-analyzer` package
  - [ ] Create npm script for analysis
  - [ ] Run analyzer on production build
  - [ ] Document bundle composition

- [ ] Analyze bundle results
  - [ ] Identify largest dependencies
  - [ ] Find duplicate modules
  - [ ] Look for unnecessary imports
  - [ ] Create optimization action items

## Phase 7: Performance Testing & Verification

### 7.1 Lighthouse Audits

- [ ] Run Lighthouse on key pages
  - [ ] Dashboard page (authenticated)
  - [ ] Assets list page
  - [ ] Templates page
  - [ ] Task list page
  - [ ] Document baseline scores

- [ ] Verify performance targets
  - [ ] Performance score >90
  - [ ] LCP <2.5 seconds
  - [ ] FID <100ms
  - [ ] CLS <0.1
  - [ ] Take comparison screenshots

### 7.2 API Performance Testing

- [ ] Measure API response times
  - [ ] Test `/api/dashboard/analytics` <300ms
  - [ ] Test `/api/dashboard/cost-summary` <200ms
  - [ ] Test `/api/dashboard/calendar` <300ms
  - [ ] Test `/api/dashboard/activity-feed` <250ms
  - [ ] Document improvements vs baseline

### 7.3 Bundle Size Verification

- [ ] Verify bundle reductions
  - [ ] Dashboard modules <500 (from 2,728)
  - [ ] Auth modules <300 (from 1,092)
  - [ ] Total gzipped JS <500KB
  - [ ] Compare before/after analysis reports

### 7.4 Load Testing

- [ ] Test under various conditions
  - [ ] Fast 4G connection
  - [ ] Slow 3G connection
  - [ ] Desktop Chrome
  - [ ] Mobile Safari
  - [ ] Test with 100+ assets/tasks

### 7.5 Database Query Verification

- [ ] Verify index usage
  - [ ] Check Prisma query logs
  - [ ] Ensure indexes are utilized
  - [ ] No table scans on large tables
  - [ ] Query execution plans look optimal

## Phase 8: Documentation & Polish

### 8.1 Performance Documentation

- [ ] Update CLAUDE.md
  - [ ] Add performance optimization section
  - [ ] Document caching strategies
  - [ ] List performance targets achieved
  - [ ] Note bundle size improvements

- [ ] Create performance guide
  - [ ] Document optimization techniques used
  - [ ] Provide bundle analysis instructions
  - [ ] List performance monitoring tools
  - [ ] Add troubleshooting tips

### 8.2 Code Documentation

- [ ] Add performance comments
  - [ ] Document dynamic imports
  - [ ] Explain caching decisions
  - [ ] Note index usage in queries
  - [ ] Add query optimization comments

### 8.3 Update Task Progress

- [ ] Update task-7a-checklist.md
  - [ ] Mark all completed items
  - [ ] Note any deviations from plan
  - [ ] Document lessons learned
  - [ ] List any follow-up tasks

## Verification & Sign-Off

### Functional Requirements

- [ ] All pages load without errors
- [ ] Dashboard displays all widgets correctly
- [ ] Charts render with real data
- [ ] API responses are accurate
- [ ] Caching invalidates properly on updates
- [ ] Optimistic updates work correctly

### Non-Functional Requirements

- [ ] Initial page load <2 seconds
- [ ] Dashboard full load <2 seconds
- [ ] API average response <300ms
- [ ] Bundle size reduced by >70%
- [ ] Lighthouse performance score >90
- [ ] No console errors or warnings
- [ ] All TypeScript errors resolved
- [ ] ESLint passes without issues

### Performance Targets Achieved

- [ ] Dashboard load time: \_\_\_s (target <2s)
- [ ] Module count: \_\_\_ (target <500)
- [ ] Analytics API: \_\_\_ms (target <300ms)
- [ ] Cost summary API: \_\_\_ms (target <200ms)
- [ ] Calendar API: \_\_\_ms (target <300ms)
- [ ] Bundle size: \_\_\_KB gzipped (target <500KB)
- [ ] Lighthouse score: \_\_\_ (target >90)

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Final Checks

- [ ] Production build completes successfully
- [ ] No regression in existing features
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Performance metrics documented
- [ ] Code committed with descriptive message
- [ ] Task marked complete in project tracker

---

## Notes

### Performance Baseline (Before)

- Dashboard load: 3-5 seconds
- Dashboard modules: 2,728
- API response times: ~1,200ms
- No database indexes on foreign keys

### Performance Targets (After)

- Dashboard load: <2 seconds
- Dashboard modules: <500
- API response times: <300ms
- All query paths indexed

### Key Success Metrics

- [ ] 50%+ reduction in perceived load time
- [ ] 80%+ reduction in module count
- [ ] 75%+ reduction in API response time
- [ ] Lighthouse performance score >90

---

_Checklist Created: October 2025_
_Total Items: 150+_
_Estimated Completion: 18 hours_

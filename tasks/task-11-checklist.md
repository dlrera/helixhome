# Task 11 Implementation Checklist: Performance Investigation & Critical Optimization

## Phase 1: Task 7a Verification & Investigation

### 1.1 Verify Task 7a Implementation

- [ ] Check database indexes exist
  - [ ] Run: `ls prisma/migrations`
  - [ ] Find migration: `*_add_performance_indexes`
  - [ ] Read migration file to verify indexes
  - [ ] Confirm indexes on: Task.completedAt, Task(homeId+status), RecurringSchedule.templateId
  - [ ] Run: `npx prisma studio` and check indexes visually

- [ ] Verify caching implementation
  - [ ] Check file exists: `lib/utils/cache.ts`
  - [ ] Read cache implementation
  - [ ] Verify TTL settings (5-min for dashboard, 2-min for activity)
  - [ ] Check cache is used in API routes
  - [ ] Look for `dashboardCache` usage

- [ ] Verify client-side cache configuration
  - [ ] Check file exists: `lib/hooks/use-dashboard.ts`
  - [ ] Read TanStack Query config
  - [ ] Verify `staleTime` aligned with server cache
  - [ ] Check `refetchOnWindowFocus: false`
  - [ ] Verify cache times appropriate

- [ ] Verify code splitting implementation
  - [ ] Check file exists: `components/dashboard/analytics-charts-lazy.tsx`
  - [ ] Look for `dynamic()` imports
  - [ ] Find `AnalyticsChart` lazy loading
  - [ ] Check template modals lazy loaded
  - [ ] Verify `ssr: false` on heavy components

- [ ] Verify Next.js configuration
  - [ ] Open `next.config.js`
  - [ ] Check `removeConsole` for production
  - [ ] Verify `optimizePackageImports` for recharts
  - [ ] Check SWC minification enabled
  - [ ] Verify compression enabled
  - [ ] Look for bundle analyzer integration

- [ ] Document findings
  - [ ] List what IS implemented from Task 7a
  - [ ] List what is MISSING from Task 7a
  - [ ] Note any discrepancies
  - [ ] Create baseline assessment

### 1.2 Establish Accurate Baseline Measurements

- [ ] Build production bundle
  - [ ] Run: `pnpm build`
  - [ ] Check build output for errors
  - [ ] Note bundle sizes reported
  - [ ] Check if build completes successfully
  - [ ] Verify production optimizations applied

- [ ] Start production server
  - [ ] Run: `pnpm start`
  - [ ] Wait for server to start
  - [ ] Verify server running on port 3000
  - [ ] Check console for errors

- [ ] Measure production dashboard load time
  - [ ] Open Chrome DevTools
  - [ ] Open Performance tab
  - [ ] Clear browser cache
  - [ ] Start recording
  - [ ] Navigate to http://localhost:3000/login
  - [ ] Login as admin@example.com
  - [ ] Wait for dashboard to fully load
  - [ ] Stop recording
  - [ ] Note total time from login to dashboard loaded

- [ ] Analyze performance timeline
  - [ ] Identify TTFB (Time to First Byte)
  - [ ] Identify FCP (First Contentful Paint)
  - [ ] Identify LCP (Largest Contentful Paint)
  - [ ] Identify TTI (Time to Interactive)
  - [ ] Note any long tasks (>50ms)
  - [ ] Check network waterfall
  - [ ] Identify slowest requests

- [ ] Run Lighthouse audit (production)
  - [ ] Open Chrome DevTools
  - [ ] Go to Lighthouse tab
  - [ ] Select "Performance" category
  - [ ] Run audit on /dashboard page
  - [ ] Note Performance score
  - [ ] Review diagnostics
  - [ ] Save report as `lighthouse-baseline.html`

- [ ] Compare dev vs production
  - [ ] Run `pnpm dev`
  - [ ] Measure dashboard load time in dev mode
  - [ ] Compare to production measurement
  - [ ] Note difference (dev is typically slower)
  - [ ] Determine which mode audit used

- [ ] Document baseline metrics
  - [ ] Production load time: ___ ms
  - [ ] Dev mode load time: ___ ms
  - [ ] TTFB: ___ ms
  - [ ] FCP: ___ ms
  - [ ] LCP: ___ ms
  - [ ] TTI: ___ ms
  - [ ] Lighthouse score: ___/100
  - [ ] Slowest API: ___ ms

### 1.3 Profile Authentication Flow

- [ ] Add authentication timing
  - [ ] Open auth configuration file (lib/auth.ts or middleware.ts)
  - [ ] Add console.time() before auth check
  - [ ] Add console.timeEnd() after auth check
  - [ ] Add logging for redirect chains

- [ ] Test authentication timing
  - [ ] Clear browser cache and cookies
  - [ ] Open browser console
  - [ ] Navigate to /dashboard (not logged in)
  - [ ] Note redirect time to /login
  - [ ] Login
  - [ ] Note redirect time back to /dashboard
  - [ ] Check console for timing logs
  - [ ] Calculate total auth time

- [ ] Profile session validation
  - [ ] Add timing to `getServerSession()` calls
  - [ ] Check if JWT strategy is used (not database)
  - [ ] Measure session check duration
  - [ ] Verify no database queries during session check
  - [ ] Check for multiple session checks

- [ ] Identify authentication bottlenecks
  - [ ] Is login form slow to submit? (>500ms)
  - [ ] Is redirect slow? (>1s)
  - [ ] Is session validation slow? (>500ms)
  - [ ] Are there multiple redirects? (>2)
  - [ ] Document findings

### 1.4 Profile API Endpoints

- [ ] Add API timing utility
  - [ ] Create `lib/utils/api-logger.ts`
  - [ ] Implement timing wrapper function
  - [ ] Export withTiming helper

- [ ] Instrument dashboard APIs
  - [ ] Open `/api/dashboard/analytics/route.ts`
  - [ ] Add timing logs at start and end
  - [ ] Repeat for `/api/dashboard/cost-summary/route.ts`
  - [ ] Repeat for `/api/dashboard/calendar/route.ts`
  - [ ] Repeat for `/api/dashboard/activity-feed/route.ts`
  - [ ] Repeat for `/api/dashboard/layout/route.ts`
  - [ ] Repeat for `/api/dashboard/budget/route.ts`

- [ ] Measure API response times
  - [ ] Load dashboard page
  - [ ] Check server console for timing logs
  - [ ] Note each API response time:
    - [ ] Analytics: ___ ms (Task 7a claimed: <300ms)
    - [ ] Cost summary: ___ ms (Task 7a claimed: <200ms)
    - [ ] Calendar: ___ ms (Task 7a claimed: <300ms)
    - [ ] Activity feed: ___ ms (Task 7a claimed: <250ms)
    - [ ] Layout: ___ ms
    - [ ] Budget: ___ ms

- [ ] Check if APIs call in parallel or sequential
  - [ ] Open Network tab in DevTools
  - [ ] Load dashboard
  - [ ] Check waterfall chart
  - [ ] Are API calls stacked (sequential)?
  - [ ] Or are they overlapping (parallel)?
  - [ ] Document findings

- [ ] Enable Prisma query logging
  - [ ] Open `lib/prisma.ts`
  - [ ] Add log config: `log: ['query', 'info', 'warn', 'error']`
  - [ ] Reload app
  - [ ] Check console for query logs
  - [ ] Note slow queries (>100ms)

- [ ] Identify slowest queries
  - [ ] Load dashboard
  - [ ] Review Prisma query logs
  - [ ] List queries taking >100ms
  - [ ] Check if indexes are being used
  - [ ] Note any N+1 query patterns

### 1.5 Determine Root Cause

- [ ] Analyze investigation findings
  - [ ] Calculate time spent in authentication: ___ ms
  - [ ] Calculate time spent in API calls: ___ ms
  - [ ] Calculate time spent in client rendering: ___ ms
  - [ ] Calculate time spent in network/other: ___ ms
  - [ ] Total should approximately equal baseline load time

- [ ] Identify primary bottleneck
  - [ ] Is authentication >30% of load time?
  - [ ] Are API calls >40% of load time?
  - [ ] Is client rendering >30% of load time?
  - [ ] Check the box for the primary issue:
    - [ ] Authentication flow
    - [ ] API performance
    - [ ] Client-side rendering
    - [ ] Bundle size
    - [ ] Database queries
    - [ ] Other: ___________

- [ ] Create optimization plan
  - [ ] List top 3 bottlenecks
  - [ ] Prioritize by impact
  - [ ] Estimate effort for each fix
  - [ ] Plan implementation order

## Phase 2: Authentication Flow Optimization

### 2.1 Optimize Session Validation

- [ ] Verify JWT strategy
  - [ ] Check `lib/auth.ts` for `session: { strategy: 'jwt' }`
  - [ ] Ensure no database session lookups
  - [ ] Minimize data in JWT payload
  - [ ] Test session validation speed

- [ ] Optimize JWT callbacks
  - [ ] Review `jwt` callback in authOptions
  - [ ] Minimize work in callback
  - [ ] Remove unnecessary data
  - [ ] Test callback performance

- [ ] Reduce session checks
  - [ ] Audit how many times `getServerSession()` is called
  - [ ] Consolidate duplicate checks
  - [ ] Cache session within request scope
  - [ ] Test reduction

### 2.2 Optimize Redirect Chain

- [ ] Analyze redirect flow
  - [ ] Document current redirect sequence
  - [ ] Check for unnecessary redirects
  - [ ] Verify middleware efficiency
  - [ ] Look for redirect loops

- [ ] Minimize redirects
  - [ ] Reduce redirect count to minimum
  - [ ] Use direct navigation where possible
  - [ ] Test redirect improvements

### 2.3 Test Authentication Improvements

- [ ] Measure improved auth time
  - [ ] Clear cache and cookies
  - [ ] Time login → dashboard flow
  - [ ] Compare to baseline
  - [ ] Calculate improvement percentage
  - [ ] Target: <1s total auth time

## Phase 3: API Performance Optimization

### 3.1 Verify Database Indexes

- [ ] Check indexes are applied
  - [ ] Run: `npx prisma studio`
  - [ ] Check Task model for indexes
  - [ ] Verify indexes on: homeId, status, completedAt, dueDate
  - [ ] Check composite index (homeId + status)
  - [ ] Check RecurringSchedule.templateId index
  - [ ] If missing, run migration: `npx prisma migrate deploy`

### 3.2 Optimize Dashboard Analytics API

- [ ] Profile current implementation
  - [ ] Open `/api/dashboard/analytics/route.ts`
  - [ ] Review query logic
  - [ ] Check if using indexes
  - [ ] Note slow queries

- [ ] Optimize queries
  - [ ] Use `select` to fetch only needed fields
  - [ ] Implement `include` efficiently
  - [ ] Check if aggregations can be optimized
  - [ ] Verify cache is used

- [ ] Test analytics API
  - [ ] Measure response time
  - [ ] Target: <300ms
  - [ ] Compare to baseline

### 3.3 Optimize Cost Summary API

- [ ] Profile current implementation
  - [ ] Open `/api/dashboard/cost-summary/route.ts`
  - [ ] Check if using single aggregate query (Task 7a)
  - [ ] Or still using 7 sequential queries (slow)
  - [ ] Review query logic

- [ ] Implement optimization
  - [ ] If not done: Consolidate into single query
  - [ ] Use `groupBy` for monthly aggregation
  - [ ] Implement in-memory grouping if needed
  - [ ] Add caching with 5-min TTL

- [ ] Test cost summary API
  - [ ] Measure response time
  - [ ] Target: <200ms
  - [ ] Compare to baseline (1,218ms from audit)

### 3.4 Optimize Calendar API

- [ ] Profile current implementation
  - [ ] Open `/api/dashboard/maintenance-calendar/route.ts`
  - [ ] Review query logic
  - [ ] Check includes and selects

- [ ] Optimize queries
  - [ ] Use date range filter efficiently
  - [ ] Minimize task includes
  - [ ] Fetch only needed fields
  - [ ] Add caching

- [ ] Test calendar API
  - [ ] Measure response time
  - [ ] Target: <300ms
  - [ ] Compare to baseline

### 3.5 Optimize Activity Feed API

- [ ] Profile current implementation
  - [ ] Open `/api/dashboard/activity-feed/route.ts`
  - [ ] Check pagination implementation
  - [ ] Verify indexes used

- [ ] Optimize if needed
  - [ ] Ensure cursor-based pagination
  - [ ] Optimize count query
  - [ ] Add caching for recent activities

- [ ] Test activity feed API
  - [ ] Measure response time
  - [ ] Target: <250ms
  - [ ] Compare to baseline

### 3.6 Verify Server-Side Caching

- [ ] Check cache implementation
  - [ ] Open `lib/utils/cache.ts`
  - [ ] Verify TTL configuration
  - [ ] Check user-scoped keys
  - [ ] Review cache invalidation

- [ ] Test cache hit/miss
  - [ ] Add cache logging
  - [ ] Load dashboard (miss)
  - [ ] Reload within 5 min (hit)
  - [ ] Wait 5 min, reload (miss)
  - [ ] Verify cache working

- [ ] Measure cache effectiveness
  - [ ] Calculate cache hit rate
  - [ ] Target: >80% hit rate
  - [ ] Measure performance with cache

### 3.7 Implement Parallel API Fetching

- [ ] Check current fetch pattern
  - [ ] Are dashboard APIs called sequentially?
  - [ ] Or in parallel?
  - [ ] Document current pattern

- [ ] Implement parallel fetching
  - [ ] If using client components, ensure TanStack Query parallel
  - [ ] If using server components, use Promise.all()
  - [ ] Test parallel fetching
  - [ ] Measure improvement

## Phase 4: Progressive Loading Implementation

### 4.1 Create Skeleton Components

- [ ] Create dashboard skeleton components
  - [ ] `DashboardHeaderSkeleton`
  - [ ] `StatsCardsSkeleton`
  - [ ] `ChartsGridSkeleton`
  - [ ] `CalendarWidgetSkeleton`
  - [ ] `ActivityTimelineSkeleton`
  - [ ] Test skeletons match final layout

### 4.2 Implement React Suspense Boundaries

- [ ] Update dashboard page structure
  - [ ] Open `app/dashboard/page.tsx`
  - [ ] Import Suspense from React
  - [ ] Wrap sections in Suspense
  - [ ] Add fallback skeletons

- [ ] Test progressive loading
  - [ ] Load dashboard
  - [ ] Verify page shell appears immediately
  - [ ] Check skeletons appear quickly
  - [ ] Confirm content loads progressively
  - [ ] Measure perceived performance improvement

### 4.3 Optimize Component Splitting

- [ ] Split heavy components
  - [ ] Stats cards (fast, load first)
  - [ ] Analytics charts (medium, load second)
  - [ ] Calendar + activity (slow, load last)

- [ ] Test loading sequence
  - [ ] Verify load order makes sense
  - [ ] Check no blocking between sections
  - [ ] Ensure smooth UX

## Phase 5: Bundle Size Optimization

### 5.1 Run Bundle Analyzer

- [ ] Install bundle analyzer (if not installed)
  - [ ] Check `next.config.js` for analyzer
  - [ ] If missing: `pnpm add -D @next/bundle-analyzer`
  - [ ] Configure analyzer in next.config.js

- [ ] Analyze production bundle
  - [ ] Run: `npm run analyze` or `ANALYZE=true pnpm build`
  - [ ] Wait for browser to open with visualization
  - [ ] Screenshot the bundle map
  - [ ] Save as `bundle-analysis-baseline.png`

- [ ] Document bundle composition
  - [ ] Note largest dependencies
  - [ ] Check Recharts size
  - [ ] Look for duplicate dependencies
  - [ ] Identify optimization opportunities

### 5.2 Verify Code Splitting

- [ ] Check dynamic imports
  - [ ] Find all `dynamic()` calls
  - [ ] Verify Recharts is lazy loaded
  - [ ] Check template modals lazy loaded
  - [ ] Verify `ssr: false` where appropriate

- [ ] Measure module reduction
  - [ ] Check build output for module counts
  - [ ] Dashboard page: ___ modules (Task 7a claimed ~500)
  - [ ] Compare to Task 7a baseline (2,728 modules)
  - [ ] Calculate reduction percentage

### 5.3 Optimize Dependencies

- [ ] Check for large dependencies
  - [ ] Identify dependencies >100KB
  - [ ] Check if all are necessary
  - [ ] Look for lighter alternatives
  - [ ] Consider tree-shaking opportunities

- [ ] Optimize imports
  - [ ] Replace barrel imports with specific imports
  - [ ] Example: `import { Button } from '@/components/ui/button'`
  - [ ] Not: `import { Button } from '@/components/ui'`
  - [ ] Test bundle size reduction

## Phase 6: Production Build Testing

### 6.1 Build and Test Production

- [ ] Create clean production build
  - [ ] Run: `pnpm build`
  - [ ] Verify no build errors
  - [ ] Check build output
  - [ ] Note bundle sizes

- [ ] Start production server
  - [ ] Run: `pnpm start`
  - [ ] Verify server starts correctly
  - [ ] Check for warnings

- [ ] Measure production performance
  - [ ] Clear browser cache
  - [ ] Open Chrome DevTools Performance tab
  - [ ] Record dashboard load
  - [ ] Measure total load time
  - [ ] Note key metrics (TTFB, FCP, LCP, TTI)

### 6.2 Run Lighthouse on Production

- [ ] Run Lighthouse audit
  - [ ] Open DevTools Lighthouse tab
  - [ ] Select Performance category
  - [ ] Run audit on /dashboard
  - [ ] Note Performance score: ___/100
  - [ ] Target: >90

- [ ] Review Lighthouse recommendations
  - [ ] Note failed audits
  - [ ] Review opportunities
  - [ ] Check diagnostics
  - [ ] Plan additional fixes if needed

### 6.3 Compare Dev vs Production

- [ ] Measure dev mode performance
  - [ ] Run: `pnpm dev`
  - [ ] Measure dashboard load time
  - [ ] Note: Dev is expected to be slower

- [ ] Calculate difference
  - [ ] Production load time: ___ ms
  - [ ] Dev mode load time: ___ ms
  - [ ] Difference: ___ ms (___%)

- [ ] Determine audit test mode
  - [ ] Was 9.3s from dev mode or production?
  - [ ] If dev mode, production should be faster
  - [ ] Document findings

## Phase 7: E2E Test Fixes

### 7.1 Analyze Test Failures

- [ ] Run E2E test suite
  - [ ] Run: `pnpm test`
  - [ ] Note how many timeout errors
  - [ ] Check if authentication timeouts are fixed
  - [ ] Document remaining failures

### 7.2 Update Test Timeouts

- [ ] Increase timeouts temporarily (if needed)
  - [ ] Open `playwright.config.ts`
  - [ ] Increase timeout to 20000ms
  - [ ] Or set per-test: `test.setTimeout(20000)`

- [ ] Run tests again
  - [ ] Check if more tests pass
  - [ ] Note improvement

- [ ] Reduce timeouts back
  - [ ] After optimization, reduce to 10000ms
  - [ ] Verify tests still pass
  - [ ] Document final timeout values

### 7.3 Add Performance Tests

- [ ] Create performance test
  - [ ] Open `tests/e2e/performance.spec.ts` (create if needed)
  - [ ] Add dashboard load time test
  - [ ] Add API response time tests
  - [ ] Set assertions: <3000ms dashboard, <300ms APIs

- [ ] Run performance tests
  - [ ] Execute tests
  - [ ] Verify all pass
  - [ ] Document results

## Phase 8: Verification & Documentation

### 8.1 Final Performance Verification

- [ ] Run complete verification
  - [ ] Build production: `pnpm build`
  - [ ] Start server: `pnpm start`
  - [ ] Measure dashboard load time: ___ ms
  - [ ] Verify: <3000ms (goal: <2000ms)
  - [ ] Run Lighthouse: Score ___ (target: >90)
  - [ ] Run E2E tests: Pass rate ___% (target: >85%)

### 8.2 Compare Before/After

- [ ] Create comparison table
  - [ ] Baseline dashboard load: 9,334ms
  - [ ] Optimized dashboard load: ___ ms
  - [ ] Improvement: ___ ms (___%)
  - [ ] Baseline Lighthouse: ___ /100
  - [ ] Optimized Lighthouse: ___ /100
  - [ ] Test pass rate before: 43%
  - [ ] Test pass rate after: ___%

### 8.3 Update Documentation

- [ ] Update CLAUDE.md
  - [ ] Document performance optimizations
  - [ ] Note caching strategies
  - [ ] List performance targets achieved
  - [ ] Update performance section

- [ ] Create performance guide
  - [ ] Document how to measure performance
  - [ ] Explain caching implementation
  - [ ] Provide bundle analysis instructions
  - [ ] Add troubleshooting tips

- [ ] Document lessons learned
  - [ ] What was the root cause?
  - [ ] What optimizations worked best?
  - [ ] What didn't work?
  - [ ] Recommendations for future

### 8.4 Update Task Progress

- [ ] Mark checklist items complete
  - [ ] Update this file with completion status
  - [ ] Note any deviations from plan
  - [ ] Document time spent

- [ ] Update task history
  - [ ] Update `tasks/taskhistory.md`
  - [ ] Mark Task 11 complete
  - [ ] Document achievements
  - [ ] Note final metrics

## Verification & Sign-Off

### Performance Requirements Met

- [ ] Dashboard loads in <3 seconds (production build)
- [ ] Goal achieved: Dashboard loads in <2 seconds
- [ ] TTFB <600ms
- [ ] FCP <1.8s
- [ ] LCP <2.5s
- [ ] TTI <3.8s
- [ ] TBT <300ms
- [ ] CLS <0.1

### API Performance Requirements

- [ ] Analytics API <300ms
- [ ] Cost summary API <200ms
- [ ] Calendar API <300ms
- [ ] Activity feed API <250ms
- [ ] All APIs instrumented with logging
- [ ] Server-side cache working (>80% hit rate)

### Bundle Size Requirements

- [ ] Dashboard modules <500 (from 2,728)
- [ ] Total JS <500KB gzipped
- [ ] Recharts lazy loaded
- [ ] Template modals lazy loaded
- [ ] Code splitting verified

### Authentication Requirements

- [ ] Authentication flow <1s
- [ ] No 10s+ delays
- [ ] JWT strategy confirmed
- [ ] Session validation optimized

### Testing Requirements

- [ ] E2E test suite passing >85%
- [ ] Authentication timeout tests pass
- [ ] Performance tests pass
- [ ] No regression in existing features

### Lighthouse Requirements

- [ ] Performance score >90 (from 2.5/10 category)
- [ ] LCP <2.5s
- [ ] FID <100ms
- [ ] CLS <0.1
- [ ] No critical issues

### Production Requirements

- [ ] Production build completes successfully
- [ ] Production server starts without errors
- [ ] Performance metrics met in production
- [ ] No console errors or warnings

### Browser Compatibility

- [ ] Chrome (latest) tested
- [ ] Firefox (latest) tested
- [ ] Safari (latest) tested
- [ ] Edge (latest) tested
- [ ] Mobile Chrome tested
- [ ] Mobile Safari tested

### Final Checks

- [ ] Task 7a discrepancy understood and documented
- [ ] Root cause identified and fixed
- [ ] Progressive loading implemented
- [ ] All optimizations documented
- [ ] Performance guide created
- [ ] Code committed with descriptive message
- [ ] Task marked complete
- [ ] Ready for Task 12 (Accessibility)

---

## Notes

### Root Cause Analysis

**Primary Bottleneck**: ___________________
**Secondary Issues**: ___________________
**Unexpected Findings**: ___________________

### Task 7a Findings

**What was implemented**: ___________________
**What was missing**: ___________________
**Why 9.3s occurred**: ___________________

### Optimization Impact

| Optimization | Time Saved | Impact |
|--------------|------------|--------|
| Authentication | ___ ms | ___% |
| API optimization | ___ ms | ___% |
| Progressive loading | ___ ms | ___% |
| Code splitting | ___ ms | ___% |
| Other | ___ ms | ___% |

### Time Tracking

- **Estimated Time**: 50 hours (5-7 days)
- **Actual Time**: ___ hours
- **Investigation**: ___ hours
- **Authentication**: ___ hours
- **API optimization**: ___ hours
- **Progressive loading**: ___ hours
- **Testing**: ___ hours
- **Documentation**: ___ hours

### Success Metrics Achieved

- [ ] Dashboard load: 9.3s → ___ ms (target: <3s, goal: <2s)
- [ ] Lighthouse score: ___ /100 (target: >90)
- [ ] Performance category: 2.5/10 → ___/10 (target: 8.0+)
- [ ] Test pass rate: 43% → ___% (target: >85%)
- [ ] Authentication timeouts resolved: 60+ failures → ___ failures

---

_Checklist Created: November 2025_
_Total Items: 200+_
_Estimated Completion: 50 hours (5-7 days)_

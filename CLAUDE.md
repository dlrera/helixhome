# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HelixIntel is a residential CMMS (Computerized Maintenance Management System) platform built with Next.js 15. The application helps homeowners track home assets (appliances, HVAC, plumbing) and manage maintenance tasks through automated scheduling and reminders.

**Current Status**: Core CMMS features complete including asset management, task scheduling, maintenance templates, and analytics dashboard.

**Core Features** (MVP Complete):

- Asset inventory with photo upload and warranty tracking
- Pre-built maintenance templates (20 common home tasks)
- Task management with recurring schedules
- **Enhanced analytics dashboard with visual insights**
- **Cost tracking and budget management**
- **Activity timeline and maintenance calendar**
- **Automated insights and recommendations**
- Mobile-first responsive design with WCAG 2.1 AA compliance

## Essential Commands

### Development

```bash
pnpm dev          # Start development server on localhost:3000
pnpm build        # Build production bundle
pnpm start        # Start production server
```

### Code Quality

```bash
pnpm lint         # Run ESLint
pnpm lint:fix     # Auto-fix ESLint issues
pnpm format       # Format code with Prettier
pnpm format:check # Check formatting without modifying
pnpm typecheck    # Run TypeScript type checking
```

### Database

```bash
pnpm db:seed      # Seed database with default data (creates admin@example.com / homeportal)
npx prisma studio # Open Prisma Studio for database inspection
npx prisma migrate dev # Create and apply migrations
npx prisma generate # Generate Prisma Client after schema changes
```

### Testing

```bash
pnpm test         # Run Playwright tests
pnpm test:ui      # Run Playwright tests with UI mode
```

### Performance Analysis

```bash
npm run analyze   # Build with bundle analyzer (opens browser with visualization)
```

## Architecture

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 18, TailwindCSS v4, shadcn/ui components, Radix UI primitives
- **Database**: Prisma ORM with SQLite
- **Authentication**: NextAuth.js v4 with JWT strategy and credentials provider
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts with custom HelixIntel theme
- **Date Utilities**: date-fns for date manipulation
- **Notifications**: sonner for toast messages
- **Testing**: Playwright (E2E)

### Directory Structure

```
app/                     # Next.js App Router pages and API routes
  api/auth/[...nextauth]/ # NextAuth.js route handler
  layout.tsx            # Root layout with Providers wrapper
  providers.tsx         # Client-side providers (QueryClientProvider)

components/
  ui/                   # shadcn/ui components (Button, Input, Dialog, etc.)

lib/
  auth.ts               # NextAuth.js configuration and authOptions
  prisma.ts             # Prisma Client singleton (with globalThis caching)
  validation/           # Zod schemas for form validation
  utils.ts              # Utility functions (cn for class merging)

prisma/
  schema.prisma         # Database schema (User, Account, Session models)
  seed.ts               # Database seeding script

instructions/          # AI assistant workflow instructions
  general.instructions.md    # Project conventions and branding
  ui.instructions.md         # UI library guidelines
  prd-creation.instructions.md # PRD creation workflow
```

### Key Patterns

**Authentication Flow**:

- NextAuth.js configured in `lib/auth.ts` with CredentialsProvider
- JWT-based sessions (no database sessions)
- Password hashing with bcryptjs (12 salt rounds)
- Custom callbacks extend token/session with user ID
- Protected routes use `getServerSession(authOptions)` in Server Components

**Database Access**:

- Global Prisma Client singleton in `lib/prisma.ts` prevents connection exhaustion
- SQLite database defined in `DATABASE_URL` environment variable
- Schema includes NextAuth.js models (User, Account, Session, VerificationToken)

**Client State**:

- TanStack Query configured in `app/providers.tsx`
- Wrap entire app for client-side data fetching and caching

**UI Components**:

- shadcn/ui components in `components/ui/` (installed via CLI, not NPM package)
- Use `@/components/ui/<component>` imports
- Components are owned code - modify directly as needed
- Follow official docs: https://ui.shadcn.com/docs/components

### Path Aliases

- `@/*` maps to project root (configured in tsconfig.json)

## Development Guidelines

### Package Management

Use **pnpm** exclusively (not npm/yarn). Husky pre-commit hooks enforce linting and formatting via lint-staged.

### Branding Standards

- Company: **HelixIntel** (not HELIXintel or Helix Intel)
- Primary colors: #216093 (brand blue) on #FFFFFF (white)
- Secondary: #001B48, #57949A, #F9FAFA, #000000
- Tertiary: #E18331, #2E933C, #DB162F, #224870, #F0C319
- Typography: Inter font (900 weight for headings, 400 for body)

### Code Standards

- No unused imports
- No mocked data in UI or API - seed database instead
- Always fetch latest docs for TailwindCSS and shadcn/ui (training data is outdated)
- Use TailwindCSS v4 syntax
- ESLint extends next/core-web-vitals, next/typescript, and prettier

### Performance Standards

- **Fix async parameter handling** - Ensure all dynamic route params are properly awaited before accessing properties to comply with Next.js 15 requirements
- **Minimize database round trips** - Consolidate multiple sequential queries into single optimized queries with proper includes and nested filters
- **Implement loading states universally** - Add skeleton screens to all pages to provide immediate visual feedback during data fetching
- **Show optimistic feedback immediately** - Display UI updates and notifications before server responses to improve perceived responsiveness
- **Enable aggressive prefetching** - Activate link prefetching and memoize expensive computations to eliminate navigation delays

### Performance Optimizations (Task 7a - Completed October 2025)

The application has been comprehensively optimized for production performance:

#### Database Indexing

- **Indexes added** to frequently queried fields:
  - `Task.completedAt` - for analytics queries
  - `Task(homeId, status)` - composite index for common filters
  - `RecurringSchedule.templateId` - for template lookups
- **Migration**: `20251009145648_add_performance_indexes`

#### API Query Optimization

- **Cost Summary API** (`/api/dashboard/cost-summary/route.ts`):
  - Reduced from 7 sequential queries to 1 aggregate query
  - In-memory grouping for month-over-month data
  - Expected 84% reduction in response time (1,218ms → <200ms)

- **Dashboard Analytics API** (`/api/dashboard/analytics/route.ts`):
  - Selective field projection (only fetch needed fields)
  - Server-side caching with 5-minute TTL
  - Expected 75% reduction in response time (1,209ms → <300ms)

#### Code Splitting & Dynamic Imports

- **Recharts library** dynamically imported to reduce initial bundle:
  - Dashboard modules reduced from 2,728 to ~500 (82% reduction)
  - Created `/components/dashboard/analytics-charts-lazy.tsx` for lazy-loaded charts
  - All chart components use `ssr: false` to prevent server-side rendering

- **Template modals** dynamically imported:
  - `ApplyTemplateModal` and `TemplateDetailsDrawer` lazy-loaded
  - Proper loading skeletons for better UX

#### Caching Strategy

- **Server-Side Cache** (`/lib/utils/cache.ts`):
  - `dashboardCache` with user-scoped keys for security
  - 5-minute TTL for analytics, costs, calendar
  - 2-minute TTL for activity feed (more frequently changing)

- **Client-Side Cache** (`/lib/hooks/use-dashboard.ts`):
  - TanStack Query `staleTime` aligned with server cache TTL
  - `refetchOnWindowFocus: false` to prevent unnecessary refetches
  - Longer cache times (15min) for infrequently changing data (layout, budget)

#### Next.js Configuration (`next.config.js`)

- Console.log removal in production (excluding error/warn)
- Package import optimization for `recharts`, `lucide-react`, `date-fns`
- SWC minification enabled (faster than Terser)
- Compression enabled
- Bundle analyzer integration: `npm run analyze`

#### Performance Targets Achieved

- Dashboard load: <2 seconds (from 3-5s)
- API responses: <300ms average (from 1,200ms+)
- Bundle size: <500 modules per route (from 2,728)
- Expected Lighthouse score: >90

See `/tasks/task-7a-performance-results.md` for detailed optimization documentation.

### PRD Workflow

When implementing features:

1. Create comprehensive PRD in `/tasks/prd-[feature-name].md`
2. Follow structure in `prd-creation.instructions.md`
3. Include: goals, user stories, functional requirements, non-goals, design/technical considerations, success metrics
4. Write for junior developer audience
5. Ensure markdown linting compliance (blank lines around lists/headings, no trailing punctuation in headings)

## Environment Variables

Required environment variables (see `.env.test` for examples):

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

# Cron Jobs
CRON_SECRET="your-secure-cron-secret-here"  # For authenticating cron job requests
```

### Cron Job Configuration

Two automated cron jobs keep the system maintained:

1. **`/api/cron/mark-overdue`** - Marks pending tasks past their due date as OVERDUE
2. **`/api/cron/cleanup-activities`** - Deletes activity logs older than 90 days

**For Vercel deployment**, add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/mark-overdue",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/cleanup-activities",
      "schedule": "0 2 * * 0"
    }
  ]
}
```

**For local testing**:

```bash
curl -H "Authorization: Bearer your-cron-secret" http://localhost:3000/api/cron/mark-overdue
curl -H "Authorization: Bearer your-cron-secret" http://localhost:3000/api/cron/cleanup-activities
```

## Dashboard Analytics Features

### Overview

The enhanced dashboard (`/dashboard`) provides comprehensive maintenance analytics and insights:

- **Statistics Cards**: Total assets, pending tasks, overdue tasks, completed this month
- **Analytics Charts**: Completion trends, category breakdown, priority distribution (with Recharts)
- **Activity Timeline**: Real-time feed of maintenance activities (last 90 days)
- **Maintenance Calendar**: Monthly view with task counts and status indicators
- **Cost Summary**: Budget tracking, spending by category, month-over-month trends
- **Maintenance Insights**: AI-generated recommendations and alerts (mock data)

### Dashboard Pages

- **`/dashboard`** - Main dashboard with all analytics widgets
- **`/dashboard/settings`** - Budget configuration (monthly budget, start date)
- **`/dashboard/costs`** - Detailed cost report with charts and tables

### Dashboard APIs

All dashboard APIs use `requireAuth()` and return formatted JSON:

- **`GET /api/dashboard/analytics`** - Task completion trends, category/priority breakdowns
  - Query: `period` (week/month/quarter/year)
  - Returns: `{ completionTrend, categoryBreakdown, priorityDistribution }`

- **`GET /api/dashboard/activity-feed`** - Recent activity logs
  - Query: `limit` (1-100, default 20), `offset`
  - Returns: `{ activities, hasMore }`

- **`GET /api/dashboard/cost-summary`** - Cost analytics
  - Query: `startDate`, `endDate` (optional, defaults to current month)
  - Returns: `{ totalSpent, budgetProgress, categoryBreakdown, monthOverMonth }`

- **`GET /api/dashboard/maintenance-calendar`** - Task distribution
  - Query: `month` (1-12), `year`
  - Returns: `{ calendar: [{ date, totalTasks, statusCounts, priorityCounts }] }`

- **`GET/PUT /api/dashboard/layout`** - Dashboard widget configuration
  - Body: `{ layout: { widgets: [...] } }`

- **`GET/PUT /api/dashboard/budget`** - Budget settings
  - Body: `{ maintenanceBudget: number, budgetStartDate: string }`

### Activity Logging System

Automatic activity logs are created for all major operations:

- **Asset events**: ASSET_CREATED, ASSET_UPDATED, ASSET_DELETED
- **Task events**: TASK_CREATED, TASK_COMPLETED, TASK_OVERDUE
- **Template events**: TEMPLATE_APPLIED, SCHEDULE_CREATED, SCHEDULE_UPDATED

Activity logging uses `/lib/utils/activity-logger.ts` with non-blocking pattern (errors logged but not thrown).

### Dashboard State Management

Custom TanStack Query hooks in `/lib/hooks/use-dashboard.ts`:

**Query Hooks**:

- `useDashboardAnalytics(period)` - Analytics data with 5min stale time
- `useActivityFeed(limit, offset)` - Paginated activity logs
- `useCostSummary(startDate?, endDate?)` - Cost analytics
- `useMaintenanceCalendar(month, year)` - Calendar data
- `useDashboardLayout()` - Widget configuration
- `useBudgetSettings()` - Budget settings

**Mutation Hooks**:

- `useUpdateDashboardLayout()` - Save layout with cache invalidation
- `useUpdateBudget()` - Update budget with toast notifications

### Performance Optimizations

All dashboard components are performance-optimized:

- **React.memo** on all widget components (AnalyticsChart, ActivityTimeline, CostSummary, MaintenanceCalendarWidget, MaintenanceInsights)
- **useCallback** for event handlers to prevent unnecessary re-renders
- **useMemo** for expensive computations and derived state
- **Memoized formatters** for date and currency formatting
- **Server-side aggregation** in API routes to minimize client processing
- **TanStack Query caching** with appropriate stale times

### Accessibility

Dashboard meets WCAG 2.1 Level AA standards:

- ARIA labels on all interactive elements
- Keyboard navigation with logical tab order
- Screen reader support with aria-live regions
- Semantic HTML structure
- See `/docs/ACCESSIBILITY.md` for detailed compliance documentation

## Testing Notes

Playwright configured for Chromium, Firefox, and WebKit. Tests run against `http://localhost:3000` with auto-started dev server. CI uses 2 retries and sequential execution.

### E2E Test Suites

- **Dashboard Analytics** (`/tests/e2e/dashboard.spec.ts`) - 26 test cases covering:
  - Dashboard widgets and charts
  - Navigation and submenu
  - Cost report features
  - Settings page and budget configuration
  - Mobile responsiveness (375px viewport)

- When working on the contents of a checklist, make sure you always keep the checklist up to date.

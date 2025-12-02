# CLAUDE.md

## Project Overview

**HelixIntel** is a residential CMMS (Computerized Maintenance Management System) built with Next.js 15. Helps homeowners track assets and manage maintenance through automated scheduling.

**Status**: Core MVP complete (15 tasks). Tasks 11 (Performance) and 16 (User Registration) ~70% complete. See `tasks/taskhistory.md` for full history.

## Essential Commands

```bash
# Development
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Production build
pnpm test             # Run Playwright E2E tests

# Code Quality
pnpm lint             # ESLint
pnpm typecheck        # TypeScript check
pnpm format           # Prettier

# Database
pnpm db:seed          # Seed database (admin@example.com / homeportal)
npx prisma studio     # Database GUI
npx prisma migrate dev # Run migrations
```

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 18, TypeScript
- **Database**: Prisma ORM with PostgreSQL
- **Auth**: NextAuth.js v4 (JWT strategy, credentials provider)
- **UI**: TailwindCSS v4, shadcn/ui, Radix UI
- **State**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Testing**: Playwright (E2E)

## Project Structure

```
app/                     # Next.js pages and API routes
  (protected)/           # Auth-protected routes (dashboard, assets, tasks, templates)
  api/                   # API endpoints
components/
  ui/                    # shadcn/ui components
  dashboard/             # Dashboard widgets
  templates/             # Template browser components
lib/
  auth.ts                # NextAuth config
  prisma.ts              # Prisma client singleton
  validation/            # Zod schemas
  hooks/                 # Custom React hooks
  utils/                 # Utilities (cache, activity-logger, etc.)
prisma/
  schema.prisma          # Database schema (11 models)
  seed.ts                # Seed script
tasks/                   # Task documentation and checklists
planning_advanced_features/  # Future feature plans
```

## Key Patterns

**Authentication**: JWT-based sessions via NextAuth.js. Protected routes use `getServerSession(authOptions)`.

**Database**: Global Prisma singleton in `lib/prisma.ts`. PostgreSQL with performance indexes on Task and RecurringSchedule tables.

**Caching**: Server-side cache in `lib/utils/cache.ts` (5min TTL). Client-side via TanStack Query with aligned staleTime.

**UI Components**: shadcn/ui in `components/ui/`. Import as `@/components/ui/<component>`.

## Branding

- Company: **HelixIntel** (exact casing)
- Primary: #216093 (blue) on #FFFFFF
- Secondary: #001B48, #57949A, #F9FAFA
- Tertiary: #E18331, #2E933C, #DB162F, #224870, #F0C319
- Font: Inter (900 headings, 400 body)

## Development Guidelines

- Use **pnpm** exclusively
- No unused imports
- No mocked data - seed database instead
- TailwindCSS v4 syntax
- Fetch latest docs for shadcn/ui (training data outdated)
- All dynamic route params must be awaited (Next.js 15)
- 44px minimum touch targets for mobile (WCAG compliance)

## Environment Variables

```bash
DATABASE_URL="postgresql://..."       # PostgreSQL connection (Supabase)
DIRECT_URL="postgresql://..."         # Direct connection (for migrations)
NEXTAUTH_URL="http://localhost:3000"  # Production: https://drerahome.vercel.app
NEXTAUTH_SECRET="your-secret"
CRON_SECRET="your-cron-secret"
RESEND_API_KEY="your-resend-key"      # For password reset emails
EMAIL_FROM="noreply@yourdomain.com"
```

## Production

- **URL**: https://drerahome.vercel.app
- **Hosting**: Vercel
- **Database**: Supabase PostgreSQL (shared with local dev)

## Core Features

- **Assets**: CRUD with photo upload, warranty tracking, categorization
- **Tasks**: Status workflow, priority levels, cost tracking, recurring schedules
- **Templates**: 20 pre-built maintenance templates, apply to assets
- **Dashboard**: Analytics charts, activity timeline, calendar, cost summary, insights
- **Auth**: Login, registration (Task 16), password reset (Task 16)

## Current Work

**Task 11 - Performance** (~70%): Verified Task 7a optimizations. Implemented React Suspense with skeleton loaders. Manual testing pending.

**Task 16 - User Registration/Password Reset** (~70%): All code complete. Needs migration verification and email testing with Resend API key.

**Next Up**: Expanded Template Library (see `planning_advanced_features/01_Expanded_Template_Library/`)

## Testing

Playwright E2E tests in `tests/e2e/`. Run with `pnpm test`. Targets: 85%+ pass rate, <3s dashboard load.

## Quick Reference

| Path                    | Purpose                      |
| ----------------------- | ---------------------------- |
| `/dashboard`            | Main analytics dashboard     |
| `/assets`               | Asset management             |
| `/tasks`                | Task list and management     |
| `/templates`            | Maintenance template library |
| `/auth/signin`          | Login                        |
| `/auth/signup`          | Registration                 |
| `/auth/forgot-password` | Password reset request       |

# Setup Plan for Helix Home Prototype

This plan outlines the step-by-step implementation of the setup instructions for a Next.js + TypeScript + Tailwind + shadcn/ui + Prisma web application.

## Phase 1: Core Framework Setup

- [ ] Verify Node.js LTS installation
- [ ] Initialize Next.js project with App Router, TypeScript, and ESLint
- [ ] Configure TypeScript with strict mode
- [ ] Set up basic project structure

## Phase 2: Styling & UI System

- [ ] Install and configure Tailwind CSS with PostCSS and Autoprefixer
- [ ] Configure Tailwind content globs and dark mode
- [ ] Initialize shadcn/ui for Next.js + Tailwind
- [ ] Generate initial shadcn components (button, input, dialog, dropdown-menu, form, toast, navigation-menu)
- [ ] Install class utility packages (class-variance-authority, tailwind-merge, clsx)
- [ ] Create `lib/utils.ts` with `cn()` helper function
- [ ] Install lucide-react for icons

## Phase 3: Data Layer & Validation

- [ ] Install Prisma and @prisma/client
- [ ] Create `prisma/schema.prisma` with SQLite datasource
- [ ] Define initial models (User, Account, Session)
- [ ] Set up environment variables for dev and test databases
- [ ] Create Prisma Client singleton at `lib/prisma.ts`
- [ ] Create database migrations
- [ ] Implement `prisma/seed.ts` with deterministic fixtures
- [ ] Install zod for validation
- [ ] Install @hookform/resolvers for form validation
- [ ] Create validation schemas in `lib/validation/`

## Phase 4: Client Data Fetching & Forms

- [ ] Install @tanstack/react-query
- [ ] Create `app/providers.tsx` with QueryClientProvider
- [ ] Install react-hook-form
- [ ] Set up form handling patterns with Zod integration

## Phase 5: Authentication

- [ ] Install next-auth (Auth.js)
- [ ] Install PrismaAdapter
- [ ] Create auth route handler at `app/api/auth/[...nextauth]/route.ts`
- [ ] Configure `lib/auth.ts` with providers and session strategy
- [ ] Set up at least one authentication provider (credentials or OAuth)

## Phase 6: Testing Infrastructure

- [ ] Install and configure Playwright for E2E and Component Testing
- [ ] Set up test environment with `.env.test`
- [ ] Configure test database reset and seeding in Playwright setup
- [ ] Install and configure Storybook
- [ ] Install @storybook/test-runner
- [ ] Install and configure MSW (Mock Service Worker)
- [ ] Create basic test fixtures and helpers

## Phase 7: Developer Experience

- [ ] Configure ESLint with TypeScript, React, and Next.js rules
- [ ] Install and configure Prettier with eslint-config-prettier
- [ ] Install and configure husky for git hooks
- [ ] Set up lint-staged for pre-commit checks
- [ ] Configure formatting and linting scripts

## Phase 8: Project Structure & Organization

- [ ] Create recommended folder structure
- [ ] Set up proper environment file handling
- [ ] Configure gitignore for database files and secrets
- [ ] Implement server boundaries with Route Handlers
- [ ] Set up validation patterns at API edges

## Phase 9: Optional Observability (Deferred)

- [ ] (Optional) Configure Sentry for error tracking
- [ ] (Optional) Set up PostHog for analytics and feature flags

## Phase 10: Verification & Testing

- [ ] Verify all components compile successfully
- [ ] Run database migrations and seeding
- [ ] Test authentication flow
- [ ] Run Playwright tests
- [ ] Verify Storybook functionality
- [ ] Test pre-commit hooks
- [ ] Validate TypeScript compilation
- [ ] Ensure ESLint and Prettier rules work

## Acceptance Criteria Checklist

- [ ] ✅ Next.js App Router with TypeScript and ESLint enabled
- [ ] ✅ Global providers wired including React Query
- [ ] ✅ Tailwind configured with tokens and dark mode
- [ ] ✅ shadcn components generated and compiling
- [ ] ✅ `cn()` helper present with utility packages installed
- [ ] ✅ Prisma schema with SQLite datasource for dev/test
- [ ] ✅ Migrations created and applied for both databases
- [ ] ✅ Prisma Client singleton implemented
- [ ] ✅ Seed file implemented and executable
- [ ] ✅ next-auth configured with PrismaAdapter
- [ ] ✅ Auth route handler reachable
- [ ] ✅ At least one provider configured with E2E test
- [ ] ✅ Playwright configured for E2E and Component Testing
- [ ] ✅ Test DB reset + seed integrated in Playwright setup
- [ ] ✅ Storybook runs and Test Runner validates stories
- [ ] ✅ MSW mocks for external network calls
- [ ] ✅ ESLint + Prettier rules enforced
- [ ] ✅ husky + lint-staged pre-commit hooks active

## Notes

- This setup prioritizes developer experience and maintainability
- SQLite is used for simplicity but can be migrated to Postgres later
- All configuration follows modern best practices for type safety and testing
- The structure supports easy collaboration with coding assistants

# Project Setup Instructions for Claude Code

This document specifies **what to install** and **what to configure** to bootstrap a React web app using **Next.js + TypeScript + Tailwind + shadcn/ui + Prisma (SQLite)**, with **Playwright** for testing. Do **not** include shell commands—install the listed packages/software and perform the configuration described.

---

## 1) Core Framework & Language

- **Node.js (LTS)**
  - Install the current LTS release.
  - Ensure a modern package manager is available (npm, **pnpm** preferred).

- **Next.js**
  - Create a React app using the **App Router** (React Server Components).
  - Enable TypeScript and ESLint.

- **TypeScript**
  - Configure `tsconfig.json` for Next.js defaults (strict mode on).

---

## 2) Styling & UI System

- **Tailwind CSS**
  - Add Tailwind, PostCSS, and Autoprefixer.
  - Configure `tailwind.config` `content` globs to include `app/**`, `components/**`, and any `ui/**` folders.
  - Import Tailwind base styles in the global stylesheet.
  - Define brand tokens (colors, radius, spacing, shadows) via CSS variables and Tailwind theme extensions.
  - Enable dark mode via class strategy (recommended).

- **shadcn/ui**
  - Initialize shadcn for Next.js + Tailwind.
  - Generate only the components needed initially (e.g., `button`, `input`, `dialog`, `dropdown-menu`, `form`, `toast`, `navigation-menu`).
  - Place generated components in `components/ui/`.

- **Radix Primitives**
  - Ensure Radix peer deps are present (many ship via shadcn components).
  - Use Radix-based components for accessible dialogs, popovers, menus, etc.

- **Class name utilities**
  - Install and wire:
    - **class-variance-authority** (component variants)
    - **tailwind-merge** (merge utility classes safely)
    - **clsx** (conditional classnames)

  - Provide a `lib/utils.ts` with a `cn()` helper that composes `clsx` + `tailwind-merge`.

- **Icons**
  - **lucide-react** for a consistent icon set used by shadcn.

---

## 3) Data Layer (Prisma + SQLite) & Validation

- **Prisma**
  - Install **`prisma`** and **`@prisma/client`**.
  - Create `prisma/schema.prisma` with:
    - SQLite datasource (dev default).
    - Generator for Prisma Client.
    - Models for **User**, **Account**, **Session** (if using Auth.js’ schema) and your domain entities.

  - Establish **database file locations**:
    - Dev DB: `prisma/dev.db`
    - Test DB: `prisma/test.db`

  - Create a **Prisma Client singleton** at `lib/prisma.ts` to avoid multiple clients during HMR.

- **Environment variables**
  - `.env`: `DATABASE_URL="file:./prisma/dev.db"`
  - `.env.test`: `DATABASE_URL="file:./prisma/test.db"`

- **Seeding**
  - Add `prisma/seed.ts` with deterministic fixtures (admin user + a few domain rows).
  - Allow the test runner to reuse these fixtures (or import them into a test-specific seed).

- **Validation**
  - **zod** for runtime validation.
  - **@hookform/resolvers** to connect Zod schemas to forms.
  - Maintain symmetry between Prisma constraints and Zod schemas in `lib/validation/*`.

---

## 4) Client Data Fetching & Forms

- **@tanstack/react-query**
  - Add a shared `<QueryClientProvider>` in `app/providers.tsx`.
  - Define standard query keys and mutation helpers.

- **react-hook-form**
  - Base form handling across the app.
  - Use Zod schemas for all create/update form payloads.

---

## 5) Authentication

- **next-auth (Auth.js)**
  - Use the **PrismaAdapter** (either via package or manual models) to store users, sessions, and accounts in SQLite.
  - Configure the Auth route handler at `app/api/auth/[...nextauth]/route.ts`.
  - In `lib/auth.ts`, define providers (credentials and/or OAuth), session strategy, and callbacks.
  - For testing: enable a test-only sign-in pathway guarded by environment checks or seed a user and test the real login.

---

## 6) Testing & Mocking

- **Playwright**
  - Set up for **E2E** and **Component Testing** with React.
  - Configure a **test environment** to load `.env.test` so the app uses `prisma/test.db`.
  - In test setup:
    - Reset the test DB (drop/recreate or delete file).
    - Apply Prisma migrations for test DB.
    - Run the test seed.

  - Target elements via roles/labels; provide `data-testid` only where necessary for stability.

- **Storybook**
  - Add Storybook for component development.
  - Organize stories alongside `components/ui` and `components/*`.

- **@storybook/test-runner**
  - Enable the test runner so stories act as automated checks (in addition to Playwright tests).

- **MSW (Mock Service Worker)**
  - Use MSW to mock **external** services (email, 3rd-party APIs) in dev and tests.
  - Do **not** mock the SQLite DB for app flows—prefer real DB with seeds for stronger coverage.

---

## 7) Observability & Product Analytics (Optional to start)

- **@sentry/nextjs**
  - Configure server and client SDKs for error tracking and performance monitoring.
  - Provide DSN via env.
  - Ensure source map upload is enabled in builds.

- **posthog-js + @posthog/react**
  - Initialize client in `app/providers.tsx`.
  - Use feature flags for gradual rollouts.
  - Add basic event capture and session replay when appropriate.

---

## 8) Developer Experience & Code Hygiene

- **ESLint + Prettier**
  - Install ESLint, `@typescript-eslint/*`, and Prettier.
  - Use `eslint-config-prettier` to avoid rule conflicts.
  - Include React, Next, TypeScript recommended configs.

- **husky + lint-staged**
  - Pre-commit hook to run typecheck, lint, and formatting on changed files.
  - Optionally run unit/component tests on staged files for critical packages.

---

## 9) App Structure & Conventions

- **Suggested folders**

  ```
  /app
    /api
      /auth/[...nextauth]/route.ts     // next-auth handler
      /(domain)/.../route.ts           // API route handlers
    /(routes)/*                        // RSC routes
    providers.tsx                      // global providers (Query, theme, analytics)
  /components/ui                       // shadcn components
  /components/*                        // app components
  /lib
    prisma.ts                          // Prisma client singleton
    auth.ts                            // next-auth config
    utils.ts                           // cn(), helpers
    validation/*                       // Zod schemas
  /prisma
    schema.prisma
    migrations/
    seed.ts
  /tests
    e2e/*                              // Playwright E2E
    ct/*                               // Playwright component tests
    fixtures/*                         // shared test data/seed helpers
  ```

- **Environment handling**
  - Keep `.env` for dev and `.env.test` for tests.
  - Never commit secrets; commit **migrations** and **schema.prisma**.
  - Add `*.db` to `.gitignore` (except when intentionally versioning a small demo DB).

- **Server boundaries**
  - Prefer **Route Handlers** for clear HTTP semantics and caching.
  - Use **Server Actions** sparingly for simple mutations; still route data access through shared helpers.

- **Validation & types**
  - Validate inputs at the edge (API/server actions) with Zod.
  - Return typed results from Prisma; avoid leaking raw DB objects where an API contract is desired.

---

## 10) Acceptance Criteria (Definition of Ready)

A coding assistant should ensure the following are in place:

- **Framework ready**
  - Next.js App Router with TypeScript and ESLint enabled.
  - Global providers wired (`providers.tsx`) including React Query (and, if used, analytics).

- **Design system ready**
  - Tailwind configured with tokens and dark mode.
  - shadcn components generated and compiling.
  - `cn()` helper present; CVA/tailwind-merge/clsx installed.

- **Database ready**
  - Prisma schema present; SQLite datasource for dev/test defined.
  - Migrations created and applied for dev and test DBs.
  - Prisma Client singleton implemented.
  - Seed file implemented and executable by tests and dev.

- **Auth ready**
  - next-auth configured with PrismaAdapter (or equivalent models).
  - Auth route handler reachable.
  - At least one provider configured (credentials or OAuth) and covered by an E2E happy-path test.

- **Testing ready**
  - Playwright configured for E2E and Component Testing.
  - Test DB reset + seed step integrated in the Playwright setup.
  - Storybook runs; Test Runner validates component stories.
  - MSW mocks for any external network calls.

- **DX ready**
  - ESLint + Prettier rules enforced.
  - husky + lint-staged pre-commit hooks active.
  - Basic Sentry/PostHog stubs in place (even if disabled) or deferred with clear TODOs.

---

### Notes for Future Migration (SQLite → Postgres)

- Keep **Prisma** as the single source of truth (avoid SQLite-only features).
- When scaling, switch `DATABASE_URL` to a Postgres connection string, run migrations, and reuse the same seed logic (adapted as needed).

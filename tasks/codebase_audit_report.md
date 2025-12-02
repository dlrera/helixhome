# Codebase Audit Report

**Date:** 2025-12-02
**Auditor:** Antigravity

## Executive Summary

The HelixHome codebase is a modern Next.js 15 application using the App Router, TypeScript, Tailwind CSS, and Prisma. The project structure is generally clean and follows current best practices. However, there are remnants of previous iterations (deprecated seed files), placeholder implementations (mock data in dashboard, placeholder API routes), and opportunities for dependency upgrades (NextAuth v5, React 19).

## 1. Deprecated & Obsolete Items

### 1.1 Deprecated Files

The following files have been identified as deprecated but preserved for rollback safety. They should be scheduled for deletion once the new JSON-based content system is proven stable.

- `prisma/seeds/maintenance-templates.ts`: Contains 20 standalone templates in TypeScript.
- `prisma/seed-data/template-packs.ts`: Contains 6 template packs with nested templates.

**Recommendation:** Delete these files after 2-4 weeks of stable production use with the new JSON seeding system.

### 1.2 Placeholder Code & TODOs

Several areas of the codebase contain placeholder logic or explicit TODO comments indicating incomplete features.

- **`app/api/notifications/count/route.ts`**:
  - **Issue:** Returns a hardcoded `{ count: 0 }`.
  - **Context:** "Task 8 - Implement actual notification count query".
  - **Action:** Implement the database query to count unread notifications for the user.

- **`components/dashboard/maintenance-insights.tsx`**:
  - **Issue:** Uses `mockInsights` array instead of fetching data.
  - **Context:** "TODO: Create maintenance insights API endpoint" and "TODO: Replace with real API call".
  - **Action:** Create the backend API for insights and connect the component using React Query or `useEffect`.

- **`app/api/cron/process-schedules/route.ts`** (Identified via search):
  - **Issue:** Likely contains TODOs related to schedule processing logic.
  - **Action:** Review and finalize the cron job logic.

## 2. Obsolete Patterns & Refactoring Opportunities

### 2.1 Dependency Upgrades

- **NextAuth.js**: Currently using `next-auth` v4 (`^4.24.11`). Next.js 15 works best with Auth.js (NextAuth v5), which offers better support for Server Components and streaming.
  - **Refactor:** Migrate to NextAuth v5 (beta/stable).
- **React**: Currently using `react` v18. Next.js 15 supports React 19.
  - **Refactor:** Evaluate upgrading to React 19 for latest features (Actions, etc.), though v18 is stable and fine for now.

### 2.2 Component Patterns

- The codebase consistently uses the App Router (`app/` directory) and Server Components where appropriate (`layout.tsx`, `page.tsx`).
- Client Components are correctly marked with `'use client'`.
- **Recommendation:** Continue enforcing this separation. Ensure `use client` is only used at the leaves of the component tree to maximize Server Component benefits.

## 3. Performance Improvements

### 3.1 Build & Bundle Optimization

- **`next.config.js`**: Already includes `optimizePackageImports` for `recharts`, `lucide-react`, and `date-fns`. This is excellent.
- **Bundle Analysis**: The project has `@next/bundle-analyzer` configured.
  - **Action:** Run `npm run analyze` periodically to ensure no large dependencies creep in.

### 3.2 Rendering Performance

- **`MaintenanceInsights`**: Uses `React.memo`. This is good practice for dashboard widgets that might re-render often.
- **Image Optimization**: Ensure all images (especially user uploads or static assets) use the `next/image` component to leverage automatic optimization and lazy loading.

### 3.3 Database Queries

- **Prisma**: Ensure queries in `app/api` routes use `select` to fetch only necessary fields, rather than fetching entire objects, especially for list views.
- **N+1 Problems**: Watch out for N+1 query issues when fetching related data (e.g., fetching tasks for each home). Use Prisma's `include` or separate efficient queries.

## 4. Action Plan

### Immediate (P1)

1.  **Implement Notification Count**: Update `app/api/notifications/count/route.ts` to query the database.
2.  **Connect Insights API**: Replace mock data in `MaintenanceInsights` with real data fetching.

### Short Term (P2)

3.  **Delete Deprecated Seeds**: Remove `prisma/seeds/maintenance-templates.ts` and `prisma/seed-data/template-packs.ts` once JSON seeding is verified.
4.  **Review Cron Jobs**: Finalize logic in `app/api/cron/process-schedules/route.ts`.

### Long Term (P3)

5.  **Upgrade NextAuth**: Plan migration to NextAuth v5.
6.  **Performance Audit**: Run full bundle analysis and database query performance review.

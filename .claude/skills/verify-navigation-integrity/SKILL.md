---
name: verify-navigation-integrity
description: Validates navigation links point to existing routes and checks active state logic implementation
---

# Verify Navigation Integrity

## Description
Performs a static analysis of navigation components to ensure all links point to valid routes and that "Active State" logic is correctly implemented. This prevents broken links and confusing navigation UX.

## Usage
Run this skill after modifying `layout.tsx`, `Sidebar.tsx`, or any component containing navigation links.

## Steps
1.  **Link Validation:**
    *   Scan for `<Link href="...">` usages.
    *   **Check:** Does the `href` path exist in the `app/` directory? (e.g., if `href="/dashboard/settings"`, does `app/dashboard/settings/page.tsx` exist?)
    *   **Dynamic Routes:** If `href` contains dynamic segments (e.g., `/assets/${id}`), verify that the corresponding `[id]` folder exists.

2.  **Active State Logic:**
    *   Scan for `usePathname()` usage.
    *   **Pattern:** Look for logic like `const isActive = pathname === href`.
    *   **Correction:** Suggest using `pathname?.startsWith(href)` for parent items (e.g., keeping "Assets" active when viewing a specific Asset).
    *   **Visuals:** Verify that the `isActive` state applies a distinct visual style (e.g., `bg-primary/10 text-primary`).

3.  **Accessibility:**
    *   Verify that navigation links have `aria-current="page"` when active.

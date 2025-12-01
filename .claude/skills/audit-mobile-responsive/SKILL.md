---
name: audit-mobile-responsive
description: Analyzes components for mobile responsiveness issues including grid overflows, fixed widths, and touch targets for iPhone SE (375px)
---

# Audit Mobile Responsiveness

## Description
Analyzes a React component or Page for common mobile responsiveness violations, specifically targeting the iPhone SE (375px) viewport constraints. It checks for fixed widths, grid overflows, and small touch targets.

## Usage
Use this skill before submitting any UI changes to verify mobile compliance.

## Steps
1.  **Grid Check:** 
    *   Scan the code for `grid-cols-*` classes. 
    *   **Rule:** If `grid-cols-2` or higher is used, it MUST have a `md:` or `lg:` prefix (e.g., `grid-cols-1 md:grid-cols-2`). 
    *   **Violation:** `grid-cols-2` without prefix causes overflow on 375px.
2.  **Fixed Width Check:** 
    *   Grep for `w-[...px]` or `min-w-[...px]`. 
    *   **Rule:** Any fixed width > 350px is a violation. 
    *   **Fix:** Suggest changing to `w-full` or `max-w-[...]`.
3.  **Touch Target Check:** 
    *   Scan for `button`, `a`, or `input` elements. 
    *   **Rule:** Interactive elements must have `min-h-[44px]` or equivalent padding.
    *   **Violation:** `size="sm"` on shadcn buttons (usually 32px height) without extra padding.
    *   **Fix:** Suggest increasing to `default` size or adding `py-2`.
4.  **Scroll Container:** 
    *   If the component involves a `<Table>` or `<Recharts>`, ensure it is wrapped in a `div` with `overflow-x-auto`.

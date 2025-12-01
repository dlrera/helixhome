---
name: verify-wcag-compliance
description: Scans codebase for WCAG 2.1 AA accessibility violations including alt text, aria-labels, and heading hierarchy
---

# Verify WCAG Compliance

## Description
Scans the codebase for static accessibility violations to ensure WCAG 2.1 AA compliance.

## Usage
Run this skill when touching UI components or adding new pages.

## Steps
1.  **Lint Check:** Run `npm run lint` specifically checking for `jsx-a11y` errors.
2.  **Image Check:** Grep for `<Image />` or `<img />` tags missing `alt` props.
3.  **Button Check:** Grep for `<Button>` or `<button>` tags that contain only icons (no text). Verify they have `aria-label` or `sr-only` text spans.
4.  **Heading Hierarchy:** Scan page files to ensure `<h1>` is used only once per page and heading levels (`h2`, `h3`) are not skipped.
5.  **Output:** Write a list of files requiring remediation to `tasks/accessibility-remediation-list.md`.

---
name: run-lighthouse-audit
description: Executes Lighthouse performance audits to verify Dashboard loads under 3 seconds
---

# Run Lighthouse Audit

## Description
Executes a Lighthouse performance audit against the local server to verify if Dashboard load times meet the <3s target.

## Usage
Use this skill after major backend changes or before marking a performance task as "Complete".

## Steps
1.  **Setup:** Ensure the dev server is running (`npm run dev`).
2.  **Execute:** Run `npx lighthouse http://localhost:3000/dashboard --output json --output-path ./artifacts/audit-report.json --chrome-flags="--headless"`.
3.  **Analyze:** Read the JSON output.
    *   **FCP (First Contentful Paint):** Must be < 2000ms.
    *   **TTI (Time to Interactive):** Must be < 3500ms.
    *   **Score:** Performance score must be > 80.
4.  **Report:** Generate a brief markdown summary in `artifacts/performance-summary.md` highlighting the regression or improvement.

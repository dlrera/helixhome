---
name: verify-e2e-coverage
description: Ensures features have Playwright tests covering happy path and error scenarios
---

# Verify E2E Coverage

## Description
Ensures that every new feature has a corresponding Playwright test file that covers the "Happy Path" and at least one "Error Path".

## Usage
Run this skill before marking a task as "Done" or "Ready for Review".

## Steps
1.  **Identify Feature:** Determine the feature being built (e.g., "Add Asset").
2.  **Check Existence:** Does `tests/e2e/[feature].spec.ts` exist?
3.  **Scan Content:** Read the test file.
    *   **Happy Path:** Look for `test('should successfully create...')`.
    *   **Error Path:** Look for `test('should show error when...')`.
4.  **Run Test:** Execute `npx playwright test tests/e2e/[feature].spec.ts`.
5.  **Pass/Fail:** If the file is missing or the test fails, the task cannot be marked as Done.

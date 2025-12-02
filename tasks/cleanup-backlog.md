# Cleanup Backlog

Items documented here are technical debt or cleanup tasks that are **not currently being worked on**. They are tracked for future reference and can be addressed when time permits or during dedicated refactoring sprints.

---

## Priority Levels

- **P1 - High**: Should be cleaned up soon, may cause confusion or minor issues
- **P2 - Medium**: Can wait, but would improve code quality
- **P3 - Low**: Nice to have, cosmetic or minor improvements

---

## Deprecated Files (P2)

### TypeScript Template Seed Files

**Status**: Deprecated but preserved for rollback safety
**Added**: 2025-12-01
**Context**: Migrated to JSON-based content system (Phases 1-3 complete)

| File                                    | Purpose                                | Action                                     |
| --------------------------------------- | -------------------------------------- | ------------------------------------------ |
| `prisma/seeds/maintenance-templates.ts` | 20 standalone templates (TypeScript)   | Can be deleted after JSON system is stable |
| `prisma/seed-data/template-packs.ts`    | 6 template packs with nested templates | Can be deleted after JSON system is stable |

**Why kept**: Provides rollback capability if JSON-based seeding has issues in production.

**When to delete**: After 2-4 weeks of stable production use with JSON-based seeding.

**How to rollback** (if needed):

1. Uncomment imports in `prisma/seed.ts`:
   ```typescript
   import { seedMaintenanceTemplates } from './seeds/maintenance-templates'
   import { SYSTEM_PACKS } from './seed-data/template-packs'
   ```
2. Uncomment the TypeScript seeding code block in `seed.ts`
3. Comment out `loadContentFromJSON(prisma)` call

---

## Test File TypeScript Errors (P2)

**Status**: Pre-existing errors, not blocking development
**Files affected**:

- `tests/api/templates.test.ts`
- `tests/e2e/ui-ux-audit.spec.ts`
- `tests/unit/template-helpers.test.ts`

**Errors**:

```
- Module '@playwright/test' has no exported member 'describe'
- Module '@playwright/test' has no exported member 'it'
- Module '@playwright/test' has no exported member 'beforeAll'
- Property 'timing' does not exist on type 'Response'
```

**Root cause**: Tests using Jest-style syntax (`describe`, `it`) with Playwright, which uses different exports (`test`, `test.describe`).

**Fix**: Convert tests to Playwright's native syntax or add proper type declarations.

---

## Untracked Files in Git (P3)

**Status**: Various temporary/generated files not in `.gitignore`

| File/Pattern                       | Type                         | Action                                  |
| ---------------------------------- | ---------------------------- | --------------------------------------- |
| `cookies.txt`, `local_cookies.txt` | Auth testing artifacts       | Add to `.gitignore`                     |
| `nul`                              | Windows null device artifact | Add to `.gitignore`                     |
| `report.json`, `report_nav.json`   | Test/audit reports           | Add to `.gitignore` or commit if needed |
| `test_output*.txt`                 | Test output logs             | Add to `.gitignore`                     |

**Recommended `.gitignore` additions**:

```gitignore
# Testing artifacts
cookies.txt
local_cookies.txt
test_output*.txt
report*.json

# Windows artifacts
nul
```

---

## Deleted Task Files to Archive (P3)

**Status**: Files marked as deleted in git status but may need archiving

Per git status, these files were deleted from `tasks/`:

- `task-9-checklist.md`, `task-9-critical-navigation-fixes.md`
- `task-10-checklist.md`, `task-10-completion-summary.md`, `task-10-mobile-responsive-fixes.md`
- `task-12-checklist.md`, `task-12-core-functionality-fixes.md`
- `task-13-accessibility-compliance.md`, `task-13-checklist.md`
- `task-14-checklist.md`, `task-14-ux-polish-production.md`
- `task-15-audit-gap-fixes.md`, `task-15-checklist.md`
- `playwright.config.ts` (root level)

**Action**: Verify these are intentionally deleted or should be moved to `tasks/_archive/`.

---

## Code Quality Items (P3)

### Console.log Statements

**Status**: Some debug logging may still exist in production code

**Action**: Audit codebase for `console.log` statements that should be removed or converted to proper logging.

### Unused Imports

**Status**: ESLint catches these but worth a sweep

**Action**: Run `pnpm lint:fix` and review any remaining unused import warnings.

---

## Documentation Updates Needed (P2)

### CLAUDE.md Updates

After JSON content migration, consider updating:

- Add `pnpm db:seed:json` to Essential Commands section
- Document the JSON content system under Project Structure
- Add note about `prisma/seed-data/library/` directory

### README.md (if exists)

- Document the new JSON-based template content system
- Explain how to add new template packs without code changes

---

## Future Refactoring Opportunities (P3)

### 1. Activity Logger Centralization

**Location**: `lib/utils/activity-logger.ts`
**Opportunity**: Consider moving to a service layer pattern for consistency.

### 2. API Route Consolidation

**Opportunity**: Some API routes may have duplicated validation or error handling logic that could be extracted to middleware.

### 3. Type Definitions

**Location**: `types/templates.ts`
**Opportunity**: Consider generating types from Prisma schema or Zod schemas to reduce duplication.

---

## How to Use This File

1. **Adding items**: Include date added, context, and clear action items
2. **Prioritizing**: Use P1/P2/P3 levels consistently
3. **Completing items**: Move to "Completed" section with date, don't delete
4. **Reviewing**: Check this file during sprint planning or dedicated refactoring time

---

## Completed Items

_Move completed cleanup items here with completion date._

| Item                                 | Completed    | Notes     |
| ------------------------------------ | ------------ | --------- |
| _Example: Remove legacy auth system_ | _2025-XX-XX_ | _PR #123_ |

---

_Last updated: 2025-12-01_

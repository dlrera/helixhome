# Obsolete and Redundant Files Analysis

## Files Recommended for Removal/Archival

### 1. Test Scripts at Project Root

#### `test-asset-api.ts` ⚠️ **REMOVE**
- **Location**: `/test-asset-api.ts`
- **Purpose**: Manual API testing script for asset endpoints
- **Status**: Superseded by Playwright E2E tests
- **Reason for Removal**:
  - Requires manual session cookie copying
  - Functionality now covered by automated Playwright tests
  - Outdated testing approach
  - Not referenced in package.json scripts
- **Recommendation**: Delete file (tests/e2e/ covers this functionality)

#### `test-db.ts` ⚠️ **REMOVE**
- **Location**: `/test-db.ts`
- **Purpose**: Database connection and query testing
- **Status**: Development utility
- **Reason for Removal**:
  - Not used in CI/CD pipeline
  - Better to use Prisma Studio for database inspection
  - Not referenced in package.json scripts
- **Recommendation**: Delete file (use `npx prisma studio` instead)

#### `test-task5-features.js` ⚠️ **REMOVE**
- **Location**: `/test-task5-features.js`
- **Purpose**: Testing specific to Task 5 deliverable
- **Status**: Development/validation script
- **Reason for Removal**:
  - Task-specific testing script
  - Task 5 is complete
  - Not part of ongoing test suite
  - Not referenced in package.json scripts
- **Recommendation**: Delete file or move to `tasks/_archive/`

### 2. Utility Scripts

#### `remove-duplicates.ts` ⚠️ **REVIEW & REMOVE**
- **Location**: `/remove-duplicates.ts`
- **Purpose**: Likely a one-time data cleaning utility
- **Status**: Utility script
- **Reason for Removal**:
  - Appears to be a one-time migration/cleanup script
  - Should not be at project root if it's a utility
  - If still needed, should be in `prisma/` folder or `scripts/` folder
- **Recommendation**:
  - Review the file content to confirm purpose
  - If it's no longer needed, delete it
  - If it might be needed again, move to `prisma/scripts/` or `tasks/_archive/`

### 3. Session Scripts

#### `ux-scripts/session_2025-10-07_13-57-57/` ⚠️ **ARCHIVE**
- **Location**: `/ux-scripts/session_2025-10-07_13-57-57/`
- **Purpose**: UX testing session recording/output
- **Status**: Historical data
- **Reason for Archival**:
  - Single session from October 7, 2025
  - Historical data that may have value for reference
  - Not actively used in development
- **Recommendation**:
  - If sessions are important, keep the `ux-scripts/` folder but document its purpose
  - If not needed, delete entire `ux-scripts/` folder
  - If only historical value, move to `tasks/_archive/ux-sessions/`

### 4. Task Management Files (Already Archived)

#### `tasks/_archive/` ✅ **ALREADY HANDLED**
- **Location**: `/tasks/_archive/`
- **Purpose**: Archived project management documents
- **Status**: Properly archived
- **Files Archived**:
  - task-1-checklist.md
  - task-1-database-schema.md
  - task-2-asset-management-api.md
  - task-2-checklist.md
  - task-2-completion-summary.md
  - task-3-asset-ui-pages.md
  - task-3-checklist.md
  - task-3-completion-summary.md
  - task-4-checklist.md
  - task-4-global-navigation.md
  - task-5-checklist.md
  - task-5-maintenance-templates.md
  - task-5-test-results.md
  - task-5a-checklist.md
  - task-5a-ux-improvements.md
  - task-5b-bug-fixes.md
  - task-5b-checklist.md
  - task-6-checklist.md
  - task-6-task-management-system.md
  - task-7-checklist.md
  - task-7-dashboard-enhancements.md
  - task-7-progress.md
  - task-7a-baseline-metrics.md
  - task-7a-checklist.md
  - task-7a-completion-summary.md
  - task-7a-performance-optimization.md
  - task-7a-performance-results.md
  - task-8-checklist.md
  - task-8-notification-system.md
  - task-8-prerequisites-and-setup.md
  - task-generation-instructions.md
- **Recommendation**: Keep as-is, already properly organized

### 5. Potentially Redundant Folders

#### `hooks/` ⚠️ **INVESTIGATE**
- **Location**: `/hooks/`
- **Purpose**: Global React hooks
- **Issue**: May overlap with `/lib/hooks/`
- **Recommendation**:
  - Check contents of `/hooks/` folder
  - If duplicate of `/lib/hooks/`, consolidate into one location
  - If different purpose, document the distinction
  - Next.js convention suggests keeping hooks in `lib/hooks/`

### 6. Build Artifacts (Already Gitignored)

These are properly excluded via `.gitignore` but worth noting:

✅ Properly Ignored:
- `.next/` - Next.js build output
- `node_modules/` - Dependencies
- `prisma/dev.db` - SQLite database
- `tsconfig.tsbuildinfo` - TypeScript build info
- `test-results/` - Playwright test artifacts

## Files to Keep (False Positives)

### Development Configuration Files ✅
These appear "old" but are essential:
- `.env` - Environment variables (keep, ensure .gitignored)
- `.env.test` - Test environment (keep)
- `.prettierrc` - Code formatting config (keep)
- `eslint.config.mjs` - Linting config (keep)
- `playwright.config.ts` - E2E test config (keep)
- `next.config.js` - Next.js config (keep)
- `tailwind.config.ts` - Tailwind config (keep)
- `tsconfig.json` - TypeScript config (keep)
- `postcss.config.mjs` - PostCSS config (keep)
- `components.json` - shadcn/ui config (keep)

### Documentation Files ✅
- `CLAUDE.md` - AI assistant project instructions (keep, actively used)
- `prd-creation.instructions.md` - PRD workflow (keep)
- `docs/` folder - User and deployment docs (keep)
- `instructions/` folder - AI workflow instructions (keep)

### Active Task Files ✅
- `tasks/taskhistory.md` - Active task tracking (keep)

## Cleanup Action Plan

### Immediate Actions (Safe to Delete)
```bash
# Delete test scripts at root
rm test-asset-api.ts
rm test-db.ts
rm test-task5-features.js
```

### Requires Investigation
```bash
# Review and decide on remove-duplicates.ts
# 1. Read the file to understand its purpose
# 2. If one-time script, delete it
# 3. If needed for reference, move to prisma/scripts/

# Review ux-scripts folder
# 1. Determine if UX sessions are valuable
# 2. If not, delete entire ux-scripts/ folder
# 3. If valuable, move to tasks/_archive/ux-sessions/

# Review hooks/ folder
# 1. Compare contents with lib/hooks/
# 2. If duplicate, consolidate to lib/hooks/
# 3. If different, document the distinction
```

### Files to Archive (Optional)
If you want to preserve historical context:
```bash
# Move to archive
mkdir -p tasks/_archive/obsolete-scripts
mv test-asset-api.ts tasks/_archive/obsolete-scripts/
mv test-db.ts tasks/_archive/obsolete-scripts/
mv test-task5-features.js tasks/_archive/obsolete-scripts/
mv remove-duplicates.ts tasks/_archive/obsolete-scripts/  # if keeping for reference
```

## Root Directory Cleanliness Report

**Current State**: 7/10
- ✅ Good: Build artifacts properly gitignored
- ✅ Good: Task files properly archived
- ✅ Good: Config files well-organized
- ⚠️ Issue: Test scripts at root should be removed
- ⚠️ Issue: Utility script at root (remove-duplicates.ts)
- ⚠️ Issue: UX scripts folder purpose unclear
- ⚠️ Issue: Potential hooks/ duplication

**Target State**: 9/10
After cleanup, root directory should only contain:
- Configuration files
- Documentation (CLAUDE.md, README)
- Source folders (app, components, lib, etc.)
- Test folder (tests/)
- Build folders (prisma/, styles/, types/)
- Project management (tasks/, docs/, instructions/)

## .gitignore Review

Current `.gitignore` appears comprehensive. Consider adding:
```gitignore
# Add if not present
test-*.ts
test-*.js
*.log
.DS_Store
.vscode/
.idea/
```

## Recommendation Summary

**High Priority** (Delete These):
1. ✅ `test-asset-api.ts`
2. ✅ `test-db.ts`
3. ✅ `test-task5-features.js`

**Medium Priority** (Investigate & Decide):
4. ⚠️ `remove-duplicates.ts` - Review first
5. ⚠️ `ux-scripts/` folder - Determine value
6. ⚠️ `hooks/` folder - Check for duplication

**Low Priority** (Already Handled):
- `tasks/_archive/` - Already properly organized
- Build artifacts - Already gitignored

**Estimated Disk Space Recovery**: Minimal (test scripts are small)
**Benefit**: Cleaner project structure, less confusion for developers

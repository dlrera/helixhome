# HelixIntel CMMS Platform - Critical Repair Checklist

## Priority: CRITICAL (Must Fix Immediately)

### 🔴 1. Templates Page Completely Broken

**Location**: `/templates` page
**Error**: "DialogContent requires a DialogTitle for the component to be accessible"
**Current State**: Blank white screen with 6 console errors
**Files to Check**:

- `/app/(protected)/templates/page.tsx`
- `/components/templates/template-browser.tsx`
- `/components/templates/apply-template-modal.tsx`
- `/components/templates/template-details-drawer.tsx`

**Fix Required**:

- Add DialogTitle component to all Dialog components
- Ensure all DialogContent components have proper accessibility structure
- Test that templates page loads and displays all 20 maintenance templates
- Verify category filtering works
- Ensure apply template modal opens correctly

---

## Priority: HIGH (Fix Before Release)

### 🟡 2. Persistent Error Notifications

**Location**: Multiple pages showing red error badges
**Current Behavior**: Shows "2 errors", "4 errors", "6 errors" without clear indication of what errors exist
**Files to Check**:

- Error boundary components
- Toast/notification system
- Console error handling

**Fix Required**:

- Identify source of persistent errors
- Either fix underlying errors or improve error display
- Clear error messages should explain what went wrong
- Non-critical errors should not persist in UI

### 🟡 3. Dashboard Stats Showing Zero

**Location**: Dashboard stats cards
**Current Display**: "Total Assets: 0" despite 3 assets existing in database
**Files to Check**:

- `/app/(protected)/dashboard/page.tsx`
- `/components/dashboard/stats-cards.tsx`
- API endpoints for fetching counts

**Fix Required**:

- Ensure dashboard correctly queries database for asset counts
- Fix task count calculation
- Update completed tasks this month calculation
- Verify stats refresh when data changes

---

## Priority: MEDIUM (Should Fix)

### 🟠 4. Missing Form Validation Feedback

**Location**: Asset creation/edit forms
**Current State**: Forms submit but validation messages not comprehensive
**Files to Check**:

- `/components/assets/asset-form.tsx`
- `/lib/validation/asset.ts`

**Fix Required**:

- Add inline validation messages for all fields
- Show field-specific errors (e.g., "Purchase date cannot be in the future")
- Highlight error fields in red
- Focus first error field on submit failure
- Clear errors as user corrects them

### 🟠 5. Missing Loading States

**Location**: Dashboard widgets, asset lists, template browser
**Files to Check**:

- `/components/dashboard/upcoming-maintenance.tsx`
- `/components/assets/asset-list.tsx`
- `/components/templates/template-browser.tsx`

**Fix Required**:

- Add skeleton loaders while data fetches
- Show loading spinners on buttons during submission
- Prevent multiple submissions while loading
- Add loading states to all async operations

### 🟠 6. Tooltip Implementation

**Location**: Collapsed sidebar icons
**Current State**: No tooltips when sidebar is collapsed
**Files to Check**:

- `/components/layout/sidebar.tsx`

**Fix Required**:

- Add tooltip component to show full navigation item names
- Display on hover when sidebar is collapsed
- Position tooltips to the right of icons
- Include keyboard shortcut hints if applicable

---

## Priority: LOW (Nice to Have)

### 🔵 7. Additional Keyboard Shortcuts

**Location**: Global keyboard navigation
**Current**: Only Cmd+K works
**Files to Check**:

- `/lib/hooks/use-keyboard-shortcuts.ts`
- `/components/layout/command-palette.tsx`

**Suggested Additions**:

- "/" to focus search
- "n" to create new (context-aware)
- "g" then "d" for go to dashboard
- "g" then "a" for go to assets
- "?" to show keyboard shortcuts help

### 🔵 8. Bulk Asset Selection

**Location**: Assets page grid
**Files to Check**:

- `/components/assets/asset-list.tsx`
- `/components/assets/asset-card.tsx`

**Features to Add**:

- Checkbox on each asset card
- Select all checkbox
- Bulk delete option
- Bulk edit categories

### 🔵 9. Print Styling

**Location**: Asset detail pages
**Files to Check**:

- Global CSS files
- Asset detail components

**Improvements**:

- Hide navigation in print view
- Format asset details for clean printing
- Include QR code for asset if applicable

---

## Testing Verification Checklist

After fixes are implemented, verify:

### Critical Path Tests

- [ ] Templates page loads without errors
- [ ] Can view all 20 maintenance templates
- [ ] Can filter templates by category
- [ ] Can search templates by name
- [ ] Can apply template to asset
- [ ] Dashboard stats show correct counts
- [ ] Error notifications are clear and dismissible

### Form & Validation Tests

- [ ] Asset creation shows validation errors inline
- [ ] Errors clear when corrected
- [ ] Cannot submit invalid data
- [ ] Success messages appear after submission
- [ ] Loading states prevent double submission

### Navigation & UI Tests

- [ ] Sidebar tooltips appear when collapsed
- [ ] All keyboard shortcuts work
- [ ] Loading skeletons appear during data fetch
- [ ] No console errors on any page
- [ ] Mobile responsiveness maintained

---

## Recommended Fix Order

1. **Fix Templates page first** (Critical - blocks entire feature)
2. **Fix dashboard stats** (High visibility issue)
3. **Clear error notifications** (Affects all pages)
4. **Add form validation messages** (Improves UX significantly)
5. **Implement loading states** (Professional polish)
6. **Add tooltips and shortcuts** (Enhancement)

---

## Files Most Likely Needing Updates

### Immediate Focus

1. `/components/templates/*` - All template components for Dialog fixes
2. `/app/(protected)/dashboard/page.tsx` - Dashboard stats queries
3. `/components/dashboard/stats-cards.tsx` - Stats display logic

### Secondary Focus

4. `/components/assets/asset-form.tsx` - Form validation display
5. `/components/layout/sidebar.tsx` - Tooltip implementation
6. `/lib/hooks/use-keyboard-shortcuts.ts` - Additional shortcuts

---

## Success Criteria

The fixes are complete when:

- Templates page loads and functions correctly
- Dashboard shows accurate data counts
- No unexplained error badges appear
- Forms provide clear validation feedback
- Loading states prevent user confusion
- All core features work as designed in Task 1-5

---

**Note to Dev Agent**: Start with the Templates page Dialog fix as it's blocking an entire feature area. The error message indicates missing DialogTitle components within DialogContent elements. This is an accessibility requirement that must be satisfied.

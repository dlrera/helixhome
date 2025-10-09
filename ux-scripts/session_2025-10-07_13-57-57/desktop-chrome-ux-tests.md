# HelixIntel CMMS Platform - Desktop Chrome UX Test Script

## Test Environment Requirements

### Prerequisites

- **Browser**: Google Chrome (latest stable version)
- **Platform**: Desktop only (minimum 1920x1080 resolution)
- **Test Account**: admin@example.com / admin123
- **Server**: http://localhost:3000
- **Database**: Seeded with initial data

### Pre-Test Setup

1. Clear Chrome cache and cookies
2. Ensure window is maximized (1920x1080 or larger)
3. Disable browser extensions that might interfere
4. Open Chrome DevTools Console to monitor for errors

---

## 1. Authentication & Initial Load

### 1.1 Sign In Flow

1. Open Chrome and navigate to http://localhost:3000
2. **Verify**: Sign-in page loads within 2 seconds
3. Enter credentials: admin@example.com / admin123
4. Click "Sign in with credentials"
5. **Verify**: Dashboard loads within 3 seconds
6. **Verify**: No console errors in DevTools

---

## 2. Desktop Navigation

### 2.1 Sidebar Functionality

1. **Verify**: Sidebar visible on left (240px width)
2. Click collapse arrow button
3. **Verify**: Sidebar animates to 64px width smoothly
4. **Verify**: Only icons visible, labels hidden
5. Hover over collapsed sidebar item
6. **Verify**: Tooltip shows full name
7. Click expand arrow
8. **Verify**: Sidebar expands with smooth animation
9. Refresh page (F5)
10. **Verify**: Sidebar state persists from localStorage

### 2.2 Command Palette (Cmd+K)

1. Press Ctrl+K
2. **Verify**: Command palette opens instantly
3. Type "ass" (for assets)
4. **Verify**: Autocomplete shows "Assets" option
5. Press Enter
6. **Verify**: Navigates to Assets page
7. Press Ctrl+K again
8. Press Escape
9. **Verify**: Palette closes without navigation

### 2.3 Page Navigation Performance

1. Click "Dashboard" in sidebar
2. **Verify**: Page transition smooth, no flicker
3. Click "Assets"
4. **Verify**: Active state updates immediately
5. Click "Templates"
6. **Verify**: Page loads, previous page unloads cleanly
7. Use browser back button
8. **Verify**: Returns to Assets, maintains scroll position

---

## 3. Asset Management

### 3.1 Asset Grid View

1. Navigate to Assets page
2. **Verify**: Grid displays with 3 columns
3. **Verify**: Cards have hover effect on mouse over
4. **Verify**: Card shadows and transitions smooth
5. Right-click on asset card
6. **Verify**: Browser context menu appears (no custom menu)

### 3.2 Search with Keyboard

1. Click search input or press "/" shortcut
2. Type "furnace"
3. **Verify**: Real-time filtering, no delay
4. **Verify**: Smooth fade animation for filtered items
5. Press Ctrl+A to select all text
6. Press Delete
7. **Verify**: All assets reappear smoothly

### 3.3 Create Asset - Keyboard Flow

1. Click "Add Asset" button
2. Press Tab to navigate through form
3. **Verify**: Focus indicators visible on all inputs
4. Use Space to open dropdown
5. Use arrow keys to select category
6. Press Enter to confirm selection
7. Tab to date picker
8. Type date manually (MM/DD/YYYY)
9. **Verify**: Date validates in real-time
10. Press Ctrl+Enter to submit
11. **Verify**: Form submits successfully

### 3.4 Drag and Drop Photo Upload

1. Open asset detail page
2. Click "Upload Photo"
3. Open file explorer
4. Drag image file to drop zone
5. **Verify**: Drop zone highlights on hover
6. Drop file
7. **Verify**: Preview appears immediately
8. **Verify**: Upload progress bar visible
9. **Verify**: Success notification in top-right

---

## 4. Template System

### 4.1 Template Browser Performance

1. Navigate to Templates page
2. **Verify**: All 20 templates load at once
3. **Verify**: No pagination needed on desktop
4. Scroll to bottom smoothly
5. **Verify**: No lag or stutter during scroll

### 4.2 Category Tab Navigation

1. Click through each category tab
2. **Verify**: Instant filtering, no loading state
3. **Verify**: Tab underline animates smoothly
4. Use arrow keys to navigate tabs
5. **Verify**: Keyboard navigation works

### 4.3 Template Details Modal

1. Click template card
2. **Verify**: Modal opens with fade animation
3. **Verify**: Background overlay at 50% opacity
4. Scroll within modal
5. **Verify**: Body scroll locked
6. Press Escape
7. **Verify**: Modal closes
8. Click outside modal
9. **Verify**: Modal closes

### 4.4 Apply Template - Multi-Select

1. Click "Apply" on template
2. **Verify**: Modal opens centered on screen
3. Click asset dropdown
4. **Verify**: Dropdown opens below input
5. Type to filter assets
6. **Verify**: Dropdown filters in real-time
7. Select asset with mouse
8. Change frequency dropdown
9. Select "Custom"
10. **Verify**: Number input appears with slide animation
11. Enter "45" days
12. Click "Apply Template"
13. **Verify**: Loading spinner on button
14. **Verify**: Success toast notification

---

## 5. Dashboard Widgets

### 5.1 Widget Loading States

1. Navigate to Dashboard
2. Hard refresh (Ctrl+Shift+R)
3. **Verify**: Skeleton loaders appear first
4. **Verify**: Content fades in as loaded
5. **Verify**: No layout shift after load

### 5.2 Interactive Stats Cards

1. Hover over stats cards
2. **Verify**: Subtle hover effect (elevation change)
3. Click on asset count card
4. **Verify**: Navigates to Assets page
5. Use browser back
6. Click on task count card
7. **Verify**: Navigates to Tasks page

### 5.3 Upcoming Maintenance

1. Review upcoming maintenance widget
2. **Verify**: Maximum 5 items shown
3. Hover over task item
4. **Verify**: Highlight effect
5. **Verify**: Cursor changes to pointer
6. Click task item
7. **Verify**: Navigates to task detail

---

## 6. Desktop-Specific Features

### 6.1 Multi-Tab Behavior

1. Open dashboard in current tab
2. Right-click "Assets" link
3. Select "Open in new tab"
4. **Verify**: Assets opens in new tab
5. Make change in new tab (create asset)
6. Switch back to original tab
7. Refresh
8. **Verify**: New asset appears

### 6.2 Keyboard Shortcuts

1. Press "?" to show keyboard shortcuts (if implemented)
2. Press "/" to focus search
3. Press "n" to create new (context-aware)
4. Press "g" then "d" for go to dashboard
5. Press "g" then "a" for go to assets
6. **Verify**: All shortcuts work

### 6.3 Copy/Paste Operations

1. Go to asset detail
2. Select model number text
3. Press Ctrl+C
4. Navigate to new asset form
5. Click model number field
6. Press Ctrl+V
7. **Verify**: Text pastes correctly
8. Select all with Ctrl+A
9. **Verify**: All text selected

---

## 7. Chrome-Specific Features

### 7.1 Chrome DevTools Integration

1. Open DevTools (F12)
2. Go to Network tab
3. Navigate between pages
4. **Verify**: API calls visible
5. **Verify**: Response times under 200ms
6. Check Console tab
7. **Verify**: No errors or warnings

### 7.2 Chrome Performance

1. Open DevTools Performance tab
2. Start recording
3. Navigate through 5 different pages
4. Stop recording
5. **Verify**: FPS stays above 30
6. **Verify**: No long tasks over 50ms
7. **Verify**: Memory usage stable

### 7.3 Chrome Autofill

1. Go to new asset form
2. Start typing in name field
3. **Verify**: Chrome suggestions appear
4. Select suggestion
5. **Verify**: Field populates correctly
6. Submit form
7. **Verify**: Validation works with autofilled data

---

## 8. Advanced Interactions

### 8.1 Bulk Selection (if available)

1. Go to Assets page
2. Hold Shift and click multiple cards
3. **Verify**: Multiple selection works
4. Right-click for context menu
5. **Verify**: Bulk actions available

### 8.2 Print Preview

1. Open asset detail page
2. Press Ctrl+P
3. **Verify**: Print preview shows clean layout
4. **Verify**: Navigation hidden in print view
5. Press Escape to close

### 8.3 Zoom Compatibility

1. Set Chrome zoom to 90% (Ctrl+-)
2. **Verify**: Layout remains intact
3. Set zoom to 110% (Ctrl++)
4. **Verify**: No horizontal scroll
5. Reset zoom (Ctrl+0)

---

## 9. Data Operations

### 9.1 Form Validation Feedback

1. Create new asset with errors
2. **Verify**: Inline error messages appear
3. **Verify**: Error fields highlighted in red
4. **Verify**: Focus jumps to first error
5. Fix errors one by one
6. **Verify**: Errors clear in real-time

### 9.2 Optimistic Updates

1. Edit asset name
2. Save changes
3. **Verify**: UI updates immediately
4. **Verify**: Success confirmed after server response
5. If error, **Verify**: UI reverts gracefully

### 9.3 Session Management

1. Keep tab open for 30+ minutes idle
2. Perform an action
3. **Verify**: Session still active
4. Open Chrome DevTools > Application > Cookies
5. **Verify**: Session cookie present
6. Delete session cookie
7. Try to navigate
8. **Verify**: Redirected to login

---

## 10. Performance Benchmarks

### 10.1 Page Load Times (Desktop Chrome)

- Sign-in page: < 1 second
- Dashboard: < 2 seconds
- Assets page: < 1.5 seconds
- Templates page: < 2 seconds
- Asset detail: < 1 second

### 10.2 Interaction Response Times

- Button click feedback: < 100ms
- Modal open: < 200ms
- Search filter: < 150ms
- Navigation: < 300ms
- Form submission: < 500ms

### 10.3 Resource Usage

- Initial bundle size: < 500KB
- Memory usage: < 100MB
- CPU idle: > 95%
- Network idle after load: Yes

---

## Test Execution Checklist

| Test Section        | Duration | Pass | Fail | Notes |
| ------------------- | -------- | ---- | ---- | ----- |
| 1. Authentication   | 2 min    |      |      |       |
| 2. Navigation       | 5 min    |      |      |       |
| 3. Assets           | 8 min    |      |      |       |
| 4. Templates        | 7 min    |      |      |       |
| 5. Dashboard        | 3 min    |      |      |       |
| 6. Desktop Features | 5 min    |      |      |       |
| 7. Chrome Features  | 5 min    |      |      |       |
| 8. Advanced         | 3 min    |      |      |       |
| 9. Data Ops         | 5 min    |      |      |       |
| 10. Performance     | 5 min    |      |      |       |

**Total Duration**: ~48 minutes
**Chrome Version**: ****\_\_\_****
**Resolution**: ****\_\_\_****
**OS**: Windows / Mac / Linux

---

## Critical Chrome-Desktop Issues

### P0 - Blockers

- [ ] None identified

### P1 - Critical

- [ ] Issue:
- [ ] Issue:

### P2 - Major

- [ ] Issue:
- [ ] Issue:

### P3 - Minor

- [ ] Issue:
- [ ] Issue:

---

## Performance Metrics Summary

| Metric                   | Target  | Actual | Status |
| ------------------------ | ------- | ------ | ------ |
| First Contentful Paint   | < 1s    |        |        |
| Time to Interactive      | < 2s    |        |        |
| Cumulative Layout Shift  | < 0.1   |        |        |
| First Input Delay        | < 100ms |        |        |
| Largest Contentful Paint | < 2.5s  |        |        |

---

**Test Date**: ****\_\_\_****
**Tester**: ****\_\_\_****
**Chrome Version**: ****\_\_\_****
**Test Result**: PASS / FAIL

## Sign-off

- [ ] All P0 and P1 issues resolved
- [ ] Performance targets met
- [ ] No console errors
- [ ] Approved for release

**Approved By**: ****\_\_\_****
**Date**: ****\_\_\_****

# HelixIntel CMMS Platform - Comprehensive UX Test Scripts

## Test Environment Setup

### Prerequisites

- Test users: admin@example.com / admin123 and test@example.com / test123
- Development server running at http://localhost:3000
- Chrome, Firefox, or Safari browser
- Desktop and mobile device (or browser mobile emulation)

### Initial State

- Database seeded with sample data (3 assets, 20 templates)
- Clear browser cache and cookies before testing

---

## 1. Authentication Flow Tests

### 1.1 Sign In - Valid Credentials

1. Navigate to http://localhost:3000
2. Enter email: admin@example.com
3. Enter password: admin123
4. Click "Sign in with credentials"
5. **Verify**: Redirected to /dashboard
6. **Verify**: User name displays in top-right corner

### 1.2 Sign In - Invalid Credentials

1. Navigate to http://localhost:3000
2. Enter email: admin@example.com
3. Enter incorrect password
4. Click "Sign in with credentials"
5. **Verify**: Error message appears
6. **Verify**: Remains on sign-in page

### 1.3 Sign Out

1. Click user avatar in top-right corner
2. Click "Sign Out"
3. **Verify**: Redirected to sign-in page
4. **Verify**: Cannot access /dashboard without signing in

### 1.4 Protected Routes

1. While signed out, attempt to navigate to /dashboard
2. **Verify**: Redirected to sign-in page
3. Sign in with valid credentials
4. **Verify**: Automatically redirected to originally requested page

---

## 2. Navigation System Tests

### 2.1 Desktop Sidebar Navigation

1. Sign in and navigate to dashboard
2. **Verify**: Sidebar visible on left side
3. Click collapse button (arrow icon)
4. **Verify**: Sidebar collapses to icon-only view
5. Click expand button
6. **Verify**: Sidebar expands with labels
7. Refresh page
8. **Verify**: Sidebar state persists

### 2.2 Navigation Links

1. Click "Dashboard" in sidebar
2. **Verify**: Dashboard page loads, link highlighted
3. Click "Assets" in sidebar
4. **Verify**: Assets page loads, link highlighted
5. Click "Templates" in sidebar
6. **Verify**: Templates page loads, link highlighted
7. Click "Tasks" in sidebar
8. **Verify**: Tasks placeholder page loads

### 2.3 Command Palette

1. Press Cmd+K (Mac) or Ctrl+K (Windows)
2. **Verify**: Command palette opens
3. Type "assets"
4. **Verify**: Assets option appears
5. Press Enter
6. **Verify**: Navigate to Assets page
7. Press Escape
8. **Verify**: Command palette closes

### 2.4 User Dropdown Menu

1. Click user avatar in top-right corner
2. **Verify**: Dropdown menu opens
3. **Verify**: Shows user name and email
4. Click "Profile"
5. **Verify**: Profile page loads
6. Click user avatar again
7. Click outside dropdown
8. **Verify**: Dropdown closes

### 2.5 Mobile Navigation

1. Resize browser to mobile width (<1024px)
2. **Verify**: Sidebar hidden, hamburger menu visible
3. Click hamburger menu
4. **Verify**: Sidebar slides in from left
5. Click backdrop
6. **Verify**: Sidebar closes
7. Click hamburger menu again
8. Click "Assets"
9. **Verify**: Navigates to Assets and sidebar auto-closes

### 2.6 Mobile Floating Action Button

1. On mobile view, navigate to any page
2. **Verify**: FAB visible in bottom-right corner
3. Click FAB
4. **Verify**: Navigates to /assets/new
5. Resize to desktop view
6. **Verify**: FAB disappears

---

## 3. Asset Management Tests

### 3.1 View Asset List

1. Navigate to Assets page
2. **Verify**: Grid of asset cards displays
3. **Verify**: Each card shows: name, category icon, model number
4. **Verify**: Default shows 3 seeded assets

### 3.2 Asset Search

1. Type "Furnace" in search box
2. **Verify**: Results filter to show only furnace asset
3. Clear search
4. **Verify**: All assets display again
5. Type non-existent term
6. **Verify**: "No assets found" message appears

### 3.3 Asset Category Filter

1. Click "HVAC" category button
2. **Verify**: Only HVAC assets display
3. Click "Appliances" category button
4. **Verify**: Only appliance assets display
5. Click "All" category button
6. **Verify**: All assets display

### 3.4 Create New Asset

1. Click "Add Asset" button
2. **Verify**: New asset form page loads
3. Leave required fields empty and click "Save"
4. **Verify**: Validation errors display
5. Fill in:
   - Name: Test Air Conditioner
   - Category: Select "HVAC"
   - Model Number: AC-TEST-123
   - Serial Number: SN-TEST-456
   - Purchase Date: Select today's date
   - Warranty Expiry: Select date 1 year from now
6. Click "Save"
7. **Verify**: Redirects to asset detail page
8. **Verify**: Success notification appears
9. **Verify**: All entered data displays correctly

### 3.5 View Asset Details

1. Click on any asset card from list
2. **Verify**: Asset detail page loads
3. **Verify**: Shows all asset information
4. **Verify**: Photo placeholder or uploaded photo visible
5. **Verify**: Tasks tab visible
6. **Verify**: Recurring Schedules tab visible
7. **Verify**: Edit and Delete buttons visible

### 3.6 Edit Asset

1. From asset detail page, click "Edit"
2. **Verify**: Form pre-populated with current data
3. Change name to "Updated Asset Name"
4. Change model number
5. Click "Cancel"
6. **Verify**: Returns to detail page without changes
7. Click "Edit" again
8. Make changes and click "Save"
9. **Verify**: Returns to detail page
10. **Verify**: Changes reflected immediately

### 3.7 Upload Asset Photo

1. From asset detail page, click "Upload Photo" button
2. **Verify**: Photo upload dialog opens
3. Click "Choose File"
4. Select non-image file
5. **Verify**: Error message about file type
6. Select valid image (JPG/PNG under 5MB)
7. **Verify**: File name displays
8. Click "Upload"
9. **Verify**: Loading state displays
10. **Verify**: Dialog closes, photo displays on asset

### 3.8 Delete Asset

1. From asset detail page, click "Delete"
2. **Verify**: Confirmation dialog appears
3. **Verify**: Warning about cascade deletion
4. Click "Cancel"
5. **Verify**: Dialog closes, asset unchanged
6. Click "Delete" again
7. Click "Confirm"
8. **Verify**: Redirects to assets list
9. **Verify**: Deleted asset no longer appears

---

## 4. Maintenance Template Tests

### 4.1 Browse Templates

1. Navigate to Templates page
2. **Verify**: Grid of template cards displays
3. **Verify**: 20 templates visible
4. **Verify**: Each shows: name, category, frequency, duration, difficulty

### 4.2 Filter Templates by Category

1. Click "HVAC" category tab
2. **Verify**: Only HVAC templates display
3. Click "Plumbing" category tab
4. **Verify**: Only plumbing templates display
5. Click "All" tab
6. **Verify**: All templates display

### 4.3 Search Templates

1. Type "Filter" in search box
2. **Verify**: Only filter-related templates display
3. Clear search
4. **Verify**: All templates display
5. Type non-existent term
6. **Verify**: "No templates found" message

### 4.4 View Template Details

1. Click on any template card
2. **Verify**: Template details drawer/modal opens
3. **Verify**: Shows full description
4. **Verify**: Lists instructions
5. **Verify**: Shows required tools
6. **Verify**: Shows safety precautions
7. Click close button
8. **Verify**: Drawer/modal closes

### 4.5 Apply Template from Templates Page

1. Click "Apply" button on any template card
2. **Verify**: Apply template modal opens
3. **Verify**: Asset dropdown populated
4. Select an asset
5. **Verify**: Frequency selector shows default
6. Change frequency to "Monthly"
7. Click "Cancel"
8. **Verify**: Modal closes without changes
9. Click "Apply" again, select asset and frequency
10. Click "Apply Template"
11. **Verify**: Success notification
12. **Verify**: Modal closes

---

## 5. Template Application from Asset Tests

### 5.1 View Suggested Templates

1. Navigate to any asset detail page
2. **Verify**: "Maintenance Templates" section visible
3. **Verify**: Suggested templates for asset category shown
4. **Verify**: Already applied templates marked as "Applied"

### 5.2 Apply Template from Asset

1. Click "Apply" on a suggested template
2. **Verify**: Apply template modal opens
3. **Verify**: Asset pre-selected and disabled
4. **Verify**: Template details shown
5. Select "Custom" frequency
6. **Verify**: Custom days input appears
7. Enter 45 days
8. Click "Apply Template"
9. **Verify**: Success notification
10. **Verify**: Template now shows "Applied" badge
11. **Verify**: New schedule appears in Recurring Schedules tab

### 5.3 View Active Schedules

1. Click "Recurring Schedules" tab on asset detail
2. **Verify**: List of active schedules displays
3. **Verify**: Each shows: template name, frequency, next due date
4. **Verify**: Edit and Delete buttons visible

### 5.4 Edit Schedule

1. Click "Edit" on any schedule
2. **Verify**: Edit modal opens
3. Change frequency to "Quarterly"
4. Click "Save"
5. **Verify**: Schedule updates
6. **Verify**: Next due date recalculated

### 5.5 Pause/Delete Schedule

1. Click "Pause" on any schedule
2. **Verify**: Schedule marked as paused
3. Click "Resume"
4. **Verify**: Schedule reactivated
5. Click "Delete"
6. **Verify**: Confirmation dialog appears
7. Click "Confirm"
8. **Verify**: Schedule removed from list

---

## 6. Dashboard Tests

### 6.1 Dashboard Overview

1. Navigate to Dashboard
2. **Verify**: Stats cards display (asset count, task count)
3. **Verify**: Upcoming maintenance widget visible
4. **Verify**: Recent assets section visible
5. **Verify**: Quick actions buttons visible

### 6.2 Upcoming Maintenance Widget

1. View upcoming maintenance widget
2. **Verify**: Shows next 5 scheduled tasks
3. **Verify**: Each shows: task name, due date, asset
4. Click "View All"
5. **Verify**: Navigates to Tasks page

### 6.3 Quick Actions

1. Click "Add Asset" quick action
2. **Verify**: Navigates to new asset form
3. Navigate back to dashboard
4. Click "Create Task" quick action (if available)
5. **Verify**: Appropriate action occurs

---

## 7. Mobile-Specific Tests

### 7.1 Touch Interactions

1. On mobile device/emulator, navigate to Assets
2. Tap asset card
3. **Verify**: Detail page loads
4. Swipe horizontally on category filters
5. **Verify**: Categories scroll horizontally
6. Tap any button
7. **Verify**: Button responds to touch (min 44x44px target)

### 7.2 Mobile Forms

1. Navigate to new asset form on mobile
2. Tap text input
3. **Verify**: Virtual keyboard appears
4. **Verify**: Form scrolls to keep input visible
5. Tap date picker
6. **Verify**: Native date picker opens
7. Select category dropdown
8. **Verify**: Dropdown usable with touch

### 7.3 Mobile Modals

1. Open any modal on mobile
2. **Verify**: Modal fits screen width
3. **Verify**: Can scroll modal content if needed
4. **Verify**: Close button easily tappable
5. Tap backdrop
6. **Verify**: Modal closes

---

## 8. Error Handling Tests

### 8.1 Network Error Simulation

1. Open browser dev tools, set network to offline
2. Try to create new asset
3. **Verify**: Error notification appears
4. **Verify**: Form data preserved
5. Restore network connection
6. Retry submission
7. **Verify**: Succeeds without re-entering data

### 8.2 Validation Errors

1. Create new asset with invalid data
2. Enter future purchase date
3. Enter warranty date before purchase date
4. **Verify**: Appropriate validation messages appear
5. **Verify**: Cannot submit until corrected

### 8.3 404 Handling

1. Navigate to /assets/nonexistent-id
2. **Verify**: "Asset not found" message
3. **Verify**: Link to return to assets list

---

## 9. Performance Tests

### 9.1 Page Load Times

1. Clear browser cache
2. Navigate to Dashboard
3. **Verify**: Page loads in <3 seconds
4. Navigate to Assets page
5. **Verify**: Asset grid loads in <2 seconds
6. Navigate to Templates page
7. **Verify**: Templates load in <2 seconds

### 9.2 Search Responsiveness

1. On Assets page, type in search box
2. **Verify**: Results filter without lag
3. **Verify**: No page freeze during typing

### 9.3 Image Loading

1. Navigate to Assets with photos
2. **Verify**: Images load progressively
3. **Verify**: Placeholder shown while loading
4. **Verify**: No layout shift when images load

---

## 10. Accessibility Tests

### 10.1 Keyboard Navigation

1. Use Tab key to navigate through page
2. **Verify**: Focus indicators visible
3. **Verify**: All interactive elements reachable
4. Press Enter on focused button
5. **Verify**: Action triggers correctly

### 10.2 Screen Reader Compatibility

1. Enable screen reader
2. Navigate through main navigation
3. **Verify**: Menu items announced correctly
4. Navigate to form
5. **Verify**: Form labels announced
6. **Verify**: Error messages announced

### 10.3 Color Contrast

1. Review all text elements
2. **Verify**: Sufficient contrast against backgrounds
3. **Verify**: Error messages clearly visible
4. **Verify**: Disabled states distinguishable

---

## 11. Cross-Browser Tests

### 11.1 Chrome Testing

1. Run through critical flows in Chrome
2. **Verify**: All features functional
3. **Verify**: Layouts render correctly

### 11.2 Firefox Testing

1. Run through critical flows in Firefox
2. **Verify**: All features functional
3. **Verify**: Layouts render correctly

### 11.3 Safari Testing (if available)

1. Run through critical flows in Safari
2. **Verify**: All features functional
3. **Verify**: Layouts render correctly

---

## 12. Data Persistence Tests

### 12.1 Session Persistence

1. Create new asset
2. Refresh browser
3. **Verify**: Asset still exists
4. Edit asset
5. Open in new tab
6. **Verify**: Changes visible in new tab

### 12.2 Multi-User Scenarios

1. Sign in as admin@example.com in one browser
2. Sign in as test@example.com in another
3. Create asset as admin
4. **Verify**: Asset not visible to test user
5. Create asset as test user
6. **Verify**: Asset not visible to admin

---

## Test Results Summary

| Test Section         | Pass | Fail | Notes |
| -------------------- | ---- | ---- | ----- |
| 1. Authentication    |      |      |       |
| 2. Navigation        |      |      |       |
| 3. Assets            |      |      |       |
| 4. Templates         |      |      |       |
| 5. Asset Templates   |      |      |       |
| 6. Dashboard         |      |      |       |
| 7. Mobile            |      |      |       |
| 8. Error Handling    |      |      |       |
| 9. Performance       |      |      |       |
| 10. Accessibility    |      |      |       |
| 11. Cross-Browser    |      |      |       |
| 12. Data Persistence |      |      |       |

**Total Tests**: 93
**Passed**: **_
**Failed**: _**
**Pass Rate**: \_\_\_%

---

## Critical Issues Found

1. Issue:
   - Steps to reproduce:
   - Expected:
   - Actual:
   - Severity:

2. Issue:
   - Steps to reproduce:
   - Expected:
   - Actual:
   - Severity:

---

## Recommendations

1.
2.
3.

---

**Test Date**: ****\_\_\_****
**Tested By**: ****\_\_\_****
**Environment**: Development
**Version**: MVP through Task 5

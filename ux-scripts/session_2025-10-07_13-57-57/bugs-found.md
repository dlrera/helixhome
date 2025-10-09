# Bugs Found During Usability Testing

## Critical Bugs

### 1. Templates Page Broken

- **Location**: /templates
- **Error**: DialogContent requires a DialogTitle for the component to be accessible
- **Result**: Blank white screen, 6 console errors
- **Impact**: Templates feature completely unusable

## High Priority Bugs

### 2. Dashboard Stats Incorrect

- **Location**: Dashboard stats cards
- **Issue**: Shows "Total Assets: 0" when 3 assets exist in database
- **Impact**: Misleading information to users

### 3. Persistent Error Notifications

- **Location**: Multiple pages
- **Issue**: Red error badges showing "2 errors", "4 errors", "6 errors"
- **Impact**: No clear indication what errors are or how to resolve them

## Medium Priority Bugs

### 4. Missing Sidebar Tooltips

- **Location**: Collapsed sidebar
- **Issue**: No tooltips appear when sidebar is in icon-only mode
- **Impact**: Users cannot see full navigation labels when collapsed

### 5. Form Validation Messages Incomplete

- **Location**: Asset creation/edit forms
- **Issue**: Validation errors not displayed inline with fields
- **Impact**: Users don't know which specific fields have errors

### 6. Loading States Missing

- **Location**: Dashboard widgets, asset lists
- **Issue**: No loading indicators during data fetching
- **Impact**: Users unsure if page is loading or broken

## Test Blockers

### 7. Template-Related Features

- **Blocked Tests**: Template browsing, filtering, searching, applying
- **Reason**: Templates page does not render
- **Tests Skipped**: 10+

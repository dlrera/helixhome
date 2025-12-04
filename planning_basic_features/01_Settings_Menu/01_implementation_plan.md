# Implementation Plan: Settings Menu

## Goal

Implement a comprehensive Settings Menu that allows users to configure application-wide preferences, manage home details, and control notification settings, distinct from the user profile.

## Proposed Changes

### 1. Navigation & Routing

- Create a new route group `(protected)/settings`.
- Implement a sidebar navigation layout for settings sub-pages.
- Add "Settings" link to the main application navigation (sidebar or header).

### 2. Settings Sections (Sub-pages)

- **General**: Theme toggle, compact mode, currency, date format.
- **Notifications**: Toggles for Email/Push, alert types (reminders, overdue).
- **Home**: Home name, address, property type, year built, size.
- **Members**: List members, invite interface (UI only initially if backend not ready).
- **Data**: Export options (stubbed).

### 3. Database Schema

- Update `Home` model to include details (address, type, year, size).
- Create `HomeSettings` or `UserPreferences` model if per-user/per-home settings are needed beyond the `Home` model.
- _See `02_schema_updates.md` for details (if applicable)._

### 4. UI Components

- Use `react-hook-form` and `zod` for all settings forms.
- Reuse existing UI components (Input, Select, Switch, Button).
- Create `SettingsSidebar` and `SettingsLayout`.

### 5. Application Integration (New Phase)

- **Dashboard Header**: Update to display the dynamic "Home Name" from settings instead of hardcoded value.
- **Theme**: Ensure dark/light mode preference persists and applies globally (using `next-themes`).
- **Formatting Helpers**: Create utility functions for currency and date formatting that respect user preferences.
- **Data Display**: Update Asset and Task views to use the formatting helpers.

## Verification Plan

### Automated Tests

- **Unit Tests**: Test form validation logic (Zod schemas).
- **E2E Tests (Playwright)**:
  - Verify navigation to `/settings`.
  - Test updating a setting (e.g., Home Name) and verifying persistence.
  - Test theme toggle functionality.

### Manual Verification

1.  Log in as a user.
2.  Navigate to Settings.
3.  Click through each tab (General, Notifications, Home).
4.  Change the "Home Name" and save. Verify it updates in the dashboard header.
5.  Toggle "Dark Mode" and verify the UI changes.

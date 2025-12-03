# Settings Menu Proposal

## Overview

This document proposes the structure and content for the new **Settings Menu**, distinct from the existing Profile Menu. The Settings Menu will focus on application-wide configurations, preferences, and home management, while the Profile Menu remains focused on the individual user's account details and session management.

## Navigation Structure

The Settings Menu will be accessible via a dedicated "Settings" item in the main navigation sidebar or a gear icon in the header, separate from the user avatar.

## Proposed Sections

### 1. General Settings

- **Appearance**:
  - Theme selection (Light, Dark, System).
  - Compact mode toggle (for denser information display).
- **Regional**:
  - Currency preference (USD, EUR, etc. - relevant for cost tracking).
  - Date format preferences.

### 2. Notifications

- **Channels**:
  - Email Notifications (Toggle on/off).
  - Push Notifications (Toggle on/off).
  - SMS Notifications (Toggle on/off - _Future_).
- **Alert Types**:
  - Task Reminders (e.g., "Remind me 1 day before").
  - Overdue Task Alerts.
  - Weekly/Monthly Summary Reports.
  - Low Stock/Inventory Alerts (if applicable).

### 3. Home Management

- **Property Details**:
  - Home Name (e.g., "Summer Cottage").
  - Address/Location (useful for weather integration or service provider lookup).
  - Property Type (Single Family, Condo, etc.).
  - Year Built & Size (sq ft) - helps with automated maintenance suggestions.
- **Members**:
  - List of users with access to this home.
  - Invite new members (e.g., spouse, property manager).
  - Manage roles/permissions (Admin, Editor, Viewer).

### 4. Data & Privacy

- **Data Export**:
  - Download all asset and task data (CSV/JSON).
  - Download uploaded documents/manuals (ZIP).
- **Privacy**:
  - Data sharing preferences (if any analytics or third-party services are used).

### 5. Integrations (Future)

- **Calendar Sync**:
  - Google Calendar / Outlook / iCal feed URL for maintenance tasks.
- **Smart Home**:
  - Potential future links to smart devices.

## Distinction from Profile Menu

| Feature      | **Settings Menu**                   | **Profile Menu**              |
| :----------- | :---------------------------------- | :---------------------------- |
| **Scope**    | Application & Home-wide             | Individual User               |
| **Examples** | Theme, Notifications, Home Address  | Name, Email, Password, Avatar |
| **Actions**  | Configure app behavior, Manage Home | Edit Profile, Sign Out        |

## Implementation Plan

1.  Create a `/settings` route within the `(protected)` group.
2.  Implement a sidebar navigation for the settings sub-pages (General, Notifications, Home, etc.).
3.  Build the form components for each section using `react-hook-form` and `zod`.
4.  Update the database schema if necessary (e.g., adding `home_settings` or `user_preferences` tables).

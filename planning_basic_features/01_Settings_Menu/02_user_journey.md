# User Journey: Settings Menu

## Overview

This document outlines the user journey for accessing and interacting with the Settings Menu.

## Personas

- **Homeowner (Admin)**: Has full access to all settings, including home details and member management.
- **Family Member (Editor)**: Can change personal preferences (theme, notifications) but may have restricted access to home details.

## Journeys

### 1. Accessing Settings

1.  **Trigger**: User wants to change the application theme or update their home address.
2.  **Action**: User clicks on the "Settings" icon in the main navigation bar (or selects "Settings" from a dropdown).
3.  **Result**: User is taken to `/settings/general` (default view). The sidebar shows available categories: General, Notifications, Home, Members, Data.

### 2. Changing Application Theme (General Settings)

1.  **Context**: User prefers a dark interface for evening use.
2.  **Action**:
    - Navigate to "General" tab.
    - Locate "Appearance" section.
    - Select "Dark" from the Theme dropdown or toggle.
3.  **Result**: The application UI immediately updates to the dark theme. The preference is saved to the user's profile/local storage.

### 3. Updating Home Details (Home Settings)

1.  **Context**: User moved or wants to correct the home name.
2.  **Action**:
    - Navigate to "Home" tab.
    - Edit the "Home Name" field (e.g., change "My Home" to "Sunset Villa").
    - Click "Save Changes".
3.  **Result**: A success toast appears ("Home details updated"). The new name is reflected in the global header/dashboard.

### 4. Configuring Notifications

1.  **Context**: User is receiving too many emails.
2.  **Action**:
    - Navigate to "Notifications" tab.
    - Toggle "Email Notifications" to OFF.
    - Keep "Push Notifications" ON.
    - Click "Save Preferences".
3.  **Result**: Success message. User stops receiving emails but continues to get push alerts.

### 5. Exporting Data

1.  **Context**: User wants a backup of their asset inventory.
2.  **Action**:
    - Navigate to "Data" tab.
    - Click "Export All Data".
3.  **Result**: A download starts for `helixhome_data_export.zip` (or similar).

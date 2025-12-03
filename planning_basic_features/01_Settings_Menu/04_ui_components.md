# UI Components: Settings Menu

## Overview

This document details the UI components required for the Settings Menu, utilizing the existing `shadcn/ui` library and Tailwind CSS.

## New Components

### 1. `SettingsLayout` (`src/components/settings/settings-layout.tsx`)

- **Description**: A wrapper component for the settings section.
- **Structure**:
  - Sidebar (desktop) / Drawer (mobile) for navigation.
  - Main content area.
- **Props**: `children: React.ReactNode`

### 2. `SettingsSidebar` (`src/components/settings/settings-sidebar.tsx`)

- **Description**: Navigation menu for settings categories.
- **Items**:
  - General (Icon: Settings/Sliders)
  - Notifications (Icon: Bell)
  - Home (Icon: Home)
  - Members (Icon: Users)
  - Data (Icon: Database/Download)
- **State**: Highlights active route.

### 3. `GeneralSettingsForm` (`src/components/settings/general-settings-form.tsx`)

- **Description**: Form to update appearance and regional settings.
- **Fields**:
  - Theme (Select/Radio Group): Light, Dark, System.
  - Compact Mode (Switch).
  - Currency (Select).

### 4. `HomeDetailsForm` (`src/components/settings/home-details-form.tsx`)

- **Description**: Form to update home property details.
- **Fields**:
  - Home Name (Input).
  - Address (Input).
  - Property Type (Select).
  - Year Built (Input - Number).
  - Size (Input - Number).

### 5. `NotificationPreferencesForm` (`src/components/settings/notification-preferences-form.tsx`)

- **Description**: Form to toggle notification channels and types.
- **Fields**:
  - Email Notifications (Switch).
  - Push Notifications (Switch).
  - Grouped toggles for specific alert types.

## Reused Components

- `Button`
- `Input`
- `Label`
- `Select`
- `Switch`
- `Card`
- `Separator`
- `Toast` (for success/error messages)

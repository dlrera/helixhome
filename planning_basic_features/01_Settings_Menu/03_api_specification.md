# API Specification: Settings Menu

## Overview

This document defines the API endpoints and server actions required to manage settings. Since we are using Next.js App Router, these will primarily be Server Actions, but we may define API routes for external integrations if needed.

## Server Actions

### 1. Home Management (`src/app/settings/actions.ts`)

#### `updateHomeDetails`

- **Purpose**: Update the details of a home entity.
- **Input**:
  - `homeId`: String
  - `data`: Object (name, address, propertyType, yearBuilt, sizeSqFt)
- **Validation**: Zod schema `updateHomeSchema`.
- **Output**: Updated `Home` object or error.

### 2. User Preferences (`src/app/settings/actions.ts`)

#### `updateUserPreferences`

- **Purpose**: Update the user's application preferences.
- **Input**:
  - `userId`: String (inferred from session)
  - `data`: Object (theme, compactMode, notifications, etc.)
- **Validation**: Zod schema `updatePreferencesSchema`.
- **Output**: Updated `UserPreference` object or error.

## API Routes (Optional)

### `GET /api/user/settings`

- **Purpose**: Fetch current user settings (if not using Server Components).
- **Response**: JSON object with preferences.

### `POST /api/user/data/export`

- **Purpose**: Trigger a data export job.
- **Response**: JSON with `jobId` or `downloadUrl`.

## Error Handling

- All actions should return a standard result object: `{ success: boolean, data?: any, error?: string }`.
- Use `try-catch` blocks to handle database errors.
- Validate user ownership before updating `Home` records.

# API Specification: Expanded Template Library

## Base URL

`/api/templates`

## Endpoints

### 1. List Template Packs

**GET** `/api/templates/packs`

**Query Params**:

- `category` (optional): Filter by AssetCategory
- `includeSystem` (boolean, default true)

**Response**:

```json
[
  {
    "id": "pack_123",
    "name": "Spring HVAC Tune-up",
    "description": "Essential maintenance for your cooling system.",
    "tags": ["Seasonal", "HVAC"],
    "templateCount": 5
  }
]
```

### 2. Browse Templates

**GET** `/api/templates`

**Query Params**:

- `packId` (optional)
- `category` (optional)
- `search` (string)

**Response**:

```json
{
  "data": [
    {
      "id": "tpl_456",
      "name": "Replace Air Filter",
      "frequency": "QUARTERLY",
      "estimatedDurationMinutes": 15,
      "packId": "pack_123"
    }
  ],
  "pagination": { ... }
}
```

### 3. Get Recommendations

**GET** `/api/templates/recommendations`

**Context**:

- Uses the authenticated user's `HomeProfile` and `Assets`.
- Logic:
  1. Fetch all active System Packs.
  2. Filter by Climate Zone (if set in HomeProfile).
  3. Filter by Home Age (if set).
  4. Rank by relevance (e.g., if user has Asset of category HVAC, boost HVAC packs).

**Response**:

```json
[
  {
    "reason": "Recommended for your 1990s Home",
    "pack": { ... },
    "templates": [ ... ]
  },
  {
    "reason": "Spring Season Essentials",
    "pack": { ... },
    "templates": [ ... ]
  }
]
```

### 4. Apply Template (Create Schedule)

**POST** `/api/templates/:id/apply`

**Body**:

```json
{
  "assetId": "asset_789",
  "startDate": "2025-12-01" // Optional, defaults to today
}
```

**Logic**:

- Creates a `RecurringSchedule` linking the Asset and Template.
- Generates the _first_ `Task` immediately.

### 5. Clone Template (Customize)

**POST** `/api/templates/:id/clone`

**Body**:

```json
{
  "name": "My Custom Filter Change", // Optional override
  "frequency": "MONTHLY" // Optional override
}
```

**Logic**:

- Creates a new `MaintenanceTemplate` with `isSystemTemplate = false`.
- Sets `originalTemplateId` to the source.
- Assigns ownership to the user (needs `userId` field on MaintenanceTemplate or a separate UserTemplate relation? _Note: Current schema doesn't have userId on MaintenanceTemplate, we might need to add it for custom templates._)

**Update to Schema Note**:

- We need `userId` on `MaintenanceTemplate` (nullable) to support user-created custom templates. System templates have `userId = null`.

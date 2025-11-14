# API Endpoints Documentation

## Base URL
Development: `http://localhost:3000/api`

## Authentication
All protected endpoints require authentication via NextAuth.js session cookies.

## Response Format
All endpoints return JSON with standard format:
```json
{
  "data": {},        // On success
  "error": "...",    // On error
  "message": "..."   // Optional message
}
```

---

## Authentication Endpoints

### POST /api/auth/[...nextauth]
NextAuth.js dynamic route handler

**Providers**: Credentials (email/password)
**Session Strategy**: JWT

**Sign In**:
```
POST /api/auth/callback/credentials
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

---

## Asset Endpoints

### GET /api/assets
List all assets for the authenticated user's home

**Auth**: Required
**Query Parameters**:
- `search` (string) - Search by name, model, serial number
- `category` (AssetCategory) - Filter by category
- `homeId` (string) - Filter by home ID

**Response**:
```json
{
  "assets": [
    {
      "id": "clxxx",
      "homeId": "clxxx",
      "name": "Kitchen Refrigerator",
      "category": "APPLIANCE",
      "modelNumber": "GE PFE28KYNFS",
      "serialNumber": "SN123456",
      "purchaseDate": "2024-01-15T00:00:00.000Z",
      "warrantyExpiryDate": "2025-01-15T00:00:00.000Z",
      "photoUrl": "data:image/jpeg;base64,...",
      "metadata": {},
      "createdAt": "2024-10-01T12:00:00.000Z",
      "updatedAt": "2024-10-01T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### POST /api/assets
Create a new asset

**Auth**: Required
**Body**:
```json
{
  "homeId": "clxxx",
  "name": "Kitchen Refrigerator",
  "category": "APPLIANCE",
  "modelNumber": "GE PFE28KYNFS",
  "serialNumber": "SN123456",
  "purchaseDate": "2024-01-15",
  "warrantyExpiryDate": "2025-01-15",
  "photoUrl": "data:image/jpeg;base64,...",
  "metadata": {}
}
```

**Response**: 201 Created
```json
{
  "id": "clxxx",
  "homeId": "clxxx",
  "name": "Kitchen Refrigerator",
  ...
}
```

**Validation**: Zod schema `lib/validation/asset.ts`

---

### GET /api/assets/[id]
Get a single asset by ID

**Auth**: Required
**Response**: Asset object

---

### PUT /api/assets/[id]
Update an asset

**Auth**: Required
**Body**: Partial asset object (only fields to update)
**Response**: Updated asset object

---

### DELETE /api/assets/[id]
Delete an asset

**Auth**: Required
**Response**: 200 OK
**Note**: Cascades to delete related tasks and schedules (via Prisma)

---

### POST /api/assets/[id]/photo
Upload or update asset photo

**Auth**: Required
**Body**:
```json
{
  "photoUrl": "data:image/jpeg;base64,..."
}
```

**Response**: Updated asset with new photoUrl

---

## Task Endpoints

### GET /api/tasks
List all tasks for the authenticated user's home

**Auth**: Required
**Query Parameters**:
- `status` (TaskStatus) - Filter by status
- `priority` (Priority) - Filter by priority
- `assetId` (string) - Filter by asset
- `startDate` (ISO date) - Filter tasks due after this date
- `endDate` (ISO date) - Filter tasks due before this date
- `search` (string) - Search by title or description

**Response**:
```json
{
  "tasks": [
    {
      "id": "clxxx",
      "homeId": "clxxx",
      "assetId": "clxxx",
      "templateId": "clxxx",
      "title": "Replace HVAC Filter",
      "description": "Monthly filter replacement",
      "dueDate": "2024-11-15T00:00:00.000Z",
      "priority": "MEDIUM",
      "status": "PENDING",
      "completedAt": null,
      "completedBy": null,
      "completionNotes": null,
      "completionPhotos": null,
      "estimatedCost": 25.00,
      "actualCost": null,
      "costNotes": null,
      "notes": null,
      "createdAt": "2024-10-01T12:00:00.000Z",
      "updatedAt": "2024-10-01T12:00:00.000Z",
      "asset": { ... },
      "template": { ... }
    }
  ],
  "total": 1
}
```

---

### POST /api/tasks
Create a new task

**Auth**: Required
**Body**:
```json
{
  "homeId": "clxxx",
  "assetId": "clxxx",
  "templateId": "clxxx",
  "title": "Replace HVAC Filter",
  "description": "Monthly filter replacement",
  "dueDate": "2024-11-15",
  "priority": "MEDIUM",
  "estimatedCost": 25.00,
  "notes": "Buy 16x25x1 filters"
}
```

**Response**: 201 Created with task object
**Activity Log**: Creates TASK_CREATED activity

---

### GET /api/tasks/[id]
Get a single task by ID

**Auth**: Required
**Response**: Task object with asset and template relations

---

### PUT /api/tasks/[id]
Update a task

**Auth**: Required
**Body**: Partial task object
**Response**: Updated task object

---

### DELETE /api/tasks/[id]
Delete a task

**Auth**: Required
**Response**: 200 OK

---

### POST /api/tasks/[id]/complete
Mark a task as completed

**Auth**: Required
**Body**:
```json
{
  "completionNotes": "Filter replaced successfully",
  "completionPhotos": ["data:image/jpeg;base64,..."],
  "actualCost": 23.50,
  "costNotes": "Bought on sale"
}
```

**Response**: Updated task with status COMPLETED
**Activity Log**: Creates TASK_COMPLETED activity
**Side Effects**:
- Updates related recurring schedule's lastCompletedDate
- Calculates next due date for schedule

---

### POST /api/tasks/[id]/start
Mark a task as in progress

**Auth**: Required
**Response**: Task with status IN_PROGRESS

---

### POST /api/tasks/[id]/reopen
Reopen a completed task

**Auth**: Required
**Response**: Task with status PENDING

---

### GET /api/tasks/stats
Get task statistics

**Auth**: Required
**Response**:
```json
{
  "total": 45,
  "pending": 12,
  "inProgress": 3,
  "completed": 28,
  "overdue": 2,
  "completedThisMonth": 8,
  "upcomingThisWeek": 5
}
```

---

## Template Endpoints

### GET /api/templates
List all maintenance templates

**Auth**: Required
**Query Parameters**:
- `category` (AssetCategory) - Filter by category
- `search` (string) - Search by name or description

**Response**:
```json
{
  "templates": [
    {
      "id": "clxxx",
      "name": "HVAC Filter Replacement",
      "description": "Replace your HVAC air filter...",
      "category": "HVAC",
      "defaultFrequency": "MONTHLY",
      "estimatedDurationMinutes": 15,
      "difficulty": "EASY",
      "instructions": "[{\"step\": 1, \"description\": \"...\"}]",
      "requiredTools": "[\"Screwdriver\"]",
      "safetyPrecautions": "[\"Turn off HVAC system\"]",
      "isSystemTemplate": true,
      "isActive": true,
      "createdAt": "2024-10-01T12:00:00.000Z",
      "updatedAt": "2024-10-01T12:00:00.000Z"
    }
  ],
  "total": 20
}
```

---

### GET /api/templates/[id]
Get a single template by ID

**Auth**: Required
**Response**: Template object

---

### GET /api/templates/suggestions
Get personalized template suggestions based on user's assets

**Auth**: Required
**Response**:
```json
{
  "suggestions": [
    {
      "template": { ... },
      "reason": "You have 2 HVAC assets",
      "priority": "HIGH"
    }
  ]
}
```

---

### POST /api/templates/apply
Apply a template to an asset (create recurring schedule)

**Auth**: Required
**Body**:
```json
{
  "templateId": "clxxx",
  "assetId": "clxxx",
  "frequency": "MONTHLY",
  "customFrequencyDays": null,
  "nextDueDate": "2024-11-15"
}
```

**Response**: 201 Created with schedule object
**Activity Logs**: Creates TEMPLATE_APPLIED and SCHEDULE_CREATED activities

---

## Schedule Endpoints

### GET /api/schedules
List all recurring schedules for the authenticated user

**Auth**: Required
**Query Parameters**:
- `assetId` (string) - Filter by asset
- `isActive` (boolean) - Filter by active status

**Response**:
```json
{
  "schedules": [
    {
      "id": "clxxx",
      "templateId": "clxxx",
      "assetId": "clxxx",
      "frequency": "MONTHLY",
      "customFrequencyDays": null,
      "nextDueDate": "2024-11-15T00:00:00.000Z",
      "lastCompletedDate": "2024-10-15T00:00:00.000Z",
      "isActive": true,
      "createdAt": "2024-09-01T12:00:00.000Z",
      "updatedAt": "2024-10-15T12:00:00.000Z",
      "template": { ... },
      "asset": { ... }
    }
  ],
  "total": 1
}
```

---

### POST /api/schedules
Create a recurring schedule

**Auth**: Required
**Body**:
```json
{
  "templateId": "clxxx",
  "assetId": "clxxx",
  "frequency": "MONTHLY",
  "customFrequencyDays": null,
  "nextDueDate": "2024-11-15"
}
```

**Response**: 201 Created with schedule object

---

### PUT /api/schedules/[id]
Update a recurring schedule

**Auth**: Required
**Body**:
```json
{
  "frequency": "QUARTERLY",
  "nextDueDate": "2024-12-15",
  "isActive": true
}
```

**Response**: Updated schedule object
**Activity Log**: Creates SCHEDULE_UPDATED activity

---

### DELETE /api/schedules/[id]
Delete a recurring schedule

**Auth**: Required
**Response**: 200 OK

---

## Dashboard Endpoints

### GET /api/dashboard/analytics
Get dashboard analytics data

**Auth**: Required
**Query Parameters**:
- `period` (week|month|quarter|year) - Default: month

**Response**:
```json
{
  "period": "month",
  "startDate": "2024-10-01T00:00:00.000Z",
  "endDate": "2024-10-31T23:59:59.999Z",
  "completionTrend": [
    { "date": "2024-10-01", "count": 3 },
    { "date": "2024-10-08", "count": 5 }
  ],
  "categoryBreakdown": [
    { "category": "HVAC", "count": 8 },
    { "category": "APPLIANCE", "count": 12 }
  ],
  "priorityDistribution": [
    { "priority": "HIGH", "count": 5 },
    { "priority": "MEDIUM", "count": 10 }
  ]
}
```

**Caching**: 5-minute server-side cache

---

### GET /api/dashboard/activity-feed
Get recent activity logs

**Auth**: Required
**Query Parameters**:
- `limit` (number) - Default: 20, Max: 100
- `offset` (number) - Default: 0

**Response**:
```json
{
  "activities": [
    {
      "id": "clxxx",
      "activityType": "TASK_COMPLETED",
      "entityType": "task",
      "entityId": "clxxx",
      "entityName": "Replace HVAC Filter",
      "description": "Completed task: Replace HVAC Filter",
      "metadata": { "cost": 23.50 },
      "createdAt": "2024-10-15T14:30:00.000Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

**Caching**: 2-minute server-side cache

---

### GET /api/dashboard/cost-summary
Get cost tracking and budget data

**Auth**: Required
**Query Parameters**:
- `startDate` (ISO date) - Optional, defaults to current month start
- `endDate` (ISO date) - Optional, defaults to current month end

**Response**:
```json
{
  "period": {
    "startDate": "2024-10-01T00:00:00.000Z",
    "endDate": "2024-10-31T23:59:59.999Z"
  },
  "totalSpent": 450.75,
  "budgetProgress": {
    "budget": 500.00,
    "spent": 450.75,
    "remaining": 49.25,
    "percentageUsed": 90.15,
    "isOverBudget": false
  },
  "categoryBreakdown": [
    { "category": "HVAC", "total": 250.00 },
    { "category": "APPLIANCE", "total": 200.75 }
  ],
  "monthOverMonth": [
    { "month": "2024-08", "total": 320.50, "count": 8 },
    { "month": "2024-09", "total": 410.25, "count": 12 },
    { "month": "2024-10", "total": 450.75, "count": 15 }
  ]
}
```

**Caching**: 5-minute server-side cache

---

### GET /api/dashboard/maintenance-calendar
Get task distribution for calendar view

**Auth**: Required
**Query Parameters**:
- `month` (1-12) - Default: current month
- `year` (number) - Default: current year

**Response**:
```json
{
  "month": 10,
  "year": 2024,
  "startDate": "2024-10-01T00:00:00.000Z",
  "endDate": "2024-10-31T23:59:59.999Z",
  "calendar": [
    {
      "date": "2024-10-15",
      "dayOfMonth": 15,
      "totalTasks": 3,
      "statusCounts": {
        "pending": 1,
        "inProgress": 0,
        "completed": 2,
        "overdue": 0
      },
      "priorityCounts": {
        "high": 1,
        "medium": 2,
        "low": 0
      },
      "tasks": [
        {
          "id": "clxxx",
          "title": "Replace HVAC Filter",
          "status": "COMPLETED",
          "priority": "MEDIUM",
          "dueDate": "2024-10-15T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

**Caching**: 5-minute server-side cache

---

### GET /api/dashboard/layout
Get user's dashboard widget layout configuration

**Auth**: Required
**Response**:
```json
{
  "layout": {
    "widgets": [
      {
        "id": "analytics",
        "type": "chart",
        "position": { "x": 0, "y": 0, "w": 6, "h": 4 },
        "visible": true,
        "settings": { "period": "month" }
      }
    ]
  }
}
```

---

### PUT /api/dashboard/layout
Update user's dashboard widget layout

**Auth**: Required
**Body**:
```json
{
  "layout": {
    "widgets": [ ... ]
  }
}
```

**Response**: Updated layout object

---

### GET /api/dashboard/budget
Get user's budget settings

**Auth**: Required
**Response**:
```json
{
  "maintenanceBudget": 500.00,
  "budgetStartDate": "2024-01-01T00:00:00.000Z"
}
```

---

### PUT /api/dashboard/budget
Update user's budget settings

**Auth**: Required
**Body**:
```json
{
  "maintenanceBudget": 600.00,
  "budgetStartDate": "2024-01-01"
}
```

**Response**: Updated user object with budget settings

---

## Home Endpoints

### GET /api/homes
List all homes for the authenticated user

**Auth**: Required
**Response**:
```json
{
  "homes": [
    {
      "id": "clxxx",
      "userId": "clxxx",
      "name": "Main Residence",
      "address": "{\"street\": \"123 Main St\", \"city\": \"...\"}",
      "createdAt": "2024-10-01T12:00:00.000Z",
      "updatedAt": "2024-10-01T12:00:00.000Z"
    }
  ]
}
```

---

## Notification Endpoints

### GET /api/notifications/count
Get unread notification count

**Auth**: Required
**Response**:
```json
{
  "count": 3
}
```

**Note**: Notification system is not fully implemented (database schema exists)

---

## Cron Job Endpoints

### POST /api/cron/process-schedules
Process recurring schedules and generate tasks

**Auth**: Cron secret in Authorization header
**Trigger**: Should run daily via cron job
**Headers**:
```
Authorization: Bearer your-cron-secret
```

**Response**:
```json
{
  "processed": 15,
  "tasksCreated": 8,
  "schedules": [ ... ]
}
```

**Logic**:
- Finds schedules where nextDueDate <= today
- Creates task for each due schedule
- Updates schedule nextDueDate based on frequency

---

### POST /api/cron/mark-overdue
Mark pending tasks past their due date as OVERDUE

**Auth**: Cron secret
**Trigger**: Should run daily (midnight recommended)
**Response**:
```json
{
  "markedOverdue": 5,
  "tasks": [ ... ]
}
```

**Activity Log**: Creates TASK_OVERDUE activity for each

---

### POST /api/cron/cleanup-activities
Delete activity logs older than 90 days

**Auth**: Cron secret
**Trigger**: Weekly (Sunday 2 AM recommended)
**Response**:
```json
{
  "deleted": 127
}
```

**Logic**: Deletes activities where createdAt < 90 days ago

---

## Error Responses

All endpoints use standard error format:

**400 Bad Request**:
```json
{
  "error": "Validation failed",
  "details": { ... }
}
```

**401 Unauthorized**:
```json
{
  "error": "Unauthorized",
  "message": "Please sign in to access this resource"
}
```

**403 Forbidden**:
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

**404 Not Found**:
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting
Currently not implemented. Consider adding rate limiting for production deployment.

## API Versioning
Currently not versioned. All endpoints are at `/api/*`. Consider versioning for future breaking changes: `/api/v1/*`

## Pagination
Most list endpoints support pagination via `limit` and `offset` query parameters. Standard format:
```json
{
  "data": [ ... ],
  "total": 100,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

## Filtering & Search
Common query parameters:
- `search` - Full-text search
- `category` - Filter by category
- `status` - Filter by status
- `priority` - Filter by priority
- `startDate` / `endDate` - Date range filters
- `limit` / `offset` - Pagination

## Performance
- Server-side caching implemented for dashboard endpoints (2-5 min TTL)
- Database indexes on frequently queried fields
- Optimized queries with selective field projection
- Client-side caching via TanStack Query aligned with server cache

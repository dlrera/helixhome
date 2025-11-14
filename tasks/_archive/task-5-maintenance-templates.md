# Task 5: Maintenance Templates System

## Overview

Implement a comprehensive maintenance template system that provides pre-built, customizable maintenance schedules for home assets. This system will enable users to quickly apply professional maintenance recommendations to their assets without manual task creation.

## Core Objectives

1. **Template Management**: Create a library of 20 pre-built maintenance templates for common home maintenance tasks
2. **Template Application**: Enable one-click template application to assets with customizable frequencies
3. **Recurring Schedules**: Automatically generate recurring task schedules when templates are applied
4. **Smart Matching**: Suggest relevant templates based on asset categories
5. **User Customization**: Allow users to modify template frequencies and details before application

## Technical Requirements

### Database Schema

#### MaintenanceTemplate Model

```prisma
model MaintenanceTemplate {
  id                    String              @id @default(cuid())
  name                  String
  description           String
  category              AssetCategory
  defaultFrequency      Frequency
  estimatedDuration     Int                 // in minutes
  difficulty            Difficulty
  instructions          Json                // Detailed step-by-step instructions
  requiredTools         Json?               // List of tools needed
  safetyPrecautions     Json?               // Safety warnings
  isSystemTemplate      Boolean             @default(true)
  isActive              Boolean             @default(true)
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  schedules             RecurringSchedule[]
  tasks                 Task[]

  @@index([category])
  @@index([isSystemTemplate, isActive])
}

model RecurringSchedule {
  id                    String              @id @default(cuid())
  assetId               String
  templateId            String
  frequency             Frequency
  customFrequencyDays   Int?                // For custom frequencies
  nextDueDate           DateTime
  lastCompletedDate     DateTime?
  isActive              Boolean             @default(true)
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  asset                 Asset               @relation(fields: [assetId], references: [id], onDelete: Cascade)
  template              MaintenanceTemplate @relation(fields: [templateId], references: [id])

  @@unique([assetId, templateId])
  @@index([nextDueDate, isActive])
  @@index([assetId])
}
```

#### Enums

```prisma
enum Frequency {
  WEEKLY
  BIWEEKLY
  MONTHLY
  QUARTERLY
  SEMIANNUAL
  ANNUAL
  CUSTOM
}

enum Difficulty {
  EASY
  MODERATE
  HARD
  PROFESSIONAL
}
```

### API Endpoints

#### Template Management

- `GET /api/templates` - List all templates with filtering
  - Query params: `category`, `difficulty`, `search`
  - Returns paginated results with template details

- `GET /api/templates/[id]` - Get single template with full details
  - Returns template with instructions and requirements

- `GET /api/templates/suggestions` - Get template suggestions for an asset
  - Query params: `assetId`
  - Returns relevant templates based on asset category

#### Template Application

- `POST /api/templates/apply` - Apply template to asset
  - Body: `{ templateId, assetId, frequency?, customFrequencyDays? }`
  - Creates RecurringSchedule and first Task
  - Returns created schedule and task

- `GET /api/schedules` - List active schedules for user's assets
  - Returns schedules with template and asset details

- `PUT /api/schedules/[id]` - Update schedule frequency or status
  - Body: `{ frequency?, customFrequencyDays?, isActive? }`
  - Recalculates nextDueDate if frequency changes

- `DELETE /api/schedules/[id]` - Remove recurring schedule
  - Soft deletes by setting isActive to false

### Pre-built Templates (20 Templates)

#### HVAC Category

1. **Change HVAC Filter**
   - Frequency: Monthly/Quarterly (user selectable)
   - Duration: 10 minutes
   - Difficulty: Easy

2. **Service HVAC System**
   - Frequency: Annual
   - Duration: 60 minutes
   - Difficulty: Professional

3. **Clean AC Condenser Coils**
   - Frequency: Annual
   - Duration: 30 minutes
   - Difficulty: Moderate

#### Plumbing Category

4. **Flush Water Heater**
   - Frequency: Annual
   - Duration: 45 minutes
   - Difficulty: Moderate

5. **Check Washing Machine Hoses**
   - Frequency: Annual
   - Duration: 15 minutes
   - Difficulty: Easy

6. **Run Water in Unused Drains**
   - Frequency: Monthly
   - Duration: 5 minutes
   - Difficulty: Easy

7. **Test Sump Pump**
   - Frequency: Quarterly
   - Duration: 15 minutes
   - Difficulty: Easy

#### Appliances Category

8. **Clean Refrigerator Coils**
   - Frequency: Semiannual
   - Duration: 30 minutes
   - Difficulty: Moderate

9. **Clean Range Hood Filter**
   - Frequency: Monthly
   - Duration: 20 minutes
   - Difficulty: Easy

10. **Clean Garbage Disposal**
    - Frequency: Monthly
    - Duration: 10 minutes
    - Difficulty: Easy

11. **Clean Dryer Vent**
    - Frequency: Quarterly
    - Duration: 30 minutes
    - Difficulty: Moderate

#### Safety Category

12. **Test Smoke Detectors**
    - Frequency: Monthly
    - Duration: 15 minutes
    - Difficulty: Easy

13. **Test GFCI Outlets**
    - Frequency: Monthly
    - Duration: 10 minutes
    - Difficulty: Easy

14. **Inspect Fire Extinguisher**
    - Frequency: Annual
    - Duration: 5 minutes
    - Difficulty: Easy

#### Seasonal/Outdoor Category

15. **Clean Gutters**
    - Frequency: Semiannual
    - Duration: 120 minutes
    - Difficulty: Moderate

16. **Check Roof and Attic**
    - Frequency: Semiannual
    - Duration: 60 minutes
    - Difficulty: Moderate

17. **Winterize Outdoor Faucets**
    - Frequency: Annual
    - Duration: 30 minutes
    - Difficulty: Easy

18. **Clean Chimney**
    - Frequency: Annual
    - Duration: 120 minutes
    - Difficulty: Professional

19. **Seal Deck/Fence**
    - Frequency: Annual
    - Duration: 240 minutes
    - Difficulty: Moderate

20. **Clean Window Wells**
    - Frequency: Semiannual
    - Duration: 45 minutes
    - Difficulty: Easy

### UI Components

#### Template Browser (`/components/templates/template-browser.tsx`)

```typescript
interface TemplateBrowserProps {
  category?: AssetCategory
  assetId?: string
  onApply: (templateId: string) => void
}
```

- Grid/list view of templates
- Category filter tabs
- Search functionality
- Template cards showing:
  - Name and description
  - Frequency badge
  - Duration and difficulty indicators
  - "Apply" or "Applied" button state

#### Template Card (`/components/templates/template-card.tsx`)

```typescript
interface TemplateCardProps {
  template: MaintenanceTemplate
  isApplied?: boolean
  onApply: () => void
  onViewDetails: () => void
}
```

- Visual card with icon based on category
- Quick stats (frequency, duration, difficulty)
- Hover state with more details
- Applied state indicator

#### Template Application Modal (`/components/templates/apply-template-modal.tsx`)

```typescript
interface ApplyTemplateModalProps {
  template: MaintenanceTemplate
  asset: Asset
  onConfirm: (frequency: Frequency, customDays?: number) => void
  onCancel: () => void
}
```

- Shows template details
- Frequency selector with options
- Custom frequency input (if selected)
- Start date picker
- Confirmation button

#### Schedule Management (`/components/schedules/schedule-list.tsx`)

```typescript
interface ScheduleListProps {
  assetId?: string
  schedules: RecurringSchedule[]
  onUpdate: (scheduleId: string) => void
  onDelete: (scheduleId: string) => void
}
```

- List of active schedules
- Shows template name, frequency, next due date
- Edit/pause/delete actions
- Group by asset or due date

### Implementation Pages

#### Templates Page (`/app/(protected)/templates/page.tsx`)

- Full template library browser
- Category navigation
- Search and filter
- Grid/list view toggle
- Links to apply templates

#### Asset Detail Enhancement

- Add "Maintenance Templates" section to `/app/(protected)/assets/[id]/page.tsx`
- Show suggested templates for the asset
- Display active schedules
- Quick apply buttons

#### Dashboard Widget

- Add "Upcoming Maintenance" widget
- Show next 5 scheduled tasks from templates
- Link to full schedule view

### Business Logic

#### Template Application Flow

1. User selects template from browser or asset page
2. Modal opens with frequency customization
3. On confirmation:
   - Create RecurringSchedule record
   - Calculate first due date based on frequency
   - Create initial Task linked to template
   - Show success notification
   - Update UI to show "Applied" state

#### Schedule Processing

1. Daily cron job checks for due schedules
2. For each schedule with nextDueDate <= today:
   - Create new Task from template
   - Update nextDueDate based on frequency
   - Send notification if enabled
3. When task is completed:
   - Update lastCompletedDate on schedule
   - Optionally adjust nextDueDate if completed early/late

#### Smart Suggestions Algorithm

```typescript
function getSuggestedTemplates(asset: Asset): MaintenanceTemplate[] {
  // 1. Get templates matching asset category
  // 2. Filter out already applied templates
  // 3. Sort by relevance:
  //    - Exact category match (highest)
  //    - Related categories
  //    - Popularity/common templates
  // 4. Return top 5 suggestions
}
```

### State Management

#### Template Store (using TanStack Query)

```typescript
// Queries
useTemplates({ category, search }) // List templates
useTemplate(id) // Single template
useTemplateSuggestions(assetId) // Suggestions for asset

// Mutations
useApplyTemplate() // Apply to asset
useUpdateSchedule() // Update schedule
useDeleteSchedule() // Remove schedule
```

### Performance Optimizations

1. **Template Caching**: Cache template data in memory/Redis
2. **Batch Task Creation**: Create tasks in batches for efficiency
3. **Lazy Loading**: Load template instructions only when needed
4. **Optimistic Updates**: Update UI before server confirms
5. **Pagination**: Limit template lists to 20 per page

### Testing Requirements

#### Unit Tests

- Template filtering and search logic
- Frequency calculation functions
- Due date calculation
- Schedule generation logic

#### Integration Tests

- Template application flow
- Schedule creation and task generation
- API endpoint responses
- Database transactions

#### E2E Tests

- Browse templates by category
- Apply template to asset
- Customize frequency
- View and manage schedules
- Complete generated tasks

### Success Metrics

1. **Adoption Rate**: 80% of users apply at least one template
2. **Template Coverage**: Average 3+ templates per household
3. **Customization Rate**: 30% of users customize frequency
4. **Task Completion**: 70% completion rate for template tasks
5. **Time Saved**: <30 seconds to apply a template

### Security Considerations

1. **Template Validation**: Ensure system templates can't be modified by users
2. **Rate Limiting**: Limit template applications per user per day
3. **Access Control**: Users can only apply templates to their own assets
4. **Data Sanitization**: Sanitize template instructions for XSS prevention

### Migration Strategy

1. **Seed Templates**: Run migration to insert 20 templates
2. **Backfill**: For existing assets, suggest relevant templates
3. **Gradual Rollout**: Enable for subset of users first
4. **Feedback Loop**: Track which templates are most/least used

### Future Enhancements (Post-MVP)

1. **Custom Templates**: Users create their own templates
2. **Template Sharing**: Community template marketplace
3. **Seasonal Adjustments**: Adjust frequencies based on season
4. **Smart Scheduling**: AI-powered schedule optimization
5. **Template Bundles**: Apply multiple templates at once
6. **Professional Templates**: Partner with service providers
7. **Template Versioning**: Track template updates
8. **Completion Tracking**: Track completion rates per template

## Development Checklist

See accompanying `task-5-checklist.md` for detailed implementation steps and verification criteria.

## Dependencies

- Task 1: Database Schema (completed)
- Task 2: Asset Management API (completed)
- Task 3: Asset UI Pages (completed)
- Task 4: Global Navigation (completed)

## Estimated Time

- Database schema updates: 2 hours
- API endpoints: 4 hours
- UI components: 6 hours
- Template data and seeding: 2 hours
- Testing and refinement: 2 hours
- **Total: 16 hours**

## Notes

- Focus on making template application as frictionless as possible
- Ensure templates are mobile-friendly for on-the-go application
- Consider template relevance based on user's location/climate
- Make frequency customization intuitive with sensible defaults
- Provide clear value proposition for each template

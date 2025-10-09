# Task 7: Dashboard Enhancement & Analytics

## Overview

Transform the basic dashboard created in Task 6 into a comprehensive CMMS command center with advanced analytics, visual insights, and interactive widgets. This task focuses on enhancing user engagement through data visualization, personalized insights, and actionable recommendations.

## Core Objectives

1. **Advanced Analytics**: Add visual charts and graphs for maintenance trends and insights
2. **Activity Timeline**: Implement a chronological feed of recent maintenance activities
3. **Maintenance Calendar Widget**: Add a mini calendar showing task distribution over time
4. **Cost Tracking Dashboard**: Display maintenance cost summaries and budget tracking
5. **Dashboard Customization**: Allow users to customize widget layout and visibility

## Technical Requirements

### Database Schema Extensions

#### Add to existing User model

```prisma
model User {
  // ... existing fields
  dashboardLayout       Json?               // Customizable widget positions and visibility
  maintenanceBudget     Decimal?            // Monthly maintenance budget
  budgetStartDate       DateTime?           // When budget tracking began
}
```

#### Add to existing Task model

```prisma
model Task {
  // ... existing fields
  estimatedCost         Decimal?            // Expected cost for this task
  actualCost            Decimal?            // Actual cost after completion
  costNotes             String?             // Notes about costs
}
```

#### New Activity Log Model

```prisma
model ActivityLog {
  id                    String              @id @default(cuid())
  userId                String
  homeId                String
  activityType          ActivityType
  entityType            String              // "asset", "task", "template", etc.
  entityId              String
  entityName            String              // Denormalized for performance
  description           String
  metadata              Json?               // Additional context
  createdAt             DateTime            @default(now())

  user                  User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  home                  Home                @relation(fields: [homeId], references: [id], onDelete: Cascade)

  @@index([homeId, createdAt])
  @@index([userId, createdAt])
}

enum ActivityType {
  ASSET_CREATED
  ASSET_UPDATED
  ASSET_DELETED
  TASK_CREATED
  TASK_COMPLETED
  TASK_OVERDUE
  TEMPLATE_APPLIED
  SCHEDULE_CREATED
  SCHEDULE_UPDATED
}
```

### API Endpoints

#### Dashboard Analytics

- `GET /api/dashboard/analytics` - Get comprehensive dashboard analytics
  - Returns: task completion trends, category breakdown, priority distribution
  - Query params: `period` (week, month, quarter, year)
  - Data format suitable for charts

- `GET /api/dashboard/activity-feed` - Get recent activity timeline
  - Query params: `limit` (default 20), `offset`
  - Returns chronological activity log with related entities

- `GET /api/dashboard/cost-summary` - Get maintenance cost analytics
  - Query params: `startDate`, `endDate`
  - Returns: total spent, budget progress, category breakdown, trending

- `GET /api/dashboard/maintenance-calendar` - Get task distribution for calendar widget
  - Query params: `month`, `year`
  - Returns: tasks grouped by date with counts

#### Dashboard Customization

- `GET /api/dashboard/layout` - Get user's dashboard layout preferences
  - Returns: widget visibility, positions, sizes

- `PUT /api/dashboard/layout` - Update dashboard layout
  - Body: `{ layout: { widgets: [...], columns: number } }`
  - Validates and saves layout configuration

- `PUT /api/dashboard/budget` - Update maintenance budget settings
  - Body: `{ monthlyBudget: number, startDate: Date }`
  - Returns updated user preferences

### UI Components

#### Analytics Chart Widget (`/components/dashboard/analytics-chart.tsx`)

```typescript
interface AnalyticsChartProps {
  period: 'week' | 'month' | 'quarter' | 'year'
  chartType: 'completion-trend' | 'category-breakdown' | 'priority-distribution'
  data: ChartData
}
```

- Renders interactive charts using Recharts library
- Supports line charts, bar charts, pie charts
- Responsive and mobile-optimized
- Handles loading and empty states
- Click interactions for drill-down

#### Activity Timeline Widget (`/components/dashboard/activity-timeline.tsx`)

```typescript
interface ActivityTimelineProps {
  activities: ActivityLog[]
  limit?: number
  showLoadMore?: boolean
}
```

- Chronological feed of recent activities
- Icons and colors for different activity types
- Relative timestamps (e.g., "2 hours ago")
- Links to related entities
- Infinite scroll or load more button
- Real-time updates via polling or websockets

#### Maintenance Calendar Widget (`/components/dashboard/maintenance-calendar-widget.tsx`)

```typescript
interface MaintenanceCalendarWidgetProps {
  tasks: Task[]
  month?: Date
  onDateClick?: (date: Date, tasks: Task[]) => void
}
```

- Mini calendar showing current month
- Task count indicators on dates
- Color coding for overdue/upcoming
- Click to see tasks for specific date
- Month navigation
- Highlights today

#### Cost Summary Widget (`/components/dashboard/cost-summary.tsx`)

```typescript
interface CostSummaryProps {
  totalSpent: number
  budget: number | null
  categoryBreakdown: { category: string; amount: number }[]
  period: 'month' | 'quarter' | 'year'
}
```

- Displays total maintenance costs
- Budget progress bar (if budget set)
- Cost breakdown by asset category
- Month-over-month comparison
- Visual indicators for budget status
- Link to detailed cost report

#### Maintenance Insights Widget (`/components/dashboard/maintenance-insights.tsx`)

```typescript
interface MaintenanceInsightsProps {
  insights: {
    mostMaintainedAsset: Asset
    longestOverdueTask: Task
    upcomingHighPriority: Task[]
    completionStreak: number
    recommendations: string[]
  }
}
```

- Smart insights based on user's maintenance data
- Actionable recommendations
- Highlights and achievements
- Warnings about neglected assets
- Personalized tips

#### Widget Container (`/components/dashboard/widget-container.tsx`)

```typescript
interface WidgetContainerProps {
  title: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  loading?: boolean
  error?: string
  children: React.ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
}
```

- Reusable container for all dashboard widgets
- Consistent header styling
- Loading skeleton support
- Error state display
- Optional collapse/expand
- Action menu for widget settings

### Implementation Pages

#### Enhanced Dashboard Page (`/app/(protected)/dashboard/page.tsx`)

**Current State (from Task 6):**

- Statistics cards (assets, pending tasks, overdue, completed this month)
- Upcoming maintenance widget
- Quick actions widget
- Recent assets widget

**Enhancements for Task 7:**

1. Add analytics charts section
   - Task completion trend (line chart)
   - Maintenance by category (pie chart)
   - Priority distribution (bar chart)

2. Add activity timeline widget
   - Recent maintenance activities
   - Asset additions/updates
   - Template applications

3. Add maintenance calendar widget
   - Mini calendar with task indicators
   - Current month view
   - Click to filter tasks by date

4. Add cost tracking widget (if user has budget set)
   - Total spent this month
   - Budget progress
   - Category cost breakdown

5. Add maintenance insights widget
   - Smart recommendations
   - Achievements and streaks
   - Warnings and alerts

6. Improve layout with responsive grid
   - 1 column on mobile
   - 2 columns on tablet
   - 3-4 columns on desktop
   - Customizable widget order (future)

7. Add loading skeletons for each widget
   - Smooth loading experience
   - Progressive enhancement

8. Add empty states with CTAs
   - Guide new users
   - Encourage engagement

#### New: Dashboard Settings Page (`/app/(protected)/dashboard/settings/page.tsx`)

- Widget visibility toggles
- Layout customization (drag and drop - future)
- Budget configuration
- Notification preferences for dashboard alerts
- Data export options

#### New: Cost Report Page (`/app/(protected)/dashboard/costs/page.tsx`)

- Detailed cost analytics
- Cost trends over time
- Category and asset breakdowns
- Budget vs actual comparison
- Export cost data as CSV

### Business Logic

#### Activity Logging

**Automatic Activity Creation:**

```typescript
async function logActivity({
  userId: string
  homeId: string
  activityType: ActivityType
  entityType: string
  entityId: string
  entityName: string
  description: string
  metadata?: any
}) {
  await prisma.activityLog.create({
    data: {
      userId,
      homeId,
      activityType,
      entityType,
      entityId,
      entityName,
      description,
      metadata
    }
  });
}
```

**Trigger Points:**

- After asset creation: `ASSET_CREATED`
- After asset update: `ASSET_UPDATED`
- After task creation: `TASK_CREATED`
- After task completion: `TASK_COMPLETED`
- When task becomes overdue: `TASK_OVERDUE`
- After template application: `TEMPLATE_APPLIED`

#### Analytics Calculations

**Task Completion Trend:**

```typescript
function calculateCompletionTrend(tasks: Task[], period: string) {
  // Group tasks by completion date
  // Calculate daily/weekly/monthly completion counts
  // Return data points for chart
}
```

**Category Breakdown:**

```typescript
function calculateCategoryBreakdown(tasks: Task[], assets: Asset[]) {
  // Group tasks by asset category
  // Calculate counts and percentages
  // Return data for pie chart
}
```

**Budget Tracking:**

```typescript
function calculateBudgetStatus(tasks: Task[], budget: number, startDate: Date) {
  // Sum actualCost from completed tasks in current month
  // Calculate percentage of budget used
  // Determine status (on track, over budget, under budget)
  // Project end-of-month spending based on trend
}
```

#### Smart Insights Generation

```typescript
function generateMaintenanceInsights(
  assets: Asset[],
  tasks: Task[],
  schedules: RecurringSchedule[]
) {
  const insights = {
    mostMaintainedAsset: findMostMaintainedAsset(assets, tasks),
    longestOverdueTask: findLongestOverdueTask(tasks),
    upcomingHighPriority: getUpcomingHighPriorityTasks(tasks, 3),
    completionStreak: calculateCompletionStreak(tasks),
    recommendations: generateRecommendations(assets, tasks, schedules),
  }

  return insights
}
```

### State Management

#### TanStack Query Hooks

Create `/lib/hooks/use-dashboard.ts`:

```typescript
// Queries
useDashboardAnalytics(period) // Analytics data for charts
useActivityFeed(limit) // Recent activities
useCostSummary(dateRange) // Cost analytics
useMaintenanceCalendar(month, year) // Calendar data
useDashboardLayout() // User layout preferences
useMaintenanceInsights() // Smart insights

// Mutations
useUpdateDashboardLayout() // Save layout changes
useUpdateBudget() // Update budget settings
```

Features:

- Automatic refetch on window focus
- Stale time configuration
- Cache invalidation strategies
- Optimistic updates where applicable

### Performance Optimizations

1. **Data Aggregation**: Compute analytics server-side to reduce payload
2. **Caching**: Cache dashboard data with 5-minute stale time
3. **Lazy Loading**: Load widgets as they enter viewport
4. **Pagination**: Limit activity feed to 20 items initially
5. **Query Optimization**: Use Prisma aggregations instead of in-memory calculations
6. **Memoization**: Cache expensive calculations on client
7. **Image Optimization**: Compress and lazy load asset photos

### Testing Requirements

#### Unit Tests

- Analytics calculation functions
- Insight generation logic
- Budget tracking calculations
- Activity log creation
- Date grouping utilities

#### Integration Tests

- Dashboard analytics API endpoint
- Activity feed API with pagination
- Cost summary calculations
- Budget settings update
- Layout preferences save/load

#### E2E Tests

- View dashboard with all widgets
- Interact with analytics charts
- Click through activity timeline
- Set monthly budget
- Navigate maintenance calendar widget
- View cost breakdown
- Toggle widget visibility
- Load more activities

### Success Metrics

1. **Engagement**: Users visit dashboard 3+ times per week
2. **Insights Usage**: 60%+ users click on recommendations
3. **Budget Adoption**: 30%+ users set maintenance budget
4. **Activity Timeline**: 40%+ users click through to entities from timeline
5. **Chart Interaction**: 50%+ users interact with analytics charts
6. **Performance**: Dashboard loads in <2 seconds on 3G
7. **Mobile Usage**: Dashboard fully functional on mobile (100%)

### Security Considerations

1. **Authorization**: Verify user owns home for all dashboard data
2. **Data Aggregation**: Ensure no data leakage across homes/users
3. **Input Validation**: Validate all user preferences (budget, layout)
4. **Rate Limiting**: Limit analytics API calls to prevent abuse
5. **Cost Data Privacy**: Ensure cost information is properly isolated
6. **Activity Log Cleanup**: Automatically delete logs older than 90 days

### Edge Cases to Handle

1. **No Data States**: Graceful empty states for new users
2. **Large Data Sets**: Handle accounts with 1000+ tasks efficiently
3. **Budget Not Set**: Show budget widget as optional/setup required
4. **Zero Cost Tasks**: Handle tasks with no cost data
5. **Activity Log Cleanup**: Prevent infinite growth of logs
6. **Invalid Layout Data**: Fallback to default layout if saved layout is corrupted
7. **Timezone Handling**: Display dates in user's local timezone

### Migration Strategy

1. **Existing Users**: Initialize activity logs with historical data (optional)
2. **Database Migration**: Add new fields with default values
3. **Default Dashboard**: All users get new widgets, can customize later
4. **Budget Feature**: Opt-in feature with onboarding flow
5. **Data Backfill**: Backfill activity logs from recent tasks (last 30 days)

### Future Enhancements (Post-MVP)

1. **Custom Widgets**: Users create custom dashboard widgets
2. **Widget Marketplace**: Share and download community widgets
3. **Real-time Updates**: WebSocket integration for live dashboard
4. **Predictive Analytics**: ML-based maintenance predictions
5. **Comparison Mode**: Compare current period to previous periods
6. **Goal Setting**: Set and track maintenance goals
7. **Weather Integration**: Show weather-related maintenance alerts
8. **Export Dashboard**: PDF export of dashboard report
9. **Mobile App Dashboard**: Native mobile dashboard experience
10. **Voice Reports**: "Hey Helix, how's my maintenance this month?"
11. **Third-party Integrations**: Connect to smart home devices
12. **Contractor Performance**: Track and rate service providers
13. **Asset Health Score**: Overall health rating for each asset
14. **Social Features**: Share achievements with friends
15. **Dashboard Templates**: Pre-made layouts for different user types

## Development Checklist

See accompanying `task-7-checklist.md` for detailed implementation steps and verification criteria.

## Dependencies

- Task 1: Database Schema (completed)
- Task 2: Asset Management API (completed)
- Task 3: Asset UI Pages (completed)
- Task 4: Global Navigation (completed)
- Task 5: Maintenance Templates (completed)
- Task 6: Task Management System (completed)

## Estimated Time

- Database schema updates: 1 hour
- Activity logging system: 3 hours
- Analytics API endpoints: 4 hours
- Analytics chart components: 6 hours
- Activity timeline widget: 3 hours
- Maintenance calendar widget: 3 hours
- Cost tracking widget: 4 hours
- Insights widget: 3 hours
- Dashboard layout improvements: 3 hours
- Dashboard settings page: 2 hours
- Cost report page: 3 hours
- Testing and refinement: 4 hours
- **Total: 39 hours**

## Notes

- Focus on visual appeal - charts and graphs increase engagement
- Make widgets modular and reusable for future pages
- Consider accessibility for charts (alt text, data tables)
- Activity timeline should feel like a social media feed
- Budget feature is optional but valuable for user retention
- Use Recharts library for consistent, accessible charts
- Loading skeletons should match final widget dimensions
- Empty states should be encouraging, not discouraging
- Mobile dashboard experience is critical
- Consider implementing progressive web app features
- Dashboard should be the "home base" users return to daily
- Performance is crucial - lazy load widgets as needed
- Activity logs need cleanup strategy to prevent bloat

---

_Task prepared for: HelixIntel CMMS MVP Implementation_
_Estimated completion: 39 development hours_
_Last updated: January 2025_

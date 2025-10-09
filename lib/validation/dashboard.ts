import { z } from 'zod';

/**
 * Analytics API query parameters
 */
export const analyticsParamsSchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
});

export type AnalyticsParams = z.infer<typeof analyticsParamsSchema>;

/**
 * Activity Feed API query parameters
 */
export const activityFeedParamsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type ActivityFeedParams = z.infer<typeof activityFeedParamsSchema>;

/**
 * Cost Summary API query parameters
 */
export const costSummaryParamsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type CostSummaryParams = z.infer<typeof costSummaryParamsSchema>;

/**
 * Maintenance Calendar API query parameters
 */
export const calendarParamsSchema = z.object({
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2000).max(2100).optional(),
});

export type CalendarParams = z.infer<typeof calendarParamsSchema>;

/**
 * Dashboard layout schema
 */
export const widgetPositionSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  w: z.number().min(1).max(12), // 12-column grid
  h: z.number().min(1),
});

export const widgetSchema = z.object({
  id: z.string(),
  type: z.enum([
    'analytics-chart',
    'activity-timeline',
    'maintenance-calendar',
    'cost-summary',
    'maintenance-insights',
    'upcoming-tasks',
    'quick-stats',
  ]),
  position: widgetPositionSchema,
  visible: z.boolean(),
  settings: z.record(z.string(), z.any()).optional(),
});

export const layoutSchema = z.object({
  widgets: z.array(widgetSchema),
});

export type WidgetPosition = z.infer<typeof widgetPositionSchema>;
export type Widget = z.infer<typeof widgetSchema>;
export type DashboardLayout = z.infer<typeof layoutSchema>;

/**
 * Budget settings schema
 */
export const budgetSchema = z.object({
  maintenanceBudget: z.number().positive('Budget must be a positive number'),
  budgetStartDate: z.string().datetime().optional(),
});

export type BudgetSettings = z.infer<typeof budgetSchema>;

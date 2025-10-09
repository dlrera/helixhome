'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Dashboard API response types
 */
type AnalyticsData = {
  period: string;
  startDate: string;
  endDate: string;
  completionTrend: Array<{ date: string; count: number }>;
  categoryBreakdown: Array<{ category: string; count: number }>;
  priorityDistribution: Array<{ priority: string; count: number }>;
};

type ActivityFeedData = {
  activities: Array<{
    id: string;
    activityType: string;
    entityType: string;
    entityId: string;
    entityName: string;
    description: string;
    metadata: any;
    createdAt: string;
  }>;
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

type CostSummaryData = {
  period: { startDate: string; endDate: string };
  totalSpent: number;
  budgetProgress: {
    budget: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
    isOverBudget: boolean;
  } | null;
  categoryBreakdown: Array<{ category: string; total: number }>;
  monthOverMonth: Array<{ month: string; total: number; count: number }>;
};

type MaintenanceCalendarData = {
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  calendar: Array<{
    date: string;
    dayOfMonth: number;
    totalTasks: number;
    statusCounts: {
      pending: number;
      inProgress: number;
      completed: number;
      overdue: number;
    };
    priorityCounts: {
      high: number;
      medium: number;
      low: number;
    };
    tasks: any[];
  }>;
};

type DashboardLayoutData = {
  layout: {
    widgets: Array<{
      id: string;
      type: string;
      position: { x: number; y: number; w: number; h: number };
      visible: boolean;
      settings?: Record<string, any>;
    }>;
  };
};

type BudgetSettingsData = {
  maintenanceBudget: number | null;
  budgetStartDate: string | null;
};

/**
 * Hook: useDashboardAnalytics
 * Fetch analytics data for dashboard charts
 */
export function useDashboardAnalytics(period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
  return useQuery<AnalyticsData>({
    queryKey: ['dashboard', 'analytics', period],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/analytics?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      return data;
    },
  });
}

/**
 * Hook: useActivityFeed
 * Fetch recent activity logs with pagination
 */
export function useActivityFeed(limit = 20, offset = 0) {
  return useQuery<ActivityFeedData>({
    queryKey: ['dashboard', 'activity-feed', limit, offset],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/activity-feed?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity feed');
      }
      const data = await response.json();
      return data;
    },
  });
}

/**
 * Hook: useCostSummary
 * Fetch cost summary and budget tracking data
 */
export function useCostSummary(startDate?: string, endDate?: string) {
  return useQuery<CostSummaryData>({
    queryKey: ['dashboard', 'cost-summary', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/dashboard/cost-summary?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cost summary');
      }
      const data = await response.json();
      return data;
    },
  });
}

/**
 * Hook: useMaintenanceCalendar
 * Fetch maintenance calendar data for a specific month
 */
export function useMaintenanceCalendar(month?: number, year?: number) {
  return useQuery<MaintenanceCalendarData>({
    queryKey: ['dashboard', 'maintenance-calendar', month, year],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());

      const response = await fetch(`/api/dashboard/maintenance-calendar?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }
      const data = await response.json();
      return data;
    },
  });
}

/**
 * Hook: useDashboardLayout
 * Fetch user's dashboard layout configuration
 */
export function useDashboardLayout() {
  return useQuery<DashboardLayoutData>({
    queryKey: ['dashboard', 'layout'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/layout');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard layout');
      }
      const data = await response.json();
      return data;
    },
  });
}

/**
 * Hook: useBudgetSettings
 * Fetch user's budget settings
 */
export function useBudgetSettings() {
  return useQuery<BudgetSettingsData>({
    queryKey: ['dashboard', 'budget'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/budget');
      if (!response.ok) {
        throw new Error('Failed to fetch budget settings');
      }
      const data = await response.json();
      return data;
    },
  });
}

/**
 * Hook: useUpdateDashboardLayout (Mutation)
 * Update user's dashboard layout configuration
 */
export function useUpdateDashboardLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (layout: DashboardLayoutData['layout']) => {
      const response = await fetch('/api/dashboard/layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update dashboard layout');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'layout'] });
      toast.success('Dashboard layout updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update dashboard layout');
    },
  });
}

/**
 * Hook: useUpdateBudget (Mutation)
 * Update user's maintenance budget settings
 */
export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgetData: { maintenanceBudget: number; budgetStartDate?: string }) => {
      const response = await fetch('/api/dashboard/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update budget');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'budget'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'cost-summary'] });
      toast.success('Budget settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update budget settings');
    },
  });
}

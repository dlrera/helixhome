'use client'

import React, { useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { WidgetContainer } from './widget-container'
import { useDashboardAnalytics } from '@/lib/hooks/use-dashboard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

// PERFORMANCE OPTIMIZATION: Dynamically import Recharts to reduce initial bundle size
// This reduces the dashboard page from 2,728 modules to ~500 modules
const CompletionTrendChart = dynamic(
  () =>
    import('./analytics-charts-lazy').then((mod) => ({
      default: mod.CompletionTrendChart,
    })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

const CategoryBreakdownChart = dynamic(
  () =>
    import('./analytics-charts-lazy').then((mod) => ({
      default: mod.CategoryBreakdownChart,
    })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

const PriorityDistributionChart = dynamic(
  () =>
    import('./analytics-charts-lazy').then((mod) => ({
      default: mod.PriorityDistributionChart,
    })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)

// Chart loading skeleton
function ChartSkeleton() {
  return (
    <div className="h-[300px] flex flex-col gap-2 p-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-full w-full" />
    </div>
  )
}

type Period = 'week' | 'month' | 'quarter' | 'year'

/**
 * AnalyticsChart - Multi-view analytics widget with completion trends, category, and priority charts
 * Performance optimized with React.memo and useCallback
 */
export const AnalyticsChart = React.memo(function AnalyticsChart() {
  const [period, setPeriod] = useState<Period>('month')
  const { data, isLoading, error } = useDashboardAnalytics(period)

  // Memoize period change handler
  const handlePeriodChange = useCallback((value: string) => {
    setPeriod(value as Period)
  }, [])

  const periodSelector = useMemo(
    () => (
      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[140px]" aria-label="Select time period">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="quarter">This Quarter</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
        </SelectContent>
      </Select>
    ),
    [period, handlePeriodChange]
  )

  return (
    <WidgetContainer
      title="Maintenance Analytics"
      description="Track completion trends and task distribution"
      headerAction={periodSelector}
      isLoading={isLoading}
      error={error?.message}
    >
      {data && (
        <Tabs defaultValue="completion" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="completion">Completion Trend</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="priority">By Priority</TabsTrigger>
          </TabsList>

          <TabsContent value="completion" className="mt-0">
            <div className="h-[300px]">
              <CompletionTrendChart data={data.completionTrend} />
            </div>
          </TabsContent>

          <TabsContent value="category" className="mt-0">
            <div className="h-[300px]">
              <CategoryBreakdownChart data={data.categoryBreakdown} />
            </div>
          </TabsContent>

          <TabsContent value="priority" className="mt-0">
            <div className="h-[300px]">
              <PriorityDistributionChart data={data.priorityDistribution} />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </WidgetContainer>
  )
})

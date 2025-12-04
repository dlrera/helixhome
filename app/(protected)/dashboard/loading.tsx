import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AnalyticsChartSkeleton,
  CostSummarySkeleton,
  CalendarWidgetSkeleton,
  ActivityTimelineSkeleton,
  MaintenanceInsightsSkeleton,
} from '@/components/dashboard/dashboard-skeletons'

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Skeleton className="h-11 w-32" />
        <Skeleton className="h-11 w-32" />
      </div>

      {/* Dashboard Widgets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChartSkeleton />
        <CostSummarySkeleton />
        <CalendarWidgetSkeleton />
        <ActivityTimelineSkeleton />
      </div>

      {/* Maintenance Insights */}
      <MaintenanceInsightsSkeleton />
    </div>
  )
}

import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import {
  Home as HomeIcon,
  Wrench,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { AnalyticsChart } from '@/components/dashboard/analytics-chart'
import { ActivityTimeline } from '@/components/dashboard/activity-timeline'
import { MaintenanceCalendarWidget } from '@/components/dashboard/maintenance-calendar-widget'
import { CostSummary } from '@/components/dashboard/cost-summary'
import { MaintenanceInsights } from '@/components/dashboard/maintenance-insights'
import {
  AnalyticsChartSkeleton,
  CostSummarySkeleton,
  CalendarWidgetSkeleton,
  ActivityTimelineSkeleton,
  MaintenanceInsightsSkeleton,
} from '@/components/dashboard/dashboard-skeletons'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Fetch user's home (or create one if it doesn't exist)
  let home = await prisma.home.findFirst({
    where: { userId: session.user.id },
  })

  if (!home) {
    home = await prisma.home.create({
      data: {
        name: 'My Home',
        userId: session.user.id,
      },
    })
  }

  // Calculate start of current month
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )

  // Fetch statistics with error handling
  const [assetCount, taskCount, overdueCount, completedThisMonth] =
    await Promise.all([
      prisma.asset
        .count({
          where: { homeId: home.id },
        })
        .catch((error) => {
          console.error('Error fetching asset count:', error)
          return 0
        }),
      prisma.task.count({
        where: {
          homeId: home.id,
          status: 'PENDING',
        },
      }),
      prisma.task.count({
        where: {
          homeId: home.id,
          status: 'OVERDUE',
        },
      }),
      prisma.task.count({
        where: {
          homeId: home.id,
          status: 'COMPLETED',
          completedAt: {
            gte: startOfMonth,
          },
        },
      }),
    ])

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black">
          Welcome back, {session.user?.name || 'there'}! 🔄 DEPLOYMENT TEST
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Here&apos;s an overview of your home maintenance status.
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <HomeIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetCount}</div>
            <Link
              href="/assets"
              className="text-xs text-primary hover:underline"
            >
              View all assets →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Wrench className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCount}</div>
            <Link
              href="/tasks"
              className="text-xs text-primary hover:underline"
            >
              View all tasks →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {overdueCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {overdueCount === 0 ? 'All caught up!' : 'Need attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed This Month
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">
              {completedThisMonth === 0
                ? 'No tasks completed yet'
                : 'Great progress!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Dashboard Widgets - Progressive Loading */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Analytics Chart - Loads first */}
        <Suspense fallback={<AnalyticsChartSkeleton />}>
          <AnalyticsChart />
        </Suspense>

        {/* Cost Summary - Loads second */}
        <Suspense fallback={<CostSummarySkeleton />}>
          <CostSummary />
        </Suspense>

        {/* Maintenance Calendar - Loads third */}
        <Suspense fallback={<CalendarWidgetSkeleton />}>
          <MaintenanceCalendarWidget />
        </Suspense>

        {/* Activity Timeline - Loads fourth */}
        <Suspense fallback={<ActivityTimelineSkeleton />}>
          <ActivityTimeline />
        </Suspense>
      </div>

      {/* Maintenance Insights - Full Width - Loads last */}
      <Suspense fallback={<MaintenanceInsightsSkeleton />}>
        <MaintenanceInsights />
      </Suspense>
    </div>
  )
}

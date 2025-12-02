'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { WidgetContainer } from './widget-container'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Info, Clock, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useMaintenanceInsights,
  type MaintenanceInsight,
} from '@/lib/hooks/use-dashboard'

type InsightType = MaintenanceInsight['type']

/**
 * Get icon for insight type
 */
function getInsightIcon(type: InsightType) {
  switch (type) {
    case 'success':
      return CheckCircle2
    case 'alert':
      return AlertCircle
    case 'warning':
      return Clock
    case 'info':
    default:
      return Lightbulb
  }
}

/**
 * Get color classes for insight type
 */
function getInsightColors(type: InsightType) {
  switch (type) {
    case 'success':
      return {
        border: 'border-green-500/50',
        bg: 'bg-green-50',
        text: 'text-green-900',
        icon: 'text-green-600',
      }
    case 'alert':
      return {
        border: 'border-red-500/50',
        bg: 'bg-red-50',
        text: 'text-red-900',
        icon: 'text-red-600',
      }
    case 'warning':
      return {
        border: 'border-yellow-500/50',
        bg: 'bg-yellow-50',
        text: 'text-yellow-900',
        icon: 'text-yellow-600',
      }
    case 'info':
    default:
      return {
        border: 'border-blue-500/50',
        bg: 'bg-blue-50',
        text: 'text-blue-900',
        icon: 'text-blue-600',
      }
  }
}

/**
 * MaintenanceInsights - Display AI-generated insights and recommendations
 * Performance optimized with React.memo
 */
export const MaintenanceInsights = React.memo(function MaintenanceInsights() {
  const router = useRouter()
  const { data, isLoading, error } = useMaintenanceInsights()

  /**
   * Handle insight click - navigate to relevant entity
   */
  const handleInsightClick = (insight: MaintenanceInsight) => {
    if (!insight.actionable) return

    // Navigate based on metadata
    if (insight.metadata?.taskId) {
      // Navigate to task detail page
      router.push(`/tasks/${insight.metadata.taskId}`)
    } else if (insight.metadata?.assetId) {
      // Navigate to asset detail page
      router.push(`/assets/${insight.metadata.assetId}`)
    } else if (insight.metadata?.filterType === 'high-priority') {
      // Navigate to tasks page with filter
      router.push('/tasks?priority=HIGH')
    } else if (insight.metadata?.filterType === 'overdue') {
      // Navigate to tasks page with overdue filter
      router.push('/tasks?status=OVERDUE')
    }
  }

  return (
    <WidgetContainer
      title="Maintenance Insights"
      description="Personalized recommendations and analytics"
      isLoading={isLoading}
      error={error?.message ?? null}
      className="col-span-full"
    >
      {data && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.map((insight, index) => {
            const Icon = getInsightIcon(insight.type)
            const colors = getInsightColors(insight.type)

            return (
              <div
                key={index}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all',
                  colors.border,
                  colors.bg,
                  insight.actionable && 'cursor-pointer hover:shadow-md'
                )}
                onClick={() => handleInsightClick(insight)}
                role={insight.actionable ? 'button' : undefined}
                tabIndex={insight.actionable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (
                    insight.actionable &&
                    (e.key === 'Enter' || e.key === ' ')
                  ) {
                    e.preventDefault()
                    handleInsightClick(insight)
                  }
                }}
                aria-label={
                  insight.actionable
                    ? `${insight.title}. Click to take action`
                    : insight.title
                }
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Icon className={cn('h-5 w-5', colors.icon)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={cn('text-sm font-semibold mb-1', colors.text)}
                    >
                      {insight.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                    {insight.actionable && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Take Action
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {(!data || data.length === 0) && !isLoading && !error && (
        <div className="text-center py-8">
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            No insights available yet. Complete more tasks to see personalized
            recommendations.
          </p>
        </div>
      )}
    </WidgetContainer>
  )
})

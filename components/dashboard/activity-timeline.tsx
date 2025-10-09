'use client';

import React, { useState, useCallback } from 'react';
import { WidgetContainer } from './widget-container';
import { useActivityFeed } from '@/lib/hooks/use-dashboard';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Get icon/badge color based on activity type
 * Memoized color mapping for performance
 */
const getActivityTypeColor = (activityType: string): string => {
  const colorMap: Record<string, string> = {
    ASSET_CREATED: 'bg-green-500',
    ASSET_UPDATED: 'bg-blue-500',
    ASSET_DELETED: 'bg-red-500',
    TASK_CREATED: 'bg-yellow-500',
    TASK_COMPLETED: 'bg-green-500',
    TASK_OVERDUE: 'bg-red-500',
    TEMPLATE_APPLIED: 'bg-purple-500',
    SCHEDULE_CREATED: 'bg-indigo-500',
    SCHEDULE_UPDATED: 'bg-blue-500',
  };
  return colorMap[activityType] || 'bg-gray-500';
}

/**
 * Get readable label for activity type
 * Memoized label mapping for performance
 */
const getActivityTypeLabel = (activityType: string): string => {
  const labelMap: Record<string, string> = {
    ASSET_CREATED: 'Asset Created',
    ASSET_UPDATED: 'Asset Updated',
    ASSET_DELETED: 'Asset Deleted',
    TASK_CREATED: 'Task Created',
    TASK_COMPLETED: 'Task Completed',
    TASK_OVERDUE: 'Task Overdue',
    TEMPLATE_APPLIED: 'Template Applied',
    SCHEDULE_CREATED: 'Schedule Created',
    SCHEDULE_UPDATED: 'Schedule Updated',
  };
  return labelMap[activityType] || activityType;
}

/**
 * ActivityTimeline - Display recent activity logs in a timeline format
 * Performance optimized with React.memo and useCallback
 */
export const ActivityTimeline = React.memo(function ActivityTimeline() {
  const [limit, setLimit] = useState(20);
  const { data, isLoading, error } = useActivityFeed(limit, 0);

  // Memoize load more handler
  const loadMore = useCallback(() => {
    setLimit((prev) => prev + 20);
  }, []);

  return (
    <WidgetContainer
      title="Recent Activity"
      description="Your latest home maintenance activities"
      isLoading={isLoading}
      error={error?.message}
    >
      {data && (
        <div className="space-y-4">
          <ScrollArea className="h-[400px] pr-4">
            {data.activities.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-3">
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-2 h-2 rounded-full ${getActivityTypeColor(activity.activityType)}`}
                      />
                      {index < data.activities.length - 1 && (
                        <div className="w-px h-full bg-border mt-1" />
                      )}
                    </div>

                    {/* Activity content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {getActivityTypeLabel(activity.activityType)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{activity.description}</p>
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              <span className="font-medium">{activity.entityName}</span>
                              {activity.metadata.category && (
                                <span className="ml-2">• {activity.metadata.category}</span>
                              )}
                              {activity.metadata.priority && (
                                <span className="ml-2">• Priority: {activity.metadata.priority}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {data.hasMore && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
                className="w-full"
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </WidgetContainer>
  );
});

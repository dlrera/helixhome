'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { WidgetContainer } from './widget-container';
import { useMaintenanceCalendar } from '@/lib/hooks/use-dashboard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/**
 * MaintenanceCalendarWidget - Monthly calendar view of maintenance tasks
 * Performance optimized with React.memo and useCallback
 */
export const MaintenanceCalendarWidget = React.memo(function MaintenanceCalendarWidget() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const { data, isLoading, error } = useMaintenanceCalendar(currentMonth, currentYear);

  const goToPreviousMonth = useCallback(() => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }, [currentMonth, currentYear]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }, [currentMonth, currentYear]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today.getMonth() + 1);
    setCurrentYear(today.getFullYear());
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const headerAction = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={goToToday} aria-label="Go to today" className="min-h-[44px]">
        Today
      </Button>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          aria-label="Previous month"
          className="min-w-[44px] min-h-[44px]"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[140px] text-center" aria-live="polite">
          {monthNames[currentMonth - 1]} {currentYear}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          aria-label="Next month"
          className="min-w-[44px] min-h-[44px]"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <WidgetContainer
      title="Maintenance Calendar"
      description="Monthly view of scheduled maintenance"
      headerAction={headerAction}
      isLoading={isLoading}
      error={error?.message}
    >
      {data && (
        <div className="space-y-2" role="region" aria-label="Maintenance calendar">
          {/* Day names header */}
          <div className="grid grid-cols-7 gap-1" role="row">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
                role="columnheader"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1" role="grid">
            {data.calendar.map((dayData) => {
              const date = new Date(dayData.date);
              const isToday = dayData.date === new Date().toISOString().split('T')[0];
              const hasTasks = dayData.totalTasks > 0;

              const ariaLabel = `${monthNames[date.getMonth()]} ${dayData.dayOfMonth}, ${date.getFullYear()}${hasTasks ? `. ${dayData.totalTasks} task${dayData.totalTasks > 1 ? 's' : ''}` : ''}${isToday ? ' (today)' : ''}`;

              return (
                <div
                  key={dayData.date}
                  className={cn(
                    'min-h-[80px] p-2 rounded-md border transition-colors',
                    isToday && 'bg-primary/5 border-primary',
                    !isToday && 'border-border hover:bg-muted/50',
                    !hasTasks && 'opacity-60'
                  )}
                  role="gridcell"
                  aria-label={ariaLabel}
                  tabIndex={hasTasks ? 0 : -1}
                >
                  <div className="flex flex-col h-full">
                    <span
                      className={cn(
                        'text-sm font-medium mb-1',
                        isToday && 'text-primary'
                      )}
                    >
                      {dayData.dayOfMonth}
                    </span>

                    {hasTasks && (
                      <div className="flex-1 space-y-1">
                        <div className="text-xs font-medium">
                          {dayData.totalTasks} task{dayData.totalTasks > 1 ? 's' : ''}
                        </div>

                        {/* Status badges */}
                        <div className="flex flex-wrap gap-1">
                          {dayData.statusCounts.overdue > 0 && (
                            <Badge
                              variant="destructive"
                              className="text-[10px] px-1 py-0"
                            >
                              {dayData.statusCounts.overdue}
                            </Badge>
                          )}
                          {dayData.statusCounts.inProgress > 0 && (
                            <Badge
                              variant="default"
                              className="text-[10px] px-1 py-0"
                            >
                              {dayData.statusCounts.inProgress}
                            </Badge>
                          )}
                          {dayData.statusCounts.pending > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1 py-0"
                            >
                              {dayData.statusCounts.pending}
                            </Badge>
                          )}
                        </div>

                        {/* Priority indicator */}
                        {dayData.priorityCounts.high > 0 && (
                          <div className="text-[10px] text-destructive font-medium">
                            {dayData.priorityCounts.high} high priority
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-destructive" />
              <span>Overdue</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-secondary" />
              <span>Pending</span>
            </div>
          </div>
        </div>
      )}
    </WidgetContainer>
  );
});

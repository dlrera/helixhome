'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WidgetContainer } from './widget-container';
import { useDashboardAnalytics } from '@/lib/hooks/use-dashboard';
import { colors, tooltipStyles, axisStyles, legendStyles, getPriorityColor, getCategoryColor } from '@/lib/config/charts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Period = 'week' | 'month' | 'quarter' | 'year';

/**
 * AnalyticsChart - Multi-view analytics widget with completion trends, category, and priority charts
 * Performance optimized with React.memo and useCallback
 */
export const AnalyticsChart = React.memo(function AnalyticsChart() {
  const [period, setPeriod] = useState<Period>('month');
  const { data, isLoading, error } = useDashboardAnalytics(period);

  // Memoize period change handler
  const handlePeriodChange = useCallback((value: string) => {
    setPeriod(value as Period);
  }, []);

  // Memoize date formatter to avoid recreation on every render
  const dateFormatter = useCallback((value: string) => {
    const date = new Date(value);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }, []);

  const labelFormatter = useCallback((value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString();
  }, []);

  const periodSelector = useMemo(() => (
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
  ), [period, handlePeriodChange]);

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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.completionTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.border} />
                  <XAxis
                    dataKey="date"
                    tick={axisStyles.tick}
                    tickFormatter={dateFormatter}
                  />
                  <YAxis tick={axisStyles.tick} />
                  <Tooltip
                    contentStyle={tooltipStyles.contentStyle}
                    labelStyle={tooltipStyles.labelStyle}
                    itemStyle={tooltipStyles.itemStyle}
                    labelFormatter={labelFormatter}
                  />
                  <Legend wrapperStyle={legendStyles.wrapperStyle} />
                  <Line
                    type="linear"
                    dataKey="count"
                    stroke={colors.primary}
                    strokeWidth={2}
                    name="Completed Tasks"
                    dot={{ fill: colors.primary, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="category" className="mt-0">
            <div className="h-[300px]">
              {data.categoryBreakdown.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No category data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.categoryBreakdown} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.border} />
                    <XAxis dataKey="category" tick={axisStyles.tick} />
                    <YAxis tick={axisStyles.tick} />
                    <Tooltip
                      contentStyle={tooltipStyles.contentStyle}
                      labelStyle={tooltipStyles.labelStyle}
                      itemStyle={tooltipStyles.itemStyle}
                    />
                    <Bar dataKey="count" name="Tasks" radius={[4, 4, 0, 0]}>
                      {data.categoryBreakdown.map((entry, index) => (
                        <rect key={`cell-${index}`} fill={getCategoryColor(index)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>

          <TabsContent value="priority" className="mt-0">
            <div className="h-[300px]">
              {data.priorityDistribution.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No priority data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.priorityDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.border} />
                    <XAxis dataKey="priority" tick={axisStyles.tick} />
                    <YAxis tick={axisStyles.tick} />
                    <Tooltip
                      contentStyle={tooltipStyles.contentStyle}
                      labelStyle={tooltipStyles.labelStyle}
                      itemStyle={tooltipStyles.itemStyle}
                    />
                    <Bar dataKey="count" name="Active Tasks" radius={[4, 4, 0, 0]}>
                      {data.priorityDistribution.map((entry, index) => (
                        <rect key={`cell-${index}`} fill={getPriorityColor(entry.priority)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </WidgetContainer>
  );
});

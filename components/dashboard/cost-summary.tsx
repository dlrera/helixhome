'use client';

import React from 'react';
import { WidgetContainer } from './widget-container';
import { useCostSummary } from '@/lib/hooks/use-dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colors, tooltipStyles, axisStyles, formatCurrency } from '@/lib/config/charts';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

/**
 * CostSummary - Widget displaying maintenance cost tracking and budget progress
 * Performance optimized with React.memo
 */
export const CostSummary = React.memo(function CostSummary() {
  const { data, isLoading, error } = useCostSummary();

  return (
    <WidgetContainer
      title="Cost Summary"
      description="Track maintenance spending and budget"
      isLoading={isLoading}
      error={error?.message}
    >
      {data && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0 space-y-4">
            {/* Total Spent */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.totalSpent)}</p>
                </div>
              </div>
            </div>

            {/* Budget Progress */}
            {data.budgetProgress ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Budget Progress</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(data.budgetProgress.spent)} / {formatCurrency(data.budgetProgress.budget)}
                  </span>
                </div>

                <Progress
                  value={Math.min(data.budgetProgress.percentageUsed, 100)}
                  className={data.budgetProgress.isOverBudget ? 'bg-red-100' : ''}
                />

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {data.budgetProgress.percentageUsed.toFixed(1)}% used
                  </span>
                  {data.budgetProgress.isOverBudget ? (
                    <Badge variant="destructive" className="text-xs">
                      Over Budget by {formatCurrency(Math.abs(data.budgetProgress.remaining))}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">
                      {formatCurrency(data.budgetProgress.remaining)} remaining
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">
                  No budget set. Set a budget in settings to track spending.
                </p>
              </div>
            )}

            {/* Category Breakdown */}
            {data.categoryBreakdown.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Spending by Category</p>
                <div className="space-y-2">
                  {data.categoryBreakdown.slice(0, 5).map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors.chart.categories[index % colors.chart.categories.length] }}
                        />
                        <span>{category.category}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(category.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trends" className="mt-0">
            {data.monthOverMonth.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthOverMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.border} />
                      <XAxis dataKey="month" tick={axisStyles.tick} />
                      <YAxis tick={axisStyles.tick} tickFormatter={(value) => `$${value}`} />
                      <Tooltip
                        contentStyle={tooltipStyles.contentStyle}
                        labelStyle={tooltipStyles.labelStyle}
                        formatter={(value: number) => [formatCurrency(value), 'Spent']}
                      />
                      <Bar dataKey="total" fill={colors.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Month-over-month comparison */}
                {data.monthOverMonth.length >= 2 && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    {(() => {
                      const currentMonth = data.monthOverMonth[data.monthOverMonth.length - 1];
                      const previousMonth = data.monthOverMonth[data.monthOverMonth.length - 2];
                      const change = currentMonth.total - previousMonth.total;
                      const percentChange = previousMonth.total > 0
                        ? ((change / previousMonth.total) * 100)
                        : 0;
                      const isIncrease = change > 0;

                      return (
                        <div className="flex items-center gap-2">
                          {isIncrease ? (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          )}
                          <p className="text-sm">
                            <span className={isIncrease ? 'text-red-600' : 'text-green-600'}>
                              {isIncrease ? '+' : ''}{percentChange.toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground ml-1">
                              vs last month ({formatCurrency(Math.abs(change))})
                            </span>
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-sm text-muted-foreground">No trend data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </WidgetContainer>
  );
});

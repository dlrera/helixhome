"use client";

import { useState } from "react";
import { useCostSummary } from "@/lib/hooks/use-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { colors, chartMargins, tooltipStyles, formatCurrency } from "@/lib/config/charts";
import { Loader2, Download, TrendingUp, TrendingDown } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";

export function CostReportView() {
  const now = new Date();
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(now).toISOString(),
    endDate: endOfMonth(now).toISOString(),
  });

  const { data, isLoading, error } = useCostSummary(
    dateRange.startDate,
    dateRange.endDate
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-sm text-muted-foreground">
            Failed to load cost report. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const hasSpending = data.totalSpent > 0;
  const hasBudget = data.budgetProgress?.budget && data.budgetProgress.budget > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(data.totalSpent)}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {format(new Date(dateRange.startDate), "MMM d")} - {format(new Date(dateRange.endDate), "MMM d, yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {hasBudget && data.budgetProgress ? formatCurrency(data.budgetProgress.budget) : "Not Set"}
            </div>
            {hasBudget && data.budgetProgress && (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatCurrency(data.budgetProgress.remaining)} remaining
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasBudget && data.budgetProgress ? (
              <>
                <div className="text-3xl font-bold">
                  {data.budgetProgress.percentageUsed.toFixed(0)}%
                </div>
                <Progress
                  value={Math.min(data.budgetProgress.percentageUsed, 100)}
                  className="mt-2"
                />
                {data.budgetProgress.isOverBudget && (
                  <Badge variant="destructive" className="mt-2">
                    Over Budget
                  </Badge>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                <Button variant="link" className="h-auto p-0" asChild>
                  <a href="/dashboard/settings">Set Budget</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {hasSpending ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Category Breakdown Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>Distribution of maintenance costs</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categoryBreakdown}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {data.categoryBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors.chart.categories[index % colors.chart.categories.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Budget Progress */}
              {hasBudget && data.budgetProgress && (
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Tracking</CardTitle>
                    <CardDescription>Your spending vs. budget</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Budget</span>
                        <span className="font-medium">{formatCurrency(data.budgetProgress.budget)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Spent</span>
                        <span className="font-medium">{formatCurrency(data.budgetProgress.spent)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Remaining</span>
                        <span className={`font-medium ${data.budgetProgress.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(data.budgetProgress.remaining)}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={Math.min(data.budgetProgress.percentageUsed, 100)}
                      className="h-3"
                    />
                    <p className="text-xs text-muted-foreground">
                      {data.budgetProgress.isOverBudget
                        ? `You've exceeded your budget by ${formatCurrency(Math.abs(data.budgetProgress.remaining))}`
                        : `${data.budgetProgress.percentageUsed.toFixed(1)}% of budget used`}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-sm text-muted-foreground">
                  No maintenance costs recorded for this period.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown by Category</CardTitle>
              <CardDescription>Detailed spending analysis per category</CardDescription>
            </CardHeader>
            <CardContent>
              {hasSpending ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Tasks</TableHead>
                        <TableHead className="text-right">Total Cost</TableHead>
                        <TableHead className="text-right">Avg Cost</TableHead>
                        <TableHead className="text-right">% of Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.categoryBreakdown.map((category, index) => {
                        const percentage = (category.total / data.totalSpent) * 100;
                        return (
                          <TableRow key={category.category}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-3 w-3 rounded-full"
                                  style={{
                                    backgroundColor: colors.chart.categories[index % colors.chart.categories.length],
                                  }}
                                />
                                {category.category || "Uncategorized"}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">-</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(category.total)}
                            </TableCell>
                            <TableCell className="text-right">
                              -
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary">{percentage.toFixed(1)}%</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">
                          -
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(data.totalSpent)}</TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell className="text-right">100%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No category data available for this period.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>6-Month Spending Trend</CardTitle>
              <CardDescription>Track your maintenance costs over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {data.monthOverMonth && data.monthOverMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthOverMonth} margin={chartMargins.default}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.border} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: colors.chart.textMuted }}
                      style={{ fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: colors.chart.textMuted }}
                      style={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={tooltipStyles.contentStyle}
                      formatter={(value) => [formatCurrency(value as number), "Spent"]}
                    />
                    <Bar dataKey="total" fill={colors.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No trend data available yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Month-over-Month Comparison Table */}
          {data.monthOverMonth && data.monthOverMonth.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Comparison</CardTitle>
                <CardDescription>Month-over-month spending changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Total Spent</TableHead>
                        <TableHead className="text-right">Tasks</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.monthOverMonth.map((month, index) => {
                        const prevMonth = index > 0 ? data.monthOverMonth[index - 1] : null;
                        const change = prevMonth
                          ? month.total - prevMonth.total
                          : 0;
                        const changePercent = prevMonth && prevMonth.total > 0
                          ? (change / prevMonth.total) * 100
                          : 0;

                        return (
                          <TableRow key={month.month}>
                            <TableCell className="font-medium">{month.month}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(month.total)}
                            </TableCell>
                            <TableCell className="text-right">{month.count}</TableCell>
                            <TableCell className="text-right">
                              {index > 0 ? (
                                <div className="flex items-center justify-end gap-1">
                                  {change > 0 ? (
                                    <TrendingUp className="h-4 w-4 text-red-600" />
                                  ) : change < 0 ? (
                                    <TrendingDown className="h-4 w-4 text-green-600" />
                                  ) : null}
                                  <span className={change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : ''}>
                                    {change > 0 ? '+' : ''}{formatCurrency(change)}
                                    {prevMonth && prevMonth.total > 0 && (
                                      <span className="text-xs text-muted-foreground ml-1">
                                        ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%)
                                      </span>
                                    )}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Export Button (placeholder) */}
      <div className="flex justify-end">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>
    </div>
  );
}

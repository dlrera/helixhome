'use client'

/**
 * Analytics Charts - Lazy loaded Recharts components
 * This file contains the actual chart implementations using Recharts library.
 * It's dynamically imported to reduce initial bundle size.
 */

import React, { useCallback } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  colors,
  tooltipStyles,
  axisStyles,
  legendStyles,
  getPriorityColor,
  getCategoryColor,
} from '@/lib/config/charts'

interface CompletionTrendChartProps {
  data: Array<{ date: string; count: number }>
}

export function CompletionTrendChart({ data }: CompletionTrendChartProps) {
  const dateFormatter = useCallback((value: string) => {
    const date = new Date(value)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }, [])

  const labelFormatter = useCallback((value: string) => {
    const date = new Date(value)
    return date.toLocaleDateString()
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
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
  )
}

interface CategoryBreakdownChartProps {
  data: Array<{ category: string; count: number }>
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">
          No category data available
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.border} />
        <XAxis dataKey="category" tick={axisStyles.tick} />
        <YAxis tick={axisStyles.tick} />
        <Tooltip
          contentStyle={tooltipStyles.contentStyle}
          labelStyle={tooltipStyles.labelStyle}
          itemStyle={tooltipStyles.itemStyle}
        />
        <Bar dataKey="count" name="Tasks" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <rect key={`cell-${index}`} fill={getCategoryColor(index)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

interface PriorityDistributionChartProps {
  data: Array<{ priority: string; count: number }>
}

export function PriorityDistributionChart({
  data,
}: PriorityDistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">
          No priority data available
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.border} />
        <XAxis dataKey="priority" tick={axisStyles.tick} />
        <YAxis tick={axisStyles.tick} />
        <Tooltip
          contentStyle={tooltipStyles.contentStyle}
          labelStyle={tooltipStyles.labelStyle}
          itemStyle={tooltipStyles.itemStyle}
        />
        <Bar dataKey="count" name="Active Tasks" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <rect
              key={`cell-${index}`}
              fill={getPriorityColor(entry.priority)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

interface MonthlyTrendChartProps {
  data: Array<{ month: string; total: number; count: number }>
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">No trend data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.border} />
        <XAxis dataKey="month" tick={axisStyles.tick} />
        <YAxis tick={axisStyles.tick} tickFormatter={(value) => `$${value}`} />
        <Tooltip
          contentStyle={tooltipStyles.contentStyle}
          labelStyle={tooltipStyles.labelStyle}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
        />
        <Bar dataKey="total" fill={colors.primary} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

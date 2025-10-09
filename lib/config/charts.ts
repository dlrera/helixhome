/**
 * Chart configuration for HelixIntel dashboard
 * Defines brand colors and reusable chart settings for Recharts
 */

/**
 * HelixIntel brand colors
 */
export const colors = {
  // Primary brand colors
  primary: '#216093',
  white: '#FFFFFF',

  // Secondary colors
  navy: '#001B48',
  teal: '#57949A',
  offWhite: '#F9FAFA',
  black: '#000000',

  // Tertiary colors
  orange: '#E18331',
  green: '#2E933C',
  red: '#DB162F',
  blue: '#224870',
  yellow: '#F0C319',

  // Chart-specific colors
  chart: {
    // Task status colors
    pending: '#F0C319',     // Yellow
    inProgress: '#216093',  // Brand blue
    completed: '#2E933C',   // Green
    overdue: '#DB162F',     // Red
    cancelled: '#57949A',   // Teal

    // Priority colors
    high: '#DB162F',        // Red
    medium: '#E18331',      // Orange
    low: '#57949A',         // Teal

    // Category colors (cycling through tertiary palette)
    categories: [
      '#216093', // Brand blue
      '#E18331', // Orange
      '#2E933C', // Green
      '#57949A', // Teal
      '#224870', // Blue
      '#F0C319', // Yellow
      '#DB162F', // Red
      '#001B48', // Navy
    ],

    // Neutral colors for backgrounds and borders
    background: '#F9FAFA',
    border: '#E5E7EB',
    text: '#000000',
    textMuted: '#6B7280',
  },
};

/**
 * Common chart margin settings
 */
export const chartMargins = {
  default: { top: 10, right: 30, left: 0, bottom: 0 },
  withLegend: { top: 10, right: 30, left: 0, bottom: 20 },
  compact: { top: 5, right: 10, left: 0, bottom: 5 },
};

/**
 * Chart axis styles
 */
export const axisStyles = {
  tickLine: { stroke: colors.chart.border },
  axisLine: { stroke: colors.chart.border },
  tick: { fill: colors.chart.textMuted, fontSize: 12 },
};

/**
 * Tooltip styles
 */
export const tooltipStyles = {
  contentStyle: {
    backgroundColor: colors.white,
    border: `1px solid ${colors.chart.border}`,
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  labelStyle: {
    color: colors.black,
    fontWeight: 600,
    marginBottom: '4px',
  },
  itemStyle: {
    color: colors.chart.textMuted,
    fontSize: '14px',
  },
};

/**
 * Legend styles
 */
export const legendStyles = {
  wrapperStyle: {
    paddingTop: '20px',
  },
  iconType: 'circle' as const,
};

/**
 * Get color for task status
 */
export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: colors.chart.pending,
    IN_PROGRESS: colors.chart.inProgress,
    COMPLETED: colors.chart.completed,
    OVERDUE: colors.chart.overdue,
    CANCELLED: colors.chart.cancelled,
  };
  return statusMap[status] || colors.primary;
}

/**
 * Get color for task priority
 */
export function getPriorityColor(priority: string): string {
  const priorityMap: Record<string, string> = {
    HIGH: colors.chart.high,
    MEDIUM: colors.chart.medium,
    LOW: colors.chart.low,
  };
  return priorityMap[priority] || colors.primary;
}

/**
 * Get color for category (cycles through palette)
 */
export function getCategoryColor(index: number): string {
  return colors.chart.categories[index % colors.chart.categories.length];
}

/**
 * Format currency for charts
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format large numbers with abbreviations
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(0)}%`;
}

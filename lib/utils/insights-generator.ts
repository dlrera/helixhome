import { differenceInDays, isAfter, isBefore } from 'date-fns';
import { Task, Asset, TaskStatus } from '@prisma/client';

/**
 * Task with asset relation for insights
 */
type TaskWithAsset = Task & {
  asset?: (Pick<Asset, 'id' | 'name' | 'category'> & {
    tasks: Pick<Task, 'id' | 'completedAt' | 'status'>[];
  }) | null;
};

/**
 * Insight types
 */
export type Insight = {
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  description: string;
  actionable?: boolean;
  metadata?: Record<string, any>;
};

/**
 * Find the most maintained asset (highest task completion count)
 */
export function findMostMaintainedAsset(
  assets: (Pick<Asset, 'id' | 'name' | 'category'> & {
    tasks: Pick<Task, 'status'>[];
  })[]
): { asset: Pick<Asset, 'id' | 'name' | 'category'>; count: number } | null {
  if (assets.length === 0) return null;

  const assetMaintenanceCounts = assets.map((asset) => ({
    asset: { id: asset.id, name: asset.name, category: asset.category },
    count: asset.tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
  }));

  const sorted = assetMaintenanceCounts.sort((a, b) => b.count - a.count);
  return sorted[0].count > 0 ? sorted[0] : null;
}

/**
 * Find the longest overdue task
 */
export function findLongestOverdueTask(
  tasks: Pick<Task, 'id' | 'title' | 'dueDate' | 'status'>[]
): { task: Pick<Task, 'id' | 'title' | 'dueDate'>; daysOverdue: number } | null {
  const overdueTasks = tasks.filter((t) => t.status === TaskStatus.OVERDUE);

  if (overdueTasks.length === 0) return null;

  const now = new Date();
  const tasksWithDays = overdueTasks.map((task) => ({
    task: { id: task.id, title: task.title, dueDate: task.dueDate },
    daysOverdue: differenceInDays(now, new Date(task.dueDate)),
  }));

  const sorted = tasksWithDays.sort((a, b) => b.daysOverdue - a.daysOverdue);
  return sorted[0];
}

/**
 * Calculate completion streak - consecutive days with at least one task completed
 */
export function calculateCompletionStreak(
  tasks: Pick<Task, 'completedAt' | 'status'>[]
): number {
  const completedTasks = tasks
    .filter((t) => t.status === TaskStatus.COMPLETED && t.completedAt)
    .sort((a, b) => {
      const dateA = new Date(a.completedAt!);
      const dateB = new Date(b.completedAt!);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });

  if (completedTasks.length === 0) return 0;

  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Start of today

  // Check if there's a task completed today or yesterday
  const mostRecentCompletion = new Date(completedTasks[0].completedAt!);
  mostRecentCompletion.setHours(0, 0, 0, 0);

  const daysDiff = differenceInDays(currentDate, mostRecentCompletion);
  if (daysDiff > 1) {
    // Streak is broken if no task completed today or yesterday
    return 0;
  }

  // Count consecutive days
  const uniqueDates = new Set(
    completedTasks.map((t) => {
      const date = new Date(t.completedAt!);
      date.setHours(0, 0, 0, 0);
      return date.toISOString();
    })
  );

  const sortedDates = Array.from(uniqueDates)
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    if (sortedDates[i].getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Generate actionable recommendations based on data
 */
export function generateRecommendations(
  tasks: Pick<Task, 'status' | 'dueDate' | 'priority'>[],
  assets: (Pick<Asset, 'category'> & {
    tasks: Pick<Task, 'status'>[];
  })[]
): string[] {
  const recommendations: string[] = [];

  // Check for overdue tasks
  const overdueTasks = tasks.filter((t) => t.status === TaskStatus.OVERDUE);
  if (overdueTasks.length > 0) {
    recommendations.push(
      `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Consider prioritizing these to avoid further delays.`
    );
  }

  // Check for upcoming high priority tasks
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const upcomingHighPriority = tasks.filter(
    (t) =>
      t.priority === 'HIGH' &&
      t.status === TaskStatus.PENDING &&
      isAfter(new Date(t.dueDate), now) &&
      isBefore(new Date(t.dueDate), sevenDaysFromNow)
  );

  if (upcomingHighPriority.length > 0) {
    recommendations.push(
      `You have ${upcomingHighPriority.length} high-priority task${upcomingHighPriority.length > 1 ? 's' : ''} due in the next 7 days.`
    );
  }

  // Check for assets without maintenance
  const assetsWithoutMaintenance = assets.filter(
    (asset) => asset.tasks.filter((t) => t.status === TaskStatus.COMPLETED).length === 0
  );

  if (assetsWithoutMaintenance.length > 0) {
    recommendations.push(
      `${assetsWithoutMaintenance.length} asset${assetsWithoutMaintenance.length > 1 ? 's have' : ' has'} no completed maintenance tasks. Consider scheduling regular maintenance.`
    );
  }

  // Check for pending tasks
  const pendingTasks = tasks.filter((t) => t.status === TaskStatus.PENDING);
  if (pendingTasks.length > 10) {
    recommendations.push(
      `You have ${pendingTasks.length} pending tasks. Consider breaking them into smaller, manageable chunks.`
    );
  }

  return recommendations;
}

/**
 * Main function to generate all maintenance insights
 */
export function generateMaintenanceInsights(
  tasks: TaskWithAsset[],
  assets: (Pick<Asset, 'id' | 'name' | 'category'> & {
    tasks: Pick<Task, 'id' | 'completedAt' | 'status'>[];
  })[]
): Insight[] {
  const insights: Insight[] = [];

  // Most maintained asset
  const mostMaintained = findMostMaintainedAsset(assets);
  if (mostMaintained && mostMaintained.count > 0) {
    insights.push({
      type: 'success',
      title: 'Most Maintained Asset',
      description: `${mostMaintained.asset.name} has ${mostMaintained.count} completed maintenance task${mostMaintained.count > 1 ? 's' : ''}.`,
      metadata: { assetId: mostMaintained.asset.id },
    });
  }

  // Longest overdue task
  const longestOverdue = findLongestOverdueTask(tasks);
  if (longestOverdue) {
    insights.push({
      type: 'alert',
      title: 'Longest Overdue Task',
      description: `"${longestOverdue.task.title}" is ${longestOverdue.daysOverdue} day${longestOverdue.daysOverdue > 1 ? 's' : ''} overdue.`,
      actionable: true,
      metadata: { taskId: longestOverdue.task.id },
    });
  }

  // Completion streak
  const streak = calculateCompletionStreak(tasks);
  if (streak > 0) {
    insights.push({
      type: 'success',
      title: 'Completion Streak',
      description: `You've completed tasks for ${streak} consecutive day${streak > 1 ? 's' : ''}! Keep up the great work.`,
    });
  }

  // Recommendations
  const recommendations = generateRecommendations(tasks, assets);
  recommendations.forEach((rec) => {
    insights.push({
      type: 'info',
      title: 'Recommendation',
      description: rec,
      actionable: true,
    });
  });

  // If no insights generated, add a default message
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      title: 'Getting Started',
      description: 'Start tracking your home maintenance by creating assets and scheduling tasks.',
    });
  }

  return insights;
}

import { format, eachDayOfInterval } from 'date-fns';
import { Task, Asset, Priority, TaskStatus } from '@prisma/client';

/**
 * Task with asset relation for analytics
 */
type TaskWithAsset = Task & {
  asset?: Pick<Asset, 'category'> | null;
};

/**
 * Calculate completion trend - tasks completed over time by day
 */
export function calculateCompletionTrend(
  tasks: Pick<Task, 'completedAt'>[],
  startDate: Date,
  endDate: Date
): Array<{ date: string; count: number }> {
  const dayInterval = eachDayOfInterval({ start: startDate, end: endDate });

  return dayInterval.map((day) => {
    const count = tasks.filter((task) => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return format(completedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
    }).length;

    return {
      date: format(day, 'yyyy-MM-dd'),
      count,
    };
  });
}

/**
 * Calculate category breakdown - tasks grouped by asset category
 */
export function calculateCategoryBreakdown(
  tasks: TaskWithAsset[]
): Array<{ category: string; count: number }> {
  const categoryMap = new Map<string, number>();

  tasks.forEach((task) => {
    if (task.asset) {
      const category = task.asset.category;
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    }
  });

  return Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate priority distribution - active tasks by priority
 */
export function calculatePriorityDistribution(
  tasks: Pick<Task, 'priority'>[]
): Array<{ priority: Priority; count: number }> {
  const priorityMap = new Map<Priority, number>();

  tasks.forEach((task) => {
    const priority = task.priority;
    priorityMap.set(priority, (priorityMap.get(priority) || 0) + 1);
  });

  return Array.from(priorityMap.entries()).map(([priority, count]) => ({
    priority,
    count,
  }));
}

/**
 * Calculate budget status - spending vs budget
 */
export function calculateBudgetStatus(
  tasks: Pick<Task, 'actualCost'>[],
  budget: number
): {
  budget: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
} {
  const spent = tasks.reduce((sum, task) => sum + (task.actualCost || 0), 0);
  const remaining = budget - spent;
  const percentageUsed = (spent / budget) * 100;

  return {
    budget,
    spent: Math.round(spent * 100) / 100,
    remaining: Math.round(remaining * 100) / 100,
    percentageUsed: Math.round(percentageUsed * 100) / 100,
    isOverBudget: spent > budget,
  };
}

/**
 * Group tasks by date for calendar view
 */
export function groupTasksByDate(
  tasks: (Pick<Task, 'id' | 'title' | 'dueDate' | 'status' | 'priority'> & {
    asset?: Pick<Asset, 'id' | 'name' | 'category'> | null;
  })[],
  startDate: Date,
  endDate: Date
): Array<{
  date: string;
  dayOfMonth: number;
  totalTasks: number;
  statusCounts: {
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  priorityCounts: {
    high: number;
    medium: number;
    low: number;
  };
  tasks: typeof tasks;
}> {
  const dayInterval = eachDayOfInterval({ start: startDate, end: endDate });

  return dayInterval.map((day) => {
    const dayKey = format(day, 'yyyy-MM-dd');

    const dayTasks = tasks.filter((task) => {
      const taskDate = format(new Date(task.dueDate), 'yyyy-MM-dd');
      return taskDate === dayKey;
    });

    const statusCounts = {
      pending: dayTasks.filter((t) => t.status === TaskStatus.PENDING).length,
      inProgress: dayTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      completed: dayTasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
      overdue: dayTasks.filter((t) => t.status === TaskStatus.OVERDUE).length,
    };

    const priorityCounts = {
      high: dayTasks.filter((t) => t.priority === Priority.HIGH).length,
      medium: dayTasks.filter((t) => t.priority === Priority.MEDIUM).length,
      low: dayTasks.filter((t) => t.priority === Priority.LOW).length,
    };

    return {
      date: dayKey,
      dayOfMonth: day.getDate(),
      totalTasks: dayTasks.length,
      statusCounts,
      priorityCounts,
      tasks: dayTasks,
    };
  });
}

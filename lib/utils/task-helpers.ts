import { Task, Priority, TaskStatus } from "@prisma/client";

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(task: { dueDate: Date; status: TaskStatus }): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(task.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today && task.status === "PENDING";
}

/**
 * Get color class for task priority
 */
export function getTaskPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    URGENT: "text-red-600 bg-red-50 border-red-200",
    HIGH: "text-orange-600 bg-orange-50 border-orange-200",
    MEDIUM: "text-blue-600 bg-blue-50 border-blue-200",
    LOW: "text-gray-600 bg-gray-50 border-gray-200",
  };

  return colors[priority];
}

/**
 * Get color class for task status
 */
export function getTaskStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    PENDING: "text-gray-600 bg-gray-50",
    IN_PROGRESS: "text-blue-600 bg-blue-50",
    COMPLETED: "text-green-600 bg-green-50",
    OVERDUE: "text-red-600 bg-red-50",
    CANCELLED: "text-gray-400 bg-gray-50",
  };

  return colors[status];
}

/**
 * Format task due date in human-readable format
 */
export function formatTaskDueDate(dueDate: Date | string): string {
  const date = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);

  const diffTime = taskDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  // For dates further away, show actual date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Sort tasks by default order
 * Overdue first, then by priority/due date
 */
export function sortTasksByDefault<T extends { status: TaskStatus; priority: Priority; dueDate: Date | string }>(
  tasks: T[]
): T[] {
  return [...tasks].sort((a, b) => {
    // Status order: OVERDUE > IN_PROGRESS > PENDING > COMPLETED > CANCELLED
    const statusOrder: Record<TaskStatus, number> = {
      OVERDUE: 0,
      IN_PROGRESS: 1,
      PENDING: 2,
      COMPLETED: 3,
      CANCELLED: 4,
    };

    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;

    // Within same status, sort by priority (higher first)
    const priorityOrder: Record<Priority, number> = {
      URGENT: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };

    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Within same priority, sort by due date (earlier first)
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    return dateA - dateB;
  });
}

/**
 * Filter tasks by search term (searches title and description)
 */
export function filterTasksBySearchTerm<T extends { title: string; description?: string | null }>(
  tasks: T[],
  searchTerm: string
): T[] {
  if (!searchTerm.trim()) return tasks;

  const lowerSearch = searchTerm.toLowerCase();

  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(lowerSearch) ||
      task.description?.toLowerCase().includes(lowerSearch)
  );
}

/**
 * Group tasks by due date ranges
 */
export function groupTasksByDueDate<T extends { dueDate: Date | string; status: TaskStatus }>(
  tasks: T[]
): Record<string, T[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const groups: Record<string, T[]> = {
    overdue: [],
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: [],
    completed: [],
    cancelled: [],
  };

  tasks.forEach((task) => {
    // Group completed and cancelled tasks separately
    if (task.status === "COMPLETED") {
      groups.completed.push(task);
      return;
    }

    if (task.status === "CANCELLED") {
      groups.cancelled.push(task);
      return;
    }

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (task.status === "OVERDUE" || dueDate < today) {
      groups.overdue.push(task);
    } else if (dueDate.getTime() === today.getTime()) {
      groups.today.push(task);
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      groups.tomorrow.push(task);
    } else if (dueDate <= nextWeek) {
      groups.thisWeek.push(task);
    } else {
      groups.later.push(task);
    }
  });

  return groups;
}

/**
 * Get priority badge text
 */
export function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    URGENT: "Urgent",
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low",
  };

  return labels[priority];
}

/**
 * Get status badge text
 */
export function getStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    OVERDUE: "Overdue",
    CANCELLED: "Cancelled",
  };

  return labels[status];
}

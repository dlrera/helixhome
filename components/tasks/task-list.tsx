"use client";

import { Priority, TaskStatus } from "@prisma/client";
import { TaskCard } from "./task-card";
import { Loader2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { groupTasksByDueDate } from "@/lib/utils/task-helpers";

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  asset?: {
    id: string;
    name: string;
    category: string;
  } | null;
  template?: {
    id: string;
    name: string;
  } | null;
}

interface TaskListProps {
  tasks: Task[];
  view?: "list" | "compact" | "grouped";
  isLoading?: boolean;
  onTaskClick?: (taskId: string) => void;
  onComplete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  showAsset?: boolean;
  showCompleteButton?: boolean;
  emptyMessage?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function TaskList({
  tasks,
  view = "list",
  isLoading = false,
  onTaskClick,
  onComplete,
  onEdit,
  onDelete,
  showCompleteButton = true,
  emptyMessage = "No tasks found",
  onLoadMore,
  hasMore = false,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  if (view === "grouped") {
    const grouped = groupTasksByDueDate(tasks);
    const sections = [
      { key: "overdue", title: "Overdue", tasks: grouped.overdue },
      { key: "today", title: "Today", tasks: grouped.today },
      { key: "tomorrow", title: "Tomorrow", tasks: grouped.tomorrow },
      { key: "thisWeek", title: "This Week", tasks: grouped.thisWeek },
      { key: "later", title: "Later", tasks: grouped.later },
      { key: "completed", title: "Completed", tasks: grouped.completed },
      { key: "cancelled", title: "Cancelled", tasks: grouped.cancelled },
    ];

    return (
      <div className="space-y-6">
        {sections.map(
          (section) =>
            section.tasks.length > 0 && (
              <div key={section.key} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {section.title} ({section.tasks.length})
                </h3>
                <div className="space-y-2">
                  {section.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      variant="compact"
                      showActions={showCompleteButton}
                      onClick={() => onTaskClick?.(task.id)}
                      onComplete={() => onComplete?.(task.id)}
                      onEdit={() => onEdit?.(task.id)}
                      onDelete={() => onDelete?.(task.id)}
                    />
                  ))}
                </div>
              </div>
            )
        )}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button variant="outline" onClick={onLoadMore}>
              Load More
            </Button>
          </div>
        )}
      </div>
    );
  }

  const variant = view === "compact" ? "compact" : "full";

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          variant={variant}
          showActions={showCompleteButton}
          onClick={() => onTaskClick?.(task.id)}
          onComplete={() => onComplete?.(task.id)}
          onEdit={() => onEdit?.(task.id)}
          onDelete={() => onDelete?.(task.id)}
        />
      ))}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

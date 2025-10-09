"use client";

import { Priority, TaskStatus } from "@prisma/client";
import { Calendar, CheckCircle2, Clock, Tag, Trash2, AlertCircle, Circle, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatTaskDueDate,
  getTaskPriorityColor,
  getTaskStatusColor,
  getPriorityLabel,
  getStatusLabel,
} from "@/lib/utils/task-helpers";
import { cn } from "@/lib/utils";

// Priority icon mapping with colors
const getPriorityIcon = (priority: Priority) => {
  switch (priority) {
    case 'URGENT':
      return <AlertCircle className="h-3.5 w-3.5 text-red-600" />
    case 'HIGH':
      return <ArrowUp className="h-3.5 w-3.5 text-orange-600" />
    case 'MEDIUM':
      return <Circle className="h-3.5 w-3.5 text-blue-600" />
    case 'LOW':
      return <Circle className="h-3.5 w-3.5 text-gray-400" />
  }
}

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

interface TaskCardProps {
  task: Task;
  variant?: "full" | "compact" | "minimal";
  showActions?: boolean;
  onComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

export function TaskCard({
  task,
  variant = "full",
  showActions = true,
  onComplete,
  onEdit,
  onDelete,
  onClick,
}: TaskCardProps) {
  const isOverdue = task.status === "OVERDUE";
  const isCompleted = task.status === "COMPLETED";
  const isCancelled = task.status === "CANCELLED";

  if (variant === "minimal") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors",
          isCompleted && "opacity-60",
          isCancelled && "opacity-40"
        )}
        onClick={onClick}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete?.();
                }}
                disabled={isCompleted || isCancelled}
              >
                <CheckCircle2
                  className={cn(
                    "h-5 w-5",
                    isCompleted ? "text-green-600" : "text-gray-300 hover:text-green-600"
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isCompleted ? "Completed" : "Mark as complete"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {getPriorityIcon(task.priority)}
          <p className={cn("text-sm font-medium truncate", isCompleted && "line-through")}>
            {task.title}
          </p>
        </div>
        <Badge variant="outline" className={cn("text-xs", getTaskStatusColor(task.status))}>
          {getStatusLabel(task.status)}
        </Badge>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors",
          isOverdue && "border-red-200 bg-red-50/50",
          isCompleted && "opacity-60",
          isCancelled && "opacity-40"
        )}
        onClick={onClick}
      >
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {getPriorityIcon(task.priority)}
              <p className={cn("text-sm font-medium truncate", isCompleted && "line-through")}>{task.title}</p>
            </div>
            <Badge variant="outline" className={cn("text-xs shrink-0", getTaskStatusColor(task.status))}>
              {getStatusLabel(task.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className={cn("flex items-center gap-1", isOverdue && "text-red-600 font-medium")}>
              <Calendar className="h-3 w-3" />
              {formatTaskDueDate(task.dueDate)}
            </span>
            {task.asset && (
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {task.asset.name}
              </span>
            )}
          </div>
        </div>
        {showActions && !isCompleted && !isCancelled && (
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplete?.();
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark as complete</p>
                </TooltipContent>
              </Tooltip>
              {onDelete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cancel task</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <Card
      className={cn(
        "p-4 cursor-pointer hover:shadow-md transition-shadow",
        isOverdue && "border-red-200 bg-red-50/30",
        isCompleted && "opacity-75",
        isCancelled && "opacity-50"
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className={cn("font-semibold text-base", isCompleted && "line-through")}>{task.title}</h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
            )}
          </div>
          <Badge variant="outline" className={cn("shrink-0", getTaskStatusColor(task.status))}>
            {getStatusLabel(task.status)}
          </Badge>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className={cn("flex items-center gap-1.5", isOverdue && "text-red-600 font-medium")}>
            <Calendar className="h-4 w-4" />
            {formatTaskDueDate(task.dueDate)}
          </span>

          <div className="flex items-center gap-1.5">
            {getPriorityIcon(task.priority)}
            <Badge variant="outline" className={cn("text-xs", getTaskPriorityColor(task.priority))}>
              {getPriorityLabel(task.priority)}
            </Badge>
          </div>

          {task.asset && (
            <span className="flex items-center gap-1.5">
              <Tag className="h-4 w-4" />
              {task.asset.name}
            </span>
          )}

          {task.template && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {task.template.name}
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 pt-2 border-t">
            {!isCompleted && !isCancelled && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete?.();
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Complete
              </Button>
            )}
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

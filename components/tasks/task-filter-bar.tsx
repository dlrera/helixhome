"use client";

import { useState } from "react";
import { Priority, TaskStatus } from "@prisma/client";
import { X, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TaskFilterInput } from "@/lib/validation/task";

interface TaskFilterBarProps {
  filters: Partial<TaskFilterInput>;
  onFilterChange: (filters: Partial<TaskFilterInput>) => void;
  showSearch?: boolean;
  className?: string;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "COMPLETED", label: "Completed" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

export function TaskFilterBar({
  filters,
  onFilterChange,
  showSearch = true,
  className,
}: TaskFilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");

  const toggleStatus = (status: TaskStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];

    onFilterChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  const togglePriority = (priority: Priority) => {
    const currentPriorities = filters.priority || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter((p) => p !== priority)
      : [...currentPriorities, priority];

    onFilterChange({
      ...filters,
      priority: newPriorities.length > 0 ? newPriorities : undefined,
    });
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    // Debounce would be nice here, but for simplicity, we'll update immediately
    onFilterChange({
      ...filters,
      search: value || undefined,
    });
  };

  const clearFilters = () => {
    setSearchInput("");
    onFilterChange({});
  };

  const activeFilterCount =
    (filters.status?.length || 0) + (filters.priority?.length || 0) + (filters.search ? 1 : 0);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Status Filters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Status
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className={cn(
              "transition-opacity",
              activeFilterCount === 0 && "opacity-0 pointer-events-none"
            )}
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
            <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const isActive = filters.status?.includes(option.value);
            return (
              <Button
                key={option.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleStatus(option.value)}
                className={cn("transition-all", !isActive && "hover:bg-accent")}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Priority Filters */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Priority</label>
        <div className="flex flex-wrap gap-2">
          {PRIORITY_OPTIONS.map((option) => {
            const isActive = filters.priority?.includes(option.value);
            return (
              <Button
                key={option.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => togglePriority(option.value)}
                className={cn("transition-all", !isActive && "hover:bg-accent")}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

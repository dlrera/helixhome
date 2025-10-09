"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Priority, TaskStatus } from "@prisma/client";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  CompleteTaskInput,
  TaskFilterInput,
} from "@/lib/validation/task";

// Types for API responses
interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  completedAt: string | null;
  completedBy: string | null;
  completionNotes: string | null;
  completionPhotos: string | string[] | null;
  asset?: {
    id: string;
    name: string;
    category: string;
  } | null;
  template?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TaskStatsResponse {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  cancelled: number;
  completionRate: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

/**
 * Fetch tasks with filters
 */
export function useTasks(filters?: Partial<TaskFilterInput>) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.status) params.set("status", filters.status.join(","));
      if (filters?.priority) params.set("priority", filters.priority.join(","));
      if (filters?.assetId) params.set("assetId", filters.assetId);
      if (filters?.startDate)
        params.set("startDate", filters.startDate.toISOString());
      if (filters?.endDate)
        params.set("endDate", filters.endDate.toISOString());
      if (filters?.search) params.set("search", filters.search);
      if (filters?.page) params.set("page", filters.page.toString());
      if (filters?.limit) params.set("limit", filters.limit.toString());

      const response = await fetch(`/api/tasks?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      return response.json() as Promise<TasksResponse>;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch single task by ID
 */
export function useTask(taskId: string | undefined) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch task");
      }

      const data = await response.json();
      return data.task as Task;
    },
    enabled: !!taskId,
  });
}

/**
 * Fetch task statistics
 */
export function useTaskStats(dateRange?: { startDate?: Date; endDate?: Date }) {
  return useQuery({
    queryKey: ["taskStats", dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (dateRange?.startDate)
        params.set("startDate", dateRange.startDate.toISOString());
      if (dateRange?.endDate)
        params.set("endDate", dateRange.endDate.toISOString());

      const response = await fetch(`/api/tasks/stats?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch task stats");
      }

      return response.json() as Promise<TaskStatsResponse>;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create task");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskStats"] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });
}

/**
 * Update an existing task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      taskId,
      data,
    }: {
      taskId: string;
      data: UpdateTaskInput;
    }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update task");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskStats"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });
}

/**
 * Complete a task
 */
export function useCompleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      taskId,
      data,
    }: {
      taskId: string;
      data?: CompleteTaskInput;
    }) => {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data || {}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete task");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskStats"] });
      toast({
        title: "Success",
        description: "Task completed! 🎉",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete task",
        variant: "destructive",
      });
    },
  });
}

/**
 * Start a task (mark as in progress)
 */
export function useStartTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}/start`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to start task");
      }

      return response.json();
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskStats"] });
      toast({
        title: "Success",
        description: "Task started",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start task",
        variant: "destructive",
      });
    },
  });
}

/**
 * Reopen a completed or cancelled task
 */
export function useReopenTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}/reopen`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reopen task");
      }

      return response.json();
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskStats"] });
      toast({
        title: "Success",
        description: "Task reopened",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reopen task",
        variant: "destructive",
      });
    },
  });
}

/**
 * Delete (cancel) a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete task");
      }

      return response.json();
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskStats"] });
      toast({
        title: "Success",
        description: "Task cancelled",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    },
  });
}

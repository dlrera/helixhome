"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TaskList } from "@/components/tasks/task-list";
import { TaskFilterBar } from "@/components/tasks/task-filter-bar";
import { QuickTaskForm } from "@/components/tasks/quick-task-form";
import { useTasks, useCompleteTask, useDeleteTask } from "@/lib/hooks/use-tasks";
import type { TaskFilterInput } from "@/lib/validation/task";
import { useRouter } from "next/navigation";
import { TaskStatus, Priority } from "@prisma/client";

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Partial<TaskFilterInput>>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [homeId, setHomeId] = useState<string | null>(null);
  const [assets, setAssets] = useState<{ id: string; name: string; category: string }[]>([]);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const { data, isLoading } = useTasks(filters);
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();

  // Auto-open create dialog if ?create=true is in URL
  useEffect(() => {
    if (searchParams.get("create") === "true" && homeId) {
      setShowCreateDialog(true);
      // Clear the query param after opening
      router.replace("/tasks", { scroll: false });
    }
  }, [searchParams, homeId, router]);

  // Get user's home ID and assets (simplified - in production, handle multiple homes)
  useState(() => {
    fetch("/api/homes")
      .then((res) => res.json())
      .then((data) => {
        if (data.homes && data.homes.length > 0) {
          setHomeId(data.homes[0].id);
          // Fetch assets for this home
          fetch(`/api/assets?homeId=${data.homes[0].id}`)
            .then((res) => res.json())
            .then((assetData) => {
              if (assetData.assets) {
                setAssets(
                  assetData.assets.map((a: { id: string; name: string; category: string }) => ({
                    id: a.id,
                    name: a.name,
                    category: a.category,
                  }))
                );
              }
            })
            .catch(() => {
              // Handle error silently
            });
        }
      })
      .catch(() => {
        // Handle error silently
      });
  });

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  const handleComplete = async (taskId: string) => {
    await completeTask.mutateAsync({ taskId });
  };

  const handleDelete = (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      await deleteTask.mutateAsync(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const handleFilterChange = (newFilters: Partial<TaskFilterInput>) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-2">
            Manage your home maintenance tasks
            {data && ` • ${data.total} total`}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href="/tasks/calendar" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </Button>
          </Link>
          <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TaskFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        showSearch
      />

      {/* Task List */}
      <TaskList
        tasks={data?.tasks || []}
        view="grouped"
        isLoading={isLoading}
        onTaskClick={handleTaskClick}
        onComplete={handleComplete}
        onDelete={handleDelete}
        emptyMessage={
          Object.keys(filters).length > 0
            ? "No tasks match your filters"
            : "No tasks yet. Create your first task to get started!"
        }
      />

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          {homeId && (
            <QuickTaskForm
              homeId={homeId}
              assets={assets}
              onSuccess={() => setShowCreateDialog(false)}
              onCancel={() => setShowCreateDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile FAB */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden z-50"
        size="icon"
        onClick={() => setShowCreateDialog(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this task? This will mark the task as cancelled, but it will remain in your task history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Task</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

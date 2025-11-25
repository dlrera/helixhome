"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Priority } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTask } from "@/lib/hooks/use-tasks";

const quickTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  assetId: z.string().optional(),
});

type QuickTaskFormData = z.infer<typeof quickTaskSchema>;

interface QuickTaskFormProps {
  homeId: string;
  assetId?: string;
  assets?: { id: string; name: string; category: string }[];
  defaultDueDate?: Date;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function QuickTaskForm({
  homeId,
  assetId,
  assets,
  defaultDueDate,
  onSuccess,
  onCancel,
}: QuickTaskFormProps) {
  const createTask = useCreateTask();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = defaultDueDate || tomorrow;
  const dateString = defaultDate.toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<QuickTaskFormData>({
    resolver: zodResolver(quickTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: dateString,
      priority: "MEDIUM",
      assetId: assetId || "",
    },
  });

  const priority = watch("priority");
  const selectedAssetId = watch("assetId");

  const onSubmit = async (data: QuickTaskFormData) => {
    await createTask.mutateAsync({
      ...data,
      dueDate: new Date(data.dueDate),
      homeId,
      assetId: data.assetId || undefined,
    });

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">
          Task Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="e.g., Change HVAC filter"
          autoFocus
        />
        {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Add any additional details..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">
            Due Date <span className="text-red-500">*</span>
          </Label>
          <Input id="dueDate" type="date" {...register("dueDate")} />
          {errors.dueDate && <p className="text-sm text-red-600">{errors.dueDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(value) => setValue("priority", value as Priority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Asset Selection - only show if assets are provided and no pre-selected asset */}
      {assets && assets.length > 0 && !assetId && (
        <div className="space-y-2">
          <Label htmlFor="assetId">Link to Asset (optional)</Label>
          <Select
            value={selectedAssetId || ""}
            onValueChange={(value) => setValue("assetId", value === "none" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an asset..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No asset</SelectItem>
              {assets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.name} ({asset.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={createTask.isPending}>
          {createTask.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Task"
          )}
        </Button>
      </div>
    </form>
  );
}

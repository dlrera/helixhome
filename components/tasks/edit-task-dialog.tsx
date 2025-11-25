'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Priority } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpdateTask } from '@/lib/hooks/use-tasks'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

const editTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  assetId: z.string().optional(),
  estimatedCost: z.string().optional(),
})

type EditTaskFormData = z.infer<typeof editTaskSchema>

interface TaskForEdit {
  id: string
  title: string
  description?: string | null
  dueDate: Date | string
  priority: string
  assetId?: string | null
  estimatedCost?: number | null
}

interface EditTaskDialogProps {
  task: TaskForEdit
  assets?: Array<{ id: string; name: string; category: string }>
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditTaskDialog({
  task,
  assets = [],
  open,
  onOpenChange,
  onSuccess,
}: EditTaskDialogProps) {
  const updateTask = useUpdateTask()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd'),
      priority: task.priority as Priority,
      assetId: task.assetId || '',
      estimatedCost: task.estimatedCost?.toString() || '',
    },
  })

  const priority = watch('priority')
  const selectedAssetId = watch('assetId')

  const onSubmit = async (data: EditTaskFormData) => {
    const estimatedCost = data.estimatedCost
      ? parseFloat(data.estimatedCost)
      : null
    await updateTask.mutateAsync({
      taskId: task.id,
      data: {
        title: data.title,
        description: data.description || null,
        dueDate: new Date(data.dueDate),
        priority: data.priority,
        assetId: data.assetId || null,
        estimatedCost:
          estimatedCost && !isNaN(estimatedCost) ? estimatedCost : null,
      },
    })

    onSuccess?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input id="title" {...register('title')} />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" {...register('description')} rows={3} />
          </div>

          {/* Due Date & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input id="dueDate" type="date" {...register('dueDate')} />
              {errors.dueDate && (
                <p className="text-sm text-red-600">{errors.dueDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) =>
                  setValue('priority', value as Priority)
                }
              >
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

          {/* Asset Selector */}
          {assets.length > 0 && (
            <div className="space-y-2">
              <Label>Linked Asset (optional)</Label>
              <Select
                value={selectedAssetId || ''}
                onValueChange={(value) =>
                  setValue('assetId', value === 'none' ? '' : value)
                }
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

          {/* Estimated Cost */}
          <div className="space-y-2">
            <Label htmlFor="estimatedCost">Estimated Cost (optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="estimatedCost"
                type="number"
                step="0.01"
                min="0"
                {...register('estimatedCost')}
                placeholder="0.00"
                className="pl-7"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateTask.isPending}>
              {updateTask.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

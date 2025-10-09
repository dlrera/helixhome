'use client'

import { useState } from 'react'
import { Task, Asset, MaintenanceTemplate, Priority, TaskStatus } from '@prisma/client'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  Image as ImageIcon,
  Package,
  PlayCircle,
  RotateCcw,
  Tag,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { useCompleteTask, useStartTask, useReopenTask, useDeleteTask } from '@/lib/hooks/use-tasks'
import { formatTaskDueDate, getTaskPriorityColor, getTaskStatusColor, isTaskOverdue } from '@/lib/utils/task-helpers'
import { format } from 'date-fns'
import { TaskCompletionModal } from './task-completion-modal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface TaskWithRelations extends Task {
  asset?: Asset | null
  template?: MaintenanceTemplate | null
}

interface TaskDetailDrawerProps {
  task: TaskWithRelations | null
  open: boolean
  onClose: () => void
  onEdit?: (task: Task) => void
  requireCompletionPhoto?: boolean
}

export function TaskDetailDrawer({
  task,
  open,
  onClose,
  onEdit,
  requireCompletionPhoto = false
}: TaskDetailDrawerProps) {
  const { toast } = useToast()
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const startTaskMutation = useStartTask()
  const reopenTaskMutation = useReopenTask()
  const deleteTaskMutation = useDeleteTask()

  if (!task) return null

  const isOverdue = isTaskOverdue(task)
  const priorityColor = getTaskPriorityColor(task.priority)
  const statusColor = getTaskStatusColor(task.status)

  const handleStart = () => {
    startTaskMutation.mutate(task.id, {
      onSuccess: () => {
        toast({
          title: 'Task started',
          description: `"${task.title}" is now in progress.`
        })
      }
    })
  }

  const handleComplete = () => {
    setShowCompletionModal(true)
  }

  const handleReopen = () => {
    reopenTaskMutation.mutate(task.id, {
      onSuccess: () => {
        toast({
          title: 'Task reopened',
          description: `"${task.title}" has been marked as pending.`
        })
      }
    })
  }

  const handleDelete = () => {
    deleteTaskMutation.mutate(task.id, {
      onSuccess: () => {
        toast({
          title: 'Task deleted',
          description: `"${task.title}" has been deleted.`
        })
        onClose()
      }
    })
    setShowDeleteDialog(false)
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task)
      onClose()
    }
  }

  // Parse completion photos if they exist
  const completionPhotos = task.completionPhotos
    ? JSON.parse(task.completionPhotos as string)
    : []

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <SheetTitle className="text-xl">{task.title}</SheetTitle>
                <SheetDescription>Task Details</SheetDescription>
              </div>
              <div className="flex flex-col gap-2">
                <Badge variant="secondary" className={statusColor}>
                  {task.status.replace('_', ' ')}
                </Badge>
                {isOverdue && task.status === 'PENDING' && (
                  <Badge variant="destructive" className="text-xs">
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Priority and Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Priority
                </div>
                <Badge variant="outline" className={priorityColor}>
                  {task.priority}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </div>
                <p className={`text-sm font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                  {formatTaskDueDate(task.dueDate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    Description
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </>
            )}

            {/* Related Asset */}
            {task.asset && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Package className="h-4 w-4" />
                    Related Asset
                  </div>
                  <Link
                    href={`/assets/${task.asset.id}`}
                    className="block p-3 rounded-md border hover:bg-accent transition-colors"
                  >
                    <p className="font-medium text-sm">{task.asset.name}</p>
                    <p className="text-xs text-muted-foreground">{task.asset.category}</p>
                  </Link>
                </div>
              </>
            )}

            {/* Template Info */}
            {task.template && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    From Template
                  </div>
                  <div className="p-3 rounded-md bg-muted">
                    <p className="font-medium text-sm">{task.template.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.template.description}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Completion Info */}
            {task.status === 'COMPLETED' && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </div>

                  {task.completedAt && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Completed On
                      </div>
                      <p className="text-sm">
                        {format(new Date(task.completedAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  )}

                  {task.completionNotes && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Completion Notes</p>
                      <p className="text-sm bg-muted p-3 rounded-md leading-relaxed">
                        {task.completionNotes}
                      </p>
                    </div>
                  )}

                  {completionPhotos.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ImageIcon className="h-3 w-3" />
                        Completion Photos
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {completionPhotos.map((photo: string, index: number) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Completion photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Notes */}
            {task.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md leading-relaxed">
                    {task.notes}
                  </p>
                </div>
              </>
            )}

            {/* Metadata */}
            <Separator />
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Created {format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}</p>
              {task.updatedAt !== task.createdAt && (
                <p>Updated {format(new Date(task.updatedAt), 'MMM d, yyyy h:mm a')}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3 sticky bottom-0 bg-background pt-4 border-t">
            {task.status === 'PENDING' && (
              <>
                <Button onClick={handleStart} className="w-full" variant="outline">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Task
                </Button>
                <Button onClick={handleComplete} className="w-full">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Task
                </Button>
              </>
            )}

            {task.status === 'IN_PROGRESS' && (
              <Button onClick={handleComplete} className="w-full">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Task
              </Button>
            )}

            {task.status === 'COMPLETED' && (
              <Button onClick={handleReopen} className="w-full" variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reopen Task
              </Button>
            )}

            <div className="flex gap-2">
              {onEdit && task.status !== 'COMPLETED' && (
                <Button onClick={handleEdit} variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Completion Modal */}
      <TaskCompletionModal
        task={task}
        open={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        requirePhoto={requireCompletionPhoto}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

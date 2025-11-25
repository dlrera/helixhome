'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Task, Asset, MaintenanceTemplate } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  CheckCircle2,
  Play,
  Trash2,
  Package,
  DollarSign,
  Pencil,
} from 'lucide-react'
import {
  formatTaskDueDate,
  getTaskPriorityColor,
  getTaskStatusColor,
} from '@/lib/utils/task-helpers'
import { format } from 'date-fns'
import {
  useStartTask,
  useDeleteTask,
  useReopenTask,
} from '@/lib/hooks/use-tasks'
import { TaskCompletionModal } from '@/components/tasks/task-completion-modal'
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface TaskWithRelations extends Task {
  asset?: Asset | null
  template?: MaintenanceTemplate | null
}

interface TaskDetailClientProps {
  task: TaskWithRelations
  assets?: Array<{ id: string; name: string; category: string }>
  requireCompletionPhoto: boolean
}

export function TaskDetailClient({
  task,
  assets = [],
  requireCompletionPhoto,
}: TaskDetailClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const startTaskMutation = useStartTask()
  const reopenTaskMutation = useReopenTask()
  const deleteTaskMutation = useDeleteTask()

  const handleBack = () => {
    router.push('/tasks')
  }

  const handleStart = () => {
    startTaskMutation.mutate(task.id, {
      onSuccess: () => {
        toast({
          title: 'Task started',
          description: `"${task.title}" is now in progress.`,
        })
        router.refresh()
      },
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
          description: `"${task.title}" has been marked as pending.`,
        })
        router.refresh()
      },
    })
  }

  const confirmDelete = () => {
    deleteTaskMutation.mutate(task.id, {
      onSuccess: () => {
        toast({
          title: 'Task deleted',
          description: `"${task.title}" has been deleted.`,
        })
        router.push('/tasks')
      },
    })
    setShowDeleteDialog(false)
  }

  const priorityColor = getTaskPriorityColor(task.priority)
  const statusColor = getTaskStatusColor(task.status)

  // Parse completion photos if they exist
  const completionPhotos = task.completionPhotos
    ? typeof task.completionPhotos === 'string'
      ? JSON.parse(task.completionPhotos)
      : task.completionPhotos
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="min-w-[44px] min-h-[44px]"
            aria-label="Back to tasks"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              Task Details
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Task Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{task.title}</CardTitle>
                  {task.description && (
                    <CardDescription className="mt-2 text-base whitespace-pre-wrap">
                      {task.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge className={priorityColor}>{task.priority}</Badge>
                  <Badge className={statusColor}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Due Date */}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Due Date</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(task.dueDate), 'MMMM d, yyyy')} (
                    {formatTaskDueDate(task.dueDate)})
                  </p>
                </div>
              </div>

              {/* Priority */}
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Priority</p>
                  <p className="text-sm text-gray-600">{task.priority}</p>
                </div>
              </div>

              {/* Asset */}
              {task.asset && (
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Related Asset</p>
                    <Link
                      href={`/assets/${task.asset.id}`}
                      className="text-sm text-[#216093] hover:underline"
                    >
                      {task.asset.name} ({task.asset.category})
                    </Link>
                  </div>
                </div>
              )}

              {/* Template */}
              {task.template && (
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">From Template</p>
                    <p className="text-sm text-gray-600">
                      {task.template.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Estimated Cost */}
              {task.estimatedCost != null && task.estimatedCost > 0 && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Estimated Cost</p>
                    <p className="text-sm text-gray-600">
                      ${task.estimatedCost.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completion Details */}
          {task.status === 'COMPLETED' && task.completedAt && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Completion Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Completed At</p>
                  <p className="text-sm text-gray-600">
                    {format(
                      new Date(task.completedAt),
                      "MMMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>

                {/* Cost Information */}
                {(task.actualCost != null || task.estimatedCost != null) && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Cost Information</p>
                    <div className="bg-muted p-3 rounded-md space-y-2">
                      {task.estimatedCost != null && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Estimated</span>
                          <span>${task.estimatedCost.toFixed(2)}</span>
                        </div>
                      )}
                      {task.actualCost != null && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Actual</span>
                          <span>${task.actualCost.toFixed(2)}</span>
                        </div>
                      )}
                      {task.estimatedCost != null &&
                        task.actualCost != null && (
                          <div className="flex justify-between text-sm font-medium border-t pt-2">
                            <span>Variance</span>
                            <span
                              className={
                                task.actualCost > task.estimatedCost
                                  ? 'text-red-600'
                                  : 'text-green-600'
                              }
                            >
                              {task.actualCost > task.estimatedCost ? '+' : ''}$
                              {(task.actualCost - task.estimatedCost).toFixed(
                                2
                              )}
                            </span>
                          </div>
                        )}
                      {task.costNotes && (
                        <p className="text-xs text-gray-500 border-t pt-2 mt-2">
                          {task.costNotes}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {task.completionNotes && (
                  <div>
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-muted p-3 rounded-md">
                      {task.completionNotes}
                    </p>
                  </div>
                )}
                {completionPhotos.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Photos</p>
                    <div className="grid grid-cols-2 gap-2">
                      {completionPhotos.map((photo: string, index: number) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Completion photo ${index + 1}`}
                          className="rounded-lg border w-full h-48 object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Edit button - show for non-completed tasks */}
              {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Task
                </Button>
              )}

              {task.status === 'PENDING' && (
                <>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleStart}
                    disabled={startTaskMutation.isPending}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Task
                  </Button>
                  <Button className="w-full" onClick={handleComplete}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete Task
                  </Button>
                </>
              )}

              {task.status === 'IN_PROGRESS' && (
                <Button className="w-full" onClick={handleComplete}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Task
                </Button>
              )}

              {task.status === 'OVERDUE' && (
                <Button className="w-full" onClick={handleComplete}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Task
                </Button>
              )}

              {task.status === 'COMPLETED' && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleReopen}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Reopen Task
                </Button>
              )}

              {task.status !== 'CANCELLED' && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleteTaskMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </Button>
              )}

              <Button variant="outline" className="w-full" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tasks
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-700">Status</p>
                <p className="text-gray-600">{task.status.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Created</p>
                <p className="text-gray-600">
                  {format(new Date(task.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Last Updated</p>
                <p className="text-gray-600">
                  {format(new Date(task.updatedAt), 'MMM d, yyyy')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Completion Modal */}
      <TaskCompletionModal
        task={task}
        open={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false)
          router.refresh()
        }}
        requirePhoto={requireCompletionPhoto}
      />

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={task}
        assets={assets}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{task.title}&rdquo;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

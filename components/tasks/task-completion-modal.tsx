'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Task } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useCompleteTask } from '@/lib/hooks/use-tasks'
import { CheckCircle2, Upload, X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'

const completeTaskSchema = z.object({
  completionNotes: z.string().optional(),
  completionPhotos: z.array(z.string()).optional(),
  actualCost: z.string().optional(),
  costNotes: z.string().max(500).optional(),
})

type CompleteTaskInput = z.infer<typeof completeTaskSchema>

interface TaskCompletionModalProps {
  task: (Task & { estimatedCost?: number | null }) | null
  open: boolean
  onClose: () => void
  requirePhoto?: boolean
}

export function TaskCompletionModal({
  task,
  open,
  onClose,
  requirePhoto = false,
}: TaskCompletionModalProps) {
  const { toast } = useToast()
  const completeTaskMutation = useCompleteTask()
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompleteTaskInput>({
    resolver: zodResolver(completeTaskSchema),
    defaultValues: {
      completionNotes: '',
      actualCost: task?.estimatedCost?.toString() || '',
      costNotes: '',
    },
  })

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Limit to 5 photos
    const newFiles = [...photoFiles, ...files].slice(0, 5)
    setPhotoFiles(newFiles)

    // Create previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
    setPhotoPreviews(newPreviews)
  }

  const removePhoto = (index: number) => {
    const newFiles = photoFiles.filter((_, i) => i !== index)
    const newPreviews = photoPreviews.filter((_, i) => i !== index)
    setPhotoFiles(newFiles)
    setPhotoPreviews(newPreviews)
  }

  const uploadPhotos = async (): Promise<string[]> => {
    if (photoFiles.length === 0) return []

    setIsUploadingPhotos(true)
    try {
      // For MVP, we'll convert photos to base64 data URLs
      // In production, you'd upload to S3/Cloudinary
      const photoUrls = await Promise.all(
        photoFiles.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(file)
            })
        )
      )
      return photoUrls
    } catch (error) {
      console.error('Error uploading photos:', error)
      toast({
        title: 'Photo upload failed',
        description: 'Failed to process photos. Please try again.',
        variant: 'destructive',
      })
      return []
    } finally {
      setIsUploadingPhotos(false)
    }
  }

  const onSubmit = async (data: CompleteTaskInput) => {
    if (!task) return

    // Check if photo is required but not provided
    if (requirePhoto && photoFiles.length === 0) {
      toast({
        title: 'Photo required',
        description: 'Please upload at least one photo to complete this task.',
        variant: 'destructive',
      })
      return
    }

    // Upload photos if any
    const photoUrls = await uploadPhotos()

    // Complete the task
    const actualCost = data.actualCost ? parseFloat(data.actualCost) : undefined
    completeTaskMutation.mutate(
      {
        taskId: task.id,
        data: {
          completionNotes: data.completionNotes,
          completionPhotos: photoUrls.length > 0 ? photoUrls : undefined,
          actualCost: actualCost && !isNaN(actualCost) ? actualCost : undefined,
          costNotes: data.costNotes,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Task completed!',
            description: `"${task.title}" has been marked as complete.`,
          })
          handleClose()
        },
        onError: (error) => {
          toast({
            title: 'Failed to complete task',
            description:
              error instanceof Error ? error.message : 'An error occurred',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleClose = () => {
    reset()
    setPhotoFiles([])
    setPhotoPreviews([])
    onClose()
  }

  if (!task) return null

  const isLoading = completeTaskMutation.isPending || isUploadingPhotos

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Complete Task
          </DialogTitle>
          <DialogDescription>
            Add optional notes or photos to document the completion of this
            task.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Task Title */}
          <div className="rounded-md bg-muted p-3">
            <p className="font-medium text-sm">{task.title}</p>
            {task.description && (
              <p className="text-muted-foreground text-xs mt-1">
                {task.description}
              </p>
            )}
          </div>

          {/* Cost Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="actualCost">
                Actual Cost{' '}
                <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="actualCost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-7"
                  {...register('actualCost')}
                />
              </div>
              {task?.estimatedCost && (
                <p className="text-xs text-muted-foreground">
                  Estimated: ${task.estimatedCost.toFixed(2)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="costNotes">
                Cost Notes{' '}
                <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="costNotes"
                placeholder="e.g., Parts from Home Depot"
                maxLength={500}
                {...register('costNotes')}
              />
            </div>
          </div>

          {/* Completion Notes */}
          <div className="space-y-2">
            <Label htmlFor="completionNotes">
              Completion Notes{' '}
              <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="completionNotes"
              placeholder="Add any notes about how the task was completed..."
              rows={3}
              {...register('completionNotes')}
            />
            {errors.completionNotes && (
              <p className="text-destructive text-sm">
                {errors.completionNotes.message}
              </p>
            )}
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label htmlFor="photos">
              Photos{' '}
              <span className="text-muted-foreground">
                {requirePhoto ? '(Required)' : '(Optional, max 5)'}
              </span>
            </Label>

            {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {photoPreviews.length < 5 && (
              <div>
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('photos')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {photoFiles.length > 0 ? 'Add More Photos' : 'Upload Photos'}
                </Button>
              </div>
            )}

            {requirePhoto && photoFiles.length === 0 && (
              <p className="text-destructive text-xs">
                At least one photo is required
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploadingPhotos ? 'Uploading...' : 'Completing...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Task
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

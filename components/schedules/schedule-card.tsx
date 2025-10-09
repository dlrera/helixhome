'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { MoreVertical, Pause, Play, Trash2, Edit, Calendar } from 'lucide-react'
import { formatFrequency } from '@/lib/utils/template-helpers'
import { useToast } from '@/hooks/use-toast'
import { Frequency } from '@prisma/client'
import EditFrequencyModal from './edit-frequency-modal'

interface ScheduleCardProps {
  schedule: {
    id: string
    frequency: Frequency
    customFrequencyDays?: number | null
    nextDueDate: Date
    lastCompletedDate?: Date | null
    isActive: boolean
    template: {
      id: string
      name: string
      description?: string
      estimatedDurationMinutes?: number
    }
    asset?: {
      id: string
      name: string
      category: string
    }
  }
  onUpdate?: () => void
  showAsset?: boolean
}

export default function ScheduleCard({ schedule, onUpdate, showAsset = true }: ScheduleCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditFrequencyModal, setShowEditFrequencyModal] = useState(false)

  const getDueDateStatus = (date: Date) => {
    const now = new Date()
    const dueDate = new Date(date)
    const daysUntil = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) return { text: 'Overdue', color: 'bg-red-100 text-red-800' }
    if (daysUntil === 0) return { text: 'Due Today', color: 'bg-orange-100 text-orange-800' }
    if (daysUntil <= 7) return { text: `${daysUntil} days`, color: 'bg-yellow-100 text-yellow-800' }
    return {
      text: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      color: 'bg-green-100 text-green-800'
    }
  }

  const handleToggleActive = async () => {
    try {
      const response = await fetch(`/api/schedules/${schedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !schedule.isActive }),
      })

      if (!response.ok) throw new Error('Failed to update schedule')

      toast({
        title: schedule.isActive ? 'Schedule Paused' : 'Schedule Activated',
        description: `${schedule.template.name} has been ${schedule.isActive ? 'paused' : 'reactivated'}.`,
      })

      if (onUpdate) onUpdate()
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update schedule status',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/schedules/${schedule.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete schedule')

      toast({
        title: 'Schedule Removed',
        description: `${schedule.template.name} schedule has been removed.`,
      })

      if (onUpdate) onUpdate()
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const dueStatus = getDueDateStatus(schedule.nextDueDate)

  return (
    <>
      <Card className={!schedule.isActive ? 'opacity-60' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold">{schedule.template.name}</h3>
              {showAsset && schedule.asset && (
                <p className="text-sm text-muted-foreground">
                  {schedule.asset.name}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleToggleActive}>
                  {schedule.isActive ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Schedule
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Resume Schedule
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEditFrequencyModal(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Frequency
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Schedule
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {formatFrequency(schedule.frequency)}
                {schedule.customFrequencyDays && ` (${schedule.customFrequencyDays} days)`}
              </span>
            </div>
            <Badge variant="secondary" className={dueStatus.color}>
              {dueStatus.text}
            </Badge>
          </div>

          {schedule.lastCompletedDate && (
            <p className="text-xs text-muted-foreground">
              Last completed: {new Date(schedule.lastCompletedDate).toLocaleDateString()}
            </p>
          )}

          {!schedule.isActive && (
            <Badge variant="outline" className="text-xs">
              Paused
            </Badge>
          )}
        </CardContent>
      </Card>

      <EditFrequencyModal
        schedule={schedule}
        open={showEditFrequencyModal}
        onOpenChange={setShowEditFrequencyModal}
        onUpdate={onUpdate || (() => router.refresh())}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the recurring schedule for "{schedule.template.name}".
              Existing tasks won't be affected, but no new tasks will be created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Removing...' : 'Remove Schedule'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
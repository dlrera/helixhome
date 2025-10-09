import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Frequency } from '@prisma/client'
import { useToast } from '@/hooks/use-toast'

interface Schedule {
  id: string
  assetId: string
  templateId: string
  frequency: Frequency
  customFrequencyDays?: number | null
  nextDueDate: Date
  lastCompletedDate?: Date | null
  isActive: boolean
  template: {
    id: string
    name: string
    description?: string
  }
  asset?: {
    id: string
    name: string
    category: string
  }
}

interface UpdateScheduleParams {
  scheduleId: string
  frequency?: Frequency
  customFrequencyDays?: number | null
  isActive?: boolean
}

// Fetch schedules with optional asset filter
export function useSchedules(assetId?: string) {
  const queryKey = ['schedules', assetId]

  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (assetId) params.append('assetId', assetId)

      const response = await fetch(`/api/schedules?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch schedules')
      }
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })
}

// Update a schedule
export function useUpdateSchedule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ scheduleId, ...data }: UpdateScheduleParams) => {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update schedule')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch schedules
      queryClient.invalidateQueries({ queryKey: ['schedules'] })

      // Show appropriate toast based on what was updated
      if (variables.isActive !== undefined) {
        toast({
          title: variables.isActive ? 'Schedule Activated' : 'Schedule Paused',
          description: `The schedule has been ${variables.isActive ? 'reactivated' : 'paused'}.`,
        })
      } else {
        toast({
          title: 'Schedule Updated',
          description: 'The maintenance schedule has been updated successfully.',
        })
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update schedule',
        variant: 'destructive',
      })
    },
  })
}

// Delete (deactivate) a schedule
export function useDeleteSchedule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (scheduleId: string) => {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete schedule')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch schedules
      queryClient.invalidateQueries({ queryKey: ['schedules'] })

      toast({
        title: 'Schedule Removed',
        description: 'The maintenance schedule has been removed.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete schedule',
        variant: 'destructive',
      })
    },
  })
}

// Process schedules manually (trigger cron job)
export function useProcessSchedules() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/cron/process-schedules', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process schedules')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Invalidate tasks and schedules to show updated data
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['schedules'] })

      toast({
        title: 'Schedules Processed',
        description: `Created ${data.tasksCreated} new tasks from ${data.schedulesProcessed} schedules.`,
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process schedules',
        variant: 'destructive',
      })
    },
  })
}
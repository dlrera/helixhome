import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AssetCategory, Difficulty, Frequency } from '@prisma/client'
import { useToast } from '@/hooks/use-toast'

interface Template {
  id: string
  name: string
  description: string
  category: AssetCategory
  defaultFrequency: Frequency
  estimatedDurationMinutes: number
  difficulty: Difficulty
  isSystemTemplate: boolean
}

interface TemplateFilters {
  category?: AssetCategory
  difficulty?: Difficulty
  search?: string
}

interface ApplyTemplateParams {
  templateId: string
  assetId: string
  frequency?: Frequency
  customFrequencyDays?: number
}

// Fetch all templates with optional filters
export function useTemplates(filters?: TemplateFilters) {
  const queryKey = ['templates', filters]

  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.category) params.append('category', filters.category)
      if (filters?.difficulty) params.append('difficulty', filters.difficulty)
      if (filters?.search) params.append('search', filters.search)

      const response = await fetch(`/api/templates?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
  })
}

// Fetch a single template by ID
export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      const response = await fetch(`/api/templates/${templateId}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Template not found')
        }
        throw new Error('Failed to fetch template')
      }
      return response.json()
    },
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Fetch template suggestions for an asset
export function useTemplateSuggestions(assetId: string) {
  return useQuery({
    queryKey: ['template-suggestions', assetId],
    queryFn: async () => {
      const response = await fetch(`/api/templates/suggestions?assetId=${assetId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch template suggestions')
      }
      return response.json()
    },
    enabled: !!assetId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Apply a template to an asset
export function useApplyTemplate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (params: ApplyTemplateParams) => {
      const response = await fetch('/api/templates/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to apply template')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['template-suggestions'] })

      toast({
        title: 'Template Applied',
        description: 'The maintenance template has been successfully applied.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to apply template',
        variant: 'destructive',
      })
    },
  })
}
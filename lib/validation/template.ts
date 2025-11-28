import { z } from 'zod'
import { Frequency } from '@prisma/client'

export const applyTemplateSchema = z
  .object({
    templateId: z.string().cuid(),
    assetId: z.string().cuid(),
    frequency: z.nativeEnum(Frequency).optional(),
    customFrequencyDays: z.number().int().positive().max(365).optional(),
    startDate: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      // If frequency is CUSTOM, customFrequencyDays must be provided
      if (data.frequency === 'CUSTOM' && !data.customFrequencyDays) {
        return false
      }
      return true
    },
    {
      message: 'Custom frequency requires customFrequencyDays',
      path: ['customFrequencyDays'],
    }
  )

export const updateScheduleSchema = z
  .object({
    frequency: z.nativeEnum(Frequency).optional(),
    customFrequencyDays: z.number().int().positive().max(365).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If frequency is CUSTOM, customFrequencyDays must be provided
      if (data.frequency === 'CUSTOM' && !data.customFrequencyDays) {
        return false
      }
      return true
    },
    {
      message: 'Custom frequency requires customFrequencyDays',
      path: ['customFrequencyDays'],
    }
  )

export const cloneTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  frequency: z.nativeEnum(Frequency).optional(),
  estimatedDurationMinutes: z.number().int().positive().max(480).optional(),
})

export type ApplyTemplateInput = z.infer<typeof applyTemplateSchema>
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>
export type CloneTemplateInput = z.infer<typeof cloneTemplateSchema>

import { z } from 'zod'

/**
 * Validation schema for creating a new task
 */
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  dueDate: z.coerce.date({
    message: 'Valid due date is required',
  }),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
    message: 'Valid priority is required',
  }),
  assetId: z.string().optional(),
  homeId: z.string(),
  estimatedCost: z
    .number()
    .min(0, 'Cost cannot be negative')
    .optional()
    .nullable(),
})

/**
 * Validation schema for updating a task
 */
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .nullable(),
  dueDate: z.coerce
    .date({
      message: 'Valid due date is required',
    })
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z
    .enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED'])
    .optional(),
  assetId: z.string().optional().nullable(),
  estimatedCost: z
    .number()
    .min(0, 'Cost cannot be negative')
    .optional()
    .nullable(),
  actualCost: z
    .number()
    .min(0, 'Cost cannot be negative')
    .optional()
    .nullable(),
  costNotes: z
    .string()
    .max(500, 'Cost notes must be less than 500 characters')
    .optional()
    .nullable(),
})

/**
 * Validation schema for completing a task
 */
export const completeTaskSchema = z.object({
  completionNotes: z
    .string()
    .max(2000, 'Completion notes must be less than 2000 characters')
    .optional(),
  completionPhotos: z.array(z.string().url('Invalid photo URL')).optional(),
  actualCost: z
    .number()
    .min(0, 'Cost cannot be negative')
    .optional()
    .nullable(),
  costNotes: z
    .string()
    .max(500, 'Cost notes must be less than 500 characters')
    .optional()
    .nullable(),
})

/**
 * Validation schema for task filters
 */
export const taskFilterSchema = z.object({
  status: z
    .array(
      z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED'])
    )
    .optional(),
  priority: z.array(z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])).optional(),
  assetId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  search: z.string().optional(),
  page: z.coerce
    .number()
    .min(1, 'Page must be at least 1')
    .optional()
    .default(1),
  limit: z.coerce
    .number()
    .min(1)
    .max(100, 'Limit must be between 1 and 100')
    .optional()
    .default(20),
})

// Type exports for use in components and API routes
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>
export type TaskFilterInput = z.infer<typeof taskFilterSchema>

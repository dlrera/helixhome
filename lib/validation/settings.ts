import { z } from 'zod'

// Property types for the home
export const PROPERTY_TYPES = [
  'Single Family',
  'Condo',
  'Townhouse',
  'Apartment',
  'Multi-Family',
  'Mobile Home',
  'Other',
] as const

// Climate zones
export const CLIMATE_ZONES = [
  'Hot-Humid',
  'Hot-Dry',
  'Mixed-Humid',
  'Mixed-Dry',
  'Cold',
  'Very Cold',
  'Marine',
] as const

// Theme options
export const THEMES = ['light', 'dark', 'system'] as const

// Currency options
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const

// Date format options
export const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] as const

// Helper to transform empty strings to null for optional string fields
const optionalString = z
  .string()
  .optional()
  .nullable()
  .transform((val) => (!val || val === '' ? null : val))

// Helper for optional integer fields
const optionalInt = z
  .union([z.string(), z.number()])
  .optional()
  .nullable()
  .transform((val) => {
    if (val === null || val === undefined || val === '') return null
    const num = typeof val === 'string' ? parseInt(val, 10) : val
    return isNaN(num) ? null : num
  })

// Address schema (stored as JSON)
export const addressSchema = z.object({
  street: optionalString,
  city: optionalString,
  state: optionalString,
  zip: optionalString,
})

// Home details update schema
export const updateHomeDetailsSchema = z.object({
  homeId: z.string().min(1, 'Home ID is required'),
  name: z.string().min(1, 'Home name is required').max(100),
  address: addressSchema.optional(),
  propertyType: z.enum(PROPERTY_TYPES).optional().nullable(),
  yearBuilt: optionalInt.refine(
    (val) => val === null || (val >= 1800 && val <= new Date().getFullYear()),
    { message: 'Year built must be between 1800 and current year' }
  ),
  sizeSqFt: optionalInt.refine(
    (val) => val === null || (val > 0 && val <= 100000),
    { message: 'Size must be between 1 and 100,000 sq ft' }
  ),
  climateZone: z.enum(CLIMATE_ZONES).optional().nullable(),
})

// User preferences schema
export const updateUserPreferencesSchema = z.object({
  theme: z.enum(THEMES).optional(),
  compactMode: z.boolean().optional(),
  currency: z.enum(CURRENCIES).optional(),
  dateFormat: z.enum(DATE_FORMATS).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  taskReminders: z.boolean().optional(),
  maintenanceAlerts: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
})

// Export types
export type UpdateHomeDetailsInput = z.infer<typeof updateHomeDetailsSchema>
export type UpdateUserPreferencesInput = z.infer<
  typeof updateUserPreferencesSchema
>
export type AddressInput = z.infer<typeof addressSchema>

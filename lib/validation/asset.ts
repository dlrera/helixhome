import { z } from 'zod'
import { AssetCategory } from '@prisma/client'

// Helper to transform empty strings to null and parse dates
const dateStringToDate = z
  .string()
  .optional()
  .nullable()
  .transform((val) => {
    if (!val || val === '') return null
    const date = new Date(val)
    return isNaN(date.getTime()) ? null : date
  })

// Helper to transform empty strings to null for optional string fields
const optionalString = z
  .string()
  .optional()
  .nullable()
  .transform((val) => (!val || val === '' ? null : val))

export const createAssetSchema = z.object({
  homeId: z.string().min(1, 'Home ID is required'),
  name: z.string().min(1, 'Asset name is required').max(100),
  category: z.nativeEnum(AssetCategory),
  location: optionalString,
  modelNumber: z.string().max(100).optional().nullable().transform((val) => val === '' ? null : val),
  serialNumber: z.string().max(100).optional().nullable().transform((val) => val === '' ? null : val),
  purchaseDate: dateStringToDate,
  warrantyExpiryDate: dateStringToDate,
  photoUrl: optionalString,
  manualUrl: optionalString,
  metadata: z.string().optional().nullable(),
})

export const updateAssetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.nativeEnum(AssetCategory).optional(),
  location: optionalString,
  modelNumber: z.string().max(100).optional().nullable().transform((val) => val === '' ? null : val),
  serialNumber: z.string().max(100).optional().nullable().transform((val) => val === '' ? null : val),
  purchaseDate: dateStringToDate,
  warrantyExpiryDate: dateStringToDate,
  photoUrl: optionalString,
  manualUrl: optionalString,
  metadata: z.string().optional().nullable(),
})

export const assetQuerySchema = z.object({
  category: z.nativeEnum(AssetCategory).optional(),
  search: z.string().optional(),
  homeId: z.string().min(1).optional(),
})

// Export types
export type CreateAssetInput = z.infer<typeof createAssetSchema>
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>
export type AssetQueryInput = z.infer<typeof assetQuerySchema>

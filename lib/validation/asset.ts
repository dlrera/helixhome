import { z } from 'zod'
import { AssetCategory } from '@prisma/client'

export const createAssetSchema = z.object({
  homeId: z.string().cuid(),
  name: z.string().min(1, 'Asset name is required').max(100),
  category: z.nativeEnum(AssetCategory),
  modelNumber: z.string().max(100).optional().nullable(),
  serialNumber: z.string().max(100).optional().nullable(),
  purchaseDate: z.coerce.date().optional().nullable(),
  warrantyExpiryDate: z.coerce.date().optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  metadata: z.string().optional().nullable(), // JSON string
})

export const updateAssetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.nativeEnum(AssetCategory).optional(),
  modelNumber: z.string().max(100).optional().nullable(),
  serialNumber: z.string().max(100).optional().nullable(),
  purchaseDate: z.coerce.date().optional().nullable(),
  warrantyExpiryDate: z.coerce.date().optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  metadata: z.string().optional().nullable(),
})

export const assetQuerySchema = z.object({
  category: z.nativeEnum(AssetCategory).optional(),
  search: z.string().optional(),
  homeId: z.string().cuid().optional(),
})

// Export types
export type CreateAssetInput = z.infer<typeof createAssetSchema>
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>
export type AssetQueryInput = z.infer<typeof assetQuerySchema>

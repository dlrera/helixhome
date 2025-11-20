import {
  supabase,
  BUCKETS,
  FILE_SIZE_LIMITS,
  ALLOWED_FILE_TYPES,
} from '@/lib/supabase'

export type UploadType = 'image' | 'manual'

interface UploadResult {
  url: string
  path: string
}

interface UploadError {
  error: string
}

/**
 * Validates file type and size
 */
function validateFile(file: File, type: UploadType): string | null {
  const allowedTypes = (
    type === 'image' ? ALLOWED_FILE_TYPES.IMAGE : ALLOWED_FILE_TYPES.MANUAL
  ) as readonly string[]
  const sizeLimit =
    type === 'image' ? FILE_SIZE_LIMITS.IMAGE : FILE_SIZE_LIMITS.MANUAL

  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
  }

  if (file.size > sizeLimit) {
    const limitMB = sizeLimit / (1024 * 1024)
    return `File size exceeds ${limitMB}MB limit`
  }

  return null
}

/**
 * Generates a unique file path for storage
 */
function generateFilePath(
  userId: string,
  assetId: string,
  fileName: string
): string {
  const timestamp = Date.now()
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${userId}/${assetId}/${timestamp}_${cleanFileName}`
}

/**
 * Uploads an image to Supabase storage
 */
export async function uploadImage(
  file: File,
  userId: string,
  assetId: string
): Promise<UploadResult | UploadError> {
  const validationError = validateFile(file, 'image')
  if (validationError) {
    return { error: validationError }
  }

  const filePath = generateFilePath(userId, assetId, file.name)

  const { data, error } = await supabase.storage
    .from(BUCKETS.ASSET_IMAGES)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Image upload error:', error)
    return { error: error.message }
  }

  const { data: publicData } = supabase.storage
    .from(BUCKETS.ASSET_IMAGES)
    .getPublicUrl(data.path)

  return {
    url: publicData.publicUrl,
    path: data.path,
  }
}

/**
 * Uploads a manual/document to Supabase storage
 */
export async function uploadManual(
  file: File,
  userId: string,
  assetId: string
): Promise<UploadResult | UploadError> {
  const validationError = validateFile(file, 'manual')
  if (validationError) {
    return { error: validationError }
  }

  const filePath = generateFilePath(userId, assetId, file.name)

  const { data, error } = await supabase.storage
    .from(BUCKETS.ASSET_MANUALS)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Manual upload error:', error)
    return { error: error.message }
  }

  const { data: publicData } = supabase.storage
    .from(BUCKETS.ASSET_MANUALS)
    .getPublicUrl(data.path)

  return {
    url: publicData.publicUrl,
    path: data.path,
  }
}

/**
 * Deletes a file from Supabase storage
 */
export async function deleteFile(
  filePath: string,
  type: UploadType
): Promise<{ success: boolean; error?: string }> {
  const bucket = type === 'image' ? BUCKETS.ASSET_IMAGES : BUCKETS.ASSET_MANUALS

  const { error } = await supabase.storage.from(bucket).remove([filePath])

  if (error) {
    console.error('File deletion error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Extracts the file path from a Supabase public URL
 */
export function extractFilePathFromUrl(
  url: string,
  type: UploadType
): string | null {
  const bucket = type === 'image' ? BUCKETS.ASSET_IMAGES : BUCKETS.ASSET_MANUALS
  const pattern = new RegExp(`/storage/v1/object/public/${bucket}/(.+)$`)
  const match = url.match(pattern)
  return match ? match[1] : null
}

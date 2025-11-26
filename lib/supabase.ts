import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Bucket names
export const BUCKETS = {
  ASSET_IMAGES: 'asset-images',
  ASSET_MANUALS: 'asset-manuals',
} as const

// File size limits (in bytes)
// Note: Vercel Hobby tier has ~4.5MB request body limit
export const FILE_SIZE_LIMITS = {
  IMAGE: 4 * 1024 * 1024, // 4MB (reduced for Vercel compatibility)
  MANUAL: 4 * 1024 * 1024, // 4MB (reduced for Vercel compatibility)
} as const

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MANUAL: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
} as const

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy-loaded Supabase client to avoid build-time errors when env vars are missing
let _supabase: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey)
  return _supabase
}

// Export a proxy that lazily initializes the client
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop: string | symbol) {
    const client = getSupabaseClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (client as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

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

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Did you create a .env file from .env.example?'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

/**
 * Wound photos live in a private Storage bucket, so <img> tags can't load
 * them directly by path. This asks Supabase for a temporary signed URL.
 */
export async function getSignedImageUrl(path, expiresInSeconds = 3600) {
  if (!path) return null
  const { data, error } = await supabase.storage
    .from('wound-photos')
    .createSignedUrl(path, expiresInSeconds)

  if (error) {
    console.error('Failed to sign image URL:', error.message)
    return null
  }
  return data.signedUrl
}

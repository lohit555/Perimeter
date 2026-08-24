import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Null when the env vars are missing — the UI then shows a clear "not configured" state instead of crashing. */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

export const AUTH_CONFIGURED = supabase !== null

/**
 * Supabase auth is email/password based; there is no native username login.
 * We present a username to the user and map it 1:1 to a synthetic email so
 * the whole signup/signin flow stays on Supabase's standard provider.
 */
export function toAuthEmail(username: string): string {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '')
  return `${clean}@perimeter.dev`
}

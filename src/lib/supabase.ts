import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function isSupabaseConfigured() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

export function getSupabase() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  if (!client) client = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  return client
}

export type ProcessingRecord = {
  id: string
  operation: string
  input_count: number
  output_count: number
  output_bytes: number
  created_at: string
}

export type FavoriteRecord = { id: string; tool_slug: string; created_at: string }

export async function recordProcessing(result: { operation: string; inputCount: number; outputCount: number; outputBytes: number }) {
  if (!isSupabaseConfigured()) return
  const supabase = getSupabase()
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!sessionData.session) return
  const { error } = await supabase.from('processing_history').insert({
    user_id: sessionData.session.user.id,
    operation: result.operation,
    input_count: result.inputCount,
    output_count: result.outputCount,
    output_bytes: result.outputBytes,
  })
  if (error) throw error
}

import { BetterAuthVanillaAdapter } from '@neon/neon-js'
import type { BetterAuthVanillaAdapterInstance, VanillaBetterAuthClient } from '@neon/neon-js'
import { createAuthClient as createNativeAuthClient } from '@neon/neon-js/auth'
import { createClient } from '@neon/neon-js/supabase'

let client: ReturnType<typeof createClient> | null = null
let authClient: VanillaBetterAuthClient | null = null

function getAuthUrl() {
  const url = import.meta.env.VITE_NEON_AUTH_URL
  if (!url) throw new Error('Authentication is not configured. Set VITE_NEON_AUTH_URL.')
  return url
}

function getDataApiBaseUrl(authUrl: string) {
  const configuredUrl = import.meta.env.VITE_NEON_URL
  if (configuredUrl) return configuredUrl.replace(/\/$/, '')

  const url = new URL(authUrl)
  if (!url.hostname.includes('.neonauth.') || !url.pathname.endsWith('/auth')) {
    throw new Error('Neon Auth URL must include the .neonauth host and end in /auth.')
  }
  url.hostname = url.hostname.replace('.neonauth.', '.')
  url.pathname = url.pathname.slice(0, -'/auth'.length).replace(/\/$/, '')
  url.search = ''
  url.hash = ''
  return url.toString().replace(/\/$/, '')
}

export function isNeonConfigured() {
  return Boolean(import.meta.env.VITE_NEON_AUTH_URL)
}

export function getNeonClient() {
  const authUrl = getAuthUrl()
  if (!client) client = createClient(getDataApiBaseUrl(authUrl), { auth: { url: authUrl } })
  return client
}

export function getNeonAuth() {
  if (authClient) return authClient
  const auth = createNativeAuthClient<BetterAuthVanillaAdapterInstance>(getAuthUrl(), {
    adapter: BetterAuthVanillaAdapter(),
  })
  authClient = auth
  return auth
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
  if (!isNeonConfigured()) return
  const neon = getNeonClient()
  const { data: sessionData, error: sessionError } = await neon.auth.getSession()
  if (sessionError) throw sessionError
  if (!sessionData.session) return
  const { error } = await neon.from('processing_history').insert({
    user_id: sessionData.session.user.id,
    operation: result.operation,
    input_count: result.inputCount,
    output_count: result.outputCount,
    output_bytes: result.outputBytes,
  })
  if (error) throw error
}

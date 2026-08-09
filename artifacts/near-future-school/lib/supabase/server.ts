import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/** Auto-corrects bare project refs (e.g. "abcdef") to full URLs */
function normalizeUrl(url: string): string {
  if (!url) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}.supabase.co`
}

const SUPABASE_URL = normalizeUrl(process.env._SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
const SUPABASE_ANON_KEY = process.env._SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SUPABASE_SERVICE_ROLE_KEY = process.env._SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from Server Component — cookies can be read but not set
        }
      },
    },
  })
}

export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

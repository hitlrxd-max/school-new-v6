import { createBrowserClient } from '@supabase/ssr'

function normalizeUrl(url: string): string {
  if (!url) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}.supabase.co`
}

export function createClient() {
  const url = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  return createBrowserClient(url, key)
}

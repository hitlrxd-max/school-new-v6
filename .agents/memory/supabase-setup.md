---
name: Supabase setup for near-future-school
description: How Supabase env vars are configured and the URL normalization workaround
---

# Supabase Setup

## Problem
User enters bare Supabase project ref (e.g. `evftstoyomabqsmtwevi`) instead of full URL.
This causes "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL." from Supabase library.

## Fix
`normalizeUrl()` helper in both `lib/supabase/client.ts` and `lib/supabase/server.ts`:
```ts
function normalizeUrl(url: string): string {
  if (!url) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}.supabase.co`
}
```

**Why:** Supabase dashboard Settings → API shows "Project URL" which is the full URL. But users often copy just the project reference.

## Env Var Loading
NEXT_PUBLIC_* vars are replaced at webpack compile time, not at runtime. Fix:
1. `next.config.ts` reads secrets at server startup via `process.env` and embeds them in the `env` block
2. `lib/supabase/server.ts` also reads `_SUPABASE_URL` (non-NEXT_PUBLIC alias set in next.config.ts env block) to avoid webpack replacement

## Admin Layout + Login Issue
AdminLayout wraps ALL /admin/* routes including login. Fix:
- Middleware passes `x-pathname` header
- AdminLayout reads `x-pathname` via `headers()` and returns `<>{children}</>` for the login page

## SQL Setup
Run `supabase-setup.sql` in Supabase Dashboard → SQL Editor to create tables and RLS policies.

## Creating Admin User
User must create their admin account manually:
Supabase Dashboard → Authentication → Users → Add user (email + password)

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import { hasAuthCookie, supabaseKey, supabaseUrl } from '@/lib/supabase/config';

// Vercel-only, used by proxy.ts. Server Components cannot write cookies, so an
// expiring Supabase session is refreshed here before the page or route runs.
// The fresh cookies are written onto the request (so that render sees them)
// and returned as a function that copies them onto the outgoing response.
// Requests without a session cookie skip all of this.

type CookieToSet = { name: string; value: string; options: CookieOptions };
export type ApplySession = (response: NextResponse) => NextResponse;

export async function refreshSupabaseSession(request: NextRequest): Promise<ApplySession> {
  if (!hasAuthCookie(request.cookies.getAll())) return (response) => response;

  const cookiesToSet: CookieToSet[] = [];
  const cacheHeaders: Record<string, string> = {};
  const supabase = createServerClient(supabaseUrl(), supabaseKey(), {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies, headers) => {
        for (const { name, value } of cookies) request.cookies.set(name, value);
        cookiesToSet.push(...cookies);
        Object.assign(cacheHeaders, headers);
      },
    },
  });
  // Do not remove: getClaims() is what refreshes an expired access token.
  await supabase.auth.getClaims();

  return (response) => {
    for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
    for (const [key, value] of Object.entries(cacheHeaders)) response.headers.set(key, value);
    return response;
  };
}

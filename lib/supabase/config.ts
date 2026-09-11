import { requireEnv } from '@/lib/env';

// Vercel-only. Variable names injected by the Vercel Marketplace Supabase
// integration; the NEXT_PUBLIC_ and ANON variants are accepted so a manually
// configured project also works. Read at request time only. No `server-only`
// import: proxy.ts uses this file too.

export const supabaseUrl = () => requireEnv('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');

export const supabaseKey = () =>
  requireEnv(
    'SUPABASE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  );

/** True when the request carries a Supabase session cookie (possibly chunked). */
export const hasAuthCookie = (cookies: { name: string }[]) =>
  cookies.some(({ name }) => /^sb-.+-auth-token(?:\.\d+)?$/.test(name));

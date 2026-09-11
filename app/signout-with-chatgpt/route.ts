import { NextResponse, type NextRequest } from 'next/server';
import { safeReturnTo } from '@/lib/auth';
import { hasAuthCookie } from '@/lib/supabase/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Vercel-only. Origin components link to OpenAI Sites' /signout-with-chatgpt.
// Sign-out is a GET link there, so only same-site navigations may end the
// session; a cross-site page embedding the URL just gets redirected.

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const site = request.headers.get('sec-fetch-site');
  const sameSite = !site || site === 'same-origin' || site === 'none';
  if (sameSite && hasAuthCookie(request.cookies.getAll())) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut({ scope: 'local' });
  }
  const destination = safeReturnTo(request.nextUrl.searchParams.get('return_to'), '/');
  const response = NextResponse.redirect(new URL(destination, request.url), 303);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

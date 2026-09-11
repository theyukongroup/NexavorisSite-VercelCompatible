import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { safeReturnTo } from '@/lib/auth';
import { resolveAuthLocale, withLang } from '@/lib/auth-copy';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Vercel-only. Confirmation and password-reset emails link to /login/verify,
// whose button POSTs here. Tokens are only redeemed on POST: mail security
// scanners (for example Microsoft Defender Safe Links) open GET links before
// the recipient does, which would use up the one-time token.

export const dynamic = 'force-dynamic';

const emailLinkTypes: readonly string[] = [
  'email',
  'signup',
  'recovery',
  'invite',
  'email_change',
  'magiclink',
];

export async function GET(request: NextRequest) {
  const target = new URL('/login/verify', request.url);
  for (const key of ['token_hash', 'type', 'next', 'lang']) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) target.searchParams.set(key, value);
  }
  return NextResponse.redirect(target, 303);
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const value = (name: string) => String(form.get(name) ?? '');
  const tokenHash = value('token_hash');
  const type = value('type');
  const next = safeReturnTo(value('next'));
  const locale = resolveAuthLocale(value('lang'), next);
  const fail = () =>
    NextResponse.redirect(new URL(withLang('/login/verify?error=invalid', locale), request.url), 303);

  if (!tokenHash || !emailLinkTypes.includes(type)) return fail();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    type: type as EmailOtpType,
    token_hash: tokenHash,
  });
  if (error) return fail();

  const destination = type === 'recovery' ? withLang('/reset-password', locale) : next;
  return NextResponse.redirect(new URL(destination, request.url), 303);
}

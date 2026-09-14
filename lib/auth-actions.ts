'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { safeReturnTo } from '@/lib/auth';
import { authCopy, resolveAuthLocale, withLang, type AuthCopy } from '@/lib/auth-copy';
import type { Locale } from '@/lib/i18n';
import { memberDB } from '@/lib/member-db';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Vercel-only server actions behind the /login, /forgot-password and
// /reset-password forms. Supabase Auth owns the passwords; nothing here
// stores or logs one.

export type AuthState = {
  status: 'idle' | 'error' | 'sent';
  message?: string;
  email?: string;
  resend?: boolean;
};

// Keep in step with components/auth-forms.tsx (minLength), lib/auth-copy.ts
// (hint and error text) and Supabase Auth's minimum password length setting.
const MIN_PASSWORD_LENGTH = 7;
const field = (form: FormData, name: string) => String(form.get(name) ?? '').trim();
const secret = (form: FormData, name: string) => String(form.get(name) ?? '');
const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function context(form: FormData) {
  const next = safeReturnTo(field(form, 'next'));
  const locale = resolveAuthLocale(field(form, 'locale'), next);
  return { next, locale, t: authCopy[locale] };
}

function errorMessage(t: AuthCopy, code: string | undefined) {
  switch (code) {
    case 'invalid_credentials':
      return t.invalidCredentials;
    case 'email_not_confirmed':
      return t.notConfirmed;
    case 'weak_password':
      return t.weakPassword;
    case 'same_password':
      return t.samePassword;
    case 'email_address_invalid':
      return t.invalidEmail;
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return t.rateLimited;
    default:
      return t.genericError;
  }
}

const rateLimited = (code: string | undefined) =>
  code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit';

// Email links are built from the host of this request so preview deployments
// work; Supabase only honours hosts on its Redirect URLs allowlist. The
// email templates append `&token_hash=...&type=...`, so the URL must already
// carry a query string.
async function verifyUrl(next: string, locale: Locale) {
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  if (!host) throw new Error('Cannot determine the request host for email links');
  const protocol =
    requestHeaders.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const url = new URL('/login/verify', `${protocol}://${host}`);
  url.searchParams.set('next', next);
  if (locale !== 'en') url.searchParams.set('lang', locale);
  return url.toString();
}

export async function signInAction(_: AuthState, form: FormData): Promise<AuthState> {
  const { next, t } = context(form);
  const email = field(form, 'email').toLowerCase();
  const password = secret(form, 'password');
  if (!validEmail(email) || !password)
    return { status: 'error', message: t.invalidCredentials, email };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user)
    return {
      status: 'error',
      message: errorMessage(t, error?.code),
      email,
      resend: error?.code === 'email_not_confirmed',
    };

  // The member and admin APIs enforce suspension on every request. Refusing
  // the sign-in too gives the member an explanation instead of an empty dashboard.
  const record = await memberDB()
    .prepare('SELECT account_status FROM member_admin_records WHERE user_id=?')
    .bind(data.user.id)
    .first<{ account_status: string }>();
  if (record?.account_status === 'suspended') {
    await supabase.auth.signOut({ scope: 'local' });
    return { status: 'error', message: t.suspended, email };
  }
  redirect(next);
}

export async function signUpAction(_: AuthState, form: FormData): Promise<AuthState> {
  const { next, locale, t } = context(form);
  const email = field(form, 'email').toLowerCase();
  const password = secret(form, 'password');
  const fullName = field(form, 'full_name').slice(0, 120);
  if (!validEmail(email)) return { status: 'error', message: t.invalidEmail, email };
  if (password.length < MIN_PASSWORD_LENGTH)
    return { status: 'error', message: t.weakPassword, email };
  if (password !== secret(form, 'confirm_password'))
    return { status: 'error', message: t.passwordMismatch, email };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: await verifyUrl(next, locale),
      data: fullName ? { full_name: fullName } : undefined,
    },
  });
  if (error) return { status: 'error', message: errorMessage(t, error.code), email };
  // A session is only returned when "Confirm email" is off in Supabase.
  if (data.session) redirect(next);
  return { status: 'sent', email };
}

export async function resendConfirmationAction(_: AuthState, form: FormData): Promise<AuthState> {
  const { next, locale, t } = context(form);
  const email = field(form, 'email').toLowerCase();
  if (!validEmail(email)) return { status: 'error', message: t.invalidEmail, email };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: await verifyUrl(next, locale) },
  });
  if (rateLimited(error?.code)) return { status: 'error', message: t.rateLimited, email };
  return { status: 'sent', email };
}

export async function requestPasswordResetAction(
  _: AuthState,
  form: FormData,
): Promise<AuthState> {
  const { locale, t } = context(form);
  const email = field(form, 'email').toLowerCase();
  if (!validEmail(email)) return { status: 'error', message: t.invalidEmail, email };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: await verifyUrl('/reset-password', locale),
  });
  if (rateLimited(error?.code)) return { status: 'error', message: t.rateLimited, email };
  // Same answer whether or not an account exists, so addresses can't be probed.
  return { status: 'sent', email };
}

export async function updatePasswordAction(_: AuthState, form: FormData): Promise<AuthState> {
  const { locale, t } = context(form);
  const password = secret(form, 'password');
  if (password.length < MIN_PASSWORD_LENGTH) return { status: 'error', message: t.weakPassword };
  if (password !== secret(form, 'confirm_password'))
    return { status: 'error', message: t.passwordMismatch };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: 'error', message: t.linkExpired };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { status: 'error', message: errorMessage(t, error.code) };
  redirect(withLang('/account', locale));
}

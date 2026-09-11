import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth-forms';
import { getSessionUser } from '@/lib/auth';
import { authCopy, firstParam, resolveAuthLocale, withLang } from '@/lib/auth-copy';

// Reached from a password-reset email: /api/auth/confirm has already exchanged
// the link for a session. Without one there is nothing to update.

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Choose a new password' };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = resolveAuthLocale(firstParam((await searchParams).lang));
  if (!(await getSessionUser())) redirect(withLang('/forgot-password', locale));
  return <ResetPasswordForm copy={authCopy[locale]} locale={locale} />;
}

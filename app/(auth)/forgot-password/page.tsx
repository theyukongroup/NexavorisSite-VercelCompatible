import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth-forms';
import { authCopy, firstParam, resolveAuthLocale, withLang } from '@/lib/auth-copy';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Reset password' };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = resolveAuthLocale(firstParam((await searchParams).lang));
  return (
    <ForgotPasswordForm copy={authCopy[locale]} locale={locale} loginHref={withLang('/login', locale)} />
  );
}

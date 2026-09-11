import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginPanel } from '@/components/auth-forms';
import { getSessionUser, safeReturnTo } from '@/lib/auth';
import { authCopy, firstParam, resolveAuthLocale, withLang } from '@/lib/auth-copy';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeReturnTo(firstParam(params.next));
  const locale = resolveAuthLocale(firstParam(params.lang), next);
  if (await getSessionUser()) redirect(next);
  return (
    <LoginPanel
      copy={authCopy[locale]}
      locale={locale}
      next={next}
      initialMode={firstParam(params.mode) === 'register' ? 'register' : 'signin'}
      forgotHref={withLang('/forgot-password', locale)}
    />
  );
}

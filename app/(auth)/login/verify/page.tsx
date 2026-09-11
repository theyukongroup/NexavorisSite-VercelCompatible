import type { Metadata } from 'next';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { safeReturnTo } from '@/lib/auth';
import { authCopy, firstParam, resolveAuthLocale, withLang } from '@/lib/auth-copy';

// Landing page for confirmation and password-reset emails. The token is only
// redeemed when the button POSTs to /api/auth/confirm, so a mail scanner that
// opens this link does not use it up.

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Confirm' };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeReturnTo(firstParam(params.next));
  const locale = resolveAuthLocale(firstParam(params.lang), next);
  const copy = authCopy[locale];
  const tokenHash = firstParam(params.token_hash);
  const type = firstParam(params.type);

  if (firstParam(params.error) || !tokenHash || !type)
    return (
      <section className="auth-card auth-sent">
        <h1>{copy.verifyInvalid}</h1>
        <p>{copy.linkExpired}</p>
        <a className="button primary" href={withLang(`/login?next=${encodeURIComponent(next)}`, locale)}>
          {copy.backToSignIn}
          <ArrowRight size={16} />
        </a>
        <a className="auth-link" href={withLang('/forgot-password', locale)}>
          {copy.requestNewLink}
        </a>
      </section>
    );

  return (
    <section className="auth-card auth-sent">
      <ShieldCheck size={28} />
      <h1>{copy.verifyTitle}</h1>
      <p>{copy.verifyIntro}</p>
      <form method="post" action="/api/auth/confirm">
        <input type="hidden" name="token_hash" value={tokenHash} />
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="lang" value={locale} />
        <button className="button primary" type="submit">
          {copy.verifyButton}
          <ArrowRight size={16} />
        </button>
      </form>
    </section>
  );
}

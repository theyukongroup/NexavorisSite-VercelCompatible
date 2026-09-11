import { NextResponse, type NextRequest } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { authorityRoutes, localizedUrls, publicRoutes } from '@/lib/seo';
import { refreshSupabaseSession } from '@/lib/supabase/proxy';

const publicPaths = new Set<string>(publicRoutes.map((route) => route || '/'));
const authorityPaths = new Set<string>(authorityRoutes);

function withLanguageHeaders(response: NextResponse, path: string, locale = 'en-US') {
  const urls = localizedUrls(path === '/' ? '' : path);
  response.headers.set(
    'Link',
    Object.entries(urls)
      .map(([language, href]) => `<${href}>; rel="alternate"; hreflang="${language}"`)
      .join(', '),
  );
  response.headers.set('Content-Language', locale);
  return response;
}

// VERCEL-ONLY CHANGE (re-apply after a re-sync): the origin's `proxy` is renamed
// `localeProxy`, and its two bare NextResponse.next() calls forward the request
// headers so a session cookie refreshed below reaches /account, /admin and /api.
function localeProxy(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get('lang');
  if (authorityPaths.has(request.nextUrl.pathname))
    return NextResponse.next({ request: { headers: request.headers } });
  if (!publicPaths.has(request.nextUrl.pathname)) {
    return NextResponse.next({ request: { headers: request.headers } });
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nexavoris-path', request.nextUrl.pathname);
  if (!isLocale(locale) || locale === 'en') {
    return withLanguageHeaders(
      NextResponse.next({ request: { headers: requestHeaders } }),
      request.nextUrl.pathname,
    );
  }

  if (request.nextUrl.pathname.startsWith('/resources') || request.nextUrl.pathname === '/free-account' || request.nextUrl.pathname === '/assessment') {
    requestHeaders.set('x-nexavoris-locale', locale);
    return withLanguageHeaders(
      NextResponse.next({ request: { headers: requestHeaders } }),
      request.nextUrl.pathname,
      locale === 'zh-cn' ? 'zh-CN' : locale === 'zh-tw' ? 'zh-TW' : 'es',
    );
  }

  const url = request.nextUrl.clone();
  url.pathname = `/localized-content/${locale}${request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname}`;
  requestHeaders.set('x-nexavoris-locale', locale);
  return withLanguageHeaders(
    NextResponse.rewrite(url, { request: { headers: requestHeaders } }),
    request.nextUrl.pathname,
    locale === 'zh-cn' ? 'zh-CN' : locale === 'zh-tw' ? 'zh-TW' : 'es',
  );
}

// ---------------------------------------------------------------------------
// VERCEL-ONLY BLOCK - re-apply after any re-sync from the origin.

// Identity headers that only OpenAI Sites could set. Nothing here reads them,
// but no browser sends them legitimately, so a request carrying one is refused.
const sitesIdentityHeaders = [
  'oai-authenticated-user-id',
  'oai-authenticated-user-email',
  'oai-authenticated-user-full-name',
  'oai-authenticated-user-full-name-encoding',
];

function fromAnotherSite(request: NextRequest) {
  const site = request.headers.get('sec-fetch-site');
  if (site === 'cross-site' || site === 'same-site') return true;
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host !== request.headers.get('host');
  } catch {
    return true;
  }
}

export async function proxy(request: NextRequest) {
  if (sitesIdentityHeaders.some((header) => request.headers.has(header)))
    return new NextResponse(null, { status: 400 });
  // The member and admin APIs parse JSON bodies whatever the Content-Type, so
  // state-changing requests from other sites are refused before they arrive.
  if (
    request.nextUrl.pathname.startsWith('/api/') &&
    !['GET', 'HEAD', 'OPTIONS'].includes(request.method) &&
    fromAnotherSite(request)
  )
    return new NextResponse(null, { status: 403 });
  const applySession = await refreshSupabaseSession(request);
  return applySession(localeProxy(request));
}
// ---------------------------------------------------------------------------

export const config = {
  matcher: ['/((?!_next/|favicon.svg|robots.txt|sitemap.xml|.*\\..*).*)'],
};

import { NextResponse, type NextRequest } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { authorityRoutes, localizedUrls, publicRoutes } from '@/lib/seo';

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

export function proxy(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get('lang');
  if (authorityPaths.has(request.nextUrl.pathname)) return NextResponse.next();
  if (!publicPaths.has(request.nextUrl.pathname)) {
    return NextResponse.next();
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

export const config = {
  matcher: ['/((?!_next/|favicon.svg|robots.txt|sitemap.xml|.*\\..*).*)'],
};

import fs from 'node:fs/promises';

const target = (process.argv[2] || 'http://127.0.0.1:8793').replace(/\/$/, '');
const canonicalHost = process.env.SEO_CANONICAL_HOST || 'https://nexavoris.ai';
const routes = [
  '/', '/ai-solutions', '/erp-solutions', '/website-design', '/ai-erp',
  '/equipment', '/industries', '/pricing', '/about', '/contact',
  '/free-account', '/assessment', '/resources', '/resources/private-ai',
  '/resources/odoo-erp', '/resources/ai-erp',
  '/resources/business-automation', '/resources/comparisons',
  '/resources/guides', '/resources/industries/wholesale-distribution',
  '/resources/industries/hvac-field-service',
  '/resources/industries/construction',
  '/resources/industries/manufacturing', '/resources/industries/retail',
  '/resources/industries/professional-services',
];
const authorityRoutes = ['/case-studies','/how-nexavoris-works','/methodology/ai-erp-readiness','/methodology/roi-calculator','/trust','/privacy','/terms','/industries/restaurants'];
const locales = [
  ['en-US', ''], ['zh-CN', '?lang=zh-cn'],
  ['zh-TW', '?lang=zh-tw'], ['es', '?lang=es'],
];
const privateFragments = [
  '/account', '/admin', '/api/', '/login', '/register', '/forgot-password',
  '/reset-password', '/signin-with-chatgpt', '/signout-with-chatgpt',
  '/callback', '/member', '/dashboard', '/localized-content/',
];
const failures = [];
const checks = [];
const assert = (condition, message) => {
  checks.push(message);
  if (!condition) failures.push(message);
};
const expected = (route, suffix) => `${canonicalHost}${route === '/' ? (suffix ? `/${suffix}` : '') : `${route}${suffix}`}`;
const attrs = (html, relation) => [...html.matchAll(new RegExp(`<link[^>]+rel=["']${relation}["'][^>]*>`, 'gi'))]
  .map((match) => Object.fromEntries([...match[0].matchAll(/([\w-]+)=["']([^"']*)["']/g)].map((item) => [item[1].toLowerCase(), item[2]])));

for (const route of routes) {
  for (const [language, suffix] of locales) {
    const response = await fetch(`${target}${route}${suffix}`, { redirect: 'manual' });
    const html = await response.text();
    assert(response.status === 200, `${route}${suffix} returns 200`);
    const canonical = attrs(html, 'canonical')[0]?.href;
    assert(canonical === expected(route, suffix), `${route}${suffix} has its expected self-canonical`);
    const alternates = attrs(html, 'alternate');
    const expectedAlternates = new Map([
      ['x-default', expected(route, '')], ['en-US', expected(route, '')],
      ['zh-CN', expected(route, '?lang=zh-cn')],
      ['zh-TW', expected(route, '?lang=zh-tw')], ['es', expected(route, '?lang=es')],
    ]);
    for (const [code, url] of expectedAlternates) {
      assert(alternates.some((link) => link.hreflang === code && link.href === url), `${route}${suffix} exposes ${code} alternate`);
    }
    assert(!/(chatgpt\.site|vercel\.app|netlify\.app|github\.io|localhost|127\.0\.0\.1)/i.test(html), `${route}${suffix} has no SEO preview-host leak`);
    assert(new RegExp(`<html[^>]+lang=["']${language}["']`, 'i').test(html), `${route}${suffix} has HTML lang ${language}`);
  }
}

for (const route of authorityRoutes) {
  const response = await fetch(`${target}${route}`, { redirect: 'manual' });
  const html = await response.text();
  assert(response.status === 200, `${route} returns 200`);
  assert(attrs(html, 'canonical')[0]?.href === `${canonicalHost}${route}`, `${route} has its expected self-canonical`);
  assert((html.match(/<h1[ >]/gi) || []).length === 1, `${route} has exactly one H1`);
  assert(!/(chatgpt\.site|vercel\.app|netlify\.app|github\.io|localhost|127\.0\.0\.1)/i.test(html), `${route} has no SEO preview-host leak`);
}

const sitemapResponse = await fetch(`${target}/sitemap.xml`);
const sitemap = await sitemapResponse.text();
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].replaceAll('&amp;', '&'));
const expectedUrls = routes.flatMap((route) => locales.map(([, suffix]) => `${canonicalHost}${route}${suffix}`));
expectedUrls.push(...authorityRoutes.map((route)=>`${canonicalHost}${route}`));
assert(sitemapResponse.status === 200, 'sitemap returns 200');
assert(sitemapUrls.length === expectedUrls.length, `sitemap contains ${expectedUrls.length} URLs`);
assert(new Set(sitemapUrls).size === sitemapUrls.length, 'sitemap contains no duplicates');
assert(expectedUrls.every((url) => sitemapUrls.includes(url)), 'sitemap covers every intended public locale URL');
assert(sitemapUrls.every((url) => url.startsWith(canonicalHost)), 'sitemap uses only the canonical production host');
assert(!sitemapUrls.some((url) => privateFragments.some((fragment) => url.includes(fragment))), 'sitemap excludes private, auth, API, and internal routes');

const robotsResponse = await fetch(`${target}/robots.txt`);
const robots = await robotsResponse.text();
assert(robotsResponse.status === 200, 'robots.txt returns 200');
for (const crawler of ['OAI-SearchBot', 'Googlebot', 'Bingbot']) assert(robots.includes(`User-Agent: ${crawler}`), `robots explicitly addresses ${crawler}`);
assert(!/^Disallow: \/$/m.test(robots), 'robots does not block the entire site');
for (const fragment of privateFragments) assert(robots.includes(`Disallow: ${fragment}`), `robots excludes ${fragment}`);

const [accountLayout, adminLayout, adminPage, adminUsersPage, adminApi, mobileNav] = await Promise.all([
  fs.readFile('app/account/layout.tsx', 'utf8'), fs.readFile('app/admin/layout.tsx', 'utf8'),
  fs.readFile('app/admin/page.tsx', 'utf8'), fs.readFile('app/admin/users/page.tsx', 'utf8'),
  fs.readFile('app/api/admin/route.ts', 'utf8'), fs.readFile('components/mobile-navigation.tsx', 'utf8'),
]);
assert(/index:\s*false/.test(accountLayout), 'account layout is noindex');
assert(/index:\s*false/.test(adminLayout), 'admin layout is noindex');
assert(/getAdminActor/.test(adminPage) && /getAdminActor/.test(adminUsersPage) && /actor\.role\s*!==\s*['"]admin['"]/.test(adminPage + adminUsersPage), 'admin pages require a server-side administrator actor');
assert(/requireAdminActor\(['"]admin['"]\)/.test(adminApi), 'sensitive admin role changes require server-side administrator authorization');
for (const label of ['Home', 'Services', 'Industries', 'Resources', 'Pricing', 'About', 'Contact', 'Sign Out']) assert(mobileNav.includes(label), `mobile navigation contains ${label}`);

console.log(`SEO regression audit: ${checks.length - failures.length}/${checks.length} checks passed against ${target}`);
if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('PASS: canonical, hreflang, sitemap, robots, private isolation, and mobile-navigation source checks passed.');
}

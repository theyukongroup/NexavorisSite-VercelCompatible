import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: ['/localized-content/', '/account', '/admin', '/api/', '/signin-with-chatgpt', '/signout-with-chatgpt', '/callback', '/login', '/register', '/forgot-password', '/reset-password', '/member', '/dashboard'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/localized-content/', '/account', '/admin', '/api/', '/signin-with-chatgpt', '/signout-with-chatgpt', '/callback', '/login', '/register', '/forgot-password', '/reset-password', '/member', '/dashboard'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/localized-content/', '/account', '/admin', '/api/', '/signin-with-chatgpt', '/signout-with-chatgpt', '/callback', '/login', '/register', '/forgot-password', '/reset-password', '/member', '/dashboard'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/localized-content/', '/account', '/admin', '/api/', '/signin-with-chatgpt', '/signout-with-chatgpt', '/callback', '/login', '/register', '/forgot-password', '/reset-password', '/member', '/dashboard'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

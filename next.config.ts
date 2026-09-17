import type { NextConfig } from 'next';

// oxlint is used instead of ESLint in this project (see .oxlintrc.json);
// there is no ESLint config here on purpose.
const nextConfig: NextConfig = {
  // The site became Yuhoo (yuhoo.ai) on 2026-09-17. Everything arriving on the
  // old hostnames is sent permanently to the same path on the new one, so
  // links, email signatures and search results follow. Matching on the host
  // keeps this project's own *.vercel.app URLs usable for testing, and keeps
  // old sign-in links working: the token is carried across in the query string
  // and the database behind both sites is the same.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(www\\.)?nexavoris\\.ai' }],
        destination: 'https://yuhoo.ai/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

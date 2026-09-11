import type { Metadata } from 'next';
import './auth.css';

// Vercel-only. Sign-in, verification and password pages: never indexed
// (robots.ts disallows them too) and never passed through the client-side
// translator, because their text is already localized on the server.

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page" data-no-translate>
      {children}
    </main>
  );
}

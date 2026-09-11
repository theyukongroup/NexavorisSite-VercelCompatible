import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Manrope, Newsreader, Geist_Mono } from 'next/font/google';
import Image from 'next/image';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import {
  LanguageRuntime,
  LanguageSelector,
} from '@/components/language-runtime';
import { SITE_URL } from '@/lib/seo';
import { MobileNavigation } from '@/components/mobile-navigation';
import { isLocale, languageTags } from '@/lib/i18n';
import './globals.css';
import './extended.css';
import './pricing.css';
import './equipment.css';
import './theme-v2.css';
import './industries.css';
import './about.css';
import './resources.css';
import './authority.css';
import './member.css';
import './fixes.css';

const sans = Manrope({ variable: '--font-sans', subsets: ['latin'] });
const display = Newsreader({ variable: '--font-display', subsets: ['latin'] });
const mono = Geist_Mono({ variable: '--font-mono', subsets: ['latin'] });
export const metadata: Metadata = {
  title: {
    default: 'Nexavoris | AI & ERP Systems',
    template: '%s | Nexavoris',
  },
  description:
    'Private enterprise AI, ERP implementation, and intelligent business automation for growing companies.',
  metadataBase: new URL(SITE_URL),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'business technology services',
  // Local divergence: real favicons cropped from the hexagon mark.
  // The origin's /favicon.svg is a generic placeholder - do not re-adopt it.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Nexavoris AI & ERP Systems',
    description: 'One integrated operating system for your business.',
    url: SITE_URL,
    siteName: 'Nexavoris',
    locale: 'en_US',
    alternateLocale: ['zh_CN', 'zh_TW', 'es'],
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Nexavoris AI & ERP Systems',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexavoris AI & ERP Systems',
    description: 'Private AI, ERP, and automation for operational businesses.',
    images: ['/og.png'],
  },
};
const nav = [
  ['AI Solutions', '/ai-solutions'],
  ['ERP Solutions', '/erp-solutions'],
  ['Website Design', '/website-design'],
  ['AI + ERP', '/ai-erp'],
  ['Equipment', '/equipment'],
  ['Industries', '/industries'],
  ['Resources', '/resources'],
  ['Pricing', '/pricing'],
  ['About', '/about'],
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localeHeader = (await headers()).get('x-nexavoris-locale');
  const documentLanguage = isLocale(localeHeader)
    ? languageTags[localeHeader]
    : 'en-US';
  return (
    <html lang={documentLanguage} suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} ${mono.variable}`}>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <LanguageRuntime />
        <header>
          <a className="brand logo-brand" href="/" aria-label="Nexavoris home">
            <Image
              src="/nexavoris-logo.png"
              alt="Nexavoris AI & ERP Systems"
              width={210}
              height={105}
              priority
            />
          </a>
          <nav className="desktop-navigation" aria-label="Primary navigation">
            {nav.map(([label, href]) => (
              <a key={label} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <LanguageSelector />
          <a className="nav-cta desktop-assessment" href="/assessment">
            Free AI + ERP Assessment <ArrowUpRight size={16} />
          </a>
          <MobileNavigation />
        </header>
        <div id="main-content">{children}</div>
        <footer>
          <div className="footer-company">
            <a
              className="logo-brand footer-logo"
              href="/"
              aria-label="Nexavoris home"
            >
              <Image
                src="/nexavoris-logo.png"
                alt="Nexavoris AI & ERP Systems"
                width={205}
                height={103}
              />
            </a>
            <p>AI that understands your business. ERP that runs it.</p>
          </div>
          <address className="footer-contact">
            <a href="/how-nexavoris-works">How Nexavoris Works</a>
            <a href="/case-studies">Case Studies</a>
            <a href="/trust">Trust &amp; Data Practices</a>
            <span>
              <MapPin size={16} />
              <span>
                13366 Murphy Road
                <br />
                Stafford, TX 77477
              </span>
            </span>
            <a href="tel:+12812588000">
              <Phone size={16} />
              281-258-8000
            </a>
            <a href="mailto:info@nexavoris.ai">
              <Mail size={16} />
              info@nexavoris.ai
            </a>
          </address>
          <span className="footer-copyright">
            © 2026 Nexavoris. All rights reserved.
            {' · '}<a href="/privacy">Privacy</a>{' · '}<a href="/terms">Terms</a>
          </span>
        </footer>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': ['Organization', 'ProfessionalService'],
                  '@id': `${SITE_URL}/#organization`,
                  name: 'Nexavoris AI & ERP Systems',
                  alternateName: 'Nexavoris',
                  url: SITE_URL,
                  logo: `${SITE_URL}/nexavoris-logo.png`,
                  image: `${SITE_URL}/og.png`,
                  email: 'info@nexavoris.ai',
                  telephone: '+1-281-258-8000',
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: '13366 Murphy Road',
                    addressLocality: 'Stafford',
                    addressRegion: 'TX',
                    postalCode: '77477',
                    addressCountry: 'US',
                  },
                  areaServed: { '@type': 'Country', name: 'United States' },
                  knowsAbout: [
                    'Private enterprise AI',
                    'ERP consulting and implementation',
                    'Odoo implementation',
                    'AI ERP integration',
                    'Business process automation',
                    'Website design and development',
                  ],
                  hasOfferCatalog: {
                    '@type': 'OfferCatalog',
                    name: 'Nexavoris business technology services',
                    itemListElement: [
                      'Private enterprise AI solutions',
                      'ERP consulting and Odoo implementation',
                      'AI and ERP integration',
                      'Business workflow automation',
                      'Website design and development',
                    ].map((name) => ({
                      '@type': 'Offer',
                      itemOffered: { '@type': 'Service', name },
                    })),
                  },
                },
                {
                  '@type': 'WebSite',
                  '@id': `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: 'Nexavoris',
                  publisher: { '@id': `${SITE_URL}/#organization` },
                  inLanguage: ['en-US', 'zh-CN', 'zh-TW', 'es'],
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}

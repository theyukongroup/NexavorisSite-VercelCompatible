'use client';

import Image from 'next/image';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LanguageSelector } from '@/components/language-runtime';

type Props = { signedIn?: boolean; accountHref?: string };
const groups = [
  {
    label: 'Services',
    links: [
      ['Private AI', '/ai-solutions'],
      ['Odoo ERP', '/erp-solutions'],
      ['AI + ERP Integration', '/ai-erp'],
      ['Business Automation', '/resources/business-automation'],
      ['Website Design', '/website-design'],
      ['Equipment', '/equipment'],
    ],
  },
  {
    label: 'Industries',
    links: [
      [
        'Wholesale Distribution',
        '/resources/industries/wholesale-distribution',
      ],
      ['HVAC & Field Service', '/resources/industries/hvac-field-service'],
      ['Construction', '/resources/industries/construction'],
      ['Manufacturing', '/resources/industries/manufacturing'],
      ['Retail', '/resources/industries/retail'],
      ['Professional Services', '/resources/industries/professional-services'],
    ],
  },
  {
    label: 'Resources',
    links: [
      ['All Guides', '/resources'],
      ['Private AI', '/resources/private-ai'],
      ['Odoo ERP', '/resources/odoo-erp'],
      ['AI + ERP', '/resources/ai-erp'],
      ['Comparisons', '/resources/comparisons'],
      ['Business Automation', '/resources/business-automation'],
      ['Industry Resources', '/resources/industries/wholesale-distribution'],
      ['Case Studies', '/case-studies'],
      ['How Nexavoris Works', '/how-nexavoris-works'],
    ],
  },
] as const;

export function MobileNavigation({ signedIn = false, accountHref }: Props) {
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', escape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', escape);
      menuButton.current?.focus();
    };
  }, [open]);
  return (
    <>
      <button
        ref={menuButton}
        className="mobile-menu-button"
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden="true" />
      </button>
      {open && (
        <div
          className="mobile-menu-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <aside
            id="mobile-navigation"
            className="mobile-menu-drawer"
            aria-label="Mobile navigation"
          >
            <div className="mobile-menu-head">
              <a
                href="/"
                onClick={() => setOpen(false)}
                aria-label="Nexavoris home"
              >
                <Image
                  src="/nexavoris-logo.png"
                  alt="Nexavoris AI & ERP Systems"
                  width={190}
                  height={95}
                />
              </a>
              <button
                ref={closeButton}
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setOpen(false)}
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <nav
              aria-label="Complete website navigation"
              onClick={(event) => {
                if ((event.target as HTMLElement).closest('a')) setOpen(false);
              }}
            >
              <a href="/">Home</a>
              {groups.map((group) => (
                <details key={group.label}>
                  <summary>
                    {group.label}
                    <ChevronDown size={16} />
                  </summary>
                  <div>
                    {group.links.map(([label, href]) => (
                      <a key={href} href={href}>
                        {label}
                      </a>
                    ))}
                  </div>
                </details>
              ))}
              <a href="/pricing">Pricing</a>
              <a href="/about">About</a>
              <a href="/contact">Contact</a>
            </nav>
            <section className="mobile-member-promo">
              <span>FREE NEXAVORIS BUSINESS TOOLS</span>
              <h2>
                See how ready your business is for AI + ERP and receive your
                personalized recommendations.
              </h2>
              <a href="/assessment" onClick={() => setOpen(false)}>
                {signedIn
                  ? 'View My Business Assessment'
                  : 'Get My Free AI + ERP Assessment'}
              </a>
              <small>Free • No credit card required</small>
            </section>
            {accountHref ? (
  <section className="mobile-account-controls">
                <b>Account</b>
                {signedIn ? (
                  <>
                    <a href="/account">My Dashboard</a>
                    <a href="/account?tool=roadmap">My Roadmap</a>
                    <a href="/signout-with-chatgpt?return_to=%2F" target="_top">
                      Sign Out
                    </a>
                  </>
                ) : (
                  <>
                    <a href={accountHref} target="_top">
                      Sign In
                    </a>
                    <a href="/free-account">Create Free Account</a>
                  </>
                )}
              </section>
            ) : null}
            <section className="drawer-language">
              <b>Display language</b>
              <LanguageSelector />
            </section>
          </aside>
        </div>
      )}
    </>
  );
}

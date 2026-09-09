import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata(
  'Contact Nexavoris',
  'Discuss private AI, ERP, automation, equipment, or website design requirements with Nexavoris.',
  '/contact',
);

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { AssessmentTool } from '@/components/member-platform';
import { isLocale, type Locale } from '@/lib/i18n';
import { memberCopy } from '@/lib/member-copy';
import { localizedPageMetadata } from '@/lib/seo';
export async function generateMetadata():Promise<Metadata>{const h=await headers();const raw=h.get('x-nexavoris-locale');const locale:Locale=isLocale(raw)?raw:'en';const t=memberCopy[locale];return localizedPageMetadata(t.assessment,t.assessmentIntro,'/assessment',locale)}
export default async function AssessmentPage(){const h=await headers();const raw=h.get('x-nexavoris-locale');const locale:Locale=isLocale(raw)?raw:'en';return <main className="public-tool-page section-shell"><AssessmentTool locale={locale}/></main>}

import type { Metadata } from 'next';
import { cloneElement, isValidElement, type ReactNode } from 'react';
import HomePage from '@/app/page';
import AboutPage from '@/app/about/page';
import AiErpPage from '@/app/ai-erp/page';
import AiSolutionsPage from '@/app/ai-solutions/page';
import ContactPage from '@/components/contact-content';
import EquipmentPage from '@/app/equipment/page';
import ErpSolutionsPage from '@/app/erp-solutions/page';
import IndustriesPage from '@/app/industries/page';
import PricingPage from '@/app/pricing/page';
import WebsiteDesignPage from '@/app/website-design/page';
import { isLocale, loadMessages, translate, type Locale } from '@/lib/i18n';
import { localizedUrls, pageMetadata } from '@/lib/seo';

const pages = {
  '': HomePage,
  about: AboutPage,
  'ai-erp': AiErpPage,
  'ai-solutions': AiSolutionsPage,
  equipment: EquipmentPage,
  'erp-solutions': ErpSolutionsPage,
  industries: IndustriesPage,
  pricing: PricingPage,
  'website-design': WebsiteDesignPage,
};

const seo = {
  '': ['Nexavoris | AI & ERP Systems', 'Private enterprise AI, ERP implementation, and intelligent business automation for growing companies.'],
  about: ['About', 'Meet Nexavoris: practical AI, ERP, automation, and long-term technology partnership for operational businesses.'],
  'ai-erp': ['AI + ERP Integration', 'Connect private AI to live ERP data and controlled business workflows.'],
  'ai-solutions': ['Private Enterprise AI Solutions', 'Secure company knowledge AI, SOP search, document intelligence, and AI automation.'],
  contact: ['Contact Nexavoris', 'Discuss private AI, ERP, automation, equipment, or website design requirements with Nexavoris.'],
  equipment: ['Business Server Equipment', 'The practical on-premises server platforms Nexavoris recommends for Odoo ERP and private AI workloads.'],
  'erp-solutions': ['ERP Consulting & Implementation', 'ERP consulting, Odoo implementation, integration, migration, training, and support.'],
  industries: ['Industries', 'See how Nexavoris combines AI, ERP, and workflow automation for distribution, field service, construction, retail, manufacturing, and service companies.'],
  pricing: ['Pricing', 'Planning-level pricing for private enterprise AI, ERP implementation, and ongoing Nexavoris support.'],
  'website-design': ['Website Design Services & Pricing', 'Professional website design, ecommerce, integrations, and ongoing optimization with clear project pricing.'],
} as const;

type Params = { locale: string; slug?: string[] };

function routeKey(slug?: string[]) {
  return slug?.join('/') || '';
}

const structuralProps = new Set([
  'action',
  'className',
  'href',
  'id',
  'key',
  'method',
  'name',
  'rel',
  'src',
  'srcSet',
  'style',
  'target',
  'type',
]);

function localizeValue(
  value: unknown,
  messages: Record<string, string>,
  property?: string,
): unknown {
  if (structuralProps.has(property ?? '')) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? value.replace(trimmed, translate(messages, trimmed)) : value;
  }
  if (Array.isArray(value))
    return value.map((item) => localizeValue(item, messages, property));
  if (isValidElement(value)) {
    const props = Object.fromEntries(
      Object.entries(value.props as Record<string, unknown>).map(([key, item]) => [
        key,
        localizeValue(item, messages, key),
      ]),
    );
    return cloneElement(value, props);
  }
  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        localizeValue(item, messages, key),
      ]),
    );
  }
  return value;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const key = routeKey(slug) as keyof typeof seo;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : 'en';
  const messages = await loadMessages(locale);
  const [title, description] = seo[key] ?? seo[''];
  const path = key ? `/${key}` : '';
  const metadata = pageMetadata(translate(messages, title), translate(messages, description), path);
  const urls = localizedUrls(path);
  const canonical = locale === 'zh-cn' ? urls['zh-CN'] : locale === 'zh-tw' ? urls['zh-TW'] : urls.es;
  metadata.alternates = { canonical, languages: urls };
  if (metadata.openGraph) {
    metadata.openGraph.url = canonical;
    metadata.openGraph.locale = locale === 'zh-cn' ? 'zh_CN' : locale === 'zh-tw' ? 'zh_TW' : 'es_ES';
    metadata.openGraph.alternateLocale = locale === 'zh-cn'
      ? ['en_US', 'zh_TW', 'es_ES']
      : locale === 'zh-tw'
        ? ['en_US', 'zh_CN', 'es_ES']
        : ['en_US', 'zh_CN', 'zh_TW'];
  }
  if (key === '') metadata.title = { absolute: translate(messages, title) };
  return metadata;
}

export default async function LocalizedPage({ params }: { params: Promise<Params> }) {
  const { locale: rawLocale, slug } = await params;
  // Local fix: the origin casts to `keyof typeof pages`, which excludes 'contact',
  // making the `key === 'contact'` check below a type error. Widened here.
  const key = routeKey(slug) as keyof typeof pages | 'contact';
  const locale: Locale = isLocale(rawLocale) ? rawLocale : 'en';
  const messages = await loadMessages(locale);
  const content = key === 'contact' ? (
    <ContactPage messages={messages} />
  ) : (
    (pages[key as keyof typeof pages] ?? HomePage)()
  );
  return localizeValue(content, messages) as ReactNode;
}

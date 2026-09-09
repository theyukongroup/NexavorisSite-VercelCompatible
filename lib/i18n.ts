import { overrides } from '@/locales/overrides';
export const locales = ['en', 'zh-cn', 'zh-tw', 'es'] as const;
export type Locale = (typeof locales)[number];
export const localeLabels: Record<Locale, string> = {
  en: 'English',
  'zh-cn': '简体中文',
  'zh-tw': '繁體中文',
  es: 'Español',
};
export const languageTags: Record<Locale, string> = {
  en: 'en-US',
  'zh-cn': 'zh-CN',
  'zh-tw': 'zh-TW',
  es: 'es',
};
export function isLocale(value: string | null): value is Locale {
  return locales.includes(value as Locale);
}
export async function loadMessages(locale: Locale): Promise<Record<string, string>> {
  if (locale === 'en') return {};
  const catalog =
    locale === 'zh-cn'
      ? (await import('@/locales/zh-CN.json')).default
      : locale === 'zh-tw'
        ? (await import('@/locales/zh-TW.json')).default
        : (await import('@/locales/es.json')).default;
  return { ...catalog, ...overrides[locale] };
}
export function translate(messages: Record<string, string>, source: string) {
  return messages[source] || source;
}

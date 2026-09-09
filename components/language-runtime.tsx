'use client';
import { Globe2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  isLocale,
  languageTags,
  loadMessages,
  localeLabels,
  locales,
  translate,
  type Locale,
} from '@/lib/i18n';
import { SITE_URL } from '@/lib/seo';
const textSources = new WeakMap<Text, string>();
const attributeSources = new WeakMap<Element, Map<string, string>>();
const translatedAttributes = ['alt', 'aria-label', 'placeholder', 'title'];
let originalTitle = '';
let originalDescription = '';
function translateTree(
  locale: Locale,
  messages: Record<string, string>,
  root: Node = document.body,
) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (node.parentElement?.closest('script,style,[data-no-translate]'))
      continue;
    const source = textSources.get(node) ?? node.nodeValue ?? '';
    textSources.set(node, source);
    const trimmed = source.trim();
    if (trimmed)
      node.nodeValue = source.replace(trimmed, translate(messages, trimmed));
  }
  const elements =
    root instanceof Element
      ? [root, ...root.querySelectorAll('*')]
      : [...document.querySelectorAll('*')];
  for (const element of elements) {
    let sources = attributeSources.get(element);
    if (!sources) {
      sources = new Map();
      attributeSources.set(element, sources);
    }
    for (const attribute of translatedAttributes) {
      const current = element.getAttribute(attribute);
      if (!current) continue;
      const source = sources.get(attribute) ?? current;
      sources.set(attribute, source);
      element.setAttribute(attribute, translate(messages, source));
    }
    if (element instanceof HTMLAnchorElement) {
      const original =
        sources.get('href') ?? element.getAttribute('href') ?? '';
      sources.set('href', original);
      if (original.startsWith('/')) {
        const url = new URL(original, window.location.origin);
        if (locale === 'en') url.searchParams.delete('lang');
        else url.searchParams.set('lang', locale);
        element.setAttribute('href', `${url.pathname}${url.search}${url.hash}`);
      }
    }
  }
  document.documentElement.lang = languageTags[locale];
  originalTitle ||= document.title;
  document.title = translate(messages, originalTitle);
  const description = document.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  );
  if (description) {
    originalDescription ||= description.content;
    description.content = translate(messages, originalDescription);
  }
  for (const selector of [
    'meta[property="og:title"]',
    'meta[property="og:description"]',
    'meta[name="twitter:title"]',
    'meta[name="twitter:description"]',
  ]) {
    const meta = document.querySelector<HTMLMetaElement>(selector);
    if (!meta?.content) continue;
    let sources = attributeSources.get(meta);
    if (!sources) {
      sources = new Map();
      attributeSources.set(meta, sources);
    }
    const source = sources.get('content') ?? meta.content;
    sources.set('content', source);
    meta.content = translate(messages, source);
  }
  let canonical = document.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  const canonicalUrl = new URL(window.location.pathname, SITE_URL);
  if (locale === 'en') canonicalUrl.searchParams.delete('lang');
  else canonicalUrl.searchParams.set('lang', locale);
  canonical.href = canonicalUrl.toString();
  document
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((link) => link.remove());
  for (const code of [...locales, 'x-default'] as const) {
    const alternate = document.createElement('link');
    alternate.rel = 'alternate';
    alternate.hreflang =
      code === 'x-default' ? 'x-default' : languageTags[code];
    const url = new URL(window.location.pathname, SITE_URL);
    if (code !== 'en' && code !== 'x-default')
      url.searchParams.set('lang', code);
    alternate.href = url.toString();
    document.head.appendChild(alternate);
  }
}
function selectedLocale(): Locale {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (isLocale(fromUrl)) return fromUrl;
  const stored = window.localStorage.getItem('nexavoris-language');
  return isLocale(stored) ? stored : 'en';
}
export function LanguageRuntime() {
  useEffect(() => {
    let activeLocale: Locale = 'en';
    let activeMessages: Record<string, string> = {};
    let cancelled = false;
    const apply = async () => {
      const locale = selectedLocale();
      const messages = await loadMessages(locale);
      if (cancelled) return;
      activeLocale = locale;
      activeMessages = messages;
      translateTree(locale, messages);
    };
    void apply();
    const observer = new MutationObserver((records) => {
      for (const record of records)
        for (const added of record.addedNodes)
          translateTree(activeLocale, activeMessages, added);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);
  return null;
}
export function LanguageSelector() {
  const [locale, setLocale] = useState<Locale>('en');
  const selectorLabels: Record<Locale, string> = {
    en: 'Select display language',
    'zh-cn': '选择显示语言',
    'zh-tw': '選擇顯示語言',
    es: 'Seleccionar idioma de visualización',
  };
  useEffect(() => setLocale(selectedLocale()), []);
  const changeLanguage = (next: Locale) => {
    setLocale(next);
    window.localStorage.setItem('nexavoris-language', next);
    const url = new URL(window.location.href);
    if (next === 'en') url.searchParams.delete('lang');
    else url.searchParams.set('lang', next);
    window.location.assign(`${url.pathname}${url.search}${url.hash}`);
  };
  return (
    <label className="language-selector" data-no-translate>
      <Globe2 size={16} />
      <span className="sr-only">{selectorLabels[locale]}</span>
      <select
        value={locale}
        onChange={(event) => changeLanguage(event.target.value as Locale)}
        aria-label={selectorLabels[locale]}
      >
        {locales.map((code) => (
          <option value={code} key={code}>
            {localeLabels[code]}
          </option>
        ))}
      </select>
    </label>
  );
}

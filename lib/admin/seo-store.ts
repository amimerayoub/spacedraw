'use client';

// Shared data layer for the admin SEO/Languages modules.
// Base data is fetched from the committed static files under /data; admin edits
// are stored in the browser (publishing model) and merged on top. Nothing is
// written back to disk from the browser — use the Export module to deploy.

import { getItem, setItem } from '../storage';

export interface SeoSite {
  schemaVersion: number;
  siteName: string;
  siteUrl: string;
  siteUrlIsPlaceholder?: boolean;
  defaultLocale: string;
  xDefaultLocale: string;
  realMultiplayer: boolean;
  ogImage: string;
  twitterHandle?: string;
  organization?: { name: string; url: string; logo: string };
  notes?: string;
}

export interface SeoPage {
  key: string;
  path: string;
  status: 'published' | 'draft';
  perLocale: boolean;
  title: string;
  description: string;
}

export interface FaqItem { q: string; a: string; }

export interface SeoLocale {
  locale: string;
  hreflang: string;
  htmlLang: string;
  ogLocale: string;
  dir: 'ltr' | 'rtl';
  path: string;
  enabled: boolean;
  reviewStatus: 'draft' | 'reviewed';
  primary_keyword: string;
  secondary_keywords: string[];
  long_tail: string[];
  questions: string[];
  title: string;
  meta_description: string;
  h1: string;
  h2: string[];
  faq: FaqItem[];
  imageAlt: string;
  internalAnchors: string[];
  keyword_data: Array<{ keyword: string; intent?: string; volume_band?: string; difficulty?: string; confidence?: string; source?: string; future?: boolean }>;
  ogImage?: string;
}

export interface SeoOverrides {
  site?: Partial<SeoSite>;
  locales?: Record<string, Partial<SeoLocale>>;
  i18n?: Record<string, Record<string, unknown>>;
  updatedAt?: Record<string, string>;
}

export interface SeoData {
  site: SeoSite;
  pages: SeoPage[];
  locales: SeoLocale[];
  i18n: Record<string, Record<string, unknown>>;
}

const OVERRIDES_KEY = 'seo:overrides';

export function getOverrides(): SeoOverrides {
  return getItem<SeoOverrides>(OVERRIDES_KEY, {});
}

export function saveOverrides(next: SeoOverrides): void {
  setItem<SeoOverrides>(OVERRIDES_KEY, next);
}

export function updateOverrides(mutator: (draft: SeoOverrides) => void): SeoOverrides {
  const draft = JSON.parse(JSON.stringify(getOverrides())) as SeoOverrides;
  mutator(draft);
  saveOverrides(draft);
  return draft;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return (await res.json()) as T;
}

// Load committed data + merge browser overrides. i18n is fetched per locale.
export async function loadSeoData(): Promise<SeoData> {
  const [siteBase, pagesBase, localesBase] = await Promise.all([
    fetchJson<SeoSite>('/data/seo/site.json'),
    fetchJson<{ pages: SeoPage[] }>('/data/seo/pages.json'),
    fetchJson<{ locales: SeoLocale[] }>('/data/seo/locales.json'),
  ]);

  const ov = getOverrides();
  const site: SeoSite = { ...siteBase, ...(ov.site || {}) };

  const locales: SeoLocale[] = localesBase.locales.map((l) => ({ ...l, ...(ov.locales?.[l.locale] || {}) }));

  const i18n: Record<string, Record<string, unknown>> = {};
  await Promise.all(
    localesBase.locales.map(async (l) => {
      try {
        const base = await fetchJson<Record<string, unknown>>(`/data/i18n/home.${l.locale}.json`);
        i18n[l.locale] = { ...base, ...(ov.i18n?.[l.locale] || {}) };
      } catch {
        i18n[l.locale] = {};
      }
    })
  );

  return { site, pages: pagesBase.pages, locales, i18n };
}

export function isSiteUrlReal(site: SeoSite): boolean {
  const u = (site.siteUrl || '').trim();
  if (!u) return false;
  if (!/^https?:\/\//.test(u)) return false;
  if (u.includes('example.com') || u.includes('localhost') || u.includes('SITE_URL')) return false;
  return true;
}

export function touchLocale(locale: string): void {
  updateOverrides((d) => {
    d.updatedAt = d.updatedAt || {};
    d.updatedAt[locale] = new Date().toISOString();
  });
}

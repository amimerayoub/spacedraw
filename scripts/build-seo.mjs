// Static SEO build. Reads public/data/*, renders the root + 8 locale pages,
// per-locale sitemaps, sitemap-index, robots.txt and an OG placeholder PNG.
// Runs a validation gate (lengths, forbidden terms, required tags) and exits
// non-zero on hard failures. Node ESM; imports the same pure modules the Admin
// export uses, so committed files == exported files.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

import { renderHome, buildAlternates } from '../public/js/seo/render-page.js';
import { renderSitemapIndex, renderLocaleSitemap, renderRobots, sitemapFileName } from '../public/js/seo/sitemap.js';
import { findForbiddenTerms, futureKeywords, checkLengths, checkKeywordPlacement, FORBIDDEN_COMPETITORS } from '../public/js/seo/validate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const DATA = path.join(PUB, 'data');

const BUILD_DATE = new Date().toISOString().slice(0, 10);

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function slug(locale) { return locale.path.replace(/\//g, '') || locale.locale.toLowerCase(); }

// ---------- OG placeholder PNG (monochrome, no text, dependency-free) ----------
function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
function writePng(file, w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(file, png);
}
function makeOgImage(file) {
  const w = 1200, h = 630;
  const rgba = Buffer.alloc(w * h * 4);
  const cx = w / 2, cy = h / 2, R = 190;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const t = y / h;
      let v = Math.round(12 - 12 * t); // #0c -> #00 vertical gradient
      // vignette
      const dx = (x - cx) / (w / 2), dy = (y - cy) / (h / 2);
      const vig = 1 - Math.min(1, Math.sqrt(dx * dx + dy * dy) * 0.5);
      v = Math.round(v * (0.5 + 0.5 * vig));
      let r = v, g = v, b = v, a = 255;
      // inset border frame (2px, subtle white)
      const inset = 44;
      if ((x >= inset && x < inset + 2 && y >= inset && y < h - inset) ||
          (x >= w - inset - 2 && x < w - inset && y >= inset && y < h - inset) ||
          (y >= inset && y < inset + 2 && x >= inset && x < w - inset) ||
          (y >= h - inset - 2 && y < h - inset && x >= inset && x < w - inset)) {
        r = g = b = 60;
      }
      // circle outline motif (the "drawing")
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (Math.abs(d - R) < 2.2) { r = g = b = 235; }
      // diagonal stroke accent
      const s = (x - (cx - 260)) - (y - (cy + 120)) * -1.4;
      if (Math.abs(s) < 2 && x > cx - 260 && x < cx + 120 && y > cy - 40) { r = g = b = 200; }
      const i = (y * w + x) * 4;
      rgba[i] = r; rgba[i + 1] = g; rgba[i + 2] = b; rgba[i + 3] = a;
    }
  }
  ensureDir(path.dirname(file));
  writePng(file, w, h, rgba);
}

// ---------- Build ----------
const site = readJson(path.join(DATA, 'seo', 'site.json'));
const pagesData = readJson(path.join(DATA, 'seo', 'pages.json')).pages;
const localesAll = readJson(path.join(DATA, 'seo', 'locales.json')).locales;
const enabledLocales = localesAll.filter((l) => l.enabled !== false);
const cssText = fs.readFileSync(path.join(PUB, 'assets', 'css', 'marketing.css'), 'utf8');

function loadI18n(locale) {
  const p = path.join(DATA, 'i18n', `home.${locale.locale}.json`);
  return readJson(p);
}

const problems = [];
const warnings = [];
const written = [];

// OG placeholder
const ogPath = path.join(PUB, site.ogImage.replace(/^\//, '').split('/').join(path.sep));
if (!fs.existsSync(ogPath)) {
  makeOgImage(ogPath);
  written.push(path.relative(ROOT, ogPath));
}

function validatePage(locale, html, i18n) {
  const L = checkLengths(locale.title, locale.meta_description);
  if (!L.titleOK) problems.push(`${locale.locale}: title ${L.titleLen} chars (> ${60})`);
  if (!L.metaOK) problems.push(`${locale.locale}: meta ${L.metaLen} chars (> ${155})`);

  // Forbidden future keywords + competitor/trademark terms anywhere in the page.
  const hits = findForbiddenTerms(html, { future: futureKeywords(locale), realMultiplayer: !!site.realMultiplayer });
  for (const h of hits) problems.push(`${locale.locale}: forbidden ${h.kind} term "${h.term}" present in page`);

  // Required structural tags.
  const need = [
    ['<h1', /<h1[\s>]/i],
    ['canonical', /<link rel="canonical"/i],
    ['x-default', /hreflang="x-default"/i],
    ['og:title', /property="og:title"/i],
    ['JSON-LD FAQPage', /"@type":"FAQPage"/],
    ['JSON-LD VideoGame', /"@type":\["WebApplication","VideoGame"\]/],
    [`dir="${locale.dir}"`, new RegExp(`dir="${locale.dir}"`, 'i')],
    [`lang="${locale.htmlLang}"`, new RegExp(`lang="${locale.htmlLang}"`, 'i')],
  ];
  for (const [label, re] of need) if (!re.test(html)) problems.push(`${locale.locale}: missing ${label}`);

  // Exactly one H1.
  const h1count = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1count !== 1) problems.push(`${locale.locale}: expected 1 <h1>, found ${h1count}`);

  // FAQ JSON-LD count matches visible FAQ count.
  const faqCount = (locale.faq || []).length;
  const detailsCount = (html.match(/<details class="sd-faq-item">/g) || []).length;
  if (detailsCount !== faqCount) problems.push(`${locale.locale}: ${detailsCount} <details> vs ${faqCount} FAQ entries`);

  // Keyword placement (advisory).
  const kp = checkKeywordPlacement({
    primary: locale.primary_keyword, title: locale.title, meta: locale.meta_description,
    h1: locale.h1, h2: locale.h2, intro: (i18n.hero && i18n.hero.intro) || '',
  });
  const miss = Object.entries(kp).filter(([, v]) => !v).map(([k]) => k);
  if (miss.length) warnings.push(`${locale.locale}: primary keyword not in [${miss.join(', ')}] (advisory)`);
}

// Root page = en-US content, canonical -> /en-us/
const enUs = enabledLocales.find((l) => l.locale === 'en-US');
if (!enUs) {
  problems.push('en-US locale missing or disabled; cannot build root alias');
} else {
  const i18n = loadI18n(enUs);
  const html = renderHome({ site, locale: enUs, i18n, locales: enabledLocales, buildDate: BUILD_DATE, isRoot: true, cssText });
  fs.writeFileSync(path.join(PUB, 'index.html'), html, 'utf8');
  written.push('public/index.html');
  validatePage(enUs, html, i18n);
}

// Per-locale pages
for (const locale of enabledLocales) {
  const i18n = loadI18n(locale);
  const html = renderHome({ site, locale, i18n, locales: enabledLocales, buildDate: BUILD_DATE, isRoot: false, cssText });
  const dir = path.join(PUB, slug(locale));
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
  written.push(`public/${slug(locale)}/index.html`);
  validatePage(locale, html, i18n);
}

// Sitemaps
fs.writeFileSync(path.join(PUB, 'sitemap-index.xml'), renderSitemapIndex(enabledLocales, site.siteUrl, BUILD_DATE), 'utf8');
written.push('public/sitemap-index.xml');
for (const locale of enabledLocales) {
  const xml = renderLocaleSitemap(locale, enabledLocales, site.siteUrl, pagesData, BUILD_DATE);
  const name = sitemapFileName(locale);
  fs.writeFileSync(path.join(PUB, name), xml, 'utf8');
  written.push(`public/${name}`);
}

// robots.txt
fs.writeFileSync(path.join(PUB, 'robots.txt'), renderRobots(site.siteUrl), 'utf8');
written.push('public/robots.txt');

// ---------- Report ----------
console.log(`\nBuilt ${written.length} files (siteUrl=${site.siteUrl}${site.siteUrlIsPlaceholder ? ' [PLACEHOLDER]' : ''}, realMultiplayer=${site.realMultiplayer}):\n`);
for (const w of written) console.log('  + ' + w);

if (site.siteUrlIsPlaceholder) {
  warnings.push('siteUrl is the placeholder https://example.com — set a real URL before deploying/exporting.');
}
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings) console.log('  ! ' + w);
}
if (problems.length) {
  console.log(`\nERRORS (${problems.length}):`);
  for (const p of problems) console.log('  x ' + p);
  process.exit(1);
}
console.log('\nValidation gate passed: no forbidden terms, lengths OK, structure OK.\n');

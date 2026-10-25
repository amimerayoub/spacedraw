// Pure home-page renderer. No DOM, no fetch, no I/O.
// renderHome(ctx) -> complete HTML string. Used by both the Node static build
// (scripts/build-seo.mjs) and the browser Admin > Export module, so exported
// files are byte-identical to the committed ones.

import { futureKeywords } from './validate.js';

const DISPLAY_FONT_HREF = '/assets/fonts/SpaceDrawDisplay-Bold.woff2';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function trimSlash(u) {
  return String(u || '').replace(/\/+$/, '');
}

// Full hreflang alternate set (locales + en/pt catch-alls + x-default), reciprocal.
export function buildAlternates(locales, siteUrl) {
  const base = trimSlash(siteUrl);
  const enabled = locales.filter((l) => l.enabled !== false);
  const alts = enabled.map((l) => ({ hreflang: l.hreflang, href: base + l.path }));
  const enUs = enabled.find((l) => l.locale === 'en-US');
  const ptBr = enabled.find((l) => l.locale === 'pt-BR');
  if (enUs) alts.push({ hreflang: 'en', href: base + enUs.path });
  if (ptBr) alts.push({ hreflang: 'pt', href: base + ptBr.path });
  if (enUs) alts.push({ hreflang: 'x-default', href: base + enUs.path });
  // de-dupe by hreflang, keep first
  const seen = new Set();
  return alts.filter((a) => (seen.has(a.hreflang) ? false : (seen.add(a.hreflang), true)));
}

function heroSvg(a11yLabel) {
  // Monochrome glass drawing board with a looping sample stroke (CSS-animated).
  return `<svg class="sd-hero-svg" viewBox="0 0 320 200" role="img" aria-label="${esc(a11yLabel)}" width="320" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="6" width="308" height="188" rx="18" class="sd-board"/>
  <circle cx="26" cy="26" r="4" class="sd-dot"/><circle cx="42" cy="26" r="4" class="sd-dot"/><circle cx="58" cy="26" r="4" class="sd-dot"/>
  <rect x="200" y="18" width="96" height="14" rx="7" class="sd-chip"/>
  <path class="sd-stroke" d="M60 150 C 90 60, 130 60, 150 110 S 200 170, 230 90 L 260 60"/>
  <circle class="sd-nib" r="5" cx="60" cy="150"/>
</svg>`;
}

function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

export function renderHome(ctx) {
  const { site, locale, i18n, locales, buildDate, isRoot, cssText } = ctx;
  const base = trimSlash(site.siteUrl);
  const enabled = locales.filter((l) => l.enabled !== false);
  const alts = buildAlternates(locales, site.siteUrl);

  const selfPath = locale.path; // e.g. /fr/
  const canonical = isRoot ? base + '/en-us/' : base + selfPath;
  const ogImage = base + (locale.ogImage || site.ogImage || '/assets/og/og-default.png');
  const langAttr = locale.htmlLang || locale.hreflang;
  const dir = locale.dir || 'ltr';
  const playHref = `/play/?lang=${encodeURIComponent(locale.locale)}`;

  const nav = i18n.nav || {};
  const hero = i18n.hero || {};
  const a11y = i18ySafe(i18n.a11y);
  const footer = i18n.footer || {};
  const words = i18n.words || {};
  const how = i18n.howItWorks || {};
  const feats = i18n.features || {};

  const h2 = locale.h2 || [];
  const faq = locale.faq || [];
  const steps = how.steps || [];
  const cards = feats.cards || [];

  // --- JSON-LD ---
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.siteName,
    url: base + '/',
    inLanguage: locale.hreflang,
  };
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: (site.organization && site.organization.name) || site.siteName,
    url: (site.organization && site.organization.url) || base + '/',
    logo: base + ((site.organization && site.organization.logo) || site.ogImage || '/assets/og/og-default.png'),
  };
  const appLd = {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'VideoGame'],
    name: site.siteName,
    url: base + selfPath,
    description: locale.meta_description,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any modern web browser (desktop and mobile)',
    inLanguage: locale.hreflang,
    image: ogImage,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    featureList: [
      (i18n.trust || []).join(', '),
    ].filter(Boolean),
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  // --- hreflang + og alternates ---
  const hreflangTags = alts.map((a) => `  <link rel="alternate" hreflang="${esc(a.hreflang)}" href="${esc(a.href)}">`).join('\n');
  const ogAlts = enabled
    .filter((l) => l.locale !== locale.locale && l.ogLocale)
    .map((l) => `  <meta property="og:locale:alternate" content="${esc(l.ogLocale)}">`)
    .join('\n');

  // --- Body sections ---
  const trustChips = (i18n.trust || []).map((t) => `<li class="sd-chip-item">${esc(t)}</li>`).join('');

  const stepsHtml = steps
    .map((s, idx) => `<li class="sd-step">
        <span class="sd-step-num" aria-hidden="true">${idx + 1}</span>
        <h3 class="sd-step-title">${esc(s.title)}</h3>
        <p class="sd-step-body">${esc(s.body)}</p>
      </li>`)
    .join('');

  const cardsHtml = cards
    .map((c) => `<article class="sd-card glass">
        <h3 class="sd-card-title">${esc(c.title)}</h3>
        <p class="sd-card-body">${esc(c.body)}</p>
      </article>`)
    .join('');

  const categoriesHtml = (words.categories || [])
    .map((cat) => `<div class="sd-cat">
        <h3 class="sd-cat-name">${esc(cat.name)}</h3>
        <ul class="sd-cat-words">${(cat.sampleWords || []).map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
      </div>`)
    .join('');

  const faqHtml = faq
    .map((f) => `<details class="sd-faq-item">
        <summary>${esc(f.q)}</summary>
        <p class="sd-faq-a">${esc(f.a)}</p>
      </details>`)
    .join('');

  const anchors = locale.internalAnchors || [];

  // Footer links: only link URLs that resolve today. Draft pages render as text.
  const footerLinks = `<ul class="sd-footer-links">
      <li><a href="${esc(playHref)}">${esc(nav.play || 'Play')}</a></li>
      <li><a href="#how-it-works">${esc(anchors[0] || nav.howToPlay || 'How it works')}</a></li>
      <li><a href="#word-packs">${esc(anchors[1] || nav.wordLists || 'Word lists')}</a></li>
      <li><a href="#faq">${esc(h2[5] || 'FAQ')}</a></li>
    </ul>`;

  const fontPreload =
    langAttr === 'en-US' || langAttr === 'en-GB'
      ? `  <link rel="preload" as="font" type="font/woff2" href="${DISPLAY_FONT_HREF}" crossorigin>\n`
      : '';

  const html = `<!doctype html>
<html lang="${esc(langAttr)}" dir="${esc(dir)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(locale.title)}</title>
  <meta name="description" content="${esc(locale.meta_description)}">
  <link rel="canonical" href="${esc(canonical)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
${hreflangTags}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(site.siteName)}">
  <meta property="og:title" content="${esc(locale.title)}">
  <meta property="og:description" content="${esc(locale.meta_description)}">
  <meta property="og:url" content="${esc(base + selfPath)}">
  <meta property="og:locale" content="${esc(locale.ogLocale)}">
${ogAlts}
  <meta property="og:image" content="${esc(ogImage)}">
  <meta property="og:image:alt" content="${esc(locale.imageAlt || '')}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(locale.title)}">
  <meta name="twitter:description" content="${esc(locale.meta_description)}">
  <meta name="twitter:image" content="${esc(ogImage)}">
${site.twitterHandle ? `  <meta name="twitter:site" content="${esc(site.twitterHandle)}">\n` : ''}  <meta name="theme-color" content="#000000">
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
${fontPreload}  <style>
${cssText || ''}
  </style>
  ${jsonLd(websiteLd)}
  ${jsonLd(orgLd)}
  ${jsonLd(appLd)}
  ${jsonLd(faqLd)}
</head>
<body>
  <a class="sd-skip" href="#main">${esc(a11y.skipToContent)}</a>

  <header class="sd-header glass">
    <div class="sd-header-inner">
      <a class="sd-wordmark" href="${esc(playHref)}" aria-label="${esc(a11y.playLink)}">${esc(site.siteName)}</a>
      <nav class="sd-nav" aria-label="${esc(nav.howToPlay || 'Main')}">
        <a href="#how-it-works">${esc(nav.howToPlay || 'How it works')}</a>
        <a href="#word-packs">${esc(nav.wordLists || 'Word packs')}</a>
        <a href="#faq">${esc(h2[5] || 'FAQ')}</a>
      </nav>
      <a class="sd-btn sd-btn-primary" href="${esc(playHref)}">${esc(nav.play || 'Play now')}</a>
    </div>
  </header>

  <main id="main" class="sd-main">
    <section class="sd-hero">
      <div class="sd-hero-copy">
        <p class="sd-eyebrow">${esc(hero.eyebrow || '')}</p>
        <h1 class="sd-h1">${esc(locale.h1)}</h1>
        <p class="sd-intro">${esc(hero.intro || hero.note || '')}</p>
        <div class="sd-cta-row">
          <a class="sd-btn sd-btn-primary" href="${esc(playHref)}">${esc(hero.ctaPrimary || 'Play now')}</a>
          <a class="sd-btn sd-btn-ghost" href="${esc(playHref)}&mode=room">${esc(i18n.rooms && i18n.rooms.cta ? i18n.rooms.cta : 'Create room')}</a>
        </div>
        <p class="sd-demo-note">${esc(hero.note || '')}</p>
        <ul class="sd-trust">${trustChips}</ul>
      </div>
      <div class="sd-hero-preview glass">
        ${heroSvg(a11y.drawingCanvasAlt || 'Drawing board preview')}
      </div>
    </section>

    <section id="how-it-works" class="sd-section">
      <h2 class="sd-h2">${esc(h2[0] || '')}</h2>
      <ol class="sd-steps">${stepsHtml}</ol>
    </section>

    <section id="practice" class="sd-section">
      <h2 class="sd-h2">${esc(h2[1] || '')}</h2>
      <p class="sd-para">${esc(feats.cards && feats.cards[0] ? feats.cards[0].body : '')}</p>
      <a class="sd-btn sd-btn-ghost" href="${esc(playHref)}">${esc(i18n.practice && i18n.practice.cta ? i18n.practice.cta : '')}</a>
    </section>

    <section id="rooms" class="sd-section">
      <h2 class="sd-h2">${esc(h2[2] || '')}</h2>
      <p class="sd-para">${esc(i18n.rooms && i18n.rooms.body ? i18n.rooms.body : '')}</p>
      <div class="sd-cards">${cardsHtml}</div>
    </section>

    <section id="word-packs" class="sd-section">
      <h2 class="sd-h2">${esc(h2[3] || '')}</h2>
      <p class="sd-note">${esc(words.note || '')}</p>
      <div class="sd-cats">${categoriesHtml}</div>
    </section>

    <section id="mobile" class="sd-section">
      <h2 class="sd-h2">${esc(h2[4] || '')}</h2>
      <p class="sd-para">${esc(i18n.mobile && i18n.mobile.body ? i18n.mobile.body : '')}</p>
    </section>

    <section id="faq" class="sd-section">
      <h2 class="sd-h2">${esc(h2[5] || '')}</h2>
      <p class="sd-note">${esc(i18n.faq && i18n.faq.note ? i18n.faq.note : '')}</p>
      <div class="sd-faq">${faqHtml}</div>
    </section>
  </main>

  <footer class="sd-footer glass">
    <div class="sd-footer-inner">
      <span class="sd-wordmark sd-wordmark-sm">${esc(site.siteName)}</span>
      <p class="sd-tagline">${esc(footer.tagline || '')}</p>
      ${footerLinks}
      <p class="sd-lang-note">${esc(footer.languageNote || '')}</p>
      <p class="sd-legal">${esc(footer.legal || '')}</p>
    </div>
  </footer>
</body>
</html>
`;
  return html;
}

function i18ySafe(a) {
  return a || { skipToContent: 'Skip to content', drawingCanvasAlt: 'Drawing board preview', playLink: 'Play', openMenu: 'Menu' };
}

// Convenience: forbidden terms for a given locale (used by the build gate + admin guard).
export function localeForbidden(locale, site) {
  return futureKeywords(locale).concat(site && site.realMultiplayer ? [] : []);
}

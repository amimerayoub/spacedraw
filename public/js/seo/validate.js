// Shared, pure SEO validation helpers.
// Runs in the browser (admin audit / export) and in Node (static build gate).
// No DOM access at import time; DOM-based checks receive a parsed Document.

export const TITLE_MAX = 60;
export const META_MAX = 155;

// Competitor / trademarked terms that must never appear in public copy.
export const FORBIDDEN_COMPETITORS = [
  'skribbl', 'gartic', 'drawize', 'pinturillo', 'drawasaurus', 'drawasaur',
  'poki', 'crazygames', 'quick, draw', 'quick draw!', 'teamretro', 'dibujados',
  'letsdraw', "let's draw", 'scribble it', 'sketchful', 'gartic phone',
  // TV-show / trademarked genre terms called out in the research
  'montagsmaler', "dessiner, c'est gagne", "dessiner c'est gagne", "dessiner, c'est gagné",
  'doodleduel',
];

// Normalize for case/diacritic-insensitive substring matching.
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Keywords flagged future:true in the research are forbidden while realMultiplayer is off.
export function futureKeywords(locale) {
  return (locale.keyword_data || []).filter((k) => k.future).map((k) => k.keyword);
}

// Scan arbitrary visible/serialized text for forbidden phrases.
// Returns [{ term, kind }] where kind is 'future' | 'competitor'.
export function findForbiddenTerms(text, { future = [], realMultiplayer = false } = {}) {
  const hay = norm(text);
  const hits = [];
  if (!realMultiplayer) {
    for (const kw of future) {
      if (kw && hay.includes(norm(kw))) hits.push({ term: kw, kind: 'future' });
    }
  }
  for (const c of FORBIDDEN_COMPETITORS) {
    if (hay.includes(norm(c))) hits.push({ term: c, kind: 'competitor' });
  }
  return hits;
}

export function checkLengths(title, meta) {
  const titleLen = [...String(title || '')].length;
  const metaLen = [...String(meta || '')].length;
  return {
    titleLen,
    metaLen,
    titleOK: titleLen > 0 && titleLen <= TITLE_MAX,
    metaOK: metaLen > 0 && metaLen <= META_MAX,
  };
}

// Is the primary keyword present in the five key placements?
export function checkKeywordPlacement({ primary, title, meta, h1, h2 = [], intro }) {
  const p = norm(primary);
  const inH2 = (h2 || []).some((x) => norm(x).includes(p));
  return {
    inTitle: norm(title).includes(p),
    inMeta: norm(meta).includes(p),
    inH1: norm(h1).includes(p),
    inIntro: norm(intro).includes(p),
    inOneH2: inH2,
  };
}

// Completeness of a locale + its interface strings, as a percentage and missing list.
export function checkCompleteness(locale, i18n) {
  const missing = [];
  const req = [
    ['title', locale.title],
    ['meta_description', locale.meta_description],
    ['h1', locale.h1],
    ['imageAlt', locale.imageAlt],
  ];
  for (const [name, val] of req) if (!val) missing.push(name);
  if (!Array.isArray(locale.h2) || locale.h2.length < 6) missing.push('h2 (need 6)');
  if (!Array.isArray(locale.faq) || locale.faq.length < 5) missing.push('faq (need 5)');
  if (!Array.isArray(locale.internalAnchors) || locale.internalAnchors.length < 3) missing.push('internalAnchors');
  const i = i18n || {};
  const iReq = [
    ['nav', i.nav], ['hero.intro', i.hero && i.hero.intro], ['hero.ctaPrimary', i.hero && i.hero.ctaPrimary],
    ['howItWorks.steps', i.howItWorks && i.howItWorks.steps], ['features.cards', i.features && i.features.cards],
    ['words.categories', i.words && i.words.categories], ['footer', i.footer], ['a11y', i.a11y],
  ];
  for (const [name, val] of iReq) if (!val) missing.push('i18n.' + name);

  const total = req.length + 4 + iReq.length; // 4 array checks folded above
  const present = total - missing.length;
  return { percent: Math.round((present / total) * 100), missing };
}

// ---- DOM-based audit (browser). Accepts a parsed Document. ----

// Reciprocal-hreflang + core on-page checks against a real DOM node.
export function auditDocument(doc, ctx = {}) {
  const results = [];
  const push = (check, pass, message, fix) => results.push({ check, pass, message, fix });
  const q = (sel) => doc.querySelector(sel);
  const qa = (sel) => Array.from(doc.querySelectorAll(sel));

  // One H1
  const h1s = qa('h1');
  push('single-h1', h1s.length === 1, `Found ${h1s.length} <h1> element(s).`, 'Ensure exactly one H1 per page.');

  // Title / meta length
  const title = q('title') ? q('title').textContent : '';
  const metaDesc = q('meta[name="description"]');
  const meta = metaDesc ? metaDesc.getAttribute('content') : '';
  const L = checkLengths(title, meta);
  push('title-length', L.titleOK, `Title is ${L.titleLen} chars (max ${TITLE_MAX}).`, 'Shorten the title.');
  push('meta-length', L.metaOK, `Meta description is ${L.metaLen} chars (max ${META_MAX}).`, 'Shorten the meta description.');

  // Canonical absolute + self-referencing
  const canon = q('link[rel="canonical"]');
  const canonHref = canon ? canon.getAttribute('href') : '';
  const isAbs = /^https?:\/\//.test(canonHref);
  push('canonical-absolute', isAbs, `Canonical: ${canonHref || '(missing)'}.`, 'Use an absolute URL derived from siteUrl.');
  if (ctx.expectedCanonical) {
    const selfOK = canonHref === ctx.expectedCanonical;
    push('canonical-self', selfOK, selfOK ? `Canonical self-references ${canonHref}.` : `Canonical ${canonHref} != expected ${ctx.expectedCanonical}.`, 'Point canonical at this page (or the root alias target).');
  }

  // html lang + dir
  const html = q('html');
  const lang = html ? html.getAttribute('lang') : '';
  const dir = html ? html.getAttribute('dir') : '';
  push('html-lang', !!lang, `html lang="${lang}".`, 'Set the correct htmlLang.');
  if (ctx.expectedDir) push('html-dir', dir === ctx.expectedDir, `html dir="${dir}" (expected ${ctx.expectedDir}).`, 'Set dir for RTL.');

  // hreflang reciprocity
  const alts = qa('link[rel="alternate"][hreflang]').map((l) => l.getAttribute('hreflang'));
  const hasXDefault = alts.includes('x-default');
  push('hreflang-x-default', hasXDefault, `hreflang set: ${alts.join(', ') || '(none)'}.`, 'Add x-default and all enabled locales.');
  if (ctx.expectedHreflangs) {
    const missingHl = ctx.expectedHreflangs.filter((h) => !alts.includes(h));
    push('hreflang-complete', missingHl.length === 0, missingHl.length ? `Missing hreflang: ${missingHl.join(', ')}.` : 'All expected hreflang present.', 'Add the missing alternates.');
  }

  // JSON-LD parse + FAQ match
  const ldBlocks = qa('script[type="application/ld+json"]');
  let faqLd = null;
  let ldValid = true;
  for (const b of ldBlocks) {
    try {
      const parsed = JSON.parse(b.textContent);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of arr) {
        if (node && (node['@type'] === 'FAQPage' || (Array.isArray(node['@type']) && node['@type'].includes('FAQPage')))) faqLd = node;
      }
    } catch (e) {
      ldValid = false;
    }
  }
  push('jsonld-valid', ldValid && ldBlocks.length > 0, ldValid ? `${ldBlocks.length} JSON-LD block(s) parse as JSON.` : 'A JSON-LD block failed to parse.', 'Emit valid JSON only.');

  // FAQ JSON-LD equals visible FAQ
  const visibleFaq = qa('#faq details').map((d) => ({
    q: (d.querySelector('summary') || {}).textContent || '',
    a: (d.querySelector('.sd-faq-a') || {}).textContent || '',
  }));
  if (faqLd && Array.isArray(faqLd.mainEntity)) {
    const ldQ = faqLd.mainEntity.map((m) => (m.name || '').trim());
    const visQ = visibleFaq.map((v) => v.q.trim());
    const same = ldQ.length === visQ.length && ldQ.every((x, i) => x === visQ[i]);
    push('faq-match', same, same ? 'JSON-LD FAQ matches visible FAQ.' : 'JSON-LD FAQ differs from visible FAQ.', 'Keep structured data identical to visible text.');
  } else {
    push('faq-match', false, 'No FAQPage structured data found.', 'Add FAQPage JSON-LD matching the visible FAQ.');
  }

  // Images alt + dimensions (skip inline SVG preview)
  const imgs = qa('img');
  const imgIssues = imgs.filter((im) => !im.hasAttribute('alt') || (!im.getAttribute('width') && im.getAttribute('loading') !== 'eager'));
  push('images-alt-dims', imgIssues.length === 0, imgIssues.length ? `${imgIssues.length} image(s) missing alt/width.` : `${imgs.length} image(s) OK.`, 'Add alt, width and height to every img.');

  return results;
}

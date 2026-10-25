// Pure sitemap + robots renderers. Shared by the Node build and the Admin export.

function trimSlash(u) {
  return String(u || '').replace(/\/+$/, '');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// sitemap-index.xml -> one sitemap per enabled locale.
export function renderSitemapIndex(locales, siteUrl, lastmod = today()) {
  const base = trimSlash(siteUrl);
  const enabled = locales.filter((l) => l.enabled !== false);
  const entries = enabled
    .map((l) => {
      const file = `sitemap-${l.path.replace(/\//g, '') || l.locale.toLowerCase()}.xml`;
      return `  <sitemap>\n    <loc>${base}/${file}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
}

// sitemap-<locale>.xml -> published URLs for one locale, with reciprocal xhtml:link alternates.
export function renderLocaleSitemap(locale, locales, siteUrl, pages, lastmod = today()) {
  const base = trimSlash(siteUrl);
  const enabled = locales.filter((l) => l.enabled !== false);
  const published = (pages || []).filter((p) => p.status === 'published');

  // Absolute URL of a given page inside a locale folder, always trailing-slashed
  // so sitemap alternates match each page's self-canonical exactly.
  function urlFor(locale, pagePath) {
    const root = `${base}${locale.path}`; // e.g. https://site/fr/
    if (pagePath === '/') return root;
    return `${root.replace(/\/$/, '')}${pagePath}`;
  }

  // Reciprocal alternates for one page across every enabled locale + catch-alls + x-default.
  function alternatesFor(pagePath) {
    const links = enabled.map((l) => `      <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${urlFor(l, pagePath)}"/>`);
    const enUs = enabled.find((l) => l.locale === 'en-US');
    const ptBr = enabled.find((l) => l.locale === 'pt-BR');
    if (enUs) links.push(`      <xhtml:link rel="alternate" hreflang="en" href="${urlFor(enUs, pagePath)}"/>`);
    if (ptBr) links.push(`      <xhtml:link rel="alternate" hreflang="pt" href="${urlFor(ptBr, pagePath)}"/>`);
    if (enUs) links.push(`      <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(enUs, pagePath)}"/>`);
    return links.join('\n');
  }

  const urls = published
    .map((p) => {
      const loc = urlFor(locale, p.path);
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternatesFor(p.path)}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

export function renderRobots(siteUrl, adminPath = '/admin') {
  const base = trimSlash(siteUrl);
  return `User-agent: *\nAllow: /\nDisallow: ${adminPath}\nDisallow: /play\n\nSitemap: ${base}/sitemap-index.xml\n`;
}

export function sitemapFileName(locale) {
  return `sitemap-${locale.path.replace(/\//g, '') || locale.locale.toLowerCase()}.xml`;
}

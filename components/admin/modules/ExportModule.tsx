'use client';

import React from 'react';
import { Download, Package, Save, AlertTriangle, CheckCircle2, FileCode2, Loader2 } from 'lucide-react';
import { AdminRole, can } from '../../../lib/admin/permissions';
import { playSound, play } from '../../../lib/sound';
import {
  loadSeoData, updateOverrides, SeoData, isSiteUrlReal, SeoSite,
} from '../../../lib/admin/seo-store';

interface Renderer {
  renderHome(ctx: Record<string, unknown>): string;
}
interface Sitemapper {
  renderSitemapIndex(locales: unknown[], siteUrl: string, lastmod?: string): string;
  renderLocaleSitemap(locale: unknown, locales: unknown[], siteUrl: string, pages: unknown[], lastmod?: string): string;
  renderRobots(siteUrl: string, adminPath?: string): string;
  sitemapFileName(locale: { path: string; locale: string }): string;
}

interface ExportModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

interface BuiltFile { path: string; content: string; kind: 'html' | 'xml' | 'txt'; }

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const ExportModule: React.FC<ExportModuleProps> = ({ currentRole, onShowToast }) => {
  const canEdit = can(currentRole, 'edit_content');
  const canExport = can(currentRole, 'export_data');
  const canFlag = can(currentRole, 'toggle_flags');
  const [data, setData] = React.useState<SeoData | null>(null);
  const [site, setSite] = React.useState<SeoSite | null>(null);
  const [building, setBuilding] = React.useState(false);
  const [files, setFiles] = React.useState<BuiltFile[] | null>(null);

  React.useEffect(() => {
    loadSeoData().then((d) => { setData(d); setSite({ ...d.site }); }).catch(() => setData(null));
  }, []);

  const persistSite = () => {
    if (!site) return;
    updateOverrides((ov) => { ov.site = { ...(ov.site || {}), ...site }; });
    setData((prev) => prev ? { ...prev, site } : prev);
    onShowToast('Site settings saved (browser only).');
    playSound('correct');
  };

  const build = async () => {
    if (!data || !site) return;
    const urlOK = isSiteUrlReal(site);
    if (!urlOK) {
      onShowToast('Blocked: set a real production siteUrl before exporting.');
      playSound('wrong');
      return;
    }
    setBuilding(true);
    playSound('click');
    try {
      const renderUrl = '/js/seo/render-page.js';
      const sitemapUrl = '/js/seo/sitemap.js';
      const [renderer, sitemapper] = await Promise.all([
        import(/* webpackIgnore: true */ renderUrl) as unknown as Promise<Renderer>,
        import(/* webpackIgnore: true */ sitemapUrl) as unknown as Promise<Sitemapper>,
      ]);
      const cssRes = await fetch('/assets/css/marketing.css', { cache: 'no-store' });
      const cssText = cssRes.ok ? await cssRes.text() : '';
      const buildDate = new Date().toISOString().slice(0, 10);
      const siteUrl = site.siteUrl.replace(/\/+$/, '');
      const out: BuiltFile[] = [];

      // Root alias (en-US content, canonical to /en-us/)
      const enUs = data.locales.find((l) => l.locale === 'en-US');
      if (enUs && enUs.enabled) {
        out.push({
          path: 'index.html', kind: 'html',
          content: renderer.renderHome({ site, locale: enUs, i18n: data.i18n[enUs.locale] || {}, locales: data.locales, buildDate, isRoot: true, cssText }),
        });
      }

      for (const l of data.locales.filter((x) => x.enabled)) {
        const slug = l.path.replace(/\//g, '') || l.locale.toLowerCase();
        out.push({
          path: `${slug}/index.html`, kind: 'html',
          content: renderer.renderHome({ site, locale: l, i18n: data.i18n[l.locale] || {}, locales: data.locales, buildDate, isRoot: false, cssText }),
        });
      }

      const enabled = data.locales.filter((l) => l.enabled);
      out.push({ path: 'sitemap-index.xml', kind: 'xml', content: sitemapper.renderSitemapIndex(enabled, siteUrl, buildDate) });
      for (const l of enabled) {
        out.push({ path: sitemapper.sitemapFileName(l), kind: 'xml', content: sitemapper.renderLocaleSitemap(l, enabled, siteUrl, data.pages, buildDate) });
      }
      out.push({ path: 'robots.txt', kind: 'txt', content: sitemapper.renderRobots(siteUrl) });

      setFiles(out);
      onShowToast(`Built ${out.length} files. Download them and deploy to your web root.`);
      playSound('correct');
    } catch (e) {
      onShowToast(`Build failed: ${e instanceof Error ? e.message : String(e)}`);
      playSound('wrong');
    } finally {
      setBuilding(false);
    }
  };

  const mimeFor = (k: BuiltFile['kind']) => (k === 'html' ? 'text/html' : k === 'xml' ? 'application/xml' : 'text/plain');

  if (!data || !site) return <div className="font-mono text-xs text-[var(--text-secondary)]">Loading…</div>;
  const urlOK = isSiteUrlReal(site);

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)] flex items-center gap-3">
          <Package className="w-8 h-8" /> Export &amp; Site Settings
        </h2>
        <p className="text-xs text-[var(--text-secondary)] font-mono">
          Build the static SEO bundle from the same templates used at build time, then deploy the files to your web root.
        </p>
      </div>

      <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] font-mono text-xs text-[var(--text-secondary)] flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
        <span>Changes apply to this browser until you export and deploy the files.</span>
      </div>

      {/* Site settings */}
      <div className="glass-panel rounded-2xl border border-[var(--border)] p-4 space-y-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Site settings</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="font-mono text-[10px] uppercase text-[var(--text-muted)]">Production siteUrl</span>
            <input value={site.siteUrl} disabled={!canEdit} onChange={(e) => setSite({ ...site, siteUrl: e.target.value })} placeholder="https://yourdomain.com" className={inputCls} />
            <span className={`font-mono text-[10px] flex items-center gap-1 ${urlOK ? 'text-emerald-300' : 'text-amber-300'}`}>
              {urlOK ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {urlOK ? 'Real URL — export enabled' : 'Placeholder — export blocked'}
            </span>
          </label>
          <label className="space-y-1">
            <span className="font-mono text-[10px] uppercase text-[var(--text-muted)]">Default OG image</span>
            <input value={site.ogImage} disabled={!canEdit} onChange={(e) => setSite({ ...site, ogImage: e.target.value })} className={inputCls} />
          </label>
          <label className="space-y-1">
            <span className="font-mono text-[10px] uppercase text-[var(--text-muted)]">Schema version</span>
            <input type="number" value={site.schemaVersion} disabled={!canEdit} onChange={(e) => setSite({ ...site, schemaVersion: Number(e.target.value) })} className={inputCls} />
          </label>
          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase text-[var(--text-muted)]">realMultiplayer honesty flag</span>
            <button
              onClick={() => { if (canFlag) { setSite({ ...site, realMultiplayer: !site.realMultiplayer }); playSound('click'); } }}
              disabled={!canFlag}
              className={`w-full px-3 py-2 rounded-xl font-mono text-xs font-bold border transition-colors disabled:opacity-40 ${site.realMultiplayer ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)]'}`}
            >
              {site.realMultiplayer ? 'ON — multiplayer copy allowed' : 'OFF — simulated players only'}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={persistSite} disabled={!canEdit} className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-mono text-xs font-bold flex items-center gap-2 disabled:opacity-40">
            <Save className="w-4 h-4" /> Save settings
          </button>
        </div>
      </div>

      {/* Build */}
      <div className="glass-panel rounded-2xl border border-[var(--border)] p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Static bundle</div>
          <button
            onClick={build}
            disabled={!canExport || building || !urlOK}
            className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-mono text-xs font-bold flex items-center gap-2 disabled:opacity-40"
          >
            {building ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
            {building ? 'Building…' : 'Build files'}
          </button>
        </div>

        {!urlOK && (
          <div className="font-mono text-xs text-amber-300">Set a real production siteUrl above to unlock the build.</div>
        )}

        {files && (
          <div className="space-y-2">
            <div className="font-mono text-[11px] text-[var(--text-secondary)]">{files.length} files ready. Deploy preserving these paths relative to your web root.</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {files.map((f) => (
                <div key={f.path} className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
                  <span className="font-mono text-[11px] text-[var(--text-primary)] truncate flex items-center gap-2">
                    <FileCode2 className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />{f.path}
                  </span>
                  <button
                    onClick={() => { download(f.path.split('/').pop() || f.path, f.content, mimeFor(f.kind)); playSound('click'); }}
                    disabled={!canExport}
                    className="px-2 py-1 rounded-lg border border-[var(--border)] font-mono text-[10px] flex items-center gap-1 disabled:opacity-40"
                  >
                    <Download className="w-3 h-3" /> Get
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                if (!canExport) return;
                files.forEach((f, i) => setTimeout(() => download(f.path.replace(/\//g, '_'), f.content, mimeFor(f.kind)), i * 250));
                onShowToast(`Downloading ${files.length} files…`);
                play('notification');
              }}
              className="px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] font-mono text-xs font-bold flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download all
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const inputCls = 'w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--accent)] disabled:opacity-50';

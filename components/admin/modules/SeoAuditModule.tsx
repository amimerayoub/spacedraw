'use client';

import React from 'react';
import { ShieldCheck, Play, CheckCircle2, XCircle, Loader2, FileSearch } from 'lucide-react';
import { AdminRole, can } from '../../../lib/admin/permissions';
import { playSound, play } from '../../../lib/sound';
import { loadSeoData, SeoData } from '../../../lib/admin/seo-store';

interface AuditRow { check: string; pass: boolean; message: string; fix?: string; }

interface Auditor {
  auditDocument(doc: Document, ctx: Record<string, unknown>): AuditRow[];
}

interface SeoAuditModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

export const SeoAuditModule: React.FC<SeoAuditModuleProps> = ({ currentRole, onShowToast }) => {
  const canRun = can(currentRole, 'view_audit');
  const [data, setData] = React.useState<SeoData | null>(null);
  const [running, setRunning] = React.useState(false);
  const [results, setResults] = React.useState<Array<{ locale: string; url: string; ok: boolean; fetched: boolean; rows: AuditRow[] }> | null>(null);

  React.useEffect(() => {
    loadSeoData().then(setData).catch(() => setData(null));
  }, []);

  const runAudit = async () => {
    if (!data) return;
    setRunning(true);
    playSound('click');
    const validateUrl = '/js/seo/validate.js';
    const auditor = await import(/* webpackIgnore: true */ validateUrl) as unknown as Auditor;
    const base = data.site.siteUrl.replace(/\/+$/, '');
    const enabled = data.locales.filter((l) => l.enabled);
    const out: Array<{ locale: string; url: string; ok: boolean; fetched: boolean; rows: AuditRow[] }> = [];

    for (const l of enabled) {
      // Audit the committed static file as served by the web server.
      const fileUrl = `${l.path}index.html`;
      const expectedCanonical = base + (l.locale === 'en-US' ? '/en-us/' : l.path);
      const expectedHreflangs = [
        ...enabled.map((e) => e.hreflang),
        'en', ...(enabled.some((e) => e.locale === 'pt-BR') ? ['pt'] : []), 'x-default',
      ];
      try {
        const res = await fetch(fileUrl, { cache: 'no-store' });
        if (!res.ok) { out.push({ locale: l.locale, url: fileUrl, ok: false, fetched: false, rows: [{ check: 'fetch', pass: false, message: `HTTP ${res.status} loading ${fileUrl}`, fix: 'Run the SEO build / deploy the static files.' }] }); continue; }
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const rows = auditor.auditDocument(doc, { expectedCanonical, expectedDir: l.dir, expectedHreflangs });
        out.push({ locale: l.locale, url: fileUrl, ok: rows.every((r) => r.pass), fetched: true, rows });
      } catch (e) {
        out.push({ locale: l.locale, url: fileUrl, ok: false, fetched: false, rows: [{ check: 'fetch', pass: false, message: e instanceof Error ? e.message : String(e), fix: 'Is the file deployed at this path?' }] });
      }
    }

    setResults(out);
    setRunning(false);
    const failed = out.filter((o) => !o.ok).length;
    onShowToast(failed === 0 ? `Audit passed for all ${out.length} language pages.` : `Audit finished: ${failed} page(s) have issues.`);
    if (failed === 0) playSound('correct'); else play('notification');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)] flex items-center gap-3">
            <ShieldCheck className="w-8 h-8" /> SEO Audit
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Fetches each deployed static page and checks hreflang reciprocity, canonicals, JSON-LD, FAQ match, lengths and images.
          </p>
        </div>
        <button
          onClick={runAudit}
          disabled={!canRun || running || !data}
          className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-mono text-xs font-bold flex items-center gap-2 disabled:opacity-40"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{running ? 'Auditing…' : 'Run Audit'}</span>
        </button>
      </div>

      {!results && !running && (
        <div className="glass-panel rounded-2xl border border-[var(--border)] p-8 text-center font-mono text-xs text-[var(--text-muted)] flex flex-col items-center gap-3">
          <FileSearch className="w-8 h-8" />
          Run the audit to validate the live static pages.
        </div>
      )}

      {results && (
        <div className="space-y-4">
          {results.map((r) => (
            <div key={r.locale} className="glass-panel rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className={`px-4 py-3 flex items-center justify-between font-mono text-xs ${r.ok ? 'bg-emerald-950/30' : 'bg-red-950/30'}`}>
                <span className="font-bold text-[var(--text-primary)]">{r.locale} <span className="text-[var(--text-muted)] font-normal">· {r.url}</span></span>
                <span className={`flex items-center gap-1.5 ${r.ok ? 'text-emerald-300' : 'text-red-300'}`}>
                  {r.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {r.ok ? 'PASS' : 'ISSUES'}
                </span>
              </div>
              <div className="p-4 space-y-1.5">
                {r.rows.map((row, i) => (
                  <div key={i} className="flex items-start gap-2 font-mono text-[11px]">
                    {row.pass ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 mt-0.5 text-red-400 shrink-0" />}
                    <div className="min-w-0">
                      <span className="text-[var(--text-primary)]">{row.check}</span>
                      <span className="text-[var(--text-secondary)]"> — {row.message}</span>
                      {!row.pass && row.fix && <div className="text-[var(--text-muted)]">Fix: {row.fix}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

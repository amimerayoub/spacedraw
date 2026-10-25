'use client';

import React from 'react';
import {
  Languages as LangIcon, Save, ArrowLeft, CheckCircle2, AlertTriangle,
  XCircle, Search, Globe, ChevronRight, RotateCcw,
} from 'lucide-react';
import { AdminRole, can } from '../../../lib/admin/permissions';
import { playSound } from '../../../lib/sound';
import {
  loadSeoData, updateOverrides, SeoData, SeoLocale, isSiteUrlReal,
} from '../../../lib/admin/seo-store';

interface Validator {
  TITLE_MAX: number;
  META_MAX: number;
  futureKeywords(locale: SeoLocale): string[];
  findForbiddenTerms(text: string, opts: { future?: string[]; realMultiplayer?: boolean }): Array<{ term: string; kind: string }>;
  checkLengths(title: string, meta: string): { titleLen: number; metaLen: number; titleOK: boolean; metaOK: boolean };
  checkKeywordPlacement(a: { primary: string; title: string; meta: string; h1: string; h2: string[]; intro: string }): Record<string, boolean>;
  checkCompleteness(locale: SeoLocale, i18n: Record<string, unknown>): { percent: number; missing: string[] };
}

interface LanguagesModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

// Rough Google-SERP pixel width for a title rendered in ~20px serif.
function measurePixels(text: string): number {
  if (typeof document === 'undefined') return text.length * 8;
  const c = document.createElement('canvas').getContext('2d');
  if (!c) return text.length * 8;
  c.font = '20px arial, sans-serif';
  return Math.round(c.measureText(text).width);
}

export const LanguagesModule: React.FC<LanguagesModuleProps> = ({ currentRole, onShowToast }) => {
  const canEdit = can(currentRole, 'edit_content');
  const [data, setData] = React.useState<SeoData | null>(null);
  const [validator, setValidator] = React.useState<Validator | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<SeoLocale | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const validateUrl = '/js/seo/validate.js';
        const [d, v] = await Promise.all([
          loadSeoData(),
          import(/* webpackIgnore: true */ validateUrl) as unknown as Promise<Validator>,
        ]);
        if (!alive) return;
        setData(d);
        setValidator(v);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const startEdit = (locale: SeoLocale) => {
    setDraft(JSON.parse(JSON.stringify(locale)) as SeoLocale);
    setEditing(locale.locale);
    playSound('click');
  };

  const backToList = () => { setEditing(null); setDraft(null); playSound('click'); };

  const saveDraft = () => {
    if (!canEdit || !draft || !data || !validator) return;
    const site = data.site;
    const future = validator.futureKeywords(draft);
    const blob = [
      draft.title, draft.meta_description, draft.h1, ...(draft.h2 || []), draft.imageAlt,
      ...(draft.faq || []).flatMap((f) => [f.q, f.a]),
    ].join('\n');
    const hits = validator.findForbiddenTerms(blob, { future, realMultiplayer: !!site.realMultiplayer });
    if (hits.length) {
      onShowToast(`Blocked: forbidden term(s) present — ${hits.map((h) => `${h.term} (${h.kind})`).join(', ')}`);
      playSound('wrong');
      return;
    }
    const L = validator.checkLengths(draft.title, draft.meta_description);
    if (!L.titleOK || !L.metaOK) {
      onShowToast(`Blocked: title ${L.titleLen}/${validator.TITLE_MAX}, meta ${L.metaLen}/${validator.META_MAX} — out of range.`);
      playSound('wrong');
      return;
    }
    updateOverrides((ov) => {
      ov.locales = ov.locales || {};
      ov.locales[draft.locale] = { ...(ov.locales[draft.locale] || {}), ...draft };
    });
    setData((prev) => prev ? { ...prev, locales: prev.locales.map((l) => (l.locale === draft.locale ? { ...draft } : l)) } : prev);
    onShowToast(`Saved '${draft.locale}' (browser only — export to deploy).`);
    playSound('correct');
    backToList();
  };

  const toggleEnabled = (locale: SeoLocale) => {
    if (!canEdit) return;
    const next = !locale.enabled;
    updateOverrides((ov) => {
      ov.locales = ov.locales || {};
      ov.locales[locale.locale] = { ...(ov.locales[locale.locale] || {}), enabled: next };
    });
    setData((prev) => prev ? { ...prev, locales: prev.locales.map((l) => (l.locale === locale.locale ? { ...l, enabled: next } : l)) } : prev);
    onShowToast(next ? `'${locale.locale}' enabled.` : `'${locale.locale}' disabled — it will drop from hreflang + sitemaps on export.`);
    playSound('click');
  };

  const setReviewStatus = (localeCode: string, status: 'draft' | 'reviewed') => {
    if (!canEdit) return;
    updateOverrides((ov) => {
      ov.locales = ov.locales || {};
      ov.locales[localeCode] = { ...(ov.locales[localeCode] || {}), reviewStatus: status };
    });
    setData((prev) => prev ? { ...prev, locales: prev.locales.map((l) => (l.locale === localeCode ? { ...l, reviewStatus: status } : l)) } : prev);
    onShowToast(`'${localeCode}' marked ${status}.`);
    playSound('click');
  };

  if (loading) return <div className="font-mono text-xs text-[var(--text-secondary)]">Loading language &amp; SEO data…</div>;
  if (error) return <div className="font-mono text-xs text-red-400">Failed to load SEO data: {error}</div>;
  if (!data || !validator) return null;

  const realMP = !!data.site.realMultiplayer;
  const urlOK = isSiteUrlReal(data.site);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)] flex items-center gap-3">
            <LangIcon className="w-8 h-8" /> Languages &amp; SEO
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            8 static language pages. No public switcher — each language is reached only by its own URL.
          </p>
        </div>
        {editing && (
          <button onClick={backToList} className="px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] font-mono text-xs flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to list
          </button>
        )}
      </div>

      {!urlOK && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-200 font-mono text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>siteUrl is still a placeholder. Canonicals, hreflang and sitemaps will point at <code>example.com</code> until a real production URL is set in Export &amp; Site Settings.</span>
        </div>
      )}

      {!realMP && (
        <div className="p-3 rounded-xl glass-panel border border-[var(--border)] font-mono text-xs text-[var(--text-secondary)] flex items-start gap-2">
          <Globe className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Honesty mode: <strong className="text-[var(--text-primary)]">realMultiplayer is OFF</strong>. &ldquo;with friends&rdquo; / multiplayer keywords are blocked from all copy and structured data. Enable the flag in Export &amp; Site Settings once live multiplayer ships.</span>
        </div>
      )}

      {editing && draft ? (
        <LocaleEditor
          draft={draft}
          setDraft={setDraft}
          validator={validator}
          canEdit={canEdit}
          realMultiplayer={realMP}
          i18n={data.i18n[draft.locale] || {}}
          onSave={saveDraft}
        />
      ) : (
        <div className="space-y-3">
          {data.locales.map((l) => {
            const L = validator.checkLengths(l.title, l.meta_description);
            const comp = validator.checkCompleteness(l, data.i18n[l.locale] || {});
            return (
              <div key={l.locale} className="glass-panel rounded-2xl border border-[var(--border)] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${l.enabled ? 'bg-[var(--accent)]' : 'bg-[var(--text-muted)]'}`} />
                    <div>
                      <div className="font-bold text-sm text-[var(--text-primary)]">{l.locale} <span className="font-mono text-[10px] text-[var(--text-muted)]">({l.hreflang}{l.dir === 'rtl' ? ' · RTL' : ''})</span></div>
                      <div className="font-mono text-[10px] text-[var(--text-secondary)]">{l.path}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg font-mono text-[10px] ${l.reviewStatus === 'reviewed' ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>
                      {l.reviewStatus}
                    </span>
                    <button onClick={() => startEdit(l)} className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-mono text-[11px] font-bold flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
                  <Metric ok={L.titleOK} label="Title" value={`${L.titleLen}/${validator.TITLE_MAX}`} />
                  <Metric ok={L.metaOK} label="Meta" value={`${L.metaLen}/${validator.META_MAX}`} />
                  <Metric ok={comp.missing.length === 0} label="Complete" value={`${comp.percent}%`} />
                  <Metric ok={l.enabled} label="Enabled" value={l.enabled ? 'yes' : 'no'} />
                </div>

                {comp.missing.length > 0 && (
                  <div className="font-mono text-[10px] text-amber-300">Missing: {comp.missing.join(', ')}</div>
                )}

                <div className="flex items-center gap-2 pt-1 border-t border-[var(--border)]">
                  <button
                    onClick={() => toggleEnabled(l)}
                    disabled={!canEdit}
                    className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] font-mono text-[11px] disabled:opacity-40"
                  >
                    {l.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => setReviewStatus(l.locale, l.reviewStatus === 'reviewed' ? 'draft' : 'reviewed')}
                    disabled={!canEdit}
                    className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] font-mono text-[11px] disabled:opacity-40"
                  >
                    Mark {l.reviewStatus === 'reviewed' ? 'draft' : 'reviewed'}
                  </button>
                  <span className="ml-auto font-mono text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                    primary: {l.primary_keyword} <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Metric: React.FC<{ ok: boolean; label: string; value: string }> = ({ ok, label, value }) => (
  <div className={`px-2 py-1.5 rounded-lg border flex items-center justify-between gap-1 ${ok ? 'border-[var(--border)] bg-[var(--bg-tertiary)]' : 'border-amber-800 bg-amber-950/30'}`}>
    <span className="text-[var(--text-secondary)]">{label}</span>
    <span className={`flex items-center gap-1 font-bold ${ok ? 'text-[var(--text-primary)]' : 'text-amber-300'}`}>
      {ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{value}
    </span>
  </div>
);

interface EditorProps {
  draft: SeoLocale;
  setDraft: (l: SeoLocale) => void;
  validator: Validator;
  canEdit: boolean;
  realMultiplayer: boolean;
  i18n: Record<string, unknown>;
  onSave: () => void;
}

const LocaleEditor: React.FC<EditorProps> = ({ draft, setDraft, validator, canEdit, realMultiplayer, i18n, onSave }) => {
  const set = <K extends keyof SeoLocale>(k: K, v: SeoLocale[K]) => setDraft({ ...draft, [k]: v });
  const setFaq = (i: number, field: 'q' | 'a', v: string) => {
    const faq = draft.faq.map((f, idx) => (idx === i ? { ...f, [field]: v } : f));
    set('faq', faq);
  };
  const setH2 = (i: number, v: string) => set('h2', draft.h2.map((h, idx) => (idx === i ? v : h)));

  const L = validator.checkLengths(draft.title, draft.meta_description);
  const titlePx = measurePixels(draft.title);
  const future = validator.futureKeywords(draft);
  const intro = ((i18n.hero as { intro?: string }) || {}).intro || '';
  const placement = validator.checkKeywordPlacement({ primary: draft.primary_keyword, title: draft.title, meta: draft.meta_description, h1: draft.h1, h2: draft.h2, intro });
  const comp = validator.checkCompleteness(draft, i18n);
  const blob = [draft.title, draft.meta_description, draft.h1, ...draft.h2, draft.imageAlt, ...draft.faq.flatMap((f) => [f.q, f.a])].join('\n');
  const hits = validator.findForbiddenTerms(blob, { future, realMultiplayer });

  const siteUrlDisplay = 'https://example.com'; // placeholder host shown in snippet

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-xl text-[var(--text-primary)] font-mono">Editing {draft.locale} <span className="text-[var(--text-muted)] text-xs">({draft.hreflang}{draft.dir === 'rtl' ? ' · RTL' : ''})</span></h3>
        <div className="flex items-center gap-2">
          <button onClick={onSave} disabled={!canEdit || hits.length > 0} className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-mono text-xs font-bold flex items-center gap-2 disabled:opacity-40">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      {hits.length > 0 && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-200 font-mono text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold"><XCircle className="w-4 h-4" /> Save blocked — forbidden terms detected</div>
          {hits.map((h, i) => <div key={i}>• &ldquo;{h.term}&rdquo; ({h.kind}{h.kind === 'future' && !realMultiplayer ? ' — needs realMultiplayer flag' : ''})</div>)}
        </div>
      )}

      {/* Google SERP snippet preview */}
      <div className="glass-panel rounded-2xl border border-[var(--border)] p-4 space-y-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Google snippet preview</div>
        <div className="rounded-xl bg-white p-4 grayscale">
          <div className="text-[#202124] text-xs">{siteUrlDisplay}{draft.path} ›</div>
          <div className="text-[#1a0dab] text-lg leading-snug" style={{ maxWidth: 600, overflow: 'hidden' }}>
            <span className={titlePx > 580 ? 'text-red-600' : ''}>{draft.title}</span>
          </div>
          <div className="text-[#4d5156] text-sm leading-snug">{draft.meta_description}</div>
        </div>
        <div className="font-mono text-[10px] text-[var(--text-secondary)]">est. title width {titlePx}px {titlePx > 580 ? '(likely truncated)' : '(fits)'}</div>
      </div>

      {/* Social card preview */}
      <div className="glass-panel rounded-2xl border border-[var(--border)] p-4 space-y-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Social share card</div>
        <div className="rounded-xl border border-[var(--border)] overflow-hidden grayscale max-w-md">
          <div className="h-40 bg-[var(--bg-tertiary)] flex items-center justify-center font-display text-2xl text-[var(--text-muted)]">OG 1200×630</div>
          <div className="p-3 bg-[var(--bg-secondary)] space-y-1">
            <div className="font-mono text-[10px] uppercase text-[var(--text-muted)]">{siteUrlDisplay}</div>
            <div className="font-bold text-sm text-[var(--text-primary)] leading-tight">{draft.title}</div>
            <div className="text-xs text-[var(--text-secondary)] line-clamp-2">{draft.meta_description}</div>
          </div>
        </div>
      </div>

      {/* Keyword placement */}
      <div className="glass-panel rounded-2xl border border-[var(--border)] p-4 space-y-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Keyword placement — &ldquo;{draft.primary_keyword}&rdquo;</div>
        <div className="flex flex-wrap gap-2 font-mono text-[11px]">
          {Object.entries(placement).map(([k, ok]) => (
            <span key={k} className={`px-2 py-1 rounded-lg border ${ok ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300' : 'border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-muted)]'}`}>
              {ok ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : <XCircle className="w-3 h-3 inline mr-1" />}{k}
            </span>
          ))}
        </div>
        {future.length > 0 && (
          <div className="font-mono text-[10px] text-[var(--text-secondary)]">
            Future keywords (blocked while realMultiplayer off): {future.join('; ')}
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <Field label={`Title (${L.titleLen}/${validator.TITLE_MAX})`} ok={L.titleOK}>
          <input value={draft.title} disabled={!canEdit} onChange={(e) => set('title', e.target.value)} className={inputCls} />
        </Field>
        <Field label={`Meta description (${L.metaLen}/${validator.META_MAX})`} ok={L.metaOK}>
          <textarea value={draft.meta_description} disabled={!canEdit} rows={3} onChange={(e) => set('meta_description', e.target.value)} className={inputCls} />
        </Field>
        <Field label="H1" ok={!!draft.h1}>
          <input value={draft.h1} disabled={!canEdit} onChange={(e) => set('h1', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Primary keyword" ok={!!draft.primary_keyword}>
          <input value={draft.primary_keyword} disabled={!canEdit} onChange={(e) => set('primary_keyword', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Image alt" ok={!!draft.imageAlt}>
          <input value={draft.imageAlt} disabled={!canEdit} onChange={(e) => set('imageAlt', e.target.value)} className={inputCls} />
        </Field>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">H2 headings (6)</div>
          <div className="space-y-2">
            {draft.h2.map((h, i) => (
              <input key={i} value={h} disabled={!canEdit} onChange={(e) => setH2(i, e.target.value)} className={inputCls} />
            ))}
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">FAQ (5) — must match JSON-LD exactly</div>
          <div className="space-y-3">
            {draft.faq.map((f, i) => (
              <div key={i} className="space-y-1">
                <input value={f.q} disabled={!canEdit} placeholder="Question" onChange={(e) => setFaq(i, 'q', e.target.value)} className={inputCls} />
                <textarea value={f.a} disabled={!canEdit} rows={2} placeholder="Answer" onChange={(e) => setFaq(i, 'a', e.target.value)} className={inputCls} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RTL preview */}
      {draft.dir === 'rtl' && (
        <div className="glass-panel rounded-2xl border border-[var(--border)] p-4 space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2"><RotateCcw className="w-3 h-3" /> RTL preview</div>
          <div dir="rtl" lang={draft.htmlLang} className="rounded-xl bg-[var(--bg-secondary)] p-4 border border-[var(--border)]">
            <div className="font-bold text-lg text-[var(--text-primary)]">{draft.h1}</div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">{draft.meta_description}</div>
          </div>
        </div>
      )}

      {/* Missing translation checklist */}
      <div className="glass-panel rounded-2xl border border-[var(--border)] p-4 space-y-2">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Completeness — {comp.percent}%</div>
        {comp.missing.length === 0 ? (
          <div className="font-mono text-xs text-emerald-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> All required fields present.</div>
        ) : (
          <ul className="font-mono text-xs text-amber-300 space-y-1">
            {comp.missing.map((m) => <li key={m}>• missing {m}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
};

const inputCls = 'w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--accent)] disabled:opacity-50';

const Field: React.FC<{ label: string; ok: boolean; children: React.ReactNode }> = ({ label, ok, children }) => (
  <div className="space-y-1">
    <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
      {label} {ok ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-amber-400" />}
    </label>
    {children}
  </div>
);

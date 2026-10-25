'use client';

import React from 'react';
import { Volume2, Play, Save, Loader2, CheckCircle2, XCircle, VolumeX } from 'lucide-react';
import { AdminRole, can } from '../../../lib/admin/permissions';
import { playSound, sound, SOUNDS, SOUND_NAMES, SoundName } from '../../../lib/sound';

interface SoundsModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

type PerSound = Partial<Record<SoundName, { enabled?: boolean; volume?: number }>>;
const DEFAULT_DISABLED: SoundName[] = ['wrong', 'hover'];
const BASE = '/assets/sounds/';

interface FileStatus { state: 'checking' | 'found' | 'missing'; size?: number; duration?: number; }

export const SoundsModule: React.FC<SoundsModuleProps> = ({ currentRole, onShowToast }) => {
  const canEdit = can(currentRole, 'edit_content');
  const [defaultEnabled, setDefaultEnabled] = React.useState<boolean>(sound.config.defaultEnabled);
  const [masterVolume, setMasterVolume] = React.useState<number>(Math.round(sound.config.masterVolume * 100));
  const [perSound, setPerSound] = React.useState<PerSound>(() => ({ ...sound.config.perSound }));
  const [status, setStatus] = React.useState<Record<string, FileStatus>>({});
  const [previewing, setPreviewing] = React.useState<string | null>(null);

  // Probe each MP3 for existence, size and duration.
  React.useEffect(() => {
    SOUND_NAMES.forEach((name) => {
      setStatus((s) => ({ ...s, [name]: { state: 'checking' } }));
      const url = `${BASE}${name}.mp3`;
      const audio = new Audio();
      audio.preload = 'metadata';
      const done = (st: FileStatus) => setStatus((s) => ({ ...s, [name]: st }));
      audio.onloadedmetadata = () => {
        fetch(url, { method: 'GET', cache: 'no-store' })
          .then((r) => (r.ok ? done({ state: 'found', size: Number(r.headers.get('content-length') || 0), duration: audio.duration }) : done({ state: 'missing' })))
          .catch(() => done({ state: 'found', duration: audio.duration }));
      };
      audio.onerror = () => done({ state: 'missing' });
      audio.src = url;
    });
  }, []);

  const isEnabled = (name: SoundName): boolean => {
    const o = perSound[name];
    if (o && o.enabled === false) return false;
    if (o && o.enabled === true) return true;
    return !DEFAULT_DISABLED.includes(name);
  };

  const toggle = (name: SoundName) => {
    if (!canEdit) return;
    setPerSound((p) => ({ ...p, [name]: { ...(p[name] || {}), enabled: !isEnabled(name) } }));
    playSound('click');
  };

  const setVol = (name: SoundName, v: number) => {
    if (!canEdit) return;
    setPerSound((p) => ({ ...p, [name]: { ...(p[name] || {}), volume: v } }));
  };

  const preview = (name: SoundName) => {
    setPreviewing(name);
    const audio = new Audio(`${BASE}${name}.mp3`);
    const vol = perSound[name]?.volume;
    audio.volume = Math.min(1, (typeof vol === 'number' ? vol : 1) * (masterVolume / 100));
    audio.onended = () => setPreviewing(null);
    audio.onerror = () => { setPreviewing(null); onShowToast(`'${name}.mp3' missing — stays silent in game.`); };
    void audio.play().catch(() => { setPreviewing(null); onShowToast('Preview blocked — click again to allow audio.'); });
  };

  const save = () => {
    if (!canEdit) return;
    sound.setConfig({ defaultEnabled, masterVolume: masterVolume / 100, perSound });
    onShowToast('Sound configuration saved.');
    playSound('correct');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)] flex items-center gap-3">
            <Volume2 className="w-8 h-8" /> Sound Manager
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            MP3-only engine. Audio is off by default, starts after a user gesture, and never plays while the tab is hidden.
          </p>
        </div>
        <button onClick={save} disabled={!canEdit} className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-mono text-xs font-bold flex items-center gap-2 disabled:opacity-40">
          <Save className="w-4 h-4" /> Save config
        </button>
      </div>

      {/* Global controls */}
      <div className="glass-panel rounded-2xl border border-[var(--border)] p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-bold text-sm text-[var(--text-primary)]">Default enabled for new visitors</div>
            <div className="font-mono text-[11px] text-[var(--text-secondary)]">When off, sound only starts after the visitor turns it on in Settings.</div>
          </div>
          <button
            onClick={() => { if (canEdit) { setDefaultEnabled(!defaultEnabled); playSound('click'); } }}
            disabled={!canEdit}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold border disabled:opacity-40 ${defaultEnabled ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)]'}`}
          >
            {defaultEnabled ? 'ON by default' : 'OFF by default'}
          </button>
        </div>
        <label className="block space-y-1">
          <span className="font-mono text-[10px] uppercase text-[var(--text-muted)]">Master volume — {masterVolume}%</span>
          <input type="range" min={0} max={100} step={5} value={masterVolume} disabled={!canEdit} onChange={(e) => setMasterVolume(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      {/* Per-sound list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SOUND_NAMES.map((name) => {
          const def = SOUNDS[name];
          const st = status[name] || { state: 'checking' as const };
          const on = isEnabled(name);
          const vol = perSound[name]?.volume;
          return (
            <div key={name} className="glass-panel rounded-2xl border border-[var(--border)] p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-sm text-[var(--text-primary)] font-mono truncate">{name}.mp3</div>
                  <div className="font-mono text-[10px] text-[var(--text-secondary)]">{def.use}</div>
                  <div className="font-mono text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
                    {st.state === 'checking' && <><Loader2 className="w-3 h-3 animate-spin" /> checking…</>}
                    {st.state === 'found' && <><CheckCircle2 className="w-3 h-3 text-emerald-400" /> found{st.size ? ` · ${(st.size / 1024).toFixed(1)} KB` : ''}{st.duration ? ` · ${st.duration.toFixed(2)}s` : ''}</>}
                    {st.state === 'missing' && <><XCircle className="w-3 h-3 text-red-400" /> missing — silent</>}
                  </div>
                </div>
                <button
                  onClick={() => preview(name)}
                  className="px-2.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] shrink-0"
                  aria-label={`Preview ${name}`}
                >
                  {previewing === name ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => toggle(name)}
                  disabled={!canEdit}
                  className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-40 ${on ? 'bg-[var(--accent)]' : 'bg-[var(--bg-tertiary)] border border-[var(--border)]'}`}
                  aria-pressed={on}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${on ? 'translate-x-6 bg-[var(--accent-inverse)]' : 'bg-[var(--text-secondary)]'}`} />
                </button>
                <label className="flex items-center gap-2 flex-1 max-w-[180px]">
                  {on ? <Volume2 className="w-3.5 h-3.5 text-[var(--text-muted)]" /> : <VolumeX className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                  <input
                    type="range" min={0} max={150} step={5}
                    value={typeof vol === 'number' ? Math.round(vol * 100) : 100}
                    disabled={!canEdit || !on}
                    onChange={(e) => setVol(name, Number(e.target.value) / 100)}
                    className="flex-1"
                    aria-label={`${name} volume`}
                  />
                  <span className="font-mono text-[10px] text-[var(--text-muted)] w-8 text-right">{typeof vol === 'number' ? Math.round(vol * 100) : 100}%</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

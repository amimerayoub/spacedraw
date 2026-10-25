'use client';

import React from 'react';
import { Flag, Save, ShieldAlert, Check } from 'lucide-react';
import { DEFAULT_SITE_CONFIG } from '../../../lib/admin/schema';
import { AdminRole, can } from '../../../lib/admin/permissions';
import { playSound } from '../../../lib/sound';

interface FeaturesModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

export const FeaturesModule: React.FC<FeaturesModuleProps> = ({ currentRole, onShowToast }) => {
  const [flags, setFlags] = React.useState({ ...DEFAULT_SITE_CONFIG.flags });
  const canEdit = can(currentRole, 'toggle_flags');

  const toggleFlag = (key: keyof typeof flags) => {
    if (!canEdit || key === 'maintenance') return;
    setFlags({ ...flags, [key]: !flags[key] });
    onShowToast(`Feature flag '${key}' updated.`);
    playSound('click');
  };

  const toggleMaintenance = () => {
    if (!canEdit) return;
    const nextOn = !flags.maintenance.on;
    setFlags({
      ...flags,
      maintenance: { ...flags.maintenance, on: nextOn },
    });
    onShowToast(`Maintenance mode ${nextOn ? 'ENABLED' : 'DISABLED'}.`);
    playSound('click');
  };

  const handleSave = () => {
    if (!canEdit) return;
    onShowToast('Feature flags & maintenance configuration saved.');
    playSound('click');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">
            Feature Flags & Maintenance
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Enable or disable frontend features and toggle site maintenance mode.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleSave}
            className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-mono text-xs font-bold flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>Save Flags</span>
          </button>
        )}
      </div>

      {/* Maintenance Mode Banner Card */}
      <div className={`p-6 rounded-2xl border space-y-4 font-mono text-xs ${
        flags.maintenance.on ? 'bg-amber-950/40 border-amber-800 text-amber-200' : 'glass-panel border-[var(--border)]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[var(--text-primary)]" />
            <h3 className="font-bold text-base text-[var(--text-primary)]">Site Maintenance Mode</h3>
          </div>
          <button
            onClick={toggleMaintenance}
            disabled={!canEdit}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              flags.maintenance.on ? 'bg-amber-500 text-black' : 'bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)]'
            }`}
          >
            {flags.maintenance.on ? 'Disable Maintenance' : 'Enable Maintenance'}
          </button>
        </div>

        <p className="text-xs text-[var(--text-secondary)]">
          When active, a monochrome banner appears on the public site while the admin console remains fully accessible.
        </p>

        <div className="space-y-1">
          <label className="block text-[10px] uppercase text-[var(--text-secondary)]">Maintenance Message</label>
          <input
            type="text"
            value={flags.maintenance.message}
            onChange={(e) => setFlags({ ...flags, maintenance: { ...flags.maintenance, message: e.target.value } })}
            disabled={!canEdit}
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none"
          />
        </div>
      </div>

      {/* Feature Toggles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'chat', label: 'Live Chat & Guesses', desc: 'Allows players to submit guesses and chat during rounds.' },
          { key: 'practice', label: 'Single Player Practice Mode', desc: 'Allows users to enter drawing practice without bots.' },
          { key: 'sound', label: 'Web Audio Sound Effects', desc: 'Synthesizes game audio cues for ticks, chimes, and fanfares.' },
          { key: 'bots', label: 'Simulated Bot Opponents', desc: 'Enables simulated AI bots in lobbies and game rooms.' },
          { key: 'hints', label: 'Progressive Word Hints', desc: 'Reveals letter hints at 50% and 25% remaining time.' },
          { key: 'fillTool', label: 'Canvas Flood Fill Tool', desc: 'Enables flood fill bucket tool in drawing toolbar.' },
          { key: 'eyedropper', label: 'Canvas Eyedropper Tool', desc: 'Enables color sampling tool in drawing toolbar.' },
        ].map((f) => {
          const isEnabled = Boolean(flags[f.key as keyof typeof flags]);
          return (
            <div key={f.key} className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-[var(--border)]">
              <div className="space-y-1 max-w-[75%]">
                <span className="font-bold text-sm text-[var(--text-primary)]">{f.label}</span>
                <p className="text-xs text-[var(--text-secondary)]">{f.desc}</p>
              </div>

              <button
                onClick={() => toggleFlag(f.key as any)}
                disabled={!canEdit}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--bg-tertiary)] border border-[var(--border)]'
                }`}
                aria-pressed={isEnabled}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${
                    isEnabled ? 'translate-x-6 bg-[var(--accent-inverse)]' : 'bg-[var(--text-secondary)]'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

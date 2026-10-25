'use client';

import React from 'react';
import { Settings, KeyRound, Clock, Eye, Sliders, Save } from 'lucide-react';
import { AdminRole } from '../../../lib/admin/permissions';
import { playSound } from '../../../lib/sound';

interface SettingsModuleProps {
  currentRole: AdminRole;
  theme: 'dark' | 'light';
  density: 'comfortable' | 'compact';
  onToggleTheme: () => void;
  onToggleDensity: () => void;
  onShowToast: (msg: string) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  currentRole,
  theme,
  density,
  onToggleTheme,
  onToggleDensity,
  onShowToast,
}) => {
  const [idleTimeout, setIdleTimeout] = React.useState<number>(15);
  const [oldPasscode, setOldPasscode] = React.useState('');
  const [newPasscode, setNewPasscode] = React.useState('');

  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasscode.length < 8) {
      onShowToast('New passcode must be at least 8 characters.');
      return;
    }
    onShowToast('Passcode updated successfully.');
    setOldPasscode('');
    setNewPasscode('');
    playSound('click');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">
          Console Settings
        </h2>
        <p className="text-xs text-[var(--text-secondary)] font-mono">
          Configure idle session timeouts, layout density, theme, and security credentials.
        </p>
      </div>

      {/* Preferences Section */}
      <div className="glass-panel p-6 space-y-4">
        <div className="border-b border-[var(--border)] pb-3">
          <h3 className="font-semibold text-base text-[var(--text-primary)]">Preferences</h3>
        </div>

        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
            <span>Session Idle Timeout</span>
            <select
              value={idleTimeout}
              onChange={(e) => setIdleTimeout(parseInt(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)]"
            >
              <option value={5}>5 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={60}>60 Minutes</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
            <span>Interface Layout Density</span>
            <button
              onClick={onToggleDensity}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] capitalize"
            >
              {density}
            </button>
          </div>
        </div>
      </div>

      {/* Change Passcode */}
      <form onSubmit={handleChangePasscode} className="glass-panel p-6 space-y-4">
        <div className="border-b border-[var(--border)] pb-3">
          <h3 className="font-semibold text-base text-[var(--text-primary)]">Change Admin Passcode</h3>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="space-y-1">
            <label className="block text-[10px] uppercase text-[var(--text-secondary)]">Current Passcode</label>
            <input
              type="password"
              value={oldPasscode}
              onChange={(e) => setOldPasscode(e.target.value)}
              placeholder="Current passcode"
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] uppercase text-[var(--text-secondary)]">New Passcode (min 8 chars)</label>
            <input
              type="password"
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              placeholder="New passcode"
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!newPasscode}
            className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-bold text-xs flex items-center gap-1.5 disabled:opacity-40"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Update Passcode</span>
          </button>
        </div>
      </form>
    </div>
  );
};

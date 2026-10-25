'use client';

import React from 'react';
import { Palette, CheckCircle2, AlertOctagon, Save, RefreshCw } from 'lucide-react';
import { AdminRole, can } from '../../../lib/admin/permissions';
import { playSound } from '../../../lib/sound';

interface ThemeModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

export const ThemeModule: React.FC<ThemeModuleProps> = ({ currentRole, onShowToast }) => {
  const [bgPrimary, setBgPrimary] = React.useState('#000000');
  const [textPrimary, setTextPrimary] = React.useState('#FFFFFF');
  const [textSecondary, setTextSecondary] = React.useState('#A3A3A3');
  const [glassBlur, setGlassBlur] = React.useState<number>(16);

  const canEdit = can(currentRole, 'edit_theme');

  // WCAG Relative Luminance & Contrast Calculator
  const getLuminance = (hex: string): number => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;

    const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getContrastRatio = (hex1: string, hex2: string): number => {
    try {
      const l1 = getLuminance(hex1);
      const l2 = getLuminance(hex2);
      const bright = Math.max(l1, l2);
      const dark = Math.min(l1, l2);
      return (bright + 0.05) / (dark + 0.05);
    } catch {
      return 21;
    }
  };

  const contrastRatio = getContrastRatio(bgPrimary, textPrimary);
  const isPassesAA = contrastRatio >= 4.5;

  const handleSaveTheme = () => {
    if (!canEdit) return;
    if (!isPassesAA) {
      onShowToast(`Blocked: Contrast ratio ${contrastRatio.toFixed(2)}:1 is below WCAG AA 4.5:1 requirement.`);
      playSound('wrong');
      return;
    }
    onShowToast('Theme tokens saved and live synced.');
    playSound('click');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">
            Theme & Contrast Checker
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Customize grayscale design tokens with automated WCAG AA contrast ratio validation.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleSaveTheme}
            disabled={!isPassesAA}
            className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-mono text-xs font-bold flex items-center gap-2 transition-transform hover:scale-105 disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            <span>Save Theme</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Token Config Form */}
        <section className="glass-panel p-6 space-y-6">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="font-semibold text-base text-[var(--text-primary)]">Grayscale Color Tokens</h3>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase text-[var(--text-secondary)]">Background Primary (Hex)</label>
              <input
                type="text"
                value={bgPrimary}
                onChange={(e) => setBgPrimary(e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase text-[var(--text-secondary)]">Text Primary (Hex)</label>
              <input
                type="text"
                value={textPrimary}
                onChange={(e) => setTextPrimary(e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase text-[var(--text-secondary)]">Backdrop Glass Blur ({glassBlur}px)</label>
              <input
                type="range"
                min={8}
                max={24}
                value={glassBlur}
                onChange={(e) => setGlassBlur(parseInt(e.target.value))}
                disabled={!canEdit}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>
          </div>

          {/* WCAG Contrast Ratio Result Card */}
          <div className={`p-4 rounded-xl border font-mono text-xs space-y-2 ${
            isPassesAA ? 'bg-green-950/40 border-green-800 text-green-200' : 'bg-red-950/40 border-red-800 text-red-200'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                {isPassesAA ? <CheckCircle2 className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
                <span>WCAG Contrast Status</span>
              </span>
              <span>{contrastRatio.toFixed(2)} : 1</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {isPassesAA
                ? 'Passes WCAG AA standard (4.5:1 required for normal body text).'
                : 'Fails WCAG AA standard. Saving is blocked until contrast ratio is at least 4.5:1.'}
            </p>
          </div>
        </section>

        {/* Live Preview Panel */}
        <section className="glass-panel p-6 space-y-4 border border-[var(--border-strong)]">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="font-semibold text-base text-[var(--text-primary)]">Theme Component Preview</h3>
          </div>

          <div
            className="p-6 rounded-2xl space-y-4 text-center border"
            style={{ backgroundColor: bgPrimary, color: textPrimary, borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <h2 className="font-display font-bold text-3xl">SpaceDraw Title</h2>
            <p style={{ color: textSecondary }} className="text-xs">
              Supporting paragraph text rendered with custom primary and secondary tokens.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button className="px-4 py-2 rounded-full font-bold text-xs bg-white text-black">
                Primary Button
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

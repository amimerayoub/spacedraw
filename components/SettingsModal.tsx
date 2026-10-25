'use client';

import React from 'react';
import { X, Sun, Moon, Volume2, VolumeX, Shield, Trash2, Eye, Sliders } from 'lucide-react';
import { clearData } from '../lib/storage';
import { getMuted, setMuted, playSound, play, getVolume, setVolume } from '../lib/sound';

interface SettingsModalProps {
  isOpen: boolean;
  theme: 'dark' | 'light';
  reducedMotion: boolean;
  onClose: () => void;
  onToggleTheme: () => void;
  onToggleReducedMotion: () => void;
  onShowToast: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  theme,
  reducedMotion,
  onClose,
  onToggleTheme,
  onToggleReducedMotion,
  onShowToast,
}) => {
  const [muted, setMutedState] = React.useState<boolean>(() => getMuted());
  const [volume, setVolumeState] = React.useState<number>(() => Math.round(getVolume() * 100));
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const nextState = !muted;
    setMuted(nextState); // enabling plays 'toggle-on' inside the engine
    setMutedState(nextState);
    if (nextState) play('toggle-off');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = Number(e.target.value);
    setVolumeState(pct);
    setVolume(pct / 100);
  };

  const handleClearDataConfirm = () => {
    clearData();
    setShowClearConfirm(false);
    onShowToast('Local storage data cleared.');
    playSound('click');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--glass-modal)] backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="glass-panel-strong max-w-lg w-full p-6 space-y-6 rounded-2xl border border-[var(--border-strong)] relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[var(--text-primary)]" />
            <h3 id="settings-title" className="font-semibold text-lg text-[var(--text-primary)]">
              Application Settings
            </h3>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Theme Option */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <div className="flex flex-col">
                <span className="font-medium text-sm text-[var(--text-primary)]">Color Theme</span>
                <span className="text-xs text-[var(--text-secondary)]">Currently {theme} mode</span>
              </div>
            </div>
            <button
              onClick={() => {
                playSound('click');
                onToggleTheme();
              }}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-inverse)] font-medium text-xs"
            >
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>

          {/* Sound FX */}
          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-[var(--text-primary)]">Sound Effects</span>
                  <span className="text-xs text-[var(--text-secondary)]">{muted ? 'Muted' : 'Enabled'}</span>
                </div>
              </div>
              <button
                onClick={handleToggleSound}
                aria-pressed={!muted}
                className="px-4 py-2 rounded-lg bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] font-medium text-xs"
              >
                {muted ? 'Enable Sound' : 'Mute Sound'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="volume-slider" className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
                Volume
              </label>
              <input
                id="volume-slider"
                type="range"
                min={0}
                max={100}
                step={5}
                value={volume}
                onChange={handleVolumeChange}
                disabled={muted}
                aria-valuetext={`${volume}%`}
                className="flex-1 accent-[var(--accent)] disabled:opacity-40 h-11"
              />
              <span className="text-xs font-mono text-[var(--text-secondary)] w-10 text-right">{volume}%</span>
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5" />
              <div className="flex flex-col">
                <span className="font-medium text-sm text-[var(--text-primary)]">Reduced Motion</span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {reducedMotion ? 'Animations reduced' : 'Full animations'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                play(!reducedMotion ? 'toggle-on' : 'toggle-off');
                onToggleReducedMotion();
              }}
              aria-pressed={reducedMotion}
              className="px-4 py-2 rounded-lg bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] font-medium text-xs"
            >
              {reducedMotion ? 'Disable' : 'Enable'}
            </button>
          </div>

          {/* Clear Local Data */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-[var(--text-primary)]" />
              <div className="flex flex-col">
                <span className="font-medium text-sm text-[var(--text-primary)]">Clear Stored Data</span>
                <span className="text-xs text-[var(--text-secondary)]">Reset local profiles & settings</span>
              </div>
            </div>
            <button
              onClick={() => {
                playSound('click');
                setShowClearConfirm(true);
              }}
              className="px-4 py-2 rounded-lg bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] font-medium text-xs"
            >
              Clear Data
            </button>
          </div>
        </div>

        {/* Clear Data Confirmation Popover */}
        {showClearConfirm && (
          <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-strong)] space-y-3">
            <p className="text-xs font-medium text-[var(--text-primary)]">
              Are you sure you want to clear local storage? This resets saved nickname and settings.
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={handleClearDataConfirm}
                className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-inverse)] font-medium text-xs"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] font-medium text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

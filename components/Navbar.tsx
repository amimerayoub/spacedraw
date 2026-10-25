'use client';

import React from 'react';
import { Volume2, VolumeX, Sun, Moon, Settings, Radio } from 'lucide-react';
import { getMuted, setMuted, playSound, play } from '../lib/sound';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onOpenSettings,
  onGoHome,
}) => {
  const [muted, setMutedState] = React.useState<boolean>(() => getMuted());

  const handleToggleSound = () => {
    const nextState = !muted;
    setMuted(nextState); // enabling plays 'toggle-on' inside the engine
    setMutedState(nextState);
    if (nextState) play('toggle-off');
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel pt-safe border-b border-[var(--border)] px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={() => {
            playSound('click');
            onGoHome();
          }}
          className="flex items-center gap-3 group focus-visible:outline-none"
          aria-label="SpaceDraw Home"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-[var(--accent-inverse)] flex items-center justify-center font-bold text-xl transition-transform group-hover:scale-105">
            SD
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-bold text-2xl leading-none tracking-tight text-[var(--text-primary)]">
              SpaceDraw
            </span>
            <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">
              Monochrome Canvas
            </span>
          </div>
        </button>

        {/* Demo Mode Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)]" title="All players and game rooms are simulated locally on this device.">
          <Radio className="w-3.5 h-3.5 animate-pulse text-[var(--text-primary)]" />
          <span>Demo Mode</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2.5 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] transition-colors"
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            title={muted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-[var(--text-secondary)]" /> : <Volume2 className="w-4 h-4 text-[var(--text-primary)]" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              playSound('click');
              onToggleTheme();
            }}
            className="p-2.5 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => {
              playSound('click');
              onOpenSettings();
            }}
            className="p-2.5 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] transition-colors"
            aria-label="Open Settings"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

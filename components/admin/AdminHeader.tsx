'use client';

import React from 'react';
import { Search, Sun, Moon, Lock, LogOut, Shield, ShieldAlert, Command, Sliders } from 'lucide-react';
import { AdminRole, getRolePermissionSummary } from '../../lib/admin/permissions';
import { playSound } from '../../lib/sound';

interface AdminHeaderProps {
  currentRole: AdminRole;
  theme: 'dark' | 'light';
  density: 'comfortable' | 'compact';
  onRoleChange: (role: AdminRole) => void;
  onToggleTheme: () => void;
  onToggleDensity: () => void;
  onOpenCommandPalette: () => void;
  onLock: () => void;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentRole,
  theme,
  density,
  onRoleChange,
  onToggleTheme,
  onToggleDensity,
  onOpenCommandPalette,
  onLock,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[var(--border)] px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand & Search Trigger */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-[var(--accent-inverse)] font-bold text-base flex items-center justify-center">
              SD
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-display font-bold text-lg text-[var(--text-primary)] leading-none">
                SpaceDraw Admin
              </span>
              <span className="text-[10px] font-mono text-[var(--text-secondary)]">Control Console</span>
            </div>
          </div>

          {/* Quick Command Palette Button */}
          <button
            onClick={() => {
              playSound('click');
              onOpenCommandPalette();
            }}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-mono transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search or command...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border)] text-[10px]">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Simulation Controls & User Actions */}
        <div className="flex items-center gap-3">
          {/* Local Admin Mode Badge */}
          <div
            className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)]"
            title="Changes apply to this browser only. Simulated roles & entities."
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[var(--text-primary)]" />
            <span>Local Admin Mode</span>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-[var(--bg-tertiary)] p-1 rounded-xl border border-[var(--border)]">
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] px-2 hidden lg:inline">
              Role:
            </span>
            {(['Owner', 'Admin', 'Moderator', 'Viewer'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  playSound('click');
                  onRoleChange(r);
                }}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                  currentRole === r
                    ? 'bg-[var(--accent)] text-[var(--accent-inverse)] font-bold shadow'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title={getRolePermissionSummary(r)}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Density Toggle */}
          <button
            onClick={() => {
              playSound('click');
              onToggleDensity();
            }}
            className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono hidden sm:flex items-center gap-1"
            title="Toggle Density"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="capitalize">{density}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              playSound('click');
              onToggleTheme();
            }}
            className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)]"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Lock Now */}
          <button
            onClick={() => {
              playSound('click');
              onLock();
            }}
            className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)]"
            title="Lock Console"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              playSound('click');
              onLogout();
            }}
            className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)]"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

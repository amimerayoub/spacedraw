'use client';

import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  Tv,
  Edit3,
  Image as ImageIcon,
  Palette,
  Sliders,
  Flag,
  ShieldCheck,
  BarChart3,
  History,
  Database,
  UserCheck,
  Settings,
  Languages as LanguagesIcon,
  ShieldCheck as ShieldCheckIcon,
  Package,
  Volume2,
} from 'lucide-react';
import { playSound } from '../../lib/sound';

export type AdminModuleKey =
  | 'dashboard'
  | 'words'
  | 'players'
  | 'rooms'
  | 'content'
  | 'assets'
  | 'theme'
  | 'game-rules'
  | 'features'
  | 'moderation'
  | 'languages'
  | 'seo-audit'
  | 'export'
  | 'sounds'
  | 'analytics'
  | 'audit'
  | 'data'
  | 'team'
  | 'settings';

interface AdminSidebarProps {
  activeModule: AdminModuleKey;
  onSelectModule: (module: AdminModuleKey) => void;
}

const MODULE_ITEMS: Array<{ key: AdminModuleKey; label: string; icon: React.ReactNode; category: string }> = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, category: 'Overview' },
  { key: 'words', label: 'Words Manager', icon: <FileText className="w-4 h-4" />, category: 'Game Data' },
  { key: 'players', label: 'Players & Bots', icon: <Users className="w-4 h-4" />, category: 'Game Data' },
  { key: 'rooms', label: 'Live Rooms', icon: <Tv className="w-4 h-4" />, category: 'Game Data' },
  { key: 'content', label: 'Content Editor', icon: <Edit3 className="w-4 h-4" />, category: 'Customization' },
  { key: 'assets', label: 'Asset Manager', icon: <ImageIcon className="w-4 h-4" />, category: 'Customization' },
  { key: 'theme', label: 'Theme & Branding', icon: <Palette className="w-4 h-4" />, category: 'Customization' },
  { key: 'game-rules', label: 'Game Rules', icon: <Sliders className="w-4 h-4" />, category: 'Control' },
  { key: 'features', label: 'Feature Flags', icon: <Flag className="w-4 h-4" />, category: 'Control' },
  { key: 'moderation', label: 'Moderation', icon: <ShieldCheck className="w-4 h-4" />, category: 'Control' },
  { key: 'languages', label: 'Languages & SEO', icon: <LanguagesIcon className="w-4 h-4" />, category: 'Web & SEO' },
  { key: 'seo-audit', label: 'SEO Audit', icon: <ShieldCheckIcon className="w-4 h-4" />, category: 'Web & SEO' },
  { key: 'export', label: 'Export & Deploy', icon: <Package className="w-4 h-4" />, category: 'Web & SEO' },
  { key: 'sounds', label: 'Sound Manager', icon: <Volume2 className="w-4 h-4" />, category: 'Web & SEO' },
  { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, category: 'System' },
  { key: 'audit', label: 'Audit Log', icon: <History className="w-4 h-4" />, category: 'System' },
  { key: 'data', label: 'Backup & Reset', icon: <Database className="w-4 h-4" />, category: 'System' },
  { key: 'team', label: 'Admin Team', icon: <UserCheck className="w-4 h-4" />, category: 'System' },
  { key: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, category: 'System' },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeModule, onSelectModule }) => {
  return (
    <aside className="w-full md:w-64 glass-panel border-r border-[var(--border)] p-4 flex flex-col justify-between shrink-0 overflow-y-auto max-h-screen">
      <div className="space-y-6">
        {/* Navigation List Grouped */}
        {['Overview', 'Game Data', 'Customization', 'Control', 'Web & SEO', 'System'].map((cat) => {
          const items = MODULE_ITEMS.filter((i) => i.category === cat);
          if (items.length === 0) return null;

          return (
            <div key={cat} className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] px-3">
                {cat}
              </span>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive = activeModule === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        playSound('click');
                        onSelectModule(item.key);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-mono text-xs transition-all ${
                        isActive
                          ? 'bg-[var(--accent)] text-[var(--accent-inverse)] font-bold shadow'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-[var(--border)] text-[10px] font-mono text-[var(--text-muted)] text-center">
        SpaceDraw Admin v1.0
      </div>
    </aside>
  );
};

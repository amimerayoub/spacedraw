'use client';

import React from 'react';
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { AdminModuleKey } from './AdminSidebar';
import { playSound } from '../../lib/sound';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (module: AdminModuleKey) => void;
  onExecuteAction: (actionId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectModule,
  onExecuteAction,
}) => {
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const COMMAND_ITEMS = [
    { id: 'nav-dashboard', label: 'Go to Dashboard', category: 'Navigation', type: 'nav', module: 'dashboard' as AdminModuleKey },
    { id: 'nav-words', label: 'Go to Words Manager', category: 'Navigation', type: 'nav', module: 'words' as AdminModuleKey },
    { id: 'nav-players', label: 'Go to Players & Bots', category: 'Navigation', type: 'nav', module: 'players' as AdminModuleKey },
    { id: 'nav-rooms', label: 'Go to Live Rooms', category: 'Navigation', type: 'nav', module: 'rooms' as AdminModuleKey },
    { id: 'nav-content', label: 'Go to Content Editor', category: 'Navigation', type: 'nav', module: 'content' as AdminModuleKey },
    { id: 'nav-assets', label: 'Go to Asset Manager', category: 'Navigation', type: 'nav', module: 'assets' as AdminModuleKey },
    { id: 'nav-theme', label: 'Go to Theme & Branding', category: 'Navigation', type: 'nav', module: 'theme' as AdminModuleKey },
    { id: 'nav-game-rules', label: 'Go to Game Rules', category: 'Navigation', type: 'nav', module: 'game-rules' as AdminModuleKey },
    { id: 'nav-features', label: 'Go to Feature Flags', category: 'Navigation', type: 'nav', module: 'features' as AdminModuleKey },
    { id: 'nav-moderation', label: 'Go to Moderation', category: 'Navigation', type: 'nav', module: 'moderation' as AdminModuleKey },
    { id: 'nav-languages', label: 'Go to Languages & SEO', category: 'Navigation', type: 'nav', module: 'languages' as AdminModuleKey },
    { id: 'nav-seo-audit', label: 'Go to SEO Audit', category: 'Navigation', type: 'nav', module: 'seo-audit' as AdminModuleKey },
    { id: 'nav-export', label: 'Go to Export & Deploy', category: 'Navigation', type: 'nav', module: 'export' as AdminModuleKey },
    { id: 'nav-sounds', label: 'Go to Sound Manager', category: 'Navigation', type: 'nav', module: 'sounds' as AdminModuleKey },
    { id: 'nav-analytics', label: 'Go to Analytics', category: 'Navigation', type: 'nav', module: 'analytics' as AdminModuleKey },
    { id: 'nav-audit', label: 'Go to Audit Log', category: 'Navigation', type: 'nav', module: 'audit' as AdminModuleKey },
    { id: 'nav-data', label: 'Go to Backup & Reset', category: 'Navigation', type: 'nav', module: 'data' as AdminModuleKey },
    { id: 'act-add-word', label: 'Quick Action: Add Word', category: 'Action', type: 'act', actionId: 'add-word' },
    { id: 'act-toggle-maintenance', label: 'Quick Action: Toggle Maintenance Mode', category: 'Action', type: 'act', actionId: 'toggle-maintenance' },
    { id: 'act-export-backup', label: 'Quick Action: Export Full Backup JSON', category: 'Action', type: 'act', actionId: 'export-backup' },
  ];

  const filtered = COMMAND_ITEMS.filter((i) =>
    i.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[var(--glass-modal)] backdrop-blur-md flex items-start justify-center pt-20 p-4">
      <div
        className="glass-panel-strong max-w-xl w-full p-4 rounded-2xl border border-[var(--border-strong)] space-y-4 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3 px-2">
          <Search className="w-5 h-5 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search page..."
            autoFocus
            className="w-full bg-transparent text-[var(--text-primary)] font-mono text-sm focus:outline-none placeholder-[var(--text-muted)]"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-1 font-mono text-xs">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-[var(--text-muted)]">No matching commands found</div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  playSound('click');
                  if (item.type === 'nav' && item.module) {
                    onSelectModule(item.module);
                  } else if (item.type === 'act' && item.actionId) {
                    onExecuteAction(item.actionId);
                  }
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-hover)] text-left text-[var(--text-primary)] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-secondary)]">
                    {item.category}
                  </span>
                  <span>{item.label}</span>
                </div>
                <CornerDownLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-secondary)]" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

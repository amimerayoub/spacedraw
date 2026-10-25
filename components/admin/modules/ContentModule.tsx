'use client';

import React from 'react';
import { Edit3, Eye, Save, RotateCcw, Plus, Trash2, Check } from 'lucide-react';
import { DEFAULT_SITE_CONFIG } from '../../../lib/admin/schema';
import { AdminRole, can } from '../../../lib/admin/permissions';
import { playSound } from '../../../lib/sound';

interface ContentModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

export const ContentModule: React.FC<ContentModuleProps> = ({ currentRole, onShowToast }) => {
  const [heroTitle, setHeroTitle] = React.useState(DEFAULT_SITE_CONFIG.content.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = React.useState(DEFAULT_SITE_CONFIG.content.heroSubtitle);
  const [playButtonText, setPlayButtonText] = React.useState(DEFAULT_SITE_CONFIG.content.playButtonText);
  const [createRoomButtonText, setCreateRoomButtonText] = React.useState(DEFAULT_SITE_CONFIG.content.createRoomButtonText);

  const [activePage, setActivePage] = React.useState<'about' | 'rules' | 'privacy' | 'credits'>('about');
  const [pagesText, setPagesText] = React.useState({ ...DEFAULT_SITE_CONFIG.content.pages });

  const canEdit = can(currentRole, 'edit_content');

  const handleSaveContent = () => {
    if (!canEdit) return;
    onShowToast('Landing page content & footer pages saved and published.');
    playSound('click');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">
            Content Editor & Live Preview
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Edit landing headlines, button copy, feature cards, and footer modal pages.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleSaveContent}
            className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-mono text-xs font-bold flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>Publish Changes</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Pane */}
        <section className="glass-panel p-6 space-y-6">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="font-semibold text-base text-[var(--text-primary)]">Hero & Buttons Copy</h3>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase text-[var(--text-secondary)]">Hero Title</label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase text-[var(--text-secondary)]">Hero Subtitle</label>
              <textarea
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                disabled={!canEdit}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase text-[var(--text-secondary)]">Primary Button</label>
                <input
                  type="text"
                  value={playButtonText}
                  onChange={(e) => setPlayButtonText(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase text-[var(--text-secondary)]">Secondary Button</label>
                <input
                  type="text"
                  value={createRoomButtonText}
                  onChange={(e) => setCreateRoomButtonText(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base text-[var(--text-primary)]">Footer Pages Markdown</h3>
              <div className="flex gap-1">
                {(['about', 'rules', 'privacy', 'credits'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePage(p)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-lg capitalize border ${
                      activePage === p
                        ? 'bg-[var(--accent)] text-[var(--accent-inverse)] border-[var(--accent)] font-bold'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border)]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={pagesText[activePage]}
              onChange={(e) => setPagesText({ ...pagesText, [activePage]: e.target.value })}
              disabled={!canEdit}
              rows={5}
              className="w-full p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] font-mono text-xs text-[var(--text-primary)] focus:outline-none"
            />
          </div>
        </section>

        {/* Live Preview Pane */}
        <section className="glass-panel p-6 space-y-6 flex flex-col justify-between border border-[var(--border-strong)]">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[var(--text-primary)]" />
                <h3 className="font-semibold text-base text-[var(--text-primary)]">Split-Pane Live Preview</h3>
              </div>
              <span className="text-xs font-mono text-[var(--text-secondary)]">Public Site Rendering</span>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] space-y-4 text-center">
              <h1 className="font-display font-bold text-4xl text-[var(--text-primary)]">{heroTitle}</h1>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">{heroSubtitle}</p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="px-4 py-2 rounded-full bg-[var(--accent)] text-[var(--accent-inverse)] font-medium text-xs">
                  {playButtonText}
                </span>
                <span className="px-4 py-2 rounded-full glass-panel border border-[var(--border)] text-[var(--text-primary)] font-medium text-xs">
                  {createRoomButtonText}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] space-y-2">
              <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] capitalize">
                Page Preview: {activePage}
              </span>
              <p className="text-xs text-[var(--text-primary)] font-sans leading-relaxed">
                {pagesText[activePage]}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

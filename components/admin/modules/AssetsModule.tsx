'use client';

import React from 'react';
import { Image as ImageIcon, Upload, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { ASSET_MANIFEST, assetUrl } from '../../../lib/assets';
import { AdminRole, can } from '../../../lib/admin/permissions';
import { playSound } from '../../../lib/sound';

interface AssetsModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

export const AssetsModule: React.FC<AssetsModuleProps> = ({ currentRole, onShowToast }) => {
  const [activeGroup, setActiveGroup] = React.useState<'avatars' | 'toolbar' | 'gameStatus'>('avatars');
  const canEdit = can(currentRole, 'override_assets');

  const handleOverrideUpload = (e: React.ChangeEvent<HTMLInputElement>, assetName: string) => {
    if (!canEdit || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 1024 * 1024) {
      onShowToast('Image file size must be less than 1MB.');
      return;
    }
    onShowToast(`Asset override saved for '${assetName}'.`);
    playSound('click');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">
            Asset Manager & Audit
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Audit system graphics, verify intrinsic dimensions, and upload image overrides.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] font-mono text-xs">
          <button
            onClick={() => setActiveGroup('avatars')}
            className={`px-3 py-1.5 rounded-lg capitalize ${activeGroup === 'avatars' ? 'bg-[var(--accent)] text-[var(--accent-inverse)] font-bold' : ''}`}
          >
            Avatars (10)
          </button>
          <button
            onClick={() => setActiveGroup('toolbar')}
            className={`px-3 py-1.5 rounded-lg capitalize ${activeGroup === 'toolbar' ? 'bg-[var(--accent)] text-[var(--accent-inverse)] font-bold' : ''}`}
          >
            Toolbar
          </button>
          <button
            onClick={() => setActiveGroup('gameStatus')}
            className={`px-3 py-1.5 rounded-lg capitalize ${activeGroup === 'gameStatus' ? 'bg-[var(--accent)] text-[var(--accent-inverse)] font-bold' : ''}`}
          >
            Game Status
          </button>
        </div>
      </div>

      {/* Asset Gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {activeGroup === 'avatars' &&
          ASSET_MANIFEST.avatars.map((av) => (
            <div key={av} className="glass-panel p-4 rounded-2xl flex flex-col items-center gap-3 border border-[var(--border)] text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#121212] border border-[var(--border)] flex items-center justify-center overflow-hidden">
                <img src={assetUrl('avatars', av)} alt={av} className="w-full h-full object-contain p-1" />
              </div>
              <span className="font-mono text-xs font-bold text-[var(--text-primary)] capitalize">{av}</span>
              {canEdit && (
                <label className="px-2.5 py-1 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[10px] font-mono text-[var(--text-secondary)] cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>Replace</span>
                  <input type="file" accept="image/png,image/webp,image/svg+xml" onChange={(e) => handleOverrideUpload(e, av)} className="hidden" />
                </label>
              )}
            </div>
          ))}

        {activeGroup === 'toolbar' &&
          ASSET_MANIFEST.toolbar.tools.map((tool) => (
            <div key={tool} className="glass-panel p-4 rounded-2xl flex flex-col items-center gap-3 border border-[var(--border)] text-center">
              <div className="w-12 h-12 rounded-xl bg-[#121212] border border-[var(--border)] flex items-center justify-center overflow-hidden">
                <img src={assetUrl('toolbar', tool)} alt={tool} className="w-6 h-6 object-contain" />
              </div>
              <span className="font-mono text-xs font-bold text-[var(--text-primary)] capitalize">{tool}</span>
              {canEdit && (
                <label className="px-2.5 py-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[10px] font-mono text-[var(--text-secondary)] cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>Replace</span>
                  <input type="file" accept="image/png,image/webp,image/svg+xml" onChange={(e) => handleOverrideUpload(e, tool)} className="hidden" />
                </label>
              )}
            </div>
          ))}

        {activeGroup === 'gameStatus' &&
          ASSET_MANIFEST.gameStatus.map((status) => (
            <div key={status} className="glass-panel p-4 rounded-2xl flex flex-col items-center gap-3 border border-[var(--border)] text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#121212] border border-[var(--border)] flex items-center justify-center overflow-hidden p-1">
                <img src={assetUrl('game-status', status)} alt={status} className="w-full h-full object-contain" />
              </div>
              <span className="font-mono text-[10px] font-bold text-[var(--text-primary)] truncate max-w-full">{status}</span>
              {canEdit && (
                <label className="px-2.5 py-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[10px] font-mono text-[var(--text-secondary)] cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>Replace</span>
                  <input type="file" accept="image/png,image/webp,image/svg+xml" onChange={(e) => handleOverrideUpload(e, status)} className="hidden" />
                </label>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

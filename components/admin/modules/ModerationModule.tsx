'use client';

import React from 'react';
import { ShieldCheck, Plus, Trash2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { DEFAULT_SITE_CONFIG } from '../../../lib/admin/schema';
import { AdminRole, can } from '../../../lib/admin/permissions';
import { playSound } from '../../../lib/sound';

interface ModerationModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

export const ModerationModule: React.FC<ModerationModuleProps> = ({ currentRole, onShowToast }) => {
  const [nicknamesBlocklist, setNicknamesBlocklist] = React.useState<string[]>([
    ...DEFAULT_SITE_CONFIG.moderation.blocklist.nicknames,
  ]);
  const [newNickname, setNewNickname] = React.useState('');

  const [reports, setReports] = React.useState([
    { id: 'rep-101', player: 'Bot_Unfriendly', reason: 'Inappropriate nickname', status: 'Open', timestamp: '10m ago' },
    { id: 'rep-102', player: 'SpammerBot', reason: 'Repeated chat spamming', status: 'Open', timestamp: '25m ago' },
  ]);

  const canEdit = can(currentRole, 'manage_moderation');

  const handleAddNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    const trimmed = newNickname.trim().toLowerCase();
    if (!trimmed) return;
    if (nicknamesBlocklist.includes(trimmed)) {
      onShowToast(`'${trimmed}' is already in the blocklist.`);
      return;
    }
    setNicknamesBlocklist([...nicknamesBlocklist, trimmed]);
    setNewNickname('');
    onShowToast(`Added '${trimmed}' to nickname blocklist.`);
    playSound('click');
  };

  const handleRemoveNickname = (name: string) => {
    if (!canEdit) return;
    setNicknamesBlocklist(nicknamesBlocklist.filter((n) => n !== name));
    onShowToast(`Removed '${name}' from blocklist.`);
    playSound('click');
  };

  const handleResolveReport = (id: string, action: 'ban' | 'dismiss') => {
    if (!canEdit) return;
    setReports(reports.map((r) => (r.id === id ? { ...r, status: action === 'ban' ? 'Resolved (Banned)' : 'Dismissed' } : r)));
    onShowToast(`Report ${id} marked as ${action}.`);
    playSound('click');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">
            Moderation & Blocklists
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Manage blocked nicknames, chat word filters, and simulated player reports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Blocked Nicknames Section */}
        <section className="glass-panel p-6 space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="font-semibold text-base text-[var(--text-primary)]">Blocked Nicknames List</h3>
          </div>

          {canEdit && (
            <form onSubmit={handleAddNickname} className="flex gap-2">
              <input
                type="text"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder="Add blocked nickname..."
                className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-mono text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {nicknamesBlocklist.map((name) => (
              <span
                key={name}
                className="px-3 py-1 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] font-mono text-xs text-[var(--text-primary)] flex items-center gap-2"
              >
                <span>{name}</span>
                {canEdit && (
                  <button onClick={() => handleRemoveNickname(name)} className="hover:text-red-400">
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </section>

        {/* Reports Queue */}
        <section className="glass-panel p-6 space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="font-semibold text-base text-[var(--text-primary)]">Simulated Reports Queue</h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {reports.map((rep) => (
              <div key={rep.id} className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)]">{rep.player}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{rep.timestamp}</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">{rep.reason}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border)]">
                    Status: {rep.status}
                  </span>
                  {rep.status === 'Open' && canEdit && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'ban')}
                        className="px-2.5 py-1 rounded bg-[var(--accent)] text-[var(--accent-inverse)] font-bold text-[10px]"
                      >
                        Ban Player
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'dismiss')}
                        className="px-2.5 py-1 rounded bg-[var(--bg-hover)] border border-[var(--border)] text-[10px]"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

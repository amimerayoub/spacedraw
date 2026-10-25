'use client';

import React from 'react';
import { History, Download, Search, FileText } from 'lucide-react';
import { AdminRole } from '../../../lib/admin/permissions';
import { playSound } from '../../../lib/sound';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorRole: AdminRole;
  action: string;
  entity: string;
  summary: string;
}

interface AuditModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

export const AuditModule: React.FC<AuditModuleProps> = ({ currentRole, onShowToast }) => {
  const [logs] = React.useState<AuditLogEntry[]>([
    { id: 'aud-1', timestamp: '2026-10-23 17:05', actorRole: 'Owner', action: 'UPDATE_CONFIG', entity: 'GameRules', summary: 'Updated drawTime from 45s to 60s' },
    { id: 'aud-2', timestamp: '2026-10-23 16:50', actorRole: 'Admin', action: 'ADD_WORD', entity: 'WordBank', summary: 'Added word "supernova" to space category' },
    { id: 'aud-3', timestamp: '2026-10-23 16:20', actorRole: 'Moderator', action: 'MUTE_PLAYER', entity: 'Player', summary: 'Muted player "SpammerBot"' },
    { id: 'aud-4', timestamp: '2026-10-23 15:00', actorRole: 'Owner', action: 'CREATE_PASSCODE', entity: 'Auth', summary: 'Initial Owner passcode created' },
  ]);

  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredLogs = logs.filter(
    (l) =>
      l.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actorRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spacedraw-audit-log.json';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported Audit Log JSON.');
    playSound('click');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">
            Append-Only Audit Log
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Immutable record of every administrative action, config mutation, and role switch.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] font-mono text-xs flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log</span>
        </button>
      </div>

      <div className="relative w-full">
        <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search audit log..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] focus:outline-none"
        />
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-[var(--border)]">
        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Role</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--bg-hover)]">
                  <td className="p-3 text-[var(--text-muted)]">{log.timestamp}</td>
                  <td className="p-3 font-bold text-[var(--text-primary)]">{log.actorRole}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border)] text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--text-secondary)]">{log.entity}</td>
                  <td className="p-3 text-[var(--text-primary)]">{log.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { UserCheck, Shield, Plus, Trash2, Edit2 } from 'lucide-react';
import { AdminRole, can } from '../../../lib/admin/permissions';
import { playSound } from '../../../lib/sound';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: 'Active' | 'Invited';
}

interface TeamModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

export const TeamModule: React.FC<TeamModuleProps> = ({ currentRole, onShowToast }) => {
  const [team, setTeam] = React.useState<TeamMember[]>([
    { id: 't1', name: 'Alex Owner', email: 'owner@spacedraw.local', role: 'Owner', status: 'Active' },
    { id: 't2', name: 'Jordan Admin', email: 'admin@spacedraw.local', role: 'Admin', status: 'Active' },
    { id: 't3', name: 'Morgan Mod', email: 'mod@spacedraw.local', role: 'Moderator', status: 'Active' },
    { id: 't4', name: 'Sam Observer', email: 'viewer@spacedraw.local', role: 'Viewer', status: 'Active' },
  ]);

  const canManage = can(currentRole, 'manage_team');

  const handleRoleChange = (id: string, newRole: AdminRole) => {
    if (!canManage) return;
    setTeam(team.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
    onShowToast(`Updated team member role to ${newRole}.`);
    playSound('click');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">
            Simulated Admin Team
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Manage admin team profiles and simulated role permissions.
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-[var(--border)]">
        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-3">Member</th>
                <th className="p-3">Email</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-[var(--bg-hover)]">
                  <td className="p-3 font-bold text-[var(--text-primary)]">{member.name}</td>
                  <td className="p-3 text-[var(--text-secondary)]">{member.email}</td>
                  <td className="p-3">
                    {canManage && member.role !== 'Owner' ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as AdminRole)}
                        className="px-2 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Moderator">Moderator</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border)] font-bold">
                        {member.role}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-[var(--text-muted)]">{member.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { Users, Plus, ShieldOff, VolumeX, Volume2, UserX, RefreshCw, Check } from 'lucide-react';
import { ASSET_MANIFEST, assetUrl } from '../../../lib/assets';
import { AdminRole, can } from '../../../lib/admin/permissions';
import { playSound } from '../../../lib/sound';

interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  score: number;
  gamesPlayed: number;
  isMuted: boolean;
  isBanned: boolean;
  lastSeen: string;
}

interface PlayersModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

export const PlayersModule: React.FC<PlayersModuleProps> = ({ currentRole, onShowToast }) => {
  const [players, setPlayers] = React.useState<PlayerProfile[]>([
    { id: 'p1', name: 'SpaceCadet', avatar: 'astronaut', isBot: false, score: 363, gamesPlayed: 5, isMuted: false, isBanned: false, lastSeen: 'Just now' },
    { id: 'p2', name: 'PixelMaster', avatar: 'samurai', isBot: true, score: 572, gamesPlayed: 8, isMuted: false, isBanned: false, lastSeen: 'Just now' },
    { id: 'p3', name: 'SketchQueen', avatar: 'cat', isBot: true, score: 210, gamesPlayed: 4, isMuted: false, isBanned: false, lastSeen: '2m ago' },
    { id: 'p4', name: 'PaintBot', avatar: 'robot', isBot: true, score: 412, gamesPlayed: 6, isMuted: false, isBanned: false, lastSeen: 'Just now' },
  ]);

  const canEdit = can(currentRole, 'manage_players');

  const handleMuteToggle = (id: string) => {
    if (!canEdit) return;
    setPlayers(players.map((p) => (p.id === id ? { ...p, isMuted: !p.isMuted } : p)));
    onShowToast('Player mute status updated.');
    playSound('click');
  };

  const handleBanToggle = (id: string) => {
    if (!canEdit) return;
    setPlayers(players.map((p) => (p.id === id ? { ...p, isBanned: !p.isBanned } : p)));
    onShowToast('Player ban status updated.');
    playSound('click');
  };

  const handleResetStats = (id: string) => {
    if (!canEdit) return;
    setPlayers(players.map((p) => (p.id === id ? { ...p, score: 0, gamesPlayed: 0 } : p)));
    onShowToast('Player stats reset.');
    playSound('click');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">
            Players & Simulated Bots
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Manage player profiles, mute/ban states, avatars, and reset stats.
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-[var(--border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-3">Player</th>
                <th className="p-3">Type</th>
                <th className="p-3">Total Score</th>
                <th className="p-3">Games</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {players.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--bg-hover)]">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#121212] border border-[var(--border)] overflow-hidden flex items-center justify-center">
                        <img src={assetUrl('avatars', p.avatar)} alt={p.name} className="w-full h-full object-contain p-0.5" />
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3">{p.isBot ? 'Bot' : 'Local User'}</td>
                  <td className="p-3 font-bold">{p.score}</td>
                  <td className="p-3">{p.gamesPlayed}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      {p.isBanned ? (
                        <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-800 text-red-300">Banned</span>
                      ) : p.isMuted ? (
                        <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300">Muted</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-green-950/60 border border-green-800 text-green-300">Active</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    {canEdit && (
                      <>
                        <button
                          onClick={() => handleMuteToggle(p.id)}
                          className="p-1.5 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)]"
                          title={p.isMuted ? 'Unmute' : 'Mute'}
                        >
                          {p.isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleBanToggle(p.id)}
                          className="p-1.5 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)]"
                          title={p.isBanned ? 'Unban' : 'Ban'}
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleResetStats(p.id)}
                          className="p-1.5 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)]"
                          title="Reset Stats"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { Tv, RefreshCw, XCircle, AlertOctagon, UserX, Play, Eye } from 'lucide-react';
import { AdminRole, can } from '../../../lib/admin/permissions';
import { playSound } from '../../../lib/sound';

interface LiveRoom {
  code: string;
  host: string;
  playerCount: number;
  phase: string;
  round: string;
  uptime: string;
}

interface RoomsModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

export const RoomsModule: React.FC<RoomsModuleProps> = ({ currentRole, onShowToast }) => {
  const [rooms, setRooms] = React.useState<LiveRoom[]>([
    { code: 'SD-8445', host: 'SpaceCadet', playerCount: 4, phase: 'DRAWING', round: '1 / 3', uptime: '3m 12s' },
    { code: 'SD-3190', host: 'PixelMaster', playerCount: 3, phase: 'LOBBY', round: '1 / 3', uptime: '1m 05s' },
  ]);

  const canEdit = can(currentRole, 'manage_rooms');

  // Auto refresh live rooms list every 2 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live room pulse
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCloseRoom = (code: string) => {
    if (!canEdit) return;
    setRooms(rooms.filter((r) => r.code !== code));
    onShowToast(`Room ${code} closed.`);
    playSound('click');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">
            Live Simulated Rooms
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Inspect active game rooms, force-end rounds, kick players, or terminate rooms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Auto-Refreshing</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((room) => (
          <div key={room.code} className="glass-panel p-5 rounded-2xl space-y-4 border border-[var(--border)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">Room Code</span>
                <h3 className="font-mono font-bold text-2xl text-[var(--text-primary)]">{room.code}</h3>
              </div>

              <div className="flex flex-col items-end">
                <span className="px-2.5 py-1 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)]">
                  {room.phase}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)] pt-1">Uptime: {room.uptime}</span>
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs text-[var(--text-secondary)]">
              <div className="flex justify-between">
                <span>Host Player:</span>
                <span className="text-[var(--text-primary)] font-bold">{room.host}</span>
              </div>
              <div className="flex justify-between">
                <span>Players Joined:</span>
                <span className="text-[var(--text-primary)] font-bold">{room.playerCount} / 8</span>
              </div>
              <div className="flex justify-between">
                <span>Current Round:</span>
                <span className="text-[var(--text-primary)] font-bold">{room.round}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2 justify-end">
              {canEdit && (
                <button
                  onClick={() => handleCloseRoom(room.code)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Terminate Room</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

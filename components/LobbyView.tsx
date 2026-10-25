'use client';

import React from 'react';
import Image from 'next/image';
import { Copy, Share2, Play, LogOut, Shield, Crown, Radio, Check, Users } from 'lucide-react';
import { Player, RoomState, RoomSettings } from '../lib/services/game-service';
import { assetUrl } from '../lib/assets';
import { play, playSound } from '../lib/sound';

interface LobbyViewProps {
  roomState: RoomState;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onUpdateSettings: (patch: Partial<RoomSettings>) => void;
  onShowToast: (message: string) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  roomState,
  onStartGame,
  onLeaveRoom,
  onUpdateSettings,
  onShowToast,
}) => {
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  const isHost = roomState.players.find((p) => p.isHost)?.id === roomState.hostId;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomState.code);
      setCopiedCode(true);
      onShowToast(`Room code '${roomState.code}' copied to clipboard!`);
      play('notification');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      onShowToast(`Room Code: ${roomState.code}`);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}#/play?code=${roomState.code}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      onShowToast('Invite link copied to clipboard!');
      play('notification');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      onShowToast('Failed to copy link');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner: Room Code & Invite Share */}
      <div className="glass-panel-strong p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-[var(--border-strong)]">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-mono uppercase text-[var(--text-secondary)]">Room Code</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] text-[10px] font-mono text-[var(--text-secondary)]">
              <Radio className="w-3 h-3 text-[var(--text-primary)] animate-pulse" />
              <span>Demo Room</span>
            </div>
          </div>
          <h2 className="font-mono font-bold text-4xl sm:text-5xl tracking-wider text-[var(--text-primary)]">
            {roomState.code}
          </h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleCopyCode}
            className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-mono flex items-center justify-center gap-2 transition-all"
          >
            {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-medium text-sm flex items-center justify-center gap-2 transition-transform hover:scale-105"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied' : 'Invite Link'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Players List & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Players List */}
        <section className="lg:col-span-2 glass-panel p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--text-primary)]" />
                <h3 className="font-semibold text-lg text-[var(--text-primary)]">
                  Players ({roomState.players.length}/8)
                </h3>
              </div>
              <span className="text-xs font-mono text-[var(--text-secondary)]">
                Waiting for host to start
              </span>
            </div>

            {/* Empty Lobby state */}
            {roomState.players.length === 1 && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <img
                  src={assetUrl('game-status', 'empty-lobby')}
                  alt="Empty lobby"
                  className="w-32 h-32 object-contain opacity-60"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <p className="text-sm text-[var(--text-secondary)] max-w-sm">
                  You are currently the only player in this room. Add simulated bots in room settings to start!
                </p>
              </div>
            )}

            {/* Player Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roomState.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#121212] flex items-center justify-center overflow-hidden border border-[var(--border)]">
                      <img
                        src={assetUrl('avatars', player.avatar)}
                        alt={player.name}
                        className="w-full h-full object-contain p-0.5"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          if (target.parentElement) {
                            target.parentElement.innerText = player.name.charAt(0).toUpperCase();
                            target.parentElement.style.color = '#FFFFFF';
                            target.parentElement.style.fontWeight = 'bold';
                          }
                        }}
                      />
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm text-[var(--text-primary)] truncate max-w-[120px]">
                          {player.name}
                        </span>
                        {player.isHost && (
                          <img
                            src={assetUrl('game-status', 'crown-small')}
                            alt="Host Crown"
                            className="w-4 h-4 object-contain"
                            title="Host"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {player.isBot ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border)]">
                            BOT
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[var(--text-secondary)]">YOU</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-[var(--text-secondary)]">Ready</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lobby Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-[var(--border)]">
            <button
              onClick={() => {
                playSound('click');
                onLeaveRoom();
              }}
              className="px-5 py-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave</span>
            </button>

            <button
              onClick={() => {
                playSound('click');
                onStartGame();
              }}
              className="flex-1 py-3.5 px-6 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-medium text-base flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Game</span>
            </button>
          </div>
        </section>

        {/* Room Settings Side Panel */}
        <section className="glass-panel p-6 space-y-6">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="font-semibold text-lg text-[var(--text-primary)]">Game Parameters</h3>
          </div>

          <div className="space-y-4 text-sm font-mono">
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-secondary)]">Rounds</span>
              <span className="text-[var(--text-primary)] font-bold">{roomState.settings.rounds}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-secondary)]">Draw Time</span>
              <span className="text-[var(--text-primary)] font-bold">{roomState.settings.drawTime}s</span>
            </div>

            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-secondary)]">Difficulty</span>
              <span className="text-[var(--text-primary)] font-bold capitalize">{roomState.settings.difficulty}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-secondary)]">Hints Enabled</span>
              <span className="text-[var(--text-primary)] font-bold">{roomState.settings.hints ? 'Yes' : 'No'}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-secondary)]">Bot Players</span>
              <span className="text-[var(--text-primary)] font-bold">{roomState.settings.botCount}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] space-y-1">
            <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[var(--text-primary)] animate-pulse" />
              <span>Demo Mode Active</span>
            </div>
            <p>All bot opponents, guesses, and countdown timers are simulated in real-time in this browser session.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

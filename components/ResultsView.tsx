'use client';

import React from 'react';
import Image from 'next/image';
import { RotateCcw, Users, Home, Trophy } from 'lucide-react';
import { RoomState, Player } from '../lib/services/game-service';
import { assetUrl } from '../lib/assets';
import { playSound } from '../lib/sound';

interface ResultsViewProps {
  roomState: RoomState;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
  onGoHome: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  roomState,
  onPlayAgain,
  onReturnToLobby,
  onGoHome,
}) => {
  const sortedPlayers = React.useMemo(() => {
    return [...roomState.players].sort((a, b) => b.score - a.score);
  }, [roomState.players]);

  const winner = sortedPlayers[0];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Winner Hero Header */}
      <div className="glass-panel-strong p-8 rounded-2xl text-center space-y-6 border border-[var(--border-strong)] relative overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative">
            <img
              src={assetUrl('game-status', 'trophy')}
              alt="Trophy"
              className="w-24 h-24 object-contain animate-bounce"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <img
              src={assetUrl('game-status', 'crown-large')}
              alt="Winner Crown"
              className="w-12 h-12 object-contain absolute -top-4 -right-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-[var(--text-secondary)]">
            Match Winner
          </span>
          <h2 className="font-display font-bold text-4xl sm:text-6xl text-[var(--text-primary)]">
            {winner?.name || 'SpaceDraw Champion'}
          </h2>
          <span className="font-mono font-bold text-xl text-[var(--text-primary)] bg-[var(--bg-tertiary)] px-4 py-1.5 rounded-full border border-[var(--border)]">
            {winner?.score || 0} Points
          </span>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h3 className="font-semibold text-lg text-[var(--text-primary)]">Final Leaderboard</h3>
          <span className="font-mono text-xs text-[var(--text-secondary)]">
            {roomState.totalRounds} Rounds Completed
          </span>
        </div>

        <div className="space-y-3">
          {sortedPlayers.map((player, idx) => {
            const medalAsset = idx === 0 ? 'medal-1' : idx === 1 ? 'medal-2' : idx === 2 ? 'medal-3' : null;
            return (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]"
              >
                <div className="flex items-center gap-4">
                  <div className="font-mono font-bold text-base text-[var(--text-secondary)] w-6 text-center">
                    {medalAsset ? (
                      <img
                        src={assetUrl('game-status', medalAsset)}
                        alt={`Rank ${idx + 1}`}
                        className="w-6 h-6 object-contain mx-auto"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      `#${idx + 1}`
                    )}
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-[#121212] border border-[var(--border)] flex items-center justify-center overflow-hidden">
                    <img
                      src={assetUrl('avatars', player.avatar)}
                      alt={player.name}
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>

                  <div className="flex flex-col">
                    <span className="font-bold text-base text-[var(--text-primary)]">
                      {player.name}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                      {player.isBot ? 'Bot Player' : 'Host Player'}
                    </span>
                  </div>
                </div>

                <span className="font-mono font-bold text-lg text-[var(--text-primary)]">
                  {player.score} pts
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => {
            playSound('click');
            onPlayAgain();
          }}
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-[var(--accent)] text-[var(--accent-inverse)] font-medium text-base flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Play Again</span>
        </button>

        <button
          onClick={() => {
            playSound('click');
            onReturnToLobby();
          }}
          className="w-full sm:w-auto px-8 py-4 rounded-full glass-panel-strong hover:bg-[var(--bg-hover)] border border-[var(--border-strong)] text-[var(--text-primary)] font-medium text-base flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
        >
          <Users className="w-5 h-5" />
          <span>Return to Lobby</span>
        </button>

        <button
          onClick={() => {
            playSound('click');
            onGoHome();
          }}
          className="w-full sm:w-auto px-8 py-4 rounded-full glass-panel hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] font-medium text-base flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>
      </div>
    </div>
  );
};

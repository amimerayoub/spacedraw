'use client';

import React from 'react';
import Image from 'next/image';
import { User, Shield, Sliders, Users, Play, LogIn, Sparkles, Check, AlertCircle } from 'lucide-react';
import { ASSET_MANIFEST, assetUrl } from '../lib/assets';
import { RoomSettings } from '../lib/services/game-service';
import { playSound } from '../lib/sound';

interface SetupViewProps {
  nickname: string;
  avatar: string;
  settings: RoomSettings;
  onChangeNickname: (name: string) => void;
  onChangeAvatar: (avatar: string) => void;
  onChangeSettings: (patch: Partial<RoomSettings>) => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onStartPractice: () => void;
}

export const SetupView: React.FC<SetupViewProps> = ({
  nickname,
  avatar,
  settings,
  onChangeNickname,
  onChangeAvatar,
  onChangeSettings,
  onCreateRoom,
  onJoinRoom,
  onStartPractice,
}) => {
  const [joinCodeInput, setJoinCodeInput] = React.useState('');
  const [joinError, setJoinError] = React.useState('');
  const [nameError, setNameError] = React.useState('');

  const validateName = (val: string): boolean => {
    const trimmed = val.trim();
    if (trimmed.length < 2) {
      setNameError('Nickname must be at least 2 characters.');
      return false;
    }
    if (trimmed.length > 16) {
      setNameError('Nickname must be 16 characters or less.');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChangeNickname(val);
    validateName(val);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateName(nickname)) return;
    playSound('click');
    onCreateRoom();
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateName(nickname)) return;
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) {
      setJoinError('Please enter a room code.');
      return;
    }
    setJoinError('');
    playSound('click');
    onJoinRoom(code);
  };

  const handlePracticeClick = () => {
    if (!validateName(nickname)) return;
    playSound('click');
    onStartPractice();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="font-display font-bold text-3xl sm:text-5xl text-[var(--text-primary)]">
          Player Profile & Setup
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">
          Customize your avatar, nickname, and room parameters before entering SpaceDraw.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Card */}
        <section className="glass-panel p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <User className="w-5 h-5 text-[var(--text-primary)]" />
              <h3 className="font-semibold text-lg text-[var(--text-primary)]">Profile</h3>
            </div>

            {/* Nickname Input */}
            <div className="space-y-2">
              <label htmlFor="nickname" className="block text-xs font-mono uppercase text-[var(--text-secondary)]">
                Your Nickname
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={handleNameChange}
                placeholder="Enter nickname (2-16 chars)"
                maxLength={16}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--border-strong)] focus:outline-none transition-colors"
                aria-describedby={nameError ? 'name-error' : undefined}
              />
              {nameError && (
                <p id="name-error" className="text-xs text-[var(--text-primary)] flex items-center gap-1 font-mono">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            {/* Avatar Selector Grid */}
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase text-[var(--text-secondary)]">
                Choose Avatar
              </label>
              <div
                className="grid grid-cols-5 gap-3"
                role="radiogroup"
                aria-label="Choose avatar"
              >
                {ASSET_MANIFEST.avatars.map((av) => {
                  const isSelected = avatar === av;
                  return (
                    <button
                      key={av}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        playSound('click');
                        onChangeAvatar(av);
                      }}
                      className={`relative aspect-square rounded-2xl p-1.5 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'ring-2 ring-[var(--accent)] bg-[var(--bg-tertiary)] scale-105'
                          : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`Select ${av} avatar`}
                    >
                      {/* Dark chip background container for transparent avatar artwork readability */}
                      <div className="w-full h-full rounded-xl bg-[#121212] flex items-center justify-center overflow-hidden">
                        <img
                          src={assetUrl('avatars', av)}
                          alt={av}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            // Fallback to initial letter avatar
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            if (target.parentElement) {
                              target.parentElement.innerText = av.charAt(0).toUpperCase();
                              target.parentElement.style.color = '#FFFFFF';
                              target.parentElement.style.fontWeight = 'bold';
                            }
                          }}
                        />
                      </div>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--accent-inverse)] flex items-center justify-center shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Practice Mode Button */}
          <div className="pt-4 border-t border-[var(--border)]">
            <button
              onClick={handlePracticeClick}
              type="button"
              className="w-full py-3.5 px-4 rounded-xl glass-panel-strong hover:bg-[var(--bg-hover)] border border-[var(--border-strong)] text-[var(--text-primary)] font-medium text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Single Player Practice Mode</span>
            </button>
          </div>
        </section>

        {/* Room Configuration & Actions */}
        <section className="glass-panel p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Sliders className="w-5 h-5 text-[var(--text-primary)]" />
              <h3 className="font-semibold text-lg text-[var(--text-primary)]">Room Options</h3>
            </div>

            {/* Config Sliders & Controls */}
            <div className="space-y-4">
              {/* Rounds */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[var(--text-secondary)]">Total Rounds</span>
                  <span className="text-[var(--text-primary)] font-bold">{settings.rounds}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={8}
                  step={1}
                  value={settings.rounds}
                  onChange={(e) => onChangeSettings({ rounds: parseInt(e.target.value) })}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
              </div>

              {/* Draw Time */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[var(--text-secondary)]">Draw Time Per Round</span>
                  <span className="text-[var(--text-primary)] font-bold">{settings.drawTime}s</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={120}
                  step={15}
                  value={settings.drawTime}
                  onChange={(e) => onChangeSettings({ drawTime: parseInt(e.target.value) })}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-[var(--text-secondary)]">
                  Word Difficulty
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['easy', 'medium', 'hard', 'mixed'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        onChangeSettings({ difficulty: diff });
                      }}
                      className={`py-2 text-xs font-mono rounded-lg capitalize border transition-all ${
                        settings.difficulty === diff
                          ? 'bg-[var(--accent)] text-[var(--accent-inverse)] border-[var(--accent)] font-bold'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bot Count */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[var(--text-secondary)]">Simulated Bot Players</span>
                  <span className="text-[var(--text-primary)] font-bold">{settings.botCount}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={7}
                  step={1}
                  value={settings.botCount}
                  onChange={(e) => onChangeSettings({ botCount: parseInt(e.target.value) })}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
              </div>

              {/* Hints Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono uppercase text-[var(--text-secondary)]">
                  Reveal Progressive Hints
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    onChangeSettings({ hints: !settings.hints });
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.hints ? 'bg-[var(--accent)]' : 'bg-[var(--bg-tertiary)] border border-[var(--border)]'
                  }`}
                  aria-pressed={settings.hints}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${
                      settings.hints ? 'translate-x-6 bg-[var(--accent-inverse)]' : 'bg-[var(--text-secondary)]'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Actions: Create or Join */}
          <div className="space-y-4 pt-4 border-t border-[var(--border)]">
            <button
              onClick={handleCreateSubmit}
              type="button"
              className="w-full py-4 px-6 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-medium text-base flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Create New Room</span>
            </button>

            <form onSubmit={handleJoinSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="Enter Room Code (e.g. SD-4912)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono text-sm focus:border-[var(--border-strong)] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl glass-panel-strong hover:bg-[var(--bg-hover)] border border-[var(--border-strong)] text-[var(--text-primary)] font-medium text-sm flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Join</span>
                </button>
              </div>
              {joinError && (
                <p className="text-xs text-[var(--text-primary)] font-mono flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{joinError}</span>
                </p>
              )}
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

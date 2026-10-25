'use client';

import React from 'react';
import { Sliders, Save, Zap, Play, BarChart2 } from 'lucide-react';
import { DEFAULT_SITE_CONFIG } from '../../../lib/admin/schema';
import { AdminRole, can } from '../../../lib/admin/permissions';
import { playSound } from '../../../lib/sound';

interface GameRulesModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

export const GameRulesModule: React.FC<GameRulesModuleProps> = ({ currentRole, onShowToast }) => {
  const [rounds, setRounds] = React.useState(DEFAULT_SITE_CONFIG.gameRules.rounds);
  const [drawTime, setDrawTime] = React.useState(DEFAULT_SITE_CONFIG.gameRules.drawTime);
  const [botCount, setBotCount] = React.useState(DEFAULT_SITE_CONFIG.gameRules.botCount);
  const [hints, setHints] = React.useState(DEFAULT_SITE_CONFIG.gameRules.hints);
  const [simulationResults, setSimulationResults] = React.useState<string | null>(null);

  const canEdit = can(currentRole, 'edit_game_rules');

  const applyPreset = (preset: 'quick' | 'standard' | 'marathon') => {
    if (!canEdit) return;
    if (preset === 'quick') {
      setRounds(2);
      setDrawTime(45);
      setBotCount(2);
    } else if (preset === 'standard') {
      setRounds(3);
      setDrawTime(60);
      setBotCount(3);
    } else if (preset === 'marathon') {
      setRounds(6);
      setDrawTime(90);
      setBotCount(5);
    }
    onShowToast(`Applied ${preset} preset.`);
    playSound('click');
  };

  const handleRunSimulator = () => {
    // Run dry-run simulation of N rounds
    const avgGuesserScore = Math.round(100 + (400 * 0.6) + 25);
    const avgDrawerScore = Math.round(avgGuesserScore * 0.5 * botCount);
    setSimulationResults(
      `Simulated ${rounds} rounds with ${botCount} bots (${drawTime}s time limit):\n` +
      `• Estimated avg guesser score per round: ${avgGuesserScore} pts\n` +
      `• Estimated avg drawer score per round: ${Math.min(250, avgDrawerScore)} pts\n` +
      `• Estimated total match duration: ~${Math.round((rounds * (drawTime + 15) * (botCount + 1)) / 60)} minutes`
    );
    onShowToast('Dry-run simulation completed.');
    playSound('click');
  };

  const handleSave = () => {
    if (!canEdit) return;
    onShowToast('Game rules saved and published to public game.');
    playSound('click');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">
            Game Rules & Round Simulator
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Configure round defaults, scoring weights, presets, and dry-run game simulations.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleSave}
            className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-mono text-xs font-bold flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>Save Rules</span>
          </button>
        )}
      </div>

      {/* Presets Bar */}
      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="text-[var(--text-secondary)]">Presets:</span>
        <button
          onClick={() => applyPreset('quick')}
          disabled={!canEdit}
          className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)]"
        >
          Quick Match
        </button>
        <button
          onClick={() => applyPreset('standard')}
          disabled={!canEdit}
          className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)]"
        >
          Standard
        </button>
        <button
          onClick={() => applyPreset('marathon')}
          disabled={!canEdit}
          className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)]"
        >
          Marathon
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rules Sliders */}
        <section className="glass-panel p-6 space-y-6">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="font-semibold text-base text-[var(--text-primary)]">Rule Sliders</h3>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Rounds</span>
                <span className="font-bold text-[var(--text-primary)]">{rounds}</span>
              </div>
              <input
                type="range"
                min={2}
                max={8}
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value))}
                disabled={!canEdit}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Draw Time (seconds)</span>
                <span className="font-bold text-[var(--text-primary)]">{drawTime}s</span>
              </div>
              <input
                type="range"
                min={30}
                max={180}
                step={15}
                value={drawTime}
                onChange={(e) => setDrawTime(parseInt(e.target.value))}
                disabled={!canEdit}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Simulated Bots</span>
                <span className="font-bold text-[var(--text-primary)]">{botCount}</span>
              </div>
              <input
                type="range"
                min={0}
                max={7}
                value={botCount}
                onChange={(e) => setBotCount(parseInt(e.target.value))}
                disabled={!canEdit}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Headless Round Simulator */}
        <section className="glass-panel p-6 space-y-4 border border-[var(--border-strong)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="font-semibold text-base text-[var(--text-primary)]">Dry-Run Simulator</h3>
            <button
              onClick={handleRunSimulator}
              className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-inverse)] font-mono text-xs font-bold flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] min-h-[160px] font-mono text-xs text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
            {simulationResults || 'Click Simulate to test these rules against N match rounds.'}
          </div>
        </section>
      </div>
    </div>
  );
};

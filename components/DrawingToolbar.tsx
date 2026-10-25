'use client';

import React from 'react';
import { RotateCcw, RotateCw, Trash2, Check } from 'lucide-react';
import { ASSET_MANIFEST, assetUrl } from '../lib/assets';
import { ToolType } from '../lib/canvas/drawing-model';
import { play, playSound } from '../lib/sound';

interface DrawingToolbarProps {
  tool: ToolType;
  color: string;
  size: number;
  canUndo: boolean;
  canRedo: boolean;
  onSelectTool: (t: ToolType) => void;
  onSelectColor: (c: string) => void;
  onSelectSize: (s: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  tool,
  color,
  size,
  canUndo,
  canRedo,
  onSelectTool,
  onSelectColor,
  onSelectSize,
  onUndo,
  onRedo,
  onClear,
}) => {
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);

  const handleClearClick = () => {
    playSound('click');
    setShowClearConfirm(true);
  };

  const handleConfirmClear = () => {
    play('clear');
    setShowClearConfirm(false);
    onClear();
  };

  return (
    <div className="w-full glass-panel p-2 sm:p-3 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-4 border border-[var(--border)] relative">
      {/* Tool Toggle & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center sm:justify-start">
        {/* Brush */}
        <button
          onClick={() => {
            playSound('click');
            onSelectTool('brush');
          }}
          className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
            tool === 'brush'
              ? 'bg-[var(--accent)] text-[var(--accent-inverse)] border-[var(--accent)] scale-105 shadow'
              : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border-[var(--border)] text-[var(--text-primary)]'
          }`}
          aria-label="Brush tool"
          aria-pressed={tool === 'brush'}
          title="Brush"
        >
          <img
            src={assetUrl('toolbar', 'brush')}
            alt="Brush"
            className="w-5 h-5 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="sr-only">Brush</span>
        </button>

        {/* Eraser */}
        <button
          onClick={() => {
            playSound('click');
            onSelectTool('eraser');
          }}
          className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
            tool === 'eraser'
              ? 'bg-[var(--accent)] text-[var(--accent-inverse)] border-[var(--accent)] scale-105 shadow'
              : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border-[var(--border)] text-[var(--text-primary)]'
          }`}
          aria-label="Eraser tool"
          aria-pressed={tool === 'eraser'}
          title="Eraser"
        >
          <img
            src={assetUrl('toolbar', 'eraser')}
            alt="Eraser"
            className="w-5 h-5 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="sr-only">Eraser</span>
        </button>

        <div className="w-px h-6 bg-[var(--border)] mx-1" />

        {/* Undo */}
        <button
          onClick={() => {
            if (canUndo) {
              play('undo');
              onUndo();
            }
          }}
          disabled={!canUndo}
          className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 border border-[var(--border)] text-[var(--text-primary)] transition-all"
          aria-label="Undo last stroke"
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Redo */}
        <button
          onClick={() => {
            if (canRedo) {
              play('undo');
              onRedo();
            }
          }}
          disabled={!canRedo}
          className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 border border-[var(--border)] text-[var(--text-primary)] transition-all"
          aria-label="Redo stroke"
          title="Redo (Ctrl+Y)"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Clear */}
        <button
          onClick={handleClearClick}
          className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] transition-all"
          aria-label="Clear drawing board"
          title="Clear Board"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Brush Size Selector */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase hidden lg:inline">Size:</span>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
          {ASSET_MANIFEST.toolbar.sizes.map((s) => {
            const isSelected = Math.abs(size - s.size) < 0.002;
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => {
                  playSound('click');
                  onSelectSize(s.size);
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center relative transition-all ${
                  isSelected ? 'bg-[var(--bg-hover)] ring-2 ring-[var(--accent)] scale-110' : 'hover:bg-[var(--bg-hover)]'
                }`}
                aria-label={`Select ${s.label} brush size`}
                title={s.label}
              >
                <div
                  className="rounded-full bg-[var(--text-primary)]"
                  style={{
                    width: `${Math.max(4, s.size * 500)}px`,
                    height: `${Math.max(4, s.size * 500)}px`,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Swatches */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {ASSET_MANIFEST.toolbar.colors.map((c) => {
          const isSelected = tool === 'brush' && color.toLowerCase() === c.hex.toLowerCase();
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                playSound('click');
                onSelectColor(c.hex);
                if (tool === 'eraser') {
                  onSelectTool('brush');
                }
              }}
              className={`w-7 h-7 rounded-full relative flex items-center justify-center transition-transform border border-[var(--border-strong)] ${
                isSelected ? 'scale-125 ring-2 ring-[var(--text-primary)] z-10' : 'hover:scale-110 opacity-85 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.hex }}
              aria-label={`Select ${c.label} color`}
              title={c.label}
            >
              {isSelected && (
                <Check
                  className={`w-3.5 h-3.5 ${
                    c.hex === '#FFFFFF' || c.hex === '#EAB308' ? 'text-black' : 'text-white'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Clear Confirmation Popover Modal */}
      {showClearConfirm && (
        <div className="absolute inset-0 z-30 rounded-2xl bg-[var(--glass-modal)] backdrop-blur-md flex items-center justify-center p-4 border border-[var(--border-strong)]">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Clear the entire drawing canvas?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirmClear}
                className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-inverse)] font-medium text-xs"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium text-xs border border-[var(--border)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

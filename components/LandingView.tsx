'use client';

import React from 'react';
import Image from 'next/image';
import { Play, PlusCircle, Sparkles, Users, Palette, Zap, HelpCircle, Shield, Code2, BookOpen } from 'lucide-react';
import { playSound } from '../lib/sound';
import { assetUrl } from '../lib/assets';

interface LandingViewProps {
  onPlayNow: () => void;
  onCreateRoom: () => void;
  onOpenFooterModal: (type: 'about' | 'rules' | 'privacy' | 'credits') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onPlayNow,
  onCreateRoom,
  onOpenFooterModal,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Animated live drawing preview
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw faint dot grid
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let x = 20; x < width; x += 30) {
        for (let y = 20; y < height; y += 30) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Animated drawing stroke (space rocket shape)
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();

      const pointsCount = Math.min(180, Math.floor(t));
      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < pointsCount; i++) {
        const angle = (i / 180) * Math.PI * 4;
        const radius = 60 + Math.sin(angle * 3) * 20;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius * 0.8;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      t = (t + 1) % 240;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-16 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs font-mono text-[var(--text-secondary)] border border-[var(--border)]">
          <Sparkles className="w-3.5 h-3.5 text-[var(--text-primary)]" />
          <span>Real-time Monochrome Multiplayer Experience</span>
        </div>

        <h1 className="font-display font-bold text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[var(--text-primary)] leading-[0.95]">
          SpaceDraw
        </h1>

        <p className="text-base sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-light">
          A minimalist drawing and guessing game. Express your creativity, guess the secret words, and compete in real-time.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => {
              playSound('click');
              onPlayNow();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[var(--accent)] text-[var(--accent-inverse)] font-medium text-base sm:text-lg flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-lg"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Play Now</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              onCreateRoom();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-full glass-panel-strong hover:bg-[var(--bg-hover)] border border-[var(--border-strong)] text-[var(--text-primary)] font-medium text-base sm:text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Room</span>
          </button>
        </div>
      </section>

      {/* Live Interactive Board Preview */}
      <section className="relative w-full max-w-3xl mx-auto rounded-2xl glass-panel p-4 sm:p-6 shadow-2xl border border-[var(--border-strong)] overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--text-secondary)] opacity-50" />
            <div className="w-3 h-3 rounded-full bg-[var(--text-secondary)] opacity-50" />
            <div className="w-3 h-3 rounded-full bg-[var(--text-secondary)] opacity-50" />
            <span className="ml-2 font-mono text-xs text-[var(--text-secondary)]">Canvas Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--text-primary)] animate-ping" />
            <span className="font-mono text-xs text-[var(--text-primary)]">Drawing in progress...</span>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full bg-[var(--bg-secondary)] rounded-xl overflow-hidden border border-[var(--border)] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full h-full object-contain"
            aria-label="Live canvas stroke animation preview"
          />
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="glass-panel p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-primary)] border border-[var(--border)]">
            <Palette className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-lg text-[var(--text-primary)]">Monochrome Design System</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            High contrast, glassmorphism aesthetics, and clean typography built strictly in black, white, and neutral tones.
          </p>
        </div>

        <div className="glass-panel p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-primary)] border border-[var(--border)]">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-lg text-[var(--text-primary)]">Simulated Multiplayer & Bots</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Play instantly with realistic AI bot players that guess, chat, and draw with customizable difficulty settings.
          </p>
        </div>

        <div className="glass-panel p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-primary)] border border-[var(--border)]">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-lg text-[var(--text-primary)]">Precision Drawing Engine</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Smooth quadratic curves, high-DPI scaling, eraser destination-out mode, undo/redo stacks, and responsive sizing.
          </p>
        </div>
      </section>

      {/* Footer Links */}
      <footer className="pt-12 border-t border-[var(--border)] text-center space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--text-secondary)]">
          <button
            onClick={() => onOpenFooterModal('about')}
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4" />
            <span>About</span>
          </button>

          <button
            onClick={() => onOpenFooterModal('rules')}
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Game Rules</span>
          </button>

          <button
            onClick={() => onOpenFooterModal('privacy')}
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => onOpenFooterModal('credits')}
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
          >
            <Code2 className="w-4 h-4" />
            <span>Credits</span>
          </button>
        </div>

        <p className="text-xs text-[var(--text-muted)] font-mono">
          &copy; {new Date().getFullYear()} SpaceDraw Platform. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

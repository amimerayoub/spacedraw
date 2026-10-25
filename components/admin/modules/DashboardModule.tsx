'use client';

import React from 'react';
import {
  FileText,
  Users,
  Tv,
  Flag,
  Database,
  HardDrive,
  Plus,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { AdminRole, can } from '../../../lib/admin/permissions';
import { playSound } from '../../../lib/sound';

interface DashboardModuleProps {
  currentRole: AdminRole;
  onNavigate: (module: any) => void;
  onShowToast: (msg: string) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  currentRole,
  onNavigate,
  onShowToast,
}) => {
  const chartCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Render mini grayscale canvas chart
  React.useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let y = 20; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw grayscale line series
    const data = [12, 19, 15, 28, 22, 35, 42];
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const step = canvas.width / (data.length - 1);
    data.forEach((val, i) => {
      const x = i * step;
      const y = canvas.height - (val / 50) * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Draw dots
    data.forEach((val, i) => {
      const x = i * step;
      const y = canvas.height - (val / 50) * canvas.height;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">
            Admin Overview
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            System status, quick controls, health checks, and live metrics.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              playSound('click');
              onNavigate('words');
            }}
            disabled={!can(currentRole, 'manage_words')}
            className="px-3.5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-mono text-xs flex items-center gap-1.5 transition-transform hover:scale-105 disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Word</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              onNavigate('rooms');
            }}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] font-mono text-xs flex items-center gap-1.5"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>View Rooms</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-mono uppercase">Word Bank</span>
            <FileText className="w-4 h-4" />
          </div>
          <div className="font-mono font-bold text-3xl text-[var(--text-primary)]">180</div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">6 Categories</span>
        </div>

        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-mono uppercase">Active Players</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="font-mono font-bold text-3xl text-[var(--text-primary)]">12</div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">4 Bots / 8 Local</span>
        </div>

        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-mono uppercase">Live Rooms</span>
            <Tv className="w-4 h-4" />
          </div>
          <div className="font-mono font-bold text-3xl text-[var(--text-primary)]">2</div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">Simulated Rooms</span>
        </div>

        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-mono uppercase">System Storage</span>
            <HardDrive className="w-4 h-4" />
          </div>
          <div className="font-mono font-bold text-3xl text-[var(--text-primary)]">0.4 MB</div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">Estimated IDB Usage</span>
        </div>
      </div>

      {/* Main Grid: Health Checklist & Mini Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Mini Line Chart */}
        <section className="lg:col-span-2 glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="font-semibold text-base text-[var(--text-primary)]">
              Daily Games Played (7 Days)
            </h3>
            <span className="text-xs font-mono text-[var(--text-secondary)]">Monochrome Vector</span>
          </div>

          <div className="relative aspect-[16/7] w-full bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)] p-2">
            <canvas
              ref={chartCanvasRef}
              width={600}
              height={220}
              className="w-full h-full object-contain"
              role="img"
              aria-label="Daily games played line chart"
            />
          </div>
        </section>

        {/* System Health Checklist */}
        <section className="glass-panel p-6 space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="font-semibold text-base text-[var(--text-primary)]">
              System Health Check
            </h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--text-primary)]" />
                <span>Asset Manifest Audit</span>
              </div>
              <span className="text-[10px] text-[var(--text-secondary)]">100% OK</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--text-primary)]" />
                <span>Word Bank Balance</span>
              </div>
              <span className="text-[10px] text-[var(--text-secondary)]">60 Words/Cat</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--text-primary)]" />
                <span>Backup Schedule</span>
              </div>
              <span className="text-[10px] text-[var(--text-secondary)]">Backup Recommended</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

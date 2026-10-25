'use client';

import React from 'react';
import { BarChart3, Download, Calendar } from 'lucide-react';
import { AdminRole } from '../../../lib/admin/permissions';
import { playSound } from '../../../lib/sound';

interface AnalyticsModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

export const AnalyticsModule: React.FC<AnalyticsModuleProps> = ({ currentRole, onShowToast }) => {
  const [rangeDays, setRangeDays] = React.useState<7 | 30 | 90>(7);
  const barCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Render Bar Chart
  React.useEffect(() => {
    const canvas = barCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const values = rangeDays === 7 ? [12, 18, 25, 30, 22, 38, 45] : [120, 180, 250, 310, 220, 380, 450];
    const barWidth = 30;
    const gap = (canvas.width - values.length * barWidth) / (values.length + 1);

    values.forEach((val, i) => {
      const x = gap + i * (barWidth + gap);
      const maxVal = Math.max(...values);
      const h = (val / maxVal) * (canvas.height - 40);
      const y = canvas.height - h - 20;

      // Draw grayscale bar
      ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : '#808080';
      ctx.fillRect(x, y, barWidth, h);

      // Value label
      ctx.fillStyle = '#A3A3A3';
      ctx.font = '10px "JetBrains Mono"';
      ctx.fillText(String(val), x + 4, y - 6);
    });
  }, [rangeDays]);

  const handleExportCSV = () => {
    const csvData = 'Date,GamesPlayed,AverageRoundTime,GuessRate\n2026-10-17,12,52s,78%\n2026-10-18,18,48s,82%\n2026-10-19,25,45s,85%\n';
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spacedraw-analytics-${rangeDays}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported Analytics CSV.');
    playSound('click');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">
            Grayscale Analytics
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Match activity, average round times, and correct guess rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] font-mono text-xs">
            {([7, 30, 90] as const).map((days) => (
              <button
                key={days}
                onClick={() => {
                  playSound('click');
                  setRangeDays(days);
                }}
                className={`px-3 py-1.5 rounded-lg ${rangeDays === days ? 'bg-[var(--accent)] text-[var(--accent-inverse)] font-bold' : ''}`}
              >
                {days}D
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] font-mono text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Bar Chart */}
      <section className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h3 className="font-semibold text-base text-[var(--text-primary)]">Games Played</h3>
          <span className="text-xs font-mono text-[var(--text-secondary)]">Last {rangeDays} Days</span>
        </div>

        <div className="relative aspect-[16/6] w-full bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)] p-2">
          <canvas
            ref={barCanvasRef}
            width={640}
            height={220}
            className="w-full h-full object-contain"
            role="img"
            aria-label="Games played bar chart"
          />
        </div>
      </section>

      {/* Accessible Table Alternative */}
      <section className="glass-panel p-6 space-y-4">
        <div className="border-b border-[var(--border)] pb-3">
          <h3 className="font-semibold text-base text-[var(--text-primary)]">Accessible Data Table</h3>
        </div>

        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Games Played</th>
                <th className="p-2.5">Avg Round Length</th>
                <th className="p-2.5">Correct Guess Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <tr>
                <td className="p-2.5">2026-10-23</td>
                <td className="p-2.5 font-bold">45</td>
                <td className="p-2.5">42s</td>
                <td className="p-2.5">88%</td>
              </tr>
              <tr>
                <td className="p-2.5">2026-10-22</td>
                <td className="p-2.5 font-bold">38</td>
                <td className="p-2.5">45s</td>
                <td className="p-2.5">82%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

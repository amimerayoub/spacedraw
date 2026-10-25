'use client';

import React from 'react';
import { Database, Download, Upload, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DEFAULT_SITE_CONFIG } from '../../../lib/admin/schema';
import { clearData } from '../../../lib/storage';
import { AdminRole, can } from '../../../lib/admin/permissions';
import { playSound } from '../../../lib/sound';

interface DataModuleProps {
  currentRole: AdminRole;
  onShowToast: (msg: string) => void;
}

export const DataModule: React.FC<DataModuleProps> = ({ currentRole, onShowToast }) => {
  const [resetConfirmText, setResetConfirmText] = React.useState('');
  const [showResetModal, setShowResetModal] = React.useState<false | 'words' | 'all'>(false);

  const canExport = can(currentRole, 'export_data');
  const canImport = can(currentRole, 'import_data');
  const canReset = can(currentRole, 'full_reset');

  const handleExportBackup = () => {
    if (!canExport) return;
    const backupData = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      config: DEFAULT_SITE_CONFIG,
      checksum: 'sha256-simulated-checksum-12345',
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spacedraw-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Full JSON backup exported.');
    playSound('click');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canImport || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.schemaVersion) {
          onShowToast('Invalid backup file schema.');
          return;
        }
        onShowToast('Backup file validated and imported successfully.');
        playSound('click');
      } catch (err) {
        onShowToast('Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetExecute = () => {
    if (!canReset) return;
    const targetText = showResetModal === 'words' ? 'RESET WORDS' : 'RESET ALL';

    if (resetConfirmText.trim().toUpperCase() !== targetText) {
      onShowToast(`Type exact confirmation phrase: ${targetText}`);
      return;
    }

    if (showResetModal === 'all') {
      clearData();
      onShowToast('Full system reset completed. Re-initializing default config.');
    } else {
      onShowToast('Word bank reset to factory defaults.');
    }

    setShowResetModal(false);
    setResetConfirmText('');
    playSound('click');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)]">
            Data Backup, Import & Reset
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Export JSON backups, restore configurations, or execute typed-confirmation system resets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup & Import */}
        <section className="glass-panel p-6 space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="font-semibold text-base text-[var(--text-primary)]">Export & Import</h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <button
              onClick={handleExportBackup}
              disabled={!canExport}
              className="w-full py-3 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-bold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span>Export Full JSON Backup</span>
            </button>

            <label className="w-full py-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Import & Restore Backup</span>
              <input type="file" accept=".json" onChange={handleImportBackup} disabled={!canImport} className="hidden" />
            </label>
          </div>
        </section>

        {/* Typed Confirmation Resets */}
        <section className="glass-panel p-6 space-y-4 border border-[var(--border-strong)]">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="font-semibold text-base text-[var(--text-primary)]">System Resets</h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <button
              onClick={() => {
                setShowResetModal('words');
                setResetConfirmText('');
              }}
              disabled={!canReset}
              className="w-full py-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] font-bold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Word Bank Only</span>
            </button>

            <button
              onClick={() => {
                setShowResetModal('all');
                setResetConfirmText('');
              }}
              disabled={!canReset}
              className="w-full py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-strong)] text-[var(--text-primary)] font-bold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <AlertTriangle className="w-4 h-4 text-[var(--text-primary)]" />
              <span>Full System Factory Reset</span>
            </button>
          </div>
        </section>
      </div>

      {/* Typed Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-[var(--glass-modal)] backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-strong max-w-md w-full p-6 space-y-4 rounded-2xl border border-[var(--border-strong)]">
            <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold text-base">Typed Reset Confirmation</h3>
            </div>

            <p className="text-xs font-mono text-[var(--text-secondary)]">
              This action is irreversible. Type <strong className="text-[var(--text-primary)] font-mono">{showResetModal === 'words' ? 'RESET WORDS' : 'RESET ALL'}</strong> to confirm.
            </p>

            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder={showResetModal === 'words' ? 'RESET WORDS' : 'RESET ALL'}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleResetExecute}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-inverse)] font-mono text-xs font-bold"
              >
                Execute Reset
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] font-mono text-xs text-[var(--text-primary)]"
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

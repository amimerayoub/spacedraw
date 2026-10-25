'use client';

import React from 'react';
import { AdminAuthGate } from '../../components/admin/AdminAuthGate';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar, AdminModuleKey } from '../../components/admin/AdminSidebar';
import { CommandPalette } from '../../components/admin/CommandPalette';
import { DashboardModule } from '../../components/admin/modules/DashboardModule';
import { WordsModule } from '../../components/admin/modules/WordsModule';
import { PlayersModule } from '../../components/admin/modules/PlayersModule';
import { RoomsModule } from '../../components/admin/modules/RoomsModule';
import { ContentModule } from '../../components/admin/modules/ContentModule';
import { AssetsModule } from '../../components/admin/modules/AssetsModule';
import { ThemeModule } from '../../components/admin/modules/ThemeModule';
import { GameRulesModule } from '../../components/admin/modules/GameRulesModule';
import { FeaturesModule } from '../../components/admin/modules/FeaturesModule';
import { ModerationModule } from '../../components/admin/modules/ModerationModule';
import { LanguagesModule } from '../../components/admin/modules/LanguagesModule';
import { SeoAuditModule } from '../../components/admin/modules/SeoAuditModule';
import { ExportModule } from '../../components/admin/modules/ExportModule';
import { SoundsModule } from '../../components/admin/modules/SoundsModule';
import { AnalyticsModule } from '../../components/admin/modules/AnalyticsModule';
import { AuditModule } from '../../components/admin/modules/AuditModule';
import { DataModule } from '../../components/admin/modules/DataModule';
import { TeamModule } from '../../components/admin/modules/TeamModule';
import { SettingsModule } from '../../components/admin/modules/SettingsModule';
import { Toast } from '../../components/Toast';

import { AdminRole } from '../../lib/admin/permissions';
import { getItem, setItem } from '../../lib/storage';

export default function SpaceDrawAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [role, setRole] = React.useState<AdminRole>('Owner');
  const [activeModule, setActiveModule] = React.useState<AdminModuleKey>('dashboard');
  const [theme, setTheme] = React.useState<'dark' | 'light'>(() => getItem<'dark' | 'light'>('theme', 'dark'));
  const [density, setDensity] = React.useState<'comfortable' | 'compact'>('comfortable');
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState<boolean>(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Sync theme attribute
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Hash routing: #/admin/<module> selects the active module (deep-linkable).
  React.useEffect(() => {
    const applyHash = () => {
      const seg = window.location.hash.replace(/^#\/admin\/?/, '').split('/')[0];
      const valid: AdminModuleKey[] = [
        'dashboard', 'words', 'players', 'rooms', 'content', 'assets', 'theme',
        'game-rules', 'features', 'moderation', 'languages', 'seo-audit', 'export',
        'sounds', 'analytics', 'audit', 'data', 'team', 'settings',
      ];
      if (seg && valid.includes(seg as AdminModuleKey)) setActiveModule(seg as AdminModuleKey);
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  const selectModule = React.useCallback((m: AdminModuleKey) => {
    setActiveModule(m);
    if (typeof window !== 'undefined' && window.location.hash !== `#/admin/${m}`) {
      window.history.replaceState(null, '', `#/admin/${m}`);
    }
  }, []);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    setItem('theme', next);
  };

  const handleToggleDensity = () => {
    setDensity((prev) => (prev === 'comfortable' ? 'compact' : 'comfortable'));
  };

  const handleRoleChange = (newRole: AdminRole) => {
    setRole(newRole);
    setToastMessage(`Switched simulated role to ${newRole}`);
  };

  const handleLock = () => {
    sessionStorage.removeItem('spacedraw:v1:admin_session');
    setIsAuthenticated(false);
    setToastMessage('Admin session locked');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('spacedraw:v1:admin_session');
    setIsAuthenticated(false);
    setToastMessage('Logged out');
  };

  if (!isAuthenticated) {
    return (
      <AdminAuthGate
        onAuthenticated={(assignedRole) => {
          setRole(assignedRole);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] ${
      density === 'compact' ? 'text-xs' : 'text-sm'
    }`}>
      {/* Top Header */}
      <AdminHeader
        currentRole={role}
        theme={theme}
        density={density}
        onRoleChange={handleRoleChange}
        onToggleTheme={handleToggleTheme}
        onToggleDensity={handleToggleDensity}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onLock={handleLock}
        onLogout={handleLogout}
      />

      {/* Main Admin Workspace: Sidebar | Module Content */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto p-4 gap-6">
        <AdminSidebar
          activeModule={activeModule}
          onSelectModule={(m) => selectModule(m)}
        />

        <main className="flex-1 glass-panel p-6 rounded-2xl border border-[var(--border)] overflow-y-auto">
          {activeModule === 'dashboard' && (
            <DashboardModule
              currentRole={role}
              onNavigate={(m) => selectModule(m)}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'words' && (
            <WordsModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'players' && (
            <PlayersModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'rooms' && (
            <RoomsModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'content' && (
            <ContentModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'assets' && (
            <AssetsModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'theme' && (
            <ThemeModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'game-rules' && (
            <GameRulesModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'features' && (
            <FeaturesModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'moderation' && (
            <ModerationModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'languages' && (
            <LanguagesModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'seo-audit' && (
            <SeoAuditModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'export' && (
            <ExportModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'sounds' && (
            <SoundsModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'analytics' && (
            <AnalyticsModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'audit' && (
            <AuditModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'data' && (
            <DataModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'team' && (
            <TeamModule
              currentRole={role}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}

          {activeModule === 'settings' && (
            <SettingsModule
              currentRole={role}
              theme={theme}
              density={density}
              onToggleTheme={handleToggleTheme}
              onToggleDensity={handleToggleDensity}
              onShowToast={(msg) => setToastMessage(msg)}
            />
          )}
        </main>
      </div>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectModule={(m) => selectModule(m)}
        onExecuteAction={(actId) => setToastMessage(`Executed action: ${actId}`)}
      />

      <Toast message={toastMessage} onClear={() => setToastMessage(null)} />
    </div>
  );
}

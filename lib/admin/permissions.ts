export type AdminRole = 'Owner' | 'Admin' | 'Moderator' | 'Viewer';

export type Permission =
  | 'manage_team'
  | 'full_reset'
  | 'import_data'
  | 'export_data'
  | 'manage_words'
  | 'manage_players'
  | 'manage_rooms'
  | 'edit_content'
  | 'override_assets'
  | 'edit_theme'
  | 'edit_game_rules'
  | 'toggle_flags'
  | 'manage_moderation'
  | 'view_analytics'
  | 'view_audit';

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  Owner: [
    'manage_team',
    'full_reset',
    'import_data',
    'export_data',
    'manage_words',
    'manage_players',
    'manage_rooms',
    'edit_content',
    'override_assets',
    'edit_theme',
    'edit_game_rules',
    'toggle_flags',
    'manage_moderation',
    'view_analytics',
    'view_audit',
  ],
  Admin: [
    'export_data',
    'import_data',
    'manage_words',
    'manage_players',
    'manage_rooms',
    'edit_content',
    'override_assets',
    'edit_theme',
    'edit_game_rules',
    'toggle_flags',
    'manage_moderation',
    'view_analytics',
    'view_audit',
  ],
  Moderator: [
    'manage_players',
    'manage_rooms',
    'manage_moderation',
    'view_analytics',
    'view_audit',
  ],
  Viewer: [
    'view_analytics',
    'view_audit',
  ],
};

export function can(role: AdminRole, permission: Permission): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
}

export function getRolePermissionSummary(role: AdminRole): string {
  switch (role) {
    case 'Owner':
      return 'Full access including team management, data imports, and system resets.';
    case 'Admin':
      return 'All site & game management except team management and full system resets.';
    case 'Moderator':
      return 'Manage players, rooms, reports, and moderation blocklists. Read-only elsewhere.';
    case 'Viewer':
      return 'Read-only access to dashboards, analytics, and audit logs.';
  }
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { can, AdminRole } from './permissions';

test('Owner role has all permissions including team management and full reset', () => {
  assert.equal(can('Owner', 'manage_team'), true);
  assert.equal(can('Owner', 'full_reset'), true);
  assert.equal(can('Owner', 'manage_words'), true);
});

test('Admin role cannot manage team or perform full reset', () => {
  assert.equal(can('Admin', 'manage_team'), false);
  assert.equal(can('Admin', 'full_reset'), false);
  assert.equal(can('Admin', 'manage_words'), true);
});

test('Moderator role can manage players and moderation but not edit theme or content', () => {
  assert.equal(can('Moderator', 'manage_players'), true);
  assert.equal(can('Moderator', 'manage_moderation'), true);
  assert.equal(can('Moderator', 'edit_theme'), false);
  assert.equal(can('Moderator', 'edit_content'), false);
});

test('Viewer role has read-only access to analytics and audit', () => {
  assert.equal(can('Viewer', 'view_analytics'), true);
  assert.equal(can('Viewer', 'view_audit'), true);
  assert.equal(can('Viewer', 'manage_words'), false);
  assert.equal(can('Viewer', 'manage_players'), false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSiteConfig, DEFAULT_SITE_CONFIG } from './schema';

test('validateSiteConfig returns default config for null or empty input', () => {
  const result = validateSiteConfig(null);
  assert.equal(result.sanitized.content.heroTitle, DEFAULT_SITE_CONFIG.content.heroTitle);
});

test('validateSiteConfig clamps rounds to 2-8 range', () => {
  const resultTooHigh = validateSiteConfig({ gameRules: { rounds: 20 } });
  assert.equal(resultTooHigh.sanitized.gameRules.rounds, 8);

  const resultTooLow = validateSiteConfig({ gameRules: { rounds: 0 } });
  assert.equal(resultTooLow.sanitized.gameRules.rounds, 2);
});

test('validateSiteConfig sanitizes string fields safely', () => {
  const result = validateSiteConfig({
    content: {
      heroTitle: '  Super Long Title That Should Be Trimmed  ',
    },
  });
  assert.equal(result.sanitized.content.heroTitle, 'Super Long Title That Should Be Trimmed');
});

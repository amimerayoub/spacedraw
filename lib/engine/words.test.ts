import test from 'node:test';
import assert from 'node:assert/strict';
import { pickWords, maskWord, WORD_BANK } from './words';

test('pickWords returns requested number of unique words', () => {
  const words = pickWords('easy', 3);
  assert.equal(words.length, 3);
  assert.equal(new Set(words).size, 3);
});

test('pickWords respects exclusions', () => {
  const excluding = ['cat', 'dog', 'lion'];
  const words = pickWords('easy', 5, excluding);
  for (const w of words) {
    assert.equal(excluding.includes(w), false);
  }
});

test('maskWord masks characters with underscores and preserves spaces', () => {
  const masked = maskWord('black hole');
  assert.ok(masked.includes('_'));
  assert.ok(masked.includes('  ')); // double space for word boundary
});

test('maskWord reveals indices when specified', () => {
  const revealed = new Set([0]); // reveal first letter
  const masked = maskWord('star', revealed);
  assert.ok(masked.startsWith('S'));
});

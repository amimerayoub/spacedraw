import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText, evaluateGuess, levenshteinDistance } from './guess';

test('normalizeText strips accents, casing, and extra whitespace', () => {
  assert.equal(normalizeText('  ElÉphAnt   '), 'elephant');
  assert.equal(normalizeText('CAFÉ'), 'cafe');
});

test('evaluateGuess identifies exact matches', () => {
  const result = evaluateGuess(' Astronaut ', 'astronaut');
  assert.equal(result.isExact, true);
  assert.equal(result.isClose, false);
});

test('evaluateGuess identifies close matches for 5+ letter words', () => {
  const result = evaluateGuess('astronat', 'astronaut');
  assert.equal(result.isExact, false);
  assert.equal(result.isClose, true);
});

test('evaluateGuess does not mark close match for short words', () => {
  const result = evaluateGuess('cat', 'car');
  assert.equal(result.isExact, false);
  assert.equal(result.isClose, false);
});

test('levenshteinDistance computes correct distance', () => {
  assert.equal(levenshteinDistance('kitten', 'sitting'), 3);
  assert.equal(levenshteinDistance('apple', 'apple'), 0);
});

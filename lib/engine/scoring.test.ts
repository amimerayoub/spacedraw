import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateGuesserPoints, calculateDrawerPoints } from './scoring';

test('guesser receives max points plus first bonus when guessing immediately', () => {
  const points = calculateGuesserPoints({
    timeRemaining: 60,
    drawTime: 60,
    isFirstGuesser: true,
  });
  assert.equal(points, 550); // 100 base + 400 time + 50 bonus
});

test('guesser receives base points with no time left or no bonus', () => {
  const points = calculateGuesserPoints({
    timeRemaining: 30,
    drawTime: 60,
    isFirstGuesser: false,
  });
  assert.equal(points, 300); // 100 + 200 = 300
});

test('guesser receives zero if time remaining is zero', () => {
  const points = calculateGuesserPoints({
    timeRemaining: 0,
    drawTime: 60,
    isFirstGuesser: false,
  });
  assert.equal(points, 0);
});

test('drawer score accumulates from guesser scores capped at 250', () => {
  const drawerPts = calculateDrawerPoints([300, 400]);
  assert.equal(drawerPts, 250); // (350 * 0.5 * 2) = 350 -> capped at 250
});

test('drawer receives zero if no one guessed', () => {
  const drawerPts = calculateDrawerPoints([]);
  assert.equal(drawerPts, 0);
});

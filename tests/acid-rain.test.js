import { test } from 'node:test';
import assert from 'node:assert/strict';
import { targetCpm, spawnDelayMs, fallSeconds, averageStrokes, MAX_DIFFICULTY_LEVEL } from '../src/renderer/modes/acid-rain-levels.js';
import { strokeCount } from '../src/renderer/core/hangul.js';

test('level 10 asks for 200 strokes per minute', () => {
  assert.equal(targetCpm(10), 200);
  assert.ok(targetCpm(1) < targetCpm(5) && targetCpm(5) < targetCpm(20));
});

test('spawn delay turns the target speed into words per minute', () => {
  const avg = 6; // strokes per word
  const wordsPerMinute = 60000 / spawnDelayMs(10, avg);
  assert.ok(Math.abs(wordsPerMinute * avg - 200) < 1);
});

test('difficulty stops growing after the max level', () => {
  assert.equal(targetCpm(MAX_DIFFICULTY_LEVEL + 10), targetCpm(MAX_DIFFICULTY_LEVEL));
  assert.equal(fallSeconds(MAX_DIFFICULTY_LEVEL + 10), fallSeconds(MAX_DIFFICULTY_LEVEL));
  assert.ok(fallSeconds(1) > fallSeconds(20));
});

test('averageStrokes counts Hangul key strokes', () => {
  assert.equal(averageStrokes(['가', '과'], strokeCount), 2.5); // 가 = 2, 과 = 3
  assert.equal(averageStrokes([], strokeCount), 0);
});

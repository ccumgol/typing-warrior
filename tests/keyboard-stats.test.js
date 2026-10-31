import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charFromKey, keyForChar } from '../src/renderer/core/keyboard-layout.js';
import { createStats, recordStroke, strokesPerMinute, accuracy, formatTime } from '../src/renderer/core/stats.js';

test('maps physical keys to 두벌식 jamo and English letters', () => {
  assert.equal(charFromKey('KeyR', { lang: 'ko' }), 'ㄱ');
  assert.equal(charFromKey('KeyR', { lang: 'ko', shift: true }), 'ㄲ');
  assert.equal(charFromKey('KeyK', { lang: 'ko', shift: true }), 'ㅏ');
  assert.equal(charFromKey('KeyA', { lang: 'en' }), 'a');
  assert.equal(charFromKey('KeyA', { lang: 'en', shift: true }), 'A');
  assert.equal(charFromKey('KeyA', { lang: 'en', capsLock: true }), 'A');
  assert.equal(charFromKey('KeyA', { lang: 'en', capsLock: true, shift: true }), 'a');
  assert.equal(charFromKey('Digit1', { lang: 'ko', shift: true }), '!');
  assert.equal(charFromKey('ShiftLeft', { lang: 'ko' }), null);
  assert.equal(charFromKey('Space', { lang: 'en' }), ' ');
});

test('finds the key and shift side for a character', () => {
  assert.deepEqual(keyForChar('ㅁ'), { code: 'KeyA', shift: false, finger: 'L5' });
  assert.equal(keyForChar('ㅃ').shiftCode, 'ShiftRight');
  assert.equal(keyForChar('ㅖ').shiftCode, 'ShiftLeft');
  assert.equal(keyForChar('Q').code, 'KeyQ');
  assert.equal(keyForChar('€'), null);
});

test('computes strokes per minute and accuracy immutably', () => {
  const start = createStats(0);
  let stats = start;
  for (let i = 0; i < 100; i += 1) stats = recordStroke(stats, i % 10 !== 0);
  assert.equal(start.strokes, 0);
  assert.equal(stats.strokes, 100);
  assert.equal(stats.errors, 10);
  assert.equal(accuracy(stats), 90);
  assert.equal(strokesPerMinute(stats, 30000), 180);
  assert.equal(formatTime(75000), '01:15');
});

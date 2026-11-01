import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charStates } from '../src/renderer/ui/typing-line.js';
import { createTarget, detectLang } from '../src/renderer/core/typing-input.js';
import { SHORTCUTS, SHORTCUT_STAGES, matchesCombo, comboLabels, comboCodes } from '../src/renderer/data/shortcuts.js';
import { decompose } from '../src/renderer/core/hangul.js';

const states = (target, typed) => charStates(target, [...typed]).map((s) => s.state).join(',');

test('a final consonant that will move to the next syllable is not marked wrong', () => {
  // typing 가방 -> after ㄱㅏㅂ the screen shows 갑, which must stay "correct + composing"
  assert.equal(states('가방', 'ㄱㅏㅂ'), 'correct,composing');
  assert.equal(states('가방', 'ㄱㅏㅂㅏㅇ'), 'correct,correct');
});

test('wrong keys mark the character as wrong', () => {
  assert.equal(states('가방', 'ㄱㅓ'), 'wrong,pending');
  assert.equal(states('ab', 'ax'), 'correct,wrong');
});

test('target reports the next key and completion', () => {
  const target = createTarget('과');
  assert.equal(target.nextKey([]).code, 'KeyR');
  assert.equal(target.nextKey(['ㄱ', 'ㅗ']).code, 'KeyK');
  assert.equal(target.nextKey(['ㄱ', 'ㅓ']).code, 'Backspace');
  assert.equal(target.isComplete(decompose('과')), true);
});

test('detects language of a sentence', () => {
  assert.equal(detectLang('하나님이 세상을'), 'ko');
  assert.equal(detectLang('Practice makes perfect.'), 'en');
});

test('matches shortcut combos exactly', () => {
  const base = { metaKey: false, ctrlKey: false, altKey: false, shiftKey: false };
  assert.equal(matchesCombo('Meta+KeyC', { ...base, code: 'KeyC', metaKey: true }), true);
  assert.equal(matchesCombo('Meta+KeyC', { ...base, code: 'KeyC', metaKey: true, shiftKey: true }), false);
  assert.equal(matchesCombo('F5', { ...base, code: 'F5' }), true);
  assert.deepEqual(comboLabels('Meta+Shift+KeyZ', 'mac'), ['⌘', '⇧', 'Z']);
  assert.deepEqual(comboLabels('Control+KeyY', 'win'), ['Ctrl', 'Y']);
});

test('comboCodes lights the left-hand modifier keys', () => {
  assert.deepEqual(comboCodes('Meta+KeyC'), ['MetaLeft', 'KeyC']);
  assert.deepEqual(comboCodes('Meta+Shift+KeyL'), ['MetaLeft', 'ShiftLeft', 'KeyL']);
  assert.deepEqual(comboCodes('Control+Shift+KeyS'), ['ControlLeft', 'ShiftLeft', 'KeyS']);
  assert.deepEqual(comboCodes('Alt+ArrowRight'), ['AltLeft', 'ArrowRight']);
});

test('every practice shortcut belongs to a stage', () => {
  const levels = new Set(SHORTCUT_STAGES.map((st) => st.level));
  const practice = SHORTCUTS.filter((sc) => !sc.system);
  assert.ok(practice.every((sc) => levels.has(sc.level)));
  for (const level of levels) assert.ok(practice.some((sc) => sc.level === level), `level ${level} is empty`);
});

test('macOS shortcuts on a Windows keyboard follow the Mac key order (Ctrl · Win · Alt)', () => {
  const base = { code: 'KeyC', metaKey: false, ctrlKey: false, altKey: false, shiftKey: false };
  assert.equal(matchesCombo('Meta+KeyC', { ...base, altKey: true }, { macOnWindows: true }), true); // ⌘ = Alt
  assert.equal(matchesCombo('Meta+KeyC', { ...base, metaKey: true }, { macOnWindows: true }), false);
  assert.equal(matchesCombo('Alt+KeyC', { ...base, metaKey: true }, { macOnWindows: true }), true); // ⌥ = Win
  assert.equal(matchesCombo('Control+KeyC', { ...base, ctrlKey: true }, { macOnWindows: true }), true);
  assert.deepEqual(comboCodes('Meta+Alt+KeyV', { macOnWindows: true }), ['AltLeft', 'MetaLeft', 'KeyV']);
});

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

test('comboCodes lights modifiers on the hand opposite the main key', () => {
  assert.deepEqual(comboCodes('Meta+KeyC', 'mac'), ['MetaRight', 'KeyC']);
  assert.deepEqual(comboCodes('Meta+KeyL', 'mac'), ['MetaLeft', 'KeyL']);
  assert.deepEqual(comboCodes('Control+Tab', 'mac'), ['ControlLeft', 'Tab']);
  assert.deepEqual(comboCodes('Control+Shift+KeyS', 'win'), ['ControlRight', 'ShiftRight', 'KeyS']);
  assert.deepEqual(comboCodes('Control+End', 'win'), ['ControlLeft', 'End']);
});

test('every practice shortcut belongs to a stage', () => {
  const levels = new Set(SHORTCUT_STAGES.map((st) => st.level));
  const practice = SHORTCUTS.filter((sc) => !sc.system);
  assert.ok(practice.every((sc) => levels.has(sc.level)));
  for (const level of levels) assert.ok(practice.some((sc) => sc.level === level), `level ${level} is empty`);
});

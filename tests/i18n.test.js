import { test } from 'node:test';
import assert from 'node:assert/strict';
import { t, loc, setUiLang, getUiLang, detectUiLang } from '../src/renderer/core/i18n.js';
import { KO } from '../src/renderer/i18n/ko.js';
import { EN } from '../src/renderer/i18n/en.js';
import { KO_STAGES, EN_STAGES } from '../src/renderer/data/jamo-stages.js';
import { KO_WORD_SETS, EN_WORD_SETS } from '../src/renderer/data/words.js';
import { SHORTCUTS, SHORTCUT_STAGES } from '../src/renderer/data/shortcuts.js';
import { SOUND_PACKS } from '../src/renderer/core/sound.js';

test('Korean and English dictionaries have the same keys', () => {
  assert.deepEqual(Object.keys(EN).sort(), Object.keys(KO).sort());
});

test('every data label has a translation in both languages', () => {
  const keys = [
    ...[...KO_STAGES, ...EN_STAGES].flatMap((st) => [`stage.${st.id}`, `stage.${st.id}.desc`]),
    ...[...Object.keys(KO_WORD_SETS), ...Object.keys(EN_WORD_SETS)].map((name) => `wordset.${name}`),
    ...SHORTCUT_STAGES.flatMap((st) => [st.id, `${st.id}.desc`]),
    ...SHORTCUTS.map((sc) => `sc.cat.${sc.category}`),
    ...SOUND_PACKS.flatMap((pack) => [`pack.${pack.id}`, `pack.${pack.id}.desc`]),
  ];
  for (const key of keys) {
    assert.ok(key in KO, `missing in ko: ${key}`);
    assert.ok(key in EN, `missing in en: ${key}`);
  }
  assert.ok(SHORTCUTS.every((sc) => sc.action.ko && sc.action.en));
});

test('t fills placeholders in the current display language', () => {
  const before = getUiLang();
  setUiLang('en');
  assert.equal(t('action.next', { title: 'Step 2' }), 'Next: Step 2');
  assert.equal(loc({ ko: '복사하기', en: 'Copy' }), 'Copy');
  setUiLang('ko');
  assert.equal(t('action.next', { title: '2단계' }), '다음: 2단계');
  assert.equal(t('no.such.key'), 'no.such.key');
  setUiLang('fr');
  assert.equal(getUiLang(), 'ko');
  setUiLang(before);
});

test('detectUiLang follows the system locale', () => {
  assert.equal(detectUiLang('ko-KR'), 'ko');
  assert.equal(detectUiLang('en-US'), 'en');
  assert.equal(detectUiLang(''), 'en');
});

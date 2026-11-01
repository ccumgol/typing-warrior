import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BIBLE_VERSES } from '../src/renderer/data/bible.js';
import { EN_BIBLE_VERSES, EN_BIBLE_TRANSLATION } from '../src/renderer/data/bible-en.js';
import { BIBLE_FULL as KRV } from '../src/renderer/data/bible-full-krv.js';
import { BIBLE_FULL as KJV } from '../src/renderer/data/bible-full-kjv.js';
import { verseText } from '../src/renderer/core/bible-source.js';
import { WORKS as KO_POETRY } from '../src/renderer/data/poetry-ko.js';
import { WORKS as EN_POETRY } from '../src/renderer/data/poetry-en.js';
import { ABOUT } from '../src/renderer/data/about.js';
import { isTypable } from '../src/renderer/core/keyboard-layout.js';

test('English memory verses are KJV and typable', () => {
  assert.equal(EN_BIBLE_TRANSLATION, 'KJV');
  assert.ok(EN_BIBLE_VERSES.every((v) => v.source.endsWith('(KJV)') && !/[\[\]’]/.test(v.text)));
  assert.equal(EN_BIBLE_VERSES.find((v) => v.source.startsWith('John 3:16')).text.slice(0, 26), 'For God so loved the world');
});

test('365 memory verses, the same references in Korean and English', () => {
  assert.equal(BIBLE_VERSES.length, 365);
  assert.equal(new Set(BIBLE_VERSES.map((v) => v.source)).size, 365);
  assert.equal(EN_BIBLE_VERSES.length, BIBLE_VERSES.length);
  assert.ok(EN_BIBLE_VERSES.every((v) => v.text.length > 0));
  // each memory verse matches the same reference in the whole-Bible data
  for (const v of BIBLE_VERSES) assert.equal(verseText(KRV, v.source), v.text, v.source);
});

test('the whole Bible: 66 books, 1,189 chapters, 31,102 verses in both translations', () => {
  for (const books of [KRV, KJV]) {
    assert.equal(books.length, 66);
    assert.equal(books.flat().length, 1189);
    assert.equal(books.flat(2).length, 31102);
    assert.ok(books.flat(2).every((v) => v.length > 0));
  }
  assert.equal(KRV[18][22][0], '여호와는 나의 목자시니 내가 부족함이 없으리로다'); // 시 23:1
  assert.equal(KJV[18][22][0], 'The LORD is my shepherd; I shall not want.'); // Ps 23:1
  assert.match(KJV[18][22][2], /name's sake/); // apostrophes normalized to '
  assert.equal(KRV[18][118].length, 176); // 시 119
});

const untypable = (lines) => [...new Set(lines.join('').split('').filter((c) => !isTypable(c) && !/[가-힣]/.test(c)))];

test('every Bible verse can be typed on the keyboard', () => {
  assert.deepEqual(untypable(KRV.flat(2)), []);
  assert.deepEqual(untypable(KJV.flat(2)), []);
});

test('every poetry line can be typed on the keyboard', () => {
  for (const work of [...KO_POETRY, ...EN_POETRY]) {
    const lines = work.pieces.flatMap((p) => p.lines);
    assert.deepEqual(untypable(lines), [], work.id);
    assert.ok(work.pieces.every((p) => p.lines.length > 0), `${work.id} has an empty piece`);
  }
});

test('poetry works have the expected sizes and sources', () => {
  const byId = Object.fromEntries([...KO_POETRY, ...EN_POETRY].map((w) => [w.id, w]));
  assert.equal(byId.sonnets.pieces.length, 154);
  assert.equal(byId.sonnets.pieces[17].lines[0], "Shall I compare thee to a summer's day?"); // Sonnet 18
  assert.ok(byId.dickinson.pieces.length > 400);
  assert.ok(byId.jindallae.pieces.some((p) => p.title === '진달래꽃' && p.lines.includes('나 보기가 역겨워')));
  assert.equal(byId.yundongju.pieces[0].title, '서시');
  assert.ok(byId.yundongju.pieces[0].lines.includes('죽는 날까지 하늘을 우르러'));
  assert.ok(byId.nimui.pieces.length >= 88);
  for (const work of Object.values(byId)) assert.match(work.source.url, /^https:\/\//, work.id);
});

test('the About page lists a source for every long text', () => {
  for (const lang of ['ko', 'en']) {
    const names = ABOUT[lang].sources.map((s) => s.name).join(' ');
    for (const work of [...KO_POETRY, ...EN_POETRY]) assert.ok(names.includes(`{count:${work.id}}`), `${lang}: ${work.id}`);
    assert.ok(ABOUT[lang].sources.every((s) => s.links.every((l) => l.url.startsWith('https://'))));
  }
});

test('verse of the day: one verse per date, including 29 February', async () => {
  const { verseOfDayIndex } = await import('../src/renderer/core/verse-of-day.js');
  assert.equal(verseOfDayIndex(new Date(2026, 0, 1)), 0);
  assert.equal(verseOfDayIndex(new Date(2026, 11, 31)), 364);
  assert.equal(verseOfDayIndex(new Date(2028, 11, 31)), 364); // leap year: no shift
  assert.equal(verseOfDayIndex(new Date(2028, 1, 29)), verseOfDayIndex(new Date(2028, 1, 28)));
  assert.equal(verseOfDayIndex(new Date(2028, 2, 1)), verseOfDayIndex(new Date(2026, 2, 1)));
});

test('every memory verse belongs to exactly one topic', async () => {
  const { VERSE_TOPICS } = await import('../src/renderer/data/verse-topics.js');
  const refs = VERSE_TOPICS.flatMap((topic) => topic.refs);
  assert.equal(refs.length, BIBLE_VERSES.length);
  assert.deepEqual([...refs].sort(), BIBLE_VERSES.map((v) => v.source).sort());
});

test('the app version shown on the About page matches package.json', async () => {
  const { readFileSync } = await import('node:fs');
  const { APP_VERSION } = await import('../src/renderer/version.js');
  assert.equal(APP_VERSION, JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).version);
});

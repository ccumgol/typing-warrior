import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BIBLE_VERSES } from '../src/renderer/data/bible.js';
import { EN_BIBLE_VERSES, EN_BIBLE_TRANSLATION, EN_BIBLE_NOTICE } from '../src/renderer/data/bible-en.js';
import { PSALMS } from '../src/renderer/data/psalms.js';
import { PSALMS as KJV_PSALMS } from '../src/renderer/data/psalms-kjv.js';
import { WORKS as KO_POETRY } from '../src/renderer/data/poetry-ko.js';
import { WORKS as EN_POETRY } from '../src/renderer/data/poetry-en.js';
import { esvShare, ESV_SHARE_LIMIT } from '../src/renderer/data/content-share.js';
import { ABOUT } from '../src/renderer/data/about.js';
import { isTypable } from '../src/renderer/core/keyboard-layout.js';

test('ESV verses stay well under 25% of all practice text', () => {
  const share = esvShare();
  assert.ok(share < ESV_SHARE_LIMIT, `ESV share is ${(share * 100).toFixed(1)}%`);
});

test('ESV text carries the required copyright notice', () => {
  if (EN_BIBLE_TRANSLATION !== 'ESV') return;
  assert.match(EN_BIBLE_NOTICE, /ESV® Bible/);
  assert.match(EN_BIBLE_NOTICE, /Crossway/);
  assert.ok(EN_BIBLE_VERSES.every((v) => v.source.endsWith('(ESV)')));
});

test('English verses match the Korean memory verses one to one', () => {
  assert.equal(EN_BIBLE_VERSES.length, BIBLE_VERSES.length);
  assert.ok(EN_BIBLE_VERSES.every((v) => v.text.length > 0));
});

test('all 150 psalms are present in order with their verses', () => {
  assert.equal(PSALMS.length, 150);
  assert.ok(PSALMS.every((p, i) => p.chapter === i + 1 && p.verses.length > 0));
  assert.equal(PSALMS[22].verses[0], '여호와는 나의 목자시니 내가 부족함이 없으리로다'); // 시 23:1
  assert.equal(PSALMS[118].verses.length, 176); // 시 119 is the longest psalm
});

test('KJV psalms line up verse for verse with the Korean psalms', () => {
  assert.equal(KJV_PSALMS.length, 150);
  assert.ok(KJV_PSALMS.every((p, i) => p.chapter === i + 1 && p.verses.length === PSALMS[i].verses.length));
  assert.equal(KJV_PSALMS[22].verses[0], 'The LORD is my shepherd; I shall not want.'); // Ps 23:1
  assert.match(KJV_PSALMS[22].verses[2], /name's sake/); // apostrophes kept, normalized to '
});

const untypable = (lines) => [...new Set(lines.join('').split('').filter((c) => !isTypable(c) && !/[가-힣]/.test(c)))];

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

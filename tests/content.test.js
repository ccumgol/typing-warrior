import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KO_WORD_SETS, EN_WORD_SETS } from '../src/renderer/data/words.js';
import { KO_QUOTES, EN_SENTENCES } from '../src/renderer/data/quotes.js';
import { BIBLE_VERSES } from '../src/renderer/data/bible.js';
import { EN_BIBLE_VERSES, EN_BIBLE_TRANSLATION, EN_BIBLE_NOTICE } from '../src/renderer/data/bible-en.js';
import { PSALMS } from '../src/renderer/data/psalms.js';

const chars = (items) => items.reduce((sum, item) => sum + (typeof item === 'string' ? item : item.text).length, 0);

// Crossway allows quoting the ESV without a license only while it stays under 25% of the work.
const ESV_SHARE_LIMIT = 0.25;

test('ESV verses stay well under 25% of all practice text', () => {
  const esv = chars(EN_BIBLE_VERSES);
  const others = [
    ...Object.values(KO_WORD_SETS).flat(), ...Object.values(EN_WORD_SETS).flat(),
    ...KO_QUOTES, ...EN_SENTENCES, ...BIBLE_VERSES, ...PSALMS.flatMap((p) => p.verses),
  ];
  const share = esv / (esv + chars(others));
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

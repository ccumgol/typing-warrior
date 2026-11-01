import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLine, parseTextFile, parseBibleFile, expandRef, buildBibleOverride } from '../src/renderer/core/user-content.js';
import { bookNumber } from '../src/renderer/data/bible-books.js';

test('normalizeLine makes text typable and counts what it had to drop', () => {
  assert.deepEqual(normalizeLine('“Hello” — it’s… 영변(寧邊) [is] café'), { text: '"Hello" - it\'s... 영변 is cafe', dropped: 0 });
  assert.deepEqual(normalizeLine('사랑 ❤ 平和'), { text: '사랑', dropped: 3 });
});

test('a text file with headings becomes a work with titled pieces', () => {
  const file = '# 나의 묵상\n\n## 첫째 날\n주님을 찬양합니다\n\n감사합니다\n## 둘째 날\n오늘도 걷습니다\n';
  const work = parseTextFile(file, 'notes.txt');
  assert.equal(work.title, '나의 묵상');
  assert.equal(work.lang, 'ko');
  assert.deepEqual(work.pieces.map((p) => p.title), ['첫째 날', '둘째 날']);
  assert.deepEqual(work.pieces[0].lines, ['주님을 찬양합니다', '감사합니다']);
});

test('a text file without headings is named after the file and split into parts', () => {
  const lines = Array.from({ length: 45 }, (_, i) => `Line number ${i + 1}`).join('\n');
  const work = parseTextFile(lines, 'My Poems.txt');
  assert.equal(work.title, 'My Poems');
  assert.equal(work.lang, 'en');
  assert.deepEqual(work.pieces.map((p) => p.lines.length), [20, 20, 5]);
  assert.throws(() => parseTextFile('\n\n', 'empty.txt'), /empty/);
});

test('book names are recognised in Korean and English', () => {
  for (const name of ['시', '시편', 'Ps', 'Psalms', 'psalm']) assert.equal(bookNumber(name), 19);
  for (const name of ['요일', '요한일서', '1John', '1 John']) assert.equal(bookNumber(name), 62);
  assert.equal(bookNumber('없는책'), null);
  assert.deepEqual(expandRef('시 1:1-2'), [[19, 1, 1], [19, 1, 2]]);
});

test('a Bible file replaces memory verses and, when complete, the Psalms', () => {
  const psalms = Array.from({ length: 150 }, (_, c) => `시편 ${c + 1}:1 ${c + 1}편 1절 말씀`).join('\n');
  const file = `#번역 나의번역\n창 1:1 태초에 하나님이\n요 3:16 하나님이 세상을\n시 1:2 오직 여호와의 율법을\n${psalms}\n없는책 1:1 무시됨`;
  const parsed = parseBibleFile(file, 'bible.txt');
  assert.equal(parsed.name, '나의번역');
  assert.equal(parsed.lang, 'ko');
  assert.equal(parsed.unknownBooks, 1);
  const override = buildBibleOverride(parsed, ['창 1:1', '요 3:16', '시 1:1-2', '롬 8:28']);
  assert.deepEqual(Object.keys(override.verses), ['창 1:1', '요 3:16', '시 1:1-2']);
  assert.equal(override.verses['시 1:1-2'], '1편 1절 말씀 오직 여호와의 율법을');
  assert.equal(override.psalms.length, 150);
  assert.equal(buildBibleOverride(parseBibleFile('Gen 1:1 In the beginning', 'kjv.txt'), ['창 1:1']).psalms, null);
});

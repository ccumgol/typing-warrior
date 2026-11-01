import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chapterVerses, listBibles, downloadBible, needsRefresh } from '../src/renderer/core/api-bible.js';

/** A fake API.Bible: answers by path, and remembers which paths were asked for. */
function fakeApi(routes) {
  const asked = [];
  const fetchImpl = async (url, options) => {
    const path = url.replace('https://api.scripture.api.bible/v1', '');
    asked.push(path);
    if (options.headers['api-key'] !== 'good-key') return { ok: false, status: 401, json: async () => ({}) };
    const route = Object.entries(routes).find(([prefix]) => path.startsWith(prefix));
    return route ? { ok: true, status: 200, json: async () => route[1] } : { ok: false, status: 404, json: async () => ({}) };
  };
  return { fetchImpl, asked };
}

test('chapter text splits into verses by their numbers', () => {
  assert.deepEqual(chapterVerses('  [1] In the beginning God created.  [2] And the earth was “void”. '), ['In the beginning God created.', 'And the earth was "void".']);
});

test('only English and Korean Bibles are listed, and a bad key is reported', async () => {
  const { fetchImpl, asked } = fakeApi({
    '/bibles?language=eng': { data: [{ id: 'kjv1', name: 'King James', abbreviation: 'KJV', language: { id: 'eng' } }] },
    '/bibles?language=kor': { data: [{ id: 'kor1', name: 'Korean', nameLocal: '한국어 성경', abbreviationLocal: '한글', language: { id: 'kor' } }] },
  });
  const bibles = await listBibles('good-key', fetchImpl);
  assert.deepEqual(asked.sort(), ['/bibles?language=eng', '/bibles?language=kor']);
  assert.deepEqual(bibles.map((b) => [b.name, b.language]), [['King James', 'en'], ['한국어 성경', 'ko']]);
  await assert.rejects(listBibles('wrong', fetchImpl), /api-key/);
});

test('a whole Bible downloads chapter by chapter into books, with copyright and FUMS tokens', async () => {
  const { fetchImpl } = fakeApi({
    '/bibles/kjv1/books': { data: [
      { id: 'GEN', chapters: [{ id: 'GEN.intro', number: 'intro' }, { id: 'GEN.1', number: '1' }] },
      { id: 'JHN', chapters: [{ id: 'JHN.3', number: '3' }] },
    ] },
    '/bibles/kjv1/chapters/GEN.1': { data: { content: '[1] In the beginning [2] And the earth' }, meta: { fumsToken: 'tok-gen1' } },
    '/bibles/kjv1/chapters/JHN.3': { data: { content: '[16] For God so loved the world' }, meta: { fumsToken: 'tok-jhn3' } },
    '/bibles/kjv1': { data: { copyright: '<p>Public domain</p>' } },
  });
  const progress = [];
  const bible = await downloadBible('good-key', { id: 'kjv1', name: 'King James', abbreviation: 'KJV', language: 'en' }, (done, total) => progress.push(`${done}/${total}`), fetchImpl);
  assert.equal(bible.name, 'KJV');
  assert.equal(bible.copyright, 'Public domain');
  assert.deepEqual(bible.books[0][0], ['In the beginning', 'And the earth']);
  assert.equal(bible.books[42][2][15], 'For God so loved the world');
  assert.deepEqual(progress, ['1/2', '2/2']);
  assert.equal(bible.fums['43|3'], 'tok-jhn3');
  assert.equal(needsRefresh(bible), false);
  assert.equal(needsRefresh(bible, Date.now() + 31 * 86_400_000), true);
  assert.equal(needsRefresh({ name: 'file', books: [] }), false); // uploaded files never expire
});

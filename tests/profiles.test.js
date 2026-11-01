import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// A small in-memory stand-in for the browser's localStorage.
const store = new Map();
globalThis.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
};

const profiles = await import('../src/renderer/core/profiles.js');
const storage = await import('../src/renderer/core/storage.js');
const { earnedBadges, chapterProgress } = await import('../src/renderer/core/badges.js');
const { CHAPTER_COUNTS } = await import('../src/renderer/data/bible-books.js');
const { BIBLE_FULL } = await import('../src/renderer/data/bible-full-krv.js');

beforeEach(() => store.clear());

test('the first run turns existing records and progress into the first profile', () => {
  store.set('tw.records.v1', JSON.stringify([{ mode: 'jamo-ko', score: 120, at: 1, ms: 1000, accuracy: 98 }]));
  store.set('tw.settings.v1', JSON.stringify({ theme: 'dark', completedStages: ['ko-home'], acidCleared: 3 }));
  const state = profiles.loadProfiles('나');
  assert.equal(state.profiles.length, 1);
  assert.equal(state.profiles[0].name, '나');
  assert.equal(storage.loadRecords().length, 1);
  assert.deepEqual(profiles.loadProfileData(state.activeId).completedStages, ['ko-home']);
  assert.equal(profiles.loadProfileData(state.activeId).acidCleared, 3);
  assert.equal(store.has('tw.records.v1'), false);
});

test('each profile keeps its own records; reset and remove work', () => {
  const first = profiles.loadProfiles('나').activeId;
  storage.addRecord({ mode: 'words-ko', label: 'x', score: 200, accuracy: 99, ms: 500 });
  const second = profiles.addProfile('  민수  ');
  assert.equal(profiles.loadProfiles().activeId, second);
  assert.equal(profiles.loadProfiles().profiles.find((p) => p.id === second).name, '민수');
  assert.equal(storage.loadRecords().length, 0);
  assert.equal(storage.loadRecords(first).length, 1);
  profiles.resetProfile(first);
  assert.equal(storage.loadRecords(first).length, 0);
  assert.equal(profiles.removeProfile(second), true);
  assert.equal(profiles.removeProfile(first), false); // the last profile stays
  assert.equal(profiles.addProfile('   '), null);
});

test('settings are saved without the per-profile values', () => {
  profiles.loadProfiles('나');
  storage.saveSettings({ theme: 'light', completedStages: ['x'], acidCleared: 5 });
  assert.deepEqual(JSON.parse(store.get('tw.settings.v1')), { theme: 'light' });
});

test('badges come from finished chapters and works', () => {
  assert.deepEqual(CHAPTER_COUNTS, BIBLE_FULL.map((book) => book.length));
  const ruth = Array.from({ length: 4 }, (_, c) => `bible-ko-${CHAPTER_COUNTS.slice(0, 7).reduce((a, b) => a + b, 0) + c + 1}`);
  const tenMore = Array.from({ length: 6 }, (_, i) => `bible-en-${i + 1}`);
  const badges = earnedBadges([...ruth, ...tenMore]).map((b) => b.id);
  assert.ok(badges.includes('bible-ko-book-8'), 'Ruth finished');
  assert.ok(badges.includes('chapters-10'));
  assert.deepEqual(chapterProgress([...ruth, ...tenMore]), { done: 10, next: 50 });
  assert.ok(earnedBadges(Array.from({ length: 35 }, (_, i) => `hymns-${i + 1}`)).some((b) => b.id === 'work-hymns'));
});

// 긴 글 완성 배지: 이미 저장된 완료 표시(completedStages)에서 계산하므로 따로 저장하지 않습니다.
import { CHAPTER_COUNTS, bookName } from '../data/bible-books.js';
import { WORKS as KO_POETRY } from '../data/poetry-ko.js';
import { WORKS as EN_POETRY } from '../data/poetry-en.js';
import { t, loc, getUiLang } from './i18n.js';

const BIBLE = [['bible-ko', '개역한글'], ['bible-en', 'KJV']];
const MILESTONES = [10, 50, 100, 300];
const TOTAL_CHAPTERS = CHAPTER_COUNTS.reduce((a, b) => a + b, 0);
const BOOK_START = CHAPTER_COUNTS.reduce((starts, count, i) => [...starts, starts[i] + count], [1]); // 1-based first chapter of each book

/** Number of finished chapters per Bible text id. */
const chaptersDone = (done, bibleId) => [...done].filter((id) => id.startsWith(`${bibleId}-`) && /^\d+$/.test(id.slice(bibleId.length + 1))).length;

function bookBadges(done) {
  const badges = [];
  for (const [bibleId, translation] of BIBLE) {
    CHAPTER_COUNTS.forEach((count, b) => {
      const first = BOOK_START[b];
      const finished = Array.from({ length: count }, (_, c) => done.has(`${bibleId}-${first + c}`)).every(Boolean);
      if (finished) badges.push({ id: `${bibleId}-book-${b + 1}`, icon: '📖', title: t('badge.book', { book: bookName(b + 1, getUiLang()) }), detail: translation });
    });
  }
  return badges;
}

function milestoneBadges(done) {
  const total = BIBLE.reduce((sum, [bibleId]) => sum + chaptersDone(done, bibleId), 0);
  const whole = BIBLE.filter(([bibleId]) => chaptersDone(done, bibleId) === TOTAL_CHAPTERS).map(([, name]) => name);
  return [
    ...MILESTONES.filter((n) => total >= n).map((n) => ({ id: `chapters-${n}`, icon: n >= 300 ? '🏆' : '🌱', title: t('badge.chapters', { count: n }), detail: t('badge.chaptersDetail') })),
    ...whole.map((name) => ({ id: `bible-all-${name}`, icon: '👑', title: t('badge.wholeBible'), detail: name })),
  ];
}

function workBadges(done) {
  return [...KO_POETRY, ...EN_POETRY]
    .filter((work) => work.pieces.every((_, i) => done.has(`${work.id}-${i + 1}`)))
    .map((work) => ({ id: `work-${work.id}`, icon: '🎖️', title: t('badge.work', { title: loc(work.title) }), detail: loc(work.author) }));
}

/** Badges earned from the finished pieces, plus how far along the chapter milestones are. */
export function earnedBadges(completedStages) {
  const done = new Set(completedStages);
  return [...milestoneBadges(done), ...bookBadges(done), ...workBadges(done)];
}

/** Progress toward the next chapter milestone: { done, next } (next is null after the whole Bible). */
export function chapterProgress(completedStages) {
  const done = new Set(completedStages);
  const total = BIBLE.reduce((sum, [bibleId]) => sum + chaptersDone(done, bibleId), 0);
  return { done: total, next: [...MILESTONES, TOTAL_CHAPTERS].find((n) => n > total) ?? null };
}

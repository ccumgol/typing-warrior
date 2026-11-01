// 연습에 쓸 성경 본문: 기본 성경(개역한글 · KJV, 필요할 때 불러옴)에 사용자가 올린 성경을 덮어씁니다.
// 사용자 성경에 없는 책·장·절은 기본 성경 본문을 씁니다.
import { loadUserBible } from './bible-store.js';
import { expandRef } from './user-content.js';

const loaders = {
  ko: () => import('../data/bible-full-krv.js'),
  en: () => import('../data/bible-full-kjv.js'),
};
const defaults = {};

async function defaultBible(lang) {
  if (!defaults[lang]) {
    const data = await loaders[lang]();
    defaults[lang] = { name: data.BIBLE_FULL_TRANSLATION, books: data.BIBLE_FULL };
  }
  return defaults[lang];
}

const merge = (base, user) => base.map((chapters, b) => chapters.map((verses, c) => verses.map((text, v) => user[b]?.[c]?.[v] || text)));

/** { name, books, user } for 'ko' or 'en'. books[book-1][chapter-1][verse-1] */
export async function getBible(lang) {
  const [base, user] = await Promise.all([defaultBible(lang), loadUserBible(lang)]);
  return user ? { name: user.name, books: merge(base.books, user.books), user: true } : { ...base, user: false };
}

/** Number of verses in the user's books that exist in the standard 66-book layout. */
export const countVerses = (books) => books.reduce((sum, chapters) => sum + chapters.reduce((s, verses) => s + verses.filter(Boolean).length, 0), 0);

/** Memory-verse text for each app reference ("시 1:1-2") from a Bible. */
export const verseText = (books, ref) => expandRef(ref).map(([b, c, v]) => books[b - 1]?.[c - 1]?.[v - 1] ?? '').join(' ').trim();

/** Text of a reference only when every verse of it is in the given books (e.g. the user's file); otherwise ''. */
export function completeVerseText(books, ref) {
  const parts = expandRef(ref).map(([b, c, v]) => books[b - 1]?.[c - 1]?.[v - 1]);
  return parts.length && parts.every(Boolean) ? parts.join(' ') : '';
}

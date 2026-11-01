// 암송 365구절 본문: 기본(개역한글 · KJV)에 사용자가 올린 성경을 덮어씁니다. 문장 연습과 말씀 메뉴가 함께 씁니다.
import { BIBLE_VERSES, BIBLE_TRANSLATION } from '../data/bible.js';
import { EN_BIBLE_VERSES, EN_BIBLE_TRANSLATION } from '../data/bible-en.js';
import { loadUserBible } from './bible-store.js';
import { completeVerseText } from './bible-source.js';

export const DEFAULT_NAMES = { ko: BIBLE_TRANSLATION, en: EN_BIBLE_TRANSLATION };
const DEFAULT_VERSES = { ko: BIBLE_VERSES, en: EN_BIBLE_VERSES };


/**
 * Memory verses for a language, using the Bible the user opened (긴 글 → 성경 파일 올리기) when there is one.
 * English verses share the Korean references by position.
 */
export async function loadMemoryVerses(lang) {
  const user = await loadUserBible(lang);
  if (!user) return { translation: DEFAULT_NAMES[lang], items: DEFAULT_VERSES[lang] };
  // Verses missing from the user's file keep the default text and its translation name.
  const items = DEFAULT_VERSES[lang].map((verse, i) => {
    const text = completeVerseText(user.books, BIBLE_VERSES[i].source);
    return text ? { text, source: `${verse.source.replace(/\s*\([^)]*\)$/, '')} (${user.name})` } : verse;
  });
  return { translation: user.name, items };
}


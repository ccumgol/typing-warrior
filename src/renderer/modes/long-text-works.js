// 긴 글 작품 목록: 성경 전권(책 → 장), 시집, 내가 불러온 글. 예전 시편 진행 기록을 성경 전권으로 옮기는 일도 합니다.
import { WORKS as KO_POETRY } from '../data/poetry-ko.js';
import { WORKS as EN_POETRY } from '../data/poetry-en.js';
import { bookName } from '../data/bible-books.js';
import { loadUserTexts } from '../core/user-content.js';
import { t, loc, getUiLang } from '../core/i18n.js';

export const BIBLE_IDS = Object.freeze({ ko: 'bible-ko', en: 'bible-en' });
export const PSALMS_BOOK = 19;

/** One piece per chapter, in canonical order, remembering where each book starts. */
function bibleWork(lang, bible) {
  const pieces = [];
  const bookStart = [];
  bible.books.forEach((chapters, b) => {
    bookStart.push(pieces.length + 1);
    chapters.forEach((verses, c) => pieces.push({ title: null, book: b + 1, chapter: c + 1, lines: verses.filter(Boolean) }));
  });
  return {
    id: BIBLE_IDS[lang], lang, numbered: true, bible: true, user: false, pieces, bookStart,
    translation: bible.name, customBible: bible.user, copyright: bible.copyright ?? '', fums: bible.fums ?? null,
    label: () => t('long.bible', { translation: bible.name }),
    // Korean calls a psalm 편 rather than 장 (시편 23편)
    pieceLabel: (n, piece) => t(piece.book === PSALMS_BOOK ? 'long.psalmChapter' : 'long.bibleChapter', { book: bookName(piece.book, getUiLang()), chapter: piece.chapter }),
  };
}

const poetry = (work) => ({
  id: work.id, lang: work.lang, numbered: false, pieces: work.pieces,
  label: () => `📖 ${loc(work.title)}`,
  pieceLabel: (n, piece) => (piece.title ? `${n}. ${piece.title}` : t('long.sonnet', { n })),
});

const userWork = (work) => ({
  id: work.id, lang: work.lang, numbered: false, pieces: work.pieces, user: true,
  label: () => `📄 ${work.title}`,
  pieceLabel: (n, piece) => (piece.title ? `${n}. ${piece.title}` : t('long.userPart', { n })),
});

/** All texts for both languages. `bibles` = { ko, en } from getBible(). */
export function buildTexts(bibles) {
  const user = loadUserTexts().map(userWork);
  return [
    bibleWork('ko', bibles.ko), ...KO_POETRY.map(poetry), ...user.filter((w) => w.lang === 'ko'),
    bibleWork('en', bibles.en), ...EN_POETRY.map(poetry), ...user.filter((w) => w.lang === 'en'),
  ];
}

/**
 * Earlier versions had separate Psalms texts ('psalms', 'psalms-kjv'). Move their saved place and finished
 * chapters into the whole Bible so nobody loses progress. Returns the settings patch (or null when nothing to move).
 */
export function migrateOldPsalms(settings, texts) {
  const pairs = [['psalms', 'ko'], ['psalms-kjv', 'en']];
  const progress = { ...settings.longTextProgress };
  let stages = [...settings.completedStages];
  let changed = false;
  for (const [oldId, lang] of pairs) {
    const bible = texts.find((w) => w.id === BIBLE_IDS[lang]);
    const offset = bible.bookStart[PSALMS_BOOK - 1] - 1;
    if (progress[oldId]) {
      if (!progress[bible.id]) progress[bible.id] = { chapter: offset + progress[oldId].chapter, verse: progress[oldId].verse };
      delete progress[oldId];
      changed = true;
    }
    const prefix = `${oldId}-`;
    if (stages.some((s) => s.startsWith(prefix) && /^\d+$/.test(s.slice(prefix.length)))) {
      stages = stages.map((s) => (s.startsWith(prefix) && /^\d+$/.test(s.slice(prefix.length)) ? `${bible.id}-${offset + Number(s.slice(prefix.length))}` : s));
      changed = true;
    }
  }
  const idMap = { psalms: BIBLE_IDS.ko, 'psalms-kjv': BIBLE_IDS.en };
  const longTextId = idMap[settings.longTextId] ?? settings.longTextId;
  if (!changed && longTextId === settings.longTextId) return null;
  return { longTextProgress: progress, completedStages: [...new Set(stages)], longTextId };
}

// 사용자가 불러온 텍스트 파일(긴 글 연습)과 공용 도우미(문자 정리, 성경 구절 표기 풀기).
// 파일 해석은 순수 함수로 두고, 저장은 이 컴퓨터의 앱 저장소(localStorage)에만 합니다. 성경 전권은 bible-store.js(IndexedDB)에 저장합니다.
import { isTypable } from './keyboard-layout.js';
import { bookNumber } from '../data/bible-books.js';

export const MAX_FILE_CHARS = 600_000; // about 1 MB of UTF-8 text
const LINES_PER_PART = 20; // a file without "## headings" is split into parts of this many lines
const TEXTS_KEY = 'tw.userTexts.v1';

const PUNCT = [
  [/[‘’‛′]/g, "'"], [/[“”„″]/g, '"'], [/[―—–‐]/g, '-'], [/…/g, '...'], [/[·•]/g, ','],
  [/[「」『』｢｣]/g, "'"], [/[ 　\t]/g, ' '],
];
const HANJA = '[\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff]';

/** Make a line typable: fix punctuation, drop hanja glosses and [italic] brackets, remove what still can't be typed. */
export function normalizeLine(line) {
  let text = line.normalize('NFC');
  for (const [pattern, replacement] of PUNCT) text = text.replace(pattern, replacement);
  text = text.replace(new RegExp(`\\s*\\(${HANJA}+\\)`, 'g'), '').replace(/[[\]]/g, '');
  text = text.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC'); // è → e
  let dropped = 0;
  const kept = [...text].filter((ch) => {
    const ok = isTypable(ch) || /[가-힣]/.test(ch);
    if (!ok) dropped += 1;
    return ok;
  }).join('');
  return { text: kept.replace(/\s+/g, ' ').trim(), dropped };
}

const detectLang = (text) => (/[가-힣]/.test(text) ? 'ko' : 'en');
const baseName = (fileName) => fileName.replace(/\.[^.]+$/, '').trim() || 'text';

/**
 * Plain text file → a long-text work.
 * "# 제목" (first line) names the work, "## 소제목" starts a new piece, every other non-empty line is one typing line.
 */
export function parseTextFile(content, fileName) {
  if (content.length > MAX_FILE_CHARS) throw new Error('too-large');
  let title = baseName(fileName);
  const pieces = [];
  let dropped = 0;
  let current = null;
  for (const raw of content.replace(/^﻿/, '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('## ')) {
      current = { title: normalizeLine(line.slice(3)).text, lines: [] };
      pieces.push(current);
    } else if (line.startsWith('# ') && pieces.length === 0 && !current) {
      title = line.slice(2).trim() || title;
    } else {
      const { text, dropped: lost } = normalizeLine(line);
      dropped += lost;
      if (!text) continue;
      if (!current) {
        current = { title: null, lines: [] };
        pieces.push(current);
      }
      current.lines.push(text);
    }
  }
  const filled = pieces.filter((p) => p.lines.length > 0);
  if (filled.length === 0) throw new Error('empty');
  const split = filled.length === 1 && filled[0].title === null && filled[0].lines.length > LINES_PER_PART
    ? chunk(filled[0].lines, LINES_PER_PART).map((lines) => ({ title: null, lines }))
    : filled;
  const allText = split.flatMap((p) => p.lines).join(' ');
  return { title, lang: detectLang(allText), pieces: split, dropped };
}

const chunk = (list, size) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));

/** "시 1:1-2" → [[19, 1, 1], [19, 1, 2]] (references in the app's memory-verse list). */
export function expandRef(ref) {
  const m = ref.match(/^(\S+)\s+(\d+):(\d+)(?:-(\d+))?/);
  if (!m) return [];
  const book = bookNumber(m[1]);
  const [chapter, first, last] = [Number(m[2]), Number(m[3]), Number(m[4] || m[3])];
  return Array.from({ length: last - first + 1 }, (_, i) => [book, chapter, first + i]);
}

// ---------------------------------------------------------------- storage (this computer only)

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`Could not read ${key}.`, error);
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Could not save ${key}.`, error); // usually the storage quota
    return false;
  }
}

const isWork = (w) => w && typeof w.id === 'string' && typeof w.title === 'string' && (w.lang === 'ko' || w.lang === 'en') &&
  Array.isArray(w.pieces) && w.pieces.every((p) => Array.isArray(p.lines) && p.lines.every((l) => typeof l === 'string'));

export const loadUserTexts = () => read(TEXTS_KEY, []).filter(isWork);

/** Returns the saved list, or null when it could not be stored. */
export function addUserText(work) {
  const texts = [...loadUserTexts(), { ...work, id: `user-${Date.now()}` }];
  return write(TEXTS_KEY, texts) ? texts : null;
}

export function removeUserText(id) {
  const texts = loadUserTexts().filter((w) => w.id !== id);
  write(TEXTS_KEY, texts);
  return texts;
}

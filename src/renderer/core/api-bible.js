// API.Bible (https://api.bible): 사용자가 받은 API 키로 영어·한국어 역본 목록을 보고, 고른 역본 전권을 장 단위로 받아 옵니다.
// 약관에 따라 받은 본문은 30일마다 새로 받아야 하고, 저작권 문구를 표시하며, 본문을 보여 줄 때 FUMS 사용 기록을 보냅니다.
import { USFM_CODES } from '../data/bible-books.js';
import { normalizeLine } from './user-content.js';

const API = 'https://api.scripture.api.bible/v1';
const FUMS = 'https://fums.api.bible/f3';
export const LANGUAGES = Object.freeze(['eng', 'kor']); // only English and Korean Bibles are offered
export const REFRESH_DAYS = 30;
const REQUEST_GAP_MS = 120; // stay well under the API rate limit

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function get(path, key, fetchImpl = fetch) {
  const response = await fetchImpl(`${API}${path}`, { headers: { 'api-key': key } });
  if (response.status === 401 || response.status === 403) throw new Error('api-key');
  if (!response.ok) throw new Error(`api-${response.status}`);
  return response.json();
}

/** English and Korean Bibles available to this key: [{ id, name, abbreviation, language }]. */
export async function listBibles(key, fetchImpl = fetch) {
  const lists = await Promise.all(LANGUAGES.map((language) => get(`/bibles?language=${language}`, key, fetchImpl)));
  return lists.flatMap((list) => list.data ?? []).map((b) => ({
    id: b.id,
    name: b.nameLocal || b.name,
    abbreviation: b.abbreviationLocal || b.abbreviation || '',
    language: b.language?.id === 'kor' ? 'ko' : 'en',
  }));
}

/** "[1] In the beginning … [2] And the earth …" → ['In the beginning …', 'And the earth …'] (by verse number). */
export function chapterVerses(content) {
  const verses = [];
  const parts = String(content).split(/\[(\d+)\]/);
  for (let i = 1; i < parts.length; i += 2) {
    const text = normalizeLine(parts[i + 1] ?? '').text;
    if (text) verses[Number(parts[i]) - 1] = text;
  }
  return Array.from(verses, (v) => v ?? '');
}

const CHAPTER_QUERY = 'content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false';

/**
 * Download a whole Bible. onProgress(done, total) is called after each chapter.
 * Returns { name, books, copyright, fums, source: { site, bibleId, fetchedAt } } in the same shape as an uploaded Bible.
 */
export async function downloadBible(key, bible, onProgress = () => {}, fetchImpl = fetch) {
  const [info, bookList] = await Promise.all([
    get(`/bibles/${bible.id}`, key, fetchImpl),
    get(`/bibles/${bible.id}/books?include-chapters=true`, key, fetchImpl),
  ]);
  const books = Array.from({ length: 66 }, () => []);
  const fums = {};
  const chapters = (bookList.data ?? []).flatMap((book) => {
    const number = USFM_CODES.indexOf(book.id) + 1;
    return number ? (book.chapters ?? []).filter((c) => /^\d+$/.test(String(c.number))).map((c) => ({ number, chapter: Number(c.number), id: c.id })) : [];
  });
  for (const [i, c] of chapters.entries()) {
    const result = await get(`/bibles/${bible.id}/chapters/${c.id}?${CHAPTER_QUERY}`, key, fetchImpl);
    books[c.number - 1][c.chapter - 1] = chapterVerses(result.data?.content ?? '');
    if (result.meta?.fumsToken) fums[`${c.number}|${c.chapter}`] = result.meta.fumsToken;
    onProgress(i + 1, chapters.length);
    await pause(REQUEST_GAP_MS);
  }
  books.forEach((list) => list.forEach((verses, c) => { if (!verses) list[c] = []; }));
  return {
    name: bible.abbreviation || bible.name,
    books,
    copyright: String(info.data?.copyright ?? '').replace(/<[^>]+>/g, '').trim(),
    fums,
    source: { site: 'API.Bible', bibleId: bible.id, fetchedAt: Date.now() },
  };
}

/** True when a Bible downloaded from API.Bible is older than the 30 days the licence allows. */
export const needsRefresh = (bible, now = Date.now()) =>
  bible?.source?.site === 'API.Bible' && now - bible.source.fetchedAt > REFRESH_DAYS * 86_400_000;

const deviceId = (() => {
  let id = null;
  return () => {
    try {
      id ??= localStorage.getItem('tw.fumsDevice') ?? `d${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem('tw.fumsDevice', id);
    } catch (error) {
      console.warn('Could not keep the FUMS device id.', error);
      id ??= 'device';
    }
    return id;
  };
})();
const SESSION_ID = `s${Date.now().toString(36)}`;

/** Report that a chapter from API.Bible was shown (Fair Use Management System, required by the licence). */
export function reportView(bible, book, chapter) {
  const token = bible?.fums?.[`${book}|${chapter}`];
  if (!token) return;
  fetch(`${FUMS}?t=${encodeURIComponent(token)}&dId=${deviceId()}&sId=${SESSION_ID}`, { mode: 'no-cors' })
    .catch((error) => console.warn('Could not report the FUMS view.', error));
}

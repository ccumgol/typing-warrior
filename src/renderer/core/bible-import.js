// 성경 전권 파일 읽기: CSV, XML(Zefania · OSIS · OpenSong · Beblia), TXT("창 1:1 본문")를 한 번에 해석합니다.
// 결과는 verses: Map('책|장|절' → 본문)이며, 화면 없이 동작하는 순수 함수라 테스트할 수 있습니다.
import { normalizeLine } from './user-content.js';
import { bookNumber } from '../data/bible-books.js';

export const MAX_BIBLE_CHARS = 30_000_000; // a whole Bible is 2-5 million characters

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (text) => text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, code) => {
  if (code[0] === '#') return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1)));
  return ENTITIES[code.toLowerCase()] ?? m;
});

const baseName = (fileName) => fileName.replace(/\.[^.]+$/, '').trim() || 'Bible';
const detectLang = (verses) => (/[가-힣]/.test([...verses.values()].slice(0, 50).join(' ')) ? 'ko' : 'en');
const asBook = (value) => (/^\d+$/.test(String(value).trim()) ? Number(value) : bookNumber(String(value).trim()));

function addVerse(state, book, chapter, verse, raw) {
  const number = asBook(book);
  if (!number || number > 66 || !(chapter > 0) || !(verse > 0)) {
    state.skipped += 1;
    return;
  }
  const text = normalizeLine(decode(raw.replace(/<[^>]+>/g, ' '))).text;
  if (text) state.verses.set(`${number}|${chapter}|${verse}`, text);
}

// ---------------------------------------------------------------- TXT: "창 1:1 태초에 …"

function parseTxt(content, state) {
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    const header = line.match(/^#\s*(번역|translation)\s*[:：]?\s*(.+)$/i);
    if (header) state.name = header[2].trim();
    const m = line.match(/^(.+?)\s*(\d+)\s*:\s*(\d+)\s+(.+)$/);
    if (m && !line.startsWith('#')) addVerse(state, m[1], Number(m[2]), Number(m[3]), m[4]);
  }
}

// ---------------------------------------------------------------- CSV

/** Split CSV text into rows, honouring quoted fields ("a, b" and "" escapes). */
export function csvRows(content) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i];
    if (quoted) {
      if (ch === '"' && content[i + 1] === '"') { field += '"'; i += 1; } else if (ch === '"') quoted = false; else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',' || ch === '\t') { row.push(field); field = ''; } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && content[i + 1] === '\n') i += 1;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim()));
}

const COLUMN_NAMES = {
  book: ['book', 'b', '책', '권', 'book_name', 'bookname', 'book_number'],
  chapter: ['chapter', 'c', '장', 'ch'],
  verse: ['verse', 'v', '절', 'vs'],
  text: ['text', 't', '본문', '내용', 'content', 'scripture'],
};

function csvColumns(header) {
  const names = header.map((h) => h.trim().toLowerCase());
  const find = (key) => names.findIndex((n) => COLUMN_NAMES[key].includes(n));
  const columns = { book: find('book'), chapter: find('chapter'), verse: find('verse'), text: find('text') };
  return Object.values(columns).every((i) => i >= 0) ? columns : null;
}

/** A header row we recognise, or a row whose chapter and verse columns are numbers. */
function looksLikeCsv(line) {
  const row = csvRows(line)[0] ?? [];
  const numeric = (i) => /^\d+$/.test((row[i] ?? '').trim());
  return Boolean(csvColumns(row)) || (row.length >= 4 && numeric(1) && numeric(2)) || (row.length >= 5 && numeric(0) && numeric(2) && numeric(3));
}

function parseCsv(content, state) {
  const rows = csvRows(content);
  if (rows.length === 0) return;
  let columns = csvColumns(rows[0]);
  let body = rows.slice(1);
  if (!columns) {
    // No header: book, chapter, verse, text — or an id column first (e.g. 01001001, 1, 1, 1, text)
    body = rows;
    columns = /^\d{7,8}$/.test(rows[0][0]?.trim()) && rows[0].length >= 5 ? { book: 1, chapter: 2, verse: 3, text: 4 } : { book: 0, chapter: 1, verse: 2, text: 3 };
  }
  for (const row of body) {
    const text = row.slice(columns.text).join(',');
    addVerse(state, row[columns.book] ?? '', Number(row[columns.chapter]), Number(row[columns.verse]), text);
  }
}

// ---------------------------------------------------------------- XML

/** Attribute value; `names` may list alternatives, e.g. 'biblename|translation'. */
const attr = (attrs, names) => attrs.match(new RegExp(`\\b(?:${names})\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1];

function parseXml(content, state) {
  const xml = content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(note|rf|notes)\b[^>]*>[\s\S]*?<\/\1>/gi, ''); // footnotes and study notes are not typed
  state.name = attr(xml.match(/<(?:XMLBIBLE|bible)\b([^>]*)>/i)?.[1] ?? '', 'biblename|translation|name') ||
    decode(xml.match(/<title>([^<]{1,80})<\/title>/i)?.[1] ?? '').trim() || state.name;
  let book = null;
  let chapter = null;
  let open = null; // { book, chapter, verse, start } of the verse being read
  const tag = /<(\/?)([\w:]+)([^>]*?)(\/?)>/g;
  let m;
  while ((m = tag.exec(xml))) {
    const [whole, closing, rawName, attrs, selfClosing] = m;
    const name = rawName.toLowerCase().replace(/^.*:/, '');
    if (!closing && (name === 'biblebook' || name === 'b' || name === 'book')) {
      book = attr(attrs, 'bnumber') || attr(attrs, 'number') || attr(attrs, 'bname') || attr(attrs, 'n') || attr(attrs, 'osisID');
    } else if (!closing && (name === 'chapter' || name === 'c')) {
      chapter = Number((attr(attrs, 'cnumber') || attr(attrs, 'number') || attr(attrs, 'n') || attr(attrs, 'osisID') || '').split('.').pop());
    } else if (name === 'vers' || name === 'verse' || name === 'v') {
      if (closing || attr(attrs, 'eID')) {
        if (open) addVerse(state, open.book, open.chapter, open.verse, xml.slice(open.start, m.index));
        open = null;
        continue;
      }
      if (open) addVerse(state, open.book, open.chapter, open.verse, xml.slice(open.start, m.index)); // unclosed milestone
      const osis = attr(attrs, 'osisID') || attr(attrs, 'sID');
      const ref = osis ? osis.split(' ')[0].split('.') : null; // OSIS: Gen.1.1
      open = ref && ref.length === 3
        ? { book: ref[0], chapter: Number(ref[1]), verse: Number(ref[2]), start: m.index + whole.length }
        : { book, chapter, verse: Number(attr(attrs, 'vnumber') || attr(attrs, 'number') || attr(attrs, 'n')), start: m.index + whole.length };
      if (selfClosing && !attr(attrs, 'sID')) open = null;
    }
  }
}

/**
 * Read a whole-Bible file. Returns { name, lang, verses: Map('book|chapter|verse' → text), format, skipped }.
 * Throws 'too-large' or 'no-verses'.
 */
export function parseBibleContent(content, fileName) {
  if (content.length > MAX_BIBLE_CHARS) throw new Error('too-large');
  const text = content.replace(/^﻿/, '');
  const state = { name: baseName(fileName), verses: new Map(), skipped: 0 };
  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) ?? '';
  const format = /\.xml$/i.test(fileName) || firstLine.trim().startsWith('<') ? 'xml'
    : /\.(csv|tsv)$/i.test(fileName) || looksLikeCsv(firstLine) ? 'csv' : 'txt';
  if (format === 'xml') parseXml(text, state);
  else if (format === 'csv') parseCsv(text, state);
  else parseTxt(text, state);
  if (state.verses.size === 0) throw new Error('no-verses');
  return { name: state.name, lang: detectLang(state.verses), verses: state.verses, format, skipped: state.skipped };
}

/** Map of verses → books[book-1][chapter-1][verse-1] (missing verses stay empty strings). */
export function versesToBooks(verses) {
  const books = Array.from({ length: 66 }, () => []);
  for (const [key, text] of verses) {
    const [book, chapter, verse] = key.split('|').map(Number);
    const chapters = books[book - 1];
    while (chapters.length < chapter) chapters.push([]);
    const list = chapters[chapter - 1];
    while (list.length < verse) list.push('');
    list[verse - 1] = text;
  }
  return books;
}

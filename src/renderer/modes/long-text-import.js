// 긴 글: 내 텍스트 파일과 내 성경 전권 파일(CSV · XML · TXT)을 불러오는 도구 (파일 고르기 → 해석 → 이 컴퓨터에 저장).
import { parseTextFile, addUserText } from '../core/user-content.js';
import { parseBibleContent, versesToBooks } from '../core/bible-import.js';
import { saveUserBible } from '../core/bible-store.js';
import { countVerses } from '../core/bible-source.js';
import { t } from '../core/i18n.js';
import { el } from '../ui/dom.js';

const ERRORS = { 'too-large': 'long.errTooLarge', empty: 'long.errEmpty', 'no-verses': 'long.errNoVerses' };

/**
 * @param {object} ctx  app context (toast)
 * @param {{ onTextAdded: (work: object) => void, onBibleChanged: (lang: string) => void }} handlers
 */
export function createImportTools(ctx, { onTextAdded, onBibleChanged }) {
  let kind = 'text';
  const input = el('input', { type: 'file', hidden: true, onchange: () => readChosenFile() });

  function choose(nextKind) {
    kind = nextKind;
    input.accept = kind === 'text' ? '.txt,text/plain' : '.csv,.tsv,.xml,.txt,text/plain,text/csv,application/xml,text/xml';
    input.value = ''; // allow choosing the same file again
    input.click();
  }

  async function readChosenFile() {
    const file = input.files?.[0];
    if (!file) return;
    let content;
    try {
      content = await file.text();
    } catch (error) {
      console.warn('Could not read the chosen file.', error);
      ctx.toast(t('long.errRead'));
      return;
    }
    try {
      if (kind === 'text') importText(content, file.name);
      else await importBible(content, file.name);
    } catch (error) {
      ctx.toast(t(ERRORS[error.message] || 'long.errRead'));
    }
  }

  function importText(content, fileName) {
    const work = parseTextFile(content, fileName);
    const saved = addUserText(work);
    if (!saved) {
      ctx.toast(t('long.errSave'));
      return;
    }
    ctx.toast(t('long.imported', { title: work.title, count: work.pieces.length }));
    if (work.dropped > 0) ctx.toast(t('long.dropped', { count: work.dropped }));
    onTextAdded(saved[saved.length - 1]);
  }

  async function importBible(content, fileName) {
    const parsed = parseBibleContent(content, fileName);
    const books = versesToBooks(parsed.verses);
    if (!(await saveUserBible(parsed.lang, { name: parsed.name, books }))) {
      ctx.toast(t('long.errSave'));
      return;
    }
    ctx.toast(t('long.bibleImported', {
      name: parsed.name,
      books: books.filter((chapters) => chapters.length > 0).length,
      verses: countVerses(books).toLocaleString(),
    }));
    onBibleChanged(parsed.lang);
  }

  return { input, chooseText: () => choose('text'), chooseBible: () => choose('bible') };
}

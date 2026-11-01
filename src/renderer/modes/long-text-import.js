// 긴 글: 내 텍스트 파일과 내 성경 본문 파일을 불러오는 도구 (파일 고르기 → 해석 → 이 컴퓨터에 저장).
import { BIBLE_VERSES } from '../data/bible.js';
import { parseTextFile, parseBibleFile, buildBibleOverride, addUserText, saveUserBible } from '../core/user-content.js';
import { t } from '../core/i18n.js';
import { el } from '../ui/dom.js';

const ERRORS = { 'too-large': 'long.errTooLarge', empty: 'long.errEmpty', 'no-verses': 'long.errNoVerses' };
const MEMORY_REFS = BIBLE_VERSES.map((v) => v.source);

/**
 * @param {object} ctx  app context (toast)
 * @param {{ onTextAdded: (work: object) => void, onBibleChanged: (lang: string) => void }} handlers
 */
export function createImportTools(ctx, { onTextAdded, onBibleChanged }) {
  let kind = 'text';
  const input = el('input', { type: 'file', accept: '.txt,text/plain', hidden: true, onchange: () => readChosenFile() });

  function choose(nextKind) {
    kind = nextKind;
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
      else importBible(content, file.name);
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

  function importBible(content, fileName) {
    const override = buildBibleOverride(parseBibleFile(content, fileName), MEMORY_REFS);
    if (!saveUserBible(override)) {
      ctx.toast(t('long.errSave'));
      return;
    }
    ctx.toast(t('long.bibleImported', {
      name: override.name,
      verses: Object.keys(override.verses).length,
      psalms: t(override.psalms ? 'long.psalmsAll' : 'long.psalmsNone'),
    }));
    onBibleChanged(override.lang);
  }

  return { input, chooseText: () => choose('text'), chooseBible: () => choose('bible') };
}

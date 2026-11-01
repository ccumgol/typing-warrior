// 긴 글 연습: 성경 전권(책 → 장)과 시집, 내가 불러온 글을 한 줄(절)씩 이어서 칩니다.
// 작품마다 어디까지 쳤는지 저장해 다음에 이어서 합니다. 연습 언어(한/EN)에 맞는 작품만 보여 줍니다.
import { applyKey, createTarget, typedText, detectLang } from '../core/typing-input.js';
import { el, pills } from '../ui/dom.js';
import { renderTypingLine } from '../ui/typing-line.js';
import { sounds } from '../core/sound.js';
import { t, getUiLang } from '../core/i18n.js';
import { bookName } from '../data/bible-books.js';
import { createSession, statusFrom, finishSession } from './session.js';
import { createImportTools } from './long-text-import.js';
import { buildTexts, migrateOldPsalms, PSALMS_BOOK } from './long-text-works.js';
import { removeUserText } from '../core/user-content.js';
import { getBible } from '../core/bible-source.js';
import { clearUserBible } from '../core/bible-store.js';
import { REPO_URL } from '../version.js';

const SAMPLES_URL = `${REPO_URL}/blob/main/docs/samples`;
const SAMPLES = { text: ['my-text-example.txt'], bible: ['bible-example.csv', 'bible-example-zefania.xml', 'bible-example.txt'] };

export function createLongTextMode(ctx) {
  const session = createSession();
  let alive = true;
  let bibles = null; // { ko, en } once loaded
  let texts = [];
  let text = null;
  let showHelp = false;
  let piece = 1; // 1-based piece number (chapter, sonnet, poem)
  let line = 0; // index of the line (verse) being typed
  let typed = [];
  let target = null;
  let lang = 'ko';

  const textsFor = (language) => texts.filter((item) => item.lang === language);
  /** The last text practiced if it matches the practice language, otherwise the first text in that language. */
  const pickText = (id, language) => textsFor(language).find((item) => item.id === id) || textsFor(language)[0];

  const toolbar = el('div', { class: 'mode-toolbar' });
  const actions = el('div', { class: 'mode-toolbar long-actions' });
  const help = el('div', { class: 'long-help', hidden: true });
  const tools = createImportTools(ctx, {
    onTextAdded(work) {
      texts = buildTexts(bibles);
      if (work.lang === text.lang) switchText(work.id);
      else ctx.toast(t(work.lang === 'en' ? 'long.seeInEn' : 'long.seeInKo', { title: work.title }));
    },
    onBibleChanged: refreshBible,
  });
  const title = el('h2', { class: 'long-title' }, t('long.loading'));
  const previous = el('div', { class: 'long-context' });
  const current = el('div', { class: 'sentence-target' });
  const input = el('div', { class: 'typed-box sentence-typed' });
  const upcoming = el('div', { class: 'long-context' });
  ctx.root.replaceChildren(
    el('section', { class: 'mode sentences long-text' }, toolbar, actions, tools.input,
      el('div', { class: 'practice-area' }, help, title, previous, current, input, upcoming, el('div', { class: 'practice-desc' }, t('long.desc')))),
  );

  const pieces = () => text.pieces;
  const lines = () => pieces()[piece - 1].lines;
  const doneId = (number) => `${text.id}-${number}`;
  const pieceName = (number = piece) => text.pieceLabel(number, pieces()[number - 1]);

  async function init() {
    const [ko, en] = await Promise.all([getBible('ko'), getBible('en')]);
    if (!alive) return;
    bibles = { ko, en };
    texts = buildTexts(bibles);
    const patch = migrateOldPsalms(ctx.settings(), texts);
    if (patch) ctx.updateSettings(patch);
    text = pickText(ctx.settings().longTextId, ctx.settings().lang);
    resume();
  }

  function saveProgress() {
    const progress = { ...ctx.settings().longTextProgress, [text.id]: { chapter: piece, verse: line } };
    ctx.updateSettings({ longTextProgress: progress, longTextId: text.id });
  }

  /** Pick up where this text was left off. */
  function resume() {
    const saved = ctx.settings().longTextProgress[text.id];
    piece = Math.min(saved?.chapter || 1, pieces().length);
    line = Math.min(saved?.verse || 0, lines().length - 1);
    session.reset();
    load();
  }

  function switchText(id) {
    if (id === text.id) return;
    text = texts.find((item) => item.id === id);
    ctx.updateSettings({ longTextId: text.id });
    resume();
  }

  /** The user's Bible was added or cleared: reload it and reopen the Bible if it is showing. */
  async function refreshBible(language) {
    bibles = { ...bibles, [language]: await getBible(language) };
    if (!alive) return;
    texts = buildTexts(bibles);
    text = texts.find((item) => item.id === text.id) || textsFor(text.lang)[0];
    if (text.bible) resume();
    else renderToolbar();
  }

  async function resetBible() {
    await clearUserBible(text.lang);
    ctx.toast(t('long.bibleReset'));
    refreshBible(text.lang);
  }

  function removeText() {
    if (!window.confirm(t('long.confirmRemove', { title: text.label().replace(/^📄 /, '') }))) return;
    removeUserText(text.id);
    texts = buildTexts(bibles);
    text = textsFor(text.lang)[0];
    ctx.updateSettings({ longTextId: text.id });
    resume();
  }

  const helpCard = (key, files) => el('div', { class: 'long-help-card' },
    el('pre', {}, t(key)),
    el('p', { class: 'about-links' }, `${t('long.samples')}: `, files.map((file) => el('a', { href: `${SAMPLES_URL}/${file}`, target: '_blank', rel: 'noopener noreferrer' }, file))),
  );

  function toggleHelp() {
    showHelp = !showHelp;
    help.hidden = !showHelp;
    help.replaceChildren(helpCard('long.helpText', SAMPLES.text), helpCard('long.helpBible', SAMPLES.bible));
    renderToolbar();
  }

  function openPiece(next) {
    piece = ((next - 1 + pieces().length) % pieces().length) + 1;
    line = 0;
    session.reset();
    saveProgress();
    load();
  }

  function load() {
    typed = [];
    target = createTarget(lines()[line] ?? '');
    lang = detectLang(target.text);
    ctx.setKeyboardLang(lang);
    render();
  }

  const select = (tip, options, onPick) =>
    el('select', { class: 'long-picker', title: tip, tabindex: '-1', onchange: (e) => { e.target.blur(); onPick(Number(e.target.value)); } }, options);

  /** Bible: a book list and a chapter list. Other works: one list of pieces. */
  function pickers(done) {
    const mark = (i) => (done.has(doneId(i)) ? '✓ ' : '');
    if (!text.bible) {
      return [select(t('long.pick'), pieces().map((p, i) => el('option', { value: i + 1, selected: i + 1 === piece }, `${mark(i + 1)}${text.pieceLabel(i + 1, p)}`)), openPiece)];
    }
    const { book } = pieces()[piece - 1];
    const start = text.bookStart[book - 1];
    const chapterCount = (text.bookStart[book] ?? pieces().length + 1) - start;
    const books = text.bookStart.map((first, b) => el('option', { value: first, selected: b + 1 === book }, bookName(b + 1, getUiLang())));
    const chapters = Array.from({ length: chapterCount }, (_, c) => el('option', { value: start + c, selected: start + c === piece }, `${mark(start + c)}${t(book === PSALMS_BOOK ? 'long.psalmOnly' : 'long.chapterOnly', { chapter: c + 1 })}`));
    return [select(t('long.pickBook'), books, openPiece), select(t('long.pick'), chapters, openPiece)];
  }

  function renderToolbar() {
    const done = new Set(ctx.settings().completedStages);
    const doneCount = pieces().filter((_, i) => done.has(doneId(i + 1))).length;
    const step = (label, tip, delta) => el('button', { class: 'pill', type: 'button', tabindex: '-1', title: tip, onclick: () => openPiece(piece + delta) }, label);
    toolbar.replaceChildren(
      pills(textsFor(text.lang).map((item) => ({ value: item.id, label: item.label() })), text.id, switchText),
      el('div', { class: 'level-stepper' }, step('◀', t('long.prev'), -1), ...pickers(done), step('▶', t('long.nextBtn'), 1)),
      el('span', { class: 'practice-desc' }, t(text.bible ? 'long.completedChapters' : 'long.completed', { count: doneCount, total: pieces().length })),
    );
    const button = (label, onClick, active = false) => el('button', { class: `pill${active ? ' active' : ''}`, type: 'button', tabindex: '-1', onclick: onClick }, label);
    const customBible = textsFor(text.lang).some((item) => item.bible && item.customBible);
    actions.replaceChildren(...[
      button(t('long.importText'), tools.chooseText),
      button(t('long.importBible'), tools.chooseBible),
      customBible && button(t('long.resetBible'), resetBible),
      text.user && button(t('long.removeText'), removeText),
      button(t('long.formatHelp'), toggleHelp, showHelp),
    ].filter(Boolean)); // replaceChildren would print a skipped button as the text "null"
  }

  const contextLine = (index) => {
    const value = lines()[index];
    if (value === undefined) return '';
    return text.numbered ? `${index + 1}  ${value}` : value;
  };

  function render() {
    renderToolbar();
    title.textContent = pieceName();
    previous.textContent = line > 0 ? contextLine(line - 1) : '';
    upcoming.textContent = contextLine(line + 1);
    renderTyping();
  }

  function renderTyping() {
    current.replaceChildren(renderTypingLine(target.text, typed));
    input.textContent = typedText(typed);
    input.classList.toggle('empty', typed.length === 0);
    ctx.keyboard.highlight(target.nextKey(typed));
    tick();
  }

  const tick = () => {
    if (text) ctx.status(statusFrom(session.snapshot(), t('long.progress', { piece: pieceName(), line: line + 1, total: lines().length })));
  };

  function finishPiece() {
    const finished = piece;
    const finishedName = pieceName(finished);
    ctx.markStageDone(doneId(finished));
    line = 0;
    piece = (finished % pieces().length) + 1;
    saveProgress(); // next time, continue with the next piece
    finishSession({
      mode: `longtext-${text.id}`,
      label: `${text.label()} · ${finishedName}`,
      title: t('long.done', { piece: finishedName }),
      snap: session.snapshot(),
      actions: [
        { label: t('long.next', { piece: pieceName() }), primary: true, onClick: () => openPiece(piece) },
        { label: t('action.retry'), onClick: () => openPiece(finished) },
      ],
    });
  }

  function submit() {
    if (typed.length === 0) return;
    for (let i = typed.length; i < target.tokens.length; i += 1) session.stroke(false);
    if (typedText(typed) !== target.text) sounds.typo();
    else sounds.done();
    session.item();
    if (line + 1 >= lines().length) return finishPiece();
    line += 1;
    saveProgress();
    return load();
  }

  function onKeyDown(event) {
    if (!text) return false; // still loading
    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      submit();
      return true;
    }
    const result = applyKey(typed, event, lang);
    if (!result) return false;
    if (result.added !== null) {
      const ok = target.isCorrectAt(typed.length, result.added);
      session.stroke(ok);
      ctx.keyboard.flash(event.code, ok);
      if (!ok) sounds.typo();
    }
    typed = result.tokens;
    renderTyping();
    return true;
  }

  init().catch((error) => {
    console.error('Could not load the long texts.', error);
    title.textContent = t('long.errRead');
  });
  return {
    onKeyDown,
    onLangChange(nextLang) {
      if (text && text.lang !== nextLang) switchText(pickText(ctx.settings().longTextId, nextLang).id);
    },
    tick,
    destroy() {
      alive = false;
    },
  };
}

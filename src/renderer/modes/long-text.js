// 긴 글 연습: 시편과 시집을 한 편씩, 한 줄(절)씩 이어서 칩니다. 작품마다 어디까지 쳤는지 저장해 다음에 이어서 합니다.
// 연습 언어(한/EN)에 맞는 작품만 보여 줍니다.
import { PSALMS as KO_PSALMS, PSALMS_TRANSLATION as KO_TRANSLATION } from '../data/psalms.js';
import { PSALMS as KJV_PSALMS, PSALMS_TRANSLATION as KJV_TRANSLATION } from '../data/psalms-kjv.js';
import { WORKS as KO_POETRY } from '../data/poetry-ko.js';
import { WORKS as EN_POETRY } from '../data/poetry-en.js';
import { applyKey, createTarget, typedText, detectLang } from '../core/typing-input.js';
import { el, pills } from '../ui/dom.js';
import { renderTypingLine } from '../ui/typing-line.js';
import { sounds } from '../core/sound.js';
import { t, loc } from '../core/i18n.js';
import { createSession, statusFrom, finishSession } from './session.js';

const psalms = (id, lang, chapters, translation) => ({
  id, lang, numbered: true,
  pieces: chapters.map((c) => ({ title: null, lines: c.verses })),
  label: () => t('long.psalms', { translation }),
  pieceLabel: (n) => t('long.chapter', { chapter: n }),
});

const poetry = (work) => ({
  id: work.id, lang: work.lang, numbered: false, pieces: work.pieces,
  label: () => `📖 ${loc(work.title)}`,
  pieceLabel: (n, piece) => (piece.title ? `${n}. ${piece.title}` : t('long.sonnet', { n })),
});

const TEXTS = Object.freeze([
  psalms('psalms', 'ko', KO_PSALMS, KO_TRANSLATION),
  ...KO_POETRY.map(poetry),
  psalms('psalms-kjv', 'en', KJV_PSALMS, KJV_TRANSLATION),
  ...EN_POETRY.map(poetry),
]);
const textsFor = (lang) => TEXTS.filter((text) => text.lang === lang);
/** The last text practiced if it matches the practice language, otherwise the first text in that language. */
const pickText = (id, lang) => textsFor(lang).find((text) => text.id === id) || textsFor(lang)[0];

export function createLongTextMode(ctx) {
  const session = createSession();
  let text = pickText(ctx.settings().longTextId, ctx.settings().lang);
  let piece = 1; // 1-based piece number (psalm, sonnet, poem)
  let line = 0; // index of the line (verse) being typed
  let typed = [];
  let target = null;
  let lang = 'ko';

  const toolbar = el('div', { class: 'mode-toolbar' });
  const title = el('h2', { class: 'long-title' });
  const previous = el('div', { class: 'long-context' });
  const current = el('div', { class: 'sentence-target' });
  const input = el('div', { class: 'typed-box sentence-typed' });
  const upcoming = el('div', { class: 'long-context' });
  ctx.root.replaceChildren(
    el('section', { class: 'mode sentences long-text' }, toolbar,
      el('div', { class: 'practice-area' }, title, previous, current, input, upcoming, el('div', { class: 'practice-desc' }, t('long.desc')))),
  );

  const pieces = () => text.pieces;
  const lines = () => pieces()[piece - 1].lines;
  const doneId = (number) => `${text.id}-${number}`;
  const pieceName = (number = piece) => text.pieceLabel(number, pieces()[number - 1]);

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
    text = TEXTS.find((item) => item.id === id);
    ctx.updateSettings({ longTextId: text.id });
    resume();
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
    target = createTarget(lines()[line]);
    lang = detectLang(target.text);
    ctx.setKeyboardLang(lang);
    render();
  }

  function renderToolbar() {
    const done = ctx.settings().completedStages;
    const doneCount = pieces().filter((_, i) => done.includes(doneId(i + 1))).length;
    const picker = el('select', { class: 'long-picker', title: t('long.pick'), tabindex: '-1', onchange: (e) => { e.target.blur(); openPiece(Number(e.target.value)); } },
      pieces().map((p, i) => el('option', { value: i + 1, selected: i + 1 === piece }, `${done.includes(doneId(i + 1)) ? '✓ ' : ''}${text.pieceLabel(i + 1, p)}`)));
    const step = (label, tip, delta) => el('button', { class: 'pill', type: 'button', tabindex: '-1', title: tip, onclick: () => openPiece(piece + delta) }, label);
    toolbar.replaceChildren(
      pills(textsFor(text.lang).map((item) => ({ value: item.id, label: item.label() })), text.id, switchText),
      el('div', { class: 'level-stepper' }, step('◀', t('long.prev'), -1), picker, step('▶', t('long.nextBtn'), 1)),
      el('span', { class: 'practice-desc' }, t('long.completed', { count: doneCount, total: pieces().length })),
    );
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

  const tick = () => ctx.status(statusFrom(session.snapshot(), t('long.progress', { piece: pieceName(), line: line + 1, total: lines().length })));

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

  resume();
  return {
    onKeyDown,
    onLangChange(nextLang) {
      if (text.lang !== nextLang) switchText(pickText(ctx.settings().longTextId, nextLang).id);
    },
    tick,
    destroy() {},
  };
}

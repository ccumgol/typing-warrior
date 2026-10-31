// 긴 글 연습: 시편을 한 편씩, 한 절씩 이어서 칩니다. 어디까지 쳤는지 저장해 다음에 이어서 합니다.
import { PSALMS, PSALMS_TRANSLATION } from '../data/psalms.js';
import { applyKey, createTarget, typedText, detectLang } from '../core/typing-input.js';
import { el } from '../ui/dom.js';
import { renderTypingLine } from '../ui/typing-line.js';
import { sounds } from '../core/sound.js';
import { t } from '../core/i18n.js';
import { createSession, statusFrom, finishSession } from './session.js';

const TEXT_ID = 'psalms';
const doneId = (chapter) => `${TEXT_ID}-${chapter}`;

export function createLongTextMode(ctx) {
  const session = createSession();
  const saved = ctx.settings().longTextProgress[TEXT_ID];
  let chapter = saved?.chapter || 1;
  let verse = saved?.verse || 0; // index of the verse being typed
  let typed = [];
  let target = null;
  let lang = 'ko';

  const toolbar = el('div', { class: 'mode-toolbar' });
  const title = el('h2', { class: 'long-title' });
  const previous = el('div', { class: 'long-context' });
  const line = el('div', { class: 'sentence-target' });
  const input = el('div', { class: 'typed-box sentence-typed' });
  const upcoming = el('div', { class: 'long-context' });
  ctx.root.replaceChildren(
    el('section', { class: 'mode sentences long-text' }, toolbar,
      el('div', { class: 'practice-area' }, title, previous, line, input, upcoming, el('div', { class: 'practice-desc' }, t('long.desc')))),
  );

  const verses = () => PSALMS[chapter - 1].verses;

  function saveProgress() {
    const progress = { ...ctx.settings().longTextProgress, [TEXT_ID]: { chapter, verse } };
    ctx.updateSettings({ longTextProgress: progress });
  }

  function openChapter(next, startVerse = 0) {
    chapter = ((next - 1 + PSALMS.length) % PSALMS.length) + 1;
    verse = Math.min(startVerse, verses().length - 1);
    session.reset();
    saveProgress();
    load();
  }

  function load() {
    typed = [];
    target = createTarget(verses()[verse]);
    lang = detectLang(target.text);
    ctx.setKeyboardLang(lang);
    render();
  }

  function renderToolbar() {
    const done = ctx.settings().completedStages;
    const doneCount = PSALMS.filter((p) => done.includes(doneId(p.chapter))).length;
    const picker = el('select', { class: 'long-picker', title: t('long.pick'), tabindex: '-1', onchange: (e) => { e.target.blur(); openChapter(Number(e.target.value)); } },
      PSALMS.map((p) => el('option', { value: p.chapter, selected: p.chapter === chapter }, `${done.includes(doneId(p.chapter)) ? '✓ ' : ''}${t('long.chapter', { chapter: p.chapter })}`)));
    const step = (label, tip, delta) => el('button', { class: 'pill', type: 'button', tabindex: '-1', title: tip, onclick: () => openChapter(chapter + delta) }, label);
    toolbar.replaceChildren(
      el('span', { class: 'pill active' }, t('long.psalms', { translation: PSALMS_TRANSLATION })),
      el('div', { class: 'level-stepper' }, step('◀', t('long.prev'), -1), picker, step('▶', t('long.nextBtn'), 1)),
      el('span', { class: 'practice-desc' }, t('long.completed', { count: doneCount, total: PSALMS.length })),
    );
  }

  function render() {
    renderToolbar();
    title.textContent = t('long.chapter', { chapter });
    previous.textContent = verse > 0 ? `${verse}  ${verses()[verse - 1]}` : '';
    upcoming.textContent = verses()[verse + 1] ? `${verse + 2}  ${verses()[verse + 1]}` : '';
    renderTyping();
  }

  function renderTyping() {
    line.replaceChildren(renderTypingLine(target.text, typed));
    input.textContent = typedText(typed);
    input.classList.toggle('empty', typed.length === 0);
    ctx.keyboard.highlight(target.nextKey(typed));
    tick();
  }

  const tick = () => ctx.status(statusFrom(session.snapshot(), t('long.progress', { chapter, verse: verse + 1, total: verses().length })));

  function finishChapter() {
    const finished = chapter;
    ctx.markStageDone(doneId(finished));
    verse = 0;
    chapter = (finished % PSALMS.length) + 1;
    saveProgress(); // next time, continue with the next psalm
    finishSession({
      mode: `longtext-${TEXT_ID}`,
      label: t('long.chapter', { chapter: finished }),
      title: t('long.done', { chapter: finished }),
      snap: session.snapshot(),
      actions: [
        { label: t('long.next', { chapter }), primary: true, onClick: () => openChapter(chapter) },
        { label: t('action.retry'), onClick: () => openChapter(finished) },
      ],
    });
  }

  function submit() {
    if (typed.length === 0) return;
    for (let i = typed.length; i < target.tokens.length; i += 1) session.stroke(false);
    if (typedText(typed) !== target.text) sounds.typo();
    else sounds.done();
    session.item();
    if (verse + 1 >= verses().length) return finishChapter();
    verse += 1;
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

  load();
  return {
    onKeyDown,
    onLangChange() {}, // language follows the text
    tick,
    destroy() {},
  };
}

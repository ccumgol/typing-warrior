// 단어 연습: 주제별 단어를 Space/Enter로 넘기며 입력합니다.
import { KO_WORD_SETS, EN_WORD_SETS } from '../data/words.js';
import { applyKey, createTarget, typedText } from '../core/typing-input.js';
import { el, pills, shuffle } from '../ui/dom.js';
import { renderTypingLine } from '../ui/typing-line.js';
import { sounds } from '../core/sound.js';
import { t } from '../core/i18n.js';
import { createSession, statusFrom, finishSession } from './session.js';

const WORDS_PER_ROUND = 25;
const ALL = 'all';
const setsFor = (lang) => (lang === 'ko' ? KO_WORD_SETS : EN_WORD_SETS);

function buildQueue(lang, setName) {
  const sets = setsFor(lang);
  const pool = setName === ALL ? Object.values(sets).flat() : sets[setName];
  return shuffle([...new Set(pool)]).slice(0, WORDS_PER_ROUND);
}

export function createWordsMode(ctx) {
  const session = createSession();
  let lang = ctx.settings().lang;
  let setName = ALL;
  let queue = [];
  let index = 0;
  let typed = [];
  let target = null;
  let missed = 0;

  const toolbar = el('div', { class: 'mode-toolbar' });
  const current = el('div', { class: 'word-current' });
  const input = el('div', { class: 'typed-box', 'data-placeholder': t('typed.placeholder') });
  const upcoming = el('div', { class: 'word-upcoming' });
  ctx.root.replaceChildren(
    el('section', { class: 'mode words' }, toolbar, el('div', { class: 'practice-area' }, current, input, upcoming, el('div', { class: 'practice-desc' }, t('words.desc')))),
  );

  function restart(nextSet = setName) {
    setName = nextSet;
    queue = buildQueue(lang, setName);
    index = 0;
    missed = 0;
    typed = [];
    target = createTarget(queue[0]);
    session.reset();
    render();
  }

  function render() {
    const names = [ALL, ...Object.keys(setsFor(lang))];
    toolbar.replaceChildren(pills(names.map((n) => ({ value: n, label: n === ALL ? t('words.all') : t(`wordset.${n}`) })), setName, restart));
    renderWord();
  }

  function renderWord() {
    current.replaceChildren(renderTypingLine(target.text, typed));
    input.textContent = typedText(typed);
    input.classList.toggle('empty', typed.length === 0);
    upcoming.replaceChildren(...queue.slice(index + 1, index + 6).map((w) => el('span', {}, w)));
    ctx.keyboard.highlight(target.nextKey(typed));
    tick();
  }

  const tick = () => ctx.status(statusFrom(session.snapshot(), `${index}/${queue.length}`));

  function submit() {
    if (typed.length === 0) return;
    const ok = typedText(typed) === target.text;
    // Untyped remainder counts as missed strokes.
    for (let i = typed.length; i < target.tokens.length; i += 1) session.stroke(false);
    if (!ok) {
      missed += 1;
      sounds.typo();
    }
    session.item();
    index += 1;
    if (index >= queue.length) return complete();
    typed = [];
    target = createTarget(queue[index]);
    renderWord();
  }

  function complete() {
    const snap = session.snapshot();
    renderWord();
    finishSession({
      mode: `words-${lang}`,
      label: t('words.label', { set: setName === ALL ? t('words.all') : t(`wordset.${setName}`) }),
      title: t('words.done'),
      snap,
      extraStats: [{ label: t('words.correct'), value: `${queue.length - missed}/${queue.length}` }],
      actions: [
        { label: t('words.continue'), primary: true, onClick: () => restart() },
        { label: t('action.close'), onClick: () => restart() },
      ],
    });
  }

  function onKeyDown(event) {
    if (index >= queue.length) return false;
    if (event.code === 'Space' || event.code === 'Enter' || event.code === 'NumpadEnter') {
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
    renderWord();
    return true;
  }

  restart();
  return {
    onKeyDown,
    onLangChange(nextLang) {
      lang = nextLang;
      restart(ALL);
    },
    tick,
    destroy() {},
  };
}

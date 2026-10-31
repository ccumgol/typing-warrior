// 문장 연습: 명언 / 성경 암송 / 영어 문장. Enter로 다음 문장. 연습 언어(한/EN)에 맞는 글만 보여 줍니다.
import { KO_QUOTES, EN_SENTENCES } from '../data/quotes.js';
import { BIBLE_VERSES, BIBLE_TRANSLATION } from '../data/bible.js';
import { EN_BIBLE_VERSES, EN_BIBLE_TRANSLATION, EN_BIBLE_NOTICE } from '../data/bible-en.js';
import { applyKey, createTarget, typedText, detectLang } from '../core/typing-input.js';
import { el, pills, shuffle } from '../ui/dom.js';
import { renderTypingLine } from '../ui/typing-line.js';
import { sounds } from '../core/sound.js';
import { t } from '../core/i18n.js';
import { createSession, statusFrom, finishSession } from './session.js';

const SENTENCES_PER_ROUND = 5;
const SOURCES = Object.freeze({
  quotes: { lang: 'ko', label: () => t('src.quotes'), items: KO_QUOTES },
  bible: { lang: 'ko', label: () => t('src.bible', { translation: BIBLE_TRANSLATION }), items: BIBLE_VERSES },
  english: { lang: 'en', label: () => t('src.english'), items: EN_SENTENCES },
  'bible-en': { lang: 'en', label: () => t('src.bibleEn', { translation: EN_BIBLE_TRANSLATION }), items: EN_BIBLE_VERSES, notice: EN_BIBLE_NOTICE },
});

/** Source ids for a practice language, in toolbar order. */
const sourcesFor = (lang) => Object.keys(SOURCES).filter((id) => SOURCES[id].lang === lang);

export function createSentencesMode(ctx) {
  const session = createSession();
  let source = sourcesFor(ctx.settings().lang)[0];
  let queue = [];
  let index = 0;
  let typed = [];
  let target = null;
  let lang = 'ko';

  const toolbar = el('div', { class: 'mode-toolbar' });
  const sourceLine = el('div', { class: 'sentence-source' });
  const line = el('div', { class: 'sentence-target' });
  const input = el('div', { class: 'typed-box sentence-typed' });
  const next = el('div', { class: 'sentence-next' });
  const notice = el('div', { class: 'bible-notice' }); // copyright notice required for the ESV
  ctx.root.replaceChildren(
    el('section', { class: 'mode sentences' }, toolbar, el('div', { class: 'practice-area' }, sourceLine, line, input, next, el('div', { class: 'practice-desc' }, t('sentences.desc')), notice)),
  );

  function restart(nextSource = source) {
    source = nextSource;
    const items = SOURCES[source].items;
    queue = shuffle(items).slice(0, SENTENCES_PER_ROUND);
    index = 0;
    session.reset();
    load();
  }

  function load() {
    typed = [];
    target = createTarget(queue[index].text);
    lang = detectLang(target.text);
    ctx.setKeyboardLang(lang);
    render();
  }

  function render() {
    const options = sourcesFor(SOURCES[source].lang).map((value) => ({ value, label: SOURCES[value].label() }));
    toolbar.replaceChildren(pills(options, source, restart));
    sourceLine.textContent = `— ${queue[index].source}  (${index + 1}/${queue.length})`;
    notice.textContent = SOURCES[source].notice || '';
    renderTyping();
    const upcoming = queue[index + 1];
    next.textContent = upcoming ? t('sentences.next', { text: upcoming.text }) : '';
  }

  function renderTyping() {
    line.replaceChildren(renderTypingLine(target.text, typed));
    input.textContent = typedText(typed);
    input.classList.toggle('empty', typed.length === 0);
    ctx.keyboard.highlight(target.nextKey(typed));
    tick();
  }

  const tick = () => ctx.status(statusFrom(session.snapshot(), t('sentences.progress', { index, total: queue.length })));

  function submit() {
    if (typed.length === 0) return;
    for (let i = typed.length; i < target.tokens.length; i += 1) session.stroke(false);
    if (typedText(typed) !== target.text) sounds.typo();
    else sounds.done();
    session.item();
    index += 1;
    if (index < queue.length) {
      load();
      return;
    }
    finishSession({
      mode: `sentences-${source}`,
      label: SOURCES[source].label(),
      title: t('sentences.done'),
      snap: session.snapshot(),
      actions: [
        { label: t('sentences.more'), primary: true, onClick: () => restart() },
        { label: t('action.close'), onClick: () => restart() },
      ],
    });
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

  restart();
  return {
    onKeyDown,
    onLangChange(nextLang) {
      if (SOURCES[source].lang !== nextLang) restart(sourcesFor(nextLang)[0]);
    },
    tick,
    destroy() {},
  };
}

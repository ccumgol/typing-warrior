// 문장 연습: 오늘의 말씀 / 명언 / 성경 암송 365 / 영어 문장 (주제별 말씀 메뉴에서 고른 주제도). Enter로 다음 문장. 연습 언어(한/EN)에 맞는 글만 보여 줍니다.
import { KO_QUOTES, EN_SENTENCES } from '../data/quotes.js';
import { BIBLE_VERSES } from '../data/bible.js';
import { VERSE_TOPICS } from '../data/verse-topics.js';
import { applyKey, createTarget, typedText, detectLang } from '../core/typing-input.js';
import { el, pills, shuffle } from '../ui/dom.js';
import { renderTypingLine } from '../ui/typing-line.js';
import { sounds } from '../core/sound.js';
import { t } from '../core/i18n.js';
import { createSession, statusFrom, finishSession } from './session.js';
import { loadMemoryVerses, DEFAULT_NAMES } from '../core/memory-verses.js';
import { verseOfDayIndex } from '../core/verse-of-day.js';

const SENTENCES_PER_ROUND = 5;
const today = (lang) => ({
  lang, ordered: true, label: () => t('src.today'),
  load: async (memory) => {
    const { items } = await memory(lang);
    const start = verseOfDayIndex();
    return Array.from({ length: SENTENCES_PER_ROUND }, (_, k) => items[(start + k) % items.length]);
  },
});

const SOURCES = Object.freeze({
  today: today('ko'),
  quotes: { lang: 'ko', label: () => t('src.quotes'), load: async () => KO_QUOTES },
  bible: { lang: 'ko', label: (name) => t('src.bible', { translation: name('ko') }), load: async (memory) => (await memory('ko')).items },
  'today-en': today('en'),
  english: { lang: 'en', label: () => t('src.english'), load: async () => EN_SENTENCES },
  'bible-en': { lang: 'en', label: (name) => t('src.bibleEn', { translation: name('en') }), load: async (memory) => (await memory('en')).items },
});

/** Source ids for a practice language, in toolbar order. */
const sourcesFor = (lang) => Object.keys(SOURCES).filter((id) => SOURCES[id].lang === lang);

/** Memory verses of one topic (opened from the 말씀 menu). English verses share the Korean references by position. */
const topicSource = (topicId, lang) => {
  const refs = new Set(VERSE_TOPICS.find((topic) => topic.id === topicId)?.refs ?? []);
  return {
    lang, label: () => t('src.topic', { topic: t(`topic.${topicId}`) }),
    load: async (memory) => (await memory(lang)).items.filter((_, i) => refs.has(BIBLE_VERSES[i].source)),
  };
};

export function createSentencesMode(ctx, options = {}) {
  const session = createSession();
  const topic = options.topic ? topicSource(options.topic, ctx.settings().lang) : null;
  const sourceOf = (id) => (id === 'topic' ? topic : SOURCES[id]);
  const listFor = (lang) => [...(topic?.lang === lang ? ['topic'] : []), ...sourcesFor(lang)];
  let source = listFor(ctx.settings().lang)[0];
  let queue = [];
  let index = 0;
  let typed = [];
  let target = null;
  let lang = 'ko';
  let alive = true;
  let request = 0; // ignore a slow load when another source was picked meanwhile
  const memo = {};
  const memory = (language) => (memo[language] ??= loadMemoryVerses(language));
  const loadedNames = {};
  const translationName = (language) => loadedNames[language] ?? DEFAULT_NAMES[language];

  const toolbar = el('div', { class: 'mode-toolbar' });
  const sourceLine = el('div', { class: 'sentence-source' });
  const line = el('div', { class: 'sentence-target' });
  const input = el('div', { class: 'typed-box sentence-typed' });
  const next = el('div', { class: 'sentence-next' });
  ctx.root.replaceChildren(
    el('section', { class: 'mode sentences' }, toolbar, el('div', { class: 'practice-area' }, sourceLine, line, input, next, el('div', { class: 'practice-desc' }, t('sentences.desc')))),
  );

  async function restart(nextSource = source) {
    source = nextSource;
    const mine = ++request;
    const items = await sourceOf(source).load(memory);
    for (const language of ['ko', 'en']) if (memo[language]) loadedNames[language] = (await memo[language]).translation;
    if (!alive || mine !== request) return;
    queue = sourceOf(source).ordered ? items.slice(0, SENTENCES_PER_ROUND) : shuffle(items).slice(0, SENTENCES_PER_ROUND);
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
    const options = listFor(sourceOf(source).lang).map((value) => ({ value, label: sourceOf(value).label(translationName) }));
    toolbar.replaceChildren(pills(options, source, restart));
    sourceLine.textContent = `— ${queue[index].source}  (${index + 1}/${queue.length})`;
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
      label: sourceOf(source).label(translationName),
      title: t('sentences.done'),
      snap: session.snapshot(),
      actions: [
        { label: t('sentences.more'), primary: true, onClick: () => restart() },
        { label: t('action.close'), onClick: () => restart() },
      ],
    });
  }

  function onKeyDown(event) {
    if (!target) return false; // first sentences still loading
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

  restart().catch((error) => console.error('Could not load the sentences.', error));
  return {
    onKeyDown,
    onLangChange(nextLang) {
      if (sourceOf(source).lang !== nextLang) restart(listFor(nextLang)[0]).catch((error) => console.error('Could not load the sentences.', error));
    },
    tick,
    destroy() {
      alive = false;
    },
  };
}

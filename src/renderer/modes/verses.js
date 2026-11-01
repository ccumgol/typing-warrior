// 말씀: 암송 365구절을 주제별 표로 보여 주고, 고른 주제로 바로 연습합니다 (문장 연습으로 이동).
import { BIBLE_VERSES } from '../data/bible.js';
import { VERSE_TOPICS } from '../data/verse-topics.js';
import { loadMemoryVerses } from '../core/memory-verses.js';
import { el, pills } from '../ui/dom.js';
import { t } from '../core/i18n.js';

const ALL = 'all';
const INDEX_OF = new Map(BIBLE_VERSES.map((verse, i) => [verse.source, i]));

export function createVersesMode(ctx) {
  let alive = true;
  let topic = ALL;
  let lang = ctx.settings().lang;
  let memory = null; // { translation, items } for the current practice language

  const toolbar = el('div', { class: 'mode-toolbar' });
  const area = el('div', { class: 'practice-area verses-area' });
  ctx.root.replaceChildren(el('section', { class: 'mode verses' }, toolbar, area));
  ctx.keyboard.highlight(null);
  ctx.status({ cpm: '-', accuracy: '-', time: '-', progress: t('verses.count', { count: BIBLE_VERSES.length }) });

  async function load() {
    const loaded = await loadMemoryVerses(lang);
    if (!alive) return;
    memory = loaded;
    render();
  }

  function renderToolbar() {
    const options = [{ value: ALL, label: t('verses.all') }, ...VERSE_TOPICS.map((tp) => ({ value: tp.id, label: t(`topic.${tp.id}`) }))];
    toolbar.replaceChildren(pills(options, topic, (value) => { topic = value; render(); }));
  }

  const row = (ref) => {
    const verse = memory.items[INDEX_OF.get(ref)];
    return el('tr', {}, el('td', { class: 'verse-ref' }, verse.source), el('td', {}, verse.text));
  };

  function topicBlock(tp) {
    return [
      el('tr', { class: 'verse-topic' }, el('td', { colspan: 2 },
        el('b', {}, `${t(`topic.${tp.id}`)} · ${t('verses.count', { count: tp.refs.length })}`),
        el('button', { class: 'pill', type: 'button', tabindex: '-1', onclick: () => ctx.openMode('sentences', { topic: tp.id }) }, t('verses.practice')),
      )),
      tp.refs.map(row),
    ];
  }

  function render() {
    renderToolbar();
    const topics = topic === ALL ? VERSE_TOPICS : VERSE_TOPICS.filter((tp) => tp.id === topic);
    area.replaceChildren(
      el('h2', { class: 'ref-title' }, t('verses.title', { translation: memory.translation })),
      el('div', { class: 'shortcut-table-wrap' }, el('table', { class: 'shortcut-table verse-table' }, el('tbody', {}, topics.map(topicBlock)))),
    );
  }

  load().catch((error) => console.error('Could not load the memory verses.', error));
  return {
    onKeyDown: () => false,
    onLangChange(nextLang) {
      lang = nextLang;
      load().catch((error) => console.error('Could not load the memory verses.', error));
    },
    tick() {},
    destroy() {
      alive = false;
    },
  };
}

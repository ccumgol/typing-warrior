// 프로그램 소개: 기능, 단축키, 연습 글의 출처와 저작권.
import { ABOUT } from '../data/about.js';
import { WORKS as KO_POETRY } from '../data/poetry-ko.js';
import { WORKS as EN_POETRY } from '../data/poetry-en.js';
import { getUiLang } from '../core/i18n.js';
import { el } from '../ui/dom.js';
import { APP_VERSION } from '../version.js';

const WORKS = [...KO_POETRY, ...EN_POETRY];

/** Fill {count:id} and {modern:id} with numbers from the actual data. */
function fill(text) {
  return text
    .replace(/\{count:([\w-]+)\}/g, (_, id) => String(WORKS.find((w) => w.id === id)?.pieces.length ?? 0))
    .replace(/\{modern:([\w-]+)\}/g, (_, id) => String(WORKS.find((w) => w.id === id)?.pieces.filter((p) => p.kind === 'modern').length ?? 0));
}

const externalLink = ({ label, url }) => el('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, label);

function sourceCard(source) {
  return el('article', { class: 'about-source' },
    el('h4', {}, fill(source.name)),
    el('ul', {}, source.lines.map((line) => el('li', {}, fill(line)))),
    source.links.length ? el('p', { class: 'about-links' }, source.links.map(externalLink)) : null,
  );
}

export function createAboutMode(ctx) {
  const about = ABOUT[getUiLang()] || ABOUT.ko;
  ctx.keyboard.highlight(null);
  ctx.root.replaceChildren(
    el('section', { class: 'mode about' },
      el('h2', {}, about.title),
      about.intro.map((p) => el('p', {}, p)),
      el('dl', { class: 'about-features' }, about.features.map(([name, desc]) => [el('dt', {}, name), el('dd', {}, desc)])),
      el('section', { class: 'about-keys' },
        el('h3', {}, about.shortcutsTitle),
        el('dl', {}, about.shortcuts.map(([keys, desc]) => [
          el('dt', {}, keys.split(' + ').map((k, i) => [i > 0 ? ' + ' : null, el('kbd', {}, k)])),
          el('dd', {}, desc),
        ])),
      ),
      el('h3', {}, about.sourcesTitle),
      el('p', {}, about.sourcesIntro),
      el('div', { class: 'about-sources' }, about.sources.map(sourceCard)),
      el('h3', {}, about.creatorTitle),
      el('div', { class: 'about-creator' },
        el('p', { class: 'about-version' }, `Typing Warrior ${APP_VERSION}`),
        el('dl', {}, about.creator.filter((row) => !(row.donate && window.desktop?.isMacAppStore)).map((row) => [
          el('dt', {}, row.label),
          el('dd', {}, row.text ? `${row.text} ` : null, row.link ? externalLink(row.link) : null),
        ])),
      ),
      el('h3', {}, about.otherTitle),
      el('ul', {}, about.other.map((line) => el('li', {}, line))),
    ),
  );
  ctx.status({ cpm: '-', accuracy: '-', time: '-', progress: '-' });
  return { onKeyDown: () => false, onLangChange() {}, tick() {}, destroy() {} };
}

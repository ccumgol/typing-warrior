// 단축키 연습: 맥/윈도우 기본 단축키를 실제로 눌러 봅니다.
import { SHORTCUTS, comboLabels, matchesCombo } from '../data/shortcuts.js';
import { el, pills, shuffle } from '../ui/dom.js';
import { sounds } from '../core/sound.js';
import { createSession, statusFrom, finishSession } from './session.js';

const MODIFIER_CODES = new Set(['MetaLeft', 'MetaRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'ShiftLeft', 'ShiftRight', 'CapsLock', 'Fn', 'FnLock', 'ContextMenu']);
const PLATFORM_LABEL = { mac: ' macOS', win: ' Windows' };
const HINT_AFTER_MISSES = 2;

const keycaps = (combo, platform) =>
  el('div', { class: 'keycaps' }, comboLabels(combo, platform).map((label, i) => [i > 0 ? el('span', { class: 'plus' }, '+') : null, el('kbd', {}, label)]));

export function createShortcutsMode(ctx) {
  const session = createSession();
  let platform = ctx.settings().shortcutPlatform || ctx.platform;
  let queue = [];
  let index = 0;
  let misses = 0;
  let showReference = false;

  const toolbar = el('div', { class: 'mode-toolbar' });
  const area = el('div', { class: 'practice-area' });
  ctx.root.replaceChildren(el('section', { class: 'mode shortcuts' }, toolbar, area));

  function restart() {
    queue = shuffle(SHORTCUTS.filter((s) => !s.system));
    index = 0;
    misses = 0;
    session.reset();
    render();
  }

  function renderToolbar() {
    toolbar.replaceChildren(
      pills([{ value: 'mac', label: '🍎 macOS' }, { value: 'win', label: '🪟 Windows' }], platform, (value) => {
        platform = value;
        ctx.updateSettings({ shortcutPlatform: value });
        restart();
      }),
      el('button', { class: `pill${showReference ? ' active' : ''}`, type: 'button', tabindex: '-1', onclick: () => { showReference = !showReference; render(); } }, '📋 단축키 표'),
    );
  }

  function renderReference() {
    const rows = SHORTCUTS.map((s) =>
      el('tr', { class: s.system ? 'system' : '' }, el('td', {}, s.category), el('td', {}, s.action), el('td', {}, keycaps(s[platform], platform)), el('td', {}, s.system ? '시스템' : '')),
    );
    return el('div', { class: 'shortcut-table-wrap' }, el('table', { class: 'shortcut-table' }, el('tbody', {}, rows)));
  }

  function render() {
    renderToolbar();
    if (showReference) {
      area.replaceChildren(el('h2', { class: 'ref-title' }, `${PLATFORM_LABEL[platform]} 단축키 모음`), renderReference());
      return;
    }
    const item = queue[index];
    area.replaceChildren(
      el('div', { class: 'shortcut-category' }, `${item.category} · ${index + 1}/${queue.length}`),
      el('div', { class: 'shortcut-action' }, item.action),
      misses >= HINT_AFTER_MISSES ? keycaps(item[platform], platform) : el('div', { class: 'keycaps placeholder' }, '단축키를 눌러 보세요'),
      el('div', { class: 'practice-desc' }, `${PLATFORM_LABEL[platform]} 기준 · ${HINT_AFTER_MISSES}번 틀리면 정답을 보여 드려요`),
    );
    ctx.keyboard.highlight(null);
    tick();
  }

  const tick = () => ctx.status(statusFrom(session.snapshot(), `${index}/${queue.length}`));

  function onKeyDown(event) {
    event.preventDefault();
    if (showReference || MODIFIER_CODES.has(event.code) || event.repeat) return true;
    const item = queue[index];
    const ok = matchesCombo(item[platform], event);
    session.stroke(ok);
    ctx.keyboard.flash(event.code, ok);
    if (!ok) {
      misses += 1;
      sounds.typo();
      area.classList.remove('shake');
      void area.offsetWidth;
      area.classList.add('shake');
      render();
      return true;
    }
    sounds.done();
    session.item();
    misses = 0;
    index += 1;
    if (index < queue.length) {
      render();
      return true;
    }
    finishSession({
      mode: `shortcuts-${platform}`,
      label: `단축키 ·${PLATFORM_LABEL[platform]}`,
      title: '단축키 마스터!',
      snap: session.snapshot(),
      score: Math.round(session.snapshot().accuracy),
      actions: [{ label: '한 번 더', primary: true, onClick: restart }, { label: '닫기', onClick: restart }],
    });
    return true;
  }

  restart();
  return { onKeyDown, onLangChange() {}, tick, destroy() {}, capturesAllKeys: true };
}

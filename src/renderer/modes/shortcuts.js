// 단축키 연습: 맥/윈도우 기본 단축키를 실제로 눌러 봅니다.
import { SHORTCUTS, SHORTCUT_STAGES, comboLabels, comboCodes, matchesCombo } from '../data/shortcuts.js';
import { el, pills, shuffle } from '../ui/dom.js';
import { sounds } from '../core/sound.js';
import { t, loc } from '../core/i18n.js';
import { createSession, statusFrom, finishSession } from './session.js';

const MODIFIER_CODES = new Set(['MetaLeft', 'MetaRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'ShiftLeft', 'ShiftRight', 'CapsLock', 'Fn', 'FnLock', 'ContextMenu']);
const PLATFORM_LABEL = { mac: 'macOS', win: 'Windows' };
const HINT_AFTER_MISSES = 2;
const MIX = 'sc-mix';

const practiceItems = (stageId) => {
  const stage = SHORTCUT_STAGES.find((st) => st.id === stageId);
  return SHORTCUTS.filter((sc) => !sc.system && (!stage || sc.level === stage.level));
};

const keycaps = (combo, platform) =>
  el('div', { class: 'keycaps' }, comboLabels(combo, platform).map((label, i) => [i > 0 ? el('span', { class: 'plus' }, '+') : null, el('kbd', {}, label)]));

export function createShortcutsMode(ctx) {
  const session = createSession();
  let platform = ctx.settings().shortcutPlatform || ctx.platform;
  let stageId = SHORTCUT_STAGES[0].id;
  let queue = [];
  let index = 0;
  let misses = 0;
  let showReference = false;

  const keyboardShown = () => ctx.settings().showKeyboard;

  const toolbar = el('div', { class: 'mode-toolbar' });
  const area = el('div', { class: 'practice-area' });
  ctx.root.replaceChildren(el('section', { class: 'mode shortcuts' }, toolbar, area));

  const currentStage = () => SHORTCUT_STAGES.find((st) => st.id === stageId);
  const stageTitle = () => t(currentStage()?.id || 'sc.mix');

  function restart(nextStageId = stageId) {
    stageId = nextStageId;
    queue = shuffle(practiceItems(stageId));
    index = 0;
    misses = 0;
    session.reset();
    render();
  }

  function renderToolbar() {
    const done = ctx.settings().completedStages;
    toolbar.replaceChildren(
      pills([{ value: 'mac', label: '🍎 macOS' }, { value: 'win', label: '🪟 Windows' }], platform, (value) => {
        platform = value;
        ctx.updateSettings({ shortcutPlatform: value });
        restart();
      }),
      pills(
        [...SHORTCUT_STAGES.map((st) => ({ value: st.id, label: `${done.includes(st.id) ? '✓ ' : ''}${t(st.id)}` })), { value: MIX, label: t('sc.mix') }],
        showReference ? null : stageId,
        (value) => {
          showReference = false;
          restart(value);
        },
      ),
      el('button', { class: `pill${showReference ? ' active' : ''}`, type: 'button', tabindex: '-1', onclick: () => { showReference = !showReference; render(); } }, t('sc.table')),
    );
  }

  function renderReference() {
    const byStage = [...SHORTCUTS].sort((a, b) => (a.system ? 9 : a.level) - (b.system ? 9 : b.level));
    const rows = byStage.map((s) =>
      el('tr', { class: s.system ? 'system' : '' }, el('td', {}, t(`sc.cat.${s.category}`)), el('td', {}, loc(s.action)), el('td', {}, keycaps(s[platform], platform)), el('td', {}, s.system ? t('sc.system') : t('sc.level', { level: s.level }))),
    );
    return el('div', { class: 'shortcut-table-wrap' }, el('table', { class: 'shortcut-table' }, el('tbody', {}, rows)));
  }

  function render() {
    renderToolbar();
    ctx.keyboard.setPlatform(platform);
    if (showReference) {
      ctx.keyboard.highlight(null);
      area.replaceChildren(el('h2', { class: 'ref-title' }, t('sc.tableTitle', { platform: PLATFORM_LABEL[platform] })), renderReference());
      return;
    }
    const item = queue[index];
    const combo = item[platform];
    // Keyboard shown: see the answer and press it. Keyboard hidden (F2): recall it from memory.
    const reveal = keyboardShown() || misses >= HINT_AFTER_MISSES;
    const desc = keyboardShown() ? t('sc.withKeyboard') : t('sc.fromMemory', { count: HINT_AFTER_MISSES });
    area.replaceChildren(
      el('div', { class: 'shortcut-category' }, `${stageTitle()} · ${t(`sc.cat.${item.category}`)} · ${index + 1}/${queue.length}`),
      el('div', { class: 'shortcut-action' }, loc(item.action)),
      reveal ? keycaps(combo, platform) : el('div', { class: 'keycaps placeholder' }, t('sc.placeholder')),
      el('div', { class: 'practice-desc' }, `${currentStage() ? t(`${stageId}.desc`) : t('sc.mixDesc')} · ${t('sc.basis', { platform: PLATFORM_LABEL[platform] })}`),
      el('div', { class: 'practice-desc' }, desc),
    );
    if (keyboardShown()) ctx.keyboard.highlightKeys(comboCodes(combo), comboLabels(combo, platform).join(' + '));
    else ctx.keyboard.highlight(null);
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
    if (stageId !== MIX) ctx.markStageDone(stageId);
    const next = SHORTCUT_STAGES[SHORTCUT_STAGES.findIndex((st) => st.id === stageId) + 1];
    finishSession({
      mode: `shortcuts-${platform}`,
      label: t('sc.label', { platform: PLATFORM_LABEL[platform], stage: stageTitle() }),
      title: stageId === MIX ? t('sc.master') : t('action.done', { title: stageTitle() }),
      snap: session.snapshot(),
      score: Math.round(session.snapshot().accuracy),
      actions: [
        stageId === MIX
          ? { label: t('sc.oneMore'), primary: true, onClick: () => restart() }
          : next
            ? { label: t('action.next', { title: t(next.id) }), primary: true, onClick: () => restart(next.id) }
            : { label: t('sc.mixAgain'), primary: true, onClick: () => restart(MIX) },
        { label: t('action.retry'), onClick: () => restart() },
      ],
    });
    return true;
  }

  function onSettingsChange(next) {
    if (next.showKeyboard !== shownBefore) render();
    shownBefore = next.showKeyboard;
  }

  function destroy() {
    ctx.keyboard.highlight(null);
    ctx.keyboard.setExtended(false);
    ctx.setKeyboardLang(ctx.settings().lang);
    ctx.keyboard.setPlatform(ctx.platform);
  }

  let shownBefore = keyboardShown();
  ctx.keyboard.setExtended(true);
  ctx.setKeyboardLang('shortcut'); // shortcuts are named by English letters
  restart();
  return { onKeyDown, onLangChange() {}, onSettingsChange, tick, destroy, capturesAllKeys: true };
}

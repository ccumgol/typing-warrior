// 단축키 연습: 맥/윈도우 기본 단축키를 실제로 눌러 봅니다.
import { SHORTCUTS, SHORTCUT_STAGES, comboLabels, comboCodes, matchesCombo } from '../data/shortcuts.js';
import { el, pills, shuffle } from '../ui/dom.js';
import { sounds } from '../core/sound.js';
import { createSession, statusFrom, finishSession } from './session.js';

const MODIFIER_CODES = new Set(['MetaLeft', 'MetaRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'ShiftLeft', 'ShiftRight', 'CapsLock', 'Fn', 'FnLock', 'ContextMenu']);
const PLATFORM_LABEL = { mac: ' macOS', win: ' Windows' };
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
  const stageTitle = () => currentStage()?.title || '🔀 전체';

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
        [...SHORTCUT_STAGES.map((st) => ({ value: st.id, label: `${done.includes(st.id) ? '✓ ' : ''}${st.title}` })), { value: MIX, label: '🔀 전체' }],
        showReference ? null : stageId,
        (value) => {
          showReference = false;
          restart(value);
        },
      ),
      el('button', { class: `pill${showReference ? ' active' : ''}`, type: 'button', tabindex: '-1', onclick: () => { showReference = !showReference; render(); } }, '📋 단축키 표'),
    );
  }

  function renderReference() {
    const byStage = [...SHORTCUTS].sort((a, b) => (a.system ? 9 : a.level) - (b.system ? 9 : b.level));
    const rows = byStage.map((s) =>
      el('tr', { class: s.system ? 'system' : '' }, el('td', {}, s.category), el('td', {}, s.action), el('td', {}, keycaps(s[platform], platform)), el('td', {}, s.system ? '시스템' : `${s.level}단계`)),
    );
    return el('div', { class: 'shortcut-table-wrap' }, el('table', { class: 'shortcut-table' }, el('tbody', {}, rows)));
  }

  function render() {
    renderToolbar();
    ctx.keyboard.setPlatform(platform);
    if (showReference) {
      ctx.keyboard.highlight(null);
      area.replaceChildren(el('h2', { class: 'ref-title' }, `${PLATFORM_LABEL[platform]} 단축키 모음`), renderReference());
      return;
    }
    const item = queue[index];
    const combo = item[platform];
    // Keyboard shown: see the answer and press it. Keyboard hidden (F2): recall it from memory.
    const reveal = keyboardShown() || misses >= HINT_AFTER_MISSES;
    const desc = keyboardShown()
      ? '키보드를 보며 눌러 보세요 · F2로 키보드를 감추면 외워서 누르기'
      : `외워서 눌러 보세요 · ${HINT_AFTER_MISSES}번 틀리면 정답을 보여 드려요 · F2로 키보드 보이기`;
    area.replaceChildren(
      el('div', { class: 'shortcut-category' }, `${stageTitle()} · ${item.category} · ${index + 1}/${queue.length}`),
      el('div', { class: 'shortcut-action' }, item.action),
      reveal ? keycaps(combo, platform) : el('div', { class: 'keycaps placeholder' }, '단축키를 눌러 보세요'),
      el('div', { class: 'practice-desc' }, `${currentStage()?.desc || '모든 단계가 섞여 나와요'} ·${PLATFORM_LABEL[platform]} 기준`),
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
      label: `단축키 ·${PLATFORM_LABEL[platform]} · ${stageTitle()}`,
      title: stageId === MIX ? '단축키 마스터!' : `${stageTitle()} 완료!`,
      snap: session.snapshot(),
      score: Math.round(session.snapshot().accuracy),
      actions: [
        stageId === MIX
          ? { label: '한 번 더', primary: true, onClick: () => restart() }
          : next
            ? { label: `다음: ${next.title}`, primary: true, onClick: () => restart(next.id) }
            : { label: '🔀 전체 섞어서 하기', primary: true, onClick: () => restart(MIX) },
        { label: '다시 하기', onClick: () => restart() },
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

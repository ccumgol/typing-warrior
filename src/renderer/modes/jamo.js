// 자리(자소) 연습: 단계별 / 혼합 모드.
import { KO_STAGES, EN_STAGES, ITEMS_PER_STAGE } from '../data/jamo-stages.js';
import { charFromKey, keyForChar } from '../core/keyboard-layout.js';
import { decompose } from '../core/hangul.js';
import { hasCommandModifier } from '../core/typing-input.js';
import { el, pills, pickRandom } from '../ui/dom.js';
import { sounds } from '../core/sound.js';
import { t } from '../core/i18n.js';
import { createSession, statusFrom, finishSession } from './session.js';

const MIX = 'mix';
const stagesFor = (lang) => (lang === 'ko' ? KO_STAGES : EN_STAGES);

function buildQueue(lang, stageId) {
  const stages = stagesFor(lang);
  const pool = stageId === MIX ? stages.flatMap((s) => s.chars) : stages.find((s) => s.id === stageId).chars;
  return Array.from({ length: ITEMS_PER_STAGE }, () => pickRandom(pool));
}

export function createJamoMode(ctx) {
  const session = createSession();
  let lang = ctx.settings().lang;
  let stageId = stagesFor(lang)[0].id;
  let queue = buildQueue(lang, stageId);
  let index = 0;
  let sub = 0; // key-stroke position inside a compound vowel (ㅘ = ㅗ + ㅏ)

  const toolbar = el('div', { class: 'mode-toolbar' });
  const track = el('div', { class: 'jamo-track' });
  const desc = el('div', { class: 'practice-desc' });
  ctx.root.replaceChildren(el('section', { class: 'mode jamo' }, toolbar, el('div', { class: 'practice-area' }, track, desc)));

  const currentStage = () => stagesFor(lang).find((s) => s.id === stageId);
  const titleOf = (stage) => t(`stage.${stage.id}`);

  function restart(nextStageId = stageId) {
    stageId = nextStageId;
    queue = buildQueue(lang, stageId);
    index = 0;
    sub = 0;
    session.reset();
    render();
  }

  function renderToolbar() {
    const done = ctx.settings().completedStages;
    const options = [
      ...stagesFor(lang).map((s) => ({ value: s.id, label: `${done.includes(s.id) ? '✓ ' : ''}${titleOf(s)}` })),
      { value: MIX, label: t('jamo.mix') },
    ];
    toolbar.replaceChildren(pills(options, stageId, (value) => restart(value)));
  }

  function render() {
    renderToolbar();
    const from = Math.max(0, index - 2);
    track.replaceChildren(
      ...queue.slice(from, index + 7).map((ch, i) => {
        const pos = from + i;
        const cls = pos < index ? 'past' : pos === index ? 'current' : 'upcoming';
        const parts = decompose(ch);
        const progress = pos === index && parts.length > 1 ? el('small', { class: 'jamo-sub' }, parts.map((p, k) => (k < sub ? `${p}✓` : p)).join(' + ')) : null;
        return el('div', { class: `jamo-cell ${cls}` }, ch, progress);
      }),
    );
    desc.textContent = t(stageId === MIX ? 'jamo.mixDesc' : `stage.${stageId}.desc`);
    updateGuide();
  }

  function updateGuide() {
    const target = queue[index];
    const token = target ? decompose(target)[sub] : null;
    ctx.keyboard.highlight(token ? keyForChar(token) : null);
    ctx.status(statusFrom(session.snapshot(), `${index}/${queue.length}`));
  }

  function complete() {
    const snap = session.snapshot();
    const stages = stagesFor(lang);
    const position = stages.findIndex((s) => s.id === stageId);
    const next = stageId === MIX ? null : stages[position + 1];
    if (stageId !== MIX) ctx.markStageDone(stageId);
    finishSession({
      mode: `jamo-${lang}`,
      label: stageId === MIX ? t('jamo.mixLabel') : titleOf(currentStage()),
      title: stageId === MIX ? t('jamo.mixDone') : t('action.done', { title: titleOf(currentStage()) }),
      snap,
      actions: [
        next ? { label: t('action.next', { title: titleOf(next) }), primary: true, onClick: () => restart(next.id) } : { label: t('jamo.playMix'), primary: true, onClick: () => restart(MIX) },
        { label: t('action.retry'), onClick: () => restart() },
      ],
    });
  }

  function onKeyDown(event) {
    if (hasCommandModifier(event)) return false;
    const ch = charFromKey(event.code, { shift: event.shiftKey, capsLock: event.getModifierState('CapsLock'), lang });
    if (ch === null || ch === ' ') return event.code === 'Space';
    const expected = decompose(queue[index])[sub];
    const ok = ch === expected;
    session.stroke(ok);
    ctx.keyboard.flash(event.code, ok);
    if (!ok) {
      sounds.typo();
      track.classList.remove('shake');
      void track.offsetWidth;
      track.classList.add('shake');
      updateGuide();
      return true;
    }
    sub += 1;
    if (sub >= decompose(queue[index]).length) {
      sub = 0;
      index += 1;
      session.item();
    }
    render();
    if (index >= queue.length) complete();
    return true;
  }

  render();
  return {
    onKeyDown,
    onLangChange(nextLang) {
      lang = nextLang;
      restart(stagesFor(lang)[0].id);
    },
    tick: () => ctx.status(statusFrom(session.snapshot(), `${index}/${queue.length}`)),
    destroy() {},
  };
}

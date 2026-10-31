// 자리(자소) 연습: 단계별 / 혼합 모드.
import { KO_STAGES, EN_STAGES, ITEMS_PER_STAGE } from '../data/jamo-stages.js';
import { charFromKey, keyForChar } from '../core/keyboard-layout.js';
import { decompose } from '../core/hangul.js';
import { hasCommandModifier } from '../core/typing-input.js';
import { el, pills, pickRandom } from '../ui/dom.js';
import { sounds } from '../core/sound.js';
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
      ...stagesFor(lang).map((s) => ({ value: s.id, label: `${done.includes(s.id) ? '✓ ' : ''}${s.title}` })),
      { value: MIX, label: lang === 'ko' ? '🔀 혼합' : '🔀 Mixed' },
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
    desc.textContent = stageId === MIX ? (lang === 'ko' ? '모든 단계의 글자가 섞여 나와요.' : 'All keys mixed together.') : currentStage().desc;
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
      label: stageId === MIX ? '자리 연습 · 혼합' : currentStage().title,
      title: stageId === MIX ? '혼합 연습 완료!' : `${currentStage().title} 완료!`,
      snap,
      actions: [
        next ? { label: `다음: ${next.title}`, primary: true, onClick: () => restart(next.id) } : { label: '혼합 연습 하기', primary: true, onClick: () => restart(MIX) },
        { label: '다시 하기', onClick: () => restart() },
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
      sounds.miss();
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

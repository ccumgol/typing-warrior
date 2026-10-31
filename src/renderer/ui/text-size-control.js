// "가− 125% 가+" control for the games' text size (saved in settings).
import { GAME_TEXT_SCALES } from '../core/storage.js';
import { el } from './dom.js';
import { t } from '../core/i18n.js';

export function createTextSizeControl(ctx, onChange = () => {}) {
  const box = el('div', { class: 'text-size', title: t('textSize.title') });

  function step(direction) {
    const index = GAME_TEXT_SCALES.indexOf(ctx.settings().gameTextScale);
    const next = GAME_TEXT_SCALES[Math.min(GAME_TEXT_SCALES.length - 1, Math.max(0, index + direction))];
    if (next === undefined || next === ctx.settings().gameTextScale) return;
    ctx.updateSettings({ gameTextScale: next });
    render();
    onChange(next);
  }

  function render() {
    const scale = ctx.settings().gameTextScale;
    const atMin = scale === GAME_TEXT_SCALES[0];
    const atMax = scale === GAME_TEXT_SCALES[GAME_TEXT_SCALES.length - 1];
    box.replaceChildren(
      el('button', { type: 'button', tabindex: '-1', disabled: atMin, onclick: () => step(-1), 'aria-label': t('textSize.smaller') }, t('textSize.minus')),
      el('span', {}, `${Math.round(scale * 100)}%`),
      el('button', { type: 'button', tabindex: '-1', disabled: atMax, onclick: () => step(1), 'aria-label': t('textSize.larger') }, t('textSize.plus')),
    );
  }

  render();
  return box;
}

// Result / encouragement dialog shown when a stage or game ends.
import { el } from './dom.js';
import { cheerMessage, bonusVerse } from '../core/cheer.js';
import { t } from '../core/i18n.js';

const CONFETTI_COLORS = ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#c77dff'];

function confetti(host) {
  const layer = el('div', { class: 'confetti' });
  for (let i = 0; i < 60; i += 1) {
    layer.append(
      el('i', {
        style: [
          `left:${Math.random() * 100}%`,
          `background:${CONFETTI_COLORS[i % CONFETTI_COLORS.length]}`,
          `animation-delay:${Math.random() * 0.6}s`,
          `animation-duration:${1.6 + Math.random() * 1.4}s`,
          `transform:rotate(${Math.random() * 360}deg)`,
        ].join(';'),
      }),
    );
  }
  host.append(layer);
  setTimeout(() => layer.remove(), 3500);
}

/**
 * @param {object} options
 * @param {string} options.title
 * @param {{label:string, value:string}[]} options.stats
 * @param {number} options.accuracy
 * @param {boolean} [options.isBest]
 * @param {{label:string, primary?:boolean, onClick:Function}[]} options.actions
 */
const INPUT_GUARD_MS = 500; // ignore keys that were already being typed when the dialog opened
let closeCurrent = null;

/** Close the dialog without running any of its actions (e.g. when the user switches modes). */
export const closeModal = () => closeCurrent?.();

export function showResult({ title, stats, accuracy, isBest = false, actions }) {
  closeModal();
  const root = document.getElementById('modal-root');
  const openedAt = performance.now();
  const close = () => {
    root.replaceChildren();
    document.removeEventListener('keydown', onKey, true);
    closeCurrent = null;
  };
  closeCurrent = close;
  const run = (action) => {
    close();
    action.onClick();
  };
  function onKey(event) {
    if (event.repeat || performance.now() - openedAt < INPUT_GUARD_MS) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      run(actions.find((a) => a.primary) || actions[0]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      run(actions[actions.length - 1]);
    } else {
      event.stopPropagation();
    }
  }

  const dialog = el(
    'div',
    { class: 'modal', role: 'dialog', 'aria-modal': 'true' },
    el('div', { class: 'modal-title' }, title),
    isBest ? el('div', { class: 'badge-best' }, t('modal.best')) : null,
    el('p', { class: 'modal-cheer' }, cheerMessage(accuracy)),
    el('div', { class: 'modal-stats' }, stats.map((s) => el('div', { class: 'stat' }, el('b', {}, s.value), el('span', {}, s.label)))),
    el('p', { class: 'modal-verse' }, bonusVerse()),
    el(
      'div',
      { class: 'modal-actions' },
      actions.map((a) => el('button', { class: a.primary ? 'btn primary' : 'btn', type: 'button', onclick: () => run(a) }, a.label)),
    ),
    el('div', { class: 'modal-keys' }, t('modal.keys')),
  );
  root.replaceChildren(el('div', { class: 'modal-backdrop' }, dialog));
  if (accuracy >= 90) confetti(root);
  document.addEventListener('keydown', onKey, true);
}

export const isModalOpen = () => document.getElementById('modal-root').childElementCount > 0;

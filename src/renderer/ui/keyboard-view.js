// On-screen keyboard with finger colours and next-key highlighting.
import { ROWS, HOME_KEYS, FINGER_NAMES } from '../core/keyboard-layout.js';
import { el } from './dom.js';

export function createKeyboardView(container) {
  const keyNodes = new Map();
  const hint = el('div', { class: 'kb-hint' });
  let lang = 'ko';
  let highlighted = [];

  function labelFor(key) {
    if (key.special) return [el('span', { class: 'kb-main' }, key.label)];
    const main = lang === 'ko' ? key.ko : key.en.toUpperCase();
    const sub = lang === 'ko' ? key.en.toUpperCase() : key.enShift !== key.en.toUpperCase() ? key.enShift : '';
    const shiftJamo = lang === 'ko' && key.koShift !== key.ko && /[ㄱ-ㅣ]/.test(key.koShift) ? key.koShift : '';
    return [
      el('span', { class: 'kb-main' }, main),
      sub ? el('span', { class: 'kb-sub' }, sub) : null,
      shiftJamo ? el('span', { class: 'kb-shift' }, shiftJamo) : null,
    ];
  }

  function render() {
    keyNodes.clear();
    const board = el(
      'div',
      { class: 'kb' },
      ROWS.map((row) =>
        el(
          'div',
          { class: 'kb-row' },
          row.map((key) => {
            const node = el(
              'div',
              {
                class: `kb-key finger-${key.finger}${HOME_KEYS.includes(key.code) ? ' home' : ''}`,
                style: `flex-grow:${key.size || 1}`,
                dataset: { code: key.code },
              },
              labelFor(key),
            );
            keyNodes.set(key.code, node);
            return node;
          }),
        ),
      ),
    );
    container.replaceChildren(board, hint);
    highlighted = [];
  }

  function highlight(next) {
    highlighted.forEach((node) => node.classList.remove('next'));
    highlighted = [];
    if (!next) {
      hint.textContent = '';
      return;
    }
    const codes = [next.code, next.shiftCode].filter(Boolean);
    highlighted = codes.map((code) => keyNodes.get(code)).filter(Boolean);
    highlighted.forEach((node) => node.classList.add('next'));
    const shiftText = next.shiftCode ? ` + ${next.shiftCode === 'ShiftLeft' ? '왼쪽' : '오른쪽'} Shift` : '';
    hint.textContent = next.code === 'Backspace' ? '틀린 글자를 지워 주세요 (⌫)' : `${FINGER_NAMES[next.finger] || ''}${shiftText}`;
  }

  function flash(code, ok) {
    const node = keyNodes.get(code);
    if (!node) return;
    const cls = ok ? 'hit' : 'miss';
    node.classList.remove('hit', 'miss');
    void node.offsetWidth; // restart the animation
    node.classList.add(cls);
  }

  render();
  return {
    setLang(nextLang) {
      if (nextLang === lang) return;
      lang = nextLang;
      render();
    },
    highlight,
    flash,
  };
}

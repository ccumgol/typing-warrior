// On-screen keyboard with finger colours and next-key highlighting.
import { ROWS, HOME_KEYS } from '../core/keyboard-layout.js';
import { bottomRow, FUNCTION_ROW, NAV_ROWS } from '../core/keyboard-extras.js';
import { el } from './dom.js';
import { t } from '../core/i18n.js';

const CHAR_ROWS = ROWS.slice(0, 4); // the Space row comes from bottomRow(platform)

/**
 * @param {HTMLElement} container
 * @param {{platform?:'mac'|'win'}} [options]
 */
export function createKeyboardView(container, { platform: initialPlatform = 'win' } = {}) {
  const keyNodes = new Map();
  const hint = el('div', { class: 'kb-hint' });
  let lang = 'ko';
  let platform = initialPlatform;
  let extended = false; // function row + navigation cluster (단축키)
  let highlighted = [];

  function labelFor(key) {
    if (key.special) {
      return [el('span', { class: 'kb-main' }, key.label), key.sub ? el('span', { class: 'kb-sub' }, key.sub) : null];
    }
    const main = lang === 'ko' ? key.ko : key.en.toUpperCase();
    const sub = lang === 'ko' ? key.en.toUpperCase() : key.enShift !== key.en.toUpperCase() ? key.enShift : '';
    // Top-right corner: the Shift jamo in Korean mode; in 'shortcut' mode (English letters big)
    // the Korean jamo as a small hint.
    const cornerFor = { ko: key.koShift !== key.ko ? key.koShift : '', shortcut: key.ko };
    const corner = cornerFor[lang] || '';
    const shiftJamo = /[ㄱ-ㅣ]/.test(corner) ? corner : '';
    return [
      el('span', { class: 'kb-main' }, main),
      sub ? el('span', { class: 'kb-sub' }, sub) : null,
      shiftJamo ? el('span', { class: 'kb-shift' }, shiftJamo) : null,
    ];
  }

  function keyNode(key) {
    if (key.gap) return el('div', { class: 'kb-gap', style: `flex-grow:${key.size}` });
    const classes = ['kb-key', `finger-${key.finger}`, HOME_KEYS.includes(key.code) ? 'home' : '', key.small ? 'small' : ''];
    const node = el('div', { class: classes.filter(Boolean).join(' '), style: `flex-grow:${key.size || 1}`, dataset: { code: key.code } }, labelFor(key));
    keyNodes.set(key.code, node);
    return node;
  }

  const block = (cls, rows) => el('div', { class: cls }, rows.map((row) => el('div', { class: 'kb-row' }, row.map(keyNode))));

  function render() {
    keyNodes.clear();
    const mainRows = [...(extended ? [FUNCTION_ROW] : []), ...CHAR_ROWS, bottomRow(platform)];
    const main = block('kb', mainRows);
    const board = extended
      ? el('div', { class: 'kb-wrap' }, main, block('kb kb-nav', [[{ gap: true, size: 3 }], ...NAV_ROWS]))
      : main;
    container.replaceChildren(board, hint);
    highlighted = [];
  }

  function mark(codes, text) {
    highlighted.forEach((node) => node.classList.remove('next'));
    highlighted = codes.map((code) => keyNodes.get(code)).filter(Boolean);
    highlighted.forEach((node) => node.classList.add('next'));
    hint.textContent = text;
  }

  function highlight(next) {
    if (!next) return mark([], '');
    const shiftText = next.shiftCode ? t(next.shiftCode === 'ShiftLeft' ? 'kb.shiftLeft' : 'kb.shiftRight') : '';
    const text = next.code === 'Backspace' ? t('kb.backspace') : `${next.finger ? t(`finger.${next.finger}`) : ''}${shiftText}`;
    return mark([next.code, next.shiftCode].filter(Boolean), text);
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
    /** Switch the modifier row between macOS and Windows keycaps. */
    setPlatform(nextPlatform) {
      if (nextPlatform === platform) return;
      platform = nextPlatform;
      render();
    },
    /** Show the function row and navigation keys (for shortcut practice). */
    setExtended(next) {
      if (next === extended) return;
      extended = next;
      render();
    },
    highlight,
    /** Highlight an arbitrary set of keys, e.g. a shortcut combo. */
    highlightKeys: (codes, text = '') => mark(codes, text),
    flash,
  };
}

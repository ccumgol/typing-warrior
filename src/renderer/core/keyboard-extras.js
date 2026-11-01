// Non-character keys for the on-screen keyboard: the modifier row (per platform),
// plus the function row and navigation cluster shown in 단축키 practice.
// Finger 'X' means no finger colour.

const mod = (code, label, finger, size, sub = '') => ({ code, label, finger, size, sub, special: true, small: true });
const fn = (code, label, size = 1) => ({ code, label, finger: 'X', size, special: true, small: true });
const gap = (size = 1) => ({ gap: true, size });

const BOTTOM_ROWS = Object.freeze({
  // 102-key PC layout (Korean keyboards label right Alt as 한/영)
  win: [
    mod('ControlLeft', 'Ctrl', 'L5', 1.4), mod('MetaLeft', 'Win', 'L5', 1.25), mod('AltLeft', 'Alt', 'T', 1.25),
    { code: 'Space', label: '', finger: 'T', size: 6.2, special: true },
    mod('AltRight', 'Alt', 'T', 1.25, '한/영'), mod('MetaRight', 'Win', 'R5', 1.25),
    mod('ContextMenu', '☰', 'R5', 1.2), mod('ControlRight', 'Ctrl', 'R5', 1.4),
  ],
  mac: [
    mod('Fn', 'fn', 'L5', 1), mod('ControlLeft', 'control', 'L5', 1.3, '⌃'), mod('AltLeft', 'option', 'T', 1.3, '⌥'),
    mod('MetaLeft', 'command', 'T', 1.6, '⌘'),
    { code: 'Space', label: '', finger: 'T', size: 7, special: true },
    mod('MetaRight', 'command', 'T', 1.6, '⌘'), mod('AltRight', 'option', 'T', 1.3, '⌥'),
  ],
  // Mac labels on a Windows keyboard (macOS shortcut practice on Windows): control · option · command sit on Ctrl · Win · Alt.
  'mac-on-win': [
    mod('ControlLeft', 'control', 'L5', 1.4, '⌃'), mod('MetaLeft', 'option', 'L5', 1.25, '⌥'), mod('AltLeft', 'command', 'T', 1.4, '⌘'),
    { code: 'Space', label: '', finger: 'T', size: 6.2, special: true },
    mod('AltRight', 'command', 'T', 1.4, '⌘'), mod('MetaRight', 'option', 'R5', 1.25, '⌥'), mod('ControlRight', 'control', 'R5', 1.4, '⌃'),
  ],
});

/** Bottom (modifier + Space) row for 'mac', 'win' or 'mac-on-win'. */
export const bottomRow = (platform) => BOTTOM_ROWS[platform] || BOTTOM_ROWS.win;

export const FUNCTION_ROW = Object.freeze([
  fn('Escape', 'Esc'), gap(0.6),
  ...[1, 2, 3, 4].map((n) => fn(`F${n}`, `F${n}`)), gap(0.4),
  ...[5, 6, 7, 8].map((n) => fn(`F${n}`, `F${n}`)), gap(0.4),
  ...[9, 10, 11, 12].map((n) => fn(`F${n}`, `F${n}`)),
]);

// Rows line up with the main block: number row, Tab row, Caps row, Shift row, bottom row.
export const NAV_ROWS = Object.freeze([
  [fn('Insert', 'Ins'), fn('Home', 'Home'), fn('PageUp', 'PgUp')],
  [fn('Delete', 'Del'), fn('End', 'End'), fn('PageDown', 'PgDn')],
  [gap(3)],
  [gap(), fn('ArrowUp', '↑'), gap()],
  [fn('ArrowLeft', '←'), fn('ArrowDown', '↓'), fn('ArrowRight', '→')],
]);

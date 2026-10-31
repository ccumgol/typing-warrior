// Physical keyboard layout (US ANSI + 한글 두벌식) with finger assignments.
// Fingers: L5 L4 L3 L2 = left pinky..index, R2 R3 R4 R5 = right index..pinky, T = thumb.

const k = (code, en, enShift, ko, koShift, finger) => ({ code, en, enShift, ko, koShift, finger });
const wide = (code, label, finger, size) => ({ code, label, finger, size, special: true });

export const ROWS = Object.freeze([
  [
    k('Backquote', '`', '~', '`', '~', 'L5'), k('Digit1', '1', '!', '1', '!', 'L5'),
    k('Digit2', '2', '@', '2', '@', 'L4'), k('Digit3', '3', '#', '3', '#', 'L3'),
    k('Digit4', '4', '$', '4', '$', 'L2'), k('Digit5', '5', '%', '5', '%', 'L2'),
    k('Digit6', '6', '^', '6', '^', 'R2'), k('Digit7', '7', '&', '7', '&', 'R2'),
    k('Digit8', '8', '*', '8', '*', 'R3'), k('Digit9', '9', '(', '9', '(', 'R4'),
    k('Digit0', '0', ')', '0', ')', 'R5'), k('Minus', '-', '_', '-', '_', 'R5'),
    k('Equal', '=', '+', '=', '+', 'R5'), wide('Backspace', '⌫', 'R5', 2),
  ],
  [
    wide('Tab', 'Tab', 'L5', 1.5),
    k('KeyQ', 'q', 'Q', 'ㅂ', 'ㅃ', 'L5'), k('KeyW', 'w', 'W', 'ㅈ', 'ㅉ', 'L4'),
    k('KeyE', 'e', 'E', 'ㄷ', 'ㄸ', 'L3'), k('KeyR', 'r', 'R', 'ㄱ', 'ㄲ', 'L2'),
    k('KeyT', 't', 'T', 'ㅅ', 'ㅆ', 'L2'), k('KeyY', 'y', 'Y', 'ㅛ', 'ㅛ', 'R2'),
    k('KeyU', 'u', 'U', 'ㅕ', 'ㅕ', 'R2'), k('KeyI', 'i', 'I', 'ㅑ', 'ㅑ', 'R3'),
    k('KeyO', 'o', 'O', 'ㅐ', 'ㅒ', 'R4'), k('KeyP', 'p', 'P', 'ㅔ', 'ㅖ', 'R5'),
    k('BracketLeft', '[', '{', '[', '{', 'R5'), k('BracketRight', ']', '}', ']', '}', 'R5'),
    k('Backslash', '\\', '|', '\\', '|', 'R5'),
  ],
  [
    wide('CapsLock', 'Caps', 'L5', 1.8),
    k('KeyA', 'a', 'A', 'ㅁ', 'ㅁ', 'L5'), k('KeyS', 's', 'S', 'ㄴ', 'ㄴ', 'L4'),
    k('KeyD', 'd', 'D', 'ㅇ', 'ㅇ', 'L3'), k('KeyF', 'f', 'F', 'ㄹ', 'ㄹ', 'L2'),
    k('KeyG', 'g', 'G', 'ㅎ', 'ㅎ', 'L2'), k('KeyH', 'h', 'H', 'ㅗ', 'ㅗ', 'R2'),
    k('KeyJ', 'j', 'J', 'ㅓ', 'ㅓ', 'R2'), k('KeyK', 'k', 'K', 'ㅏ', 'ㅏ', 'R3'),
    k('KeyL', 'l', 'L', 'ㅣ', 'ㅣ', 'R4'), k('Semicolon', ';', ':', ';', ':', 'R5'),
    k('Quote', "'", '"', "'", '"', 'R5'), wide('Enter', 'Enter', 'R5', 2.2),
  ],
  [
    wide('ShiftLeft', 'Shift', 'L5', 2.4),
    k('KeyZ', 'z', 'Z', 'ㅋ', 'ㅋ', 'L5'), k('KeyX', 'x', 'X', 'ㅌ', 'ㅌ', 'L4'),
    k('KeyC', 'c', 'C', 'ㅊ', 'ㅊ', 'L3'), k('KeyV', 'v', 'V', 'ㅍ', 'ㅍ', 'L2'),
    k('KeyB', 'b', 'B', 'ㅠ', 'ㅠ', 'L2'), k('KeyN', 'n', 'N', 'ㅜ', 'ㅜ', 'R2'),
    k('KeyM', 'm', 'M', 'ㅡ', 'ㅡ', 'R2'), k('Comma', ',', '<', ',', '<', 'R3'),
    k('Period', '.', '>', '.', '>', 'R4'), k('Slash', '/', '?', '/', '?', 'R5'),
    wide('ShiftRight', 'Shift', 'R5', 2.8),
  ],
  [wide('Space', '', 'T', 7)],
]);

export const HOME_KEYS = Object.freeze(['KeyF', 'KeyJ']);

export const FINGER_NAMES = Object.freeze({
  L5: '왼손 새끼', L4: '왼손 약지', L3: '왼손 중지', L2: '왼손 검지',
  R2: '오른손 검지', R3: '오른손 중지', R4: '오른손 약지', R5: '오른손 새끼', T: '엄지',
});

const CHAR_KEYS = ROWS.flat().filter((key) => !key.special);
const BY_CODE = new Map(ROWS.flat().map((key) => [key.code, key]));

export const getKey = (code) => BY_CODE.get(code);

/**
 * Convert a physical key press to the character it produces in the chosen language.
 * @returns {string|null} null for keys that don't produce characters.
 */
export function charFromKey(code, { shift = false, capsLock = false, lang = 'ko' } = {}) {
  if (code === 'Space') return ' ';
  const key = BY_CODE.get(code);
  if (!key || key.special) return null;
  if (lang === 'ko') return shift ? key.koShift : key.ko;
  const isLetter = /^[a-z]$/.test(key.en);
  const upper = isLetter ? shift !== capsLock : shift;
  return upper ? key.enShift : key.en;
}

const REVERSE = (() => {
  const map = new Map([[' ', { code: 'Space', shift: false, finger: 'T' }]]);
  const add = (ch, key, shift) => {
    if (!map.has(ch)) map.set(ch, { code: key.code, shift, finger: key.finger });
  };
  for (const key of CHAR_KEYS) {
    add(key.en, key, false);
    add(key.ko, key, false);
  }
  for (const key of CHAR_KEYS) {
    add(key.enShift, key, true);
    add(key.koShift, key, true);
  }
  return map;
})();

/**
 * Find which physical key (and whether Shift is needed) produces a character.
 * @returns {{code:string, shift:boolean, finger:string, shiftCode?:string}|null}
 */
export function keyForChar(ch) {
  const info = REVERSE.get(ch);
  if (!info) return null;
  if (!info.shift) return info;
  // Press Shift with the opposite hand.
  const shiftCode = info.finger.startsWith('L') ? 'ShiftRight' : 'ShiftLeft';
  return { ...info, shiftCode };
}

export const isTypable = (ch) => REVERSE.has(ch);

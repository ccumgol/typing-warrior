// Turns key events into an immutable list of typed tokens and compares them to a target.
import { charFromKey, keyForChar } from './keyboard-layout.js';
import { compose, decompose } from './hangul.js';

/** True when a shortcut modifier is held (those presses are not typing). */
export const hasCommandModifier = (event) => event.metaKey || event.ctrlKey || event.altKey;

/**
 * Apply a key press to the token list.
 * @returns {{tokens:string[], added:string|null}|null} null when the key isn't a typing key.
 */
export function applyKey(tokens, event, lang) {
  if (hasCommandModifier(event)) return null;
  if (event.code === 'Backspace') return { tokens: tokens.slice(0, -1), added: null };
  const ch = charFromKey(event.code, {
    shift: event.shiftKey,
    capsLock: event.getModifierState?.('CapsLock') ?? false,
    lang,
  });
  if (ch === null) return null;
  return { tokens: [...tokens, ch], added: ch };
}

/** Builds a typing target with helpers for checking progress. */
export function createTarget(text) {
  const tokens = decompose(text);
  return Object.freeze({
    text,
    tokens,
    /** Was the token typed at `index` the expected one? */
    isCorrectAt: (index, token) => tokens[index] === token,
    /** Next key to press if everything so far is correct, else null. */
    nextKey(typed) {
      const allCorrect = typed.every((t, i) => t === tokens[i]);
      if (!allCorrect) return { code: 'Backspace', shift: false, finger: 'R5' };
      const next = tokens[typed.length];
      return next === undefined ? null : keyForChar(next);
    },
    isComplete: (typed) => typed.length === tokens.length && typed.every((t, i) => t === tokens[i]),
  });
}

export const typedText = (tokens) => compose(tokens);

/** Detects the dominant script of a text so the right layout is used. */
export const detectLang = (text) => (/[가-힣ㄱ-ㅣ]/.test(text) ? 'ko' : 'en');

/** Is this the 한/영 toggle key (or our Shift+Space fallback)? */
export const isLangToggle = (event) =>
  event.code === 'Lang1' || event.key === 'HangulMode' || (event.shiftKey && event.code === 'Space');

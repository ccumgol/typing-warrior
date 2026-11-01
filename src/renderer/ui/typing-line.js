// Renders a target text coloured by what has been typed so far.
// Works at key-stroke level so a half-built Hangul syllable shows as "composing", not wrong.
import { decompose } from '../core/hangul.js';
import { el } from './dom.js';

/** Per-character states: 'correct' | 'wrong' | 'composing' | 'pending'. */
export function charStates(target, typedTokens) {
  const chars = [...target];
  const firstWrong = (() => {
    const tokens = decompose(target);
    const index = typedTokens.findIndex((t, i) => t !== tokens[i]);
    return index === -1 ? typedTokens.length : index;
  })();
  const typedCount = typedTokens.length;
  let start = 0;
  return chars.map((ch) => {
    const end = start + decompose(ch).length;
    let state = 'pending';
    if (end <= firstWrong && end <= typedCount) state = 'correct';
    else if (start < typedCount) state = firstWrong >= typedCount && start < firstWrong ? 'composing' : 'wrong';
    start = end;
    return { ch, state };
  });
}

export function renderTypingLine(target, typedTokens) {
  const states = charStates(target, typedTokens);
  const cursorIndex = states.findIndex((s) => s.state === 'pending' || s.state === 'composing');
  const charNode = ({ ch, state }, i) =>
    el('span', { class: `ch ${state}${i === cursorIndex ? ' cursor' : ''}${ch === ' ' ? ' space' : ''}` }, ch);
  // Group letters into words so a line only wraps between words, never inside one.
  const parts = [];
  let word = [];
  states.forEach((s, i) => {
    if (s.ch === ' ') {
      if (word.length) parts.push(el('span', { class: 'word' }, word));
      word = [];
      parts.push(charNode(s, i));
    } else {
      word.push(charNode(s, i));
    }
  });
  if (word.length) parts.push(el('span', { class: 'word' }, word));
  return el('div', { class: 'typing-line' }, parts);
}

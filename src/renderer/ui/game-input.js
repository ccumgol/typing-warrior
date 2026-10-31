// Text box used by the games: composes Hangul from key presses, Enter/Space submits.
import { applyKey, typedText } from '../core/typing-input.js';
import { el } from './dom.js';

export function createGameInput({ placeholder = '단어를 입력하고 Enter', spaceSubmits = true } = {}) {
  let tokens = [];
  const box = el('div', { class: 'game-input empty', 'data-placeholder': placeholder });

  const render = () => {
    box.textContent = typedText(tokens);
    box.classList.toggle('empty', tokens.length === 0);
  };

  return {
    el: box,
    text: () => typedText(tokens),
    tokenCount: () => tokens.length,
    clear() {
      tokens = [];
      render();
    },
    setState(state) {
      box.dataset.state = '';
      void box.offsetWidth; // restart the animation
      box.dataset.state = state || '';
    },
    /**
     * @returns {{handled:boolean, submitted:string|null}}
     */
    handleKey(event, lang) {
      const isSubmit = event.code === 'Enter' || event.code === 'NumpadEnter' || (spaceSubmits && event.code === 'Space');
      if (isSubmit) {
        const submitted = typedText(tokens).trim();
        tokens = [];
        render();
        return { handled: true, submitted: submitted || null };
      }
      const result = applyKey(tokens, event, lang);
      if (!result) return { handled: false, submitted: null };
      tokens = result.tokens;
      render();
      return { handled: true, submitted: null };
    },
  };
}

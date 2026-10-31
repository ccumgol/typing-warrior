// Hangul (두벌식) composition and decomposition.
// The app composes Hangul itself from physical key presses, so practice works
// regardless of which input method the OS currently has selected.

const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const SYLLABLE_BASE = 0xac00;
const SYLLABLE_LAST = 0xd7a3;

const JUNG_COMBINE = Object.freeze({
  'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ',
});
const JONG_COMBINE = Object.freeze({
  'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ',
  'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ',
});

// Reverse tables: compound jamo -> the atomic keys that produce it.
const SPLIT = Object.freeze(
  Object.fromEntries(
    [...Object.entries(JUNG_COMBINE), ...Object.entries(JONG_COMBINE)].map(([pair, joined]) => [joined, [...pair]]),
  ),
);

const CONSONANTS = new Set([...CHO, ...JONG.filter(Boolean)]);
const VOWELS = new Set(JUNG);

export const isConsonant = (ch) => CONSONANTS.has(ch);
export const isVowel = (ch) => VOWELS.has(ch);
export const isJamo = (ch) => isConsonant(ch) || isVowel(ch);
export const isSyllable = (ch) => {
  const code = ch.charCodeAt(0);
  return code >= SYLLABLE_BASE && code <= SYLLABLE_LAST;
};

function renderBlock(block) {
  const { cho, jung, jong } = block;
  if (cho && jung) {
    const code = SYLLABLE_BASE + (CHO.indexOf(cho) * 21 + JUNG.indexOf(jung)) * 28 + JONG.indexOf(jong || '');
    return String.fromCharCode(code);
  }
  return cho || jung || '';
}

const EMPTY = Object.freeze({ cho: '', jung: '', jong: '' });

function addConsonant(block, c) {
  const { cho, jung, jong } = block;
  if (!cho && !jung) return { out: '', block: { ...EMPTY, cho: c } };
  if (!jung || !cho) return { out: renderBlock(block), block: { ...EMPTY, cho: c } };
  if (!jong) {
    return JONG.includes(c)
      ? { out: '', block: { ...block, jong: c } }
      : { out: renderBlock(block), block: { ...EMPTY, cho: c } };
  }
  const joined = JONG_COMBINE[jong + c];
  return joined
    ? { out: '', block: { ...block, jong: joined } }
    : { out: renderBlock(block), block: { ...EMPTY, cho: c } };
}

function addVowel(block, v) {
  const { cho, jung, jong } = block;
  if (jong) {
    // The final consonant moves to start the next syllable (e.g. 갑 + ㅏ -> 가바).
    const parts = SPLIT[jong];
    const keep = parts ? parts[0] : '';
    const move = parts ? parts[1] : jong;
    return { out: renderBlock({ ...block, jong: keep }), block: { cho: move, jung: v, jong: '' } };
  }
  if (jung) {
    const joined = JUNG_COMBINE[jung + v];
    return joined
      ? { out: '', block: { ...block, jung: joined } }
      : { out: renderBlock(block), block: { ...EMPTY, jung: v } };
  }
  if (cho) return { out: '', block: { ...block, jung: v } };
  return { out: '', block: { ...EMPTY, jung: v } };
}

/**
 * Compose a list of key tokens (jamo or other characters) into text.
 * @param {string[]} tokens
 * @returns {string}
 */
export function compose(tokens) {
  let text = '';
  let block = EMPTY;
  for (const token of tokens) {
    let step;
    if (isConsonant(token)) step = addConsonant(block, token);
    else if (isVowel(token)) step = addVowel(block, token);
    else step = { out: renderBlock(block) + token, block: EMPTY };
    text += step.out;
    block = step.block;
  }
  return text + renderBlock(block);
}

/**
 * Split text into the atomic key tokens needed to type it on 두벌식.
 * Compound vowels/finals are split (ㅘ -> ㅗ,ㅏ / ㄳ -> ㄱ,ㅅ); 쌍자음 stay single (Shift key).
 * @param {string} text
 * @returns {string[]}
 */
export function decompose(text) {
  const tokens = [];
  for (const ch of text) {
    if (isSyllable(ch)) {
      const index = ch.charCodeAt(0) - SYLLABLE_BASE;
      const cho = CHO[Math.floor(index / 588)];
      const jung = JUNG[Math.floor((index % 588) / 28)];
      const jong = JONG[index % 28];
      tokens.push(cho, ...(SPLIT[jung] || [jung]));
      if (jong) tokens.push(...(SPLIT[jong] || [jong]));
    } else if (SPLIT[ch]) {
      tokens.push(...SPLIT[ch]);
    } else {
      tokens.push(ch);
    }
  }
  return tokens;
}

/** Number of key strokes needed to type the text (used for 타수). */
export const strokeCount = (text) => decompose(text).length;

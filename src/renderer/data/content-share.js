// How much of the practice text is ESV (Crossway allows quoting it without a licence only below 25%).
import { KO_WORD_SETS, EN_WORD_SETS } from './words.js';
import { KO_QUOTES, EN_SENTENCES } from './quotes.js';
import { BIBLE_VERSES } from './bible.js';
import { EN_BIBLE_VERSES } from './bible-en.js';
import { PSALMS } from './psalms.js';
import { PSALMS as KJV_PSALMS } from './psalms-kjv.js';
import { WORKS as KO_POETRY } from './poetry-ko.js';
import { WORKS as EN_POETRY } from './poetry-en.js';

export const ESV_SHARE_LIMIT = 0.25;

const chars = (items) => items.reduce((sum, item) => sum + (typeof item === 'string' ? item : item.text).length, 0);

/** ESV characters ÷ all practice-text characters (0..1). */
export function esvShare() {
  const esv = chars(EN_BIBLE_VERSES);
  const others = [
    ...Object.values(KO_WORD_SETS).flat(), ...Object.values(EN_WORD_SETS).flat(),
    ...KO_QUOTES, ...EN_SENTENCES, ...BIBLE_VERSES,
    ...[...PSALMS, ...KJV_PSALMS].flatMap((p) => p.verses),
    ...[...KO_POETRY, ...EN_POETRY].flatMap((w) => w.pieces.flatMap((p) => p.lines)),
  ];
  return esv / (esv + chars(others));
}

// 산성비 difficulty curve, defined by the typing speed each level asks for.
// Required speed = words spawned per minute × average key strokes per word (Enter not counted).

export const STAGE_LEVELS = 20; // levels in 단계 모드
export const MAX_DIFFICULTY_LEVEL = 30; // 연속 모드 keeps going, but stops getting harder here

const BASE_CPM = 40;
const CPM_PER_LEVEL = 16; // level 1 ≈ 56, level 10 = 200, level 20 = 360, level 30 = 520

const capped = (level) => Math.min(Math.max(1, level), MAX_DIFFICULTY_LEVEL);

/** Strokes per minute needed to keep up at this level. */
export const targetCpm = (level) => BASE_CPM + capped(level) * CPM_PER_LEVEL;

/** Time between new words so that typing them all takes exactly targetCpm. */
export const spawnDelayMs = (level, avgStrokes) => Math.round((avgStrokes * 60000) / targetCpm(level));

/** Seconds a word takes to reach the ground (about 4 words on screen at a time). */
export const fallSeconds = (level) => Math.min(10, Math.max(3.5, 10 - capped(level) * 0.3));

/** Average strokes per word for a word list. */
export const averageStrokes = (words, strokeCount) => words.reduce((sum, word) => sum + strokeCount(word), 0) / Math.max(1, words.length);

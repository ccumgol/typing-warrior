// Typing statistics as immutable values.

export const createStats = (now = Date.now()) =>
  Object.freeze({ startedAt: now, strokes: 0, errors: 0, items: 0 });

export const recordStroke = (stats, isCorrect) =>
  Object.freeze({ ...stats, strokes: stats.strokes + 1, errors: stats.errors + (isCorrect ? 0 : 1) });

export const recordItem = (stats) => Object.freeze({ ...stats, items: stats.items + 1 });

export const elapsedMs = (stats, now = Date.now()) => Math.max(0, now - stats.startedAt);

/** 타수: correct key strokes per minute. */
export function strokesPerMinute(stats, now = Date.now()) {
  const minutes = elapsedMs(stats, now) / 60000;
  if (minutes < 1 / 60) return 0;
  return Math.round((stats.strokes - stats.errors) / minutes);
}

/** Accuracy in percent (0–100). */
export function accuracy(stats) {
  if (stats.strokes === 0) return 100;
  return Math.max(0, Math.round(((stats.strokes - stats.errors) / stats.strokes) * 1000) / 10);
}

/** English WPM convention: five strokes = one word. */
export const wordsPerMinute = (stats, now = Date.now()) => Math.round(strokesPerMinute(stats, now) / 5);

export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

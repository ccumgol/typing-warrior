// Shared session bookkeeping for practice modes.
import { createStats, recordStroke, recordItem, strokesPerMinute, accuracy, elapsedMs, formatTime } from '../core/stats.js';
import { addRecord } from '../core/storage.js';
import { showResult } from '../ui/result-modal.js';

/** Holds the (immutable) stats of the running session; the clock starts at the first key stroke. */
export function createSession() {
  let stats = null;
  return {
    stroke(isCorrect) {
      stats = recordStroke(stats ?? createStats(), isCorrect);
    },
    item() {
      stats = recordItem(stats ?? createStats());
    },
    reset() {
      stats = null;
    },
    /** Start the clock now (games run on time, not on the first stroke). */
    begin() {
      stats = createStats();
    },
    /** Shift the start time forward so paused time is not counted. */
    excludePause(pausedMs) {
      if (stats) stats = Object.freeze({ ...stats, startedAt: stats.startedAt + pausedMs });
    },
    snapshot() {
      if (!stats) return { cpm: 0, accuracy: 100, ms: 0, strokes: 0, items: 0 };
      return {
        cpm: strokesPerMinute(stats),
        accuracy: accuracy(stats),
        ms: elapsedMs(stats),
        strokes: stats.strokes,
        items: stats.items,
      };
    },
  };
}

/** Standard status-bar payload for typing modes. */
export const statusFrom = (snap, progress) => ({
  cpm: snap.cpm,
  accuracy: snap.accuracy,
  time: formatTime(snap.ms),
  progress,
});

/** Save the record and show the encouragement dialog. */
export function finishSession({ mode, label, title, snap, score = snap.cpm, extraStats = [], actions }) {
  const { isBest } = addRecord({ mode, label, score, accuracy: snap.accuracy, ms: snap.ms });
  showResult({
    title,
    isBest,
    accuracy: snap.accuracy,
    stats: [
      { label: '타수 (분당)', value: snap.cpm },
      { label: '정확도', value: `${snap.accuracy}%` },
      { label: '시간', value: formatTime(snap.ms) },
      ...extraStats,
    ],
    actions,
  });
}

// 기록 화면: 모드별 최고 기록, 총 연습 시간, 연속 연습일, 최근 기록.
import { loadRecords } from '../core/storage.js';
import { formatTime } from '../core/stats.js';
import { el } from '../ui/dom.js';
import { t, getUiLang } from '../core/i18n.js';

// Record modes in display order; names come from the UI dictionary (rec.<mode>).
const MODES = Object.freeze([
  'jamo-ko', 'jamo-en', 'words-ko', 'words-en', 'sentences-quotes', 'sentences-bible', 'sentences-bible-en', 'sentences-english', 'longtext-psalms',
  'acid-rain', 'acid-stage', 'shooter', 'shortcuts-mac', 'shortcuts-win',
]);

const dayKey = (time) => new Date(time).toLocaleDateString('sv-SE');

function streakDays(records) {
  const days = new Set(records.map((r) => dayKey(r.at)));
  let count = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function createRecordsMode(ctx) {
  const records = loadRecords();
  const totalMs = records.reduce((sum, r) => sum + r.ms, 0);
  const todayMs = records.filter((r) => dayKey(r.at) === dayKey(Date.now())).reduce((sum, r) => sum + r.ms, 0);
  const best = MODES
    .map((mode) => {
      const list = records.filter((r) => r.mode === mode);
      return list.length ? { mode, best: Math.max(...list.map((r) => r.score)), count: list.length } : null;
    })
    .filter(Boolean);

  const card = (value, label) => el('div', { class: 'record-card' }, el('b', {}, value), el('span', {}, label));
  ctx.root.replaceChildren(
    el(
      'section',
      { class: 'mode records' },
      el('div', { class: 'record-cards' }, card(t('rec.days', { count: streakDays(records) }), t('rec.streak')), card(formatTime(todayMs), t('rec.today')), card(formatTime(totalMs), t('rec.total')), card(records.length, t('rec.count'))),
      el('h3', {}, t('rec.best')),
      best.length
        ? el('table', { class: 'record-table' }, el('tbody', {}, best.map((b) => el('tr', {}, el('td', {}, t(`rec.${b.mode}`)), el('td', {}, b.best.toLocaleString()), el('td', {}, t('rec.times', { count: b.count }))))))
        : el('p', { class: 'muted' }, t('rec.empty')),
      el('h3', {}, t('rec.recent')),
      el(
        'table',
        { class: 'record-table' },
        el('tbody', {}, records.slice(0, 15).map((r) => el('tr', {}, el('td', {}, new Date(r.at).toLocaleString(getUiLang() === 'ko' ? 'ko-KR' : 'en-US')), el('td', {}, r.label || r.mode), el('td', {}, r.score.toLocaleString()), el('td', {}, `${r.accuracy}%`)))),
      ),
    ),
  );
  ctx.keyboard.highlight(null);
  ctx.status({ cpm: '-', accuracy: '-', time: formatTime(totalMs), progress: t('rec.status') });
  return { onKeyDown: () => false, onLangChange() {}, tick() {}, destroy() {}, hidesKeyboard: true };
}

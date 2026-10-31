// 기록 화면: 모드별 최고 기록, 총 연습 시간, 연속 연습일, 최근 기록.
import { loadRecords } from '../core/storage.js';
import { formatTime } from '../core/stats.js';
import { el } from '../ui/dom.js';

const MODE_NAMES = {
  'jamo-ko': '자리 연습 (한글)', 'jamo-en': '자리 연습 (영문)', 'words-ko': '단어 (한글)', 'words-en': '단어 (영문)',
  'sentences-quotes': '문장 · 명언', 'sentences-bible': '문장 · 성경', 'sentences-english': '문장 · English',
  'acid-rain': '산성비 (점수)', shooter: '전선 작전 (점수)', 'shortcuts-mac': '단축키 macOS (정확도)', 'shortcuts-win': '단축키 Windows (정확도)',
};

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
  const best = Object.keys(MODE_NAMES)
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
      el('div', { class: 'record-cards' }, card(`${streakDays(records)}일`, '연속 연습'), card(formatTime(todayMs), '오늘 연습'), card(formatTime(totalMs), '총 연습 시간'), card(records.length, '완료한 연습')),
      el('h3', {}, '🏆 모드별 최고 기록'),
      best.length
        ? el('table', { class: 'record-table' }, el('tbody', {}, best.map((b) => el('tr', {}, el('td', {}, MODE_NAMES[b.mode]), el('td', {}, b.best.toLocaleString()), el('td', {}, `${b.count}회`)))))
        : el('p', { class: 'muted' }, '아직 기록이 없어요. 첫 연습을 시작해 볼까요?'),
      el('h3', {}, '🕘 최근 기록'),
      el(
        'table',
        { class: 'record-table' },
        el('tbody', {}, records.slice(0, 15).map((r) => el('tr', {}, el('td', {}, new Date(r.at).toLocaleString('ko-KR')), el('td', {}, r.label || r.mode), el('td', {}, r.score.toLocaleString()), el('td', {}, `${r.accuracy}%`)))),
      ),
    ),
  );
  ctx.keyboard.highlight(null);
  ctx.status({ cpm: '-', accuracy: '-', time: formatTime(totalMs), progress: '기록' });
  return { onKeyDown: () => false, onLangChange() {}, tick() {}, destroy() {}, hidesKeyboard: true };
}

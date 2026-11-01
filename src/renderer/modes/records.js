// 기록 화면: 내 기록(연속 연습일, 연습 시간, 모드별 최고 기록, 최근 기록), 이 컴퓨터 사용자 전체 순위, 긴 글 완성 배지.
import { loadRecords } from '../core/storage.js';
import { loadProfiles, loadProfileData, resetProfile } from '../core/profiles.js';
import { earnedBadges, chapterProgress } from '../core/badges.js';
import { formatTime } from '../core/stats.js';
import { el, pills } from '../ui/dom.js';
import { drawBadgeCard, saveBadgeCard, copyBadgeCard } from '../ui/badge-card.js';
import { t, getUiLang } from '../core/i18n.js';

// Record modes in display order; names come from the UI dictionary (rec.<mode>).
const MODES = Object.freeze([
  'jamo-ko', 'jamo-en', 'words-ko', 'words-en', 'sentences-quotes', 'sentences-today', 'sentences-today-en', 'sentences-topic', 'sentences-bible', 'sentences-bible-en', 'sentences-english', 'longtext-psalms', 'longtext-psalms-kjv',
  'acid-rain', 'acid-stage', 'shooter', 'shortcuts-mac', 'shortcuts-win',
]);
const RANK_SIZE = 5;

const dayKey = (time) => new Date(time).toLocaleDateString('sv-SE');
const locale = () => (getUiLang() === 'ko' ? 'ko-KR' : 'en-US');

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

/** Mode name; long-text works are named from the saved record label. */
function modeName(mode, records) {
  const key = `rec.${mode}`;
  if (t(key) !== key) return t(key);
  const latest = records.find((r) => r.mode === mode);
  return t('rec.longtext', { title: (latest?.label || mode).split(' · ')[0].replace(/^📖 /, '') });
}

const modesIn = (records) => [...MODES, ...[...new Set(records.map((r) => r.mode))].filter((m) => !MODES.includes(m) && m.startsWith('longtext-'))];
const bestOf = (records, mode) => records.filter((r) => r.mode === mode).reduce((best, r) => Math.max(best, r.score), -Infinity);

function myRecords(records) {
  const totalMs = records.reduce((sum, r) => sum + r.ms, 0);
  const todayMs = records.filter((r) => dayKey(r.at) === dayKey(Date.now())).reduce((sum, r) => sum + r.ms, 0);
  const best = modesIn(records).map((mode) => ({ mode, best: bestOf(records, mode), count: records.filter((r) => r.mode === mode).length })).filter((b) => b.count > 0);
  const card = (value, label) => el('div', { class: 'record-card' }, el('b', {}, value), el('span', {}, label));
  return [
    el('div', { class: 'record-cards' }, card(t('rec.days', { count: streakDays(records) }), t('rec.streak')), card(formatTime(todayMs), t('rec.today')), card(formatTime(totalMs), t('rec.total')), card(records.length, t('rec.count'))),
    el('h3', {}, t('rec.best')),
    best.length
      ? el('table', { class: 'record-table' }, el('tbody', {}, best.map((b) => el('tr', {}, el('td', {}, modeName(b.mode, records)), el('td', {}, b.best.toLocaleString()), el('td', {}, t('rec.times', { count: b.count }))))))
      : el('p', { class: 'muted' }, t('rec.empty')),
    el('h3', {}, t('rec.recent')),
    el('table', { class: 'record-table' }, el('tbody', {}, records.slice(0, 15).map((r) =>
      el('tr', {}, el('td', {}, new Date(r.at).toLocaleString(locale())), el('td', {}, r.label || r.mode), el('td', {}, r.score.toLocaleString()), el('td', {}, `${r.accuracy}%`))))),
  ];
}

/** Every user on this computer: total practice time, then the top scores for each mode. */
function ranking() {
  const { profiles, activeId } = loadProfiles();
  const people = profiles.map((p) => ({ ...p, records: loadRecords(p.id) }));
  const all = people.flatMap((p) => p.records);
  const nameCell = (p) => el('td', { class: p.id === activeId ? 'rank-me' : '' }, p.name);
  const byTime = [...people].sort((a, b) => b.records.reduce((s, r) => s + r.ms, 0) - a.records.reduce((s, r) => s + r.ms, 0));
  const rows = modesIn(all).map((mode) => {
    const ranked = people.map((p) => ({ p, score: bestOf(p.records, mode) })).filter((x) => x.score > -Infinity).sort((a, b) => b.score - a.score).slice(0, RANK_SIZE);
    return ranked.length ? el('tr', {}, el('td', {}, modeName(mode, all)), el('td', {}, ranked.map((x, i) =>
      el('span', { class: `rank-chip${x.p.id === activeId ? ' rank-me' : ''}` }, `${i + 1}. ${x.p.name} ${x.score.toLocaleString()}`)))) : null;
  }).filter(Boolean);
  return [
    el('p', { class: 'muted' }, t('rec.rankIntro', { count: people.length })),
    el('h3', {}, t('rec.rankTime')),
    el('table', { class: 'record-table' }, el('tbody', {}, byTime.map((p, i) =>
      el('tr', {}, el('td', {}, `${i + 1}`), nameCell(p), el('td', {}, formatTime(p.records.reduce((s, r) => s + r.ms, 0))), el('td', {}, t('rec.times', { count: p.records.length })))))),
    el('h3', {}, t('rec.rankBest')),
    rows.length ? el('table', { class: 'record-table' }, el('tbody', {}, rows)) : el('p', { class: 'muted' }, t('rec.empty')),
  ];
}

function badges(ctx) {
  const { activeId, profiles } = loadProfiles();
  const name = profiles.find((p) => p.id === activeId)?.name ?? '';
  const stages = loadProfileData(activeId).completedStages;
  const earned = earnedBadges(stages);
  const progress = chapterProgress(stages);
  const badgeCard = (badge) => el('div', { class: 'badge-card' },
    el('div', { class: 'badge-icon' }, badge.icon),
    el('b', {}, badge.title),
    el('span', { class: 'muted' }, badge.detail),
    el('div', { class: 'badge-actions' },
      el('button', { class: 'pill', type: 'button', onclick: () => saveBadgeCard(drawBadgeCard({ badge, name }), `typing-warrior-${badge.id}`) }, t('badge.save')),
      el('button', { class: 'pill', type: 'button', onclick: async () => ctx.toast(t(await copyBadgeCard(drawBadgeCard({ badge, name })) ? 'badge.copied' : 'badge.copyFailed')) }, t('badge.copy')),
    ),
  );
  return [
    el('p', {}, progress.next ? t('badge.progress', { done: progress.done, next: progress.next }) : t('badge.progressAll', { done: progress.done })),
    earned.length ? el('div', { class: 'badge-grid' }, earned.map(badgeCard)) : el('p', { class: 'muted' }, t('badge.none')),
    el('p', { class: 'muted' }, t('badge.howTo')),
  ];
}

export function createRecordsMode(ctx) {
  let tab = 'mine';
  const toolbar = el('div', { class: 'mode-toolbar' });
  const body = el('div', { class: 'records-body' });
  ctx.root.replaceChildren(el('section', { class: 'mode records' }, toolbar, body));

  function reset() {
    const { activeId, profiles } = loadProfiles();
    const name = profiles.find((p) => p.id === activeId)?.name ?? '';
    if (!window.confirm(t('profile.confirmReset', { name }))) return;
    resetProfile(activeId);
    ctx.reloadProfile(); // reopens this screen with the cleared data
  }

  function render() {
    const tabs = [{ value: 'mine', label: t('rec.tabMine') }, { value: 'rank', label: t('rec.tabRank') }, { value: 'badges', label: t('rec.tabBadges') }];
    toolbar.replaceChildren(
      pills(tabs, tab, (value) => { tab = value; render(); }),
      el('button', { class: 'pill danger', type: 'button', tabindex: '-1', onclick: reset }, t('profile.reset')),
    );
    const records = loadRecords();
    body.replaceChildren(...(tab === 'mine' ? myRecords(records) : tab === 'rank' ? ranking() : badges(ctx)));
    ctx.status({ cpm: '-', accuracy: '-', time: formatTime(records.reduce((sum, r) => sum + r.ms, 0)), progress: t('rec.status') });
  }

  ctx.keyboard.highlight(null);
  render();
  return { onKeyDown: () => false, onLangChange() {}, tick() {}, destroy() {}, hidesKeyboard: true };
}

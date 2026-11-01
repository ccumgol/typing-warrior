// API.Bible 창: 내 API 키 입력 → 영어·한국어 역본 목록 → 고른 역본 전권 받기 (진행 상황 표시, 취소 가능).
import { listBibles, downloadBible, REFRESH_DAYS } from '../core/api-bible.js';
import { saveUserBible } from '../core/bible-store.js';
import { getSecret, setSecret } from '../core/secrets.js';
import { t } from '../core/i18n.js';
import { el } from './dom.js';

const KEY_NAME = 'api-bible-key';
const SIGNUP_URL = 'https://scripture.api.bible/';
const ERRORS = { 'api-key': 'api.errKey' };

let openDialog = null;
let cancelled = false;

function close() {
  cancelled = true;
  openDialog?.remove();
  openDialog = null;
}

/** @param {object} ctx app context (toast) @param {(lang: string) => void} onSaved */
export async function openApiBibleDialog(ctx, onSaved) {
  close();
  cancelled = false;
  const backdrop = el('div', { class: 'modal-backdrop', onclick: (e) => { if (e.target === backdrop) close(); } });
  const box = el('div', { class: 'modal profile-modal api-modal', role: 'dialog', 'aria-modal': 'true' });
  backdrop.append(box);
  document.getElementById('modal-root').append(backdrop);
  openDialog = backdrop;

  const keyInput = el('input', { class: 'profile-input', type: 'password', placeholder: t('api.keyPlaceholder'), autocomplete: 'off', value: (await getSecret(KEY_NAME)) ?? '' });
  const status = el('p', { class: 'muted' });
  const list = el('div', { class: 'api-list' });
  const button = (label, onClick, extra = '') => el('button', { class: `pill ${extra}`.trim(), type: 'button', onclick: onClick }, label);
  const fail = (error) => {
    console.warn('API.Bible request failed.', error);
    status.textContent = t(ERRORS[error.message] ?? 'api.errNetwork');
  };

  async function download(bible) {
    list.replaceChildren(button(t('api.cancel'), close, 'danger'));
    try {
      const result = await downloadBible(keyInput.value.trim(), bible, (done, total) => {
        status.textContent = t('api.progress', { name: bible.name, done, total });
        if (cancelled) throw new Error('cancelled');
      });
      if (!(await saveUserBible(bible.language, result))) throw new Error('save');
      ctx.toast(t('api.saved', { name: result.name, days: REFRESH_DAYS }));
      close();
      onSaved(bible.language);
    } catch (error) {
      if (error.message !== 'cancelled') fail(error);
    }
  }

  async function loadList() {
    const key = keyInput.value.trim();
    if (!key) return keyInput.focus();
    status.textContent = t('api.loading');
    try {
      await setSecret(KEY_NAME, key);
      const bibles = await listBibles(key);
      status.textContent = t('api.choose', { count: bibles.length });
      const group = (lang) => bibles.filter((b) => b.language === lang).map((b) =>
        el('div', { class: 'api-row' }, el('span', {}, `${b.name}${b.abbreviation ? ` (${b.abbreviation})` : ''}`), button(t('api.download'), () => download(b))));
      list.replaceChildren(el('h4', {}, t('api.korean')), ...group('ko'), el('h4', {}, t('api.english')), ...group('en'));
    } catch (error) {
      fail(error);
    }
  }

  box.replaceChildren(
    el('div', { class: 'modal-title' }, t('api.title')),
    el('p', {}, t('api.intro'), ' ', el('a', { href: SIGNUP_URL, target: '_blank', rel: 'noopener noreferrer' }, 'scripture.api.bible')),
    el('div', { class: 'profile-row' }, keyInput, button(t('api.list'), loadList)),
    el('p', { class: 'muted' }, t('api.terms', { days: REFRESH_DAYS })),
    status,
    list,
    el('div', { class: 'modal-actions' }, button(t('action.close'), close, 'primary')),
  );
}

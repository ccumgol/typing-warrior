// 사용자 설정 창: 처음 실행할 때(환영)와 새 사용자를 추가할 때 이름, 화면 언어, 연습 언어를 고릅니다.
// 고른 언어는 그 사용자의 설정으로 저장되어, 사용자를 바꾸면 그 사람의 언어로 화면이 바뀝니다.
import { loadProfiles, loadProfileData, saveProfileData, renameProfile, markProfileSetup } from '../core/profiles.js';
import { t, getUiLang, setUiLang } from '../core/i18n.js';
import { el, pills } from './dom.js';

let openDialog = null;

function close() {
  openDialog?.remove();
  openDialog = null;
}

/**
 * @param {{ profileId: string, first?: boolean, onDone: () => void }} options
 *   first: the welcome window on the very first run (it cannot be dismissed without choosing).
 */
export function openProfileSetup({ profileId, first = false, onDone }) {
  close();
  const profile = loadProfiles().profiles.find((p) => p.id === profileId);
  const data = loadProfileData(profileId);
  let uiLang = data.uiLang ?? getUiLang();
  let lang = data.lang;
  const previousUiLang = getUiLang();

  const backdrop = el('div', { class: 'modal-backdrop' });
  const box = el('div', { class: 'modal profile-modal setup-modal', role: 'dialog', 'aria-modal': 'true' });
  backdrop.append(box);
  document.getElementById('modal-root').append(backdrop);
  openDialog = backdrop;

  const name = el('input', { class: 'profile-input', type: 'text', maxlength: '20', value: profile?.name ?? '' });

  function finish() {
    renameProfile(profileId, name.value); // an empty name keeps the current one
    saveProfileData(profileId, { ...loadProfileData(profileId), lang, uiLang });
    markProfileSetup(profileId);
    close();
    onDone();
  }

  function cancel() {
    setUiLang(previousUiLang);
    markProfileSetup(profileId); // keep the defaults; the window does not come back
    close();
    onDone();
  }

  function render() {
    setUiLang(uiLang); // the window speaks the language being chosen
    box.replaceChildren(...[
      el('div', { class: 'modal-title' }, t(first ? 'setup.welcome' : 'setup.title')),
      el('p', { class: 'muted' }, t(first ? 'setup.introFirst' : 'setup.intro')),
      el('label', { class: 'setup-label' }, t('setup.name')),
      name,
      el('label', { class: 'setup-label' }, t('setup.uiLang')),
      pills([{ value: 'ko', label: '한국어' }, { value: 'en', label: 'English' }], uiLang, (value) => { uiLang = value; render(); }),
      el('label', { class: 'setup-label' }, t('setup.lang')),
      pills([{ value: 'ko', label: t('setup.langKo') }, { value: 'en', label: t('setup.langEn') }], lang, (value) => { lang = value; render(); }),
      el('p', { class: 'muted' }, t('setup.later')),
      el('div', { class: 'modal-actions' },
        !first && el('button', { class: 'pill', type: 'button', onclick: cancel }, t('action.close')),
        el('button', { class: 'pill primary active', type: 'button', onclick: finish }, t(first ? 'setup.start' : 'setup.save')),
      ),
    ].filter(Boolean)); // replaceChildren would print a skipped item as the text "false"
  }

  name.addEventListener('keydown', (e) => { if (e.key === 'Enter') finish(); });
  render();
  name.focus();
  name.select();
}

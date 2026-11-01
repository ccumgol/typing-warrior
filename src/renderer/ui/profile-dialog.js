// 사용자 창: 사용자 바꾸기, 새 사용자, 이름 바꾸기, 기록 초기화, 사용자 지우기.
import { loadProfiles, setActiveProfile, addProfile, renameProfile, resetProfile, removeProfile } from '../core/profiles.js';
import { t } from '../core/i18n.js';
import { el } from './dom.js';
import { openProfileSetup } from './profile-setup.js';

let openDialog = null;

export const isProfileDialogOpen = () => Boolean(openDialog);

function close() {
  openDialog?.remove();
  openDialog = null;
  document.removeEventListener('keydown', onEscape, true);
}

function onEscape(event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    close();
  }
}

/** @param {() => void} onChanged called after the active profile or its data changed */
export function openProfileDialog(onChanged) {
  close();
  const backdrop = el('div', { class: 'modal-backdrop', onclick: (e) => { if (e.target === backdrop) close(); } });
  const box = el('div', { class: 'modal profile-modal', role: 'dialog', 'aria-modal': 'true' });
  backdrop.append(box);
  document.getElementById('modal-root').append(backdrop);
  openDialog = backdrop;
  document.addEventListener('keydown', onEscape, true);

  const changed = () => {
    onChanged();
    render();
  };

  const field = (placeholder, value = '') => el('input', { class: 'profile-input', type: 'text', maxlength: '20', placeholder, value });
  const button = (label, onClick, extra = '') => el('button', { class: `pill ${extra}`.trim(), type: 'button', onclick: onClick }, label);

  function render() {
    const { activeId, profiles } = loadProfiles();
    const current = profiles.find((p) => p.id === activeId);
    const newName = field(t('profile.newPlaceholder'));
    const rename = field(t('profile.renamePlaceholder'), current.name);
    const add = () => {
      const id = addProfile(newName.value);
      if (!id) return newName.focus();
      close();
      onChanged();
      return openProfileSetup({ profileId: id, onDone: onChanged }); // choose the new user's languages
    };
    newName.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
    box.replaceChildren(
      el('div', { class: 'modal-title' }, t('profile.title')),
      el('p', { class: 'muted' }, t('profile.intro')),
      el('div', { class: 'profile-list' }, profiles.map((p) =>
        button(p.id === activeId ? `✓ ${p.name}` : p.name, () => { setActiveProfile(p.id); changed(); }, p.id === activeId ? 'active' : ''))),
      el('div', { class: 'profile-row' }, newName, button(t('profile.add'), add)),
      el('h4', {}, t('profile.current', { name: current.name })),
      el('div', { class: 'profile-row' }, rename, button(t('profile.rename'), () => { if (renameProfile(activeId, rename.value)) changed(); })),
      el('div', { class: 'profile-row' },
        button(t('profile.reset'), () => { if (window.confirm(t('profile.confirmReset', { name: current.name }))) { resetProfile(activeId); changed(); } }, 'danger'),
        profiles.length > 1 && button(t('profile.remove'), () => { if (window.confirm(t('profile.confirmRemove', { name: current.name }))) { removeProfile(activeId); changed(); } }, 'danger'),
      ),
      el('div', { class: 'modal-actions' }, button(t('action.close'), close, 'primary')),
    );
  }

  render();
}

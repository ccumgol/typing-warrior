// App shell: navigation, settings, theme, fullscreen, status bar and key routing.
import { loadSettings, saveSettings } from './core/storage.js';
import { isLangToggle } from './core/typing-input.js';
import { setSoundEnabled } from './core/sound.js';
import { t, setUiLang, getUiLang, detectUiLang } from './core/i18n.js';
import { el } from './ui/dom.js';
import { createKeyboardView } from './ui/keyboard-view.js';
import { isModalOpen, closeModal } from './ui/result-modal.js';
import { createJamoMode } from './modes/jamo.js';
import { createWordsMode } from './modes/words.js';
import { createSentencesMode } from './modes/sentences.js';
import { createLongTextMode } from './modes/long-text.js';
import { createAcidRainMode } from './modes/acid-rain.js';
import { createShooterMode } from './modes/shooter.js';
import { createShortcutsMode } from './modes/shortcuts.js';
import { createRecordsMode } from './modes/records.js';

const MODES = Object.freeze([
  { id: 'jamo', create: createJamoMode, keyboard: true },
  { id: 'words', create: createWordsMode, keyboard: true },
  { id: 'sentences', create: createSentencesMode, keyboard: true, fixedLang: true },
  { id: 'longtext', create: createLongTextMode, keyboard: true, fixedLang: true },
  { id: 'acid', create: createAcidRainMode, keyboard: false },
  { id: 'shooter', create: createShooterMode, keyboard: false },
  { id: 'shortcuts', create: createShortcutsMode, keyboard: true, fixedLang: true },
  { id: 'records', create: createRecordsMode, keyboard: false },
]);

const $ = (id) => document.getElementById(id);
const desktop = window.desktop; // undefined when opened in a plain browser
const platform = /Mac/i.test(navigator.userAgent) ? 'mac' : 'win';

let settings = loadSettings();
let activeDef = MODES[0];
let active = null;
let isFullscreen = false;

const keyboard = createKeyboardView($('keyboard-dock'), { platform });

function updateSettings(patch) {
  settings = Object.freeze({ ...settings, ...patch });
  saveSettings(settings);
  applySettings();
  active?.onSettingsChange?.(settings);
}

function applySettings() {
  document.documentElement.dataset.theme = settings.theme;
  setUiLang(settings.uiLang ?? detectUiLang(navigator.language));
  document.documentElement.lang = getUiLang();
  document.documentElement.style.setProperty('--game-scale', String(settings.gameTextScale));
  setSoundEnabled(settings.sound);
  const dock = $('keyboard-dock');
  dock.hidden = !(settings.showKeyboard && activeDef.keyboard);
  dock.classList.toggle('fingers-on', settings.showFingers);
  renderTools();
}

function toast(message) {
  const node = el('div', { class: 'toast' }, message);
  $('toast-root').append(node);
  setTimeout(() => node.remove(), 2200);
}

function renderStatus({ cpm, accuracy, time, progress }) {
  const item = (label, value) => el('span', { class: 'st' }, el('em', {}, label), el('b', {}, value));
  $('statusbar').replaceChildren(
    el('div', { class: 'st-group' }, item(t('status.cpm'), cpm), item(t('status.accuracy'), typeof accuracy === 'number' ? `${accuracy}%` : accuracy), item(t('status.time'), time), item(t('status.progress'), progress)),
    el('div', { class: 'st-help' }, t('status.help')),
  );
}

const iconButton = (label, title, active, onClick) =>
  el('button', { class: `tool${active ? ' active' : ''}`, type: 'button', title, tabindex: '-1', onclick: onClick }, label);

function renderTools() {
  $('tools').replaceChildren(
    iconButton(`🌐 ${getUiLang().toUpperCase()}`, t('tool.uiLang'), false, toggleUiLang),
    iconButton(settings.lang === 'ko' ? '한' : 'EN', t('tool.practiceLang'), false, toggleLang),
    iconButton('⌨', t('tool.keyboard'), settings.showKeyboard, () => updateSettings({ showKeyboard: !settings.showKeyboard })),
    iconButton('🖐', t('tool.fingers'), settings.showFingers, () => updateSettings({ showFingers: !settings.showFingers })),
    iconButton(settings.sound ? '🔊' : '🔇', t('tool.sound'), settings.sound, () => updateSettings({ sound: !settings.sound })),
    iconButton(settings.theme === 'dark' ? '🌙' : '☀️', t('tool.theme'), false, () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })),
    iconButton(isFullscreen ? '🗗' : '⛶', t('tool.fullscreen'), isFullscreen, toggleFullscreen),
  );
}

function renderNav() {
  $('mode-nav').replaceChildren(
    ...MODES.map((def) => el('button', { class: `nav-item${def === activeDef ? ' active' : ''}`, type: 'button', tabindex: '-1', onclick: () => switchMode(def) }, t(`mode.${def.id}`))),
  );
}

function toggleLang() {
  closeModal();
  updateSettings({ lang: settings.lang === 'ko' ? 'en' : 'ko' });
  if (!activeDef.fixedLang) keyboard.setLang(settings.lang);
  active?.onLangChange(settings.lang);
  toast(t(settings.lang === 'ko' ? 'toast.practiceKo' : 'toast.practiceEn'));
}

/** Display language is separate from the practice language; rebuild the screen in the new language. */
function toggleUiLang() {
  closeModal();
  updateSettings({ uiLang: getUiLang() === 'ko' ? 'en' : 'ko' });
  switchMode(activeDef);
  toast(t('toast.uiLang'));
}

async function toggleFullscreen() {
  try {
    if (desktop) {
      isFullscreen = await desktop.toggleFullscreen();
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch (error) {
    console.warn('Fullscreen toggle failed.', error);
    toast(t('toast.fullscreenFail'));
  }
  renderTools();
}

const ctx = {
  root: $('stage'),
  keyboard,
  platform,
  settings: () => settings,
  updateSettings,
  status: renderStatus,
  toast,
  setKeyboardLang: (lang) => keyboard.setLang(lang),
  markStageDone(id) {
    if (!settings.completedStages.includes(id)) updateSettings({ completedStages: [...settings.completedStages, id] });
  },
};

function switchMode(def) {
  closeModal(); // its actions belong to the mode being destroyed
  active?.destroy();
  activeDef = def;
  keyboard.setLang(settings.lang);
  keyboard.highlight(null);
  renderNav();
  applySettings();
  active = def.create(ctx);
}

const ALWAYS_PREVENT = new Set(['Space', 'Tab', 'Backspace', 'Quote', 'Slash']);

function onKeyDown(event) {
  if (isModalOpen()) return;
  if (event.code === 'F2') return updateSettings({ showKeyboard: !settings.showKeyboard });
  if (event.code === 'F3') return updateSettings({ showFingers: !settings.showFingers });
  if (event.code === 'F11' && !desktop) return toggleFullscreen();
  if (!active) return;
  if (!active.capturesAllKeys && !activeDef.fixedLang && isLangToggle(event)) {
    event.preventDefault();
    return toggleLang();
  }
  const handled = active.onKeyDown(event);
  if (handled || ALWAYS_PREVENT.has(event.code)) event.preventDefault();
}

document.addEventListener('keydown', onKeyDown);
// Keep keyboard focus off buttons so Space/Enter always go to typing.
document.addEventListener('mousedown', (event) => {
  if (event.target.closest('button')) event.preventDefault();
});
document.addEventListener('fullscreenchange', () => {
  isFullscreen = Boolean(document.fullscreenElement);
  renderTools();
});
desktop?.onFullscreenChange((value) => {
  isFullscreen = value;
  renderTools();
});
setInterval(() => active?.tick(), 500);

renderStatus({ cpm: 0, accuracy: 100, time: '00:00', progress: '-' });
switchMode(MODES[0]);

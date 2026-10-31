// App shell: navigation, settings, theme, fullscreen, status bar and key routing.
import { loadSettings, saveSettings } from './core/storage.js';
import { isLangToggle } from './core/typing-input.js';
import { setSoundEnabled, setSoundPack } from './core/sound.js';
import { el } from './ui/dom.js';
import { createKeyboardView } from './ui/keyboard-view.js';
import { isModalOpen, closeModal } from './ui/result-modal.js';
import { createJamoMode } from './modes/jamo.js';
import { createWordsMode } from './modes/words.js';
import { createSentencesMode } from './modes/sentences.js';
import { createAcidRainMode } from './modes/acid-rain.js';
import { createShooterMode } from './modes/shooter.js';
import { createShortcutsMode } from './modes/shortcuts.js';
import { createRecordsMode } from './modes/records.js';

const MODES = Object.freeze([
  { id: 'jamo', label: '자리 연습', create: createJamoMode, keyboard: true },
  { id: 'words', label: '단어', create: createWordsMode, keyboard: true },
  { id: 'sentences', label: '문장', create: createSentencesMode, keyboard: true, fixedLang: true },
  { id: 'acid', label: '☔ 산성비', create: createAcidRainMode, keyboard: false },
  { id: 'shooter', label: '🎖️ 전선 작전', create: createShooterMode, keyboard: false },
  { id: 'shortcuts', label: '단축키', create: createShortcutsMode, keyboard: true },
  { id: 'records', label: '📊 기록', create: createRecordsMode, keyboard: false },
]);

const $ = (id) => document.getElementById(id);
const desktop = window.desktop; // undefined when opened in a plain browser
const platform = /Mac/i.test(navigator.userAgent) ? 'mac' : 'win';

let settings = loadSettings();
let activeDef = MODES[0];
let active = null;
let isFullscreen = false;

const keyboard = createKeyboardView($('keyboard-dock'));

function updateSettings(patch) {
  settings = Object.freeze({ ...settings, ...patch });
  saveSettings(settings);
  applySettings();
}

function applySettings() {
  document.documentElement.dataset.theme = settings.theme;
  document.documentElement.style.setProperty('--game-scale', String(settings.gameTextScale));
  setSoundEnabled(settings.sound);
  setSoundPack(settings.soundPack);
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
    el('div', { class: 'st-group' }, item('타수', cpm), item('정확도', typeof accuracy === 'number' ? `${accuracy}%` : accuracy), item('시간', time), item('진행', progress)),
    el('div', { class: 'st-help' }, 'F2 키보드 · F3 손가락 · Shift+Space 한/영 · F11 전체화면 · Esc 일시정지'),
  );
}

const iconButton = (label, title, active, onClick) =>
  el('button', { class: `tool${active ? ' active' : ''}`, type: 'button', title, tabindex: '-1', onclick: onClick }, label);

function renderTools() {
  $('tools').replaceChildren(
    iconButton(settings.lang === 'ko' ? '한' : 'EN', '한/영 전환 (Shift+Space)', false, toggleLang),
    iconButton('⌨', '키보드 보이기/감추기 (F2)', settings.showKeyboard, () => updateSettings({ showKeyboard: !settings.showKeyboard })),
    iconButton('🖐', '손가락 색상 (F3)', settings.showFingers, () => updateSettings({ showFingers: !settings.showFingers })),
    iconButton(settings.sound ? '🔊' : '🔇', '효과음', settings.sound, () => updateSettings({ sound: !settings.sound })),
    iconButton(settings.theme === 'dark' ? '🌙' : '☀️', '라이트/다크 모드', false, () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })),
    iconButton(isFullscreen ? '🗗' : '⛶', '전체화면/창 모드 (F11)', isFullscreen, toggleFullscreen),
  );
}

function renderNav() {
  $('mode-nav').replaceChildren(
    ...MODES.map((def) => el('button', { class: `nav-item${def === activeDef ? ' active' : ''}`, type: 'button', tabindex: '-1', onclick: () => switchMode(def) }, def.label)),
  );
}

function toggleLang() {
  closeModal();
  updateSettings({ lang: settings.lang === 'ko' ? 'en' : 'ko' });
  if (!activeDef.fixedLang) keyboard.setLang(settings.lang);
  active?.onLangChange(settings.lang);
  toast(settings.lang === 'ko' ? '한글 모드' : 'English mode');
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
    toast('전체화면 전환에 실패했어요');
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

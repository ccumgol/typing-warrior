// 맥/윈도우 기본 단축키. combo 형식: "Meta+Shift+KeyZ" (KeyboardEvent.code 기준).
// category: 화면 문구 키(sc.cat.<id>), action: { ko, en } 표시 이름. level: 연습 단계(1~3). system: true 인 항목은 운영체제가 가로채므로 직접 누르는 연습 대신 참고표로만 보여줍니다.

const s = (level, category, action, mac, win, system = false) => Object.freeze({ level, category, action, mac, win, system });

// 연습 단계: 자주 쓰는 기본 → 문서·브라우저 → 텍스트 이동(조합이 긴 것). 제목은 화면 문구 사전(sc-1 …)에 있습니다.
export const SHORTCUT_STAGES = Object.freeze([
  Object.freeze({ id: 'sc-1', level: 1 }),
  Object.freeze({ id: 'sc-2', level: 2 }),
  Object.freeze({ id: 'sc-3', level: 3 }),
]);

export const SHORTCUTS = Object.freeze([
  s(1, 'edit', { ko: '복사하기', en: 'Copy' }, 'Meta+KeyC', 'Control+KeyC'),
  s(1, 'edit', { ko: '붙여넣기', en: 'Paste' }, 'Meta+KeyV', 'Control+KeyV'),
  s(1, 'edit', { ko: '잘라내기', en: 'Cut' }, 'Meta+KeyX', 'Control+KeyX'),
  s(1, 'edit', { ko: '실행 취소', en: 'Undo' }, 'Meta+KeyZ', 'Control+KeyZ'),
  s(1, 'edit', { ko: '다시 실행', en: 'Redo' }, 'Meta+Shift+KeyZ', 'Control+KeyY'),
  s(1, 'edit', { ko: '모두 선택', en: 'Select all' }, 'Meta+KeyA', 'Control+KeyA'),
  s(1, 'edit', { ko: '찾기', en: 'Find' }, 'Meta+KeyF', 'Control+KeyF'),
  s(2, 'edit', { ko: '굵게', en: 'Bold' }, 'Meta+KeyB', 'Control+KeyB'),
  s(2, 'edit', { ko: '기울임꼴', en: 'Italic' }, 'Meta+KeyI', 'Control+KeyI'),
  s(2, 'edit', { ko: '밑줄', en: 'Underline' }, 'Meta+KeyU', 'Control+KeyU'),
  s(3, 'edit', { ko: '서식 없이 붙여넣기', en: 'Paste without formatting' }, 'Meta+Alt+Shift+KeyV', 'Control+Shift+KeyV'),
  s(1, 'file', { ko: '저장하기', en: 'Save' }, 'Meta+KeyS', 'Control+KeyS'),
  s(2, 'file', { ko: '다른 이름으로 저장', en: 'Save as' }, 'Meta+Shift+KeyS', 'Control+Shift+KeyS'),
  s(2, 'file', { ko: '열기', en: 'Open' }, 'Meta+KeyO', 'Control+KeyO'),
  s(2, 'file', { ko: '새로 만들기', en: 'New' }, 'Meta+KeyN', 'Control+KeyN'),
  s(2, 'file', { ko: '인쇄하기', en: 'Print' }, 'Meta+KeyP', 'Control+KeyP'),
  s(3, 'move', { ko: '줄의 처음으로', en: 'Start of line' }, 'Meta+ArrowLeft', 'Home'),
  s(3, 'move', { ko: '줄의 끝으로', en: 'End of line' }, 'Meta+ArrowRight', 'End'),
  s(3, 'move', { ko: '문서의 처음으로', en: 'Start of document' }, 'Meta+ArrowUp', 'Control+Home'),
  s(3, 'move', { ko: '문서의 끝으로', en: 'End of document' }, 'Meta+ArrowDown', 'Control+End'),
  s(3, 'move', { ko: '이전 단어로', en: 'Previous word' }, 'Alt+ArrowLeft', 'Control+ArrowLeft'),
  s(3, 'move', { ko: '다음 단어로', en: 'Next word' }, 'Alt+ArrowRight', 'Control+ArrowRight'),
  s(3, 'move', { ko: '단어 단위로 선택', en: 'Select by word' }, 'Alt+Shift+ArrowRight', 'Control+Shift+ArrowRight'),
  s(3, 'move', { ko: '앞 단어 지우기', en: 'Delete previous word' }, 'Alt+Backspace', 'Control+Backspace'),
  s(2, 'browser', { ko: '새 탭 열기', en: 'New tab' }, 'Meta+KeyT', 'Control+KeyT'),
  s(2, 'browser', { ko: '닫은 탭 다시 열기', en: 'Reopen closed tab' }, 'Meta+Shift+KeyT', 'Control+Shift+KeyT'),
  s(2, 'browser', { ko: '주소창으로 이동', en: 'Go to address bar' }, 'Meta+KeyL', 'Control+KeyL'),
  s(2, 'browser', { ko: '새로고침', en: 'Reload' }, 'Meta+KeyR', 'F5'),
  s(2, 'browser', { ko: '확대', en: 'Zoom in' }, 'Meta+Equal', 'Control+Equal'),
  s(2, 'browser', { ko: '축소', en: 'Zoom out' }, 'Meta+Minus', 'Control+Minus'),
  s(2, 'browser', { ko: '다음 탭', en: 'Next tab' }, 'Control+Tab', 'Control+Tab'),
  s(2, 'system', { ko: '앱/창 닫기', en: 'Close app/window' }, 'Meta+KeyW', 'Control+KeyW', true),
  s(2, 'system', { ko: '프로그램 종료', en: 'Quit app' }, 'Meta+KeyQ', 'Alt+F4', true),
  s(2, 'system', { ko: '앱 전환', en: 'Switch apps' }, 'Meta+Tab', 'Alt+Tab', true),
  s(2, 'system', { ko: '검색 (Spotlight/시작 검색)', en: 'Search (Spotlight/Start)' }, 'Meta+Space', 'Meta+KeyS', true),
  s(2, 'system', { ko: '화면 캡처', en: 'Screenshot' }, 'Meta+Shift+Digit4', 'Meta+Shift+KeyS', true),
  s(2, 'system', { ko: '화면 잠금', en: 'Lock screen' }, 'Control+Meta+KeyQ', 'Meta+KeyL', true),
  s(2, 'system', { ko: '바탕화면 보기', en: 'Show desktop' }, 'F11', 'Meta+KeyD', true),
  s(2, 'system', { ko: '파일 탐색기 / Finder 열기', en: 'Open File Explorer / Finder' }, 'Meta+Alt+Space', 'Meta+KeyE', true),
  s(2, 'system', { ko: '작업 관리자 / 강제 종료', en: 'Task Manager / Force Quit' }, 'Meta+Alt+Escape', 'Control+Shift+Escape', true),
  s(2, 'system', { ko: '입력 언어 전환 (한/영)', en: 'Switch input language (한/영)' }, 'Control+Space', 'Alt+Shift', true),
]);

const MAC_SYMBOLS = { Meta: '⌘', Control: '⌃', Alt: '⌥', Shift: '⇧' };
const WIN_NAMES = { Meta: 'Win', Control: 'Ctrl', Alt: 'Alt', Shift: 'Shift' };
const KEY_NAMES = {
  ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Backspace: '⌫',
  Equal: '=', Minus: '-', Space: 'Space', Tab: 'Tab', Escape: 'Esc', Home: 'Home', End: 'End',
};

/** Human readable labels for a combo, e.g. ["⌘", "⇧", "Z"]. */
export function comboLabels(combo, platform) {
  return combo.split('+').map((part) => {
    if (MAC_SYMBOLS[part]) return platform === 'mac' ? MAC_SYMBOLS[part] : WIN_NAMES[part];
    if (KEY_NAMES[part]) return KEY_NAMES[part];
    return part.replace(/^Key/, '').replace(/^Digit/, '');
  });
}

const MODIFIERS = ['Meta', 'Control', 'Alt', 'Shift'];

/** Does this keyboard event match the combo exactly? */
/**
 * Practising macOS shortcuts on a Windows keyboard: the keys keep the Mac's left-to-right order,
 * so control = Ctrl, option = Win, command = Alt.
 */
const MAC_ON_WINDOWS = { Control: 'Control', Alt: 'Meta', Meta: 'Alt', Shift: 'Shift' };

export function matchesCombo(combo, event, { macOnWindows = false } = {}) {
  const parts = combo.split('+');
  const key = parts.find((p) => !MODIFIERS.includes(p));
  const wanted = new Set(parts.filter((p) => MODIFIERS.includes(p)).map((p) => (macOnWindows ? MAC_ON_WINDOWS[p] : p)));
  const pressed = { Meta: event.metaKey, Control: event.ctrlKey, Alt: event.altKey, Shift: event.shiftKey };
  return event.code === key && MODIFIERS.every((m) => pressed[m] === wanted.has(m));
}

/**
 * Physical keys to light up for a combo. Shortcuts are usually pressed with the left hand
 * holding the modifiers, so modifiers always use the left-hand keys.
 */
export function comboCodes(combo, { macOnWindows = false } = {}) {
  return combo.split('+').map((p) => (MODIFIERS.includes(p) ? `${macOnWindows ? MAC_ON_WINDOWS[p] : p}Left` : p));
}

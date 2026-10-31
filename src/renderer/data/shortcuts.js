// 맥/윈도우 기본 단축키. combo 형식: "Meta+Shift+KeyZ" (KeyboardEvent.code 기준).
// level: 연습 단계(1~3). system: true 인 항목은 운영체제가 가로채므로 직접 누르는 연습 대신 참고표로만 보여줍니다.

import { getKey } from '../core/keyboard-layout.js';

const s = (level, category, action, mac, win, system = false) => Object.freeze({ level, category, action, mac, win, system });

// 연습 단계: 자주 쓰는 기본 → 문서·브라우저 → 텍스트 이동(조합이 긴 것)
export const SHORTCUT_STAGES = Object.freeze([
  Object.freeze({ id: 'sc-1', level: 1, title: '1단계 기본', desc: '복사·붙여넣기·실행 취소처럼 매일 쓰는 단축키' }),
  Object.freeze({ id: 'sc-2', level: 2, title: '2단계 문서·브라우저', desc: '파일 저장·열기, 글자 꾸미기, 브라우저 탭 다루기' }),
  Object.freeze({ id: 'sc-3', level: 3, title: '3단계 텍스트 이동', desc: '방향키와 함께 커서를 빠르게 옮기고 선택하기' }),
]);

export const SHORTCUTS = Object.freeze([
  s(1, '편집', '복사하기', 'Meta+KeyC', 'Control+KeyC'),
  s(1, '편집', '붙여넣기', 'Meta+KeyV', 'Control+KeyV'),
  s(1, '편집', '잘라내기', 'Meta+KeyX', 'Control+KeyX'),
  s(1, '편집', '실행 취소', 'Meta+KeyZ', 'Control+KeyZ'),
  s(1, '편집', '다시 실행', 'Meta+Shift+KeyZ', 'Control+KeyY'),
  s(1, '편집', '모두 선택', 'Meta+KeyA', 'Control+KeyA'),
  s(1, '편집', '찾기', 'Meta+KeyF', 'Control+KeyF'),
  s(2, '편집', '굵게', 'Meta+KeyB', 'Control+KeyB'),
  s(2, '편집', '기울임꼴', 'Meta+KeyI', 'Control+KeyI'),
  s(2, '편집', '밑줄', 'Meta+KeyU', 'Control+KeyU'),
  s(3, '편집', '서식 없이 붙여넣기', 'Meta+Alt+Shift+KeyV', 'Control+Shift+KeyV'),
  s(1, '파일', '저장하기', 'Meta+KeyS', 'Control+KeyS'),
  s(2, '파일', '다른 이름으로 저장', 'Meta+Shift+KeyS', 'Control+Shift+KeyS'),
  s(2, '파일', '열기', 'Meta+KeyO', 'Control+KeyO'),
  s(2, '파일', '새로 만들기', 'Meta+KeyN', 'Control+KeyN'),
  s(2, '파일', '인쇄하기', 'Meta+KeyP', 'Control+KeyP'),
  s(3, '텍스트 이동', '줄의 처음으로', 'Meta+ArrowLeft', 'Home'),
  s(3, '텍스트 이동', '줄의 끝으로', 'Meta+ArrowRight', 'End'),
  s(3, '텍스트 이동', '문서의 처음으로', 'Meta+ArrowUp', 'Control+Home'),
  s(3, '텍스트 이동', '문서의 끝으로', 'Meta+ArrowDown', 'Control+End'),
  s(3, '텍스트 이동', '이전 단어로', 'Alt+ArrowLeft', 'Control+ArrowLeft'),
  s(3, '텍스트 이동', '다음 단어로', 'Alt+ArrowRight', 'Control+ArrowRight'),
  s(3, '텍스트 이동', '단어 단위로 선택', 'Alt+Shift+ArrowRight', 'Control+Shift+ArrowRight'),
  s(3, '텍스트 이동', '앞 단어 지우기', 'Alt+Backspace', 'Control+Backspace'),
  s(2, '브라우저', '새 탭 열기', 'Meta+KeyT', 'Control+KeyT'),
  s(2, '브라우저', '닫은 탭 다시 열기', 'Meta+Shift+KeyT', 'Control+Shift+KeyT'),
  s(2, '브라우저', '주소창으로 이동', 'Meta+KeyL', 'Control+KeyL'),
  s(2, '브라우저', '새로고침', 'Meta+KeyR', 'F5'),
  s(2, '브라우저', '확대', 'Meta+Equal', 'Control+Equal'),
  s(2, '브라우저', '축소', 'Meta+Minus', 'Control+Minus'),
  s(2, '브라우저', '다음 탭', 'Control+Tab', 'Control+Tab'),
  s(2, '시스템', '앱/창 닫기', 'Meta+KeyW', 'Control+KeyW', true),
  s(2, '시스템', '프로그램 종료', 'Meta+KeyQ', 'Alt+F4', true),
  s(2, '시스템', '앱 전환', 'Meta+Tab', 'Alt+Tab', true),
  s(2, '시스템', '검색 (Spotlight/시작 검색)', 'Meta+Space', 'Meta+KeyS', true),
  s(2, '시스템', '화면 캡처', 'Meta+Shift+Digit4', 'Meta+Shift+KeyS', true),
  s(2, '시스템', '화면 잠금', 'Control+Meta+KeyQ', 'Meta+KeyL', true),
  s(2, '시스템', '바탕화면 보기', 'F11', 'Meta+KeyD', true),
  s(2, '시스템', '파일 탐색기 / Finder 열기', 'Meta+Alt+Space', 'Meta+KeyE', true),
  s(2, '시스템', '작업 관리자 / 강제 종료', 'Meta+Alt+Escape', 'Control+Shift+Escape', true),
  s(2, '시스템', '입력 언어 전환 (한/영)', 'Control+Space', 'Alt+Shift', true),
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
export function matchesCombo(combo, event) {
  const parts = combo.split('+');
  const key = parts.find((p) => !MODIFIERS.includes(p));
  const wanted = new Set(parts.filter((p) => MODIFIERS.includes(p)));
  const pressed = { Meta: event.metaKey, Control: event.ctrlKey, Alt: event.altKey, Shift: event.shiftKey };
  return event.code === key && MODIFIERS.every((m) => pressed[m] === wanted.has(m));
}

/**
 * Physical keys to light up for a combo. Modifiers go on the hand opposite the main key,
 * except where the platform has no right-hand key (Mac keyboards have only a left control).
 */
export function comboCodes(combo, platform) {
  const parts = combo.split('+');
  const key = parts.find((p) => !MODIFIERS.includes(p));
  const side = getKey(key)?.finger.startsWith('L') ? 'Right' : 'Left';
  const leftOnly = platform === 'mac' ? ['Control'] : [];
  return parts.map((p) => (MODIFIERS.includes(p) ? `${p}${leftOnly.includes(p) ? 'Left' : side}` : p));
}

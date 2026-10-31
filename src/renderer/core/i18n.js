// Display (UI) language, kept separate from the practice language.
// t('key', { name: value }) looks up the current UI dictionary and fills {name} placeholders.
import { KO } from '../i18n/ko.js';
import { EN } from '../i18n/en.js';

export const UI_LANGS = Object.freeze(['ko', 'en']);
const DICTS = Object.freeze({ ko: KO, en: EN });

let current = 'ko';

export const getUiLang = () => current;

export function setUiLang(lang) {
  current = UI_LANGS.includes(lang) ? lang : 'ko';
}

/** Best guess for first launch: Korean systems get Korean, everyone else English. */
export const detectUiLang = (locale = '') => (/^ko\b/i.test(locale) ? 'ko' : 'en');

export function t(key, params = {}) {
  const text = DICTS[current][key] ?? KO[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
}

/** Pick the current language from a bilingual value such as { ko: '복사하기', en: 'Copy' }. */
export const loc = (value) => (typeof value === 'string' ? value : value[current] ?? value.ko);

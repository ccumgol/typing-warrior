// Persists settings and practice records in localStorage, validating what it reads back.

const SETTINGS_KEY = 'tw.settings.v1';
const RECORDS_KEY = 'tw.records.v1';
const MAX_HISTORY = 200;

/** Text size multipliers offered for the games. */
export const GAME_TEXT_SCALES = Object.freeze([1, 1.25, 1.5, 1.75, 2]);

export const DEFAULT_SETTINGS = Object.freeze({
  theme: 'dark',
  lang: 'ko', // practice language
  uiLang: null, // display language; null = follow the system language
  showKeyboard: true,
  showFingers: true,
  sound: true,
  gameTextScale: 1.25,
  soundPack: 'classic',
  shooterSoundPack: 'warzone',
  shortcutPlatform: null,
  acidMode: 'endless', // 산성비: endless | stage
  acidCleared: 0, // highest 산성비 stage level cleared
  longTextProgress: {}, // 긴 글: { psalms: { chapter, verse }, 'psalms-kjv': … }
  longTextId: 'psalms', // 긴 글: last text practiced
  completedStages: [],
});

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn(`Could not read ${key}, using defaults.`, error);
    return null;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Could not save ${key}.`, error);
    return false;
  }
}

const isPosInt = (v) => Number.isInteger(v) && v >= 0;
const isProgress = (v) =>
  Boolean(v) && typeof v === 'object' && !Array.isArray(v) &&
  Object.values(v).every((p) => p && isPosInt(p.chapter) && p.chapter >= 1 && isPosInt(p.verse));

export function loadSettings() {
  const stored = readJson(SETTINGS_KEY);
  if (!stored || typeof stored !== 'object') return DEFAULT_SETTINGS;
  const pick = (name, valid) => (valid(stored[name]) ? stored[name] : DEFAULT_SETTINGS[name]);
  const isBool = (v) => typeof v === 'boolean';
  return Object.freeze({
    theme: pick('theme', (v) => v === 'light' || v === 'dark'),
    lang: pick('lang', (v) => v === 'ko' || v === 'en'),
    uiLang: pick('uiLang', (v) => v === 'ko' || v === 'en'),
    showKeyboard: pick('showKeyboard', isBool),
    showFingers: pick('showFingers', isBool),
    sound: pick('sound', isBool),
    gameTextScale: pick('gameTextScale', (v) => GAME_TEXT_SCALES.includes(v)),
    soundPack: pick('soundPack', (v) => ['calm', 'classic', 'dopamine'].includes(v)),
    shooterSoundPack: pick('shooterSoundPack', (v) => ['calm', 'classic', 'dopamine', 'warzone'].includes(v)),
    shortcutPlatform: pick('shortcutPlatform', (v) => v === 'mac' || v === 'win'),
    acidMode: pick('acidMode', (v) => v === 'endless' || v === 'stage'),
    longTextProgress: pick('longTextProgress', isProgress),
    longTextId: pick('longTextId', (v) => typeof v === 'string' && /^[a-z0-9-]{1,40}$/.test(v)),
    acidCleared: pick('acidCleared', (v) => Number.isInteger(v) && v >= 0 && v <= 100),
    completedStages: pick('completedStages', (v) => Array.isArray(v) && v.every((s) => typeof s === 'string')),
  });
}

export const saveSettings = (settings) => writeJson(SETTINGS_KEY, settings);

const isRecord = (r) =>
  r && typeof r.mode === 'string' && Number.isFinite(r.score) && Number.isFinite(r.at) && Number.isFinite(r.ms);

export function loadRecords() {
  const stored = readJson(RECORDS_KEY);
  return Array.isArray(stored) ? stored.filter(isRecord) : [];
}

/**
 * Store a finished session. Returns { records, isBest }.
 * @param {{mode:string, label:string, score:number, accuracy:number, ms:number}} entry
 */
export function addRecord(entry) {
  const records = loadRecords();
  const record = Object.freeze({ ...entry, at: Date.now() });
  const previousBest = records
    .filter((r) => r.mode === entry.mode)
    .reduce((best, r) => Math.max(best, r.score), 0);
  const next = [record, ...records].slice(0, MAX_HISTORY);
  writeJson(RECORDS_KEY, next);
  return { records: next, isBest: entry.score > previousBest };
}

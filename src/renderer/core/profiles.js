// 사용자(프로필): 한 컴퓨터에서 여러 사람이 각자 기록과 진행 상황을 따로 갖습니다. 모두 이 컴퓨터의 localStorage에만 저장합니다.
// 앱 설정(테마, 효과음 등)은 함께 쓰고, PROFILE_KEYS에 있는 값만 사용자마다 따로 저장합니다.

const PROFILES_KEY = 'tw.profiles.v1';
const LEGACY_RECORDS_KEY = 'tw.records.v1';
const LEGACY_SETTINGS_KEY = 'tw.settings.v1';
const MAX_NAME = 20;

export const PROFILE_KEYS = Object.freeze(['lang', 'uiLang', 'completedStages', 'longTextProgress', 'longTextId', 'acidCleared']);
// uiLang null = follow the operating system's language
export const PROFILE_DEFAULTS = Object.freeze({ lang: 'ko', uiLang: null, completedStages: [], longTextProgress: {}, longTextId: 'bible-ko', acidCleared: 0 });

export const recordsKey = (id) => `tw.records.${id}`;
const dataKey = (id) => `tw.profile.${id}`;

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn(`Could not read ${key}.`, error);
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Could not save ${key}.`, error);
    return false;
  }
}

const isPosInt = (v) => Number.isInteger(v) && v >= 0;
const isLang = (v) => v === 'ko' || v === 'en';
const VALID = {
  lang: isLang,
  uiLang: (v) => v === null || isLang(v),
  completedStages: (v) => Array.isArray(v) && v.every((s) => typeof s === 'string'),
  longTextProgress: (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v) &&
    Object.values(v).every((p) => p && isPosInt(p.chapter) && p.chapter >= 1 && isPosInt(p.verse)),
  longTextId: (v) => typeof v === 'string' && /^[a-z0-9-]{1,40}$/.test(v),
  acidCleared: (v) => isPosInt(v) && v <= 100,
};

/**
 * Keep only valid per-profile values. Missing values come from `fallback` (e.g. the app-wide settings of an
 * earlier version) and then from the defaults.
 */
export function cleanProfileData(data, fallback = {}) {
  const source = data && typeof data === 'object' ? data : {};
  const pick = (key) => {
    if (key in source && VALID[key](source[key])) return source[key];
    if (fallback && key in fallback && VALID[key](fallback[key])) return fallback[key];
    return PROFILE_DEFAULTS[key];
  };
  return Object.freeze(Object.fromEntries(PROFILE_KEYS.map((key) => [key, pick(key)])));
}

export const cleanName = (name) => String(name ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);

const newId = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** First run: turn the existing records and progress into the first profile. */
function migrate(defaultName) {
  const id = newId();
  const legacySettings = read(LEGACY_SETTINGS_KEY) ?? {};
  write(dataKey(id), cleanProfileData(legacySettings));
  const legacyRecords = read(LEGACY_RECORDS_KEY);
  if (Array.isArray(legacyRecords)) write(recordsKey(id), legacyRecords);
  try {
    localStorage.removeItem(LEGACY_RECORDS_KEY);
  } catch (error) {
    console.warn('Could not remove the old records key.', error);
  }
  const state = { activeId: id, profiles: [{ id, name: defaultName, createdAt: Date.now() }] };
  write(PROFILES_KEY, state);
  return state;
}

const isProfile = (p) => p && typeof p.id === 'string' && typeof p.name === 'string';

/** { activeId, profiles: [{ id, name, createdAt }] } — creates the first profile when there is none. */
export function loadProfiles(defaultName = '나') {
  const stored = read(PROFILES_KEY);
  const profiles = Array.isArray(stored?.profiles) ? stored.profiles.filter(isProfile) : [];
  if (profiles.length === 0) return migrate(defaultName);
  const activeId = profiles.some((p) => p.id === stored.activeId) ? stored.activeId : profiles[0].id;
  return { activeId, profiles };
}

const saveProfiles = (state) => write(PROFILES_KEY, state);

export const loadProfileData = (id, fallback = {}) => cleanProfileData(read(dataKey(id)), fallback);
export const saveProfileData = (id, data) => write(dataKey(id), cleanProfileData(data));

export function setActiveProfile(id) {
  const state = loadProfiles();
  if (state.profiles.some((p) => p.id === id)) saveProfiles({ ...state, activeId: id });
}

/** The welcome / new-user window has been completed for this profile (name and languages chosen). */
export function markProfileSetup(id) {
  const state = loadProfiles();
  return saveProfiles({ ...state, profiles: state.profiles.map((p) => (p.id === id ? { ...p, setup: true } : p)) });
}

/** Adds a profile and makes it active. Returns its id, or null for an empty name. */
export function addProfile(name) {
  const clean = cleanName(name);
  if (!clean) return null;
  const state = loadProfiles();
  const id = newId();
  saveProfiles({ activeId: id, profiles: [...state.profiles, { id, name: clean, createdAt: Date.now() }] });
  return id;
}

export function renameProfile(id, name) {
  const clean = cleanName(name);
  if (!clean) return false;
  const state = loadProfiles();
  return saveProfiles({ ...state, profiles: state.profiles.map((p) => (p.id === id ? { ...p, name: clean } : p)) });
}

/** Clears a profile's records and progress (the profile itself stays). */
export function resetProfile(id) {
  write(recordsKey(id), []);
  write(dataKey(id), PROFILE_DEFAULTS);
}

/** Removes a profile and its data. The last profile cannot be removed. */
export function removeProfile(id) {
  const state = loadProfiles();
  if (state.profiles.length <= 1) return false;
  const profiles = state.profiles.filter((p) => p.id !== id);
  try {
    localStorage.removeItem(recordsKey(id));
    localStorage.removeItem(dataKey(id));
  } catch (error) {
    console.warn('Could not remove profile data.', error);
  }
  return saveProfiles({ activeId: state.activeId === id ? profiles[0].id : state.activeId, profiles });
}

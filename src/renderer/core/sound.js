// Synthesized sound effects (no audio files) in selectable packs:
// calm → classic (arcade) → dopamine, plus warzone for 전선작전게임. Labels live in i18n (pack.<id>).
import { createWarzonePack } from './sound-warzone.js';

export const SOUND_PACKS = Object.freeze([
  { id: 'calm' },
  { id: 'classic' },
  { id: 'dopamine' },
  { id: 'warzone', shooterOnly: true },
]);
export const DEFAULT_PACK = 'classic';

let audio = null;
let master = null;
let noiseBuffer = null;
let enabled = true;
let packId = DEFAULT_PACK;

export const setSoundEnabled = (value) => {
  enabled = value;
};
export const setSoundPack = (id) => {
  packId = SOUND_PACKS.some((p) => p.id === id) ? id : DEFAULT_PACK;
};

function ensureAudio() {
  if (audio) return audio;
  audio = new AudioContext();
  // A compressor keeps stacked effects (dopamine pack) from clipping.
  const compressor = audio.createDynamicsCompressor();
  master = audio.createGain();
  master.gain.value = 0.9;
  master.connect(compressor).connect(audio.destination);
  noiseBuffer = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return audio;
}

/** A pitched note, optionally gliding from f to f2. `at` = delay in seconds. */
export function tone({ f, f2 = f, dur = 0.1, type = 'sine', vol = 0.05, at = 0 }) {
  const start = audio.currentTime + at;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f, start);
  if (f2 !== f) osc.frequency.exponentialRampToValueAtTime(f2, start + dur);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(vol, start + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

/** A filtered noise burst (gunshots, clicks, whooshes). */
export function noise({ dur = 0.1, vol = 0.1, at = 0, filter = 'bandpass', freq = 1200, freq2 = freq, q = 1 }) {
  const start = audio.currentTime + at;
  const src = audio.createBufferSource();
  const biquad = audio.createBiquadFilter();
  const gain = audio.createGain();
  src.buffer = noiseBuffer;
  biquad.type = filter;
  biquad.Q.value = q;
  biquad.frequency.setValueAtTime(freq, start);
  if (freq2 !== freq) biquad.frequency.exponentialRampToValueAtTime(freq2, start + dur);
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(biquad).connect(gain).connect(master);
  src.start(start);
  src.stop(start + dur + 0.02);
}

const notes = (freqs, { gap = 0.08, ...opts }) => freqs.forEach((f, i) => tone({ ...opts, f, at: (opts.at || 0) + i * gap }));
const semitone = (base, steps) => base * 2 ** (steps / 12);

const PACKS = {
  warzone: createWarzonePack({ tone, noise }),
  calm: {
    hit: () => tone({ f: 660, dur: 0.12, vol: 0.035 }),
    miss: () => tone({ f: 220, f2: 200, dur: 0.12, vol: 0.03 }),
    shot: () => noise({ dur: 0.07, vol: 0.06, filter: 'lowpass', freq: 900 }),
    dryFire: () => noise({ dur: 0.02, vol: 0.05, filter: 'highpass', freq: 3000 }),
    empty: () => notes([440, 330], { gap: 0.14, dur: 0.16, vol: 0.035 }),
    reload: () => [0, 0.12].forEach((at) => noise({ at, dur: 0.03, vol: 0.05, filter: 'bandpass', freq: 1800, q: 4 })),
    hurt: () => tone({ f: 130, f2: 100, dur: 0.25, vol: 0.05 }),
    special: () => notes([784, 988, 1175], { gap: 0.07, dur: 0.18, vol: 0.03 }),
    levelUp: () => notes([523, 659, 784], { gap: 0.12, dur: 0.2, vol: 0.035 }),
  },
  classic: {
    hit: () => tone({ f: 520, f2: 780, dur: 0.09, type: 'triangle', vol: 0.07 }),
    miss: () => tone({ f: 160, dur: 0.13, type: 'square', vol: 0.04 }),
    shot: () => {
      noise({ dur: 0.12, vol: 0.18, freq: 1400, freq2: 400, q: 0.8 });
      tone({ f: 140, f2: 60, dur: 0.12, type: 'sine', vol: 0.12 });
    },
    dryFire: () => noise({ dur: 0.03, vol: 0.12, filter: 'highpass', freq: 3500 }),
    empty: () => notes([880, 880], { gap: 0.13, dur: 0.09, type: 'square', vol: 0.04 }),
    reload: () => {
      noise({ dur: 0.04, vol: 0.14, freq: 2500, q: 5 });
      noise({ at: 0.14, dur: 0.06, vol: 0.16, freq: 1300, q: 5 });
    },
    hurt: () => tone({ f: 90, dur: 0.3, type: 'square', vol: 0.06 }),
    special: () => notes([660, 880, 1320], { gap: 0.06, dur: 0.1, type: 'triangle', vol: 0.06 }),
    levelUp: () => notes([660, 880, 1100], { gap: 0.11, dur: 0.12, type: 'triangle', vol: 0.07 }),
  },
  dopamine: {
    // Each hit in a streak climbs a semitone, so long combos literally sound like they're rising.
    hit: ({ combo = 0 } = {}) => {
      const root = semitone(523, Math.min(combo, 15));
      notes([root, semitone(root, 4), semitone(root, 7), semitone(root, 12)], { gap: 0.035, dur: 0.12, type: 'square', vol: 0.045 });
      tone({ f: semitone(root, 24), dur: 0.25, type: 'sine', vol: 0.05, at: 0.12 });
      noise({ dur: 0.08, vol: 0.05, filter: 'highpass', freq: 6000, at: 0.1 });
      if (combo > 0 && combo % 5 === 0) notes([root, semitone(root, 4), semitone(root, 7)], { gap: 0, dur: 0.45, type: 'sawtooth', vol: 0.03, at: 0.18 });
    },
    miss: () => {
      tone({ f: 320, f2: 70, dur: 0.35, type: 'sawtooth', vol: 0.07 });
      noise({ dur: 0.2, vol: 0.06, filter: 'lowpass', freq: 600 });
    },
    shot: () => {
      noise({ dur: 0.2, vol: 0.3, filter: 'lowpass', freq: 3000, freq2: 300 });
      tone({ f: 160, f2: 38, dur: 0.22, type: 'sine', vol: 0.22 });
      noise({ at: 0.03, dur: 0.25, vol: 0.05, filter: 'bandpass', freq: 500, q: 0.5 });
    },
    dryFire: () => {
      noise({ dur: 0.025, vol: 0.18, filter: 'highpass', freq: 4500 });
      tone({ f: 90, dur: 0.12, type: 'triangle', vol: 0.08, at: 0.02 });
    },
    empty: () => [0, 0.18, 0.36].forEach((at) => {
      tone({ f: 880, f2: 660, dur: 0.16, type: 'sawtooth', vol: 0.05, at });
    }),
    reload: () => {
      noise({ dur: 0.08, vol: 0.2, freq: 900, freq2: 2600, q: 3 });
      noise({ at: 0.16, dur: 0.06, vol: 0.25, freq: 1600, q: 6 });
      notes([1046, 1568], { gap: 0.08, dur: 0.18, type: 'triangle', vol: 0.06, at: 0.24 });
    },
    hurt: () => {
      tone({ f: 140, f2: 45, dur: 0.4, type: 'sawtooth', vol: 0.1 });
      noise({ dur: 0.3, vol: 0.12, filter: 'lowpass', freq: 400 });
    },
    special: () => {
      noise({ dur: 0.4, vol: 0.1, freq: 400, freq2: 5000, q: 2 });
      notes([523, 659, 784, 1046, 1318, 1568], { gap: 0.045, dur: 0.15, type: 'square', vol: 0.04, at: 0.15 });
    },
    levelUp: () => {
      notes([523, 659, 784, 1046], { gap: 0.1, dur: 0.14, type: 'square', vol: 0.05 });
      notes([523, 659, 784, 1046], { gap: 0, dur: 0.7, type: 'sawtooth', vol: 0.025, at: 0.42 });
      noise({ at: 0.42, dur: 0.5, vol: 0.05, filter: 'highpass', freq: 7000 });
    },
  },
};

function play(event, options, pack = packId) {
  if (!enabled) return;
  try {
    ensureAudio();
    if (audio.state === 'suspended') audio.resume();
    PACKS[pack][event]?.(options);
  } catch (error) {
    console.warn('Sound is unavailable.', error);
    enabled = false;
  }
}

/** Game sounds follow the selected pack. */
export const sounds = Object.freeze({
  hit: (options) => play('hit', options),
  miss: () => play('miss'),
  shot: () => play('shot'),
  dryFire: () => play('dryFire'),
  empty: () => play('empty'),
  reload: () => play('reload'),
  hurt: () => play('hurt'),
  special: () => play('special'),
  levelUp: () => play('levelUp'),
  // Practice modes stay gentle whatever pack is chosen (they fire on every key stroke).
  typo: () => enabled && withAudio(() => tone({ f: 170, dur: 0.1, type: 'square', vol: 0.025 })),
  done: () => enabled && withAudio(() => tone({ f: 880, dur: 0.1, vol: 0.05 })),
});

function withAudio(fn) {
  try {
    ensureAudio();
    fn();
  } catch (error) {
    console.warn('Sound is unavailable.', error);
    enabled = false;
  }
}

/** Short demo of a pack: two climbing hits, then a miss. */
export function previewPack(id) {
  if (id === 'warzone') {
    play('shot', undefined, id);
    setTimeout(() => play('hit', { combo: 0 }, id), 120);
    setTimeout(() => play('reload', undefined, id), 900);
    return;
  }
  play('hit', { combo: 0 }, id);
  setTimeout(() => play('hit', { combo: 4 }, id), 260);
  setTimeout(() => play('miss', undefined, id), 560);
}

/** Prepares audio for long-running sounds; false when sound is off or unavailable. */
export function synthReady() {
  if (!enabled) return false;
  try {
    ensureAudio();
    if (audio.state === 'suspended') audio.resume();
    return true;
  } catch (error) {
    console.warn('Sound is unavailable.', error);
    enabled = false;
    return false;
  }
}

/** Continuous filtered noise (wind, rumble). Returns a function that fades it out. */
export function loopNoise({ filter = 'lowpass', freq = 200, vol = 0.04 }) {
  const src = audio.createBufferSource();
  const biquad = audio.createBiquadFilter();
  const gain = audio.createGain();
  src.buffer = noiseBuffer;
  src.loop = true;
  biquad.type = filter;
  biquad.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(vol, audio.currentTime + 1.5);
  src.connect(biquad).connect(gain).connect(master);
  src.start();
  return () => {
    gain.gain.setTargetAtTime(0.0001, audio.currentTime, 0.2);
    src.stop(audio.currentTime + 1);
  };
}

/** Effects shared with the battlefield ambience. */
export const warzoneFx = PACKS.warzone;

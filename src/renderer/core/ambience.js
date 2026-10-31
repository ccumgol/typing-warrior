// Battlefield ambience for the 🎖️ 전장 pack: wind/rumble bed, distant artillery and gunfire,
// incoming rounds when enemies close in, radio chatter, and a heartbeat that races as HP drops.
import { synthReady, loopNoise, tone, noise, warzoneFx } from './sound.js';

const TICK_MS = 250;
const rand = (min, max) => min + Math.random() * (max - min);

export function createAmbience() {
  let timer = 0;
  let stopBed = null;
  let state = { hp: 1, threat: 0, wave: 1 }; // hp: 0..1, threat: 0..1 (how close the nearest enemy is)
  let nextBeat = 0;

  function distantGunfire() {
    const shots = Math.floor(rand(3, 8));
    const vol = rand(0.025, 0.05) * (0.6 + state.threat);
    const gap = rand(0.07, 0.12);
    for (let i = 0; i < shots; i += 1) {
      noise({ at: i * gap + rand(0, 0.02), dur: 0.08, vol, filter: 'bandpass', freq: rand(500, 900), q: 1.2 });
    }
  }

  function incomingRound() {
    // bullet snapping past your head
    noise({ dur: 0.02, vol: 0.08, filter: 'highpass', freq: 6000 });
    noise({ dur: 0.22, vol: 0.07, filter: 'bandpass', freq: 4500, freq2: 900, q: 3 });
  }

  function radioChatter() {
    warzoneFx.radioSquelch(0);
    const syllables = Math.floor(rand(4, 9));
    for (let i = 0; i < syllables; i += 1) {
      tone({ at: 0.18 + i * 0.07, f: rand(280, 650), dur: 0.06, type: 'square', vol: 0.012 });
    }
    noise({ at: 0.18, dur: syllables * 0.07, vol: 0.015, filter: 'bandpass', freq: 1800, q: 1 });
  }

  function heartbeat(now) {
    if (state.hp > 0.4 || now < nextBeat) return;
    tone({ f: 58, f2: 45, dur: 0.14, type: 'sine', vol: 0.22 });
    tone({ at: 0.17, f: 52, f2: 40, dur: 0.12, type: 'sine', vol: 0.16 });
    // 40% HP ≈ 75 bpm, nearly dead ≈ 150 bpm
    nextBeat = now + 400 + state.hp * 1000;
  }

  function tick() {
    if (!synthReady()) {
      // sound was switched off mid-game
      stopBed?.();
      stopBed = null;
      return;
    }
    stopBed = stopBed || loopNoise({ filter: 'lowpass', freq: 180, vol: 0.05 });
    const now = performance.now();
    const { threat, wave } = state;
    if (Math.random() < 0.025 + wave * 0.004) warzoneFx.explosion(rand(0, 0.2), rand(0.06, 0.16)); // distant artillery
    if (Math.random() < 0.05 + threat * 0.12) distantGunfire();
    if (threat > 0.45 && Math.random() < threat * 0.1) incomingRound();
    if (Math.random() < 0.012) radioChatter();
    heartbeat(now);
  }

  return {
    start() {
      if (timer) return;
      tick();
      timer = setInterval(tick, TICK_MS);
    },
    stop() {
      clearInterval(timer);
      timer = 0;
      stopBed?.();
      stopBed = null;
    },
    /** @param {{hp:number, threat:number, wave:number}} next */
    update(next) {
      state = { ...state, ...next };
    },
  };
}

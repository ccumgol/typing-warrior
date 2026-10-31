// 🎖️ 전장 sound pack: gritty, realistic battlefield effects for 전선 작전.
// Built from the shared synth primitives (tone / noise) passed in by sound.js.

export function createWarzonePack({ tone, noise }) {
  const shellCasing = (at) => {
    // brass casing bouncing on the ground
    [0, 0.09, 0.15].forEach((offset, i) => tone({ f: 4200 - i * 300, dur: 0.05, type: 'sine', vol: 0.025 / (i + 1), at: at + offset }));
  };

  const explosion = (at = 0, vol = 0.35) => {
    noise({ at, dur: 1.4, vol, filter: 'lowpass', freq: 900, freq2: 60 });
    tone({ at, f: 70, f2: 28, dur: 1.1, type: 'sine', vol: vol * 0.8 });
    noise({ at: at + 0.05, dur: 0.25, vol: vol * 0.5, filter: 'bandpass', freq: 1800, freq2: 300, q: 0.7 });
  };

  const radioSquelch = (at = 0) => {
    noise({ at, dur: 0.12, vol: 0.06, filter: 'bandpass', freq: 2200, q: 2 });
    tone({ at: at + 0.1, f: 1250, dur: 0.06, type: 'square', vol: 0.02 });
  };

  return {
    shot: () => {
      noise({ dur: 0.035, vol: 0.45, filter: 'highpass', freq: 2500 }); // supersonic crack
      noise({ dur: 0.18, vol: 0.35, filter: 'bandpass', freq: 900, freq2: 180, q: 0.6 }); // body
      tone({ f: 130, f2: 35, dur: 0.28, type: 'sine', vol: 0.3 }); // chest thump
      noise({ at: 0.05, dur: 0.7, vol: 0.06, filter: 'lowpass', freq: 700, freq2: 120 }); // echo tail
      shellCasing(0.35);
    },
    hit: ({ combo = 0 } = {}) => {
      noise({ at: 0.06, dur: 0.12, vol: 0.18, filter: 'lowpass', freq: 500 }); // body impact
      tone({ at: 0.06, f: 95, f2: 45, dur: 0.16, type: 'sine', vol: 0.16 });
      noise({ at: 0.04, dur: 0.02, vol: 0.12, filter: 'highpass', freq: 5000 }); // hit marker tick
      if (combo > 0 && (combo + 1) % 5 === 0) radioSquelch(0.35); // "target down" radio chirp
    },
    miss: () => {
      // ricochet whine off concrete
      noise({ at: 0.04, dur: 0.04, vol: 0.12, filter: 'highpass', freq: 3000 });
      tone({ at: 0.05, f: 2800, f2: 700, dur: 0.38, type: 'triangle', vol: 0.05 });
    },
    dryFire: () => {
      noise({ dur: 0.02, vol: 0.2, filter: 'highpass', freq: 5000 });
      tone({ at: 0.01, f: 1900, dur: 0.03, type: 'square', vol: 0.03 });
    },
    empty: () => {
      // magazine runs dry: hollow click, then a radio warning
      noise({ dur: 0.03, vol: 0.18, filter: 'bandpass', freq: 3200, q: 4 });
      radioSquelch(0.25);
      [0.45, 0.62].forEach((at) => tone({ at, f: 1000, dur: 0.1, type: 'square', vol: 0.035 }));
    },
    reload: () => {
      noise({ dur: 0.06, vol: 0.2, filter: 'bandpass', freq: 1500, q: 3 }); // mag out
      noise({ at: 0.28, dur: 0.07, vol: 0.28, filter: 'bandpass', freq: 900, q: 5 }); // mag in
      tone({ at: 0.28, f: 220, f2: 150, dur: 0.08, type: 'sine', vol: 0.12 });
      noise({ at: 0.55, dur: 0.12, vol: 0.3, filter: 'bandpass', freq: 2400, freq2: 700, q: 3 }); // charging handle
      noise({ at: 0.68, dur: 0.04, vol: 0.3, filter: 'highpass', freq: 2500 }); // bolt slams home
    },
    hurt: () => {
      noise({ dur: 0.35, vol: 0.4, filter: 'lowpass', freq: 600, freq2: 80 });
      tone({ f: 80, f2: 35, dur: 0.4, type: 'sine', vol: 0.3 });
      // ear ringing after a close impact
      tone({ at: 0.1, f: 3700, dur: 2.2, type: 'sine', vol: 0.025 });
    },
    special: () => {
      // airstrike: jet screams in, then a carpet of explosions
      noise({ dur: 1.2, vol: 0.15, filter: 'bandpass', freq: 300, freq2: 3500, q: 1.5 });
      tone({ f: 600, f2: 180, dur: 1.3, type: 'sawtooth', vol: 0.03 });
      [1.0, 1.25, 1.45, 1.8].forEach((at, i) => explosion(at, 0.4 - i * 0.05));
    },
    levelUp: () => {
      radioSquelch(0);
      [0.2, 0.32, 0.44].forEach((at, i) => tone({ at, f: 700 + i * 150, dur: 0.09, type: 'square', vol: 0.03 }));
    },
    // used by the battlefield ambience
    explosion,
    radioSquelch,
  };
}

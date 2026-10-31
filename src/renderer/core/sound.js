// Tiny synthesized sound effects (no audio files needed).

let context = null;
let enabled = true;

export const setSoundEnabled = (value) => {
  enabled = value;
};

function beep(frequency, duration, type = 'sine', volume = 0.06) {
  if (!enabled) return;
  try {
    context = context || new AudioContext();
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    osc.connect(gain).connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + duration);
  } catch (error) {
    console.warn('Sound is unavailable.', error);
    enabled = false;
  }
}

export const sounds = Object.freeze({
  miss: () => beep(160, 0.12, 'square', 0.04),
  done: () => beep(880, 0.1),
  shot: () => beep(120, 0.15, 'sawtooth', 0.08),
  hit: () => beep(520, 0.08, 'triangle'),
  hurt: () => beep(90, 0.3, 'square', 0.06),
  levelUp: () => [660, 880, 1100].forEach((f, i) => setTimeout(() => beep(f, 0.12), i * 110)),
});

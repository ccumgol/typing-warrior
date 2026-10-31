// 산성비 게임: 떨어지는 단어를 땅에 닿기 전에 입력해서 없앱니다.
import { KO_WORD_SETS, EN_WORD_SETS } from '../data/words.js';
import { strokeCount } from '../core/hangul.js';
import { el, pickRandom } from '../ui/dom.js';
import { createGameInput } from '../ui/game-input.js';
import { createTextSizeControl } from '../ui/text-size-control.js';
import { createSoundPackControl } from '../ui/sound-pack-control.js';
import { sounds } from '../core/sound.js';
import { createSession, finishSession } from './session.js';
import { formatTime } from '../core/stats.js';

const MAX_HP = 10;
const WORDS_PER_LEVEL = 12;
const SPECIAL_CHANCE = 0.07;

const levelSpeed = (level) => 0.055 + level * 0.012; // field heights per second
const spawnDelay = (level) => Math.max(650, 2300 - level * 170); // ms

export function createAcidRainMode(ctx) {
  const session = createSession();
  const input = createGameInput();
  const field = el('div', { class: 'rain-field' });
  const ground = el('div', { class: 'rain-ground' });
  const overlay = el('div', { class: 'game-overlay' });
  const hud = el('div', { class: 'game-hud' });
  ctx.root.replaceChildren(
    el('section', { class: 'mode game acid-rain' }, el('div', { class: 'rain-stage' }, hud, field, ground, overlay), el('div', { class: 'game-input-row' }, createSoundPackControl(ctx), input.el, createTextSizeControl(ctx))),
  );
  ctx.keyboard.highlight(null);
  ctx.status({ cpm: 0, accuracy: 100, time: formatTime(0), progress: 'Enter로 시작' });

  let state = 'ready'; // ready | playing | paused | over
  let drops = [];
  let level = 1;
  let cleared = 0;
  let score = 0;
  let hp = MAX_HP;
  let spawnTimer = 0;
  let slowUntil = 0;
  let frame = 0;
  let lastTime = 0;
  let nextId = 1;
  let pausedAt = 0;
  let streak = 0;
  let lang = ctx.settings().lang; // fixed for the whole game so falling words stay typable

  const words = () => Object.values(lang === 'ko' ? KO_WORD_SETS : EN_WORD_SETS).flat();

  function showOverlay(title, lines) {
    overlay.replaceChildren(el('h2', {}, title), ...lines.map((line) => el('p', {}, line)));
    overlay.hidden = false;
  }

  function reset() {
    drops.forEach((d) => d.node.remove());
    drops = [];
    level = 1;
    cleared = 0;
    score = 0;
    hp = MAX_HP;
    streak = 0;
    spawnTimer = 0;
    slowUntil = 0;
    session.reset();
    input.clear();
    renderGround();
    renderHud();
  }

  function spawn() {
    const text = pickRandom(words());
    const roll = Math.random();
    const kind = roll < SPECIAL_CHANCE / 2 ? 'bomb' : roll < SPECIAL_CHANCE ? 'freeze' : 'normal';
    const node = el('div', { class: `drop ${kind}` }, text);
    field.append(node);
    const maxX = Math.max(0, field.clientWidth - node.offsetWidth - 8);
    const drop = { id: nextId++, text, kind, node, x: 8 + Math.random() * maxX, y: 0 };
    node.style.left = `${drop.x}px`;
    drops = [...drops, drop];
  }

  function removeDrop(drop, cls) {
    drop.node.classList.add(cls);
    setTimeout(() => drop.node.remove(), 350);
    drops = drops.filter((d) => d.id !== drop.id);
  }

  function renderGround() {
    ground.replaceChildren(...Array.from({ length: MAX_HP }, (_, i) => el('i', { class: i < hp ? 'brick' : 'brick broken' })));
  }

  function renderHud() {
    hud.textContent = `LEVEL ${level}   ·   점수 ${score.toLocaleString()}   ·   ${cleared}개 처리${slowUntil > performance.now() ? '   ·   ❄️ 감속 중' : ''}`;
    const snap = session.snapshot();
    ctx.status({ cpm: snap.cpm, accuracy: snap.accuracy, time: formatTime(snap.ms), progress: `Lv.${level} · ${score.toLocaleString()}점` });
  }

  function loop(now) {
    if (state !== 'playing') return;
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    spawnTimer -= dt * 1000;
    if (spawnTimer <= 0) {
      spawn();
      spawnTimer = spawnDelay(level);
    }
    const speed = levelSpeed(level) * (now < slowUntil ? 0.35 : 1);
    const height = field.clientHeight;
    for (const drop of drops) {
      drop.y += speed * dt;
      drop.node.style.transform = `translateY(${drop.y * (height - drop.node.offsetHeight)}px)`;
      if (drop.y >= 1) {
        removeDrop(drop, 'splash');
        hp -= 1;
        streak = 0;
        sounds.hurt();
        renderGround();
        if (hp <= 0) return gameOver();
      }
    }
    frame = requestAnimationFrame(loop);
  }

  function hit(text) {
    const lowest = drops.filter((d) => d.text === text).sort((a, b) => b.y - a.y)[0];
    if (!lowest) {
      session.stroke(false);
      streak = 0;
      sounds.miss();
      input.setState('miss');
      return;
    }
    for (let i = 0; i < strokeCount(text); i += 1) session.stroke(true);
    session.item();
    input.setState('hit');
    sounds.hit({ combo: streak });
    streak += 1;
    if (lowest.kind !== 'normal') setTimeout(sounds.special, 120);
    score += strokeCount(text) * 10 * level;
    cleared += 1;
    if (lowest.kind === 'bomb') drops.forEach((d) => d !== lowest && removeDrop(d, 'pop'));
    if (lowest.kind === 'freeze') slowUntil = performance.now() + 5000;
    removeDrop(lowest, 'pop');
    if (cleared % WORDS_PER_LEVEL === 0) {
      level += 1;
      sounds.levelUp();
      ctx.toast(`🌧️ LEVEL ${level}! 비가 더 거세집니다`);
    }
    renderHud();
  }

  function start() {
    lang = ctx.settings().lang;
    reset();
    session.begin();
    state = 'playing';
    overlay.hidden = true;
    lastTime = performance.now();
    frame = requestAnimationFrame(loop);
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      pausedAt = performance.now();
      cancelAnimationFrame(frame);
      showOverlay('일시정지', ['Esc를 누르면 계속합니다']);
    } else if (state === 'paused') {
      const pausedMs = performance.now() - pausedAt;
      session.excludePause(pausedMs);
      slowUntil += pausedMs;
      state = 'playing';
      overlay.hidden = true;
      lastTime = performance.now();
      frame = requestAnimationFrame(loop);
    }
  }

  function gameOver() {
    state = 'over';
    cancelAnimationFrame(frame);
    showOverlay('GAME OVER', ['Enter를 눌러 다시 시작']);
    finishSession({
      mode: 'acid-rain',
      label: '산성비',
      title: `산성비 게임 종료 · ${score.toLocaleString()}점`,
      snap: session.snapshot(),
      score,
      extraStats: [{ label: '점수', value: score.toLocaleString() }, { label: '레벨', value: level }],
      actions: [{ label: '다시 도전', primary: true, onClick: start }, { label: '닫기', onClick: () => {} }],
    });
  }

  function onKeyDown(event) {
    if (event.code === 'Escape') {
      togglePause();
      return true;
    }
    if (state === 'ready' || state === 'over') {
      if (event.code === 'Enter') start();
      return event.code === 'Enter';
    }
    if (state !== 'playing') return false;
    const { handled, submitted } = input.handleKey(event, lang);
    if (submitted) hit(submitted);
    return handled;
  }

  reset();
  showOverlay('☔ 산성비', ['떨어지는 단어를 입력하고 Enter 또는 Space!', '💣 금색 단어: 화면 정리 · ❄️ 파란 단어: 5초 감속', 'Enter로 시작 · Esc 일시정지']);
  return {
    onKeyDown,
    onLangChange() {}, // the running game keeps its language; the next game uses the new one
    tick: () => state === 'playing' && renderHud(),
    destroy: () => cancelAnimationFrame(frame),
  };
}

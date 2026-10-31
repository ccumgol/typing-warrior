// 전선 작전: 다가오는 적의 단어를 입력해 사격하는 1인칭 전장 타자 게임.
import { KO_WORD_SETS, EN_WORD_SETS } from '../data/words.js';
import { KO_QUOTES, EN_SENTENCES } from '../data/quotes.js';
import { strokeCount, decompose } from '../core/hangul.js';
import { formatTime } from '../core/stats.js';
import { el, pickRandom } from '../ui/dom.js';
import { createGameInput } from '../ui/game-input.js';
import { isTypable } from '../core/keyboard-layout.js';
import { sounds } from '../core/sound.js';
import { createSession, finishSession } from './session.js';
import { project, drawScene, drawEnemy, drawCrosshair, drawTracer, drawWeapon, drawDamage } from './shooter-render.js';

const MAX_HP = 100;
const MAGAZINE = 8;
const STREAK_FOR_AIRSTRIKE = 7;
const KINDS = Object.freeze({
  grunt: { size: 1, time: 1, damage: 10, points: 1 },
  runner: { size: 0.85, time: 0.6, damage: 8, points: 1.5 },
  heavy: { size: 1.25, time: 1.5, damage: 20, points: 2 },
  boss: { size: 1.7, time: 2.6, damage: 40, points: 5 },
});
const COMMANDS = { ko: { reload: '장전', airstrike: '공습' }, en: { reload: 'reload', airstrike: 'airstrike' } };

function wordPool(lang) {
  const commands = Object.values(COMMANDS[lang]);
  const usable = (t) => !commands.includes(t) && decompose(t).every(isTypable);
  const words = [...new Set(Object.values(lang === 'ko' ? KO_WORD_SETS : EN_WORD_SETS).flat())].filter(usable);
  const short = lang === 'ko' ? 2 : 4;
  const long = lang === 'ko' ? 4 : 8;
  const phrases = (lang === 'ko' ? KO_QUOTES : EN_SENTENCES).map((q) => q.text.replace(/[.!?]$/, '')).filter((t) => t.length <= 16 && usable(t));
  return {
    grunt: words,
    runner: words.filter((w) => w.length <= short),
    heavy: words.filter((w) => w.length >= long),
    boss: phrases,
  };
}

export function createShooterMode(ctx) {
  const session = createSession();
  const input = createGameInput({ placeholder: '적의 단어를 입력하고 Enter', spaceSubmits: false });
  const canvas = el('canvas', { class: 'shooter-canvas' });
  const overlay = el('div', { class: 'game-overlay' });
  const stage = el('div', { class: 'shooter-stage' }, canvas, overlay);
  ctx.root.replaceChildren(el('section', { class: 'mode game shooter' }, stage, el('div', { class: 'game-input-row' }, input.el)));
  ctx.keyboard.highlight(null);
  const g = canvas.getContext('2d');

  let state = 'ready';
  let lang = ctx.settings().lang;
  let pool = wordPool(lang);
  let game = null;
  let frame = 0;
  let last = 0;
  let pausedAt = 0;

  const newGame = () => ({
    hp: MAX_HP, ammo: MAGAZINE, score: 0, wave: 0, streak: 0, bestStreak: 0, kills: 0, airstrikes: 0,
    enemies: [], toSpawn: [], spawnTimer: 0, banner: null, tracers: [], recoil: 0, damage: 0, nextId: 1,
  });

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = stage.clientWidth * ratio;
    canvas.height = stage.clientHeight * ratio;
    g.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  const observer = new ResizeObserver(() => {
    resize();
    if (state !== 'playing') draw();
  });
  observer.observe(stage);

  function startWave() {
    game.wave += 1;
    const count = 4 + game.wave * 2;
    const kinds = Array.from({ length: count }, (_, i) => (i % 5 === 4 ? 'heavy' : i % 3 === 2 ? 'runner' : 'grunt'));
    game.toSpawn = game.wave % 5 === 0 ? [...kinds, 'boss'] : kinds;
    game.spawnTimer = 1.2;
    game.banner = { text: `WAVE ${game.wave}`, life: 2 };
  }

  function spawn(kind) {
    const used = new Set(game.enemies.map((e) => e.text));
    const options = pool[kind].filter((w) => !used.has(w));
    const baseTime = Math.max(7, 15 - game.wave * 0.7);
    game.enemies.push({
      id: game.nextId++, kind, text: pickRandom(options.length ? options : pool.grunt), z: 1,
      lane: Math.random() * 1.8 - 0.9, size: KINDS[kind].size, speed: 1 / (baseTime * KINDS[kind].time), flash: 0,
    });
  }

  function lockedEnemy() {
    const typed = decompose(input.text()).join('');
    if (!typed) return null;
    // Compare key strokes so a half-typed syllable (e.g. "ㄱ" for "고래") already locks on.
    return game.enemies.filter((e) => decompose(e.text).join('').startsWith(typed)).sort((a, b) => a.z - b.z)[0] || null;
  }

  function update(dt) {
    game.spawnTimer -= dt;
    if (game.toSpawn.length && game.spawnTimer <= 0) {
      spawn(game.toSpawn.shift());
      game.spawnTimer = Math.max(0.9, 2.6 - game.wave * 0.15);
    }
    for (const enemy of game.enemies) {
      enemy.z -= enemy.speed * dt;
      enemy.flash = enemy.z < 0.55 && Math.random() < dt * 1.5 ? 1 : Math.max(0, enemy.flash - dt * 4);
    }
    const arrived = game.enemies.filter((e) => e.z <= 0);
    if (arrived.length) {
      game.enemies = game.enemies.filter((e) => e.z > 0);
      game.hp -= arrived.reduce((sum, e) => sum + KINDS[e.kind].damage, 0);
      game.damage = 1;
      game.streak = 0;
      sounds.hurt();
    }
    game.tracers = game.tracers.map((t) => ({ ...t, life: t.life - dt * 5 })).filter((t) => t.life > 0);
    game.recoil = Math.max(0, game.recoil - dt * 6);
    game.damage = Math.max(0, game.damage - dt * 1.5);
    if (game.banner) game.banner = game.banner.life - dt > 0 ? { ...game.banner, life: game.banner.life - dt } : null;
    if (game.hp <= 0) return gameOver();
    if (!game.toSpawn.length && !game.enemies.length && !game.banner) {
      game.hp = Math.min(MAX_HP, game.hp + 15);
      startWave();
    }
  }

  function draw() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const light = document.documentElement.dataset.theme === 'light';
    drawScene(g, width, height, light);
    if (!game) return;
    const locked = lockedEnemy();
    [...game.enemies].sort((a, b) => b.z - a.z).forEach((e) => {
      drawEnemy(g, e, project(e, width, height), e === locked, input.text().length);
    });
    game.tracers.forEach((t) => drawTracer(g, width, height, t));
    const aim = locked ? project(locked, width, height) : null;
    drawCrosshair(g, aim ? aim.x : width / 2, aim ? aim.y - 40 * aim.scale * 1.4 : height * 0.55, Boolean(locked));
    drawWeapon(g, width, height, game.recoil);
    drawDamage(g, width, height, game.damage);
    drawHud(width, height);
  }

  function drawHud(width, height) {
    g.save();
    g.font = 'bold 15px system-ui, sans-serif';
    g.fillStyle = 'rgba(0,0,0,.45)';
    g.fillRect(16, 16, 204, 18);
    g.fillStyle = game.hp > 30 ? '#4ade80' : '#f87171';
    g.fillRect(18, 18, 200 * (game.hp / MAX_HP), 14);
    g.fillStyle = '#fff';
    g.fillText(`HP ${game.hp}`, 228, 30);
    g.textAlign = 'right';
    g.fillText(`WAVE ${game.wave}  ·  ${game.score.toLocaleString()}점`, width - 18, 30);
    g.textAlign = 'left';
    const bullets = '▮'.repeat(game.ammo) + '▯'.repeat(MAGAZINE - game.ammo);
    g.fillText(`탄약 ${bullets}`, 18, height - 22);
    if (game.ammo === 0) {
      g.fillStyle = '#fbbf24';
      g.fillText(`탄약 없음! "${COMMANDS[lang].reload}" 입력`, 18, height - 44);
    }
    g.fillStyle = '#93c5fd';
    if (game.airstrikes) g.fillText(`✈ 공습 ${game.airstrikes}회 — "${COMMANDS[lang].airstrike}" 입력`, 18, height - 66);
    if (game.streak >= 3) {
      g.textAlign = 'center';
      g.fillStyle = '#fde047';
      g.fillText(`${game.streak} 연속 명중!`, width / 2, 60);
    }
    if (game.banner) {
      g.textAlign = 'center';
      g.font = 'bold 44px system-ui, sans-serif';
      g.fillStyle = `rgba(255,255,255,${Math.min(1, game.banner.life)})`;
      g.fillText(game.banner.text, width / 2, height * 0.3);
    }
    g.restore();
  }

  function fireAt(enemy) {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const pos = project(enemy, width, height);
    game.tracers.push({ x: pos.x, y: pos.y - 40 * pos.scale * 1.4, life: 1 });
  }

  function submit(text) {
    const commands = COMMANDS[lang];
    if (text === commands.reload) {
      game.ammo = MAGAZINE;
      ctx.toast('🔄 재장전 완료');
      return;
    }
    if (text === commands.airstrike && game.airstrikes > 0) {
      game.airstrikes -= 1;
      game.kills += game.enemies.length;
      game.score += game.enemies.length * 50;
      game.enemies = [];
      game.banner = { text: '✈ 공습!', life: 1.5 };
      sounds.levelUp();
      return;
    }
    if (game.ammo === 0) {
      sounds.miss();
      return;
    }
    game.ammo -= 1;
    game.recoil = 1;
    sounds.shot();
    const target = game.enemies.filter((e) => e.text === text).sort((a, b) => a.z - b.z)[0];
    if (!target) {
      session.stroke(false);
      game.streak = 0;
      input.setState('miss');
      return;
    }
    for (let i = 0; i < strokeCount(text); i += 1) session.stroke(true);
    session.item();
    fireAt(target);
    game.enemies = game.enemies.filter((e) => e !== target);
    game.kills += 1;
    game.streak += 1;
    game.bestStreak = Math.max(game.bestStreak, game.streak);
    if (game.streak % STREAK_FOR_AIRSTRIKE === 0) {
      game.airstrikes += 1;
      ctx.toast(`✈ ${game.streak}연속 명중! 공습 지원 획득`);
    }
    const bonus = 1 + Math.min(game.streak, 10) * 0.1;
    game.score += Math.round(strokeCount(text) * 10 * KINDS[target.kind].points * bonus);
    input.setState('hit');
    sounds.hit();
  }

  function loop(now) {
    if (state !== 'playing') return;
    update(Math.min(0.05, (now - last) / 1000));
    last = now;
    if (state === 'playing') {
      draw();
      frame = requestAnimationFrame(loop);
    }
  }

  function showOverlay(title, lines) {
    overlay.replaceChildren(el('h2', {}, title), ...lines.map((l) => el('p', {}, l)));
    overlay.hidden = false;
  }

  function start() {
    lang = ctx.settings().lang;
    pool = wordPool(lang);
    game = newGame();
    session.begin();
    input.clear();
    startWave();
    state = 'playing';
    overlay.hidden = true;
    last = performance.now();
    frame = requestAnimationFrame(loop);
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      pausedAt = performance.now();
      cancelAnimationFrame(frame);
      showOverlay('일시정지', ['Esc를 누르면 계속합니다']);
    } else if (state === 'paused') {
      session.excludePause(performance.now() - pausedAt);
      state = 'playing';
      overlay.hidden = true;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }
  }

  function gameOver() {
    state = 'over';
    cancelAnimationFrame(frame);
    draw();
    showOverlay('작전 실패', ['Enter를 눌러 재출격']);
    finishSession({
      mode: 'shooter',
      label: '전선 작전',
      title: `작전 종료 · WAVE ${game.wave}`,
      snap: session.snapshot(),
      score: game.score,
      extraStats: [{ label: '점수', value: game.score.toLocaleString() }, { label: '처치', value: game.kills }, { label: '최고 연속', value: game.bestStreak }],
      actions: [{ label: '재출격', primary: true, onClick: start }, { label: '닫기', onClick: () => {} }],
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
    if (submitted) submit(submitted);
    return handled;
  }

  const tick = () => {
    if (state !== 'playing') return;
    const snap = session.snapshot();
    ctx.status({ cpm: snap.cpm, accuracy: snap.accuracy, time: formatTime(snap.ms), progress: `WAVE ${game.wave} · ${game.score.toLocaleString()}점` });
  };

  resize();
  draw();
  const cmd = COMMANDS[lang];
  showOverlay('🎖️ 전선 작전', [
    '다가오는 적 위의 단어를 입력하고 Enter로 사격!',
    `탄약 ${MAGAZINE}발 · 다 쓰면 "${cmd.reload}" 입력 · ${STREAK_FOR_AIRSTRIKE}연속 명중 시 "${cmd.airstrike}" 사용 가능`,
    '5웨이브마다 지휘관(긴 문장) 등장 · Enter로 출격 · Esc 일시정지',
  ]);
  return {
    onKeyDown,
    onLangChange() {}, // the running game keeps its language; the next game uses the new one
    tick,
    destroy() {
      cancelAnimationFrame(frame);
      observer.disconnect();
    },
  };
}

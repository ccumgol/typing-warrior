// 전선 작전: 다가오는 적의 단어를 입력해 사격하는 1인칭 전장 타자 게임.
import { KO_WORD_SETS, EN_WORD_SETS } from '../data/words.js';
import { KO_QUOTES, EN_SENTENCES } from '../data/quotes.js';
import { strokeCount, decompose } from '../core/hangul.js';
import { formatTime } from '../core/stats.js';
import { el, pickRandom } from '../ui/dom.js';
import { createGameInput } from '../ui/game-input.js';
import { createTextSizeControl } from '../ui/text-size-control.js';
import { createSoundPackControl } from '../ui/sound-pack-control.js';
import { t } from '../core/i18n.js';
import { createAmbience } from '../core/ambience.js';
import { isTypable } from '../core/keyboard-layout.js';
import { sounds } from '../core/sound.js';
import { createSession, finishSession } from './session.js';
import { GAME_FONT, project, drawScene, drawEnemy, drawCrosshair, drawTracer, drawWeapon, drawDamage } from './shooter-render.js';

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
  const input = createGameInput({ placeholder: t('shooter.input'), spaceSubmits: false });
  const canvas = el('canvas', { class: 'shooter-canvas' });
  const overlay = el('div', { class: 'game-overlay' });
  const stage = el('div', { class: 'shooter-stage' }, canvas, overlay);
  ctx.root.replaceChildren(el('section', { class: 'mode game shooter' }, stage, el('div', { class: 'game-input-row' }, createSoundPackControl(ctx, { settingKey: 'shooterSoundPack', shooter: true, onChange: syncAmbience }), input.el, createTextSizeControl(ctx, () => state !== 'playing' && draw()))));
  ctx.keyboard.highlight(null);
  ctx.status({ cpm: 0, accuracy: 100, time: formatTime(0), progress: t('game.pressEnter') });
  const g = canvas.getContext('2d');
  const ambience = createAmbience();

  /** Battlefield background sounds play only while a game runs with the 전장 pack. */
  function syncAmbience() {
    if (state === 'playing' && ctx.settings().shooterSoundPack === 'warzone') ambience.start();
    else ambience.stop();
  }

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
    const nearest = game.enemies.reduce((min, e) => Math.min(min, e.z), 1);
    ambience.update({ hp: Math.max(0, game.hp) / MAX_HP, threat: game.enemies.length ? 1 - nearest : 0, wave: game.wave });
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
    // Labels keep one readable size regardless of distance; it follows the window height and the user's setting.
    const labelSize = Math.round(Math.min(30, Math.max(18, height * 0.03)) * ctx.settings().gameTextScale);
    [...game.enemies].sort((a, b) => b.z - a.z).forEach((e) => {
      drawEnemy(g, e, project(e, width, height), e === locked, input.text().length, labelSize);
    });
    game.tracers.forEach((t) => drawTracer(g, width, height, t));
    const aim = locked ? project(locked, width, height) : null;
    drawCrosshair(g, aim ? aim.x : width / 2, aim ? aim.y - 40 * aim.scale * 1.4 : height * 0.55, Boolean(locked));
    drawWeapon(g, width, height, game.recoil);
    drawDamage(g, width, height, game.damage);
    drawHud(width, height, labelSize);
  }

  function drawHud(width, height, labelSize) {
    const hudSize = Math.round(labelSize * 0.8);
    const line = hudSize * 1.5; // vertical spacing between HUD lines
    const top = 16 + hudSize; // baseline of the first row
    g.save();
    g.font = `600 ${hudSize}px ${GAME_FONT}`;
    g.textBaseline = 'alphabetic';
    g.fillStyle = 'rgba(0,0,0,.45)';
    g.fillRect(16, top - hudSize * 0.8, 204, hudSize * 0.9);
    g.fillStyle = game.hp > 30 ? '#4ade80' : '#f87171';
    g.fillRect(18, top - hudSize * 0.8 + 2, 200 * (game.hp / MAX_HP), hudSize * 0.9 - 4);
    g.fillStyle = '#fff';
    g.fillText(`HP ${game.hp}`, 230, top);
    g.textAlign = 'right';
    g.fillText(t('shooter.score', { wave: game.wave, score: game.score.toLocaleString() }), width - 18, top);
    g.textAlign = 'left';
    const bullets = '▮'.repeat(game.ammo) + '▯'.repeat(MAGAZINE - game.ammo);
    g.fillText(t('shooter.ammo', { count: bullets }), 18, height - 18);
    if (game.ammo === 0) {
      g.fillStyle = '#fbbf24';
      g.fillText(t('shooter.empty', { command: COMMANDS[lang].reload }), 18, height - 18 - line);
    }
    g.fillStyle = '#93c5fd';
    if (game.airstrikes) g.fillText(t('shooter.airstrikes', { count: game.airstrikes, command: COMMANDS[lang].airstrike }), 18, height - 18 - line * 2);
    if (game.streak >= 3) {
      g.textAlign = 'center';
      g.fillStyle = '#fde047';
      g.fillText(t('shooter.streak', { count: game.streak }), width / 2, top + line);
    }
    if (game.banner) {
      g.textAlign = 'center';
      g.font = `800 ${labelSize * 2}px ${GAME_FONT}`;
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
      sounds.reload();
      ctx.toast(t('shooter.reloaded'));
      return;
    }
    if (text === commands.airstrike && game.airstrikes > 0) {
      game.airstrikes -= 1;
      game.kills += game.enemies.length;
      game.score += game.enemies.length * 50;
      game.enemies = [];
      game.banner = { text: t('shooter.airstrike'), life: 1.5 };
      sounds.special();
      return;
    }
    if (game.ammo === 0) {
      sounds.dryFire(); // 찰칵: trigger pulled on an empty gun
      return;
    }
    game.ammo -= 1;
    game.recoil = 1;
    sounds.shot();
    if (game.ammo === 0) setTimeout(sounds.empty, 250); // warn after the last bullet
    const target = game.enemies.filter((e) => e.text === text).sort((a, b) => a.z - b.z)[0];
    if (!target) {
      session.stroke(false);
      game.streak = 0;
      input.setState('miss');
      sounds.miss();
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
      ctx.toast(t('shooter.airstrikeEarned', { count: game.streak }));
    }
    const bonus = 1 + Math.min(game.streak, 10) * 0.1;
    game.score += Math.round(strokeCount(text) * 10 * KINDS[target.kind].points * bonus);
    input.setState('hit');
    sounds.hit({ combo: game.streak - 1 });
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
    syncAmbience();
    overlay.hidden = true;
    last = performance.now();
    frame = requestAnimationFrame(loop);
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      pausedAt = performance.now();
      cancelAnimationFrame(frame);
      showOverlay(t('game.pause'), [t('game.resume')]);
      syncAmbience();
    } else if (state === 'paused') {
      session.excludePause(performance.now() - pausedAt);
      state = 'playing';
      syncAmbience();
      overlay.hidden = true;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }
  }

  function gameOver() {
    state = 'over';
    syncAmbience();
    cancelAnimationFrame(frame);
    draw();
    showOverlay(t('shooter.failed'), [t('shooter.redeploy')]);
    finishSession({
      mode: 'shooter',
      label: t('shooter.label'),
      title: t('shooter.result', { wave: game.wave }),
      snap: session.snapshot(),
      score: game.score,
      extraStats: [{ label: t('result.score'), value: game.score.toLocaleString() }, { label: t('shooter.kills'), value: game.kills }, { label: t('shooter.bestStreak'), value: game.bestStreak }],
      actions: [{ label: t('shooter.again'), primary: true, onClick: start }, { label: t('action.close'), onClick: () => {} }],
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
    ctx.status({ cpm: snap.cpm, accuracy: snap.accuracy, time: formatTime(snap.ms), progress: t('shooter.progress', { wave: game.wave, score: game.score.toLocaleString() }) });
  };

  resize();
  draw();
  const cmd = COMMANDS[lang];
  showOverlay(t('shooter.title'), [
    t('shooter.intro1'),
    t('shooter.intro2', { magazine: MAGAZINE, reload: cmd.reload, streak: STREAK_FOR_AIRSTRIKE, airstrike: cmd.airstrike }),
    t('shooter.intro3'),
  ]);
  return {
    onKeyDown,
    onLangChange() {}, // the running game keeps its language; the next game uses the new one
    tick,
    destroy() {
      cancelAnimationFrame(frame);
      ambience.stop();
      observer.disconnect();
    },
  };
}

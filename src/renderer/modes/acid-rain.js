// 단어블록게임: 떨어지는 단어 블록을 땅에 닿기 전에 입력해서 없앱니다. (기록 호환을 위해 내부 id는 acid-rain 유지)
// 연속 모드: 12단어마다 레벨이 오르며 끝까지 버팁니다. 단계 모드: 레벨마다 정해진 단어를 막으면 다음 레벨이 열립니다.
import { KO_WORD_SETS, EN_WORD_SETS } from '../data/words.js';
import { strokeCount } from '../core/hangul.js';
import { el, pills, pickRandom } from '../ui/dom.js';
import { createGameInput } from '../ui/game-input.js';
import { createTextSizeControl } from '../ui/text-size-control.js';
import { createSoundPackControl } from '../ui/sound-pack-control.js';
import { sounds } from '../core/sound.js';
import { t } from '../core/i18n.js';
import { createSession, finishSession } from './session.js';
import { formatTime } from '../core/stats.js';
import { STAGE_LEVELS, targetCpm, spawnDelayMs, fallSeconds, averageStrokes } from './acid-rain-levels.js';

const ENDLESS_HP = 10;
const STAGE_HP = 5;
const WORDS_PER_LEVEL = 12; // 연속 모드 level-up
const STAGE_WORDS = 20; // words to stop in one 단계 모드 level
const SPECIAL_CHANCE = 0.07;

export function createAcidRainMode(ctx) {
  const session = createSession();
  const input = createGameInput();
  const toolbar = el('div', { class: 'mode-toolbar' });
  const field = el('div', { class: 'rain-field' });
  const ground = el('div', { class: 'rain-ground' });
  const overlay = el('div', { class: 'game-overlay' });
  const hud = el('div', { class: 'game-hud' });
  ctx.root.replaceChildren(
    el('section', { class: 'mode game acid-rain' }, toolbar, el('div', { class: 'rain-stage' }, hud, field, ground, overlay), el('div', { class: 'game-input-row' }, createSoundPackControl(ctx), input.el, createTextSizeControl(ctx))),
  );
  ctx.keyboard.highlight(null);
  ctx.status({ cpm: 0, accuracy: 100, time: formatTime(0), progress: t('game.pressEnter') });

  let state = 'ready'; // ready | playing | paused | over
  let playMode = ctx.settings().acidMode;
  let stageLevel = Math.min(STAGE_LEVELS, ctx.settings().acidCleared + 1);
  let drops = [];
  let level = 1;
  let cleared = 0;
  let spawned = 0;
  let score = 0;
  let maxHp = ENDLESS_HP;
  let hp = maxHp;
  let spawnTimer = 0;
  let slowUntil = 0;
  let frame = 0;
  let lastTime = 0;
  let nextId = 1;
  let pausedAt = 0;
  let streak = 0;
  let lang = ctx.settings().lang; // fixed for the whole game so falling words stay typable
  let wordPool = [];
  let avgStrokes = 6;

  const isStage = () => playMode === 'stage';
  const unlockedLevel = () => Math.min(STAGE_LEVELS, ctx.settings().acidCleared + 1);

  function showOverlay(title, lines) {
    overlay.replaceChildren(el('h2', {}, title), ...lines.map((line) => el('p', {}, line)));
    overlay.hidden = false;
  }

  function showIntro() {
    if (!isStage()) return showOverlay(t('acid.title'), [t('acid.intro1'), t('acid.intro2'), t('acid.intro3')]);
    return showOverlay(t('acid.title'), [
      t('acid.stageIntro1', { level: stageLevel, words: STAGE_WORDS }),
      t('acid.stageIntro2', { cpm: targetCpm(stageLevel), lives: STAGE_HP }),
      t('acid.intro2'),
      t('acid.intro3'),
    ]);
  }

  function renderToolbar() {
    const modePills = pills([{ value: 'endless', label: t('acid.endless') }, { value: 'stage', label: t('acid.stage') }], playMode, selectMode);
    if (!isStage()) return toolbar.replaceChildren(modePills);
    const stepButton = (label, title, disabled, delta) =>
      el('button', { class: 'pill', type: 'button', tabindex: '-1', title, disabled, onclick: () => selectLevel(stageLevel + delta) }, label);
    const cleared = ctx.settings().acidCleared;
    toolbar.replaceChildren(...[
      modePills,
      el('div', { class: 'level-stepper' },
        stepButton('◀', t('acid.prevLevel'), stageLevel <= 1, -1),
        el('b', {}, `LEVEL ${stageLevel}`),
        stepButton('▶', t('acid.nextLevelBtn'), stageLevel >= unlockedLevel(), 1),
      ),
      cleared > 0 && el('span', { class: 'practice-desc' }, t('acid.bestCleared', { level: cleared })),
    ].filter(Boolean)); // replaceChildren would print a skipped item as the text "null"
  }

  /** Stop any running game and go back to the start screen with the new choice. */
  function backToReady() {
    cancelAnimationFrame(frame);
    state = 'ready';
    reset();
    renderToolbar();
    showIntro();
  }

  function selectMode(next) {
    if (next === playMode) return;
    playMode = next;
    ctx.updateSettings({ acidMode: next });
    backToReady();
  }

  function selectLevel(next) {
    stageLevel = Math.min(unlockedLevel(), Math.max(1, next));
    backToReady();
  }

  function reset() {
    drops.forEach((d) => d.node.remove());
    drops = [];
    level = isStage() ? stageLevel : 1;
    maxHp = isStage() ? STAGE_HP : ENDLESS_HP;
    hp = maxHp;
    cleared = 0;
    spawned = 0;
    score = 0;
    streak = 0;
    spawnTimer = 0;
    slowUntil = 0;
    session.reset();
    input.clear();
    renderGround();
    renderHud();
  }

  function spawn() {
    const text = pickRandom(wordPool);
    const roll = Math.random();
    const kind = roll < SPECIAL_CHANCE / 2 ? 'bomb' : roll < SPECIAL_CHANCE ? 'freeze' : 'normal';
    const node = el('div', { class: `drop ${kind}` }, text);
    field.append(node);
    const maxX = Math.max(0, field.clientWidth - node.offsetWidth - 8);
    const drop = { id: nextId++, text, kind, node, x: 8 + Math.random() * maxX, y: 0 };
    node.style.left = `${drop.x}px`;
    drops = [...drops, drop];
    spawned += 1;
  }

  function removeDrop(drop, cls) {
    drop.node.classList.add(cls);
    setTimeout(() => drop.node.remove(), 350);
    drops = drops.filter((d) => d.id !== drop.id);
  }

  function renderGround() {
    ground.replaceChildren(...Array.from({ length: maxHp }, (_, i) => el('i', { class: i < hp ? 'brick' : 'brick broken' })));
  }

  function renderHud() {
    const shownScore = score.toLocaleString();
    const head = isStage()
      ? t('acid.stageHud', { level, done: spawned - drops.length, total: STAGE_WORDS, score: shownScore })
      : t('acid.hud', { level, score: shownScore, cleared });
    hud.textContent = head + t('acid.targetHud', { cpm: targetCpm(level) }) + (slowUntil > performance.now() ? t('acid.slow') : '');
    const snap = session.snapshot();
    ctx.status({ cpm: snap.cpm, accuracy: snap.accuracy, time: formatTime(snap.ms), progress: t('acid.progress', { level, score: shownScore }) });
  }

  function loop(now) {
    if (state !== 'playing') return;
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    spawnTimer -= dt * 1000;
    if (spawnTimer <= 0 && (!isStage() || spawned < STAGE_WORDS)) {
      spawn();
      spawnTimer = spawnDelayMs(level, avgStrokes);
    }
    const speed = (now < slowUntil ? 0.35 : 1) / fallSeconds(level);
    const height = field.clientHeight;
    for (const drop of drops) {
      drop.y += speed * dt;
      drop.node.style.transform = `translateY(${drop.y * (height - drop.node.offsetHeight)}px)`;
      if (drop.y >= 1 && splash(drop)) return gameOver();
    }
    if (isStage() && spawned >= STAGE_WORDS && drops.length === 0) return stageClear();
    frame = requestAnimationFrame(loop);
  }

  /** A word hit the ground. Returns true when that was the last brick. */
  function splash(drop) {
    removeDrop(drop, 'splash');
    hp -= 1;
    streak = 0;
    sounds.hurt();
    renderGround();
    return hp <= 0;
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
    if (!isStage() && cleared % WORDS_PER_LEVEL === 0) {
      level += 1;
      sounds.levelUp();
      ctx.toast(t('acid.levelUp', { level }));
    }
    renderHud();
  }

  function start() {
    lang = ctx.settings().lang;
    wordPool = Object.values(lang === 'ko' ? KO_WORD_SETS : EN_WORD_SETS).flat();
    avgStrokes = averageStrokes(wordPool, strokeCount);
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
      showOverlay(t('game.pause'), [t('game.resume')]);
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

  function endGame() {
    state = 'over';
    cancelAnimationFrame(frame);
    renderHud();
  }

  const stageStats = () => [{ label: t('result.score'), value: score.toLocaleString() }, { label: t('acid.target'), value: targetCpm(level) }];

  function stageClear() {
    endGame();
    sounds.levelUp();
    if (level > ctx.settings().acidCleared) ctx.updateSettings({ acidCleared: level });
    renderToolbar();
    const next = level < STAGE_LEVELS ? level + 1 : null;
    showOverlay(t('acid.stageClear', { level }), [t('acid.gameOver')]);
    finishSession({
      mode: 'acid-stage',
      label: t('acid.stageLabel', { level }),
      title: t('acid.stageClear', { level }),
      snap: session.snapshot(),
      score: level,
      extraStats: stageStats(),
      actions: [
        next ? { label: t('acid.nextLevel', { level: next }), primary: true, onClick: () => { selectLevel(next); start(); } } : { label: t('action.retry'), primary: true, onClick: start },
        { label: t('action.retry'), onClick: start },
      ],
    });
  }

  function gameOver() {
    endGame();
    if (isStage()) {
      showOverlay(t('acid.stageFail', { level }), [t('acid.gameOver')]);
      sounds.miss();
      return;
    }
    showOverlay('GAME OVER', [t('acid.gameOver')]);
    finishSession({
      mode: 'acid-rain',
      label: t('acid.label'),
      title: t('acid.result', { score: score.toLocaleString() }),
      snap: session.snapshot(),
      score,
      extraStats: [{ label: t('result.score'), value: score.toLocaleString() }, { label: t('acid.level'), value: level }],
      actions: [{ label: t('acid.again'), primary: true, onClick: start }, { label: t('action.close'), onClick: () => {} }],
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
  renderToolbar();
  showIntro();
  return {
    onKeyDown,
    onLangChange() {}, // the running game keeps its language; the next game uses the new one
    tick: () => state === 'playing' && renderHud(),
    destroy: () => cancelAnimationFrame(frame),
  };
}

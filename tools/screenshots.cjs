// Store screenshots: opens the app's screens at 1280×800 with a 2× scale factor and saves 2560×1600 PNGs
// to docs/screenshots/<ko|en>/. Run with `npm run screenshots` (uses a throwaway profile, not your records).
// `npm run screenshots -- --windows` shows the Windows keyboard (Ctrl, Win, Alt) and saves to docs/screenshots/windows/<ko|en>/.
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const WINDOWS = process.argv.includes('--windows');
const OUT = path.join(ROOT, 'docs', 'screenshots', ...(WINDOWS ? ['windows'] : []));
const WINDOWS_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const WIDTH = 1280;
const HEIGHT = 800;
const PSALM_23 = 501; // chapters before Psalms (478) + 23, counted across the whole Bible
const RUTH = [233, 234, 235, 236];
const GROUPS = { practice: 0, games: 1, shortcuts: 2, records: 3, about: 4 };
const PRACTICE = { jamo: 0, words: 1, sentences: 2, verses: 3, longtext: 4 };
const GAMES = { acid: 0, shooter: 1 };

app.setPath('userData', path.join(app.getPath('temp'), 'typing-warrior-screenshots'));
app.commandLine.appendSwitch('force-device-scale-factor', '2');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** A ready-made user so the welcome window does not show and the screens have some progress. */
function seedScript(lang) {
  const bible = `bible-${lang}`;
  const now = Date.now();
  const records = [
    { mode: `longtext-${lang}`, label: lang === 'ko' ? '시편 22편' : 'Psalm 22', score: 312, accuracy: 98, ms: 240000, at: now - 3600000 },
    { mode: `sentences-${lang}`, label: lang === 'ko' ? '오늘의 말씀' : 'Verse of the day', score: 287, accuracy: 97, ms: 60000, at: now - 7200000 },
    { mode: `words-${lang}`, label: lang === 'ko' ? '신앙' : 'Faith', score: 254, accuracy: 99, ms: 90000, at: now - 86400000 },
  ];
  const data = {
    lang,
    uiLang: lang,
    completedStages: [...RUTH.map((n) => `${bible}-${n}`), ...Array.from({ length: 22 }, (_, i) => `${bible}-${479 + i}`), 'ko-home', 'ko-top', 'en-home'],
    longTextProgress: { [bible]: { chapter: PSALM_23, verse: 0 } },
    longTextId: bible,
    acidCleared: 4,
  };
  return `
    localStorage.clear();
    localStorage.setItem('tw.settings.v1', JSON.stringify({ theme: 'dark', showKeyboard: true, showFingers: true, sound: false }));
    localStorage.setItem('tw.profiles.v1', JSON.stringify({ activeId: 'p1', profiles: [{ id: 'p1', name: '${lang === 'ko' ? '기현' : 'Gihyun'}', createdAt: ${now}, setup: true }] }));
    localStorage.setItem('tw.profile.p1', ${JSON.stringify(JSON.stringify(data))});
    localStorage.setItem('tw.records.p1', ${JSON.stringify(JSON.stringify(records))});
  `;
}

const click = (selector, index) => `document.querySelectorAll('${selector}')[${index}]?.click();`;
const openGroup = (group) => click('#mode-nav button', GROUPS[group]);
const openSub = (index) => click('#sub-nav button', index);
const clickText = (text) => `[...document.querySelectorAll('#stage button')].find((b) => b.textContent.includes(${JSON.stringify(text)}))?.click();`;

async function press(win, keyCode, times = 1) {
  for (let i = 0; i < times; i += 1) {
    const modifiers = /^[A-Z]$/.test(keyCode) ? ['shift'] : [];
    win.webContents.sendInputEvent({ type: 'keyDown', keyCode, modifiers });
    win.webContents.sendInputEvent({ type: 'char', keyCode, modifiers });
    win.webContents.sendInputEvent({ type: 'keyUp', keyCode, modifiers });
    await wait(60);
  }
}

/** Each scene: steps to reach the screen, then a pause for it to settle. */
const SCENES = [
  { name: '1-longtext', steps: [openGroup('practice'), openSub(PRACTICE.longtext)], type: { ko: 'dughdhksms', en: 'The LORD' } /* 여호와는 on 두벌식 */, settle: 1500 },
  { name: '2-verse-of-day', steps: [openGroup('practice'), openSub(PRACTICE.sentences)], settle: 1000 },
  { name: '3-verses-by-topic', steps: [openGroup('practice'), openSub(PRACTICE.verses)], settle: 800 },
  { name: '4-word-blocks', steps: [openGroup('games'), openSub(GAMES.acid)], start: true, settle: 7000 },
  { name: '5-frontline', steps: [openGroup('games'), openSub(GAMES.shooter)], start: true, settle: 6000 },
  { name: '6-key-drills', steps: [openGroup('practice'), openSub(PRACTICE.jamo)], settle: 800 },
  { name: '7-badges', steps: [openGroup('records')], tab: { ko: '배지', en: 'Badges' }, settle: 800 },
];

async function shoot(win, lang, scene) {
  for (const step of scene.steps) {
    await win.webContents.executeJavaScript(step);
    await wait(500);
  }
  if (scene.tab) await win.webContents.executeJavaScript(clickText(scene.tab[lang]));
  if (scene.start) await press(win, 'Enter');
  if (scene.type) for (const key of scene.type[lang]) await press(win, key === ' ' ? 'Space' : key);
  await wait(scene.settle);
  const image = await win.webContents.capturePage();
  const file = path.join(OUT, lang, `${scene.name}.png`);
  fs.writeFileSync(file, image.toPNG());
  const { width, height } = image.getSize();
  process.stdout.write(`${lang}/${scene.name}.png ${width}x${height}\n`);
}

async function run() {
  const win = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    useContentSize: true,
    show: false,
    paintWhenInitiallyHidden: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false },
  });
  const page = path.join(ROOT, 'src', 'renderer', 'index.html');
  if (WINDOWS) win.webContents.setUserAgent(WINDOWS_UA); // the app picks its keyboard layout from the user agent
  for (const lang of ['ko', 'en']) {
    fs.mkdirSync(path.join(OUT, lang), { recursive: true });
    await win.loadFile(page);
    await win.webContents.executeJavaScript(seedScript(lang));
    await win.loadFile(page);
    await wait(1500);
    for (const scene of SCENES) await shoot(win, lang, scene);
  }
}

app.whenReady()
  .then(run)
  .catch((error) => {
    process.stderr.write(`Screenshots failed: ${error.stack || error}\n`);
    process.exitCode = 1;
  })
  .finally(() => app.quit());

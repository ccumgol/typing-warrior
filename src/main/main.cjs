// Electron main process: creates the window and handles fullscreen toggling.
const { app, BrowserWindow, ipcMain, Menu, shell, safeStorage } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const isMac = process.platform === 'darwin';
const APP_ICON = path.join(__dirname, '..', 'renderer', 'assets', 'icon-512.png');

function buildMenu(win) {
  // Minimal menu: keeps shortcuts like Cmd+C/Cmd+Z free for shortcut practice.
  const template = [
    ...(isMac ? [{ label: app.name, submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'quit' }] }] : []),
    {
      label: '보기',
      submenu: [
        { label: '전체화면 전환', accelerator: 'F11', click: () => win.setFullScreen(!win.isFullScreen()) },
        // No Cmd/Ctrl+R accelerator here: it is one of the practiced shortcuts.
        ...(app.isPackaged ? [] : [{ label: '개발자 도구', accelerator: 'F12', click: () => win.webContents.toggleDevTools() }]),
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 620,
    title: 'Typing Warrior',
    icon: APP_ICON, // window / taskbar icon (Windows, Linux); the packaged app uses build/icon.png
    backgroundColor: '#11131a',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // The app only ever shows its own local page.
  // Links on the 소개 page open in the system browser; the app window itself never navigates away.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url).catch((error) => console.error('Could not open link:', error));
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event) => event.preventDefault());

  buildMenu(win);
  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  const notify = () => win.webContents.send('fullscreen-changed', win.isFullScreen());
  win.on('enter-full-screen', notify);
  win.on('leave-full-screen', notify);
}

ipcMain.handle('toggle-fullscreen', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return false;
  win.setFullScreen(!win.isFullScreen());
  return win.isFullScreen();
});

ipcMain.handle('get-platform', () => process.platform);

// Secrets the user types in (e.g. their API.Bible key) are encrypted with the OS keychain / DPAPI and kept in userData.
const SECRET_NAME = /^[a-z][a-z0-9-]{0,30}$/;
const secretsFile = () => path.join(app.getPath('userData'), 'secrets.json');

function readSecrets() {
  try {
    return JSON.parse(fs.readFileSync(secretsFile(), 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Could not read secrets:', error);
    return {};
  }
}

ipcMain.handle('secret-get', (_event, name) => {
  if (!SECRET_NAME.test(name) || !safeStorage.isEncryptionAvailable()) return null;
  const stored = readSecrets()[name];
  try {
    return stored ? safeStorage.decryptString(Buffer.from(stored, 'base64')) : null;
  } catch (error) {
    console.error('Could not decrypt a secret:', error);
    return null;
  }
});

ipcMain.handle('secret-set', (_event, name, value) => {
  if (!SECRET_NAME.test(name) || typeof value !== 'string' || value.length > 500 || !safeStorage.isEncryptionAvailable()) return false;
  const secrets = readSecrets();
  if (value) secrets[name] = safeStorage.encryptString(value).toString('base64');
  else delete secrets[name];
  try {
    fs.writeFileSync(secretsFile(), JSON.stringify(secrets), { mode: 0o600 });
    return true;
  } catch (error) {
    console.error('Could not save a secret:', error);
    return false;
  }
});

app.whenReady().then(() => {
  if (isMac && !app.isPackaged) app.dock.setIcon(APP_ICON); // show the app icon while developing (npm start)
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

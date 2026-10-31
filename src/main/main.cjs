// Electron main process: creates the window and handles fullscreen toggling.
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('node:path');

const isMac = process.platform === 'darwin';

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
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
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

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

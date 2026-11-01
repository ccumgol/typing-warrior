// Exposes a tiny, safe API to the renderer (no Node access).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getSecret: (name) => ipcRenderer.invoke('secret-get', name),
  setSecret: (name, value) => ipcRenderer.invoke('secret-set', name, value),
  onFullscreenChange: (callback) => {
    ipcRenderer.on('fullscreen-changed', (_event, isFull) => callback(isFull));
  },
});

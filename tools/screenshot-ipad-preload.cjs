// Preload for `npm run screenshots -- --ipad`: gives the renderer the same window.desktop shape the iPad app
// injects (ios/TypingWarrior/bridge.js), so the screenshots show the iPad layout (no F keys, no fullscreen button).
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  platform: 'ipad',
  isAppStoreBuild: true,
  getPlatform: async () => 'ipad',
  toggleFullscreen: async () => false,
  onFullscreenChange: () => {},
});

// window.desktop for the iPad app: the same shape the Electron preload gives the renderer,
// backed by NativeBridge.swift (each call returns a Promise with the native reply).
(() => {
  const call = (type, body = {}) => window.webkit.messageHandlers.tw.postMessage({ type, ...body });
  let keyboardListener = null;
  window.desktop = Object.freeze({
    platform: 'ipad',
    isAppStoreBuild: true, // App Store builds leave out the external donation link (guideline 3.1.1)
    getPlatform: async () => 'ipad',
    toggleFullscreen: async () => false,
    onFullscreenChange: () => {},
    getSecret: (name) => call('secret-get', { name }),
    setSecret: (name, value) => call('secret-set', { name, value }),
    shareImage: (dataUrl, name) => call('share-image', { dataUrl, name }),
    hasKeyboard: () => call('keyboard'),
    onKeyboardChange: (callback) => { keyboardListener = callback; },
  });
  // Called by the app when a hardware keyboard connects or disconnects.
  window.__twKeyboardChanged = (connected) => keyboardListener?.(connected);
})();

// Exposes a small, safe bridge to the page. The page checks for window.clearmeter to enable desktop features.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clearmeter', {
  desktop: true,
  platform: process.platform,
  pin: (on) => ipcRenderer.invoke('pin', on),
  dock: (height) => ipcRenderer.invoke('dock', height),
  undock: () => ipcRenderer.invoke('undock'),
});

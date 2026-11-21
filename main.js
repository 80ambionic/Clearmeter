// Clearmeter desktop shell: one window, system-audio loopback, pin on top, dock as a bar.
const { app, BrowserWindow, session, desktopCapturer, ipcMain, screen, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// macOS 13.0–14.1 need these Chromium features for loopback; 14.2+ uses the CoreAudio tap by default.
if (process.platform === 'darwin') {
  app.commandLine.appendSwitch('enable-features', 'MacLoopbackAudioForScreenShare,MacSckSystemAudioLoopbackOverride');
}

const stateFile = () => path.join(app.getPath('userData'), 'window.json');
const readState = () => { try { return JSON.parse(fs.readFileSync(stateFile(), 'utf8')); } catch { return {}; } };
const writeState = (s) => { try { fs.writeFileSync(stateFile(), JSON.stringify(s)); } catch {} };

let win = null;
let undockBounds = null;
let pinned = false;

function createWindow() {
  const st = readState();
  win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 420, minHeight: 180,
    ...(st.bounds || {}),
    title: 'Clearmeter',
    backgroundColor: '#06222e',
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true },
  });
  pinned = !!st.pinned;
  if (pinned) win.setAlwaysOnTop(true, 'floating');
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Links open in the user's browser, never inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });

  const save = () => { if (!win.isDestroyed()) writeState({ bounds: undockBounds || win.getNormalBounds(), pinned }); };
  win.on('resize', save); win.on('move', save); win.on('close', save);
}

app.whenReady().then(() => {
  const ses = session.defaultSession;
  // getDisplayMedia() in the page → grant the first screen plus loopback (system) audio, no picker.
  ses.setDisplayMediaRequestHandler((_req, callback) => {
    desktopCapturer.getSources({ types: ['screen'] })
      .then((sources) => callback(sources.length ? { video: sources[0], audio: 'loopback' } : {}))
      .catch(() => callback({}));
  });
  const allowed = new Set(['media', 'display-capture']);
  ses.setPermissionRequestHandler((_wc, perm, cb) => cb(allowed.has(perm)));
  ses.setPermissionCheckHandler((_wc, perm) => allowed.has(perm));

  ipcMain.handle('pin', (_e, on) => { pinned = !!on; win.setAlwaysOnTop(pinned, 'floating'); writeState({ bounds: win.getNormalBounds(), pinned }); return pinned; });
  ipcMain.handle('dock', (_e, height) => {
    if (!undockBounds) undockBounds = win.getBounds();
    const area = screen.getDisplayMatching(win.getBounds()).workArea;
    win.setAlwaysOnTop(true, 'floating');
    win.setBounds({ x: area.x, y: area.y, width: area.width, height: Math.max(140, Math.min(area.height, Math.round(height))) });
    return true;
  });
  ipcMain.handle('undock', () => {
    if (undockBounds) { win.setBounds(undockBounds); undockBounds = null; }
    win.setAlwaysOnTop(pinned, 'floating');
    return true;
  });

  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

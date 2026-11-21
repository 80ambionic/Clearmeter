# Clearmeter

A clean, resizable audio metering app for Windows and macOS: spectrum, loudness (LUFS), waveform, stereo, spectrogram, oscilloscope and VU.

## Run it

You need [Node.js](https://nodejs.org) 20 or later.

```
npm install
npm start
```

## Build an installer

Build on the system you're targeting. Each platform builds its own installer.

| Platform | Command | Output in `dist/` |
|---|---|---|
| macOS (Intel + Apple Silicon) | `npm run dist:mac` | `Clearmeter-0.1.0-universal.dmg` |
| Windows (x64 + ARM) | `npm run dist:win` | `Clearmeter Setup 0.1.0.exe` and a portable `.exe` |

Or let GitHub build them: push a tag like `v0.1.0` and the **Build Clearmeter** workflow builds both platforms and publishes the installers on the Releases page. You can also start it by hand from the Actions tab, and the installers are attached to that run.

## Sources

- **System audio:** whatever your computer is playing. No loopback driver needed.
  - Windows: works straight away.
  - macOS 13 or later: the first time, macOS asks for permission. If you said no, allow Clearmeter under System Settings › Privacy & Security › Screen & System Audio Recording. Apple routes system audio through that permission. Clearmeter discards the video and only uses the audio.
- **Input device:** any microphone, interface or virtual device (BlackHole, VB-Cable, Loopback).
- **Network stream:** a direct MP3, AAC, Ogg or Opus URL, such as Icecast or Shoutcast radio. The server must allow cross-origin access.
- **Open file:** or drop an audio file onto the window.

Clearmeter remembers your last system-audio or input-device source and reconnects on launch.

## Window

- **Pin** keeps the window above other apps.
- **Dock** turns Clearmeter into a full-width bar across the top of the screen, pinned on top. Drag the line under the bar to change its height. Click Dock again to restore the window.
- Drag the borders between meters to resize them. Double-click a border to even out the space.

## Unsigned builds

These builds aren't signed with an Apple or Microsoft certificate.

- **macOS:** the first time, right-click the app and choose Open. If macOS says the app is damaged, run `xattr -cr /Applications/Clearmeter.app`.
- **Windows:** SmartScreen may warn you. Choose More info › Run anyway.

To ship it publicly, add an Apple Developer ID and a Windows code-signing certificate (see the electron-builder docs on code signing).

## Project layout

```
main.js            window, permissions, system-audio loopback, pin/dock
preload.js         small bridge the page uses for desktop features
renderer/index.html  the whole interface and all the meters
build/icon.png     app icon
```

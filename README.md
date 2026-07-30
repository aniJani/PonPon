# PonPon

A small always-on-top desktop widget: a pomodoro timer, a scratch notepad, and
controls for whatever is currently playing. Built with Tauri 2, React and Vite.

## Develop

```sh
npm install
npm run tauri dev
```

## Build

```sh
npm run tauri build
```

## Platform notes

**Media integration** differs by platform, because the system APIs do:

| | Windows | macOS | Linux |
|---|---|---|---|
| Backend | SMTC | AppleScript + media keys | MPRIS (`--features with-zbus`) |
| Track title/artist | any app | Spotify and Music.app only | any MPRIS player |
| Play/pause/skip | any app | any app, via media keys | any MPRIS player |

macOS cannot read track metadata from browsers: the system-wide source is
`MediaRemote.framework`, which has required a private Apple entitlement since
macOS 15.4. Playback *control* still reaches browsers because it is sent as a
system media key.

macOS also needs two permissions, each prompted on first use:

- **Automation** — to read from and control Spotify and Music.app.
- **Accessibility** — to send media keys. This grant is tied to the app's code
  signature, so unsigned dev builds need re-approval after every rebuild.

**Window transparency** on macOS requires the `macos-private-api` Cargo feature
and `macOSPrivateApi` in `tauri.conf.json`, both enabled here. That uses private
Apple APIs and rules out Mac App Store distribution.

# Display box

How to turn a Debian machine into the Corellia display (VISION.md section 8): full-screen Chromium kiosk on tty1, no blanking, a watchdog, and optionally the backend as a service. Target: an x86_64 mini PC (Intel N150 class) running Debian 13 with an integrated GPU. **These files were written from documentation and have not been run on a box yet**; the first provisioning is the test. What can be tested without a box is in `box/test.sh` (part of `pnpm check`): the kiosk's Chromium flags per backend URL and the watchdog's restart decisions.

## Pick a topology first

Browsers give a page the microphone only in a **secure context**: `https://` anything, or plain `http://` on `localhost` / `127.0.0.1`. A kiosk opening `http://192.168.1.10:8080` has `navigator.mediaDevices` undefined and no voice, whatever the backend does. Three ways to deploy, in order of preference:

| Topology | Kiosk URL | Voice | Notes |
|---|---|---|---|
| **Backend on the box** (`--with-backend`) | `http://127.0.0.1:8080` | works | Loopback is a secure context. No token needed (dev mode serves loopback). Leave `CORELLIA_TZ` empty: the box's zone (`timedatectl set-timezone …`) is used. |
| **Backend elsewhere, over HTTPS** | `https://<host>…` | works | On the backend host, `tailscale serve --bg --https=443 http://127.0.0.1:8080` publishes it as `https://<host>.<tailnet>.ts.net` with a valid certificate (the box must be on the tailnet). Any reverse proxy with a certificate the box trusts does the same. Run the backend with `CORELLIA_DEVICE_TOKEN` set. |
| **Backend elsewhere, plain HTTP** | `http://<lan-ip>:8080` | works in the kiosk only | `corellia-kiosk.sh` adds `--unsafely-treat-insecure-origin-as-secure=<origin>` for a non-loopback `http://` URL, which makes Chromium treat that one origin as secure for our profile. A Mac browser opening the same URL still has no voice. The token travels in clear on the LAN. |

The Docker image (`backend/Dockerfile`) is the second or third row: a browser on the Docker host at `http://localhost:8080` is fine, any other machine needs HTTPS or the kiosk flag.

## What runs where

- The **backend** (`corellia-api.service`, with `--with-backend`) runs `/opt/corellia/api` serving `/opt/corellia/client` on one port: the client, the API and the event stream. Cloud APIs (model, STT, TTS, Open-Meteo, OSRM, map tiles) are outbound from the backend or the browser.
- The **client** runs in Chromium kiosk mode (`corellia-kiosk.service`) as the `corellia` user on a minimal X session on tty1, pointed at `<backend>/?kiosk=1&token=<device token>`. The page stores the token and strips it from the address bar on first load; an off-box backend must run with `CORELLIA_DEVICE_TOKEN` set, which also makes it listen on all interfaces (dev mode binds loopback only).
- The **watchdog** (`corellia-watchdog.timer`, every 30 s from two minutes after boot) asks `/healthz` for `client_heartbeat_age_s` (the client posts `/api/heartbeat` every 30 s) and restarts the kiosk when the page has been quiet for more than 90 s, when the backend has been unreachable for five checks in a row, or when no client has checked in for ten checks in a row (Chromium loaded before the backend answered and sits on its own error page, which posts no heartbeat). Thresholds: `CORELLIA_WATCHDOG_MAX_AGE`, `CORELLIA_WATCHDOG_MAX_FAILS`, `CORELLIA_WATCHDOG_MAX_NOCLIENT` in `/etc/corellia/box.env`.

## Build the release (on the development machine)

`corellia-api.service` expects the Linux binary at `/opt/corellia/api` and the built client at `/opt/corellia/client`. Build both on the Mac and copy them over:

```bash
./box/release.sh                      # -> box/release/api (linux/amd64, static) and box/release/client/
scp -r box/release <box>:/tmp/corellia-release
```

`release.sh` runs `pnpm -C client build` and `CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build ./cmd/api` with the version and commit baked in. Skip this for a kiosk-only box whose backend runs elsewhere.

## Provision (on the box, as root)

```bash
# Backend on the box (recommended first setup; voice works, no token):
sudo ./provision.sh --backend http://127.0.0.1:8080 --with-backend --release /tmp/corellia-release

# Kiosk only, backend elsewhere over HTTPS:
sudo ./provision.sh --backend https://office.tail1234.ts.net --token <device token>
```

`provision.sh`:

1. installs Chromium, a minimal X session (`xserver-xorg`, `xinit`, `openbox`, `unclutter`), `curl` and `jq`;
2. creates the `corellia` user and an `.xinitrc` that disables DPMS and screen blanking and launches `corellia-kiosk.sh`; removes the tty1 auto-login override that earlier versions installed (the kiosk unit owns tty1 now) and lets a non-console user start Xorg (`/etc/X11/Xwrapper.config`);
3. writes `/etc/corellia/box.env` (`CORELLIA_URL`, `CORELLIA_DEVICE_TOKEN`, `CORELLIA_KIOSK_QUERY`) and installs the scripts and systemd units;
4. with `--release <dir>`, installs `api` and `client/` from that directory into `/opt/corellia`;
5. with `--with-backend`, installs and enables `corellia-api.service`, creates `/etc/corellia/api.env` (`PORT`, `CORELLIA_CLIENT_DIR`, `CORELLIA_DATA_DIR`; add `ANTHROPIC_API_KEY` and the rest from `.env.example` there) with mode `0600`, and warns if the binary or client is missing;
6. enables `corellia-kiosk.service` and `corellia-watchdog.timer` and sets the default target to `multi-user`.

Reprovisioning is idempotent; the box holds no state that matters (the backend's `CORELLIA_DATA_DIR`, `/var/lib/corellia` with `--with-backend`, is the only state).

### tty1 and Xorg

`corellia-kiosk.service` runs `startx … -- :0 vt1 -keeptty` as `corellia` with `PAMName=login` and `TTYPath=/dev/tty1`, and declares `Conflicts=getty@tty1.service`, so the login prompt Debian would otherwise start on tty1 never shares the terminal with the X server. When the backend is on the box the unit also starts `After=corellia-api.service`. Things to check on the first provisioning, in this order, if the screen stays black: `journalctl -u corellia-kiosk` (Xorg refusing the VT: check `Xwrapper.config`; `-keeptty` not accepted by the installed Xorg: drop it), `chrome://gpu` (below), and `systemctl status getty@tty1` (must be inactive).

## First test: can it hold 30 fps?

1. Open `<backend>/?kiosk=1&stats=1` on the box. The overlay bottom-left shows fps, frame time, render scale and particle count.
2. Idle for a minute. Target: 60 fps at scale 1.0 on 1080p; on 4K the adaptive controller should settle at a scale between 0.5 and 1.0 with fps ≥ 30. If it sits at 0.5 and under 30 fps, lower the particle count with `?particles=6000` (or `4000`) and record the number in `/etc/corellia/box.env` `CORELLIA_KIOSK_QUERY`.
3. Ask for a map ("show me a map of Berlin") and a chart; fps should not drop below 30 while a panel is on screen.
4. Check `chrome://gpu` on the box once: "WebGL2: Hardware accelerated" must be present. Software rendering means a missing GPU driver (`mesa-va-drivers`, `intel-media-va-driver`) or a VM without passthrough.

## Audio

- Microphone and speakers are on the same box: `getUserMedia` asks for echo cancellation, noise suppression and auto gain; verify with the mic indicator that the agent does not trigger itself while speaking. If it does, lower the speaker volume or raise the VAD gate (a `?vad=` tuning flag is a planned follow-up).
- Chromium needs `--autoplay-policy=no-user-gesture-required` (set in `corellia-kiosk.sh`) so speech plays without a click, and `--use-fake-ui-for-media-stream` so the mic prompt never appears.
- If the mic indicator says **voice needs HTTPS or localhost**, the kiosk URL is a plain `http://` LAN address and the flag did not apply: check `CORELLIA_URL` in `/etc/corellia/box.env` and the Chromium command in `journalctl -u corellia-kiosk` (`CORELLIA_KIOSK_PRINT=1 /opt/corellia/corellia-kiosk.sh` prints it).
- A hardware mute switch is advisable (VISION 8); `Ctrl+M` is the software mute.

## Files

| File | Purpose |
|---|---|
| `provision.sh` | One-shot, idempotent setup; `--release` installs the binary and client. |
| `release.sh` | Builds the Linux binary and the client on the development machine. |
| `corellia-kiosk.sh` | Starts Chromium in kiosk mode with the right flags (secure-context flag for a plain LAN URL); restarts it if it exits. |
| `corellia-kiosk.service` | systemd unit owning tty1 and running the X session for the `corellia` user. |
| `corellia-watchdog.sh` + `.service` + `.timer` | Restarts the kiosk when the client heartbeat goes stale, when no client has ever checked in, or when the backend is unreachable for too long. |
| `corellia-api.service` | Runs the backend binary with `/etc/corellia/api.env`. |
| `xinitrc` | Minimal X session: no blanking, hidden cursor, kiosk script. |
| `test.sh` | Checks the kiosk flags and the watchdog decisions without a box (`pnpm check`). |

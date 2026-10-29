# Display box

How to turn a Debian machine into the Corellia display (VISION.md section 8): full-screen Chromium kiosk, auto-login, no blanking, a watchdog, and the backend as a service. Target: an x86_64 mini PC (Intel N150 class) running Debian 13 with an integrated GPU. **These files were written from documentation and have not been run on a box yet**; the first provisioning is the test.

## What runs where

- The **backend** (`corellia-api.service`) can run on the box itself or on any host the box can reach. It serves the client, the API and the event stream on one port. Cloud APIs (model, STT, TTS, Open-Meteo, OSRM, map tiles) are outbound from the backend or the browser.
- The **client** runs in Chromium kiosk mode (`corellia-kiosk.service`) as the auto-logged-in `corellia` user on a minimal X session, pointed at `http://<backend>:8080/?kiosk=1&token=<device token>`. The page stores the token and strips it from the address bar on first load; the backend must run with `CORELLIA_DEVICE_TOKEN` set, which also makes it listen on all interfaces (dev mode binds loopback only and the box could never reach it).
- The **watchdog** (`corellia-watchdog.timer`) asks `/healthz` for `client_heartbeat_age_s` (the client posts `/api/heartbeat` every 30 s) and restarts the kiosk when the page has been quiet for more than 90 s.

## Provision

```bash
# On the box, as root, from a checkout or a copied box/ directory:
sudo ./provision.sh --backend http://127.0.0.1:8080 --token <device token>
```

`provision.sh`:

1. installs Chromium, a minimal X session (`xserver-xorg`, `xinit`, `openbox`, `unclutter`), `curl` and `jq`;
2. creates the `corellia` user with auto-login on tty1 and an `.xinitrc` that disables DPMS and screen blanking and launches `corellia-kiosk.sh`;
3. installs the systemd units and the environment file `/etc/corellia/box.env` (`CORELLIA_URL`, `CORELLIA_DEVICE_TOKEN`);
4. enables `corellia-kiosk.service` and `corellia-watchdog.timer`; with `--with-backend` also installs and enables `corellia-api.service` (expects the binary at `/opt/corellia/api` and the client at `/opt/corellia/client`, with `/etc/corellia/api.env` holding the backend environment, see `.env.example`).

Reprovisioning is idempotent; the box holds no state that matters (the backend's `CORELLIA_DATA_DIR` is the only state, and it can live off-box).

## First test: can it hold 30 fps?

1. Open `http://<backend>:8080/?kiosk=1&stats=1` on the box. The overlay bottom-left shows fps, frame time, render scale and particle count.
2. Idle for a minute. Target: 60 fps at scale 1.0 on 1080p; on 4K the adaptive controller should settle at a scale between 0.5 and 1.0 with fps ≥ 30. If it sits at 0.5 and under 30 fps, lower the particle count with `?particles=6000` (or `4000`) and record the number in `/etc/corellia/box.env` `CORELLIA_KIOSK_QUERY`.
3. Ask for a map ("show me a map of Berlin") and a chart; fps should not drop below 30 while a panel is on screen.
4. Check `chrome://gpu` on the box once: "WebGL2: Hardware accelerated" must be present. Software rendering means a missing GPU driver (`mesa-va-drivers`, `intel-media-va-driver`) or a VM without passthrough.

## Audio

- Microphone and speakers are on the same box: `getUserMedia` asks for echo cancellation, noise suppression and auto gain; verify with the mic indicator that the agent does not trigger itself while speaking. If it does, lower the speaker volume or raise the VAD gate (a `?vad=` tuning flag is a planned follow-up).
- Chromium needs `--autoplay-policy=no-user-gesture-required` (set in `corellia-kiosk.sh`) so speech plays without a click, and `--use-fake-ui-for-media-stream` so the mic prompt never appears.
- A hardware mute switch is advisable (VISION 8); `Ctrl+M` is the software mute.

## Files

| File | Purpose |
|---|---|
| `provision.sh` | One-shot, idempotent setup. |
| `corellia-kiosk.sh` | Starts Chromium in kiosk mode with the right flags; restarts it if it exits. |
| `corellia-kiosk.service` | systemd unit running the X session for the `corellia` user on tty1. |
| `corellia-watchdog.sh` + `.service` + `.timer` | Restarts the kiosk when the client heartbeat goes stale or the backend is unreachable for too long. |
| `corellia-api.service` | Runs the backend binary with `/etc/corellia/api.env`. |
| `xinitrc` | Minimal X session: no blanking, hidden cursor, kiosk script. |

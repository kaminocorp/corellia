# Phase 10: Display box, hardening and docs

**Date:** 2026-10-29. **Branch:** `feat/vision-implementation`. **Changelog:** 0.15.10. **Roadmap:** [`../executing/roadmap.md`](../executing/roadmap.md) Phase 10.

## Summary

The last phase makes the build deployable and the repository coherent. `box/` holds everything needed to turn a Debian mini PC into the display (Chromium kiosk, auto-login, no blanking, a heartbeat-driven watchdog, optional backend service) with a README that includes the 30 fps and audio test procedures. The backend gained a client heartbeat, structured request logging and a Dockerfile; the client gained a heartbeat, an offline banner, an error boundary around the generated UI so a bad render never takes the 3D agent down, and a `?soak=1` driver for long-run checks. README, CLAUDE.md, stack.md, the docs index and the toolchain blueprints now describe the new system. The box scripts are written from documentation and have not run on hardware.

## What was built

- `box/`: `provision.sh` (idempotent: packages incl. Chromium and VA-API drivers, `corellia` user with tty1 auto-login, `/etc/corellia/box.env`, units, optional backend service), `corellia-kiosk.sh` (Chromium kiosk flags: fullscreen, no first-run or crash bubbles, autoplay without gesture, fake media-stream UI so the mic prompt never shows, GPU rasterisation; restarts on exit; `?kiosk=1&token=`), `xinitrc` (no DPMS/blanking, hidden cursor, openbox), `corellia-kiosk.service`, `corellia-watchdog.sh` + `.service` + `.timer` (every 30 s: restart the kiosk when `/healthz` reports a client heartbeat older than 90 s or the backend has been unreachable five checks in a row), `corellia-api.service` (hardened unit), `README.md` (what runs where, provisioning, the 30 fps test with `?stats=1` and `?particles=`, `chrome://gpu` check, audio and echo notes).
- Backend: `httpsrv.Heartbeat` (`POST /api/heartbeat`; `/healthz` reports `client_heartbeat_age_s`, -1 before the first check-in), `requestLogger` (one slog line per request, skipping the stream, heartbeat and assets), `backend/Dockerfile` (multi-stage: client build, static Go binary, alpine runtime, `/data` volume). Graceful shutdown, body limits and SSE keepalives were already in place.
- Client: `session/heartbeat.ts` (POST every 30 s with `keepalive`), `app/OfflineBanner.tsx` (shown on reconnecting/offline), `app/ErrorBoundary.tsx` (wraps the renderer inside the Stage; failures are reported to the debug errors and the agent keeps running), `session/soak.ts` (`?soak=1` sends a scripted turn every 8 s). Tests (+4).
- Docs: `README.md` (product, how it works, run, check, layout, box, history), `CLAUDE.md` (layout of every package, the ten rules, commands, conventions), `docs/stack.md` (picks, codegen, environment, HTTP API table, deploy), `docs/README.md`, `docs/blueprints/{toolchain-overview,codegen-cheatsheet}.md`. Roadmap progress table closed out.

## Design decisions

- **Watchdog on the client's heartbeat, not on Chromium's process.** A hung page keeps its process alive; the only honest liveness signal is the page itself posting through the backend. The backend exposes the age on `/healthz` so the watchdog needs nothing but `curl` and `jq`.
- **Kiosk restarts, backend does not.** A backend problem shows as the offline banner and the native EventSource reconnect; only sustained unreachability restarts the kiosk, because the backend may live on another host.
- **Error boundary around generated UI only.** The agent scene and the input stay up when a component throws; the failure lands in `?debug=1`.
- **Docker image serves both halves** so a single container is a complete Corellia; the box can run it or point at it.
- **Docs describe, roadmap records.** README and stack describe what exists; the roadmap keeps the defaults and the phase history; completion notes keep the detail.

## Files changed

Added: `box/*`, `backend/Dockerfile`, `backend/internal/httpsrv/{heartbeat,logging}.go`, `client/src/app/{ErrorBoundary,OfflineBanner}.tsx`, `client/src/session/{heartbeat,soak}.ts`, `client/src/app/hardening.test.tsx`. Edited: `backend/internal/httpsrv/server.go` (+test), `backend/cmd/api/main.go`, `client/src/app/App.tsx`, `client/src/renderer/Stage.tsx`, `README.md`, `CLAUDE.md`, `docs/stack.md`, `docs/README.md`, `docs/blueprints/*.md`, docs.

## How to run

```bash
# One image
docker build -f backend/Dockerfile -t corellia . && docker run -p 8080:8080 -v corellia-data:/data corellia
# Box
sudo box/provision.sh --backend http://<host>:8080 --token <CORELLIA_DEVICE_TOKEN> [--with-backend]
```

Locally: `pnpm -C client build && cd backend && go run ./cmd/api`, then `curl localhost:8080/healthz` shows `client_heartbeat_age_s` ticking once the page is open; stop the backend and the banner appears; `?soak=1` keeps the screen busy for a leak check.

## How to test

`pnpm check`: client 120 tests, type-check, lint (0 errors), build; Go all packages green. Shell scripts pass `bash -n`. Verified here: all green. **Not verified here:** Docker build (no Docker socket), the box scripts (no Debian box), a real 30-minute soak in a browser.

## Known gaps

- The `box/` files are untested on hardware; expect at least one round of fixes on first provisioning (package names, Chromium flags, VA-API driver choice, PulseAudio vs PipeWire).
- No GitHub Actions workflow; `pnpm check` is the CI command to wire.
- `docs/refs/design-system.md` still describes the v1 visual language and is kept as a reference only.
- Mission-side items stay open: the Jev logic read-through (VISION 6), the OpenWorld voice pipeline terms (VISION 4) and the DeepSeek harness code boundary (VISION 7). Each has a seam and a default in the code.

# Phase 1: Restructure and skeletons

**Date:** 2026-10-29. **Branch:** `feat/vision-implementation`. **Changelog:** 0.15.1. **Roadmap:** [`../executing/roadmap.md`](../executing/roadmap.md) Phase 1.

## Summary

The legacy control-plane code is gone. In its place: a Go backend skeleton (config, device-token auth, Chi router with health, `/api/config`, CORS and static client serving with SPA fallback) and a Vite + React + TypeScript client skeleton (full-screen black shell, always-focused command input, connection indicator, salvaged shader sources). One Go binary serves the built client. All tests, lint, type-check and builds are green, and the end-to-end check (backend serving the built client) passes.

## What was built

### Removed

- `frontend/` (Next.js app), `backend/internal/*` (agents, adapters, auth/JWKS, db/sqlc, deploy/Fly, gen, httpsrv, organizations, tools, users), `backend/cmd/smoke-deploy`, `backend/migrations`, `backend/queries`, `backend/sqlc.yaml`, `backend/fly.toml`, `backend/Dockerfile`, `shared/proto/`, `scripts/capture-login-video.mjs`, the root `pnpm-lock.yaml`.
- Go dependencies pruned to `caarlos0/env`, `go-chi/chi`, `joho/godotenv`.
- `adapters/hermes/` is untouched (target of the Phase 7 hermes runtime).

### Backend (`backend/`)

- `internal/config`: `Config{Port, DeviceToken, ClientDir, DataDir, AgentName, DevOrigins}`, `Load()` returns an error instead of exiting (the entrypoint decides), `Validate()` (port range, non-blank name, token length ≥ 16 when set), `DevMode()`.
- `internal/auth`: `Middleware(token)`. Empty token = dev mode, loopback clients only (403 otherwise). Set token = constant-time bearer check via `Authorization` header or `?token=` (for `EventSource`).
- `internal/httpsrv`: `New(Deps)` with `/healthz` (JSON: ok, version, commit, dev_mode, time), `/api/*` group behind the auth middleware with `NoCache` and JSON 404s, `/api/config` (agent name, dev mode, version), CORS for configured dev origins, and the static handler: hashed `/assets/*` immutable, everything else falls back to `index.html` with `no-store` (including paths containing `..`, which `http.ServeFile` would reject), 503 with a hint when the client is not built.
- `cmd/api`: JSON logs, warns in dev mode, creates the data dir, graceful shutdown on SIGINT/SIGTERM, build info via `-ldflags "-X main.version=… -X main.commit=…"`.
- `.air.toml` updated for the new layout.

### Client (`client/`)

- Vite 7, React 19.2, TypeScript 5.9, Tailwind 4 (via `@tailwindcss/vite`), React Three Fiber 9 + three 0.184 (installed, used from Phase 5), vitest 3 + Testing Library + jsdom, eslint 9 flat config with typescript-eslint, react-hooks and react-refresh.
- `index.css`: design tokens reduced from the v1 `globals.css` (dark only, state colours for idle/listening/thinking/speaking/error, offline-safe font stacks, viewport-scaled root font size, cursor hidden under `html[data-kiosk="1"]`, telemetry pulse).
- `app/App.tsx`: shell with header (name + connection indicator polling `/healthz` every 5 s), placeholder focal ring where the 3D agent will go, footer command input.
- `app/CommandInput.tsx`: focused on mount, refocuses after blur and when a printable key is pressed anywhere; `Enter` submits trimmed text, `Esc` clears. Tested.
- `session/health.ts`: `fetchHealth()` with injectable fetch. Tested.
- `agent3d/shaders/`: salvaged `simplex-noise.ts`, `nebula-shaders.ts`, `swarm-vert.ts`, `swarm-frag.ts` (headers unchanged, import path adjusted). `public/logo.png` carried over.
- `vite.config.ts`: dev server on 5173 (strict) proxying `/api` and `/healthz` to `CORELLIA_BACKEND_URL` (default `http://localhost:8080`); vitest config inline.

### Repo

- Root `package.json` (workspace scripts: `dev`, `build`, `test`, `type-check`, `lint`, `check`), `pnpm-workspace.yaml` (`client`, `allowBuilds: esbuild`), `Procfile`, `.gitignore`, `.env.example` rewritten for the new variable set, `CLAUDE.md` rewritten (interim; polished in Phase 10), `README.md` and `docs/stack.md` carry a direction note.

## Design decisions

- **One binary serves the client.** `CORELLIA_CLIENT_DIR` points at the Vite output; no second web server on the box. `go:embed` was not used because the client lives outside the Go module; a copy step would be needed and a path is simpler.
- **Vite proxy instead of CORS in dev.** The client has no API URL setting at all. CORS middleware exists only for the case of a client served from a different host.
- **Dev mode is loopback-only.** With no token the API refuses non-loopback clients instead of being open, so a laptop on a shared network is not an open agent endpoint.
- **`config.Load` returns an error.** The old package called `os.Exit` from inside the library; the entrypoint now owns process exit, which keeps `config` testable.
- **Index served via `ServeContent`.** `http.ServeFile` rejects any URL containing `..` with 400; for an SPA the right answer is the shell, so the index is streamed by hand.
- **Fonts are system stacks.** The box is outbound-only to the backend and cloud APIs; no font CDN.
- **pnpm 12 `allowBuilds`.** pnpm 12 reads build approvals from `pnpm-workspace.yaml` (`allowBuilds`), not `package.json`'s `pnpm.onlyBuiltDependencies`; esbuild is the only approved build.

## Files changed

Removed: see above. Added: `backend/cmd/api/main.go`, `backend/internal/{config,auth,httpsrv}/*`, `client/**` (package, configs, `src/app`, `src/session`, `src/agent3d/shaders`, `src/test`, `public/logo.png`), `pnpm-lock.yaml`. Edited: `backend/go.mod`, `backend/go.sum`, `backend/.air.toml`, `package.json`, `pnpm-workspace.yaml`, `Procfile`, `.gitignore`, `.env.example`, `CLAUDE.md`, `README.md`, `docs/stack.md`, `docs/changelog.md`, `docs/executing/roadmap.md`.

## How to run

```bash
pnpm install
pnpm -C client build
cd backend && go build -o bin/api ./cmd/api && ./bin/api     # http://localhost:8080
# or, for hot reload on both sides:
overmind start                                               # client on :5173 (proxied API), backend on :8080
```

Open `http://localhost:8080` (or `:5173` in dev) in a browser on macOS: black screen, "online · dev" in the header, the input is focused without a click, typing and pressing Enter echoes the text.

## How to test

```bash
cd backend && go vet ./... && go test ./...
pnpm -C client type-check && pnpm -C client lint && pnpm -C client test && pnpm -C client build
pnpm check          # all of the above
```

Verified in this environment: Go tests (config, auth, httpsrv: 10 tests), client tests (8), lint, type-check, build; manual curl against the built binary: `/healthz` 200 JSON, `/api/config` 200 from loopback, `/` and `/anything?debug=1` return the SPA shell, `/assets/*.css` served with the immutable cache header.

## Known gaps

- Nothing renders in 3D yet; the focal ring is a placeholder (Phase 5).
- The input echoes locally; no backend turn exists until Phase 3.
- `docs/stack.md`, `README.md` body and `docs/refs/design-system.md` still describe the removed v1 until the Phase 10 rewrite.
- Not verified on macOS itself (this environment is Linux); the client uses only standard browser APIs so far.

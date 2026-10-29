# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this repo is

Corellia is a personal agent workspace: an always-on office screen showing a 3D agent that the user talks to by keyboard and voice, answering with speech and with UI assembled from a closed component catalog. Read [`docs/VISION.md`](docs/VISION.md) first, then [`docs/executing/roadmap.md`](docs/executing/roadmap.md) (the plan and its defaults for the open questions). Each phase has notes in `docs/completions/` and an entry in `docs/changelog.md`.

The previous product (a control plane for agent fleets) was removed in Phase 1; its docs are under `docs/archive/`, its code in git history. Do not reintroduce it.

**Live code is authoritative.** When a doc conflicts with the code, the code wins; fix the doc.

## Layout

```
backend/            Go 1.26, one binary: API + SSE stream + static client
  cmd/api           entrypoint            cmd/runtime-spike   VISION 7 evaluation script
  internal/
    config          the only os.Getenv reader (validates at boot)
    auth            device-token middleware (dev mode = loopback only)
    contract        embedded schemas + catalog, validators, generated types (gen/, embed/: never hand-edit)
    uispec          spec tree: binding paths, reducer, catalog-aware validation
    catalog         model-facing description, fit-ranking, display class
    runtime         AgentRuntime seam; local/, anthropic/, openaicompat/, hermes/, deepseek/ (stub), rtselect/, prompt/, toolexec/
    tools           registry + builtin/ (time, geocode, weather, memory, reminders, directions, show_ui)
    actions         propose/confirm gate       decision   Jev seam + rules default
    session         turns, spec, proposals, proactive delivery, event bus
    voice           STT/TTS seams (none, openai)  memory   file-backed notes/reminders/transcript
    proactive       reminder scheduler + ambient clock      store   atomic JSON + JSONL
    httpsrv         Chi router, request guards (guards.go), handlers (thin), SSE, static client
client/             Vite + React 19 + TypeScript + R3F static bundle
  e2e/              Playwright smoke test (pnpm e2e)
  src/contract      generated types (gen/: never hand-edit), ajv validators, reducer, checks
  src/components    one React component per catalog entry + registry
  src/renderer      bindings, hotkeys, placement, decay, global keys
  src/agent3d       nebula scene, state machine, adaptive resolution, fallback
  src/voice         VAD, capture, browser STT, playback, activation, controller
  src/platform      PlatformAdapter (browser; shell stub)
  src/session       store, SSE stream, API, auth, heartbeat, soak
shared/             schema/*.schema.json, catalog/catalog.json, fixtures, REDUCER.md
box/                display-box provisioning
adapters/hermes/    legacy Hermes sidecar image (hermes runtime target)
```

## Rules (treated as defects when broken)

1. `AgentRuntime` is the only seam to any model, harness or agent framework. Provider SDKs and wire formats stay inside `internal/runtime/<impl>/`.
2. The client renders only what validates against the catalog; the server validates every spec op before forwarding (`uispec.Validator`). Nothing of the model's choosing reaches the DOM except typed props the catalog declares.
3. One schema, two languages: `shared/schema` and `shared/catalog` are the source. Run `pnpm contracts:generate` after changing them; generated Go and TS are committed and drift-tested.
4. All env vars are read in `backend/internal/config`. The client reads runtime values from the API.
5. Side effects go through propose → confirm. Tools that mutate anything outside Corellia's own store are `RequiresConfirm`.
6. No pointer paths. Every action is reachable by keyboard or voice.
7. Deferred features are real interface implementations returning `NotImplemented`, never fake UI.
8. No Mission or OpenWorld code is read or copied.
9. Handlers in `httpsrv` stay thin: parse, call a domain package, write the response.
10. The reducer semantics in `shared/schema/REDUCER.md` are normative for both languages; the shared fixtures must pass in both.

## Commands

```bash
# Backend (from backend/)
go vet ./... && go test ./...
go run ./cmd/api                                    # serves ../client/dist on :8080
go run ./cmd/runtime-spike -runtime local          # VISION 7 script → docs/executing/spikes/
air                                                 # hot reload

# Client (from repo root)
pnpm install
pnpm -C client dev                                  # :5173, proxies /api and /healthz to :8080
pnpm -C client type-check && pnpm -C client lint && pnpm -C client test && pnpm -C client build

# Contract (after editing shared/)
pnpm contracts:generate
cd backend && go test ./internal/uispec -update     # rewrite reducer goldens (then run the client tests)

# Browser smoke test (Playwright, real Chromium against the Go server; part of pnpm check)
pnpm e2e                                            # client/e2e/*.spec.ts; scripts/chromium-libs.sh fetches libs without sudo on Linux

# Everything
pnpm check
overmind start
```

## Conventions

- Go: table-driven tests colocated as `<file>_test.go`; domain packages take narrow interfaces so tests need no network or services (httptest fakes for every external API). Format with `$(go env GOROOT)/bin/gofmt -w .` (gofmt is not on PATH here).
- Client: vitest + Testing Library; imperative audio/WebGL code lives in classes with injected deps (the React Compiler lint rules are disabled only in `agent3d/Nebula.tsx`).
- Environment: `backend/.env` (gitignored), template in `.env.example`. No credentials are required for development; cloud runtimes and voice providers activate when their keys are set.
- Git: all work on `feat/vision-implementation`; never push to master, never merge, never open PRs, never deploy.
- Docs: every phase ends with `docs/completions/phase-NN-<name>.md`, a `docs/changelog.md` entry (index line plus dated section, latest first) and an update to the roadmap's progress table.

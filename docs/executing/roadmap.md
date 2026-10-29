# Corellia vision implementation roadmap

**Status:** Phase 13 (beta readiness: the round-2 review's blocking gaps that need no key or microphone) done on 2026-10-29. Phases 11 and 12 (review fixes; verifiable cloud runtime, streamed speech, strict CSP) were done the same day, as were Phases 0-10. The second independent review ([`review-2026-10-30.md`](review-2026-10-30.md)) rated `0c40505` an alpha; after Phase 13 what stands between the build and a beta is the owner's two runs in [`owner-checklist.md`](owner-checklist.md) (live model, Mac microphone). Written 2026-10-29 before any code change; updated at each phase boundary (the "Progress" table at the end).
**Scope:** implement [`../VISION.md`](../VISION.md) end to end: an always-on personal agent workspace (3D agent, keyboard + voice, generated UI from a closed catalog, propose/confirm actions, decision layer, swappable agent runtime, display-box deployment).
**Branch:** all work on `feat/vision-implementation`, pushed only to that branch. No merges, no PRs, no deploys.
**Companion records:** one `docs/completions/phase-NN-<name>.md` per completed phase, one `docs/changelog.md` entry per phase.

---

## 0. Ground truth at the start

What the repo and the environment look like on 2026-10-29, because it drives several defaults below.

| Fact | Consequence |
|---|---|
| The tree holds the legacy v1 control plane (Go + Chi + Connect-go + pgx/sqlc, Next.js 16 frontend, Fly deploy, Supabase auth, Hermes adapter image). Build, vet and all Go tests pass. | Nothing is deployed and the vision allows full replacement, so the legacy product code is removed in Phase 1 rather than carried. Git history keeps it; `docs/archive/` keeps its docs. |
| Dev box has Go 1.26, Node 24, pnpm 12, Docker (socket not accessible), **no** `buf`, `sqlc`, `goose`, `psql`, no Postgres, no API keys of any kind, no `backend/.env`. | The new system must run and be testable with zero external services and zero secrets. Cloud inference, STT and TTS are real integrations behind interfaces, activated by env vars, and every one has a keyless local path so the product is demonstrable in a browser on macOS without credentials. Protobuf codegen needs `buf`, which is not available: the contract moves to JSON Schema (VISION 5.3 default). |
| Reusable assets: Ashima simplex-noise GLSL, the two-layer nebula shaders (`nebula-shaders.ts`) and the swarm morph scheduler, plus the dark design tokens in `globals.css`. | Salvaged into the new client in Phase 1 (copied with attribution in file headers), then reshaped in Phase 5. |
| `adapters/hermes/` (sidecar `POST /chat`, digest-pinned image, `corellia_guard` plugin) works but cannot be built here (no Docker socket). | Kept in the tree untouched. The Hermes `AgentRuntime` adapter (Phase 7) targets the sidecar's HTTP contract; it is exercised with an in-process fake in tests and documented as unverified against a live sidecar. |

---

## 1. Decisions on VISION.md section 11 (defaults we proceed with)

Each is a default, not a verdict. Each is isolated behind a seam so reversing it is a local change.

| # | Open question | Default taken | Where it is isolated |
|---|---|---|---|
| 1 | Hermes or the DeepSeek harness | **Neither is chosen; both are made cheap to run.** `AgentRuntime` is the only seam. Ship four implementations: `local` (deterministic, keyless, drives the whole product in dev), `anthropic` (Claude Messages API, streaming, tool use; the primary cloud runtime), `openai-compatible` (any OpenAI-shaped endpoint, which covers DeepSeek models directly, DeepSeek's own API, and Hermes-style gateways), `hermes` (the existing sidecar's `/chat` contract, non-streaming). The OpenWorld DeepSeek *harness* is a `NotImplemented` runtime until its code-boundary terms (VISION 7, licence row) are cleared, and nothing from Mission or OpenWorld is read or copied. Runtime selection is `CORELLIA_RUNTIME=auto|local|anthropic|openai|hermes` with `auto` = anthropic if `ANTHROPIC_API_KEY` is set, else openai if `OPENAI_API_KEY` or `OPENAI_BASE_URL` is set, else local. A `cmd/runtime-spike` tool runs the VISION 7 evaluation script against any runtime and prints the metrics. | `backend/internal/runtime/` |
| 2 | How the Jev logic works | **Unknown and unreachable from here** (needs David). The decision layer is a `Decider` interface in the backend with a rules-based default that already does the five things VISION 6 lists (respond?, modality, components/detail, timing, clear/replace). It takes a `DecisionInput` (conversation tail, candidate reply, candidate spec, screen state, proactive source) and returns a `Decision`. A model-backed implementation can be dropped in later. | `backend/internal/decision/` |
| 3 | What from the OpenWorld voice pipeline carries over | **Nothing is imported.** Corellia gets its own pipeline: client capture + energy VAD + barge-in, `STT`/`TTS` provider interfaces in the backend with an OpenAI-API provider (Whisper-shaped `/v1/audio/transcriptions`, `/v1/audio/speech`) gated on `OPENAI_API_KEY`, and a keyless browser path (Web Speech API recognition + `speechSynthesis`) selected automatically when no server provider is configured. Vendor swap is one file. | `backend/internal/voice/`, `client/src/platform/`, `client/src/voice/` |
| 4 | Schema format and transport | **JSON Schema** is the single source of truth (`shared/schema/*.schema.json`) and the catalog is data (`shared/catalog/catalog.json`). Generated into Go (types via `go-jsonschema`, runtime validation via `santhosh-tekuri/jsonschema`) and TypeScript (types via `json-schema-to-typescript`, runtime validation via `ajv`). Both generated trees are committed and a test in each language fails on drift. **Transport:** plain JSON over HTTP for client→server (turns, confirms, audio) and **SSE** for server→client events. Protobuf, buf and Connect are dropped (no `buf` here, and `oneof`-per-component fits the recursive spec badly). | `shared/`, `backend/internal/contract/`, `client/src/contract/` |
| 5 | Where the decision layer lives | **Backend.** The runtime emits candidates (text, spec ops, proposals); the decision layer in the backend decides what the screen and speakers get. Runtimes stay dumb about presentation. | `backend/internal/decision/` |
| 6 | Activation | **Open mic, VAD-gated, toggled by key, off at boot.** `Ctrl+Space` toggles listening; while on, an energy VAD segments utterances. A persistent on-screen mic indicator shows off / listening / capturing / muted. Wake word is deferred (privacy and keyless constraint). Push-to-talk is available as `CORELLIA_VOICE_MODE=ptt` (hold `Ctrl+Space`). | `client/src/voice/activation.ts` |
| 7 | 3D agent style and render budget | **Particle nebula** evolved from the existing two-layer shader work, with a state machine (idle, listening, thinking, speaking, error) mapped to coherence, amplitude, palette and rotation, and audio-reactive modulation while speaking. Adaptive resolution: device-pixel-ratio scaling driven by a frame-time controller targeting 30 fps minimum, 60 preferred. A `?stats=1` overlay reports fps and render scale for the box test VISION 8 asks for. | `client/src/agent3d/` |
| 8 | Shell on the box | **Chromium kiosk**, started by systemd, with a watchdog. Tauri/Electron deferred; the platform adapter is the seam (`PlatformAdapter` with `browser` implementation; a `shell` implementation is a stub that throws `NotImplemented`). | `client/src/platform/`, `box/` |
| 9 | Auth and persistence | **Device token + local state.** Supabase and Postgres are dropped. `CORELLIA_DEVICE_TOKEN` is a bearer token the client presents (header for fetch, query parameter for `EventSource`); when unset the backend accepts loopback clients only (dev mode) and logs a warning. State is files under `CORELLIA_DATA_DIR` (transcript JSONL, memory JSON, reminders JSON). | `backend/internal/auth/`, `backend/internal/store/` |
| 10 | Proactivity | **Allowed, bounded.** Sources: user-set reminders, an ambient clock/brief card, runtime-initiated follow-ups. Policy (in the decision layer): never interrupt a turn in progress or an utterance being captured; proactive items default to glance cards; speech only for reminders; anything else waits for idle. | `backend/internal/proactive/`, `backend/internal/decision/` |
| 11 | Memory | **Local file store** plus runtime tools `remember` / `recall` / `forget`. The last N turns and all memory notes are summarised into the system prompt each turn. Lives in `CORELLIA_DATA_DIR/memory.json`. Cross-day memory is this file; nothing lives in the box (VISION 8 "disposable"). | `backend/internal/memory/` |

Other defaults not in section 11:

- **Client framework:** Vite + React 19 + TypeScript + React Three Fiber + Tailwind 4, as a static bundle in `client/`. Next.js is dropped (no server rendering needed; a static bundle is what a kiosk wants and what the Go backend can serve). The Next.js frontend is removed in Phase 1.
- **Backend:** Go + Chi stays. `internal/config` remains the only `os.Getenv` reader.
- **Single session.** One conversation, one screen. Session identity is implicit; the API has a `session` resource only so a second screen is a small change later.
- **Naming:** the agent is addressed as "the agent" in code. Product-facing name is configurable (`CORELLIA_AGENT_NAME`, default "Corellia").

---

## 2. Target layout

```
corellia/
├── backend/                 Go 1.26 service
│   ├── cmd/api/             server entrypoint (serves the API, SSE, and the built client)
│   ├── cmd/runtime-spike/   VISION 7 evaluation script runner
│   └── internal/
│       ├── config/          env loading (only os.Getenv reader)
│       ├── auth/            device-token middleware
│       ├── contract/        generated Go types + embedded schemas/catalog + validators (generated parts never hand-edited)
│       ├── catalog/         catalog loading, model-facing description, fit-ranking
│       ├── uispec/          spec tree, op reducer, validation, repair, binding resolution
│       ├── runtime/         AgentRuntime interface + event types; sub-packages local/, anthropic/, openaicompat/, hermes/, deepseek/
│       ├── tools/           tool registry + built-in tools (time, weather, geocode, memory, reminders, directions)
│       ├── actions/         propose/confirm gate and executor
│       ├── decision/        Decider interface + rules default
│       ├── session/         conversation, screen state, turn orchestration, event bus
│       ├── voice/           STT/TTS interfaces + providers
│       ├── memory/          memory store + prompt summarisation
│       ├── proactive/       reminders scheduler + ambient cards
│       ├── store/           file-backed persistence
│       └── httpsrv/         Chi router, routes, SSE, static client
├── client/                  Vite + React + R3F static client (one build, browser on macOS, kiosk on the box)
│   └── src/
│       ├── contract/        generated TS types + validators (never hand-edited) + ops reducer
│       ├── components/      catalog component implementations + registry
│       ├── renderer/        spec tree → React, bindings, actions, decay
│       ├── agent3d/         nebula scene, state machine, adaptive resolution
│       ├── voice/           capture, VAD, activation, playback, barge-in, browser STT/TTS fallback
│       ├── platform/        PlatformAdapter (browser; shell stub)
│       ├── session/         SSE client, turn API, reconnect, local state
│       └── app/             layout, keyboard capture, mic indicator, status
├── shared/
│   ├── schema/              JSON Schemas: ui-spec, ops, events, api
│   └── catalog/catalog.json component catalog (data, versioned)
├── adapters/hermes/         unchanged legacy adapter image; target of the hermes runtime
├── box/                     Debian display-box provisioning: systemd units, kiosk script, watchdog, README
├── scripts/                 contract codegen, smoke scripts
└── docs/                    VISION.md, roadmap (this), completions/, changelog
```

Repo-level architecture rules for the new direction (replace the legacy §11 lists; enforced by review and, where possible, by tests):

1. `AgentRuntime` is the only seam to any model, harness or agent framework. Nothing outside `internal/runtime/<impl>/` imports a provider SDK or knows a provider's wire format.
2. The client renders only what validates against the catalog; the server validates every op before forwarding. No markup, code or URLs of the model's choosing reach the DOM except through typed props that the catalog declares.
3. One schema, two languages: `shared/schema` and `shared/catalog` are the source; generated Go and TS are committed and drift-tested.
4. All env vars are read in `internal/config`; the client reads only `VITE_*` build-time vars and runtime values from `/api/config`.
5. Side effects go through propose → confirm. A tool that mutates anything outside Corellia's own store is registered as `requiresConfirm`.
6. No pointer paths. Every action is reachable by keyboard or voice.
7. Deferred features are real interface implementations returning `NotImplemented`, never fake UI.
8. No Mission or OpenWorld code is read or copied; the DeepSeek harness runtime stays a stub until terms are cleared.

---

## 3. Phases

Each phase is independently committable, keeps `go test ./...` and `pnpm -C client test` green, and ends with completion notes, a changelog entry, a commit and a push. Phase order is chosen so a browser demo exists from Phase 3 on and grows every phase.

### Phase 0: Roadmap (this document)

- **Scope:** read the repo and VISION.md, write this plan.
- **Deliverables:** `docs/executing/roadmap.md`, changelog entry 0.15.0.
- **Acceptance:** plan lists every phase with scope, deliverables, dependencies, acceptance; every section-11 question has a stated default.

### Phase 1: Restructure and skeletons

- **Scope:** remove the legacy control-plane code; stand up the new backend and client skeletons that build, test and run end to end with a health check.
- **Deliverables:**
  - Delete `frontend/`, `backend/internal/{agents,adapters,auth,db,deploy,gen,httpsrv,organizations,tools,users}`, `backend/cmd/smoke-deploy`, `backend/migrations`, `backend/queries`, `backend/sqlc.yaml`, `backend/fly.toml`, `shared/proto/`, `scripts/capture-login-video.mjs`, root `package.json` proto scripts. Keep `adapters/hermes/`.
  - `backend/`: new `config` (new var set), `auth` (device token), `httpsrv` (`/healthz`, `/api/config`, static client serving with SPA fallback), `cmd/api`. Tests for config parsing, auth middleware, router.
  - `client/`: Vite + React + TS + Tailwind + R3F + vitest + eslint; placeholder full-screen black page with an always-focused input and a "connected" indicator hitting `/healthz`. Salvaged shader sources under `client/src/agent3d/shaders/`.
  - Root `package.json` with workspace `client`, scripts `dev`, `build`, `test`, `type-check`, `lint`. `Procfile` updated. `.env.example` rewritten. `go.work` unchanged.
- **Dependencies:** Phase 0.
- **Acceptance:** `cd backend && go vet ./... && go test ./...` green; `pnpm -C client type-check && pnpm -C client lint && pnpm -C client test && pnpm -C client build` green; `go run ./cmd/api` serves the built client at `http://localhost:8080` and `/healthz` returns 200; opening it in a browser shows the placeholder with the input focused without a click.

### Phase 2: Shared contract (schema, catalog, codegen, validation)

- **Scope:** the one-schema-two-languages contract for UI specs, ops, runtime events and the HTTP API, plus the v1 component catalog.
- **Deliverables:**
  - `shared/schema/ui-spec.schema.json` (spec, node, slot, binding, action records), `ops.schema.json` (`add_node`, `set_props`, `set_slot`, `set_data`, `remove_node`, `clear`, `done`), `events.schema.json` (SSE events: `session`, `state`, `text_delta`, `spec_op`, `speech`, `proposal`, `tool_call`, `tool_result`, `turn_done`, `error`, `proactive`), `api.schema.json` (request/response bodies).
  - `shared/catalog/catalog.json` v1: layout `Stack`, `Grid`, `Split`, `Overlay`; content `Card`, `Markdown`, `Stat`, `List`, `Table`, `Chart`, `Timeline`, `Image`, `Map`, `Confirm`, `Status`. Each entry: name, description for the model, props JSON Schema, slots with allowed child types, bindable props, actions, fit hint (`glance` | `panel` | `full`), size hints.
  - Codegen: `scripts/contracts-generate.sh` runs `go-jsonschema` into `backend/internal/contract/gen/` and `json-schema-to-typescript` into `client/src/contract/gen/`; copies schemas and catalog into `backend/internal/contract/embed/` for `go:embed`. Drift tests in both languages compare the copies and the generated output to the source.
  - Go `contract` package: `ValidateSpec`, `ValidateOp`, `ValidateProps(component, props)`, catalog loader with per-component compiled validators. Go `uispec` package: tree type, `Apply(op)` reducer, binding resolution (`$.path` JSONPath subset), slot/child-type checks, size budget. TS `contract` package: ajv validators and the same reducer; property-based test that the two reducers agree on a shared fixture set (`shared/schema/fixtures/*.json` applied in both languages, results compared via committed golden files).
- **Dependencies:** Phase 1.
- **Acceptance:** every fixture in `shared/schema/fixtures/valid/` validates in Go and TS; every fixture in `invalid/` fails in both with the same error code; reducer golden tests match in both languages; `scripts/contracts-generate.sh && git diff --exit-code` is clean.

### Phase 3: Session, event stream and the local runtime

- **Scope:** the conversational core end to end with a keyless runtime: typed turn in, streamed text and spec ops out, rendered as raw text in the client.
- **Deliverables:**
  - `runtime` package: `AgentRuntime` interface (`Start(ctx, Turn) (<-chan Event, error)`, `Cancel(turnID)`, `Capabilities()`), event types mirrored from `events.schema.json`, `runtime/local`: a deterministic runtime that answers scripted intents (greeting, time, "show me a map of X", "make a table of", multi-step with a tool call and a proposal) and emits streamed text deltas plus valid spec ops; used for all dev and all tests.
  - `session` package: single `Session` with conversation history, screen state (current spec tree), turn lifecycle (one active turn, cancel on new input), event bus with replay of the last N events for reconnects.
  - `httpsrv`: `POST /api/turn` (text), `POST /api/turn/cancel`, `GET /api/events` (SSE with `Last-Event-ID` replay), `GET /api/session`, `GET /api/catalog`.
  - Client: `session/` SSE client with reconnect and backoff, turn API, a transcript pane, always-focused input, `Esc` cancels, `Enter` sends. Spec ops are applied to the local tree via the Phase 2 reducer and shown as a JSON debug pane (`?debug=1`).
- **Dependencies:** Phase 2.
- **Acceptance:** `go test ./internal/session/...` covers turn lifecycle, cancel, replay; in the browser: type "show me a map of Lisbon", see streamed text and the spec tree arrive; disconnecting the backend and restarting it reconnects the client without reload.

### Phase 4: Component library and renderer

- **Scope:** the client renders the catalog; server-side fit-ranking narrows what the model is offered.
- **Deliverables:**
  - `client/src/components/`: one React component per catalog entry with a registry built from the generated catalog types; `renderer/` resolves bindings, mounts slots, fires actions through the session API, applies decay (`ttl` on nodes, `clear` op) and the glance/panel/full layouts around the agent focal area.
  - Keyboard action model: visible actions get numbered hotkeys (`1`..`9`) and `Enter` for the primary; `Esc` dismisses; no click targets required.
  - `Map` uses MapLibre GL with a keyless raster style (OpenStreetMap tiles) and degrades to a static card when offline. `Chart` uses a small SVG renderer (bar, line, area). `Markdown` renders a safe subset (no raw HTML, links non-navigating).
  - Backend `catalog`: `Rank(content hints, display profile) []Component` fit-ranking and `DescribeForModel(components)` prompt/tool description; `GET /api/catalog` returns the catalog with display profile applied.
  - A `?gallery=1` route renders every component from fixtures for visual checking.
- **Dependencies:** Phase 3.
- **Acceptance:** all fixtures render without console errors; the local runtime's map, table and card scenarios render around the focal area; actions fire via keyboard; vitest covers registry completeness (every catalog entry has a component and vice versa) and binding resolution.

### Phase 5: The 3D agent

- **Scope:** the persistent focal element with state, adaptive resolution and the ambient idle scene.
- **Deliverables:** `client/src/agent3d/`: R3F nebula built from the salvaged shaders; `AgentState` store (idle, listening, thinking, speaking, error) driven by session events; per-state targets for coherence, amplitude, palette, rotation, with eased transitions; audio-reactive uniform fed by an `AnalyserNode` when speaking; adaptive DPR controller (frame-time EMA, scale range 0.5 to 1.0 of device DPR, target 30 fps floor); `prefers-reduced-motion` and WebGL-unavailable fallbacks (static SVG); `?stats=1` overlay (fps, render scale, particle count). Layout: agent centred when idle, shifts to make room when a panel or full visual is on screen.
- **Dependencies:** Phase 4 (layout integration), Phase 3 (state events).
- **Acceptance:** in a browser the scene holds 60 fps on an integrated GPU at 1080p and degrades scale rather than dropping frames at 4K; state changes are visible within 300 ms of the event; vitest covers the state machine transitions and the DPR controller.

### Phase 6: Decision layer, actions and tools

- **Scope:** the Jev seam with a rules default, the propose/confirm gate, and a useful built-in tool set.
- **Deliverables:**
  - `decision`: `Decider` interface, `DecisionInput`/`Decision` types, `rules.Decider` (respond always for user turns; modality from spec presence and fit hint; glance for short facts; timing `now` unless speaking; clear policy: replace same-topic, decay after `ttl`, keep pinned), unit-tested table of cases.
  - `actions`: `Proposal` records (id, tool, args, label, risk), `Gate` with pending proposals, `Confirm(id)`/`Reject(id)` by voice phrase or key, executor that runs the tool and feeds the result back into the turn as a `tool_result`; expiry of stale proposals.
  - `tools`: registry with JSON-Schema-described tools; built-ins: `get_time`, `get_weather` and `geocode` (Open-Meteo, keyless), `remember`/`recall`/`forget` (Phase 9 store, stubbed here on the memory interface), `set_reminder` (requires confirm), `open_directions` (requires confirm; executes as a `Map` with route hint), `show_ui` (the runtime's path to spec ops when a runtime cannot emit ops natively).
  - Wiring: session runs runtime events through the decider before broadcasting; `POST /api/action/confirm`, `/reject`; `Confirm` catalog component renders proposals with `Enter`/`Esc`.
- **Dependencies:** Phase 3 (session), Phase 4 (Confirm component).
- **Acceptance:** "remind me at 5 to call Ana" produces a proposal, `Enter` confirms, the reminder is stored, `Esc` rejects; decision tests pass; no tool marked `requiresConfirm` executes without a confirm (test asserts).

### Phase 7: Cloud runtimes and the runtime spike

- **Scope:** real inference behind `AgentRuntime`, plus the measurement tool VISION 7 asks for.
- **Deliverables:**
  - `runtime/anthropic`: Claude Messages API with streaming and tool use; tools from the registry plus `show_ui` whose arguments are spec ops; system prompt assembled from catalog description, memory summary, display profile; cancel via context; model from `CORELLIA_MODEL` (default the latest Claude model id documented in the `claude-api` skill at implementation time).
  - `runtime/openaicompat`: chat completions with streaming and tool calls against `OPENAI_BASE_URL` (DeepSeek, local gateways), same tool mapping.
  - `runtime/hermes`: adapter over the sidecar's `POST /chat` (non-streaming; emits one text event; UI via `show_ui` directive parsing of fenced JSON as a best effort), `runtime/deepseek`: `NotImplemented`.
  - Runtime selection in `config` + a factory; capabilities reported on `/api/session`.
  - `cmd/runtime-spike`: runs the ten-turn script from VISION 7 against a named runtime, measures time to first token, time to first valid op, total turn time, first-try spec validity rate, cancel latency; writes a Markdown report to `docs/executing/spikes/<runtime>-<date>.md`. Run against `local` here; cloud runs documented as pending credentials.
  - Tests use `httptest` servers replaying recorded SSE/JSON fixtures for both wire formats.
- **Dependencies:** Phase 6 (tools, decider), Phase 2 (contract).
- **Acceptance:** with no keys, `auto` picks `local` and everything from earlier phases still works; with a key, a browser turn streams from the cloud (documented as untested here); fixture-driven tests cover streaming parse, tool-call assembly, op validation and cancel for both wire formats; spike report for `local` committed.

### Phase 8: Voice

- **Scope:** speak to it and hear it, with barge-in, in a browser on macOS without keys and with cloud providers when configured.
- **Deliverables:**
  - Client `voice/`: `getUserMedia` capture through the platform adapter (echo cancellation, noise suppression, auto gain constraints), energy VAD with hangover, activation modes (toggle via `Ctrl+Space`, push-to-talk), utterance segmentation to 16 kHz PCM/WebM, upload to `POST /api/voice/stt` or browser `SpeechRecognition` when the server reports no STT; playback queue for `speech` events with `AudioContext`, analyser hook for the 3D scene, barge-in (user speech or typing cancels playback and the active turn), mic indicator component, `M` toggles mute.
  - Backend `voice/`: `STT`/`TTS` interfaces, `openai` provider (transcriptions + speech endpoints), `none` provider, `GET /api/voice/capabilities`, `POST /api/voice/stt`, `POST /api/voice/tts` (streams audio), speech segmentation of runtime text into sentence-sized TTS requests so audio starts before the turn ends.
  - Decision integration: `speech` events carry the text the decider chose to say (may differ from on-screen text).
- **Dependencies:** Phase 5 (analyser), Phase 6 (decider), Phase 7 (runtime).
- **Acceptance:** keyless in Chrome on macOS: toggle mic, say "what time is it", hear the answer via `speechSynthesis`, see the nebula react; typing mid-speech stops playback; vitest covers VAD segmentation and the playback queue; Go tests cover provider selection, sentence segmentation and the HTTP handlers with fake providers.

### Phase 9: Memory, persistence and proactivity

- **Scope:** state that survives restarts and the bounded ability to put things on screen unprompted.
- **Deliverables:** `store` (atomic JSON file writes, JSONL transcript append, load on boot), `memory` (notes with timestamps and tags, `Summarise()` for the prompt, tools wired), `proactive` (reminder scheduler firing `proactive` events through the decider; ambient clock card on idle; optional daily brief hook), interruption policy in the decider, `GET /api/memory` for inspection, transcript replay on client reconnect limited to the current day.
- **Dependencies:** Phase 6, Phase 8 (speech for reminders).
- **Acceptance:** restart the backend and the conversation tail, memory and pending reminders are intact; a reminder fires as a glance card plus speech when idle and is held while a turn is active (tested with a fake clock); memory notes appear in the runtime prompt (tested on the local runtime's prompt builder).

### Phase 10: Display box, hardening and docs

- **Scope:** everything needed to put the build on a Debian box, keep it alive, and leave the repo coherent.
- **Deliverables:**
  - `box/`: `provision.sh` (Debian packages, user, auto-login, Chromium, systemd units), `corellia-kiosk.service` + `corellia-kiosk.sh` (Chromium kiosk flags: fullscreen, no first-run, autoplay allowed, fake-ui-for-media-stream off, GPU raster), `corellia-watchdog.timer` (restarts the kiosk if the page stops heartbeating to `/api/heartbeat`), screen-blanking and power-save disable, `README.md` with the 30 fps test procedure. Untested here; written against documented Debian 13 behaviour and marked as such.
  - Backend hardening: graceful shutdown, request size limits, SSE keepalive, `/api/heartbeat`, structured logs, build info on `/healthz`; `Dockerfile` for the backend (serves the client) kept simple.
  - Client hardening: offline banner, reconnect storm protection, error boundary that keeps the 3D scene alive, memory-leak check on long sessions (`?soak=1` drives synthetic turns).
  - Docs: `README.md` rewritten for the new product, `CLAUDE.md` rewritten (layout, rules, commands), `docs/stack.md` rewritten, `docs/README.md` updated, this roadmap's progress table closed out.
- **Dependencies:** all previous.
- **Acceptance:** `go build` produces one binary that serves the client; `box/README.md` is complete enough to provision a box without reading code; a 30-minute `?soak=1` run in a browser shows flat memory; all tests green; docs reference only files that exist.

---

### Phase 11: Review fixes

- **Scope:** everything the independent review of 2026-10-29 ([`review-2026-10-29.md`](review-2026-10-29.md)) marked blocking, plus the non-blocking items that stand between the build and a usable alpha. Added after Phase 10; the review is committed with this phase.
- **Deliverables:**
  - Blocking: a stable `useSessionState` (cached, shallow-compared selector) and a vitest that mounts `App` with fake `EventSource`/`fetch`; a Playwright smoke test (`/`, `/?gallery=1`, `/?debug=1`, plus the Enter/proposal scenario) against the Go server, failing on any console error, in `pnpm check` and CI, runnable without sudo on Linux via `scripts/chromium-libs.sh`; Enter no longer both sends and confirms (input marks the event handled, the global handler ignores handled events; regression tests in vitest and in the browser); dev-mode hardening (no `RealIP` unless `CORELLIA_TRUSTED_PROXIES` names the peer, `CORELLIA_BIND` with loopback default in dev mode, JSON-only POSTs, Origin and Host guards, security headers with a CSP); failures visible outside `?debug=1` (apology in the transcript and speech, error status card, error line) and `CORELLIA_ANTHROPIC_FALLBACKS`; replayed events no longer re-trigger speech.
  - Found by the smoke test: a fresh session's snapshot encoded `transcript` as `null` and was dropped by the client (blank header, no capabilities); a `clear` from the next turn removed the pending proposal's Confirm card while Enter still confirmed it (cards are restored after every clear).
  - Non-blocking: SSE reconnect with backoff and a distinct `unauthorized` state with a token prompt; `?token=` removed from the address bar; Image host allowlist (`CORELLIA_IMAGE_HOSTS`) enforced on ops and in the CSP; renderer renders components as keyed elements (Map cleanup runs, no WebGL context leak) and tile failures no longer kill a map; `auto` no longer switches to OpenAI on `OPENAI_API_KEY` alone; `CORELLIA_TZ`; UTF-8-safe truncation; error boundary resets on spec change; decay timers survive reconnects; `show_ui` reports rejected ops to the model; blank turns rejected; speech outside a turn reaches the transcript; the scene stays `speaking` while audio plays; typing stops playback without cancelling the turn; Cmd no longer toggles the mic; browser recognition stops after fatal errors; audio context primed on the first key press; StrictMode no longer kills voice under Vite; Confirm no longer flips the state under a running turn; the header names the runtime (`local demo`); a CI workflow with `go test -race`.
- **Dependencies:** Phase 10.
- **Acceptance:** `pnpm check` green including the browser smoke test; the Mac run path (`pnpm -C client build && go run ./cmd/api`) shows the display, completes a turn and keeps a pending proposal visible and unconfirmed across a sent message.

### Phase 12: Verifiable cloud runtime, streamed speech, strict CSP, remaining review items

- **Scope:** the follow-ups Phase 11 left open ([`../completions/phase-11-review-fixes.md`](../completions/phase-11-review-fixes.md), "Follow-ups" and "Known gaps") plus the review's non-blocking items that were still open. Added after Phase 11.
- **Deliverables:**
  - **Anthropic runtime verifiable without a key, checkable in one command with one.** A contract test records every request the runtime sends to the Messages API (headers and JSON bodies) as committed golden files under `runtime/anthropic/testdata/`, replays a recorded multi-round stream (text, `show_ui` tool use, gated tool, refusal, HTTP error) and asserts the event sequence the session receives; `go test ./internal/runtime/anthropic -update` rewrites the goldens so a reviewer can diff the wire shape against the API reference. `cmd/runtime-check` runs a live check against the configured runtime (connect, a plain turn, a tool turn with `show_ui`, cancel) and prints a pass/fail table with a diagnosis for the usual failures (bad key, unknown model, rejected beta, no tool use); `scripts/anthropic-live-check.sh` runs it and then the VISION 7 spike and writes the report to `docs/executing/spikes/`. A live Go test (`CORELLIA_LIVE=1`) does the same inside `go test`.
  - **Speech streams during the turn.** The session feeds text deltas through a sentence splitter (`decision.SentenceStream`) and publishes each completed sentence as a `speech` event while the model is still writing; the remainder goes out as the final piece at `turn_done`, and a failed turn's apology follows it. The decider says whether a turn streams (`decision.Streamer`; the rules decider streams every user turn, holds proactive items as before). The spike reports time to first speech.
  - **No `'unsafe-eval'`.** `scripts/gen-validators.mjs` compiles the Ajv validators (schemas plus per-component props) into `client/src/contract/gen/validators.js` at contract-generation time (committed, drift-tested); the client loads them instead of compiling at startup; the CSP drops `'unsafe-eval'`; the smoke test proves the bundle runs under it.
  - **Review items:** pending proposals render as one stacked list (newest on top, only the newest bound to Enter/Escape, the rest numbered); digit hotkeys no longer swallow a message that starts with a digit (a lone digit fires after a short grace period, a digit followed by typing goes into the input); `risk: high` proposals ignore spoken confirmation phrases and ask for a key press; the UI zone scrolls by keyboard (arrows, PageUp/PageDown) when the input is empty instead of clipping; `CORELLIA_VOICE_BARGE_IN=off` disables speech-start barge-in while the agent is speaking (laptop speakers), reported in voice capabilities; push-to-talk delivers the utterance in flight at key-up; dead proposal API code removed.
- **Dependencies:** Phase 11.
- **Acceptance:** `pnpm check` green (contract goldens, sentence-stream tests, drift test for the precompiled validators, hotkey and proposal-stack tests, smoke test under the strict CSP); with no key, `cmd/runtime-check -runtime anthropic` fails fast with a clear message; with a key, it prints the table and the spike report lands in `docs/executing/spikes/` (not runnable here; documented as the owner's first step on a Mac).

### Phase 13: Beta readiness (round-2 review)

- **Scope:** the blocking gaps of the second independent review ([`review-2026-10-30.md`](review-2026-10-30.md), against `0c40505`) that can be fixed and verified without an API key or a microphone, plus its cheap non-blocking items. The two owner-only items (live model, Mac microphone run) become one checklist. Added after Phase 12; the review is committed with this phase.
- **Deliverables:**
  - **Item 1, the false offline banner.** The error event is renamed on the wire and in the contract (`session_error`): an SSE event named `error` is delivered to `EventSource.onerror` and read as a connection failure, on the turn that failed and again on every reload while the bus replays it. The client additionally ignores `MessageEvent`s in `onerror` and plain `Event`s in the named listeners (the `e.data.slice` crash). The local runtime gains an on-demand failure ("simulate a failure" / "fail on purpose"); a smoke-test step drives it and asserts the header stays online, before and after a reload.
  - **Item 3, the mic-open race.** A generation counter in `VoiceController`: a close while `getUserMedia` is pending wins and releases the stream; a second open cannot create a second capture. Push-to-talk also releases on window blur. A fatal recognition error returns the indicator to off.
  - **Item 4, the speech queue.** Every piece gets an `AbortSignal` the player fires on stop (a piece still being fetched is dropped, its meter never started) and a deadline (a piece whose end never comes is skipped and the queue moves on); the browser backend holds its utterance. Escape silences playback first, then cancels the turn, then falls through to the escape-bound action or a clear.
  - **Item 5, raw failures and dropped streams.** The apology and the status card carry a short reason in plain words (`describeFailure`, mirroring `cmd/runtime-check`'s diagnoses); the raw error stays in the `session_error` event (debug pane) and the log. The failed reply is marked `failed` in the transcript and left out of model history. An Anthropic stream that ends without a stop reason (connection dropped, tool call cut mid-input) is a fatal error, not a short answer.
  - **Item 7, CI.** `scripts/contracts-generate.sh` runs go-jsonschema at a pinned version through `go run` on every machine; the workflow runs on `ubuntu-24.04` (Playwright's Chromium is not published for the 26.04 image `ubuntu-latest` moved to).
  - **Item 8, overlay collisions.** The renderer groups overlays by anchor (a glance root and the floating cards) into one column per corner; the top anchors sit below the top bar; the offline banner lives in the top bar; the error line is its own footer row above the transcript.
  - **Non-blocking:** Enter/Escape/digit auto-repeat ignored; no digit on `confirm_proposal` actions below the top card; voice capabilities re-read when the stream comes online; the 3D agent inside an error boundary with the static fallback; browser recognition restarts with backoff after a `network` error and marks speech start per utterance (interim results) so barge-in works past the first sentence; invalid nodes reported after render, once; `pendingSpeech` reset on snapshot and `turn_started`; a 403 from the Origin or Host guard shows "request refused", not the token prompt; the snapshot's seq is read under the session lock and spec/turn-start publishes happen under it; the Anthropic SDK no longer reads its own environment (`ANTHROPIC_BASE_URL` is a config field); `open_directions` runs without confirmation (it only draws a map); `CORELLIA_DEV_ORIGINS`' Vite default is dropped in token mode; `transcript.jsonl` is 0600.
  - **Owner checklist:** [`owner-checklist.md`](owner-checklist.md) for the live model run (item 2) and the Mac microphone run (item 6), with pass criteria and what to record.
- **Dependencies:** Phase 12.
- **Acceptance:** `pnpm check` green here and in CI (all four jobs); the five smoke tests pass in real Chromium, including the failing-turn step; the review's items 1, 3, 4, 5, 7 and 8 have a test each.

## 4. Versioning and records

- Changelog entries continue the existing series: 0.15.0 (roadmap), 0.15.1 (Phase 1), 0.15.2 (Phase 2), and so on to 0.15.10, then 0.15.11 (Phase 11), 0.15.12 (Phase 12) and 0.15.13 (Phase 13).
- Completion notes: `docs/completions/phase-NN-<name>.md` with sections: Summary, What was built, Design decisions, Files changed, How to run, How to test, Known gaps, Follow-ups.
- Commits: one per phase at minimum, conventional subject `phase N: <name>`; pushed to `origin/feat/vision-implementation` only.

## 5. Risks and how the plan handles them

| Risk | Handling |
|---|---|
| No credentials here, so cloud runtimes, STT and TTS cannot be exercised live. | Fixture-driven tests against recorded wire formats; keyless local paths for every feature; completion notes state exactly what is unverified. |
| No display box or Linux GPU here. | Kiosk scripts are written from documentation and marked untested; adaptive resolution and the stats overlay make the first box test cheap. |
| Catalog scope creep. | v1 catalog is fixed in Phase 2; additions after that are their own changelog entries. |
| Model emits invalid specs. | Server validates each op, repairs trivial cases (unknown optional prop dropped, missing `spec_version` filled), drops the rest with a `session_error` event the client shows in debug mode; first-try validity is a spike metric. |
| Two reducers drift. | Shared fixtures and golden outputs tested in both languages. |

## 6. Progress

| Phase | Status | Completion note | Changelog |
|---|---|---|---|
| 0 Roadmap | done 2026-10-29 | [`../completions/phase-00-roadmap.md`](../completions/phase-00-roadmap.md) | 0.15.0 |
| 1 Restructure and skeletons | done 2026-10-29 | [`../completions/phase-01-restructure-and-skeletons.md`](../completions/phase-01-restructure-and-skeletons.md) | 0.15.1 |
| 2 Shared contract | done 2026-10-29 | [`../completions/phase-02-shared-contract.md`](../completions/phase-02-shared-contract.md) | 0.15.2 |
| 3 Session, events, local runtime | done 2026-10-29 | [`../completions/phase-03-session-events-local-runtime.md`](../completions/phase-03-session-events-local-runtime.md) | 0.15.3 |
| 4 Component library and renderer | done 2026-10-29 | [`../completions/phase-04-component-library-and-renderer.md`](../completions/phase-04-component-library-and-renderer.md) | 0.15.4 |
| 5 3D agent | done 2026-10-29 | [`../completions/phase-05-3d-agent.md`](../completions/phase-05-3d-agent.md) | 0.15.5 |
| 6 Decision layer, actions, tools | done 2026-10-29 | [`../completions/phase-06-decision-actions-tools.md`](../completions/phase-06-decision-actions-tools.md) | 0.15.6 |
| 7 Cloud runtimes and spike | done 2026-10-29 | [`../completions/phase-07-cloud-runtimes-and-spike.md`](../completions/phase-07-cloud-runtimes-and-spike.md) | 0.15.7 |
| 8 Voice | done 2026-10-29 | [`../completions/phase-08-voice.md`](../completions/phase-08-voice.md) | 0.15.8 |
| 9 Memory, persistence, proactivity | done 2026-10-29 | [`../completions/phase-09-memory-persistence-proactivity.md`](../completions/phase-09-memory-persistence-proactivity.md) | 0.15.9 |
| 10 Display box, hardening, docs | done 2026-10-29 | [`../completions/phase-10-display-box-hardening-docs.md`](../completions/phase-10-display-box-hardening-docs.md) | 0.15.10 |
| 11 Review fixes | done 2026-10-29 | [`../completions/phase-11-review-fixes.md`](../completions/phase-11-review-fixes.md) | 0.15.11 |
| 12 Verifiable cloud runtime, streamed speech, strict CSP, review items | done 2026-10-29 | [`../completions/phase-12-cloud-runtime-speech-csp.md`](../completions/phase-12-cloud-runtime-speech-csp.md) | 0.15.12 |
| 13 Beta readiness (round-2 review) | done 2026-10-29 | [`../completions/phase-13-beta-readiness.md`](../completions/phase-13-beta-readiness.md) | 0.15.13 |

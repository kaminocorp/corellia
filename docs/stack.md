# Corellia stack

> **Status (2026-10-29):** describes the implementation on `feat/vision-implementation`, which replaced the v1 control-plane stack (archived under `archive/`). Defaults for the open decisions are recorded in [`executing/roadmap.md`](executing/roadmap.md) section 1.

## Picks

| Layer | Choice | Why |
|---|---|---|
| Backend | Go 1.26, Chi, one binary | Serves the API, the SSE stream and the static client; single static binary for the box or a container |
| Contract | JSON Schema (draft 2020-12) in `shared/schema`, catalog in `shared/catalog` | Recursive, per-component-typed specs fit JSON Schema; one source generated into Go (go-jsonschema, santhosh-tekuri/jsonschema) and TS (json-schema-to-typescript, Ajv) |
| Transport | JSON over HTTP + Server-Sent Events | Browser-native, replayable (`Last-Event-ID`), curl-able; no protobuf toolchain |
| Client | Vite 7, React 19, TypeScript, Tailwind 4, React Three Fiber + three | Static bundle for a kiosk; R3F for the WebGL2 agent |
| Maps | MapLibre GL + OpenStreetMap raster tiles | Keyless; loaded on demand |
| Agent runtimes | `local` (scripted), `anthropic` (anthropic-sdk-go v2, beta Messages API), `openai` (raw HTTP chat completions), `hermes` (sidecar HTTP), `deepseek` (stub) | One seam, credential-based selection |
| Tools | Open-Meteo (geocoding, forecast), OSRM public router, file-backed memory and reminders | All keyless |
| Voice | Browser SpeechRecognition / speechSynthesis by default; OpenAI audio API when `OPENAI_API_KEY` is set | Keyless dev path, one-file vendor swap |
| Persistence | JSON documents and JSONL under `CORELLIA_DATA_DIR` | Single user, inspectable, nothing on the box |
| Auth | Device token (`CORELLIA_DEVICE_TOKEN`); dev mode = loopback only | One screen, one credential |
| Dev loop | pnpm workspaces, air, overmind | Hot reload on both sides |
| Box | Debian, Chromium kiosk, systemd, heartbeat watchdog | See `box/README.md` |

## Codegen

`scripts/contracts-generate.sh` (also `pnpm contracts:generate`) regenerates `backend/internal/contract/gen/*.go`, the embedded copies in `backend/internal/contract/embed/`, and `client/src/contract/gen/*.ts`. Drift tests in both languages fail when the output is stale. Reducer goldens under `shared/schema/fixtures/reducer/` are produced by the Go reducer (`go test ./internal/uispec -update`) and checked by the TS reducer.

## Environment

Backend variables are read only in `backend/internal/config` and documented in `.env.example`: server (`PORT`, `CORELLIA_DEVICE_TOKEN`, `CORELLIA_CLIENT_DIR`, `CORELLIA_DATA_DIR`, `CORELLIA_AGENT_NAME`, `CORELLIA_DEV_ORIGINS`), runtime (`CORELLIA_RUNTIME`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `CORELLIA_MODEL`, `CORELLIA_EFFORT`, `CORELLIA_HERMES_URL`, `CORELLIA_HERMES_TOKEN`), voice (`CORELLIA_STT`, `CORELLIA_TTS`, `CORELLIA_TTS_VOICE`, `CORELLIA_VOICE_MODE`). The client has no environment file; it reads `/api/config`, `/api/session` and `/api/voice/capabilities`.

## HTTP API

| Route | Purpose |
|---|---|
| `GET /healthz` | ok, version, dev mode, client heartbeat age |
| `GET /api/config`, `GET /api/session`, `GET /api/catalog`, `GET /api/memory` | Inspection (tool definitions reach the model through the runtime prompt) |
| `GET /api/events` | SSE: `session` snapshot, replay after `Last-Event-ID`, live events, heartbeats |
| `POST /api/turn`, `POST /api/turn/cancel` | Turns (a confirm/reject phrase applies to the pending proposal instead) |
| `POST /api/action`, `POST /api/action/confirm`, `POST /api/action/reject` | Spec actions and proposals |
| `POST /api/screen/clear`, `POST /api/screen/remove` | Screen state from the client (Escape, decay) |
| `GET /api/voice/capabilities`, `POST /api/voice/stt`, `POST /api/voice/tts` | Voice |
| `POST /api/heartbeat` | Client liveness for the box watchdog |

Bodies and events are defined in `shared/schema/api.schema.json` and `events.schema.json`.

## Deploy

`backend/Dockerfile` builds the client and the backend into one image (`docker build -f backend/Dockerfile -t corellia .`), data in `/data`. For the box, `box/provision.sh` installs the kiosk and optionally the backend as `corellia-api.service`. Nothing is deployed from this repository automatically.

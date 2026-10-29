<p align="center"><img src="docs/assets/logo.png" alt="Corellia" width="96" /></p>

# Corellia

A personal agent workspace: an always-on office screen that shows a 3D agent you talk to by keyboard and voice. It answers out loud and with visuals it assembles from a closed component catalog (maps, tables, cards, charts). No mouse. One agent, one room.

Direction: [`docs/VISION.md`](docs/VISION.md). Implementation plan and status: [`docs/executing/roadmap.md`](docs/executing/roadmap.md). Per-phase notes: [`docs/completions/`](docs/completions/). Changes: [`docs/changelog.md`](docs/changelog.md).

## How it works

```
 Display (browser / Chromium kiosk)           Backend (Go, one binary)                 Cloud
 +--------------------------------+           +---------------------------------+
 | 3D agent (WebGL2 nebula)       |  SSE      | Session: turns, spec, proposals |   Claude / OpenAI-compatible
 | Generated UI (catalog renderer)| <-------- | Decision layer (rules)          | <----> (AgentRuntime seam)
 | Keyboard, mic, speakers        |  JSON     | Catalog + op validation         |
 | Platform adapter               | --------> | Tools + propose/confirm gate    |   STT / TTS, Open-Meteo, OSRM
 +--------------------------------+           | Memory, reminders, proactivity  |
                                              +---------------------------------+
```

- The model never emits markup. It emits **spec ops** (`add_node`, `set_data`, `set_root`, …) built from the **catalog** in `shared/catalog/catalog.json`; the server validates every op against the catalog, the client renders only what validates. The contract is JSON Schema in `shared/schema/`, generated into Go and TypeScript, drift-tested.
- Anything with side effects is a **proposal** the user confirms with `Enter`, a numbered key or by saying "yes".
- The **agent runtime** is a seam: `local` (keyless, scripted), `anthropic` (Claude), `openai` (any OpenAI-shaped endpoint, DeepSeek included), `hermes` (the sidecar in `adapters/hermes/`). `CORELLIA_RUNTIME=auto` picks by credentials.
- **Voice** uses server STT/TTS when configured and the browser's own recognition and synthesis when not. `Ctrl+Space` toggles the mic, `Ctrl+M` mutes, speaking or typing interrupts the agent.

## Run it

Requirements: Go 1.26, Node 24, pnpm 12 (`packageManager` in `package.json` pins the version for corepack and for pnpm itself). No credentials needed.

```bash
pnpm install
pnpm -C client build
cd backend && go run ./cmd/api          # http://localhost:8080
```

Open http://localhost:8080 in a browser (Chrome on macOS is the development target). Type "show me a map of Lisbon" or press `Ctrl+Space` and say it. Without a key the header says **local demo**: the local runtime is a scripted stand-in with a dozen intents, not a model ("simulate a failure" shows what a failed turn looks like). Useful flags: `?debug=1` (spec and events), `?stats=1` (fps and render scale), `?gallery=1` (every component), `?particles=6000`, `?soak=1`.

Without `CORELLIA_DEVICE_TOKEN` the server is in dev mode: it listens on `127.0.0.1` only, serves loopback hosts only, and refuses cross-origin requests, so macOS shows no firewall prompt. With a token it listens on every interface (`CORELLIA_BIND` pins one); the display presents the token once as `?token=`, which the page stores and removes from the address bar, or types it into the prompt the page shows when the backend answers 401.

With hot reload on both sides:

```bash
overmind start      # client on :5173 (proxies the API), backend on :8080 via air
```

Configuration is `backend/.env` (template: [`.env.example`](.env.example)). Setting `ANTHROPIC_API_KEY` switches the runtime to Claude; `OPENAI_API_KEY` adds server speech recognition and synthesis and nothing else (without it, voice input is Chrome's built-in recognition, which sends the microphone audio to Google while the mic is open; see `docs/executing/owner-checklist.md`) (`CORELLIA_RUNTIME=openai` or `OPENAI_BASE_URL` selects an OpenAI-compatible chat runtime explicitly). The Anthropic runtime is verified against recorded Messages API fixtures and request goldens (`backend/internal/runtime/anthropic/testdata/`); with a key, run `scripts/anthropic-live-check.sh` first: it checks a plain turn, a tool turn with `show_ui` and a cancel against the live API, prints a diagnosis for the usual failures (bad key, unknown model, rejected beta: `CORELLIA_ANTHROPIC_FALLBACKS=false`), then writes the VISION 7 spike report to `docs/executing/spikes/`. No live run has happened from this repository yet (no key here): the owner's steps, for the model and for voice on a Mac, are one list in [`docs/executing/owner-checklist.md`](docs/executing/owner-checklist.md).

Mac voice notes: `Ctrl+Space` toggles the mic (Cmd is left alone so Spotlight keeps working); if "select previous input source" is bound to Ctrl+Space in System Settings, change one of them. Use headphones, `CORELLIA_VOICE_BARGE_IN=off` or `CORELLIA_VOICE_MODE=ptt` on laptop speakers, otherwise the agent's own voice can interrupt it. Escape silences the agent; typing only stops speech, the turn continues.

## Check it

```bash
pnpm check          # client type-check, lint, tests; backend vet and tests; browser smoke test
pnpm e2e            # the smoke tests alone: real Chromium against the Go server (/, /?gallery=1, /?debug=1, a proposal, a failed turn)
```

The smoke test ([`client/e2e/smoke.spec.ts`](client/e2e/smoke.spec.ts)) fails on any console error. It needs Playwright's Chromium once: `pnpm -C client exec playwright install chromium-headless-shell`. On a Linux machine without sudo, `scripts/chromium-libs.sh` fetches the system libraries Chromium needs with `apt-get download` into `client/.chromium-libs/`; `pnpm e2e` runs it automatically. CI ([`.github/workflows/check.yml`](.github/workflows/check.yml)) runs the same plus `go test -race` and a contract-drift check; the generator runs at a version pinned in `scripts/contracts-generate.sh`, so the drift check means the same on every machine.

## Layout

```
backend/   Go service: config, auth (device token), contract, uispec, catalog, runtime/*, tools, actions,
           decision, session, voice, memory, proactive, store, httpsrv; cmd/api, cmd/runtime-spike, cmd/runtime-check
client/    Vite + React + R3F: contract, components, renderer, agent3d, voice, platform, session, app
shared/    JSON Schemas and the component catalog (the only cross-language contract)
box/       Debian display-box provisioning: kiosk, watchdog, systemd units
adapters/  Hermes sidecar image (target of the hermes runtime)
docs/      VISION.md, roadmap, completions, changelog, stack, archive/
```

## Display box

See [`box/README.md`](box/README.md): Chromium kiosk on Debian, auto-login, no blanking, a heartbeat-driven watchdog, and the 30 fps test procedure. Scripts are written from documentation and await their first run on hardware.

## History

Corellia started as a control plane for agent fleets (spawn, deploy, govern). That product shipped a v1 and was archived on 2026-10-28; its docs live in [`docs/archive/`](docs/archive/README.md) and its code in git history before the `feat/vision-implementation` branch.

## License

Apache-2.0, see [`LICENSE`](LICENSE).

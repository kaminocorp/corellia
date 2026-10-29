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

Requirements: Go 1.26, Node 24, pnpm 12. No credentials needed.

```bash
pnpm install
pnpm -C client build
cd backend && go run ./cmd/api          # http://localhost:8080
```

Open it in a browser (Chrome on macOS is the development target). Type "show me a map of Lisbon" or press `Ctrl+Space` and say it. Useful flags: `?debug=1` (spec and events), `?stats=1` (fps and render scale), `?gallery=1` (every component), `?particles=6000`, `?soak=1`.

With hot reload on both sides:

```bash
overmind start      # client on :5173 (proxies the API), backend on :8080 via air
```

Configuration is `backend/.env` (template: [`.env.example`](.env.example)). Setting `ANTHROPIC_API_KEY` switches the runtime to Claude; `OPENAI_API_KEY` adds server speech recognition and synthesis.

## Check it

```bash
pnpm check          # client type-check, lint, tests; backend vet and tests
```

## Layout

```
backend/   Go service: config, auth (device token), contract, uispec, catalog, runtime/*, tools, actions,
           decision, session, voice, memory, proactive, store, httpsrv; cmd/api, cmd/runtime-spike
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

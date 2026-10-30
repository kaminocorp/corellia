# Phase 11: Review fixes

**Date:** 2026-10-29. **Branch:** `feat/vision-implementation`. **Changelog:** 0.15.11. **Roadmap:** [`../executing/roadmap.md`](../executing/roadmap.md) Phase 11. **Input:** [`../executing/review-2026-10-29.md`](../executing/review-2026-10-29.md) (committed with this phase).

## Summary

The independent review found the build not usable: the display never rendered, Enter both sent a message and confirmed the pending proposal, dev mode could be reached from any page in the owner's browser, failures were silent, and no run in a real browser had ever happened. This phase fixes every blocking item and most of the non-blocking ones, and adds the missing layer of verification: a Playwright smoke test that drives the built client in a real Chromium against the Go server and fails on any console error. That test earned its place on the first run by finding two more defects the unit tests could not see: a fresh session's snapshot encoded `transcript` as `null` and was dropped by the client's validator, and a `clear` from the next turn wiped a pending proposal's Confirm card while Enter still confirmed it. `pnpm check` now ends with the smoke test, and a CI workflow runs the same plus `go test -race` and a contract-drift check.

## What was built

### Blocking items

1. **Blank display.** `useSessionState` caches the selector result per state version and returns the previous object when the new one is shallow-equal, so `useSyncExternalStore` sees a stable snapshot (`session/store.ts`). `app/App.test.tsx` mounts the real `App` with a fake `EventSource` and `fetch`, drives a full turn through the stream and asserts the input, header, transcript and generated UI render with no React loop. A store test asserts the selector's stability.
2. **Browser smoke test.** `client/e2e/smoke.spec.ts` with `client/playwright.config.ts`: `/` (connects, completes a local-runtime turn), the Enter/proposal scenario, `/?gallery=1` (every content component attached), `/?debug=1`; any console error or page error fails the test, with tile-fetch and GPU noise filtered. `scripts/e2e.sh` builds the client and the backend binary, then runs Playwright with the Go server as `webServer` (loopback, throwaway data dir, local runtime). `scripts/chromium-libs.sh` makes it run on a Linux box without sudo: it finds the libraries Playwright's Chromium lacks, fetches them with `apt-get download`, extracts them under `client/.chromium-libs/` (gitignored) and prints the `LD_LIBRARY_PATH`/fontconfig environment; verified here on Debian 13 with no root. Pinned `@playwright/test@1.60.0`, the release that matches the Chromium build already cached on this machine. `pnpm e2e` runs it alone; `pnpm check` runs it last.
3. **Enter sends and confirms.** `CommandInput` calls `preventDefault` only on the Enter that submitted text; `useGlobalKeys` ignores events already handled. Enter on an empty input still reaches a Confirm card. Regression tests: `app/enter.test.tsx` (vitest) and the second smoke test (real browser).
4. **Dev-mode bypass.** `httpsrv/guards.go` replaces `middleware.RealIP` and the CORS middleware: forwarded headers are honoured only when `CORELLIA_TRUSTED_PROXIES` names the TCP peer; `CORELLIA_BIND` with a loopback default in dev mode (`Config.ListenAddr`); a dev-mode Host guard (loopback names only); an Origin guard (same origin or a listed dev origin, otherwise 403, preflight included); JSON-only POSTs with a body (audio upload excepted); security headers with a CSP built from the image allowlist. Tests cover each guard, including the spoof the reviewer demonstrated.
5. **Silent failures.** A failed turn's `turn_done.text` is the partial reply plus an apology with the reason; it goes to the transcript and to speech, and an error Status card shows for 20 s (`session.go`). The client shows the latest error for 12 s outside `?debug=1` (`app/ErrorLine.tsx`). `CORELLIA_ANTHROPIC_FALLBACKS=false` disables the beta header. The Anthropic runtime still has not been run live (no key here).
6. **Replay re-speaks.** `SessionStream` forwards an event to the voice controller only when the store had not seen it (`seq` beyond the previous `lastSeq`).

### Found by the smoke test

- `Session.Snapshot` encoded an empty transcript as `null`; the client dropped the whole snapshot as off-contract, so a fresh install showed no runtime, no capabilities and no replayed spec. Fixed and covered by `TestFreshSnapshotIsOnContract`.
- A `clear` op removed the Confirm card of a still-pending proposal (the local runtime's time card starts with `clear`). `restoreConfirmCards` re-adds the cards after every clear; `TestClearKeepsPendingConfirmCard` covers it.
- Ajv compiles validators with `new Function`, which the new CSP blocked. `script-src` carries `'unsafe-eval'` for now; precompiling the validators at build time would remove it.
- The catalog's Image example pointed at `example.com`, outside the allowlist; it now uses a Wikimedia URL (contracts regenerated).

### Non-blocking items done

- **Transport and auth:** reconnect with exponential backoff when `EventSource` gives up; a probe tells `unauthorized` (401/403) from unreachable; the banner says "device token rejected" and a token prompt (`app/TokenPrompt.tsx`) stores the typed token and reconnects; `?token=` is stored and removed from the address bar on first load.
- **Rendering safety:** `CORELLIA_IMAGE_HOSTS` allowlist enforced on Image `add_node`/`set_props` (`image_host_not_allowed`) and in the CSP `img-src` (which also covers bound values); `Renderer` renders implementations as keyed elements so hooks are stable and unmount cleanup runs (MapLibre releases its WebGL context); the root node is keyed; tile errors no longer put a map into its fallback for good, and a failure is tied to the inputs that produced it; the error boundary resets on spec change, not on every render.
- **show_ui feedback:** the tool dry-runs its batch through `Session.DryRunOps` and tells the model which ops were rejected and why, instead of "Displayed N ops." for everything.
- **Configuration:** `auto` picks `openai` only when `OPENAI_BASE_URL` is set (`OPENAI_API_KEY` alone is the voice key, as documented; the log says so); `CORELLIA_TZ` for reminders and tools, `TZ` documented for Docker; the Docker image binds all interfaces and documents that it needs a token.
- **Session:** blank turns are a 400; `truncate` is rune-safe; `Confirm` leaves the agent state alone while a turn runs; decay timestamps survive reconnects; speech outside a turn (confirm results, reminders) reaches the transcript on its final piece.
- **Voice and scene:** typing stops playback without cancelling the turn (speech start still does both); the scene stays `speaking` while audio plays after `turn_done`; Cmd no longer toggles the mic (Spotlight, minimise); browser recognition stops after `not-allowed`, `audio-capture`, `network` and similar instead of looping; the `AudioContext` is created and resumed on the first key press; `init()` revives a disposed controller so voice works under Vite's StrictMode.
- **Header:** names the runtime, with the local runtime shown as "local demo".
- **CI:** `.github/workflows/check.yml`: client checks, `go vet`, `go test -race`, gofmt, contract drift, the smoke test with Playwright's own dependency installer.

## Design decisions

- **Cache in the hook, not primitives everywhere.** A cached, shallow-compared selector keeps the one-call-per-component style the app already used and makes the mistake impossible to repeat; the App mount test guards it.
- **Guards as plain middleware in `httpsrv`.** Auth keeps its one job (the token). Origin, Host, content type and real-IP policy are request-shape concerns and live together in `guards.go`, each with a table test.
- **Restore cards rather than change `clear`.** The reducer semantics are shared and fixture-tested in two languages; re-adding Confirm cards after a clear keeps the contract untouched and the invariant simple: a confirmable proposal is visible.
- **Fail loud on the Anthropic beta.** The fallback header stays on by default because it is the intended behaviour; the escape hatch exists because nobody has run it live yet.
- **Smoke test in `pnpm check`.** It is the only check that exercises the bundle in a browser. The library bootstrap keeps it runnable in constrained environments instead of silently skipped.

## Files changed

Added: `client/e2e/smoke.spec.ts`, `client/playwright.config.ts`, `scripts/e2e.sh`, `scripts/chromium-libs.sh`, `.github/workflows/check.yml`, `backend/internal/httpsrv/guards.go` (+test), `backend/internal/session/review_test.go`, `client/src/app/{App.test,enter.test}.tsx`, `client/src/app/{ErrorLine,TokenPrompt}.tsx`, `client/src/app/runtimeLabel.ts`, `client/src/components/mapErrors.ts` (+test), `docs/executing/review-2026-10-29.md`, this note. Removed: `backend/internal/httpsrv/cors.go`. Edited: `backend/internal/config/config.go` (+test), `httpsrv/{server,session_handler}.go` (+tests), `session/{session,proposals}.go`, `runtime/rtselect/select.go` (+test), `runtime/anthropic` wiring, `tools/builtin/builtin.go` (+test), `cmd/api/main.go`, `backend/Dockerfile`, `shared/catalog/catalog.json` (+generated copies), `client/src/session/{store,stream,auth}.ts` (+tests), `client/src/app/{App,CommandInput,ErrorBoundary,OfflineBanner,ConnectionIndicator}.tsx`, `client/src/renderer/{Renderer,Stage}.tsx`, `renderer/useGlobalKeys.ts`, `components/Map.tsx`, `voice/{activation,browserStt,controller,playback}.ts` (+tests), `client/package.json`, `package.json`, `.gitignore`, `.env.example`, `README.md`, `CLAUDE.md`, `docs/stack.md`, `box/README.md`, roadmap, changelog.

## How to run

```bash
pnpm install && pnpm -C client build && cd backend && go run ./cmd/api   # http://127.0.0.1:8080
```

Dev mode listens on loopback only. With `CORELLIA_DEVICE_TOKEN` set it listens everywhere; open `/?token=<token>` once or type the token into the prompt the page shows on a 401.

## How to test

```bash
pnpm check                     # type-check, lint, 130 vitest tests, go vet, go test, browser smoke test
pnpm e2e                       # smoke test alone (first time: pnpm -C client exec playwright install chromium-headless-shell)
```

Verified here: `pnpm check` green; the four smoke tests pass in headless Chromium 1223 on Debian 13 with the libraries fetched by `scripts/chromium-libs.sh` (no sudo); `pnpm contracts:generate` leaves no diff; Go: 108 top-level tests (215 with subtests) including the new guard, session, config, selection and tool tests. `go test -race` could not run here (no C toolchain); CI runs it.

## Known gaps

- **Not run live:** the Anthropic, OpenAI-audio and Hermes integrations, the Docker image, the box scripts. The runtime spike for `anthropic` still needs a key.
- **Speech starts at turn end.** Sentences are published with `turn_done`; streaming them as they complete is the next product change (VISION 7 criterion 1).
- **Two pending proposals stack** in the same corner and share Enter/Escape; the first in sort order wins.
- **Digit hotkeys** take the first keystroke of a message that starts with a digit while numbered actions are on screen.
- **Short confirm phrases** ("ok", "sure") confirm the newest proposal for its TTL; a key press is not yet required for `risk: high`.
- **Long content is clipped** in the UI zone; no paging or keyboard scroll yet.
- **Self barge-in** on laptop speakers: headphones or `CORELLIA_VOICE_MODE=ptt` are the workaround; speech-start suppression while playing is not implemented.
- **`'unsafe-eval'` in the CSP** until the Ajv validators are precompiled at build time.
- **Catalog fit-ranking** still does not narrow the prompt per turn.

## Follow-ups

1. Run `go run ./cmd/runtime-spike -runtime anthropic` with a real key and commit the report; decide VISION 7.
2. Stream speech per sentence during the turn.
3. Precompile the Ajv validators (standalone code) and drop `'unsafe-eval'`.
4. Require a key press for high-risk proposals; stack multiple proposals as a list.
5. A first run on macOS with microphone and speakers, following the Phase 8 acceptance line.

# Phase 13: Beta readiness (round-2 review)

**Date:** 2026-10-29. **Branch:** `feat/vision-implementation`. **Changelog:** 0.15.13. **Roadmap:** [`../executing/roadmap.md`](../executing/roadmap.md) Phase 13. **Input:** the second independent review, [`../executing/review-2026-10-30.md`](../executing/review-2026-10-30.md) (against `0c40505`, verdict: alpha), committed with this phase.

## Summary

The review found every Phase 11 fix holding and the Phase 12 claims true, and still rated the build an alpha for four reasons: a one-line bug that made the screen claim "connection lost" after any failed turn (and after every reload from then on), red CI on two machines' worth of generator drift and a moved runner image, a speech and microphone layer that had only been read, and two runs nobody but the owner can do. This phase fixes everything on that list that can be fixed and proven here, with a test for each of the review's blocking items 1, 3, 4, 5, 7 and 8, and turns the two owner-only items into a single checklist with pass criteria ([`../executing/owner-checklist.md`](../executing/owner-checklist.md)).

Nothing architectural moved. One contract change (an event renamed on the wire, a flag on transcript entries), one new local-runtime intent, and a client that no longer trusts the browser's `error` channel to mean what it says.

## What was built

### Item 1: the false "connection lost" banner

- **Root cause.** The server named its failure event `error`. An `EventSource` dispatches a server event with that name to `onerror` as well as to the named listener, and the client took every one for a connection error: one bad turn flipped the header to RECONNECTING and showed the banner; the bus replayed the event on every reload, so the banner came back for good. A genuine network error, delivered as a plain `Event` to the same listener, crashed on `e.data.slice`.
- **Fix, contract side.** The event is `session_error` in `shared/schema/events.schema.json` (the schema says why), regenerated into Go and TS, and renamed at every publish site, in the two command-line tools and in the client reducer and listener list.
- **Fix, client side.** `SessionStream` ignores `MessageEvent`s in `onerror` (defence against any future named collision) and ignores events without a string payload in the named listeners.
- **Proof.** `stream.test.ts` covers the three cases; `App.test.tsx` uses the new name. The local runtime gained an on-demand failure ("simulate a failure", "fail on purpose": a partial reply, then a fatal error), and the smoke test's fifth step drives it in real Chromium: the apology appears in plain words, the error line and status card show, the header stays `online`, and after a reload (which replays the buffered `session_error`) it is still `online` with no banner and no page error.

### Item 3: the mic can no longer record while saying "mic off"

- `VoiceController.openMic` awaited `getUserMedia` and only then set `capture`; a close in between (a short push-to-talk tap, a second Ctrl+Space while the permission prompt was open) found nothing to close, and the capture then started against an `off` state. A generation counter is bumped on every open and close; after the await, a stale generation (or an activation that is no longer open) stops the stream's tracks and returns. A second open cannot create a second capture.
- Push-to-talk also releases on window blur (Cmd+Tab while holding the key never delivers the key-up).
- A fatal recognition error (`not-allowed`, `audio-capture`, …) now closes the mic and returns the indicator to off instead of leaving it on "listening".
- Tests: a pending `getUserMedia` resolved after a close (tracks stopped, no capture, mic off, a later open works once), blur in push-to-talk, fatal versus transient recognition errors.

### Item 4: the speech queue under barge-in and always-on use

- **Abort.** `PlayBackend.speak` takes an `AbortSignal`; `SpeechPlayer.stop()` aborts the current piece. The server backend checks the signal after the fetch and after decoding (a stale sentence no longer plays over the next one, and its level meter is never started), passes the signal to the fetch, stops the source on abort, and clears any previous meter before starting a new one. The browser backend cancels on abort and holds a reference to its utterance (Chrome collects utterances referenced only by their handlers, and then `onend` never fires).
- **Deadline.** Every piece has a deadline (4 s plus 150 ms per character; injectable for tests). A piece that gives no end is cut, reported through `onError`, and the queue moves on, so the scene cannot stay "speaking" forever and, with `CORELLIA_VOICE_BARGE_IN=off`, voice input cannot be ignored for good.
- **Escape.** Most speech plays after `turn_done`, when Escape used to clear the screen. It now stops playback first; if a turn is running it cancels it; if neither, it falls through to the escape-bound action or a clear as before.
- Tests: a piece stopped during its fetch is dropped and a fresh one plays; a wedged piece is skipped at its deadline and the player ends idle.

### Item 5: failures in plain words, dropped streams as failures

- `session.describeFailure` maps a runtime error to one spoken sentence (rejected credentials, unavailable model, rate limit, overloaded, internal error, dropped connection, timeout, unreachable, tool-round cap, the simulated failure, and a default that points at the log). The apology, the status card and the transcript use it; the `session_error` event (debug pane) and the server log keep the raw error with its URL and JSON body.
- The failed reply is stored with `failed: true` (new optional field on `TranscriptEntry`) and `historyLocked` leaves it out of the history the model sees. The user's question stays; the Messages API accepts consecutive user turns.
- `runtime/anthropic`: a stream that ends without a stop reason returns an error ("stream ended without a stop reason"), so a connection dropped mid-reply, or a tool call cut mid-input, becomes a failed turn with the partial text spoken and the apology after it, instead of a completed turn with half a sentence. Tested for both shapes.

### Item 7: CI green on any machine

- `scripts/contracts-generate.sh` runs `go run github.com/atombender/go-jsonschema@v0.24.1` (the version the committed types were made with; a locally installed v0.24.1 against the script's v0.20.0 install was the drift). `GO_JSONSCHEMA` still overrides the command. Regenerating leaves no diff.
- `.github/workflows/check.yml` pins `runs-on: ubuntu-24.04` for all four jobs: `ubuntu-latest` moved to 26.04, for which Playwright 1.60 publishes no Chromium.

### Item 8: generated UI no longer collides with itself

- `renderer/resolve.overlayGroups` groups a glance root and every floating overlay by anchor; the renderer lays each group out as one column (`data-overlay-group`), and `Overlay` renders in flow inside a group (`OverlayStack` context) instead of positioning itself. The reply card, the error status card, the reminder confirmation and the clock stack at top right; proposals keep bottom right.
- The top anchors moved below the top bar (`top-14`), where the header, the offline banner (now in the bar, centred, never over generated UI) and the mic indicator live. The error line is a row of its own in the footer, above the transcript, instead of an absolutely positioned line over its last entry.
- Tested in `Renderer.test.tsx` (two overlays at one anchor, in flow) and in the smoke test (the glance root and the status card at top right do not overlap, measured).

### Non-blocking items taken

- **Enter auto-repeat** confirmed the pending proposal after sending a message: `useGlobalKeys` ignores `e.repeat`.
- **Digits on lower proposals**: `assignHotkeys` gives no digit to a `confirm_proposal` action (the top card has Enter; the rest are reachable by voice or when they reach the top); cancel actions keep theirs.
- **Voice capabilities fetched once**: `VoiceController.refreshCapabilities` runs when the stream comes online and applies only changes, swapping the playback backend only when the TTS provider changed; `init` survives a backend that is not up yet.
- **No error boundary around the 3D agent**: `App` wraps it in `ErrorBoundary` with `AgentFallback` as the fallback (new `fallback` prop).
- **Browser recognition**: `network` is no longer fatal (restart with backoff, 1 s doubling to 30 s); interim results mark speech start per utterance, so voice barge-in works past the first sentence of a continuous session; `onError` carries a `fatal` flag.
- **Renderer updated the store during render**: invalid nodes are reported from an effect, once per message.
- **`pendingSpeech`** is reset on a snapshot and on `turn_started`; a `turn_done` whose reply the snapshot already holds is not added twice.
- **403 from the Origin/Host guard** is a new `forbidden` connection status ("request refused · check the page's origin and host"), not the token prompt.
- **Snapshot and seq in two calls**: `Session.Snapshot` carries the bus seq read under the session lock; `spec_op` and `turn_started` are published under that lock (the bus never blocks), and the SSE handler uses the snapshot's seq.
- **The Anthropic SDK read its own environment**: `option.WithoutEnvironmentDefaults()`; `ANTHROPIC_BASE_URL` is now a `config` field passed through `Options.BaseURL` (rule 4). Tested with a bogus URL in the environment.
- **`open_directions`** only draws a map: no confirmation (rule 5).
- **`CORELLIA_DEV_ORIGINS`**' Vite default is dropped in token mode unless set explicitly.
- **`transcript.jsonl`** is written 0600 like the other files.

### Owner checklist

[`../executing/owner-checklist.md`](../executing/owner-checklist.md): the live model run (key, `scripts/anthropic-live-check.sh --check-only`, the spike, a day of use, what to record and where) and the Mac microphone run (input-source shortcut, keyless and server audio, barge-in on speakers, Escape, the double-tap race, push-to-talk and blur, an afternoon with the mic open), each with pass criteria.

## Design decisions

- **Rename the event rather than special-case the wire.** Keeping `type: "error"` in JSON while sending another SSE name would have hidden a mapping in two places; `session_error` is what it is everywhere, and the client guard is only a second line.
- **A local-runtime failure intent.** The smoke test needs a failing turn without a key; a scripted intent is honest about what it is and doubles as a way to show the owner what a failure looks like.
- **Short reasons on the server, raw detail in the event.** The client must not parse provider errors; the mapping sits next to the session that already decides what is spoken, and mirrors `cmd/runtime-check` so the two agree.
- **A `failed` flag instead of a separate list.** The transcript is the one record (persisted, replayed, shown); one optional field keeps it so and lets history skip the apology after a restart too.
- **Client-side overlay stacking.** The review suggested applying the proposals pattern (one overlay holding a Stack) on the server to every card. Stacking by anchor in the renderer covers the server's cards and the model's own overlays without the server having to know which cards are on screen.
- **Deadline in the player, not the backends.** One mechanism covers both backends and any future one; the backends only have to honour the signal.
- **Pinned generator through `go run`.** No install step to forget, no binary to drift; the version is one line in the script.

## Files changed

Added: `backend/internal/session/failure.go`, `client/src/components/overlayStack.ts`, `docs/executing/owner-checklist.md`, `docs/executing/review-2026-10-30.md` (the review, unchanged), this note. Edited: `shared/schema/events.schema.json` (+ generated Go/TS and validators), `scripts/contracts-generate.sh`, `.github/workflows/check.yml`, `backend/internal/session/{session,proposals}.go` (+ tests), `backend/internal/httpsrv/events_handler.go`, `backend/internal/runtime/anthropic/anthropic.go` (+ test), `backend/internal/runtime/local/local.go` (+ test), `backend/internal/runtime/rtselect/select.go`, `backend/internal/config/config.go` (+ test), `backend/internal/store/store.go`, `backend/internal/tools/builtin/builtin.go`, `backend/cmd/{runtime-check,runtime-spike}/main.go`, `client/src/session/{stream,store,api}.ts` (+ tests), `client/src/app/{App,ErrorBoundary,ErrorLine,OfflineBanner,ConnectionIndicator}.tsx` (+ tests), `client/src/renderer/{Renderer,resolve,useGlobalKeys}.ts(x)` (+ tests), `client/src/components/layout.tsx`, `client/src/voice/{controller,playback,browserStt}.ts` (+ tests), `client/e2e/smoke.spec.ts`, `README.md`, `.env.example`, roadmap, changelog.

## How to run

```bash
pnpm install && pnpm -C client build && cd backend && go run ./cmd/api   # http://127.0.0.1:8080
# Type "simulate a failure" to see a failed turn on the local runtime.
# With a key and a Mac: docs/executing/owner-checklist.md
```

## How to test

```bash
pnpm check        # type-check, lint, 151 vitest tests, go vet, go test, 5 browser smoke tests
pnpm e2e          # the smoke tests alone (includes the failing-turn step)
```

Verified here: `pnpm check` green; `pnpm contracts:generate` leaves no diff with the pinned generator; `gofmt -l` clean; the smoke test's failing-turn step passes in Chromium, and a screenshot of that state shows the clock and the error card stacked at top right, the proposal at bottom right, the error line above the transcript and the header still ONLINE. CI (the pushed run for this commit) is the proof for item 7.

## Known gaps

- **Not run live:** the Anthropic API, OpenAI audio, Hermes, the Docker image, the box scripts, Safari. The owner checklist is the path.
- **A cancelled turn's partial reply** still goes into the transcript and history (the review called it defensible). When turns are sent faster than they finish, the transcript shows the fragments.
- **The directions origin** is still the Lisbon office constant in `builtin.go`; an office-location setting is a small follow-up.
- **No speech prefetch** with server TTS: a round-trip gap between sentences.
- **High-risk voice hold** is still unexercised by any registered tool.
- **Bound `Image.src`** values are covered by the CSP only (Vite dev serves no CSP).

## Follow-ups

1. The owner checklist, in order; record the VISION 7 decision and the Phase 8 acceptance line.
2. `CORELLIA_OFFICE_LOCATION` for the directions origin and the clock.
3. Speech prefetch (fetch piece N+1 while N plays) in `ServerTtsBackend`.
4. Mark cancelled partial replies in the transcript and skip them in history, as failed ones are now.

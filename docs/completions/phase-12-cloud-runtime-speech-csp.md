# Phase 12: Verifiable cloud runtime, streamed speech, strict CSP, remaining review items

**Date:** 2026-10-29. **Branch:** `feat/vision-implementation`. **Changelog:** 0.15.12. **Roadmap:** [`../executing/roadmap.md`](../executing/roadmap.md) Phase 12. **Input:** the follow-ups and known gaps of [`phase-11-review-fixes.md`](phase-11-review-fixes.md) and the non-blocking items of [`../executing/review-2026-10-29.md`](../executing/review-2026-10-29.md) that were still open.

## Summary

Phase 11 left three things open that stand between an alpha and something the owner can trust: the runtime they will actually use (Claude) had never been checked against anything but hand-written fixtures and had no way to be checked; speech started only when the whole turn had finished, which with tool rounds means seconds of silence; and the client needed `'unsafe-eval'` in its Content-Security-Policy because Ajv compiled the contract validators at startup. This phase closes all three and the review's remaining non-blocking items that had a clear fix. Nothing here changes the architecture: the runtime seam, the decision seam and the shared contract absorb each change behind an interface or a generator.

**Still not run live:** the Anthropic API (no key here), OpenAI audio, Hermes, the Docker image, the box scripts. What changed is that the first live run is now one script with a diagnosis instead of a guess.

## What was built

### Anthropic runtime: verifiable without a key, one command with one

- **Recorded wire fixtures.** `backend/internal/runtime/anthropic/testdata/recorded/round-{1,2,3}.sse` are three request rounds of one turn in the exact `text/event-stream` shape of the Messages API (`message_start` with usage, an empty `thinking` block with its `signature_delta` as the API streams it when `thinking.display` is omitted, `ping` keepalives, text deltas, a `show_ui` tool use whose input arrives in two `input_json_delta` pieces, a `get_time` tool use, `end_turn`).
- **Request goldens.** `contract_test.go` replays the recording from an `httptest` server and records every request the runtime sends (method, path, the headers that matter, the JSON body) as `testdata/golden/request-{1,2,3}.json`. `go test ./internal/runtime/anthropic -update` rewrites them. A reviewer can hold the goldens next to the API reference: model, `max_tokens`, `stream: true`, `output_config.effort`, `fallbacks: "default"` with the `server-side-fallback-2026-07-01` beta header, a cached system block, tools with their JSON Schemas, and on the second round the assistant turn replayed verbatim (thinking block included) followed by the `tool_result`. Spot checks assert the parts that must hold whatever the golden says: no `thinking` or `temperature` field (both rejected by current models), the thinking block passed back unchanged, the tool result id. A second test covers the escape hatch (`Fallbacks: false`: no beta header, no `fallbacks` field) and the model, effort and max-tokens options.
- **Finding:** the SDK (anthropic-sdk-go v2.4.0) sends the key as `Authorization: Bearer`, not `x-api-key`. Both headers are recorded so a change shows in the golden.
- **`cmd/runtime-check`.** Builds the real tool registry and session (same wiring as `cmd/api`, `show_ui` dry run included), then runs three checks against the configured runtime: a plain turn ("reply with the word ready"), a tool turn (`get_time` must be called and valid ops must reach the screen; with no spec errors), and a cancel (a long answer cut after 400 ms must end `cancelled` within 5 s). It prints a Markdown table with timings (first token, first speech, first op) and, on failure, a diagnosis that names the setting to change: bad key (`ANTHROPIC_API_KEY`), unknown model (`CORELLIA_MODEL`), rejected beta (`CORELLIA_ANTHROPIC_FALLBACKS=false`), rejected effort (`CORELLIA_EFFORT`), rate limit, no tool use, timeout. Exit 1 on a failed check, 2 on configuration. Verified here against the local runtime (all three pass) and without a key (fails fast with the key diagnosis).
- **`scripts/anthropic-live-check.sh`** runs the check and then the VISION 7 spike with the report written to `docs/executing/spikes/anthropic-<date>.md`; `--check-only` stops after the table. `TestLiveAnthropic` does the same single turn inside `go test` when `CORELLIA_LIVE=1` and a key are set (skipped otherwise).

### Speech streams during the turn

- `decision.SentenceStream` turns text deltas into speakable sentences as they complete: a sentence ends at punctuation followed by whitespace or at a blank line (the whitespace is the proof that "3.5" or "e.g." is not an end); Markdown emphasis is stripped; pieces shorter than 8 characters wait for the next sentence. `decision.Sentences` is now built on the same stream so a turn spoken at the end and a turn spoken as it streams sound the same.
- `decision.Streamer` is the seam: a decider that implements `StreamSpeech(Input) bool` decides per turn. The rules decider streams every user turn and keeps proactive items on the end-of-turn path (hold policy unchanged).
- The session pushes every text delta through the stream and publishes each completed sentence as a `speech` event (`final: false`) while the runtime is still writing; at `turn_done` the remainder goes out as the final piece. A failed turn says the unspoken rest of the partial reply and then the apology; a cancelled turn says nothing more (the client cut playback on `turn_done`). The transcript still holds the whole reply once. `TestSpeechStreamsDuringTurn` drives a paced runtime and asserts that the first sentence is speech before `turn_done` exists.
- The spike report gained a "First speech" column and a mean (VISION 7 criterion 1).

### No `'unsafe-eval'`

- `scripts/gen-validators.mjs` compiles every shared schema (UI spec, ops, events, catalog, each `api.schema.json` definition) and every component's props schema with Ajv's standalone code generator into `client/src/contract/gen/validators.js` (+ `.d.ts`), committed and regenerated by `pnpm contracts:generate`. Ajv emits `require()` for two runtime helpers even in ESM mode; the generator rewrites them to imports of `client/src/contract/validatorRuntime.ts` (code-point length, RFC 3339 date-time) and fails if any other `require` appears.
- `registry.ts` wraps the precompiled functions; `errorsText` is a local copy of Ajv's format. Ajv is a build-time dependency only: the production bundle contains none of it.
- The drift test regenerates the validators next to the types and compares. `script-src` is `'self'`. The smoke test (real Chromium against the Go server, failing on any console error) passes under the new policy: the proof that nothing in the bundle needs eval.

### Review items

- **Pending proposals stack.** One floating overlay (`proposals`) holds a `Stack` of Confirm cards, newest on top. Only the top card is bound to Enter and Escape; the others get numbered hotkeys from the renderer and remain reachable by voice. Confirming, rejecting or expiring one re-renders the stack; the overlay disappears with the last proposal; a `clear` from the next turn restores it.
- **High-risk proposals ignore spoken confirmation.** A confirm phrase from the voice source on a `risk: high` proposal is held: the agent says "This one needs a key press: Enter to confirm, Escape to cancel." A typed "ok" still confirms (it is a key press). `Outcome.Handled` gained `held`.
- **Digits no longer swallow a message.** A lone digit that matches a numbered action goes into the input and fires after a 350 ms grace period, leaving the input again; a digit followed by more typing within the window is the start of a message ("10 minute timer"). `CommandInput` exposes an imperative `clear()` for this.
- **Long content scrolls.** The UI zone is scrollable (scrollbar hidden); with an empty input, arrows scroll by a step and PageUp/PageDown by a screen.
- **`CORELLIA_VOICE_BARGE_IN=off`.** Reported in `/api/voice/capabilities` as `barge_in`; the client then ignores speech detected while the agent is speaking, text included (laptop speakers feed the agent's own voice back into the mic). Typing and Escape still interrupt. Default `auto` keeps barge-in.
- **Push-to-talk keeps the sentence in flight.** Releasing the key while speaking delivers the captured utterance instead of discarding it (`MicCapture.stop(flush)`).
- Dead `confirmProposal`/`rejectProposal` client API functions removed (cards fire through `/api/action`).

## Design decisions

- **Goldens, not assertions, for the wire shape.** A golden is something a person can read against the API reference in one sitting and that fails loudly on an SDK upgrade; assertions on a dozen fields would miss the field nobody thought of. The recorded streams are hand-authored from the reference rather than captured (no key here), and say so.
- **Stream decision in the decider, splitting in the session.** Whether to speak early is policy (Jev's seam); how to cut sentences is mechanics. The `Streamer` interface keeps a model-backed decider free to say no per turn.
- **One sentence rule.** `Sentences` reuses `SentenceStream` so the apology, reminders and streamed turns sound alike; the short-piece threshold dropped from 12 to 8 so "It's 14:05." is spoken alone.
- **Generated validators are a contract artefact.** They live under `gen/`, are produced by the same script as the types, and are drift-tested the same way; the hand-written runtime is two functions with the algorithms Ajv would have required.
- **Grace period over modifier keys.** Alt+digit collides with macOS dead keys and makes the hotkeys undiscoverable; 350 ms is below the threshold where a deliberate single press feels delayed.
- **Hold, do not reject, high-risk voice confirmations.** The proposal stays pending; the user is told what to press.

## Files changed

Added: `backend/cmd/runtime-check/main.go`, `backend/internal/runtime/anthropic/contract_test.go`, `backend/internal/runtime/anthropic/testdata/{recorded/README.md,recorded/round-1..3.sse,golden/request-1..3.json}`, `scripts/anthropic-live-check.sh`, `scripts/gen-validators.mjs`, `client/src/contract/validatorRuntime.ts`, `client/src/contract/gen/validators.{js,d.ts}`, this note. Edited: `backend/internal/decision/decision.go` (+test), `backend/internal/session/{session,proposals}.go` (+tests), `backend/internal/config/config.go` (+test), `backend/internal/voice/{voice,select}.go`, `backend/internal/httpsrv/guards.go` (+test), `backend/cmd/runtime-spike/main.go`, `scripts/contracts-generate.sh`, `client/src/contract/{registry.ts,drift.test.ts}`, `client/src/renderer/{useGlobalKeys.ts,Stage.tsx}` (+tests), `client/src/app/{App,CommandInput}.tsx`, `client/src/app/enter.test.tsx`, `client/src/voice/{controller,capture,capabilities}.ts` (+tests), `client/src/session/api.ts`, `.env.example`, `README.md`, `CLAUDE.md`, `docs/stack.md`, roadmap, changelog.

## How to run

```bash
pnpm install && pnpm -C client build && cd backend && go run ./cmd/api   # http://127.0.0.1:8080
# With a key, before anything else:
scripts/anthropic-live-check.sh                                           # check table + spike report
```

## How to test

```bash
pnpm check                                     # type-check, lint, 134 vitest tests, go vet, go test, browser smoke test
cd backend && go test ./internal/runtime/anthropic -update   # after a deliberate change to the request shape
cd backend && CORELLIA_LIVE=1 go test ./internal/runtime/anthropic -run TestLiveAnthropic -v   # with a key
```

Verified here: `pnpm check` green (smoke test under the strict CSP); `pnpm contracts:generate` leaves no diff; `go run ./cmd/runtime-check -runtime local` passes all three checks and the keyless `anthropic` path exits 2 with the key diagnosis. `go test -race` runs in CI (no C toolchain here).

## Known gaps

- **No live cloud run yet.** The owner's first step with a key is `scripts/anthropic-live-check.sh`; its report decides VISION 7.
- **First run on macOS with microphone and speakers** (Phase 8 acceptance line) is still pending; `CORELLIA_VOICE_BARGE_IN=off` and `CORELLIA_VOICE_MODE=ptt` are the fallbacks for laptop speakers.
- **Catalog fit-ranking** still does not narrow the prompt per turn. Deliberate: the catalog is fifteen components and the model picks better than a keyword tagger; narrowing by display profile needs the client to report its viewport, which is a small follow-up.
- Speech streamed mid-turn plays sentence by sentence; with browser `speechSynthesis` the voice may pause between pieces more than a single utterance would.

## Follow-ups

1. Run `scripts/anthropic-live-check.sh`, commit the spike report, decide VISION 7.
2. Mac run with mic and speakers; tune the VAD thresholds and the grace period from real use.
3. Display-profile narrowing of the catalog description (client reports viewport on `/api/heartbeat`).

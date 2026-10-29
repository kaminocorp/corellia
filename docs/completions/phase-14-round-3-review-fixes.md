# Phase 14: Round-3 review fixes

**Date:** 2026-10-29. **Branch:** `feat/vision-implementation`. **Changelog:** 0.15.14. **Roadmap:** [`../executing/roadmap.md`](../executing/roadmap.md) Phase 14. **Input:** the third independent review, [`../executing/review-2026-10-30-round3.md`](../executing/review-2026-10-30-round3.md) (against `1368df5`, verdict "alpha, at the beta threshold"), committed with this phase.

## Summary

The review found every Phase 13 fix holding and left three cheap defects between the build and a beta: the transcript drew over every full-screen visual, the always-on error line showed raw provider errors and routine op rejections, and a reply cut by `max_tokens` passed as complete (with a cut `show_ui` call dropped silently). This phase fixes all three with a test each, plus the review's non-blocking items that need no key or microphone: failure classification by HTTP status instead of substrings, the glued half sentence, OSM attribution, Referer and block detection, the undisclosed audio destination of keyless voice, speech silent after a reload, and two checklist corrections. The owner-only runs (live model, Mac microphone) stay in [`../executing/owner-checklist.md`](../executing/owner-checklist.md).

Nothing architectural moved. Two additions to the runtime seam (`StatusError`, `ErrTruncated`), one config field (`CORELLIA_MAX_TOKENS`), one request-golden change (`max_tokens`), no contract change.

## What was built

### Item 3: the transcript over full visuals

- **Root cause.** In `panel` and `full` placement the generated-UI zone ended at a fixed `bottom-36` (144 px), but the footer holds the error line, up to six transcript entries and the input, and grows upward. The review measured the zone reaching 111 px into the transcript at 1440×790, 146 px at 1920×1080 and 180 px at 3840×2160.
- **Fix.** `App` measures the footer's extent from the bottom edge (height plus its offset; a `ResizeObserver` on the footer and the root) and publishes it as `--footer-h` on the display root; the Stage ends its panel and full zones at `calc(var(--footer-h) + 0.5rem)` (the fallback, before a measurement, is the old fixed footer). The agent's corner in full mode sits above the same line. While a panel or full visual is up, the transcript keeps two entries (the visual is the answer; a tall transcript would push the zone into a strip).
- **Proof.** Two smoke-test steps (1440×790 and 1920×1080) fill the transcript, show a map (a `Split` root: full placement), and assert the zone's bottom is above the footer and the transcript, with the zone still taller than 45% of the viewport.

### Item 4: the error line

- **What was wrong.** `ErrorLine` showed the newest store error as `code: message` for 12 s in every mode: after a 401, the SDK's message with URL and JSON body; after a successful `show_ui` turn with one bad op, a red `image_host_not_allowed: …`. With Claude, rejected ops are routine and repaired by the model, so an always-on screen would regularly show red after turns that worked.
- **Fix.** Outside `?debug=1` the error line shows only the client's own failures, in plain words (`app/errorWords.ts`: a send, an action, a clear, the 3D agent). A failed turn has its apology in the transcript and the status card ("That didn't work: …"), and a rejected op is reported to the model in the tool result, so neither shows. With `?debug=1` every error shows raw, as before, and the debug pane and the server log keep everything.
- **Proof.** `ErrorLine.test.tsx` (mapping, nothing for a rejection, raw in debug), `App.test.tsx` (a raw runtime error stays off the screen; shows with `?debug=1`), and the smoke test (the failing-turn step asserts the status card text and an empty error line; the debug-pane step drives the failure and asserts the raw text).

### Item 5: `max_tokens`

- **What was wrong.** The Anthropic runtime treated an empty stop reason as an error (Phase 13) but let `max_tokens` fall through as a completed turn: the fragment was spoken as the answer and went into history; a `tool_use` block cut the same way never ran and nobody was told. The default cap was 4096, and on Opus 5.5 thinking counts toward it.
- **Fix.** `stop_reason: max_tokens` returns `runtime.ErrTruncated` (fatal) with the cap in the message; the session speaks the partial as its own piece ending in "…", then "Sorry, that didn't work on my side. My reply was cut off before it finished.", shows the status card, and marks the entry `failed` so it never reaches the model as its own words. The default cap is `anthropic.DefaultMaxTokens` = 64000 (the SDK's streaming guidance, room for thinking); `CORELLIA_MAX_TOKENS` overrides it (validated non-negative). The three request goldens were regenerated (`max_tokens` only).
- **Proof.** `TestMaxTokensIsTruncation` (a text fragment and a cut `show_ui` call: fatal error, `errors.Is(ErrTruncated)`, no tool call ran) and `TestTruncatedReplyIsCutOffNotComplete` (session: failed status, "…" on the fragment, fragment and apology as separate speech pieces).

### Non-blocking items

- **Failure classification by status.** `runtime.StatusError{Status, Err}` wraps a provider answer in the Anthropic runtime (`errors.As` into the SDK's `*anthropic.Error`) and the OpenAI-compatible runtime; `describeFailure(error)` classifies by it first (`describeStatus`: 401/403, 404, 429, 529/502/503/504, 408, 400/413/422, other 5xx) and uses substrings only for errors without a status (transport, timeout, the runtime's own messages); bare numbers and "model:" no longer count. `TestDescribeFailure` includes the review's request id `req_011CXyz4019` on a 429 and a 500, and "401" in a message with no status.
- **The glued half sentence.** `ellipsize` ends a fragment that stops mid-sentence with "…"; the failure path publishes the fragment and the apology as separate pieces, and the transcript text separates them with a blank line.
- **OSM tiles.** `Referrer-Policy: strict-origin-when-cross-origin` (same-origin requests still get the full URL; the token is in a header). The Map shows the attribution control (styled for the dark tiles) with the OSM copyright link. After `load`, `probeTile` fetches the centre tile and recognises the block response the review described: on 2026-10-29 OSM served it to an anonymous client as HTTP 200 with `Cache-Control: no-cache` (real tiles carry `max-age`), an `x-blocked` header (not readable cross-origin) and a fixed 6987-byte PNG whose SHA-256 is in `mapTiles.ts`. Either signal makes the Map fall back to the card with the reason. A tile that fails to load is no verdict. `mapTiles.test.ts` covers the coordinates and the three outcomes.
- **Keyless voice sends audio to Google.** Said in the README and in checklist step B2, with the server-audio alternative and VISION 11.6.
- **Sound after a reload.** Chrome refuses `speechSynthesis` and keeps an `AudioContext` suspended until a user gesture. The browser backend turns the `not-allowed` utterance error into `SpeechBlockedError`; the server backend gives `resume()` 250 ms and throws it if the context is still suspended (before fetching audio nobody would hear). The player holds the piece and the rest of the queue, reports `onBlocked`, and plays them when `prime()` arrives from the first key press or click (`pointerdown` is now attached too); `stop()` forgets held speech. `VoiceStatus.sound` and the mic indicator's "press any key for sound". Tests in `playback.test.ts` and `controller.test.ts`.
- **Checklist and tooling.** Step A4 says the header shows **anthropic** (the runtime name); A1 names `CORELLIA_MAX_TOKENS` and that `ANTHROPIC_API_KEY` is the only credential read; A4 expects an empty error line after a failure; `runtime-check`'s no-key diagnosis no longer suggests `ant auth status`.

## Design decisions

- **Measure the footer rather than cap the transcript only.** Collapsing the transcript alone still leaves the zone sized by a guess; measuring makes the zone correct for any footer content (a long error line, a streamed reply, a different font). The two-entry limit on top keeps the visual tall.
- **Nothing on the error line for a failed turn.** The status card already says it in the same words and the transcript keeps it; a third red line was noise. The raw text is one `?debug=1` away and in the log.
- **`max_tokens` is a failure, not a long answer.** A fragment in history anchors the next turn on half a thought, and a cut `show_ui` is a lost answer; the user hears what was said and why it stopped, and can ask again. 64000 is a ceiling: a short answer costs the same as before.
- **Status before text.** The status is the one fact the provider states unambiguously; everything else in the message is for humans reading the log.
- **A probe, not a header.** OSM's `x-blocked` header is not exposed to cross-origin scripts; the cacheability and the image hash are, and both identify the block without a dependency on headers OSM may change. If the image changes, the `no-cache` signal still holds; if both change, the map behaves as before this phase.
- **Hold speech, do not drop it.** A reminder that fires before the first key press is exactly the speech the owner should not miss; holding it until the gesture is better than a hint alone.

## Files changed

- Backend: `internal/runtime/runtime.go` (`StatusError`, `ErrTruncated`), `internal/runtime/anthropic/anthropic.go` (+ tests, goldens, contract test), `internal/runtime/openaicompat/openaicompat.go`, `internal/runtime/rtselect/select.go`, `internal/session/failure.go` (+ `session.go`, `review_test.go`), `internal/config/config.go` (+ test), `internal/httpsrv/guards.go` (+ test), `cmd/runtime-check/main.go`.
- Client: `renderer/Stage.tsx`, `app/App.tsx` (+ test), `app/ErrorLine.tsx`, `app/errorWords.ts`, `app/ErrorLine.test.tsx`, `app/MicIndicator.tsx`, `components/Map.tsx`, `components/mapTiles.ts` (+ test), `voice/playback.ts` (+ test), `voice/controller.ts` (+ test), `index.css`, `e2e/smoke.spec.ts`.
- Docs and config: `.env.example`, `README.md`, `docs/executing/owner-checklist.md`, `docs/executing/roadmap.md`, `docs/changelog.md`, this note, the review file.

## How to run

As before: `pnpm install`, `pnpm -C client build`, `cd backend && go run ./cmd/api`, open http://localhost:8080. New: `CORELLIA_MAX_TOKENS` in `backend/.env`; after a reload on a Mac, press any key once if the indicator asks for it.

## How to test

`pnpm check` (type-check, lint, 160 vitest tests, `go vet`, all Go packages, seven Playwright smoke tests in real Chromium). `go test ./internal/runtime/anthropic -update` rewrote the goldens for the new cap; running it again leaves no diff.

Verified here: `pnpm check` green; `gofmt -l` clean; the smoke test's overlap steps pass at both viewports, the failing-turn step shows the status card with an empty error line, and the debug-pane step shows the raw error. One public OSM tile was fetched twice from this machine (with and without browser headers) to record the block response; the hash and header in `mapTiles.ts` come from that.

## Known gaps

- The tile probe recognises the block image OSM serves today; a changed image with a cacheable response would draw as the map again. The lasting fix is a keyed tile provider (carried over).
- The 3840×2160 viewport the review measured is not in the smoke test (the two smaller ones are; the sizing is the same calculation).
- Held speech is replayed in full on the first gesture, however old; a reminder from an hour ago still speaks. Escape clears it.
- `max_tokens` on the OpenAI-compatible and Hermes runtimes is not classified (their `finish_reason`/stop handling is unchanged).

## Follow-ups

- The owner's two runs (checklist A and B): the VISION 7 decision and spike report, and the Mac voice run.
- Carried over from Phase 13: a cancelled turn's partial reply still goes into history; the directions origin is the Lisbon constant; no speech prefetch with server TTS; no `Risk: "high"` tool; a bound `Image.src` is covered by the CSP only; fit-ranking does not narrow the prompt; Ctrl+Space is not configurable.
- Small items the review listed and this phase did not take: the bare reminder text with no "Reminder:" lead-in, "in 1 minutes", the empty key chip on lower proposals, SSE replay from the snapshot's seq, a `packageManager` field for corepack, the local demo's table and chart phrasings.

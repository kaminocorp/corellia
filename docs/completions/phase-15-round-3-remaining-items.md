# Phase 15: Round-3 review, remaining items

**Date:** 2026-10-29. **Branch:** `feat/vision-implementation`. **Changelog:** 0.15.15. **Roadmap:** [`../executing/roadmap.md`](../executing/roadmap.md) Phase 15. **Input:** the small items of the third independent review ([`../executing/review-2026-10-30-round3.md`](../executing/review-2026-10-30-round3.md)) that [Phase 14](phase-14-round-3-review-fixes.md) listed as not taken, the Phase 13 follow-up on cancelled replies, and two Phase 14 known gaps that cost little.

## Summary

Phase 14 fixed the review's three blocking defects and the non-blocking items with a user-visible cost. This phase takes the rest that needs no key or microphone: the reminder lead-in and minute wording, the empty key cap on lower proposals, SSE replay from the snapshot's seq, a `packageManager` pin, the local demo's table, chart and reminder-time phrasings, cancelled replies kept out of the model's history (the Phase 13 follow-up), `finish_reason: length` on the OpenAI-compatible runtime, the 4K viewport in the smoke test's overlap measurement, and a checklist note on reading first-speech numbers for tool turns. Each has a test. With this phase every roadmap phase and every review item that can be done here is done; what remains is the owner's two runs in [`../executing/owner-checklist.md`](../executing/owner-checklist.md) (live model, Mac microphone).

One contract change (`TranscriptEntry.cancelled`, regenerated in Go and TS), no change to the runtime seam, no config change.

## What was built

- **Reminder speech.** `decision.Rules` speaks a fired reminder as `ReminderLeadIn + text` ("Reminder: stretch"), the same words as its transcript entry. Test: `decision_test.go` (the first piece), `proactive_test.go` (the speech event).
- **Minute wording.** `builtin.Duration(minutes)` says "under a minute", "1 minute", "5 minutes", "1 hour", "1 hour 30 minutes", "2 hours"; the `set_reminder` label uses it. Test: `TestDurationWords`.
- **Lower proposals.** `ActionBar` draws a key cap only for an action that has a key; a `confirm_proposal` action below the top card (no digit by Phase 13 design) shows "Do it" alone. Test: `Renderer.test.tsx` (the caps are exactly Enter, Esc and 1).
- **SSE replay.** `EventsHandler` takes the snapshot first and subscribes from the larger of the client's `Last-Event-ID` and the snapshot's seq. The snapshot holds the spec, the transcript, the proposals and the state, and the client resets to it, so the events before it were sent only to be dropped (up to 1000 on every reload). Anything published between the snapshot and the subscription is in the bus buffer and comes out of the replay; an op the snapshot already shows is re-applied by the client's reducer, as before. Test: `TestEventsStreamReplaysFromSnapshotSeq` (with and without a `Last-Event-ID`: the snapshot, then the next turn's `turn_started` at seq + 1).
- **Cancelled replies.** The partial reply of a cancelled turn is kept on screen ending in "…" (`ellipsize`), the entry carries `cancelled: true`, and `historyLocked` skips it as it skips a failed turn's apology. Test: `TestNewTurnCancelsRunningOne` (the scripted runtime now blocks after N events; the history is `user:one, user:two, agent:late`).
- **`finish_reason: length`.** The OpenAI-compatible runtime returns `runtime.ErrTruncated` with the cap in the message; the session then does what it does for the Anthropic runtime's `max_tokens` (Phase 14): the fragment with "…", the apology, the status card, the entry marked failed. A tool call cut with it never runs. Test: `TestFinishReasonLengthIsTruncation`.
- **Local demo.** The specific intents (table, chart, schedule, reminder, weather) come before the map, so "show me a table" is the table. `reminderWhen` reads "in 5 minutes", "in an hour", "in 2 hours", "in an hour and 15 minutes" (as `in_minutes`) and "at 9", "at 17:00", "at 9:30pm", "at 7 am" (as `at`); only a phrase with neither falls back to 17:00. `reminderText` keeps the subject after "to" and drops the time phrase ("call Ana" from "remind me to call Ana at 17:00"). Tests: the intent table and `TestReminderEmitsProposal` (six phrasings, label and args).
- **Repo and docs.** `packageManager: pnpm@12.16.1` in `package.json` (pnpm 12 switches to it by itself and records it as a `packageManagerDependencies` block at the top of `pnpm-lock.yaml`; corepack honours it). CI's three `pnpm/action-setup` steps read the version from the field; their `version: 12` input is gone, since the action refuses an input that differs from the field, and one source of truth is the point. The smoke test's overlap step runs at 3840×2160 too (eight smoke tests). Owner checklist A3 says that Opus 5.5 returns text written between tool calls as thinking blocks, which are not spoken, so a tool turn's first-speech number is not the one to compare with the 2 s criterion. `docs/stack.md` describes the SSE replay; `README.md` mentions the pin.

## Design decisions

- **Replay from the snapshot, not from the client's id.** The client's reducer already ignores every event at or below the snapshot's seq, so nothing before it can matter; keeping the `Last-Event-ID` parsing costs nothing and documents the protocol. The subscription moved after the snapshot because the bus buffer, not the subscription order, is what makes the window between them safe.
- **`cancelled` is its own flag.** Reusing `failed` would have made a user's interruption look like a defect in the transcript and in any future rendering of failed entries. Both mean the same to `historyLocked`.
- **Lead-in in the decider, not the scheduler.** The scheduler's item text is the reminder's own words (the card shows them under the title "Reminder"); the decider is where "what to say" is decided, and the transcript entry already joined title and text the same way.
- **A key cap or nothing.** A placeholder ("voice") on every lower card would be noise on a stack of proposals; the top card says Enter, the rest are reachable by "do it" or when they reach the top (Phase 13).
- **The demo parses, it does not understand.** Two regular expressions cover the phrasings the review tried and the ones the owner checklist uses; anything else still proposes 17:00 and says so. The real parsing is the model's (`set_reminder` takes `at` or `in_minutes`).

## Files changed

- Contract: `shared/schema/events.schema.json` (`TranscriptEntry.cancelled`), regenerated `backend/internal/contract/gen/events.go`, `backend/internal/contract/embed/events.schema.json`, `client/src/contract/gen/events.ts`, `client/src/contract/gen/validators.js`.
- Backend: `internal/decision/decision.go` (+ test), `internal/tools/builtin/builtin.go` (+ test), `internal/runtime/local/local.go` (+ test), `internal/httpsrv/events_handler.go` (+ `session_handler_test.go`), `internal/session/session.go` (+ `session_test.go`, `proactive_test.go`), `internal/runtime/openaicompat/openaicompat.go` (+ test).
- Client: `components/primitives.tsx`, `renderer/Renderer.test.tsx`, `e2e/smoke.spec.ts`.
- Repo and docs: `package.json`, `pnpm-lock.yaml` (the pnpm block), `.github/workflows/check.yml`, `README.md`, `docs/stack.md`, `docs/executing/owner-checklist.md`, `docs/executing/roadmap.md`, `docs/changelog.md`, `docs/completions/phase-14-round-3-review-fixes.md` (follow-ups line), this note.

## How to run

As before: `pnpm install`, `pnpm -C client build`, `cd backend && go run ./cmd/api`, open http://localhost:8080. On the local demo try "show me a table", "remind me in 5 minutes to stretch", "remind me at 9 to water the plants".

## How to test

`pnpm check` (type-check, lint, 161 vitest tests, `go vet`, all 22 Go packages, eight Playwright smoke tests in real Chromium) and `gofmt -l` on `backend/`. `pnpm contracts:generate` after the schema change leaves no further diff (the drift tests in both languages pass).

Verified here: `pnpm check` green; `gofmt -l` clean; the new 3840×2160 smoke step passes with the two earlier viewports.

## Known gaps

- The tile probe (Phase 14) still recognises only the block image OSM serves today; the lasting fix is a keyed tile provider.
- Held speech (Phase 14) is replayed in full on the first gesture, however old.
- The Hermes runtime has no stop reason on its wire, so a reply it cuts short is not classified.
- The local demo's reminder parsing covers the review's and the checklist's phrasings only; "tomorrow at 9" proposes 09:00 today or tomorrow by `ParseWhen`'s rule, not by the word.

## Follow-ups

- The owner's two runs (checklist A and B): the VISION 7 decision and spike report, and the Mac voice run. Anything they expose is the next phase's list.
- Carried over, unchanged: the directions origin is the Lisbon constant; no speech prefetch with server TTS; no `Risk: "high"` tool; a bound `Image.src` is covered by the CSP only; fit-ranking does not narrow the prompt; Ctrl+Space is not configurable.

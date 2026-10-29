# Phase 9: Memory, persistence and proactivity

**Date:** 2026-10-29. **Branch:** `feat/vision-implementation`. **Changelog:** 0.15.9. **Roadmap:** [`../executing/roadmap.md`](../executing/roadmap.md) Phase 9.

## Summary

State now survives restarts and the agent can put things on screen unprompted within the interruption policy. A file store under `CORELLIA_DATA_DIR` holds memory notes, reminders and the transcript; the memory tools write to it; every runtime prompt carries a memory summary; the transcript reloads on boot and only the current day replays to the client. A scheduler fires due reminders (glance card plus speech) and an ambient clock card on the hour when the screen is idle. Items that arrive during a turn or while the agent is speaking are held and delivered afterwards. Verified by tests and by a restart smoke against the binary.

## What was built

- `internal/store`: `Store` over a directory: `WriteJSON` (temp file + fsync + rename), `ReadJSON` (missing file is empty), `AppendJSONL`, `ReadJSONL` (malformed lines skipped).
- `internal/memory`: `Store` implementing `builtin.MemoryStore` (`Remember`, `Recall`, `Forget`), `builtin.ReminderStore` (`Add`) plus `Due`, `Pending`, `Remove`, `Notes`, `Summarise(limit)` ("- (date) text [tags]" lines) and the transcript log (`AppendTranscript`, `LoadTranscript(limit)`). Files: `memory.json`, `reminders.json`, `transcript.jsonl`.
- `internal/proactive`: `Item`, `Sink`, `Scheduler` (`Tick` fires due reminders once and removes them; the ambient clock fires at most once per hour, only when the sink is idle, no catch-up; `Run` loops until the context ends).
- `internal/session`: `Proactive(item)` and `Idle()` implement `proactive.Sink`. The decider is consulted with `Proactive`, `TurnActive` and `Speaking` (estimated from the last speech event's length at 60 ms per character); `hold` queues the item, released on `turn_done` or by a timer when speech should be over. Delivery publishes a `proactive` event, the item's ops or a default amber `Card` overlay (top-left, TTL), speech for reminders, and a transcript entry with source `proactive`. Options `Memory` (summary into `runtime.Context.MemorySummary`, 30 notes by default) and `Transcript` (append on every entry, load the tail on boot). The snapshot replays only today's entries (max 50).
- `internal/httpsrv`: `GET /api/memory` (notes and pending reminders). `cmd/api` opens the store and memory, wires the memory tools and the session to it, and runs the scheduler every second.
- Tests: store (atomic write, JSONL with a corrupt line), memory (reopen, summary, due/pending/remove, transcript tail, forget), proactive (fires once, ambient on the hour when idle, no catch-up, stops with context), session (reminder delivered when idle with card + speech + transcript; held during a turn and released after; held while speaking and released by the timer; memory summary reaches the runtime; transcript survives a restart and yesterday's entries are not replayed), memory endpoint.

## Design decisions

- **Files, not a database.** One user, one process: JSON documents with atomic replacement and an append-only transcript are enough and are trivially inspectable and reprovisionable (the box holds nothing; `CORELLIA_DATA_DIR` can live anywhere).
- **Memory reaches the model as a summary, not as retrieval.** The last 30 notes go into every prompt; `recall` exists for older or larger memories. Good enough for a single user and keeps prompts predictable.
- **The decider owns interruption.** The scheduler only knows "due" and "idle"; whether to show or speak, and whether to wait, is a decision-layer rule, which keeps the proactivity policy in the one tested place (VISION 6 contract item d).
- **Speaking is estimated, not reported.** The client plays audio; the server does not know when it ends. A length-based estimate with a release timer avoids a new client-to-server channel and errs on the side of a short delay.
- **Ambient does not catch up.** Missing the top of the hour while busy skips that hour; an old clock card would be noise.
- **Reminders fire once.** A fired reminder is removed from the store before the next tick so a crash between fire and remove can at worst repeat it once after a restart.

## Files changed

Added: `backend/internal/store/store.go` (+test), `backend/internal/memory/memory.go` (+test), `backend/internal/proactive/proactive.go` (+test), `backend/internal/session/proactive.go` (+test), `backend/internal/httpsrv/memory_handler.go`. Edited: `backend/internal/session/{session,proposals}.go`, `backend/internal/httpsrv/server.go` (+test), `backend/cmd/api/main.go`, docs.

## How to run

```bash
cd backend && CORELLIA_DATA_DIR=./data go run ./cmd/api
```

"remind me to stretch at 23:59" → `Enter`; `curl localhost:8080/api/memory` lists it; restart the backend: the transcript is back on screen and the reminder still pending. When it is due, a card appears top-left and the reminder is spoken, unless a turn is running, in which case it follows the reply. On the hour with an empty screen a small clock card appears for two minutes.

## How to test

`go test ./...` (new: store 2, memory 1, proactive 3, session 4, httpsrv 1). Verified here: all green; binary smoke: reminder set and confirmed → `reminders.json` and `transcript.jsonl` written → restart → `/api/session` replays four transcript entries and `/api/memory` still lists the reminder; no errors logged.

## Known gaps

- The local runtime never calls `remember`; memory notes come from cloud runtimes (or `recall`/`remember` via a tool action). Nothing in the UI shows memory except `/api/memory`.
- The speaking estimate is a heuristic; a client-reported "playback finished" signal would be exact.
- No daily brief; the ambient hook is the clock card only.
- Reminders are local-time `HH:MM` or RFC3339; no recurrence.

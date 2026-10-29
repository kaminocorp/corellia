# Phase 3: Session, event stream and the local runtime

**Date:** 2026-10-29. **Branch:** `feat/vision-implementation`. **Changelog:** 0.15.3. **Roadmap:** [`../executing/roadmap.md`](../executing/roadmap.md) Phase 3.

## Summary

The conversational core works end to end without credentials: a typed turn goes to the backend, the `AgentRuntime` seam runs the keyless local runtime, its text and spec ops are validated against the catalog and streamed to the browser over SSE, and the client keeps session state (transcript, spec, agent state, proposals) through the shared reducer. Reconnects replay from the last event id. Verified by Go and client tests and by an HTTP + SSE round trip against the built binary.

## What was built

### Backend

- `internal/runtime`: `AgentRuntime` interface (`Name`, `Capabilities`, `Start(ctx, Turn) <-chan Event`), `Turn`/`Context`/`Message`, `Event` kinds (`text_delta`, `spec_op`, `tool_call`, `tool_result`, `proposal`, `done`, `error`), `ToolCaller`/`ToolDefinition`/`ToolResult`/`Proposal` (consumed by the Phase 6 registry), `ErrNotImplemented`. Cancellation is the context.
- `internal/runtime/local`: deterministic scripted runtime. Intents: greeting, time (emits a `tool_call`/`tool_result` for `get_time` and a glance `Stat` overlay with a 30 s decay), map of a city (gazetteer of 12 cities; `Split` + `Map` + `Card` + `Markdown` with a bound centre and a `propose` action), stock table (bound rows set after the node), temperature chart, schedule timeline, weather stat, reminder (emits a proposal), clear, fallback echo. Text streams word by word with a configurable delay (0 in tests). Every scenario's ops pass `CheckOp`, `Apply` and `CheckSpec` in tests; cancel closes the stream.
- `internal/session`: `Bus` (sequence-numbered ring buffer, replay from `lastSeq`, live fan-out, slow subscribers dropped, every event validated against `events.schema.json` in wire form before publishing) and `Session` (transcript, spec, agent state, pending proposals with TTL, one active turn, cancel on new input, `Snapshot`, `Capabilities`, `WaitTurn`). Runtime events become stream events: deltas, validated ops (invalid ones become non-fatal `error` events and are dropped; `done` triggers whole-spec checks), tool events, proposals, a final `speech` event with the full text, `turn_done` with status and modality, `state` transitions idle → thinking → speaking → idle.
- `internal/httpsrv`: `SessionHandler` (`GET /api/session`, `POST /api/turn` validated against `TurnRequest` with a 64 KiB body cap, `POST /api/turn/cancel`, `GET /api/catalog`) behind a `sessionAPI` interface; `EventsHandler` (SSE: `retry`, `session` snapshot first, replay after `Last-Event-ID` header or `last_event_id` query, live events, heartbeats, ends the response when the bus drops the subscriber so the client reconnects).
- `internal/config`: `CORELLIA_RUNTIME` (`auto|local|anthropic|openai|hermes`, validated). `cmd/api` loads the contract, selects the runtime (only `local` exists until Phase 7; other names log and fall back), builds the session, mounts the handlers.

### Client

- `session/auth.ts`: device token from `?token=` persisted to localStorage, bearer header for fetch, `?token=` for EventSource.
- `session/api.ts`: `sendTurn`, `cancelTurn` with typed bodies and `ApiError`.
- `session/store.ts`: `SessionState`, pure `reduce(state, event)` (snapshot adoption, duplicate-seq suppression, transcript, streaming text, spec via `applyOp` with reducer failures recorded as errors, proposals by status, recent events for debugging), `SessionStore` + `useSessionState` hook.
- `session/stream.ts`: `SessionStream` over the browser `EventSource` (native reconnect + Last-Event-ID), per-type listeners, every payload validated with `isSessionEvent` before dispatch, connection status.
- `app/`: `App` (stream lifecycle, header with name / connection / agent state, focal placeholder coloured by state, transcript, input; `Esc` on an empty input cancels the running turn; `?debug=1` mounts `DebugPane` with spec JSON, errors and recent events), `Transcript`, `DebugPane`, `ConnectionIndicator` (driven by stream status).

## Design decisions

- **Runtimes emit, the session decides.** Runtimes never see presentation; the session validates, applies and publishes. The decision layer (Phase 6) slots in between apply and publish.
- **Invalid ops are dropped, not fatal.** A bad op from a model should not kill the turn; it becomes an `error` event visible in debug mode and a spike metric later.
- **Bus validates the wire form.** Events are marshalled first and the JSON is validated, so typed Go values in the map cannot slip past the schema. An off-contract event is logged and dropped rather than sent.
- **Native EventSource.** It reconnects and resends `Last-Event-ID` by itself; the server's `retry: 2000` sets the cadence. The snapshot carries the current seq so the reducer ignores replayed duplicates.
- **`speech` is emitted once at turn end** for now; Phase 6/8 move it to sentence-level, decider-chosen text.
- **Proposals are stored but not yet confirmable**; the Phase 6 gate adds confirm/reject and execution.
- **Handlers fake the session through a 5-method interface** so handler tests run without a runtime goroutine where not needed.

## Files changed

Added: `backend/internal/runtime/runtime.go`, `backend/internal/runtime/local/{local.go,local_test.go}`, `backend/internal/session/{bus.go,session.go,bus_test.go,session_test.go}`, `backend/internal/httpsrv/{session_handler.go,events_handler.go,session_handler_test.go}`, `client/src/session/{auth,api,store,stream}.ts` + tests, `client/src/app/{Transcript,DebugPane}.tsx`. Edited: `backend/cmd/api/main.go`, `backend/internal/config/config.go` (+test), `backend/internal/httpsrv/server.go`, `client/src/app/{App,CommandInput,ConnectionIndicator}.tsx`, docs.

## How to run

```bash
pnpm -C client build && cd backend && go run ./cmd/api        # http://localhost:8080
# or: overmind start   (client :5173 with proxy, backend :8080 via air)
```

Type "show me a map of Lisbon" and press Enter: the transcript streams the reply; with `?debug=1` the spec tree arrives op by op. Kill and restart the backend: the header shows "reconnecting" then "online" and the snapshot restores state without a reload. `Esc` on an empty input cancels a running turn.

```bash
curl -s -X POST localhost:8080/api/turn -H 'Content-Type: application/json' -d '{"text":"what time is it"}'
curl -N localhost:8080/api/events
```

## How to test

Go: `go test ./...` (new: local runtime 3 tests, session 11 tests, httpsrv 4 session/SSE tests). Client: 75 tests (new: store 6, stream 2, auth 2). Verified here: all green; type-check, lint, build green; binary round trip (`POST /api/turn` → 202, SSE shows `session`, `turn_started`, `state`×3, `spec_op`×9, `text_delta`×5, `speech`, `turn_done`; `/api/session` shows root `split`, four nodes and a two-entry transcript).

## Known gaps

- Spec ops are applied on the client but not rendered (Phase 4); the debug pane is the only view of them.
- No decision layer: every reply is spoken and shown as the runtime emitted it.
- Proposals cannot be confirmed yet.
- The bundle includes Ajv (~120 kB gzipped total); acceptable for a kiosk, revisit if it matters.
- Browser behaviour (EventSource reconnect, focus handling) is verified in jsdom and by reasoning, not in a real macOS browser from this environment.

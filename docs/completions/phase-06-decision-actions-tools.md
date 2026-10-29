# Phase 6: Decision layer, actions and tools

**Date:** 2026-10-29. **Branch:** `feat/vision-implementation`. **Changelog:** 0.15.6. **Roadmap:** [`../executing/roadmap.md`](../executing/roadmap.md) Phase 6.

## Summary

Side effects now go through propose → confirm (VISION 5.6), the decision layer exists as a tested seam with a rules default (VISION 6), and the agent has a built-in tool set: time, geocoding and weather (Open-Meteo, keyless), memory, reminders, directions (OSRM public router with a straight-line fallback) and `show_ui`. A proposal renders as a floating `Confirm` card; `Enter`/`Esc`, the numbered actions, or saying "yes" / "no" (keyboard or voice) confirm or reject it. Confirmed tools execute and present their result as spec ops and speech. The local runtime now calls the registry, so "what time is it" and "remind me to call Ana at 16:30" exercise real tools.

## What was built

### Backend

- `internal/tools`: `Tool` (name, description, JSON Schema for arguments, `RequiresConfirm`, risk, `Label`, `Run`) and `Registry` (schema-validated `Call` that returns `ErrRequiresConfirm` + a `Proposal` for gated tools, `Execute` for the gate, `Definitions` for runtimes, `Proposal` builder). `runtime.ToolResult` gained `Ops`: a tool can present itself.
- `internal/tools/builtin`: `get_time` (optional timezone), `geocode`, `get_weather` (current + 3-day, WMO codes described), `remember` / `recall` / `forget` (gated) over a `MemoryStore`, `set_reminder` (gated; `at` as HH:MM today-or-tomorrow or RFC3339, or `in_minutes`; presents a glance `Status`) over a `ReminderStore`, `open_directions` (gated; place names or coordinates, OSRM route, presents a `Map` with markers and a bound route), `show_ui` (ops in, ops out). `InMemory` implements both stores until Phase 9. `Options` injects HTTP client, API URLs, clock and location; tests run against `httptest` fakes and assert the presented ops validate.
- `internal/actions`: `Gate` (propose, pending newest-first, confirm executes once, reject, TTL expiry with a sweep).
- `internal/decision`: `Decider` interface, `Input` / `Decision` (respond, modality, speech pieces, timing, auto text card, reason), `Rules` (empty → none; visual only; visual + speech; short text → voice only; long text → voice + auto card; proactive reminders → both, other proactive → glance; hold while a turn runs or the agent speaks), `Sentences` (Markdown stripped, punctuation kept, fragments merged).
- `internal/session`: `Handle(text, source)` (confirm/reject phrases applied to the latest pending proposal, else a turn), `propose` (gate + `proposal` event + floating confirm card with `Enter`/`Esc` actions), `Confirm` / `Reject` / `ExpireProposals` (status events pending → confirmed → executed | failed | rejected | expired; card removed; result ops applied and content spoken and transcribed), `FireAction` for `tool` (runs or proposes; `confirm_proposal` / `reject_proposal` built-ins) and `propose` kinds with `{bind}` args resolved against spec data, the decider at turn end (speech events per sentence, modality, auto reply card `reply_card` with TTL), tool results' ops applied during a turn. Phrase classifier `IsConfirmPhrase` / `IsRejectPhrase` (word sets, ≤ 6 words).
- `internal/httpsrv`: `POST /api/turn` now returns `handled` (`turn` | `confirmed` | `rejected`) and `proposal_id`; `POST /api/action/confirm`, `POST /api/action/reject`.
- `cmd/api`: registers built-ins, the gate (2 min TTL) and the rules decider. `runtime/local`: time via the registry, reminder via `set_reminder` (parses `HH:MM`), weather via `get_weather` with the scripted fallback when the tool fails.
- Schema: `TurnResponse.handled` and `proposal_id`; `REDUCER.md` documents floating overlays.

### Client

- Renderer renders floating overlays (unreferenced `Overlay` nodes) beside the root tree; hotkeys cover their actions, so a confirm card's `Enter` / `Esc` work anywhere. `Stage` keeps the UI zone active when there is no root so floating cards still show. `confirmProposal` / `rejectProposal` API calls (for the Phase 8 voice path).

## Design decisions

- **Tools present themselves.** A tool result may carry spec ops; the session validates and applies them like runtime ops. The decider still decides speech and modality. This keeps "data → default view" next to the data's producer without letting tools bypass validation.
- **Floating overlays, not a wrapper root.** Confirmation and reply cards must not disturb a map that is on screen. An `Overlay` nobody references floats; `clear` removes it; the placement logic stays root-based.
- **Confirmation is a phrase or a key, never a click.** `Handle` intercepts short confirm/reject phrases only while a proposal is pending, so "ok" with nothing pending is an ordinary turn. The confirm card's actions are plain `tool` actions on the built-in `confirm_proposal` / `reject_proposal`, so voice, keyboard and (later) a runtime all go through one path.
- **Gated tools never run on `Call`.** `Registry.Call` returns the proposal; only `Gate.Confirm` → `Registry.Execute` runs them, and a proposal executes once. Tested.
- **Decider at turn end, not per op.** Ops stream to the client as they arrive for fast first paint; the decider shapes what is said and whether a text card is added. Proactive timing (`hold`) lands in Phase 9.
- **Open-Meteo and OSRM, keyless.** Both are public and need no credentials; failures degrade (weather → sample, directions → straight line) rather than fail the turn.

## Files changed

Added: `backend/internal/tools/{registry,ids}.go` (+test), `backend/internal/tools/builtin/{builtin,inmemory}.go` (+test), `backend/internal/actions/gate.go` (+test), `backend/internal/decision/decision.go` (+test), `backend/internal/session/proposals.go` (+test). Edited: `backend/internal/runtime/runtime.go`, `backend/internal/session/session.go` (+tests), `backend/internal/httpsrv/{session_handler,server}.go` (+test), `backend/internal/runtime/local/local.go`, `backend/cmd/api/main.go`, `shared/schema/{api.schema.json,REDUCER.md}`, generated contract files, `client/src/renderer/{resolve,Renderer,Stage}.ts(x)` (+tests), `client/src/session/api.ts`, docs.

## How to run

```bash
pnpm -C client build && cd backend && go run ./cmd/api
```

Say "remind me to call Ana at 16:30": a Confirm card floats bottom-right; press `Enter` (or type "yes") and a "Reminder set for 16:30" status appears and is spoken; `Esc` or "no" rejects. "show me a map of Berlin" then `1` proposes directions; `Enter` draws the route (needs network for OSRM, otherwise a straight line). "what time is it" and "weather" call real tools.

## How to test

Go: `go test ./...` (new: tools 3, builtin 6, actions 2, decision 2, session 5 + phrases, httpsrv 1). Client: 103 tests. Verified here: all green; binary round trip: reminder turn → pending proposal and confirm card → "yes" returns `handled: confirmed` → proposal cleared, status card and reply card on screen, transcript shows the result; "what time is it" answers through the registry.

## Known gaps

- Reminders are stored but nothing fires them yet (Phase 9 scheduler); memory is in-process until Phase 9.
- Weather and directions need network; the local runtime falls back to sample data when offline.
- The decider is rules only; no model-backed implementation and no David read-through (unreachable from here).
- Risk levels are recorded but do not change behaviour (for example a second confirmation for `high`).
- `navigate` actions remain unsupported.

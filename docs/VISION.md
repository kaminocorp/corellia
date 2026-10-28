# Corellia: Vision

**Status:** current direction, set 2026-10-28. Supersedes the control-plane vision in [`archive/vision.md`](archive/vision.md).
**Owner:** Phil. **Maturity:** direction and constraints are set; most design below is a proposal, and open items are marked as such.

## 1. What Corellia is now

Corellia is a personal agent workspace: an always-on screen in the Fabrica 84 office that shows a 3D visualisation of one agent and lets Phil talk to it. Input is keyboard (chat) and microphone (voice). Output is the screen and speakers. No mouse. The agent answers with voice and with UI it assembles on the fly from a library of pre-built components (maps, tables, cards, charts), so a reply can be a visual, not just text. The name stays because it fits a personal agent application; the fleet-management product that carried the name is archived.

## 2. Principles

1. **Ambient first.** The screen is on 24/7 and useful at a glance. It must look right idle, listening, thinking and speaking, and it must never need a pointer.
2. **The model composes, the client renders.** The agent never emits arbitrary markup or code. It emits a typed description built from a closed catalog of components. The client renders only what validates. This keeps output safe, testable and on-brand.
3. **One schema, two languages.** The UI spec contract is defined once and generated into Go and TypeScript. No hand-mirrored types.
4. **Decide what to show, not just what to say.** A separate decision layer chooses whether, when and how to surface something (voice only, glance card, full visual, nothing). Speech and visuals are co-equal outputs.
5. **Thin client, cloud inference.** The display box does rendering, audio capture and playback. Models, STT and TTS run in the cloud.
6. **Reversible runtime choice.** The agent runtime sits behind a narrow interface so Hermes vs the DeepSeek harness (section 7) can be swapped or run side by side.
7. **Single user, single room first.** Multi-user, multi-tenant and fleet concerns are out of scope until the single-screen experience works.

## 3. Experience

- **Always-on screen.** A dedicated display in Phil's office, running full-screen with no chrome. Idle state is an ambient scene, not a blank screen.
- **3D agent.** A 3D visualisation of the agent is the persistent focal element. It reflects state (idle, listening, thinking, speaking, error) and gives presence to the voice. Style is undecided (see open questions). The repo already has WebGL particle work (login swarm, spawn nebula; see [`blueprints/login-swarm-animation.md`](blueprints/login-swarm-animation.md) and [`refs/elephantasm-animation.md`](refs/elephantasm-animation.md)) that may be reusable as a starting point.
- **Input.** Keyboard chat (always focused, no click needed) and microphone voice. Both feed the same conversation. Typed and spoken turns are equivalent.
- **Output.** Speech through speakers, plus generated UI on screen. Generated UI appears around or beside the 3D agent and clears or decays when no longer relevant.
- **No mouse.** Every interaction has a keyboard or voice path. Confirmations ("do it", "cancel") are voice or key, never click targets.

## 4. Architecture sketch

```
 Display box (Debian, kiosk)                 Corellia backend (Go, default)            Cloud
 +-------------------------------+           +-------------------------------+
 | Browser kiosk (TS frontend)   |  events   | Session + event stream (SSE/  |   LLM inference
 |  - 3D agent scene             | <-------- |   Connect stream)             | <-----> (via agent runtime)
 |  - UI renderer (catalog)      |           | Decision layer ("Jev")        |
 |  - keyboard capture           |  turns    | Catalog + spec validation     |   STT / TTS
 |  - mic capture / speaker out  | --------> | Action propose/confirm        | <-----> (voice pipeline)
 +-------------------------------+           | Agent runtime interface       |
                                             +---------------+---------------+
                                                             |
                                                  Agent runtime (open decision):
                                                  Hermes  OR  DeepSeek harness
```

Components:

- **Display box client.** TypeScript app in a kiosk browser. Renders the 3D agent, the component tree, handles keyboard and audio I/O. Holds no secrets beyond a device credential.
- **Backend.** Owns the session, the catalog, spec validation, the decision layer and the action gate. Default: reuse the Go backend and Connect-go contract. See section 9 for what is reused and what is likely dropped.
- **Agent runtime.** Runs the agent loop (model calls, tools, memory). Behind a narrow `AgentRuntime` interface: send a user turn, receive a stream of typed events (text delta, tool call, tool result, UI spec ops, done, error). Hermes or the DeepSeek harness plugs in here.
- **Voice pipeline.** Carried over from OpenWorld. Capture, voice activity detection, STT, TTS, barge-in. Details of the OpenWorld implementation are **not yet reviewed for this doc** (see unknowns).
- **Component library + shared schema.** Section 5.
- **Decision layer ("Jev logic").** Section 6.

## 5. Dynamic UI

The agent assembles pre-built blocks, Lego style, instead of generating UI code. Planned approach, in order of importance:

### 5.1 Component catalog

A registry of components, each with: a name, a typed props schema, the slots it exposes (for children), the data bindings it accepts, the actions it can fire, a short description for the model, and a size/fit hint (glance vs full-screen). Examples: `Map`, `Table`, `Card`, `Stat`, `Timeline`, `Chart`, `List`, `Markdown`, `Image`, plus layout components (`Stack`, `Grid`, `Split`, `Overlay`). The catalog is data (one file, versioned) and is the single source for: model-facing tool/prompt description, server validation, and client component registry.

### 5.2 Layout format: typed component tree with slots

A UI spec is a JSON tree of nodes. Sketch (illustrative, not final):

```json
{
  "spec_version": 1,
  "root": "n1",
  "nodes": {
    "n1": { "type": "Split", "props": {"ratio": 0.6},
            "slots": {"left": ["n2"], "right": ["n3"]} },
    "n2": { "type": "Map", "props": {"center": {"bind": "$.place.coords"}, "zoom": 12} },
    "n3": { "type": "Card", "props": {"title": "Next meeting"},
            "slots": {"body": ["n4"]},
            "actions": {"primary": {"id": "a1", "label": "Navigate"}} },
    "n4": { "type": "Markdown", "props": {"text": {"bind": "$.meeting.summary"}} }
  },
  "data": { "place": {"coords": [1.28, 103.85]}, "meeting": {"summary": "..."} },
  "actions": { "a1": { "kind": "propose", "tool": "open_directions", "args": {"to": {"bind": "$.place.coords"}} } }
}
```

Choices behind the sketch:

- **Flat node map with ids, children referenced by slot.** Easier to patch and stream than a deeply nested tree, and stable ids let later patches target a node.
- **Slots over arbitrary children.** A component declares named slots and what node types each accepts. Composition is then validated, not hoped for.
- **Bindings.** A prop can be a literal or `{bind: path}` into a `data` object. This separates layout from data, lets tool results flow in without the model re-typing them, and lets data update without re-sending the tree.
- **Actions.** Components fire named actions. An action is a typed record (tool call, navigate, dismiss, send-message). Generic, not per-component code.

### 5.3 Shared schema between Go and TypeScript

The spec, catalog entries and event types are defined once and generated into both languages. Options (open, not decided):

- **JSON Schema as source of truth**, generating Go structs and TS types plus runtime validators (zod or similar). Good fit for recursive trees and per-component props.
- **Protobuf (the existing buf + Connect-go pipeline).** Already in the repo and gives streaming RPC for free, but open-ended per-component props and recursive specs fit awkwardly (`oneof` per component, or `google.protobuf.Struct` which loses typing).

Default if no one objects: JSON Schema for the spec and catalog, Connect or SSE as transport. This is a default, not a decision.

### 5.4 Incremental spec streaming

The spec should render progressively while the model is still generating, so the first useful node appears fast. Proposal: stream a sequence of typed ops (`add_node`, `set_props`, `set_slot`, `set_data`, `remove_node`, `done`) rather than one blob. The client applies ops to a local tree through a reducer and renders what is already valid. The server validates each op against the catalog before forwarding and drops or repairs invalid ones. Streaming plus stable node ids also enables updating a visual in place on a follow-up turn.

### 5.5 Validation and fit-ranking

Server-side, before anything reaches the client: component exists, props match schema, slot contents are allowed, bindings resolve, spec fits the screen budget. A fit-ranking step (which components suit this content and this display) narrows what the model is offered per turn, which keeps prompts small and output on-catalog.

### 5.6 Actions: propose, confirm

Anything with side effects goes through propose then confirm. The agent proposes an action, the screen shows it, Phil confirms by voice or key, then the backend executes. Read-only rendering needs no confirm. This is also the mouse-free way to make the screen safe to leave on 24/7.

### 5.7 External reference pointers (do not import)

Woz studied the OpenWorld approach read-only. These are pointers for design comparison only. **No Mission code or client data is, or should be, copied into this repo.**

- Role-typed view catalog (`apps/api/catalog/views.toml` in `missiongroupsystems/openworld`).
- Server-side fit-ranking and validation.
- Typed SSE Figure contract.
- Propose/confirm actions.

Gaps relative to what Corellia needs: no composition (views are chosen, not assembled), no shared schema between server and client, no generic action or binding system, no incremental spec streaming. Section 5.2 to 5.4 exist to close those gaps.

## 6. Decision layer ("David's Jev logic", generalised)

The meeting-notes context has logic, built by David, that decides what to show, when to show it and how to respond. Corellia lifts that out of meeting notes into a generic assistant capability.

Intended contract: given the conversation, available data and current screen state, decide (a) whether to respond at all, (b) modality (voice only, glance card, full visual, both), (c) which catalog components and how much detail, (d) timing (now, after the current utterance ends, or hold), (e) when to clear or replace what is on screen.

**What we do not know:** how the existing Jev logic is implemented (rules, prompts, a model call, or a mix), what inputs it relies on, and how much of it is entangled with meeting-specific data. This needs a read-through with David before design. Until then the layer is a defined seam in the backend with a trivial default (always respond with voice and a text card).

## 7. Agent runtime: OPEN DECISION

Two candidates. **No choice is made here.** The point of this section is to make the choice cheap to take later and cheap to reverse.

| Dimension | Hermes (Nous Research Hermes Agent) | DeepSeek harness (from OpenWorld) |
|---|---|---|
| What it is | Open-source Python agent. Used in this repo via `adapters/hermes/`, which imports upstream `AIAgent` in-process behind a small FastAPI sidecar. | **Unknown to this doc.** Not yet reviewed. Name suggests a harness built around DeepSeek models. |
| Integration known to work here | Yes, for non-streaming chat: `POST /chat {session_id, message} -> {content}` with per-session agent cache. Digest-pinned upstream image. | Unknown. |
| Streaming (text, tool events) | Not exposed through our sidecar today (the sidecar notes streaming as future work). Whether upstream offers a usable streaming hook is **unverified**. | Unknown. |
| Emitting structured UI specs | Unverified. Likely via a custom tool whose arguments are the spec ops; reliability untested. | Unknown. |
| Voice coupling | None today. Voice would be built around it. | Unknown. Possibly already integrated with the OpenWorld voice flow, which would reduce work if so. Unverified. |
| Model flexibility | Provider and model are configurable through our adapter's env mapping. Breadth of supported providers at the current upstream version is unverified. | Unknown. May be tied to DeepSeek models. |
| Tooling, plugins, governance hooks | Has toolsets and a plugin hook surface; we built `corellia_guard` on it (see [`archive/refs/governable-agent-surfaces.md`](archive/refs/governable-agent-surfaces.md)). Useful for propose/confirm gating. | Unknown. |
| Memory / persistence | Our sidecar keeps a per-session in-memory agent cache; upstream memory depth and fit for an always-on agent are unverified. | Unknown. |
| Language / runtime | Python. Adds a second language next to Go and TS, plus a process boundary. | Unknown. |
| Maintenance and drift risk | Upstream moves; we pinned a digest and kept a tool-name audit to detect drift. Ongoing cost. | Unknown. Internal to Mission, so ownership and change control differ. |
| Code and licence boundary | Open source, already in our repo. | **Needs a decision on how it may be used.** Mission code and client data must not be copied into this Kamino repo. Viable only if consumable as an external service or dependency with explicit permission. |
| Operational shape | Ran as a container; for the display use case could run on a cloud host or the backend VM. | Unknown. |

**Decision criteria** (suggested, ordered): (1) time to first visible and audible response with streaming, (2) reliability of emitting valid UI spec ops via tool calls, (3) interruption support (barge-in, cancel mid-turn), (4) 24/7 stability and idle cost, (5) fit with the voice pipeline, (6) licence and code-boundary clearance, (7) maintenance burden.

**What to evaluate** (a short spike per candidate, same script for both, without building product features first):

1. Run a scripted set of about 10 turns covering plain Q&A, a tool call, a "show me a map of X" request and a multi-step request.
2. Measure time to first token, time to first valid spec op, and total turn time.
3. Check the share of turns where the produced spec validates on the first try.
4. Test cancel and barge-in mid-turn.
5. Soak for 24 hours with sparse traffic: memory growth, restarts, reconnect behaviour.
6. Record what had to be written around each runtime (streaming shim, voice glue, process management).

**Keeping it reversible:** define `AgentRuntime` as the only seam. Both candidates implement it. Nothing outside it imports runtime-specific types. Running both side by side behind a flag is acceptable for the spike.

## 8. Display box

- **Hardware.** A lightweight Linux machine, Debian: either a VM or a small physical computer. Inference is cloud-based, so there is no local GPU need for models. Which of VM or small machine is not decided.
- **Display.** A browser in kiosk mode, full-screen, auto-started on boot with auto-login, screen blanking and power saving disabled, a watchdog restarting the browser on crash. Typical stack (a proposal, unverified here): a minimal Wayland or X session plus Chromium in kiosk mode, started by systemd.
- **3D rendering.** WebGL needs graphics acceleration. A VM without GPU passthrough falls back to software rendering, which constrains the 3D agent's complexity. Treat "can this box hold 30 fps for the agent scene" as an early test, not an assumption.
- **Audio.** Microphone and speakers on the same box in the same room, so acoustic echo is real. Needs echo cancellation (the browser provides some) and a visible mic-state indicator, ideally a hardware mute.
- **Input.** Keyboard only. The keyboard must always focus the chat input without a click.
- **Network.** Outbound only to the backend and cloud APIs. Auth is a device credential, not an interactive login.
- **Ops.** The box is disposable: reprovisionable from a script, no state that matters locally.

## 9. Existing code and defaults

This repo is a working v1 of the old control plane. Defaults below are suggestions to avoid a rewrite; none is a decision.

| Existing | Default for the new direction |
|---|---|
| Go backend, Chi, Connect-go, `go.work` monorepo | Keep as the default backend and contract layer. |
| Next.js 15 + React 19 + TypeScript frontend | Keep as the default for the kiosk client. A kiosk may not need Next.js specifically; open. |
| Protobuf contract, buf codegen | Keep for ordinary RPC. Schema format for the UI spec is open (5.3). |
| WebGL particle components (login swarm, spawn nebula) | Candidate starting point for the 3D agent. |
| Supabase auth, Postgres, orgs/users | Likely unnecessary for one user and one screen. Candidate to drop or defer. |
| Fleet, spawn, deploy (Fly), tools governance | Legacy. Not used by the new direction. |
| `adapters/hermes/` image and sidecar | Reusable only if Hermes is chosen. |

No code has been changed or removed. The docs cleanup only moved and edited documents.

## 10. Non-goals and later

- **Spawning additional agents.** Later, unless trivial once the single agent works.
- **Fleet governance, IAM-style permissions, skills registry, multi-tenant admin.** The old pillars. Out of scope. If a second agent arrives, revisit.
- **Mouse, touch, or pointer UI.**
- **Local inference.**
- **Multi-room or multi-display.**

## 11. Open questions

1. Hermes or the DeepSeek harness (section 7), and under what code-boundary terms the latter could be used.
2. How does the Jev logic actually work, and which parts are generic? (Needs David.)
3. What exactly in the OpenWorld voice pipeline carries over (STT/TTS vendors, VAD, barge-in), and under what terms?
4. Shared schema format and transport: JSON Schema vs protobuf; SSE vs Connect streaming (5.3, 5.4).
5. Where the decision layer lives: backend (default) or inside the agent runtime.
6. Activation: always-listening with wake word, push-to-talk key, or VAD-gated. Privacy tradeoff for an always-on mic.
7. 3D agent style and rendering budget on the chosen display box; whether the existing particle work is the right base.
8. VM vs small physical computer for the display box.
9. Auth and persistence for a single-user device: keep Supabase and Postgres, or reduce to a device token and local state.
10. Proactivity: can the agent put things on screen unprompted (calendar, alerts), and what is the interruption policy?
11. Memory: what the agent remembers across days, and where that state lives.

## 12. Relationship to the old direction

The previous direction was a vendor-agnostic control plane for AI agents (spawn, equip, deploy and govern fleets; skills registry, permissions, observability). It shipped a working v1 (spawn wizard, fleet view, Hermes adapter, Fly deploy, tools governance) and saw no adoption. Its docs are preserved, unchanged, in [`archive/`](archive/README.md), with an old-to-new path map. The code for it is still in the tree and is not yet removed. History of that work is in [`changelog.md`](changelog.md).

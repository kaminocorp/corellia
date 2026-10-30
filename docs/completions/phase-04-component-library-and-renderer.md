# Phase 4: Component library and renderer

**Date:** 2026-10-29. **Branch:** `feat/vision-implementation`. **Changelog:** 0.15.4. **Roadmap:** [`../executing/roadmap.md`](../executing/roadmap.md) Phase 4.

## Summary

The client now renders the catalog. Every one of the 15 components has an implementation, the renderer resolves bindings and applies catalog defaults, validates each node before it reaches the DOM, mounts slots, assigns keyboard hotkeys to actions, decays nodes with a `ttl_ms`, and places the tree around the agent by the root's fit (glance overlay, side panel, full visual). The backend gained a `catalog` package (model-facing description, fit-ranking, display classification) and endpoints for firing actions, clearing the screen and reporting decay so the server spec stays authoritative. A `?gallery=1` route shows every component from its catalog example.

## What was built

### Backend

- `internal/catalog`: `Describe(reg, names)` (deterministic prompt text: description, props with type/enum/required/bindable, slots with accepts and max, actions, fit, example), `Rank(reg, Hints{Tags, PreferredFit})` (tag overlap ×3, fit match ×2, layout components always score; stable alphabetical ties), `Classify(w, h)` display profile (small/1080p/1440p/4k). Tests cover coverage, determinism, ranking and classification.
- `internal/session`: `FireAction(actionID, nodeID)` (`dismiss` removes the target, `send_message` starts an `action`-sourced turn, `tool`/`propose` return `ErrActionUnsupported` until Phase 6), `ClearScreen()`, `RemoveNode(id)` (decay reports), all through a validated `publishLocalOp` that publishes a `spec_op` without a turn id.
- `internal/httpsrv`: `POST /api/action` (404 unknown, 501 unsupported), `POST /api/screen/clear`, `POST /api/screen/remove`.

### Client

- `components/`: `layout.tsx` (Stack, Grid, Split, Overlay), `content.tsx` (Card, Markdown, Stat, List, Table, Timeline, Image, Status, Confirm), `Chart.tsx` (inline SVG bar/line/area with nice ticks, multi-series, legend), `Map.tsx` (MapLibre GL over OpenStreetMap raster tiles, desaturated and darkened to fit the display, markers and route layer, non-interactive, dynamic import so the ~1 MB chunk loads only when a map is on screen, static coordinate card on any failure), `markdown.ts` (safe subset parser to an AST: headings, lists, paragraphs, bold, italic, code; no HTML, links or images), `chart-geometry.ts` (pure scales and paths), `primitives.tsx` (`Panel`, `Label`, `ActionBar` with `<kbd>` affordances), `styles.ts`, `registry.ts`, `types.ts`.
- `renderer/`: `resolve.ts` (`resolveNode` → ready | pending | invalid, `withDefaults` from catalog `default`s, `assignHotkeys` depth-first with explicit keys kept and digits 1–9 for the rest, `placement`), `Renderer.tsx` (root-down, depth-capped, slots as render functions, invalid nodes reported and skipped, pending nodes skipped until data arrives), `Stage.tsx` (agent + UI zones by placement with CSS transitions), `useDecay.ts`, `useGlobalKeys.ts` (`resolveKey`: typing suppresses hotkeys; `Esc` cancels a running turn, else fires an `escape` action, else clears the screen; `Enter` fires the `enter` action; digits fire numbered actions).
- `session/store.ts`: `touched` map (node id → last add/set time, from event timestamps), `applyLocal(op)` for immediate decay/dismiss feedback; `session/api.ts`: `fireAction`, `clearScreen`, `removeNode`.
- `app/App.tsx`: mounts the Stage with the placeholder agent, wires hotkeys, decay and actions; `CommandInput` reports its value so global keys know when it is empty. `gallery/Gallery.tsx` for `?gallery=1`.
- Tests (+18): registry equals catalog, markdown parser, chart geometry, resolver/hotkeys/placement, Renderer (bound markdown, table, hotkey badge, action firing, pending and invalid handling, every example renders), Stage placement, decay timing, key resolution.

## Design decisions

- **Validate before render, twice.** The server validated the op; the client still validates resolved props per node (`validateProps`) so a stale client or a bad local op cannot put an unexpected shape in the DOM (roadmap rule 2). Invalid nodes are reported to the debug pane, not drawn.
- **Pending bindings render nothing.** Streaming routinely adds a node before its data; a skeleton would flash. The node appears when `set_data` lands.
- **Hotkeys are the only action path.** `ActionBar` shows `<kbd>` badges; digits work only when the input is empty, so typing is never hijacked. Enter and Escape are reserved for the primary/confirm and reject/cancel/clear chain. (Click handlers exist on the badges for development only.)
- **Server-authoritative screen.** Decay and dismiss apply locally first for responsiveness and are reported to the server, which republishes the op; the reducer's idempotent `remove_node` makes the echo harmless.
- **Placement from the root's fit.** `Overlay` → glance corner; a root whose fit is only panel/full (`Split`, `Grid`, `Table`, `Chart`, `Timeline`, `Image`, `Map`) → full; anything else → side panel with the agent moved left. Phase 5 animates the agent accordingly.
- **MapLibre, raster OSM, keyless.** No API key, GL-rendered, dark via raster paint properties. Loaded lazily; the fallback card keeps the information when tiles or WebGL are unavailable.
- **Own Markdown parser.** Smaller than a dependency and guarantees no HTML path exists.

## Files changed

Added: `backend/internal/catalog/*`, `client/src/components/*`, `client/src/renderer/*`, `client/src/gallery/Gallery.tsx`, tests. Edited: `backend/internal/session/session.go` (+test), `backend/internal/httpsrv/{session_handler.go,server.go}` (+test), `client/src/session/{store,api}.ts`, `client/src/app/{App,CommandInput}.tsx` (+test), `client/src/index.css`, `client/vite.config.ts`, `client/package.json` (+maplibre-gl), docs.

## How to run

```bash
pnpm -C client build && cd backend && go run ./cmd/api
```

In the browser: "show me a map of Berlin" renders a full-width Split with the map and a card whose Navigate action shows `1`; pressing `1` returns 501 until Phase 6 (visible in `?debug=1`). "what time is it" shows a glance Stat that decays after 30 s. `Esc` clears. `http://localhost:8080/?gallery=1` renders every component.

## How to test

Go: `go test ./...` (new catalog package, session action tests, endpoint tests). Client: `pnpm -C client test` (93 tests). Verified here: all green; `type-check`, `lint` (0 errors), `build` (main bundle 409 kB, MapLibre in its own 1 MB chunk loaded on demand).

## Known gaps

- Map tiles need network access; verified by reasoning and the fallback path, not by a browser here. The Map component is excluded from the example-render test because jsdom has no WebGL.
- The agent in the focal zone is still the CSS placeholder (Phase 5).
- `tool` and `propose` actions and the `Confirm` component's confirm/reject are not executable until the Phase 6 gate.
- No `navigate` action behaviour yet (returns unsupported).
- The gallery renders examples only; it does not exercise bindings or streaming.

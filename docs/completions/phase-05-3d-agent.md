# Phase 5: The 3D agent

**Date:** 2026-10-29. **Branch:** `feat/vision-implementation`. **Changelog:** 0.15.5. **Roadmap:** [`../executing/roadmap.md`](../executing/roadmap.md) Phase 5.

## Summary

The focal element is now a WebGL2 particle nebula built on the salvaged shaders, driven by a state machine that eases shape, motion and colour between idle, listening, thinking, speaking and error, reacts to a speech audio level while speaking, and renders at an adaptive resolution governed by measured frame time. It falls back to a static SVG silhouette when WebGL2 is unavailable or the user prefers reduced motion, loads lazily so the main bundle stays small, and reports fps, render scale and particle count through a `?stats=1` overlay for the display-box test VISION 8 asks for.

## What was built

- `agent3d/palettes.ts`: per-state palettes (pearl + four tints, cycle frequencies, intensities, spatial weights, a CSS colour): idle muted pearl/green, listening cyan, thinking amber/violet with faster cycles, speaking bright green, error red.
- `agent3d/state.ts`: `TARGETS` per state (coherence, low/mid noise amplitude, rotation rates, brightness, breathing amplitude and rate) and `AgentStateMachine` (`transition`, `setAudioLevel`, `step(dt)` → blended `Frame`; exponential easing with τ = 0.35 s, dt clamped, audio attack 50 ms / release 250 ms applied only while speaking, breathing added to coherence).
- `agent3d/adaptive.ts`: `AdaptiveResolution` (frame-time EMA, scale 0.5–1.0 of device DPR, steps down at > 33 ms, half-steps up at < 13 ms, 1.5 s cooldown, bad samples ignored).
- `agent3d/audio.ts`: the mutable `audioLevel` the Phase 8 analyser writes. `agent3d/stats.ts`: render stats.
- `agent3d/shaders/nebula-shaders.ts`: `uBrightness` added to both fragment shaders (the only change to the salvaged GLSL).
- `agent3d/Nebula.tsx` (lazy chunk): R3F `Canvas` with two `THREE.Points` layers (primary cloud 12 000 points, core motes 1 200 by default; `?particles=N` overrides), additive blending, all uniforms written per frame from the state machine, group rotation per state, DPR updated through `setDpr` when the adaptive controller changes scale, stats updated per frame. `gaussianSphere` is exported and tested.
- `agent3d/Agent3D.tsx`: `canRender3D()` (WebGL2 probe + reduced-motion query), `AgentFallback` (SVG rings in the state colour), `Agent3D` (state kept in a ref synced by effect; `Suspense` shows the fallback while the chunk loads), `StatsOverlay`.
- `App.tsx` mounts `Agent3D` in the Stage's agent zone; `Stage` shrinks it to a corner for full visuals. Tests (+8): state machine easing/audio/unknown-state, adaptive controller, fallback rendering in jsdom, Gaussian sampling.

## Design decisions

- **State lives in a ref, not React state.** The scene reads `stateRef.current` each frame; React never re-renders the canvas on a state event, which keeps the 60 fps loop independent of the store.
- **Easing in the machine, not in CSS or the shader.** One tested place owns the transitions, so "visible within 300 ms" (acceptance) is a τ value, and audio modulation composes with breathing.
- **Resolution adapts, geometry does not.** Particle buffers are allocated once; the controller changes only the render scale (DPR). Counts are a boot-time flag because reallocating buffers mid-session stutters.
- **Lazy chunk.** three + R3F are ~930 kB minified; loading them after the shell paints keeps first paint fast and lets the fallback cover any failure.
- **Compiler lint exemptions scoped to one file.** `react-hooks/immutability` and `react-hooks/refs` are disabled in `Nebula.tsx` only, with a comment: an imperative uniform loop is exactly what those rules cannot model.
- **Fallback is also the reduced-motion path.** The silhouette carries state through colour, so the screen stays informative without animation.

## Files changed

Added: `client/src/agent3d/{palettes,state,adaptive,audio,stats}.ts`, `client/src/agent3d/{Nebula,Agent3D}.tsx`, tests. Edited: `client/src/agent3d/shaders/nebula-shaders.ts`, `client/src/app/App.tsx`, `client/src/renderer/Stage.tsx`, docs.

## How to run

```bash
pnpm -C client build && cd backend && go run ./cmd/api
```

Open `http://localhost:8080/?stats=1`. The nebula idles in muted pearl; type a question and it turns amber and spins while thinking, then green and brighter while the reply streams, then settles. The overlay reports fps, frame time, render scale and DPR. `?particles=4000` lowers the load for weak GPUs.

## How to test

`pnpm -C client test` (101 tests), `type-check`, `lint` (0 errors), `build`. Verified here: all green; chunk sizes main 411 kB, Nebula 927 kB (lazy), MapLibre 1 053 kB (lazy).

## Known gaps

- **Not seen on a GPU.** This environment has no browser or WebGL; the shaders are the v1 shaders plus one uniform, and the R3F wiring follows the v1 scene, but the first real run on macOS and on the box is the acceptance test for the 30/60 fps targets. The stats overlay exists for exactly that.
- Audio reactivity has no producer until Phase 8.
- No listening-specific geometry (for example a directional lean); listening is colour and breathing only.
- Rotation accumulates in the group with no reset; harmless, but a long-running box could be given a periodic modulo if float drift ever shows.

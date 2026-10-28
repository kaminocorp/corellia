# Redesign Spawn — Phase 3 Completion Notes

**Plan:** `docs/executing/redesign-spawn.md`
**Phase:** 3 — Live nebula on active slide + palette crossfade
**Status:** complete
**Date:** 2026-04-27
**Verification:** `pnpm type-check` → 0 errors · `pnpm lint` → 0 errors

---

## What changed

### `nebula-scene.tsx` — `PrimaryCloud` palette lerp

**`PrimaryCloud`** gets an optional `targetPalette?: MoodPalette` prop. When
provided, its `useFrame` lerps every palette-derived uniform toward the target
each frame. When `targetPalette` is omitted (the default), `targetRef.current`
falls back to `palette` and the lerp is an identity — behaviour is
byte-identical to before Phase 3.

**Lerp formula (decision 3):** `α = 1 - exp(-delta * 8)` is frame-rate-
independent (uses the `delta` seconds provided by R3F's `useFrame((state, delta)
=> {...})`). At 60fps: α ≈ 12.5% per frame, half-life ≈ 87ms, visually
converged (~96% of the way to target) after ≈400ms.

**Uniforms lerped:** `uPearl` (Vector3), `uTint0–3` (Vector3 × 4),
`uTintFreq` (Vector4), `uTintIntensity` (Vector4), `uSpatialWeights` (Vector3).
`CoreMotes` has no palette uniforms and is unchanged.

**Allocation avoidance:** two `useRef` scratch objects (`_s3: Vector3`,
`_s4: Vector4`) are mutated in-place each frame instead of constructing
`new Vector3/4(...)` on every animation tick.

**Stale-closure fix:** the `targetRef` that the `useFrame` closure reads is
kept in sync via `useLayoutEffect` (not a render-phase write, which the
`react-hooks/refs` rule rejects). `useLayoutEffect` runs synchronously after
React's commit phase and before the next `requestAnimationFrame`/`useFrame`
fires, so the ref is always current by the time the lerp executes.

**`NebulaScene`** default export gets `targetPalette?: MoodPalette` and passes
it through to `PrimaryCloud`.

---

### `nebula-avatar.tsx` — `targetHarness` prop

**`NebulaAvatar`** gets `targetHarness?: HarnessKey`. When defined, it computes
`targetPalette = paletteFor(targetHarness)` and passes it to `<NebulaScene>`.
All existing logic (reduced-motion, WebGL detection, lazy IO mount) is
unchanged.

Typical consumer (the carousel overlay):
```tsx
<NebulaAvatar
  harness={HARNESSES[0].key}   // initial palette (uniform initialisation)
  targetHarness={activeKey}    // current swipe target (lerp destination)
  size={240}
/>
```

When `harness === targetHarness` (idle on the first slide), the lerp target
equals the initial value and the per-frame lerp is a no-op. Same behaviour for
the wizard's Step-1 confirmation panel where `targetHarness` is always omitted.

---

### `harness-carousel.tsx` — fixed canvas overlay

**Architecture (decision 21 / plan risk note):** the canvas lives at a *fixed*
position relative to the scroll container's wrapper div, not inside any slide's
DOM. All six `<HarnessSlide>` components always render `<AvatarFallback>` as a
layout placeholder — the canvas overlays it when a slide is centred. This
eliminates the double-canvas-mount problem that would occur if the canvas were
inside the slide and moved with the slide DOM during a swipe.

**Positioning:** the `relative` wrapper div wraps only the scroll container.
The canvas overlay is `absolute left-1/2 -translate-x-1/2 top-[49px]`:
- `top-[49px]` = card header height (~37px: `py-2` 16px + `text-sm` 20px line-height + 1px border)
  + avatar-section `py-3` top padding (12px) = right at the `<AvatarFallback>` SVG's top edge
- `left-1/2 -translate-x-1/2` = horizontally centred over the full-width slide

`pointer-events-none` on the wrapper ensures the SELECT button in the slide
footer (which is below the canvas area) remains clickable.

**Imports added:** `NebulaAvatar` from `nebula-avatar`, `HarnessKey` type from
`mood-palettes` (for safe casts of `activeKey: string` → `HarnessKey`).

The overlay always passes `harness={harnesses[0].key}` as the initial palette
(stable across the carousel's lifetime — the canvas is never remounted) and
`targetHarness={activeKey as HarnessKey}` which updates on every IO-confirmed
slide change. The nebula lerps between palettes automatically.

---

## What did NOT change

- `harness-slide.tsx` — unchanged from Phase 2 (always `<AvatarFallback>`;
  the canvas overlay is the nebula's DOM home, not the slide).
- All wizard steps, reducer, RPC contract — no change.
- `prefers-reduced-motion` behaviour — the carousel collapses to the grid
  fallback (handled in `HarnessCarousel`), so `NebulaAvatar`'s own
  reduced-motion check is a safety-net that never triggers in the carousel.

---

## Deviations from plan

**`prefers-reduced-motion` instant-cut mode skipped.** The plan notes palette
transitions should be "instant cuts" under reduced motion. Since `HarnessCarousel`
already collapses to a static grid when `reduceMotion = true`, the canvas
overlay is never mounted in reduced-motion sessions — there's no palette
transition to cut. Adding a `reduceMotion` prop to `NebulaScene` to force
`α = 1.0` would only matter in the (unreachable) case where someone renders
`<NebulaAvatar targetHarness={...} />` outside a `reduceMotion`-gated context.
Deferred as a non-issue for Phase 3.

**`harness-slide.tsx` not modified.** The plan's file list mentions adding
`isActive`-conditional `<NebulaAvatar>` inside the slide. The plan's own risk
note supersedes this: the fixed-overlay approach is chosen precisely to avoid
canvas mount/unmount on every swipe. `isActive` remains used for `tabIndex`
control only (Phase 2 intent preserved).

---

## Phase 4 entry points

- **Peek effect** (plan §3 note 3 / Phase 2 deferral): change slide wrapper
  from `w-full` to `w-[85%]` and add `scroll-padding-inline: 7.5%` on the
  container. The canvas overlay width stays 240px — Phase 3 centres it at
  `left-1/2`, which always means the full-width container's midpoint; it will
  also be the midpoint of a 85%-width slide if the container has symmetric
  padding. Validate on Safari iOS after the change.
- **Steps 2–5 RPG reskin** (plan Phase 4): starts at `wizard.tsx` render
  branches and the new `character-sheet.tsx` / `ready-to-launch.tsx`
  components. No nebula or carousel changes needed.

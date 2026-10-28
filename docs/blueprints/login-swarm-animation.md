# Login Swarm Animation — Technical & Design Blueprint

> The `/sign-in` route runs an ambient 3D particle swarm that morphs
> between a small library of schematic silhouettes (chevron,
> octahedron, torus, globe, network graph, wordmark) on a
> drift / morph / hold cycle. This blueprint is the reference for
> *how* it works and *why each piece is shaped the way it is*, so the
> technique can be replicated for similar moments elsewhere in the
> app (a brand-beat splash on a marketing route, a "deploy in
> progress" loading state for an enterprise milestone, a
> celebratory beat at end-of-onboarding, etc.) without re-deriving
> the whole pipeline.
>
> Live code lives at `frontend/src/components/sign-in/`. Source of
> truth for *current* numbers is the code; this doc captures the
> mental model, the decisions that survive the exact numbers, and
> the dials future contributors should reach for first.

Companion docs:

- `docs/refs/design-system.md` — the Mission Control × Deep Space
  aesthetic constraints this animation operates inside.
- `docs/refs/elephantasm-animation.md` — the sister-product
  reference whose techniques this animation deliberately diverges
  from (pearl breathing organism vs operator console).
- The original direction-D selection notes, phase completion notes and
  implementation plan (`login-animation*.md`) are no longer in the tree;
  recover them from git history if needed.

---

## 1. What it is, in one screen

A full-bleed 3D `THREE.Points` system rendered behind the centred
`AUTHENTICATE` panel. ~18,000 particles on desktop / ~6,000 on
mobile, rendered via `@react-three/fiber` with a custom
`ShaderMaterial` (additive-blended), driven by a `MorphScheduler`
that cycles through six baked target shapes plus a procedural
amorphous register. Reduced-motion users get an inline-SVG static
silhouette of the chevron and never load three.js.

```
┌─────────────────────────────── /sign-in ───────────────────────────────┐
│   ·   .   ·             . ·  CORELLIA                ·    .  ·         │
│ . ·   .  ·  . ·   .  · ·CONTROL PLANE — AGENT FLEET ·  . ·     ·       │
│  ·  . ·     ·  . · ┌──────────────────────────────┐ ·    .       ·   . │
│   .  ·   ·  . · .  │ [ AUTHENTICATE ]             │ . ·   . ·  ·     . │
│  . ·    ·  .       │   EMAIL [             ]      │      ·   ·  . ·  · │
│   ·  . ·  ·        │   PASSPHRASE [        ]      │  ·   .   . ·    ·  │
│ ·  . ·     ·       │   › AUTHENTICATE             │ . ·     ·   . ·    │
│  · . ·   . ·    .  └──────────────────────────────┘ · . ·   ·   . · ·  │
│ · . · . ·  ·                                       . ·   .   ·  . ·    │
└────────────────────────────────────────────────────────────────────────┘
        swarm density coalescing into the next silhouette
        target-baked to avoid the central form rect
```

---

## 2. Why this technique (vs the alternatives)

The brief was: drop a 3D, ultra-refined, ambient animation onto
`/sign-in` that hits the sophistication of Elephantasm's nebula but
reads as **Corellia**, not as a sister product. Four directions
were drafted (the originals are in git history):

- **A — Constellation Swarm.** Static volume of green points with
  drawn mesh edges + spawn pulses. *Discarded:* one-note;
  silhouettes don't change, so the screen runs out of things to
  reveal after ~10 seconds.
- **B — Orbital Fleet.** Bright core + concentric noise-jittered
  shells colored by lifecycle state. *Discarded:* the orbital metaphor
  is visually static even when animated; the lifecycle-color story
  was the strongest beat and survives in D as the cyan-tinted
  travel phase.
- **C — Lattice Membrane.** ~12K-vertex 3D lattice with propagating
  activation pulses. *Discarded:* reads as "monitored substrate"
  not "fleet under orchestration" — wrong product story.
- **D — Drone-Swarm Choreography (selected).** ~18K particles in
  formless drift, then converge into a schematic 3D silhouette,
  hold, dissolve, reform into the next. *Selected because:* every
  other direction picks one Corellia property; this one carries all
  four — multitude (the swarm), orchestration (the formation),
  reconfigurability (the morph), spawn dynamics (the travel-phase
  cyan). Drone-swarm light shows are also the most viscerally
  impressive particle pattern most viewers have actually seen IRL,
  which is the bar the brief sets.

The blueprint below is therefore the implementation of Direction D.
If a future moment in the app wants the same register with a
different metaphor, the technique transfers cleanly — only the
shape rotation and color story change.

---

## 3. Aesthetic constraints (non-negotiable)

These come from `docs/refs/design-system.md` and are the gating
constraints on every numeric dial below.

1. **Mission control, not stellar nebula.** Operators watching
   systems work — schematics, telemetry, lattices, swarms — *not* a
   luminous pearlescent breathing organism. Pearl is the Kamino
   *family* register; Corellia's variant is more austere.
2. **Brand green `#22c55e` is load-bearing.** Cyan / violet / blue /
   rose / amber are reserved for domain wayfinding. The login screen
   has no domain — so green is the only accent that "belongs" there.
   Cyan can appear as a *transient state hint* (the `pending`
   lifecycle color) on in-flight particles, but must not dominate.
3. **Pure black background.** Additive blending reads cleanly on
   `#000000`; that part of the Elephantasm recipe carries over.
4. **Alive, not showy.** Continuous ambient motion at the level of a
   monitoring dashboard's quiet hum, not a tech-demo screensaver.
   Even the "wow" beats emerge from a slow rhythm, not abrupt cuts.
5. **Form readability is the gating constraint.** Behind the centred
   `TerminalContainer` card the animation must drop in luminance
   enough that EMAIL / PASSPHRASE inputs stay AA-readable. Solved
   structurally — silhouettes are sampled to *avoid* the central
   form rect at bake time, plus a radial CSS vignette layered
   between canvas and form as a backstop for the worst case (an
   octahedron edge projecting through the form centre at certain
   rotation angles).

If a constraint conflicts with a numeric dial below, the constraint
wins. Numbers are tuning artefacts; constraints are the contract.

---

## 4. The morph cycle

A single cycle is ~18 seconds, repeated through a sequence of
target shapes. The phases (current implementation collapses
"travel" + "settle" into one MORPH phase; the original brief listed
four):

| Phase | Code value | Duration | What happens |
|-------|-----------|----------|--------------|
| **Drift** | `uPhase=0` | ~4s | Amorphous swarm, low-amplitude noise displacement around each particle's *current* position (held from the prior shape). The silhouette quietly disintegrates from the inside. Color: pearl mixed 0.4 with brand green. |
| **Morph** | `uPhase=1` | ~7s | Each particle accelerates toward its assigned position in the *next* shape along a noise-perturbed bent path (parabolic arc, peak deviation at midpath). Color tints toward cyan over the phase's first ~21%, holds, then decays back to green by phase end. Per-particle staggered easing means the formation visibly *coalesces* rather than snapping. |
| **Hold** | `uPhase=2` | ~7s (~12s for wordmark) | Recognisable shape sits in 3D, slowly rotating around the vertical axis (~0.05 rad/s). Each particle has high-frequency micro-jitter (amplitude 0.015) so the formation is alive, not frozen. Per-particle alpha flickers at ±0.04 around 0.32 baseline so the held formation reads as a low-luminance live monitor, not a flat sprite. |

The cycle then repeats with the next shape. The drift of cycle N+1
starts from the held positions of cycle N — no cuts, no fades,
continuous motion across cycle boundaries. Continuity at the
*phase* boundary is preserved by carrying the drift noise residual
into the morph phase (fades out as `eased` rises) so the drift→morph
transition has no visible snap either.

**Scene-level rotation is gated to non-MORPH phases only.** During
morph the rotation is frozen so the morph reads cleanly; otherwise
the simultaneous swarm-rotation + particle-translation visually
fights itself.

---

## 5. The shape rotation

A small library of schematic 3D silhouettes that reads as Corellia
without descending into corporate-mascot territory. Six baked
shapes plus the procedural amorphous register. All six are live
in the rotation as of Phase 4.

| Shape | Reads as | Build technique |
|-------|----------|-----------------|
| **`›` chevron** | Corellia's signature glyph (per design-system §27, the universal action indicator). Most instantly readable shape in the rotation. | Two extruded parallelograms; uniform-area surface sampling. |
| **Wireframe octahedron** | Schematic primitive — "one deployable unit." | Edge-traced + sparse interior fill. |
| **Torus** | Fleet / orbit — "actively running ring of agents." | Particles distributed around a thin toroidal volume; rotates around its own axis in addition to the scene rotation. |
| **Wireframe globe** | Multi-region deploy. | Particles trace 8 longitude meridians + 5 latitude parallels. |
| **Network graph** | Control-plane topology — most literal product reference in the rotation. | ~30 large "node" clusters via Poisson-disk sampling; 60% of particles distributed Gaussian-per-node, 40% along nearest-neighbour edges. |
| **Wordmark `CORELLIA`** | Brand beat. Only appears every ~7 cycles (~2 minutes between beats). Positioned in the lower third so it reads as the floor caption to the AUTHENTICATE panel, not a logo behind the form. | 3D-extruded text silhouette; uniform-area surface sampling. |
| **Amorphous swarm** | Rest state — palate cleanser between any two shapes. | No bake; targets = current positions + low-frequency noise drift. |

**Brand-sizzle-reel risk** is the load-bearing constraint here. The
rotation is dominated by *schematic* primitives (chevron,
octahedron, torus, network graph, globe — all neutral technical
iconography); the wordmark beat appears once per ~7 cycles, not
every loop. Network graph and chevron carry the product story; the
wordmark is the rarest beat.

---

## 6. Architecture

```
sign-in/
├── page.tsx                       integration surface; renders <SwarmBackground/> + form
└── components/sign-in/
    ├── swarm-background.tsx       branches on prefers-reduced-motion
    ├── reduced-motion-still.tsx   inline-SVG static fallback (no R3F load)
    ├── swarm-canvas.tsx           dynamic-imported R3F <Canvas>
    ├── swarm-points.tsx           geometry/material/uniforms; ticks scheduler each frame
    ├── morph-scheduler.ts         drift/morph/hold timing + shape sequence
    ├── shape-loader.ts            fetches + parses .bin target arrays
    ├── shape-targets/*.bin        baked Float32Array per shape (6 files)
    ├── shapes.ts                  shape names + canonical particle counts
    └── shaders/
        ├── swarm-vert.ts          per-particle position + size
        ├── swarm-frag.ts          per-fragment color + falloff
        ├── simplex-noise.ts       Ashima simplex GLSL constant (shared)
        └── index.ts               re-exports

frontend/scripts/
└── bake-sign-in-shapes.ts         offline target-position baker (manual)

frontend/public/sign-in/shape-targets/*.bin   committed binary artefacts
```

### Load order

1. `/sign-in/page.tsx` renders `<SwarmBackground />`.
2. `swarm-background.tsx` reads `prefers-reduced-motion` via the
   project's `useMatchMedia` hook (SSR-safe `useSyncExternalStore`).
   - **Reduced-motion branch:** `<ReducedMotionStill />` mounts;
     three.js + R3F are never imported.
   - **Default branch:** `dynamic(() => import('./swarm-canvas'),
     { ssr: false })` fires; the chunk containing R3F + three.js +
     all shader strings fetches.
3. `swarm-canvas.tsx` mounts the `<Canvas>` and `<SwarmPoints>`
   inside.
4. `swarm-points.tsx` runs `loadShapeTargets(shapes)` (one fetch per
   `.bin` file, parsed once into typed arrays), constructs a
   `MorphScheduler`, allocates per-particle attribute buffers
   (`previousTarget`, `targetPosition`, `morphSeed`, `trajectoryNoise`),
   declares them via R3F's declarative JSX so refs are only touched
   in `useFrame`, never in render.
5. `useFrame` ticks the scheduler each frame, swaps target buffers
   on shape change (`Float32Array.set` into `BufferAttribute.array`,
   `needsUpdate = true`), and updates 4 uniforms (`uPhase`,
   `uPhaseProgress`, `uTime`, `uCyanTint`).

### Stacking-context contract (post-Phase-7)

`<main>` on `/sign-in` does **not** paint a background. The black
register comes from `SwarmBackground`'s wrapper `<div className="fixed
inset-0 -z-10 bg-black">`, which both branches share. Reintroducing
`bg-*` on `<main>` re-creates the canvas-hidden bug — `<main>` is
`relative` without `z-index` and so does not establish a stacking
context, which means a `-z-10` descendant participates in the root
stacking context and gets painted *before* in-flow block backgrounds.

---

## 7. Per-particle attributes (set once at mount, not mutated)

Every particle carries a small set of constants that drive its
behaviour through every phase. These are set once at canvas mount
(except `previousTarget` / `targetPosition`, which are mutated on
shape change only — never per frame on CPU):

| Attribute | Type | Purpose |
|-----------|------|---------|
| `position` | vec3 | Unused by the vertex shader (the shader picks `previousTarget` / `targetPosition` directly), but Three requires it for the draw-call vertex count. Held stable for the count. |
| `previousTarget` | vec3 | Where the particle came from (prior held shape). |
| `targetPosition` | vec3 | Where it's heading (current shape). |
| `morphSeed` | float `[0,1]` | Per-particle random; staggers travel arrival so the swarm visibly *coalesces* rather than snapping. The leading 25% of particles arrive while the trailing 25% are still mid-travel. |
| `trajectoryNoise` | vec3 (unit) | Bend direction during travel — uniform random unit vector (sampled via spherical coordinates). Keeps the swarm billowing rather than flying in straight lines. |

Three buffer copies of the initial positions exist:
`position` (kept stable for the vertex count), `previousTarget`
(mutated each shape change to flip prior→target), `targetPosition`
(mutated each shape change). Mobile takes a stride-by-3 subsample
of every loaded `.bin` once at load, so the `Float32Array.set` swap
path is identical to desktop (source already the right size).

---

## 8. Per-frame uniforms (CPU writes ≤5 floats per frame)

| Uniform | Type | Purpose |
|---------|------|---------|
| `uPhase` | int (0/1/2) | Drift / morph / hold; selects the phase branch in the vertex shader. |
| `uPhaseProgress` | float `[0,1]` | Progress within the current phase. |
| `uTime` | float | Seconds since canvas mount; drives ambient noise + flicker. |
| `uPixelRatio` | float | `window.devicePixelRatio` for `gl_PointSize` scaling. |
| `uCyanTint` | float `[0,1]` | Drives the morph-phase color shift toward cyan in the fragment shader. |

CPU work per frame is O(1) — no per-particle iteration on the JS
side ever. All per-particle math is in the vertex shader.

---

## 9. Vertex shader (the load-bearing part)

Three branches keyed on `uPhase`:

```glsl
if (uPhase == 0) {
  // DRIFT — meander near the previous formation.
  displaced = previousTarget + driftDisplacement(previousTarget, uPhaseProgress);

} else if (uPhase == 1) {
  // MORPH — staggered, bent travel from previous to target.
  float t = clamp((uPhaseProgress - morphSeed * 0.25) / 0.75, 0.0, 1.0);
  float eased = smoothstep(0.0, 1.0, t);
  vec3 straight = mix(previousTarget, targetPosition, eased);
  float bendStrength = sin(eased * 3.14159265);     // peaks at midpath, zero at endpoints
  vec3 bent = straight + trajectoryNoise * bendStrength * 0.6;

  // Carry-over drift noise that fades as morph progresses, so the
  // drift→morph transition has no visible snap.
  vec3 carry = driftDisplacement(previousTarget, 1.0) * (1.0 - eased);
  displaced = bent + carry;

} else {
  // HOLD — at target with high-frequency micro-jitter so the
  // formation reads as alive, not frozen.
  vec3 jitter = vec3(
    snoise(targetPosition * 8.0 + vec3(uTime * 0.7)),
    snoise(targetPosition * 8.0 + vec3(uTime * 0.6 + 10.0)),
    snoise(targetPosition * 8.0 + vec3(uTime * 0.8 + 20.0))
  );
  displaced = targetPosition + jitter * 0.015;
}
```

Three structural decisions inside this shader carry across to any
similar animation:

1. **The `morphSeed * 0.25` stagger** is what makes the formation
   *coalesce* visibly rather than snap. Without it the morph reads
   as a synchronised teleport. With more (e.g. `* 0.5`) the swarm
   smears too much and never resolves crisply. The 0.25 figure is
   load-bearing.
2. **The `bendStrength = sin(eased * π)` curve** gives every
   particle a parabolic arc with maximum perpendicular deviation at
   the midpoint of its travel, decaying to exact target at arrival.
   Per-particle `trajectoryNoise` direction is randomised so the
   swarm billows organically. Without it the morph reads as
   mechanical (dot-matrix re-lighting); with too much, chaotic.
3. **The drift→morph carry-over** is non-obvious but essential:
   without it, the moment `uPhase` flips from 0 to 1 the noise
   displacement disappears in a single frame. With the
   `(1.0 - eased)` fade-out the residual noise smoothly hands off
   to the morph trajectory.

### Point sizing (post-Phase-7)

```glsl
gl_PointSize = 1.0 * uPixelRatio * (8.0 / -mvPosition.z);
```

At camera `z=6`, `devicePixelRatio=2`: ≈ `2.7 px per point`. With
the fragment shader's `exp(-d*d*8.0)` falloff that gives a soft
3–4 px halo per particle — pinprick scale, individually resolvable,
swarm-density at 18,000.

**The Phase-0 placeholder was `2.5 * uPixelRatio * (300.0 / -mvPosition.z)`**
which resolves to ~250 px per point — roughly 80× too large,
producing fluffy clouds rather than discrete particles. The shipped
shader's comment had said *"the 300.0 figure is empirical and gets a
tuning pass in Phase 7"* — Phase 7 (in changelog 0.8.2) was that
pass. Future replications: don't ship the placeholder, and gate on a
live render before declaring the shader done.

### Alpha (post-Phase-7)

```glsl
if (uPhase == 1) {
  vAlpha = 0.45;
} else if (uPhase == 2) {
  float flicker = sin(uTime * 0.4 + morphSeed * 6.2831853) * 0.04;
  vAlpha = 0.32 + flicker;
} else {
  vAlpha = 0.32;
}
```

With ~18,000 additive particles overlapping, anything above ~0.4
baseline saturates the additive blend toward white before the
silhouette can read. Drift/hold sit at 0.32, morph brightens to
0.45 to read as "active," hold flickers ±0.04 to read as alive.

---

## 10. Fragment shader

```glsl
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float soft = exp(-d * d * 8.0);
  if (soft < 0.01) discard;

  vec3 pearl = vec3(0.85, 0.92, 0.85);
  vec3 green = vec3(0.133, 0.773, 0.369);   // #22c55e
  vec3 cyan  = vec3(0.024, 0.714, 0.831);   // #06b6d4

  vec3 rest = mix(pearl, green, 0.4);
  vec3 color = mix(rest, cyan, clamp(uCyanTint, 0.0, 1.0));

  gl_FragColor = vec4(color, vAlpha * soft);
}
```

Three notes:

- **`exp(-d*d*8.0)` softness** plus `discard` at `<0.01` keeps the
  additive blend from haloing across half-transparent pixels. The
  falloff is tight enough that points look crisp at 3 px, soft
  enough that they don't alias on subpixel motion.
- **Rest color is `mix(pearl, green, 0.4)`.** Brand green is
  load-bearing on auth (no domain → only green belongs); pearl
  base + 0.4 green tint reads as "control plane" rather than "neon
  green tech demo."
- **Cyan tint is the strongest storytelling beat.** It *means*
  "these agents are in `pending` state, mid-spawn" — the literal
  product semantic from `agent_instances.status`. Bends the
  green-only auth rule but earns the bend by tying motion to
  product meaning.

### Blending + depth

```ts
<shaderMaterial
  transparent
  depthWrite={false}
  blending={AdditiveBlending}
  ...
/>
```

`depthWrite=false` is non-negotiable for a particle system —
without it, particles would Z-occlude each other and the swarm
density would be wrong.

---

## 11. Target baking (offline pipeline)

The bake script lives at `frontend/scripts/bake-sign-in-shapes.ts`
and runs manually before commit (not on every build). Bake outputs
go to `frontend/public/sign-in/shape-targets/*.bin` as raw
`Float32Array` buffers (one file per shape, ~216 KB each: 18K points
× 3 floats × 4 bytes). Total wire cost gzips to ~600 KB on the
`/sign-in` route only.

For each shape:

- **Chevron, octahedron, torus, globe, wordmark.** Build a
  `THREE.Mesh` from the silhouette (extruded geometry for chevron
  and wordmark; primitive geometry for the rest). Sample N points
  uniformly on the mesh surface using a barycentric sampler weighted
  by triangle area.
- **Network graph.** Generate ~30 node positions in 3D via
  Poisson-disk sampling within a viewport-fitting volume; assign
  N×0.6 particles to nodes (Gaussian per node, σ=0.09), N×0.4
  particles to edges (linear distribution along nearest-neighbour
  edges, σ=0.025).
- **Form-rect exclusion.** For every shape, samples whose 2D
  screen-projection (under the scene's fixed camera matrix) fall
  inside the form's bounding rect (plus 24 px padding) are
  rejected and resampled outside. Done once per shape at bake
  time, not per frame. Side benefit: the chevron's inner fill,
  the octahedron's centre, the torus's inner hole, etc. all
  naturally clear the form area.

**Why bake offline rather than compute at runtime.** A clean
baked target array is canonical, reviewable, and stable across
deploys. Runtime sampling would either (a) introduce per-session
visual variance, (b) eat startup CPU on the auth route, or (c)
require shipping a heavier sampler bundle. Bake-once-commit is the
right shape for shapes that don't change often.

**Re-bake is needed only when a shape's silhouette changes.** The
bake script is a real piece of code (the wordmark and network-graph
samplers were the main cost); re-runs are cheap once the script is
written.

---

## 12. The MorphScheduler

Owns the cycle clock and the shape sequence. Plain TS class, no
React state, ticked from `useFrame(state.clock.elapsedTime)`.

Responsibilities:

- Maps wall-clock seconds → `(phase, phaseProgress)`.
- Picks the next shape via weighted random with an
  *amorphous-probability* dial that occasionally inserts an
  amorphous interlude between two real shapes.
- Reports `(previousShape, currentShape)` so `swarm-points.tsx` can
  detect shape transitions and swap target buffers.

Numeric dials (current values, all in `morph-scheduler.ts`):

| Dial | Current value | What it controls |
|------|---------------|------------------|
| `DRIFT_DURATION_S` | 4 | Drift phase duration. |
| `MORPH_DURATION_S` | 7 | Morph phase duration. |
| `HOLD_DURATION_S` | 7 | Hold phase duration (most shapes). |
| `HOLD_DURATION_WORDMARK_S` | 12 | Wordmark gets a longer hold so the brand beat lands. |
| `DRIFT_DURATION_AMORPHOUS_S` | 8 | Amorphous interludes drift longer (no need to settle into a shape). |
| `SHAPE_WEIGHTS` | per-shape | Relative frequency. Wordmark is rare (~1/7 cycles); schematic primitives dominate. |
| `AMORPHOUS_PROBABILITY` | 0.4 | Probability of inserting an amorphous interlude between two real shapes. |

Phase 8's job is to tune these against the running engine. The
implementation surface is stable; only numbers should move.

---

## 13. Performance budget

- **Single `THREE.Points` draw call** for all 18,000 particles —
  nothing else in the scene except the (vestigial) ambient light.
- **CPU per frame:** 4–5 uniform writes, one scheduler tick, one
  conditional `Float32Array.set` on shape change. O(1) in particle
  count.
- **GPU per frame:** 18,000 vertex shader invocations (mobile:
  6,000), ~20K–50K fragment shader invocations depending on point
  size and overlap. Locked to the locked `gl_PointSize` formula so
  fragment cost is bounded.
- **`powerPreference: 'high-performance'`** on the WebGL context.
- **`alpha: true`** so the canvas composes against the page's
  `#000000` background without baking it in.
- **R3F throttles `useFrame` when the tab is inactive** by default;
  no manual visibility-change handling required.

### Bundle

- `three` + `@react-three/fiber` + `@react-three/drei`: lazy-loaded
  only on `/sign-in` via `dynamic(() => import('./swarm-canvas'),
  { ssr: false })`. ~150 KB gzipped.
- 6 baked target binaries: ~1.3 MB raw → ~600 KB gzipped on the
  wire. Loaded once per session (auth route).
- Reduced-motion users skip both — three.js never loads, binaries
  never fetch.

### Mobile path

Detected via `useMatchMedia("(max-width: 768px)")`. Particle count
drops to `PARTICLE_COUNT_MOBILE = 6000` via integer-stride
subsampling of the desktop-canonical .bin files (stride = 3, take
every 3rd sample). Subsampling preserves uniformity (the bake
samples are uniform-random over the silhouette, so striding by 3
produces another uniform-random subset without edge smearing).

---

## 14. Reduced-motion fallback (post-Phase-7)

Inline-SVG static silhouette in `reduced-motion-still.tsx`. No PNG
asset, no R3F dependency, no `useFrame`. The
`prefers-reduced-motion` branch in `swarm-background.tsx`
short-circuits the dynamic import entirely, so three.js never
loads on the reduced-motion path.

Composition (post-Phase-7, supersedes Phase 6's parameters):

- `viewBox="0 0 1920 1080"` with
  `preserveAspectRatio="xMidYMid meet"`. **`meet`, not `slice`** —
  `slice` magnifies the viewBox to cover the rendered rect on
  tall-and-narrow viewports, projecting the chevron at viewport
  scale. `meet` scales to fit, leaving black letterbox that's fine
  because the parent `<div>` is `bg-black`.
- Two `<polygon>`s tracing the chevron arms at half the Phase-6
  scale (~340 viewBox units centred). Quiet ambient presence
  rather than a hero element.
- `<pattern>` stipple, period 24 px, radius 0.9 px, fill opacity
  0.45. Silhouette reads as a texture suggestion, not a solid mass.
- `<radialGradient>` halo at `r=55%`, alpha 0.06. Subtle
  brand-green wash matching the morph engine's hold-phase color
  register, no luminance saturation.

The principle: the reduced-motion still is *ambient wallpaper*, not
a billboard. Phase 6 first shipped it at viewport scale; Phase 7
corrected to ambient scale.

---

## 15. The dial inventory (where to tune what)

If the animation needs to change feel, the right place to reach is
almost always one of these constants. Replication elsewhere in the
app starts from the same dial map.

| Dial | Location | What it controls |
|------|----------|------------------|
| Particle count desktop / mobile | `shapes.ts` (`PARTICLE_COUNT`, `PARTICLE_COUNT_MOBILE`) | Density. Lower = sparser, lower GPU cost. |
| Cycle pacing | `morph-scheduler.ts` (`DRIFT_DURATION_S`, `MORPH_DURATION_S`, `HOLD_DURATION_S`, etc.) | Tempo. Faster → more punch / less contemplative. |
| Shape weights | `morph-scheduler.ts` (`SHAPE_WEIGHTS`) | Which shapes dominate the rotation. |
| Amorphous probability | `morph-scheduler.ts` (`AMORPHOUS_PROBABILITY`) | Rhythm — how often the rotation breaks. |
| Drift amplitude | `swarm-vert.ts` (`amp = 0.05 + t * 0.35`) | How much the silhouette dissolves during drift. |
| Stagger | `swarm-vert.ts` (`morphSeed * 0.25`) | How time-extended the morph coalescence reads. |
| Bend strength | `swarm-vert.ts` (`* 0.6`) | How much the swarm billows during morph. |
| Hold jitter amplitude | `swarm-vert.ts` (`* 0.015`) | How "alive" the held formation reads. |
| Point size | `swarm-vert.ts` (`gl_PointSize` formula) | Pinprick vs cloud. Phase 7's load-bearing fix lives here. |
| Per-phase alpha | `swarm-vert.ts` (`vAlpha = 0.32 / 0.45`) | Saturation under additive blending. |
| Color mix | `swarm-frag.ts` (pearl/green/cyan vec3s, `mix(pearl, green, 0.4)`) | Rest color register. |
| Cyan ramp shape | `swarm-points.tsx` (`/0.21` up, `/0.14` down) | When the morph reads as "in flight." |
| Vignette alpha | `/sign-in/page.tsx` (radial-gradient `0.6` alpha) | Form readability backstop. |
| Reduced-motion still | `reduced-motion-still.tsx` (stipple period/radius/opacity, halo alpha, polygon scale) | Ambient texture density. |

---

## 16. Replicating the technique elsewhere in the app

The login swarm is the strongest standalone moment in the app, but
the *technique* is reusable. If a future surface wants a similar
register, the porting path is:

1. **Decide the metaphor.** What does the swarm *mean* on this
   surface? On `/sign-in` it's "agents under orchestration"; on a
   "deploy in progress" splash it might be "agents converging on a
   target"; on a celebratory beat it might be "fleet at scale."
   The metaphor drives the shape rotation.
2. **Pick the shape rotation.** Reuse the existing six bakes if the
   metaphor allows, or add new ones. Re-bake offline; commit
   binaries.
3. **Decide the cycle pacing.** `/sign-in` is contemplative
   (ambient, ~18s cycles). A loading-state splash might want 6–8s
   cycles. A celebratory beat might want one cycle and out.
4. **Reuse the architecture.** The component split
   (background → canvas → points → scheduler → shaders) is
   metaphor-agnostic. The shaders themselves are largely
   shape-agnostic — only color constants change with brand
   register.
5. **Keep the constraints.** Form-readability vignette, brand-green
   load-bearing-on-auth, never-saturate-additive-blend, no-snap-at-phase-boundary.
   These hold across every surface this technique should appear on.
6. **Don't ship the placeholder shader.** Phase 0–6 shipped the
   `gl_PointSize` placeholder; Phase 7 was the live-render gate
   that fixed it. On any future replication, gate the implementation
   on a live render at one tall-and-narrow viewport before
   declaring it done.
7. **Mind the stacking context.** Any `position: fixed` canvas with
   negative `z-index` only works if no ancestor's background paints
   above it. The simplest invariant: the page's `<main>` should not
   carry a `bg-*` class; the canvas's wrapper does instead.

Surfaces this technique might suit, in increasing order of
out-of-scope-for-v1-ness:

- A future **"deploying N agents"** splash that holds while the
  Fly machine creation proceeds — the swarm converging from
  amorphous → network graph maps cleanly to "control plane fanning
  out across providers."
- A future **end-of-onboarding** beat — wordmark + chevron rotation
  for ~12 seconds before the dashboard mounts.
- A future **marketing route** (e.g. a landing page) — the same
  swarm with a slower cycle, no form, full-bleed.

In every case the gating constraints from §3 still apply.

---

## 17. What this blueprint is *not*

- **Not a tutorial on three.js or React Three Fiber.** It assumes
  familiarity with `BufferGeometry`, `ShaderMaterial`, `useFrame`,
  and `dynamic` imports. The R3F docs are the right place for
  primitives.
- **Not a substitute for reading the live code.** Numeric values
  are correct as of changelog 0.8.2 / Phase 7; subsequent tuning
  passes will move them. The *structure* (what the shader phases
  are, why the morph carries drift residual, why the form-rect
  exclusion bakes offline) is stable across tunes.
- **Not a design system.** Constraints from §3 are quoted from
  `docs/refs/design-system.md`; that doc remains authoritative on
  brand, color discipline, and animation register. This blueprint
  describes one specific application of the system.

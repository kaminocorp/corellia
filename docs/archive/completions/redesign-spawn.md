# Plan — Spawn Page Redesign: Character-Select Gallery + RPG Step Reskin

**Status:** draft, awaiting approval
**Owner:** TBD
**Supersedes:** —
**Related:**
- `docs/blueprint.md` §10 (the "RPG character creation" golden path), §11.4 (deferred features stub as real interfaces — applies to locked harness cards)
- `docs/refs/design-system.md` §33.5 (the `/spawn` showcase route — split into roster + wizard, **one `<canvas>` page-wide ceiling**), §34 (the five-step flow, accent map, Acknowledgement Pattern, "READY TO LAUNCH" final-step treatment)
- `docs/changelog.md` §0.9.0–§0.9.2 (the original spawn redesign that landed the roster + wizard split, the `<NebulaAvatar>` + `<AvatarFallback>` cascade, and the §34 doc-vs-code reconciliation), §0.10.6 (the SaaS-standard type-scale bump and locked-card particle-cloud fallback we ship on top of)
- `docs/archive/agents-ui-mods.md` (decision 19 = 5-step layout, decision 21 = one-canvas-per-page, decision 11 = no Spawn-N in the wizard, decision 5 = nebula shape shared, palette per harness)

---

## 1. Objective

The 5-step spawn wizard is functionally complete and visually coherent in mission-control language, but the wizard reads as a **vertical form** — terminal panels stacked top-to-bottom, identical text inputs, dropdowns, validation errors. Operator feedback (2026-04-27): "feels too oldschool. I want it to feel more like RPG customisation."

This plan reshapes the spawn surface in two coupled moves:

1. **Step 1 becomes a horizontal character-select gallery.** The existing static roster grid (`/spawn` page) collapses into the wizard as Step 1 — a single, large, centred live nebula avatar with the harness's name + spec-sheet beside it, and you swipe / arrow / click through harnesses (Hermes selectable, the five locked siblings flash a `[ LOCKED ]` overlay on attempt). The palette + accent feature-color of the central canvas crossfade as you change harness, so the moment of pick **feels like a thing**, not a click on a card.

2. **Steps 2–5 get an RPG-loadout reskin, not a redesign.** The reducer machine, validation, RPC contract, deploy-log surface, and the §34 step structure stay verbatim. What changes is how each step *presents* its inputs: Identity becomes a callsign card, Model becomes a faction × class picker, Deployment becomes a stat-allocator (region = theatre, size = armor class, etc.), Review becomes a character sheet with a full-width **`READY TO LAUNCH`** panel matching design-system §34.3 (which the shipped wizard currently under-honours).

Both halves are FE-only. Zero backend, proto, schema, env, or dependency change.

### What this plan is NOT

- **Not a step-count change.** §34.1 locks five steps (`HARNESS → IDENTITY → MODEL → DEPLOYMENT → REVIEW`); decision 19 already collapsed provider/key/model into one panel. We don't re-litigate.
- **Not a contract change.** `spawnAgent` stays exactly as it shipped in M4. `DeployConfig` stays exactly as it shipped in M5. The `CheckDeploymentPlacement` placement-banner gate stays.
- **Not a Spawn-N revival.** Decision 11 dropped Spawn-N from the wizard; this plan does not bring it back. (A "duplicate this agent ×N" affordance from the fleet view is the post-v1.5 path per §34.4.)
- **Not a `<NebulaScene>` rewrite.** The shader, particle counts, palette schema, and feature-detection cascade are correct. We add a *palette-transition mode*, not a new scene.
- **Not a new dependency.** No carousel library (no embla / swiper / keen-slider / framer-motion / @use-gesture). Native CSS `scroll-snap-type: x mandatory` + a small `IntersectionObserver` driver covers touch, trackpad, and arrow-button paths in <80 LOC.

---

## 2. Decisions locked

| # | Decision | Rationale |
|---|---|---|
| 1 | **`/spawn` and `/spawn/[templateId]` collapse into a single wizard surface.** `/spawn` (no `templateId`) renders the wizard with Step 1 in *gallery* mode and Steps 2–5 in *pending* (the existing pending opacity-40 treatment). Picking Hermes routes to `/spawn/{hermesTemplateId}` via `router.replace` (history-clean — no back-button trap), Step 1 transitions to *confirmed*, Step 2 becomes *active*. | Today the roster page (`/spawn/page.tsx`) and the wizard (`/spawn/[templateId]/page.tsx`) are two routes — the user "selects a card" then "enters the wizard." The user's request is explicitly: *clicking onto Spawn shows the swarm; swiping picks; selection moves to naming*. That maps cleanly onto **Step 1 of the wizard being the gallery**, not a pre-wizard route. Per-harness URL bookmarkability is preserved (`/spawn/{templateId}` still works as a deep-link entry) and so is the §34 acknowledgement pattern. |
| 2 | **Step 1 carousel is `scroll-snap-type: x mandatory` over six harness slides; centred slide is "active."** Active slide promotes its avatar to the live `<NebulaAvatar>`; the two adjacent peek slides on each side render the static `<AvatarFallback>` (already palette-keyed). Beyond ±2 the slides are virtualised (rendered as empty `<div>`s with the right width so the snap geometry is correct). | **Honours design-system §33.5's one-`<canvas>`-per-page rule** (decision 21). The shipped roster is `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` with one active card carrying the canvas — the gallery preserves that invariant by rendering exactly one canvas, the rest as the SVG fallback that 0.10.6 already ships. CSS scroll-snap gives free touch-swipe on mobile, free trackpad-momentum on desktop, and free keyboard tab-stop. |
| 3 | **Palette transition on harness change is a smooth crossfade between the live nebula's palette uniforms (~400ms), not a canvas remount.** A new `<NebulaScene>` prop `targetPalette` lerps `pearl`, `tints[0..3]`, `intensities[0..3]`, and `frequencies[0..3]` toward the new palette inside the existing `useFrame` animation loop. The fallback HSL halo crossfades in CSS via a `--harness-accent` custom property on the slide container. | Mounting/unmounting the canvas on each swipe causes a noticeable WebGL context flicker on Safari and burns ~80ms of GPU spin-up per change. Lerping uniforms is free (one extra branch per particle in the existing fragment shader; the palette is already a uniform array), keeps the canvas warm, and produces the exact "swarm slightly changes shape and colour to represent each harness" effect the user described. **Shape stays shared** (decision 5) — this plan does not introduce per-harness particle counts, sigmas, or octaves. The palette tells you which harness this is; the shape tells you it is *a Corellia-spawnable harness*. |
| 4 | **Locked harness slides are reachable in the carousel but show a `[ LOCKED ]` overlay and a `› SELECT` button that's `disabled` (not hidden).** The slide still occupies its full width, the avatar fallback still renders palette-tinted, and the spec sheet still surfaces VENDOR / STATUS / ETA. Tabbing onto a locked slide announces "Locked — coming soon" via `aria-disabled`. | Per blueprint §11.4 the LOCKED affordance must be a **real, scannable surface**, not a hidden card. Letting the user swipe through them is the demo moment ("look at all the harnesses we'll support") and is consistent with today's roster behaviour — five out of six cards are non-clickable. Distinct from the §34 "pending" step opacity-40 treatment because locked here is a *permanent* status, not a temporal one. |
| 5 | **Step 1 gains a header treatment of `[ SELECT YOUR HARNESS ]` (replacing today's wizard-page `[ LAUNCHPAD // CONFIGURE ]` while Step 1 is gallery-mode).** Once a harness is confirmed, the header reverts to `[ LAUNCHPAD // CONFIGURE ]` for Steps 2–5, matching today's wizard chrome. | The kicker carries the metaphor. While you're picking a harness, the surface is a character-select screen; once picked, the surface is a launchpad configuration console. Two registers, one wizard. |
| 6 | **Steps 2–5 are reskinned, not restructured.** Step 2 keeps the `name` field; Step 3 keeps `provider` + `modelName` + `apiKey`; Step 4 keeps `<DeploymentConfigForm>` (which is also consumed by the fleet inspector's edit pane and the bulk-apply modal — we do **not** edit that component); Step 5 keeps the placement-check banner + `spawnAgent` submit + `<DeployLog>`. The wizard reducer, Zod schemas, and field-level validation are untouched. | The form logic is correct, type-checked, and shared with two other surfaces (fleet inspector, bulk-apply). Reskinning visual presentation without touching state shape limits blast radius to the wizard's render branches and a couple of layout primitives. The shared `<DeploymentConfigForm>` keeps its current layout — Step 4's reskin is achieved by wrapping it in a stat-block frame and adjusting copy, not by re-implementing the form. |
| 7 | **Step 5 ships the design-system §34.3 "READY TO LAUNCH" panel verbatim** — full-width green-bordered panel, large `› DEPLOY AGENT` CTA inside. Today's wizard renders a small `Button size="sm"` at the top-right; that under-honours the spec. | The shipped wizard is below spec on the most demo-load-bearing surface. Bringing it in line with §34.3 is the lowest-risk highest-visibility change in the bundle. |
| 8 | **Carousel a11y: arrow keys move ±1; `Home` / `End` jump to ends; numeric `1–6` jumps to slide; `Tab` rotates through `[prev arrow, slide, next arrow]`; each slide has `role="group"` + `aria-roledescription="harness"`; the wrapper has `aria-label="Select your harness"` + `role="region"`.** Active slide is announced via `aria-current="true"` flipping on each scroll-end. | Mirror the [W3C APG carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) without the auto-rotation (which is not part of the spec for this surface — manual-control only). Numeric jump composes with the existing `1–7` keyboard binding on the `/presentation` deck (0.10.5) so operators have one consistent "jump to slide" muscle. |
| 9 | **`prefers-reduced-motion: reduce` collapses the carousel to a vertical list of all six harnesses (today's grid, but in a single column).** The live nebula on the active slide still renders (the existing `<NebulaAvatar>` cascade already drops to the SVG fallback under `prefers-reduced-motion`); palette transitions become instant cuts. | Honour §32.6. The carousel motion (snap, momentum) is the only added motion in this plan; falling back to the today-shipped grid gives operators with vestibular sensitivity the same content surface without the kinetics. |
| 10 | **No new top-level route.** `/spawn` and `/spawn/[templateId]` are the only spawn routes; nothing else is added. The roster page (`spawn/page.tsx`) is rewritten to render the gallery wizard with no template; the wizard page (`spawn/[templateId]/page.tsx`) is rewritten to render the same wizard pre-confirmed at Step 1. **Both routes mount the same client `<Wizard>` component**, just with different initial reducer state. | Single source of truth for the surface; no shim component, no `<RosterCard>` left behind. Deletes ~170 LOC of `roster-card.tsx`. The §0.9.2 cleanup that removed the `<DeployModal>` is the precedent. |

---

## 3. Open architectural notes

Three points that aren't blocking but should be visible to the reviewer:

1. **The `<RosterCard>` component is deleted.** It was the active/locked variant container on the old roster grid. The carousel slide is similarly-shaped (avatar + spec sheet + footer button) but the layout is wide-not-tall (avatar centre, copy below) and the locked treatment is overlay-not-replacement. Easier to write fresh than to retrofit. Net diff: −167 LOC + ~250 LOC for `<HarnessSlide>` + `<HarnessCarousel>`.

2. **Step 1's "confirmed" pane after gallery selection is a compact horizontal card** — small (~100px) avatar + harness name + spec rows, all in one row, with the existing `[ EDIT ]` button on the right. Editing reverts the header kicker to `[ SELECT YOUR HARNESS ]` and rehydrates the gallery centred on whichever harness is currently confirmed. Steps 2+ stay confirmed during Step-1 edit until the user changes the harness — same cascade-invalidation logic the reducer already implements (lines 153–162 of `wizard.tsx`).

3. **The `<NebulaScene>` palette-lerp prop is the only shader-side change.** Today the scene takes a frozen `palette` prop; we add an optional `targetPalette` prop and a per-frame lerp inside `useFrame` driving the existing palette uniforms toward the target. When the carousel is idle (`activeHarness` stable for ≥400ms), `targetPalette === palette` and the scene runs as today. The lerp factor is clamped to `1 - exp(-dt * 8)` (frame-rate-independent ~125ms half-life). No new uniforms, no shader recompile, no behavioural change for the wizard's Step 1 *confirmed* render.

---

## 4. Phase plan

Six phases, monotonically increasing visibility. Each phase ends in a green type-check + lint + build; each phase is independently revertible.

### Phase 1 — Wizard reducer extension: gallery-mode + URL routing

**Goal:** Make `/spawn` (no template) render the wizard with Step 1 in a new `gallery` sub-state, navigable to `/spawn/{templateId}` on selection. Zero visual change yet — Phase 1 ships with the existing roster card UI re-used as the gallery's slide content, in a vertical stack. Proves the routing collapse before we change pixels.

**Files:**
- `frontend/src/app/(app)/spawn/page.tsx` — rewrite to `<Wizard initialMode="gallery" />` (no `templateId`)
- `frontend/src/app/(app)/spawn/[templateId]/page.tsx` — keep current shape; pass `initialMode="confirmed"`
- `frontend/src/components/spawn/wizard.tsx` — extend `WizardState` with a `mode: "gallery" | "confirmed"` discriminator on Step 1; add `selectHarness(templateId)` action that calls `router.replace(/spawn/${templateId})` and confirms Step 1
- `frontend/src/lib/spawn/harnesses.ts` — no change

**Risk:** Two mount paths for the same component are easy to drift. Mitigation: one `getInitialState({ mode, templateId, templates })` factory shared between both routes; tested by reading the URL on mount and confirming reducer state.

**Estimated LOC:** ~80 net (mostly mode discriminator + factory).

### Phase 2 — `<HarnessCarousel>` + `<HarnessSlide>` primitives (no scene wiring yet)

**Goal:** Land the horizontal scroll-snap carousel UI shell, with all six harness slides rendering today's `<AvatarFallback>` (no live nebula yet — Phase 3's job). Includes prev/next arrow buttons, numeric indicator (`1 / 6`), keyboard handling, IO-based active-slide tracking, and `prefers-reduced-motion` vertical-list fallback.

**Files (new):**
- `frontend/src/components/spawn/harness-carousel.tsx` (~120 LOC) — scroll-snap container, IO active-slide tracker, keyboard handler, arrow buttons. Exports `<HarnessCarousel value, onChange, harnesses />`.
- `frontend/src/components/spawn/harness-slide.tsx` (~150 LOC) — one slide: avatar slot, harness name (display), one-line description, spec sheet (HARNESS / VENDOR / ADAPTER / DEPLOY / STATUS / ETA), footer button (`› SELECT` for available, `[ LOCKED ]` for locked). Slot for avatar (passed in by parent — Phase 3 wires `<NebulaAvatar>` for active, `<AvatarFallback>` for inactive).

**Files (modified):**
- `frontend/src/components/spawn/wizard.tsx` — Step 1 *gallery* branch renders `<HarnessCarousel>`; *confirmed* branch keeps today's compact card.
- `frontend/src/components/spawn/roster-card.tsx` — **deleted**.

**Risk:** scroll-snap behaviour diverges across browsers (Safari iOS pre-16 has known quirks). Mitigation: use `scroll-snap-stop: always` + `overscroll-behavior-x: contain` on the wrapper; the IO-driven active detection is the source of truth, not the snap geometry. Manual smoke on Chromium / Firefox / Safari mac + iOS during phase close.

**Estimated LOC:** +270 new, −167 delete (roster-card), net +103.

### Phase 3 — Live nebula on active slide + palette crossfade

**Goal:** Promote the centred slide's avatar to the live `<NebulaAvatar>`; demote it back to the `<AvatarFallback>` when it leaves centre. As `activeHarness` changes, the live nebula's palette crossfades to the new harness's palette over ~400ms.

**Files:**
- `frontend/src/components/spawn/nebula-scene.tsx` — add optional `targetPalette` prop; `useFrame` lerps the palette uniforms toward target. When `targetPalette === palette` (default), behaviour is byte-identical to today.
- `frontend/src/components/spawn/nebula-avatar.tsx` — add optional `targetHarness` prop; passes the resolved palette to `<NebulaScene>`.
- `frontend/src/components/spawn/harness-carousel.tsx` — wire active-slide change → debounced `targetHarness` flip on the single canvas mounted on the centre slide.
- `frontend/src/components/spawn/harness-slide.tsx` — slide accepts `isActive: boolean`; when `true && !reduceMotion && webglOk`, render `<NebulaAvatar targetHarness={...} />`; otherwise `<AvatarFallback>`.

**Risk:** Brief double-canvas-mount during the active-slide handover. Mitigation: a single canvas lives at a fixed slot in the carousel viewport (overlaid on top of whichever slide is centred), not inside the slide DOM. The slide DOM only ever renders the SVG fallback; the canvas is a sibling absolute-positioned over the centre. **One canvas, page-wide, always.** This is the cleanest way to honour decision 21.

**Estimated LOC:** ~110 net (most of the work is the absolute-positioned canvas overlay).

### Phase 4 — Steps 2–5 RPG reskin

**Goal:** Re-flavour the four downstream steps without touching their state shape, validation, or RPC wiring.

**Step 2 — IDENTITY (callsign card):**
- Replace today's `<Field id="name" label="Agent name">` + plain `<Input>` with a **wide hero input**: large `text-2xl font-display uppercase` input, ghost-text placeholder rotating through three Star-Wars-flavoured callsigns (`obi-1`, `bb-9`, `kessel-runner` — purely cosmetic, not values), `tracking-widest`, hairline underline only (no box border). Live preview: as you type, a 64px `<NebulaAvatar>` next to the input renders the harness's avatar with the *current name* burned in below it (display-name only, no schema validation change).
- Footer keeps the existing `› CONFIRM` button + Zod `min(1).max(80)` validation verbatim.

**Step 3 — MODEL (faction × class):**
- Provider (today's `<ProviderField>` radio-style picker) becomes three **faction cards** in a row: each card has the provider name, a one-line philosophy blurb (`Anthropic — careful and considered`, `OpenAI — generalist with reach`, `OpenRouter — any model, any provider`), and a tiny harness-coloured glyph. Selection animates the unselected cards to `opacity-40`.
- Model name (today's `<Input>`) becomes a **class** field: hero input styled like Step 2's callsign, with model identifier as the value. Hint text below shows the canonical example for the chosen provider (`claude-opus-4-7` / `gpt-5` / `meta-llama/llama-4-405b-instruct`) — picked from a small per-provider lookup. Free text still accepted; the Zod schema is unchanged.
- API key (today's `<ApiKeyField>`) becomes a **sigil** field: same masked-input + show/hide pattern, but the field's icon is a small key-shaped glyph and the kicker reads `[ PROVIDE YOUR SIGIL ]`. The disclaimer copy ("API keys live as Fly app secrets…") is preserved verbatim.

**Step 4 — DEPLOYMENT (loadout panel):**
- Wrap the existing `<DeploymentConfigForm>` in a new outer frame: header reads `[ LOADOUT ]`, intro copy reframes the six fields as `[ THEATRE ]` (region) / `[ ARMOR ]` (size) / `[ SUPPLY ]` (volume) / `[ SQUAD ]` (replicas) / `[ DOCTRINE ]` (restart) / `[ MODE ]` (lifecycle). The form itself is unchanged (it's the shared component used by fleet inspector + bulk-apply). The reframe is achieved by replacing each section's `<Label>` text via a small mapping prop, **not** by editing the form component.
- Decision: extend `<DeploymentConfigForm>` with an optional `labelOverrides?: Record<DeploymentField, string>` prop, default empty (i.e. the fleet inspector + bulk-apply continue to render the canonical labels). The wizard passes the loadout-flavoured labels.

**Step 5 — REVIEW (character sheet):**
- Top: a **portrait card** — 180px live `<NebulaAvatar>` (the *second* canvas on the page; we mount it only after Step 1 has unmounted its canvas — same pattern the wizard already uses today since Step 1's canvas is conditional on `current === "harness"`), the agent's name in `text-3xl font-display uppercase`, and the harness's display name as a subtitle.
- Middle: a **stat block** — the existing `<SpecRow>` table, but visually grouped into three columns: `IDENTITY` (name), `INTELLIGENCE` (provider, model, api key), `LOADOUT` (region, size, volume, replicas, restart, lifecycle). Each column has its accent-coloured rule on top per the §34.1 step-accent map.
- Bottom: the **`READY TO LAUNCH`** panel per design-system §34.3 — full-width green-bordered card, `READY TO LAUNCH` kicker, large `› DEPLOY AGENT` button. The placement-check banner sits inside the panel above the button and gates `disabled` on the button.

**Files:**
- `frontend/src/components/spawn/wizard.tsx` — render-branch edits per step (mostly JSX, light helpers).
- `frontend/src/components/fleet/deployment-config-form.tsx` — additive `labelOverrides?` prop; default behaviour unchanged.
- `frontend/src/components/spawn/character-sheet.tsx` (new, ~100 LOC) — portrait + stat-block layout for Step 5.
- `frontend/src/components/spawn/ready-to-launch.tsx` (new, ~50 LOC) — the §34.3 panel.

**Risk:** Visual regression on the fleet inspector + bulk-apply (which share `<DeploymentConfigForm>`). Mitigation: `labelOverrides` defaults to empty; only the wizard passes a non-empty value. Verified by manual smoke on `/fleet` inspector pane.

**Estimated LOC:** ~250 net.

### Phase 5 — Polish + cleanup

**Goal:** Land the small finishes and delete dead code.

- Remove the now-orphaned roster grid layout helpers from `spawn/page.tsx`.
- Reconcile design-system.md §33.5 + §34 with the new shape: §33.5 collapses to "the spawn surface is the wizard; Step 1 is the harness gallery"; §34.1 unchanged; §34.3 cited verbatim by Phase 4's READY TO LAUNCH panel; §34.4's deferral note unchanged.
- Add a §34.5 (or amended §34.1) describing the gallery's a11y contract (keyboard, prefers-reduced-motion).
- Changelog entry.

**Estimated LOC:** ~30 net (mostly doc).

### Phase 6 — Live integration smoke

Per the v1 manual-smoke posture: `overmind start`, walk the full `/spawn` → carousel → confirm → name → model → loadout → review → deploy path with a real Fly token + real Hermes adapter. Verify keyboard, touch (Safari iOS), reduced-motion. Verify deep-link `/spawn/{templateId}` lands directly at Step 2.

---

## 5. Cross-cutting constraints (re-stated for review pressure)

- **One `<canvas>` page-wide, always.** Phase 3's absolute-positioned canvas overlay is the mechanism. Phase 5's review portrait re-mounts it after Step 1's gallery canvas unmounts — never both at once.
- **`prefers-reduced-motion` falls back to today's vertical roster grid.** Carousel snap, palette lerp, and any added animation are gated on `!reduceMotion`. Static palette + SVG fallback is the floor.
- **No `framer-motion`, no carousel lib.** CSS scroll-snap + IO + a small reducer. Bundle delta target: ≤ 8 KB gzip post-minify.
- **No `<DeploymentConfigForm>` rewrite.** Wizard reskin is achieved by an additive `labelOverrides?` prop. Fleet inspector + bulk-apply pick up no behavioural change.
- **No proto / schema / RPC change.** `spawnAgent`, `CheckDeploymentPlacement`, `DeployConfig`, `ListAgentTemplates` are all unchanged.

---

## 6. Estimated total cost

- Net new code: ~700 LOC across 6 phases.
- Net deleted code: ~170 LOC (`roster-card.tsx` + small spawn/page.tsx helpers).
- New deps: 0.
- New routes: 0.
- New RPCs: 0.
- New migrations: 0.

Realistic phase-by-phase: P1 (½d) → P2 (1d) → P3 (1d) → P4 (1½d) → P5 (½d) → P6 (½d). ≈ 5 person-days.

---

## 7. Out of scope (explicit deferrals)

- **Per-harness shape variation.** Decision 5 stays: shape shared, palette per harness. If we later want OpenClaw to read as a tighter cluster and DeepAgents as a looser swarm, that's a follow-up plan that touches `nebula-scene.tsx` shader + `mood-palettes.ts` schema.
- **Animated step transitions.** Steps 2–5 still appear/collapse via the same opacity-40 mechanism the wizard uses today. A horizontal-slide transition between steps is appealing ("the camera dollies along the spec sheet") but is plan-creep.
- **Audio cues.** A soft "lock-on" tone on harness select would land the RPG metaphor harder, but is out of scope for the v1 demo. The `/presentation` deck's audio scaffold (0.10.5) is the precedent for how to add this later cheaply.
- **Spawn-N from the gallery.** Decision 11 still applies. If the carousel later grows a "spawn ×3" affordance, it lives next to `› SELECT`, not inside the loadout step.
- **Mobile-first.** The carousel works on touch (CSS scroll-snap is touch-native) but this surface is still primarily a desktop/laptop demo experience. Mobile spec sheet scaling beyond what Tailwind's existing breakpoints give us is not in scope.

---

## Open questions for operator review

1. **Routing collapse — confirm direction.** This plan picks "single wizard, two URL entry points" (Decision 1): `/spawn` lands you at gallery-mode Step 1; `/spawn/{templateId}` lands you at confirmed-Step-1 ready for Step 2. The alternative is "keep two pages, prettier roster": rebuild the roster as a horizontal carousel that still lives at `/spawn`, then hard-navigate to `/spawn/{templateId}` for the wizard. The two-page version preserves a clean step boundary but loses the "swipe → name → ..." feel — there's a page-load between the swipe and the name field. **Confirm: collapse to one wizard, or keep two pages?**

2. **Per-harness shape variation — defer or include?** Decision 3 keeps shape shared and varies palette + accent only. The user copy says "the animation/swarm slightly changes shape and/or colour" — palette covers "colour" cleanly, but the *shape* claim is half-honoured. Including per-harness shape is one extra vec3 of palette schema (rotation, particle-count multiplier, sigma) plus a uniform branch in the fragment shader — feasible but doubles Phase 3's LOC. **Confirm: ship Phase 3 with palette-only and add shape later, or fold shape into Phase 3?**

3. **Locked harness affordance — overlay or grayed-card?** Decision 4 picks overlay (`[ LOCKED ]` banner + `disabled` button + reduced opacity), reachable in the carousel. The alternative is to skip locked harnesses entirely on swipe (snap to the next available) and show them only as faint thumbnails in a "post-v1 roster" strip below. The overlay version is louder demo-ware ("look at all six harnesses we'll support"); the skip version is cleaner UX but undersells the breadth of the platform. **Confirm: overlay (loud) or skip-with-strip (clean)?**

4. **Step 2's name field — ghost-text suggestions or empty placeholder?** The plan picks rotating Star-Wars ghost text (`obi-1`, `bb-9`, `kessel-runner`) for flavour. If that's too on-the-nose for the hackathon demo (mixed audiences), the alternative is a static `e.g. research-bot` (today's placeholder) or a generic `your operator's callsign…`. **Confirm: themed ghost text, generic ghost text, or today's placeholder?**

5. **Step 4 loadout label overrides — full RPG vocabulary or reduced?** The plan proposes `THEATRE / ARMOR / SUPPLY / SQUAD / DOCTRINE / MODE` as field-label overrides. There's a tension: those words are great for the metaphor but worse for **scannability** when an operator returns to edit Region two months later and forgets that "theatre" meant region. The middle ground: keep canonical labels (REGION / SIZE / VOLUME / ...), only re-flavour the *kicker* on the step (`[ LOADOUT ]`) and the intro copy. **Confirm: full label rename, kicker-only reflavour, or both with the canonical label as a hint underneath?**

6. **Step 5's portrait — second canvas, second SVG, or static screenshot of Step 1's canvas?** The plan picks "second canvas, mounted only after Step 1's canvas has unmounted" (one-canvas-at-a-time, two over the lifetime of the wizard). The alternative is to render the SVG fallback even on the review screen (zero GPU pressure on the demo machine, but a less impressive review screen). The third alternative is a `toDataURL()` snapshot of Step 1's canvas right before it unmounts and rendering it as an `<img>` on review. The snapshot path is the safest visually but adds a one-frame canvas-readback that costs ~10ms and a `<canvas>` taint risk. **Confirm: live canvas, SVG, or snapshot?**

7. **Header kicker on Step 1 — `[ SELECT YOUR HARNESS ]` or something else?** The plan picks that string. Alternatives: `[ SELECT YOUR OPERATOR ]`, `[ HARNESS REGISTRY ]`, `[ CHARACTER SELECT ]`, `[ ROLL CALL ]`. **Confirm or propose.**

8. **`READY TO LAUNCH` panel — green border per §34.3, or something more theatrical?** Today's wizard has a small CTA. §34.3 is already a green-bordered panel with the kicker. The user's RPG framing might call for a heavier treatment — a slow ambient pulse on the border, a confirmation modal step ("You are about to deploy `<name>`. Confirm? [Y/N]"). The plan picks §34.3 verbatim (no extra modal — keeps the deploy moment instant). **Confirm: ship §34.3 as-spec, or add a final confirmation modal?**

9. **Phase ordering — ship the carousel in Phase 2 even though steps 2–5 still look old?** The plan ships the carousel (most-visible change) in Phases 1–3 *before* the steps 2–5 reskin (Phase 4). That means halfway through the rollout the surface is "carousel + legacy form," which is internally inconsistent for a couple of days. The alternative is to ship Phase 4's reskin first and Phases 1–3's carousel last, so the surface is always coherent. **Confirm phase order, or invert?**

10. **Do we want a fleet-page "spawn another like this" entry point in the same patch?** §34.4 reserves Spawn-N for the fleet view. If the gallery is now the canonical entry, a "duplicate this agent" button on a fleet row that pre-confirms Steps 1–4 and drops you at Step 5 is a small additive surface that lands extra demo punch. **Confirm: include in this plan, file separately, or skip.**

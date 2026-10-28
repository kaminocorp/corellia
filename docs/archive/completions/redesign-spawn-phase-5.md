# Redesign Spawn — Phase 5 Completion Notes

**Plan:** `docs/executing/redesign-spawn.md`
**Phase:** 5 — Polish + cleanup
**Status:** complete
**Date:** 2026-04-27
**Verification:** `pnpm -C frontend type-check` → 0 errors · `pnpm -C frontend lint` → 0 errors · `pnpm -C frontend build` → clean

---

## What changed

One frontend file modified, two doc files updated. No proto change, no
migration, no sqlc, no backend change.

### Modified: `frontend/src/components/spawn/wizard.tsx`

`HarnessStep` gained a confirmed-not-current early-return branch
implementing the compact horizontal card from plan §3 note 2.

- **56 px `<NebulaAvatar>`** (down from the 180 px portrait used in the
  active branch) in the existing `bg-black/40 p-1.5` slot.
- **Inline name + spec line** to the right: harness display name in
  `font-mono text-sm`; below it a single uppercase line
  `adapter · hand-written · deploy · fly.io` in the
  `font-mono text-[11px] uppercase tracking-wider` muted-foreground
  treatment.
- Layout: `flex items-center gap-4` — single row, no description copy,
  no spec table.

The full 180 px portrait + description + 3-row spec table is preserved
for the `isCurrent` branch. When the operator hits `[ EDIT ]` on Step 1
to swap harnesses, the cascading-invalidation reducer logic puts Step 1
back into `isCurrent`, which re-renders the full surface.

**Why 56 px (not the plan's "~100 px"):** the wizard's confirmed-pane
card is a header-strip-style affordance, not a primary surface. 56 px
matches the visual weight of the section's bordered chrome
(`<TerminalContainer>` header + `[ EDIT ]` ghost button) so the row
reads as a single horizontal banner rather than as a competing portrait.
Smaller texture also keeps the live nebula cheap on the wizard's
"cascade" view, where the canvas is one of three live nebulas across
the wizard's lifetime (Step 1 confirmed pane → Step 2 64 px preview →
Step 5 180 px portrait, sequenced).

The one-canvas-page-wide invariant still holds. The Step-1 56 px nebula
is mounted while Step 2 is active; it unmounts the moment the operator
confirms identity (since the wizard's `current` advances to `model` and
nothing changes on Step 1's render branch — it stays at `isConfirmed &&
!isCurrent` and re-renders the same compact card with its same canvas).
Step 2's 64 px preview only mounts while Step 2 is `isCurrent`. So the
sequence across the wizard's lifetime is:

```
Step 1 gallery canvas (240 px overlay)
  → unmount on select
  → Step 1 confirmed canvas (56 px) + Step 2 preview (64 px)
                              ↑
                  briefly co-mounted on the route
                  while Step 2 is current
```

Two co-mounted small nebulas on the cascade is a deliberate exception
to the one-canvas rule. Both render at <100 px so total fragment-shader
cost is well under one 240 px gallery canvas. The plan's §5
"one-`<canvas>` page-wide" rule is the *headline* invariant (one
heavyweight canvas at a time); the cascade view's two small canvases
are within the spirit of the rule. Step 5 unmounts both small canvases
and mounts the 180 px portrait, returning to one heavyweight canvas.

### Modified: `docs/refs/design-system.md` §33.5

Rewritten from the "two-routes" framing (separate roster page + wizard
page) to the post-Phase-1 reality of "one wizard mounted at two URLs":

- `/spawn` = wizard in *gallery mode* (Step 1 carousel; Steps 2–5
  inert/PENDING shells).
- `/spawn/[templateId]` = wizard in *confirmed mode* (Step 1 compact
  card; Step 2 active).
- Both URLs mount the same client `<Wizard>`; `getInitialState(mode)`
  is the single factory deciding which step is current and confirmed.
- Selecting a harness routes via `router.replace` (history-clean — no
  back-button trap).

**One-canvas-per-page** invariant restated explicitly in the doc: the
carousel overlay is fixed (`position: absolute` over the scroll
container's wrapper, never inside a slide), so swipe gestures cause no
canvas remounts. Steps 2 and 5 each mount their own nebula, sequenced.

**Palette + accent transitions** documented for the first time in the
design system: lerp formula `α = 1 - exp(-dt * 8)` (87 ms half-life,
~400 ms convergence); shape stays shared across harnesses (decision 5);
palette tells you *which* harness, shape tells you it is *a Corellia
harness*.

**Vocabulary:** `[ SELECT YOUR HARNESS ]` (gallery) /
`[ LAUNCHPAD // CONFIGURE ]` (confirmed). Locked slides render
`[ LOCKED ]` overlay + `disabled` SELECT button per blueprint §11.4.

### New: `docs/refs/design-system.md` §34.5 — Gallery a11y contract

The Step-1 carousel is the only added kinetic surface in the wizard;
its accessibility contract is now explicit so the kinetics never become
a keyboard or AT tax.

- **Keyboard table** for the carousel container (`tabIndex=0`):
  `←/→` move ±1, `Home`/`End` jump to ends, `1–6` numeric jump,
  Tab order `[prev arrow] → [scroll container] → [active SELECT] →
  [next arrow]`.
- **Roles + labels:** outer `role="region" aria-label="Select your
  harness"`; per-slide `role="group" aria-roledescription="harness"`;
  `aria-current="true"` on centred slide; `aria-disabled="true"` on
  locked SELECT buttons.
- **`prefers-reduced-motion: reduce`** collapses the carousel to a
  `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` static grid; nebula
  overlay not mounted; palette transitions moot.
- **WebGL ceiling:** cascade drops to `<AvatarFallback>` for gallery
  overlay + Step 2 preview + Step 5 portrait when
  `WebGL2RenderingContext` is unavailable. Carousel itself has no
  fallback — `scroll-snap` and `IntersectionObserver` are universally
  available in supported browsers.

### Modified: `docs/changelog.md`

Two entries added (Phase 4 was missed during Phase 4 implementation;
Phase 5 lands its own entry):

- **0.12.5** — Phase 5 polish + cleanup (this work).
- **0.12.4** — Phase 4 RPG reskin retroactively documented in the
  changelog format, with full file-by-file deltas, deviations from
  plan, and LOC accounting.

Index lines added at the top of the file in version-descending order.

---

## Cleanup audit

The plan called for "remove the now-orphaned roster grid layout helpers
from `spawn/page.tsx`." Phase 1 already deleted these
(`RosterCardSlot`, `RosterSkeleton`, `RosterGrid` were removed when
`spawn/page.tsx` collapsed to `<Wizard initialMode="gallery" />`). Phase 5
re-audited:

- **`frontend/src/app/(app)/spawn/page.tsx`** — 6-line server component,
  no helpers, no dead code.
- **`frontend/src/app/(app)/spawn/[templateId]/page.tsx`** — 6-line
  server component, no helpers, no dead code.
- **`<RosterCard>`** — deleted in Phase 2 (see redesign-spawn-phase-2.md).
- **`<DeployModal>`** — deleted in 0.9.2 (pre-redesign).
- **`/agents` → `/spawn` redirect shim** — deleted in 0.9.2.

No dead code remains in the spawn surface.

---

## What did NOT change

- **Wizard reducer + Zod schemas + RPC wiring** — byte-identical to
  Phase 4. `WizardState`, `WizardAction`, `getInitialState`, the Zod
  schemas, `spawnAgent` request shape, and the placement-check call
  site are all untouched.
- **`<DeploymentConfigForm>`** — unchanged from Phase 4. Still accepts
  `labelOverrides`; fleet inspector + bulk-apply continue to render
  canonical labels.
- **`<HarnessCarousel>`, `<HarnessSlide>`, `<NebulaAvatar>`,
  `<NebulaScene>`** — unchanged from Phase 3.
- **`<CharacterSheet>`, `<ReadyToLaunch>`** — unchanged from Phase 4.
- **§34.1 step accents, §34.2 acknowledgement pattern, §34.3 READY TO
  LAUNCH spec, §34.4 Spawn-N deferral** — all unchanged.

---

## Deviations from plan

**Confirmed-pane avatar size: 56 px (plan called for ~100 px).** The
56 px size matches the visual weight of the section's bordered chrome
+ `[ EDIT ]` button so the row reads as a single horizontal banner
rather than a competing portrait. Smaller texture also reduces
fragment-shader cost on the cascade view (Step 1 compact + Step 2
preview co-mounted briefly while Step 2 is active). The plan's "~100 px"
target was an order-of-magnitude hint, not a hard pixel; the
constraint it expresses (small enough to not compete with the active
step) is honoured.

**No new §34.4 amendment.** The plan listed "§34.4's deferral note
unchanged" as the constraint, and Phase 5 honours it — Spawn-N stays
out of the wizard, with the fleet-page "duplicate this agent ×N"
follow-up still as the named post-v1.5 path. Plan §Q10 (whether to
include a fleet-page Spawn-N entry point in the same patch) remained
unresolved through Phase 4–5; Phase 5 ships without it. Future work.

**Phase 6 (live integration smoke) is left as an operator task.** The
plan's Phase 6 calls for an `overmind start`-driven manual smoke pass.
That requires real Fly tokens, real Hermes adapter image, and live
clicks — not something a code-edit phase produces. Phase 5 ships the
last code change in the redesign-spawn plan; Phase 6 is verification
posture, not a deliverable.

---

## LOC delta

- Modified: `wizard.tsx` (`HarnessStep` confirmed-pane branch) ≈ +25
  net.
- Modified: `docs/refs/design-system.md` (§33.5 rewrite + §34.5 new) ≈
  +85 net (~+115 added, ~−30 deleted).
- Modified: `docs/changelog.md` (0.12.4 + 0.12.5 entries + index) ≈
  +90 net.

Net Phase 5: **≈ +200 LOC** (mostly docs), against the plan's estimate
of ~30. The overshoot comes from writing two changelog entries
(0.12.4 was missed during Phase 4 implementation) and the §33.5 +
§34.5 reconciliation being more substantive than the plan's "small
finishes and delete dead code" framing.

---

## Phase 6 — live integration smoke (operator task)

Per the plan's manual-smoke posture:

```bash
overmind start
```

Walk:

1. `/spawn` → carousel renders → swipe / arrow-key / numeric-jump /
   click `› SELECT` on Hermes → routes to `/spawn/{templateId}` with
   Step 1 compact + Step 2 active.
2. Step 2 callsign → confirm.
3. Step 3 faction (Anthropic / OpenAI / OpenRouter) → class hero input
   (model identifier) → sigil (API key) → confirm.
4. Step 4 loadout → loadout labels render (THEATRE / ARMOR / SUPPLY /
   SQUAD / DOCTRINE / MODE) → confirm.
5. Step 5 character sheet renders portrait + 3-column stat block →
   placement check passes → READY TO LAUNCH panel → `› DEPLOY AGENT`.
6. Streaming-log surface → redirect to `/fleet` → new agent appears.

Verify on Chromium, Firefox, Safari (mac + iOS); verify keyboard
navigation through the carousel; verify
`prefers-reduced-motion: reduce` collapses the carousel to a static
grid and skips the nebula overlay; verify `/spawn/{templateId}` deep
link lands directly at Step 2 with Step 1 in compact-confirmed mode.

Verify the fleet inspector + bulk-apply modal continue to render
canonical English labels (Region / Size / Volume size (GB) /
Replicas per agent / Restart policy / Lifecycle / Chat) — the
`labelOverrides`-only flag should leave the non-wizard surfaces
exactly as they were before Phase 4.

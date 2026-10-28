# Redesign Spawn — Phase 2 Completion Notes

**Plan:** `docs/executing/redesign-spawn.md`
**Phase:** 2 — `<HarnessCarousel>` + `<HarnessSlide>` primitives (no scene wiring yet)
**Status:** complete
**Date:** 2026-04-27
**Verification:** `pnpm type-check` → 0 errors · `pnpm lint` → 0 errors

---

## What changed

### New: `frontend/src/components/spawn/harness-slide.tsx`

The atomic card primitive for one harness — replaces `<RosterCard>` in both
the carousel and the reduced-motion grid.

**Props:** `harness: HarnessEntry`, `template?: AgentTemplate` (undefined =
locked), `isActive: boolean`, `onSelect: (templateId: string) => void`.

**Phase 2 behaviour of `isActive`:** controls the `tabIndex` of the `› SELECT`
button only. `tabIndex={0}` when active (the visible slide); `tabIndex={-1}`
when inactive (scrolled off-screen, must not be in the Tab order). Phase 3 will
use `isActive` to swap the avatar from `<AvatarFallback>` to an overlaid
`<NebulaAvatar>` canvas.

**Locked treatment (decision 4):** `[ LOCKED ]` overlay (`position: absolute`)
over the avatar area + `disabled` + `aria-disabled` `› SELECT` button (not
hidden — the button is rendered but inert). Locked slides also render at 70%
opacity.

**Spec sheet rows:** available → `HARNESS / ADAPTER / DEPLOY`; locked →
`VENDOR / STATUS / ETA`. Matches the old `<RosterCard>` split.

**No `<NebulaAvatar>` in Phase 2.** All slides use `<AvatarFallback>`. The
`isActive` hook point is in place so Phase 3 can overlay the canvas without
touching the slide's internal structure.

---

### New: `frontend/src/components/spawn/harness-carousel.tsx`

Horizontal scroll-snap carousel implementing decisions 2, 8, and 9.

**Layout:** `scroll-snap-type: x mandatory` container; each slide wrapper is
`width: 100% flex-shrink-0 scroll-snap-align: center`. Full-width slides in
Phase 2; peek effect (narrower slides + container padding) lands in Phase 3
alongside the nebula overlay — both are a CSS change to the slide wrapper.

**Active-slide tracking:** `IntersectionObserver` with `root = container` and
`threshold = 0.5`. With full-width slides, only the centred slide is ≥ 50%
intersecting with the container viewport. This is the source of truth — not the
scroll position, which diverges on Safari iOS < 16 with certain snap
configurations. `scroll-snap-stop: always` and `overscroll-behavior-x: contain`
are set for cross-browser safety.

**Navigation:**
- Prev / Next `<button>` elements: `disabled` at endpoints, visible 40% opacity.
- Keyboard on the scroll container (`tabIndex={0}`): `ArrowLeft / Right` move ±1;
  `Home / End` jump to endpoints; `1–6` jump to slide by number (decision 8).
- Dot indicators: decorative / mouse-only (`aria-hidden` on container,
  `tabIndex={-1}` on each button). Arrow keys + prev/next buttons cover
  keyboard navigation redundantly.

**a11y:**
- Outer `<section role="region" aria-label="Select your harness">` (decision 8).
- Each slide wrapper: `role="group" aria-roledescription="harness"
  aria-current="true"` on the active slide.
- Tab order: `[prev button]` → `[scroll container]` → `[active SELECT button]`
  → `[next button]`. Non-active SELECT buttons are `tabIndex={-1}`.

**`prefers-reduced-motion` fallback (decision 9):** `useReducedMotion` hook
(inline, no external dep). When true, renders the same `grid-cols-1 /
md:grid-cols-2 / xl:grid-cols-3` grid as Phase 1 — all six `<HarnessSlide>`
cards at once, no scroll-snap.

**`useReducedMotion` implementation note:** the initial state is read via a
`useState` lazy initializer (`typeof window !== "undefined" && window.matchMedia(...)`)
rather than a synchronous `setReduce` inside a `useEffect` body. This satisfies
the project's `react-hooks/set-state-in-effect` lint rule, which requires
`setState` to only be called inside callbacks (not the synchronous effect body).
The effect itself only adds the change listener.

**No new dependencies.** CSS scroll-snap + IO + ~150 LOC. Bundle delta is
within the ≤ 8 KB gzip target.

---

### Deleted: `frontend/src/components/spawn/roster-card.tsx`

`<RosterCard>` is superseded by `<HarnessSlide>`. The Phase 1 import in
`wizard.tsx` is replaced by `<HarnessCarousel>`.

**LOC delta:** −167 (`roster-card.tsx`) + ~130 (`harness-slide.tsx`) + ~175
(`harness-carousel.tsx`) = net +138 (≈ plan estimate of net +103 before comments).

---

### Modified: `frontend/src/components/spawn/wizard.tsx`

Three changes only:

1. `import { RosterCard }` → `import { HarnessCarousel }` (line 16).

2. `GalleryWizardShell` gains two hooks (`useState<string>` for `activeKey`,
   `useRouter` for `router.replace`) and replaces the `<GalleryHarnessStep>`
   call with `<HarnessCarousel harnesses={HARNESSES} templates={templates}
   activeKey={activeKey} onActiveChange={setActiveKey} onSelect={...} />`.
   The `onSelect` callback calls `router.replace(\`/spawn/${templateId}\`)`,
   which remounts the Wizard in `confirmed` mode with Step 1 pre-confirmed.

3. `GalleryHarnessStep` function deleted (it was the Phase 1 placeholder grid;
   `HarnessCarousel`'s reduced-motion branch does the same job).

TypeScript note: `useState(HARNESSES[0].key)` infers the narrow `HarnessKey`
union type, which is incompatible with `onActiveChange: (key: string) => void`
in `HarnessCarouselProps`. Fixed with explicit `useState<string>`.

---

## Deviations from plan

**Full-width slides, no peek effect in Phase 2.** Decision 2 calls for slides
at some sub-100% width so adjacent slides peek. The peek effect is a CSS-only
concern (slide wrapper `width: ~85%` + container `scroll-padding-inline`). It
was deferred to Phase 3 because:
- It couples naturally with the nebula overlay (both touch the slide wrapper
  width and the canvas's absolute-positioned bounds).
- Phase 2 slides use `<AvatarFallback>` everywhere; the peek of a static SVG
  fallback is less compelling than the peek of the live nebula.
- Full-width slides are already well-tested cross-browser; peek geometry has
  more Safari quirks to validate.

The Phase 3 entry point: change each slide wrapper from `w-full` to `w-[85%]`
and add `scroll-padding-inline: 7.5%` (or equivalent Tailwind) to the container.
No other structural change needed.

---

## Phase 3 entry points

- **`HarnessSlide`**: the avatar section already has `position: relative`. Phase 3
  places a `<NebulaAvatar>` as a `position: absolute` sibling inside
  `HarnessCarousel` (not inside `HarnessSlide`) overlaid on the centred slide's
  avatar rect. `isActive` is already threaded and ready to drive visibility.
- **`harness-carousel.tsx`**: add `targetPalette` prop to the nebula overlay;
  wire `activeKey → debounced palette change`. The `GalleryWizardShell` in
  `wizard.tsx` may need a `targetHarness` → `activeKey` binding for the overlay.
- **`nebula-scene.tsx`**: add optional `targetPalette` prop; `useFrame` lerps
  palette uniforms toward target at `1 - exp(-dt * 8)` (plan §3 note 3).
- **Slide width**: change `w-full` → `w-[85%]` on the slide wrapper div;
  add `scroll-padding-inline` to the container. Validate on Safari iOS.

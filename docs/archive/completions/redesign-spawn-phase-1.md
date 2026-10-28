# Redesign Spawn — Phase 1 Completion Notes

**Plan:** `docs/executing/redesign-spawn.md`
**Phase:** 1 — Wizard reducer extension: gallery-mode + URL routing
**Status:** complete
**Date:** 2026-04-27
**Verification:** `pnpm type-check` → 0 errors · `pnpm lint` → 0 errors

---

## What changed

### `frontend/src/app/(app)/spawn/page.tsx` — rewritten

Old: a standalone client page (`"use client"`) that fetched all agent templates
itself, joined them against `HARNESSES`, and rendered a `<TerminalContainer>` +
`<RosterGrid>` with six `<RosterCard>` components.

New: a server component (no `"use client"` needed — it just renders a client
child) that delegates everything to `<Wizard initialMode="gallery" />`. The
template fetch and the roster grid now live in the shared Wizard, which is the
single source of truth for both `/spawn` and `/spawn/[templateId]`.

The old header copy (`[ LAUNCHPAD ]`, `N AVAILABLE`, `M LOCKED`), the loading
skeleton, and the `RosterCardSlot` / `RosterSkeleton` / `RosterGrid` helpers
are deleted. Their jobs are absorbed by `GalleryWizardShell` inside `wizard.tsx`.

### `frontend/src/app/(app)/spawn/[templateId]/page.tsx` — one-liner

Added `initialMode="confirmed"` to `<Wizard templateId={templateId} />`.
No structural change — still a server component that awaits params and passes
them to the client Wizard.

### `frontend/src/components/spawn/wizard.tsx` — extended

**`WizardState`** gains `harnessMode: "gallery" | "confirmed"`. Persisted in
the reducer so future phases can interrogate state without inspecting the URL.

**`initialState()` → `getInitialState(mode)`**: the old zero-arg factory is
replaced by a one-arg factory accepted directly by `useReducer`'s `init`
parameter (`useReducer(reducer, initialMode, getInitialState)`). This is the
shared entry point the plan called for — both route paths call the same factory,
eliminating the risk of drift between the two mount paths.

- `gallery` → `{ current: "harness", confirmed: new Set(), harnessMode: "gallery" }`
  (Step 1 active, nothing confirmed)
- `confirmed` → `{ current: "identity", confirmed: new Set(["harness"]), harnessMode: "confirmed" }`
  (Step 1 already confirmed, Step 2 active)

**`FetchState`** gains `{ kind: "ready-gallery"; templates: AgentTemplate[] }`.
The gallery fetch loads all templates (same RPC as before — `listAgentTemplates`
— just stored differently). The confirmed fetch finds the matching template by
id (unchanged from before).

**`Wizard` component** signature: `{ templateId?: string; initialMode: "gallery" | "confirmed" }`.
The `useEffect` branches on `initialMode` before doing template lookup, so
gallery mode never tries to find a template by id. An early `if (fetchState.kind === "ready-gallery")` return renders `<GalleryWizardShell>` before the confirmed-mode
deploy-check and step-render logic.

**`GalleryWizardShell`** (new): the gallery-mode page. Header shows
`[ SELECT YOUR HARNESS ]` (per decision 5 of the plan). Step 1 is a
`<TerminalContainer>` with `meta="ACTIVE"` wrapping `<GalleryHarnessStep>`.
Steps 2–5 are rendered as `pointer-events-none opacity-40 inert`
`<TerminalContainer>` shells — `meta="PENDING"`, no body content — so the
operator sees the shape of the full wizard flow before selecting.

**`GalleryHarnessStep`** (new): the roster grid inside Step 1. Identical logic
to the old `RosterCardSlot` / `RosterGrid` helpers in `spawn/page.tsx` —
joins `templates` against `HARNESSES` by `name.toLowerCase() === harness.key`,
renders `<RosterCard kind="active">` when matched and `<RosterCard kind="locked">`
otherwise. Selecting a harness navigates via the existing `<Link href={/spawn/${template.id}}>` inside `<RosterCard>`, which remounts the Wizard with `initialMode="confirmed"`.

`import { RosterCard }` added to `wizard.tsx`; `roster-card.tsx` is **not
deleted** in Phase 1 (that's Phase 2, when the carousel replaces the grid and
`<RosterCard>` is no longer needed).

---

## What did NOT change

- `roster-card.tsx` — untouched (deleted in Phase 2)
- `harnesses.ts` — untouched (plan: no change)
- `nebula-avatar.tsx`, `nebula-scene.tsx` — untouched (Phase 3)
- All reducer actions (`confirm`, `edit`, `setField`) — untouched
- All wizard steps (Steps 2–5, `StepShell`, `StepBody`, `DeployLog`) — untouched
- Proto, backend, migrations, env vars — zero change (FE-only phase)

---

## Routing behaviour after Phase 1

| URL | What renders |
|-----|-------------|
| `/spawn` | Wizard in gallery mode: `[ SELECT YOUR HARNESS ]` header, Step 1 active with 6 harness cards, Steps 2–5 inert |
| `/spawn/{templateId}` | Wizard in confirmed mode: Step 1 confirmed (compact harness card), Step 2 active (identity form) |

Deep-linking `/spawn/{templateId}` still works — it delivers the operator
directly to Step 2, which was also the pre-Phase-1 behaviour (Step 1 had a
`› CONFIRM` button the operator had to click; now Step 1 is pre-confirmed since
the selection happened in the gallery).

---

## Deviations from plan

None. The plan called for "existing roster card UI re-used as the gallery's
slide content, in a vertical stack" — that is exactly what `GalleryHarnessStep`
delivers. The `selectHarness(templateId)` action noted in the plan is not added
to the reducer in Phase 1 because Phase 1 uses Link-based navigation from
`<RosterCard>`, which naturally causes a remount with the right `initialMode`.
The action (and `router.replace`) lands in Phase 2 when the carousel replaces
the grid and navigation must be intercepted before the Link fires.

---

## Phase 2 entry points

- **`GalleryWizardShell`** — replace `<GalleryHarnessStep>` with `<HarnessCarousel>`;
  pass a `selectHarness(templateId: string)` callback that calls `router.replace`
  and can optionally dispatch a `selectHarness` reducer action to update `harnessMode`.
- **`GalleryHarnessStep`** — deleted when `<HarnessCarousel>` lands.
- **`roster-card.tsx`** — deleted in Phase 2 after the carousel's `<HarnessSlide>`
  absorbs its role.
- **`nebula-scene.tsx`** — Phase 3: add optional `targetPalette` prop for
  palette crossfade on carousel swipe.

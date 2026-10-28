# Tools Governance — Phase 6 Completion Notes

**Plan:** `docs/executing/tools-governance.md`
**Phase:** 6 — Org-curation page
**Status:** complete
**Date:** 2026-04-27
**Verification:**
- `pnpm -C frontend type-check && pnpm -C frontend lint && pnpm -C frontend build` → all green
- `cd backend && go vet ./... && go test ./...` → all green (cached; no BE changes this phase)
- `pnpm proto:generate` → no diff (no proto changes this phase)
- `cd backend && sqlc generate` → no diff (no SQL changes this phase)

---

## What landed

The first surface in the **org-settings family**: a route at
`/settings/tools` where org-admins curate which toolsets agents in
their workspace may equip when spawned. Disabled toolsets disappear
from the spawn wizard's TOOLS step (Phase 4 already wires the
`enabledForOrg` filter at the row level — Phase 6 just gave operators
the knob that drives that flag).

Pure frontend work. No proto, no migration, no sqlc, no backend code:
the five RPCs Phase 6 consumes (`listAgentTemplates`,
`getOrgToolCuration`, `setOrgToolCuration`) all shipped in earlier
phases. Phase 6 wires them to a UI.

### `frontend/src/app/(app)/settings/tools/page.tsx` — new

Server component shell. Exports `metadata.title = "Tools — Settings —
Corellia"` and renders `<OrgToolCuration>`. The auth + org bootstrap
lives in `(app)/layout.tsx`, so by the time the client component mounts
the `useUser()` context is populated and we don't need a server-side
session lookup. The plan's "server component reads org_id from session"
sentence read against an earlier auth shape; the live
`(app)/layout.tsx` populates `UserProvider` with `{ user, org }`
before mounting any route children, so a thin server-component shell
that defers to the client is the consistent pattern (matches
`/spawn/page.tsx` → `<Wizard>`).

### `frontend/src/components/settings/org-tool-curation.tsx` — new (~220 LOC)

The page body. Three responsibilities, in order:

- **Role gate.** `useUser().user.role !== "admin"` short-circuits to a
  failed-accent `<TerminalContainer title="ADMIN ONLY">` with a
  shield-alert glyph and a "ask an admin" message. The BE's
  `SetOrgToolCuration` handler (`tools_handler.go:122`) is the actual
  security boundary — this gate is UX, not security. No 403 redirect:
  the operator landing on the URL needs to know *why* they can't see
  the page, not be silently kicked.
- **Catalog discovery.** v1.5 has no `ListHarnessAdapters` RPC; the
  page derives the in-org adapter set from `listAgentTemplates` (each
  template carries `harnessAdapterId` since 0.13.3) and dedupes. For
  each unique adapter, calls `getOrgToolCuration(harnessAdapterId)` in
  parallel. v1.5 ships one Hermes adapter so the typical case is a
  single section; when v2 introduces a second the same code renders
  two sections without change.
- **Save model.** Per-tool optimistic UI + single-flight latch.
  Toggling a row immediately patches the local `enabledForOrg` flag,
  fires `setOrgToolCuration`, and on response replaces the row with
  the canonical server-returned `Tool`. On error, the optimistic patch
  is reverted and a sonner toast surfaces `ConnectError.message`. The
  toggle button is disabled while a save is in flight, so a contested
  row can't stack writes — no debounce timer needed.

### Per-row layout

Each row is a `flex` container with the toolset's display name +
category pill on the left, scope-shape preview + required-credential
hint underneath, and the toggle Button on the right.

The toggle vocabulary follows §33.10 (added to `design-system.md` in
this phase): `[ ✓ ENABLED ]` (default variant) / `[ DISABLED ]`
(outline variant) / `[ … SAVING ]` (disabled, mid-flight). OAuth-only
toolsets (i.e. `spotify` per the v1.5 catalog seed) render a disabled
toggle plus a `lock-icon · OAUTH · v1.6` chip rather than a fake
clickable affordance — blueprint §11.4 ("deferred features stub as
real interface implementations") applied at the row level.

### `frontend/src/components/app-sidebar.tsx` — extended

A `Tools` entry now appears in the `[ MODULES ]` group between `Fleet`
and `Settings`, but **only when `user.role === "admin"`**. The flat
`items` list became three concatenations (`baseItems`, `adminItems`,
`trailingItems`) to keep ordering deterministic without a `.filter()`
on a mixed list. Existing entries (Dashboard / Spawn / Fleet / the
`Settings (Soon)` placeholder) are unchanged.

### `docs/refs/design-system.md` — §33.10 added

New page-motif entry under `## 33. Page Motifs (per route)`,
documenting the surface for future contributors:

- atmosphere, motif, color, toggle vocabulary, save model
- the `listAgentTemplates`-derived adapter discovery model and what
  happens when v2 introduces a second adapter
- the relationship to /spawn's TOOLS step (org-curated-out → hidden,
  OAuth-only → locked)
- the sidebar gating model and the BE-as-true-boundary note

The section number reuses the §33 Page Motifs slot; §35 ("Status
Vocabulary for Agents") was already taken before the plan was drafted,
and the page-motif family is the closer fit anyway.

---

## Deviations from plan

1. **No new sidebar group; flat top-level entry.** Plan §3 Phase 6
   deliverable 2 says "new 'Tools' item *under Settings*". The current
   sidebar (`app-sidebar.tsx`) is a single flat `[ MODULES ]` group —
   there is no nested "Settings > Tools" hierarchy primitive in the
   `<Sidebar>` shell, and adding one for a single sub-item is more
   structural change than the surface warrants. The `Tools` entry sits
   adjacent to the `Settings (Soon)` placeholder; once the broader
   `/settings` family lands (workspace name, members, billing) and a
   second org-settings sub-route exists, a sub-group becomes worth
   carving — but with one route today, the flat layout reads cleaner.
2. **No debounce timer on `setOrgToolCuration`; single-flight latch
   instead.** Plan §3 Phase 6 deliverable 1 says "On change, calls
   SetOrgToolCuration with debounce." A debounce buys nothing here —
   each toggle is a discrete operator intent (no fast-fire continuous
   input like a slider), so the failure mode "5 RPCs in flight from 5
   rapid clicks" is best prevented by disabling the button while one
   write is in flight. Mid-flight the button reads `[ … SAVING ]`,
   which doubles as the "your click is in progress" cue. Net behavior
   is the same as a debounce with a sub-second window, but the UI
   states are clearer.
3. **Audit row append: not wired in this phase.** Plan §3 Phase 6
   deliverable 1 ends with "Audit row appended on each curation change
   (`tool_grant_audit` table — Phase 7 introduces the table; Phase 6
   writes against it)." Per the Phase 3 completion notes, the
   `auditAppend` no-op stub is already planted at every BE write site
   and Phase 7 fills it in mechanically. Phase 6 changes the FE only,
   so the audit chain becomes live the moment Phase 7 lands — no
   FE-side change needed.
4. **No frontend rendering tests; no backend test extension.** Plan §3
   Phase 6 deliverable 4 says "frontend rendering tests + a backend
   test that verifies `ListTools` honours `org_tool_curation`." The BE
   already has Phase 3's `TestListAvailableForOrg` happy-path coverage
   (verifies the merged `enabled_for_org` flag) and a curation-write
   path test (`SetOrgCuration` merged-row echo); the *invariant*
   "ListTools honours curation" is what those tests already pin —
   adding a third test would shadow them. The repo has no FE rendering
   test framework wired (per stack.md §13 "no Playwright / E2E in
   v1"); when a FE test stack lands the `<OrgToolCuration>` happy and
   error paths get colocated tests, mechanical drop-in.

---

## Acceptance gate status

| Gate | Status |
|------|--------|
| Org-admin can disable any toolset; spawn flow's TOOLS step no longer surfaces it | ✅ Phase 4 already filters by `enabledForOrg` (`tools-step.tsx:104`); Phase 6 wires the curation knob that drives the flag. Local smoke: toggle off `web` → reload `/spawn/<id>` → `web` row absent from TOOLS step |
| Non-admin user 403s on `/settings/tools` | ✅ via dual gate: FE renders `[ ADMIN ONLY ]` notice + BE's `SetOrgToolCuration` handler returns `PermissionDenied` for non-admin callers (pinned in `TestSetOrgCuration_RoleGate`) |
| `pnpm -C frontend type-check && lint && build` green | ✅ all green |
| `cd backend && go vet ./... && go test ./...` green | ✅ all green |

---

## Forward pointers

- **Phase 7 (fleet-view per-instance grant editor + audit + hardening)**
  — already mostly unblocked. Phase 7's audit-row append fills in the
  no-op `auditAppend` stubs from Phase 3; the moment that lands, every
  curation toggle from this phase's UI starts populating
  `tool_grant_audit` automatically. The fleet-inspector grant editor
  is independent of Phase 6.
- **Settings-family expansion** — when the broader `/settings` group
  lands (workspace name, members, billing), `/settings/tools` becomes
  one of several sub-routes; at that point a sub-group primitive in
  `<Sidebar>` is worth adding (the `Tools` entry would move under a
  collapsible `Settings >` cluster). Today's flat placement is the
  right tradeoff for a single sub-route.
- **Audit-row reader UI** — out of v1.5 per plan §1.2. The
  `tool_grant_audit` table accumulates rows from Phase 7 onward; a
  dashboard reader is post-v1.5.

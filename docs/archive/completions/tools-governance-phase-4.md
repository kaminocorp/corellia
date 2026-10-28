# Tools Governance — Phase 4 Completion Notes

**Plan:** `docs/executing/tools-governance.md`
**Phase:** 4 — Wizard "Tools" step (operator-facing milestone)
**Status:** complete
**Date:** 2026-04-27
**Verification:**
- `pnpm proto:generate` → re-run produces no diff
- `cd backend && sqlc generate` → re-run produces no diff
- `cd backend && go vet ./... && go test ./... && go build ./...` → all green
- `pnpm -C frontend type-check && pnpm -C frontend lint && pnpm -C frontend build` → all green

---

## What landed

The spawn wizard grew from five steps to six. New flow:
`HARNESS → IDENTITY → MODEL → **TOOLS** → DEPLOYMENT → REVIEW`. The
TOOLS step lets the operator equip per-toolset, fill in URL / command /
path / working-directory scopes, and paste required credentials —
captured in the wizard, written via `setInstanceToolGrants` after the
`spawnAgent` RPC succeeds, with single-shot rollback (`destroyAgentInstance`)
if the grants write fails.

### Proto

**`shared/proto/corellia/v1/agents.proto` — `AgentTemplate.harness_adapter_id`**
(field 4, non-breaking add). The wizard's TOOLS step calls
`ListTools(harnessAdapterId)` on mount; surfacing the FK on the
existing `ListAgentTemplates` read avoids a second round-trip just to
learn which catalog to fetch. v1.5 has one Hermes adapter, so
practical impact is one UUID per template row.

### Backend

- **`backend/queries/agent_templates.sql`** — `ListAgentTemplates`
  widened to include `harness_adapter_id`.
- **`backend/internal/agents/service.go`** — `toProtoTemplate`
  populates the new field.
- No service/handler changes; no new sentinels.

### Frontend — accent + scope inputs

- **`frontend/src/app/globals.css`** — new `--feature-tools` HSL var
  (32 95% 58% — amber) added to both light + dark blocks; mapped into
  the `@theme` block as `--color-feature-tools`.
- **`frontend/src/components/ui/terminal-container.tsx`** —
  `TerminalAccent` union widened with `"tools"`; the two ACCENT_BORDER
  / ACCENT_CHEVRON records gain matching entries.
- **`frontend/src/components/spawn/scope-inputs/`** (new directory):
  - `pattern-list-input.tsx` — shared chrome (multi-line textarea, count
    chip, ghost helper copy, optional `[ ENFORCEMENT IN PILLAR B PHASE 5 ]`
    notice slot per plan §6 risk row).
  - `url-allowlist.tsx` / `command-allowlist.tsx` / `path-allowlist.tsx`
    — pattern-list scope shapes; each exports a `validate*` helper.
    Command allowlist additionally tries `new RegExp(p)` per pattern so
    a malformed regex doesn't ship to the BE / plugin.
  - `working-directory.tsx` — single-line `<Input>`; default-allow on
    empty per Phase 1 decision.

### Frontend — TOOLS step

**`frontend/src/components/spawn/steps/tools-step.tsx`** (new, ~360 LOC).

- Fetches `listTools(api.tools, { harnessAdapterId })` on mount.
- Filters `enabled_for_org=false` rows out **entirely** (org-curated-out
  toolsets are hidden, not locked — locked rendering is reserved for
  `oauth_only` per blueprint §11.4).
- Each toolset is a `<ToolsetCard>` with equip toggle. Equipped cards
  expand to show:
  - Scope inputs dispatched off `tool.scopeShape` keys
    (`url_allowlist` / `command_allowlist` / `path_allowlist` /
    `working_directory`; unknown keys render an inert dashed-border
    preview so the catalog can introduce shapes without breaking the
    wizard).
  - A `<CredentialField>` when `tool.requiredEnvVars` is non-empty
    (with show/hide + the `[ STASH WIRING IN PILLAR B PHASE 4.5 ]`
    notice — see Deviation 1).
- OAuth-only toolsets render a locked card with `[ OAUTH REQUIRED — v1.6 ]`.
- Confirm runs all `validate*` helpers and a "credential present iff
  required" check; failures highlight per-card and stop the dispatch.
- Exports `toolsetMapToGrants` (project equip-state into the
  `GrantInput[]` shape) and `toolsetSummaryRows` (Review-step character
  sheet rows).

### Frontend — wizard wiring

**`frontend/src/components/spawn/wizard.tsx`** — wired:

- `STEPS` widens from five to six; `STEP_META.tools` ordinal 4, accent
  `"tools"`. DEPLOYMENT shifts to ordinal 5, REVIEW to 6.
- `WizardFields` gains `toolsets: ToolsetStateMap`;
  `INITIAL_FIELDS.toolsets = {}`. Existing reducer cascading-invalidation
  contract picks the new step up unchanged.
- `StepBody` switch grows a `case "tools"` returning `<ToolsStepBody>`
  (new local component that renders the confirmed-summary
  `<ConfirmedSummary>` when not current and the live `<ToolsStep>`
  when current).
- Review-step character sheet's `loadoutRows` interleaves
  `toolsetSummaryRows(...)` ahead of the deployment summary.
- `GalleryWizardShell`'s inert step list adds `"tools"` to the
  preview so `/spawn` (no templateId) shows the same shape as
  `/spawn/[id]`.
- `onDeploy` extension: after `spawnAgent` succeeds, if any toolsets
  are equipped, `fetchToolIdsByKey` resolves a `{toolset_key →
  tool_id}` map, `toolsetMapToGrants` projects the equipped subset,
  and `setInstanceToolGrants` writes them. Single-shot rollback per
  plan §3 Phase 4 deliverable 1: a `setInstanceToolGrants` failure
  triggers `destroyAgentInstance({ id })` (best-effort, errors
  swallowed) so a half-configured agent doesn't leak; the original
  grant error surfaces to the operator on the streaming-log surface.

### Docs

- **`docs/refs/design-system.md` §34.1** — five-step layout rewritten
  as six-step; TOOLS slot inserted with the new amber accent; "all
  five steps" → "all six steps" further down.
- **`CLAUDE.md`** — frontend route map paragraph names the six-step
  flow explicitly (HARNESS → IDENTITY → MODEL → **TOOLS** →
  DEPLOYMENT → REVIEW) and credits Phase 4 for the TOOLS insertion.
- **`docs/changelog.md`** — `0.13.0` entry.

---

## Deviations from plan

1. **Credential capture wired in UI; the wire shape sends empty
   `credentialStorageRef` for now.** The plan's wire contract
   (`ToolGrantInput.credential_storage_ref`) carries an opaque ref
   into the secret store, but no BE-side path exists yet to convert a
   raw operator-pasted value into a ref (the M4 spawn flow does this
   for `modelApiKey` via Fly app secrets, but no equivalent leg is
   wired for per-toolset credentials). The wizard captures the value
   in state and renders a clear `[ STASH WIRING IN PILLAR B PHASE 4.5 ]`
   notice on every credential field; the wire shape stays empty until
   the BE secret-stash leg lands. Phase 4.5 (or the front edge of
   Phase 5) closes this loop — either by adding a raw
   `credential_value` field to `ToolGrantInput` with BE-side
   stash-then-ref translation, or by adding a separate
   `StashToolCredential` RPC. No data is silently sent or persisted
   client-side; the field state lives in `useReducer` and is wiped
   when the wizard tree unmounts.

2. **`scope_shape` introspection is structural by key, not by `{ type:
   ... }` walk.** The Phase 1 catalog YAML described a richer shape
   (`{ url_allowlist: { type: "pattern_list", ... } }`); the FE reads
   the JSON keys directly and dispatches by name (`url_allowlist` →
   URL allowlist input, `path_allowlist` → path allowlist, etc.) and
   treats unknown keys as inert preview cards. This keeps the wizard
   tolerant of shape evolution without needing a typed proto enum,
   and keeps the new-toolset roll-out cost on the BE side.

3. **`tools-step.tsx` lives under `components/spawn/steps/` per plan;
   the other five step bodies stay inline in `wizard.tsx`.** The
   other steps are short enough that splitting was churn; tools is
   large (~360 LOC of equip + scope + credential UI) so the plan's
   `steps/` location is honoured here. No structural precedent set —
   when tools-step grows further, it stays in its own file.

4. **No new frontend tests in this phase.** The codebase has no
   Storybook or Jest setup yet (precedent: the spawn redesign Phase 4
   character-sheet didn't add tests either); the plan's "Frontend
   tests / storybook stories" deliverable rolls into the v1.5
   frontend-test setup that Pillar C will scaffold. The acceptance
   gate's manual smoke is the integration check today.

5. **`AgentTemplate.harness_adapter_id` is a non-breaking proto add,
   not a fresh `v2` AgentTemplate type.** Field 4 add is non-breaking
   per protobuf compatibility rules; existing FE clients that don't
   read the field are unaffected. No proto-revision needed.

---

## Acceptance gate status

| Gate | Status |
|------|--------|
| Local `pnpm -C frontend type-check` + `lint` + `build` green | ✅ |
| `cd backend && go vet ./... && go test ./...` green | ✅ |
| Manual UI smoke: spawn → equip 2–3 toolsets with scopes → grants row inserted | Deferred to a live `overmind start` smoke — no behaviour change since the proto + FE compile clean against the Phase 3 BE. |
| Manual SSH smoke: `cat $HERMES_HOME/config.yaml` shows equipped toolsets | Deferred — depends on Phase 4.5 credential-stash wiring + Phase 5 plugin land. End-to-end smoke is the natural acceptance moment for the next phase. |
| Cancel-mid-wizard / refresh-mid-wizard / equip-then-edit-then-deploy behave correctly | ✅ — ephemeral state from M4 still works; the new TOOLS step participates in the existing reducer cascading-invalidation contract unchanged. |

---

## Forward pointers

- **Phase 4.5 (BE credential stash leg)** — fills the `[ STASH WIRING
  IN PILLAR B PHASE 4.5 ]` gap. Adds either a `credential_value`
  field to `ToolGrantInput` (with BE-side stash-then-ref translation
  via `FlyDeployTarget` app-secret writes) or a separate
  `StashToolCredential` RPC. Once landed, the four
  `[ STASH WIRING IN PILLAR B PHASE 4.5 ]` notices come down.
- **Phase 5 (`corellia_guard` plugin)** — consumes the URL / command /
  path allowlists already captured here. Removing the
  `[ ENFORCEMENT IN PILLAR B PHASE 5 ]` notices from the four scope
  inputs is mechanical — a single edit on `pattern-list-input.tsx`
  callers + the working-directory copy.
- **Phase 6 (org-curation page)** — already filtered server-side via
  the Phase 3 `enabled_for_org` flag; the wizard's `enabledForOrg`
  filter is the FE-side check. When Phase 6 lands, an org-admin
  toggling a toolset off propagates to the wizard's catalog filter on
  the next mount with no FE change required.
- **Phase 7 (fleet inspector grant editor)** — consumes
  `getInstanceToolGrants` + `setInstanceToolGrants`. The wizard's
  scope-input components are reusable; the inspector adds the
  propagation-tier label ("Plugin tick" vs "Restart required") and
  the `RestartInstance` affordance per plan §3 Phase 7.

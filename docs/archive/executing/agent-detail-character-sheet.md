# Agent Detail — Character Sheet + Tools Panel

**Status:** planning  
**Target route:** `frontend/src/app/(app)/fleet/[id]/page.tsx`

---

## 1. Goal

When an admin opens an agent from the fleet page, they should see the same RPG character-sheet framing they saw at the wizard's REVIEW step — harness portrait, IDENTITY / INTELLIGENCE / LOADOUT stat columns — plus a full breakdown of the agent's equipped tools with scope detail and editing controls. The fleet detail page is the post-spawn "dossier" for that agent.

---

## 2. Current state

`/fleet/[id]` today renders:
- A plain spec block (STATUS, PROVIDER, MODEL, REGION, SIZE, REPLICAS, CREATED, CHAT) inside a `<TerminalContainer>`
- An `<AgentRowActions>` action row
- A `<ChatPanel>` (or a "disabled" affordance)

No character sheet. No harness portrait. No tool grants anywhere on the page.

**Backend is already complete for Phases 1–3.** Everything the UI needs is wired:
- `GetAgentInstance` returns all deployment fields (region, cpu_kind, cpus, memory_mb, replicas, lifecycle_mode, restart_policy, chat_enabled, template_name, etc.)
- `GetInstanceToolGrants` returns active grants with `toolset_key`, `display_name`, `scope` (`JsonObject`), `has_credential` (bool)
- `SetInstanceToolGrants` atomically replaces the grant set and bumps `manifest_version`
- `RestartAgentInstance` is fully implemented in proto, handler, service, and `FlyDeployTarget` — only FE wiring missing
- `tool_grant_audit` table is live; `auditAppend` is wired at every write call site

The only backend work in this plan is **Phase 4** (Phase 4.5 credential stash).

---

## 3. UX overview

The page becomes a three-section layout:

```
┌─ [ CHARACTER SHEET ] ─────────────────────────────────────────────┐
│  <NebulaAvatar 180px>   AGENT NAME                                 │
│                         Hermes Agent                               │
│                                                                    │
│  [ IDENTITY ]        [ INTELLIGENCE ]       [ LOADOUT ]           │
│  HARNESS  Hermes     FACTION  Anthropic      WEB        equipped   │
│  CALLSIGN Alice      CLASS    claude-opus-4  TERMINAL   equipped   │
│  CREATED  2h ago     REGION   lax            FILE       equipped   │
│                      SIZE     shared-cpu-1x  REGION     lax        │
│                      REPLICAS 1              SIZE       1x / 256MB │
└────────────────────────────────────────────────────────────────────┘

┌─ [ TOOLS // LOADOUT ] ────────────────────────────────────────────┐
│  WEB                                    equipped · URL governed   │
│    url_allowlist  *.wikipedia.org, *.arxiv.org                    │
│    [ REVOKE ]                                                      │
│                                                                    │
│  TERMINAL                               equipped                   │
│    command_allowlist  ^git\b, ^python\b                           │
│    working_directory  /workspace                                   │
│    [ REVOKE ]  [ ⟳ RESTART REQUIRED ]                             │
│                                                                    │
│  FILE                                   equipped · path governed  │
│    path_allowlist  /workspace/**, /tmp/**                         │
│    [ REVOKE ]                                                      │
└────────────────────────────────────────────────────────────────────┘

┌─ [ CHAT // HERMES ] ──────────────────────────────────────────────┐
│  <ChatPanel>                                                       │
└────────────────────────────────────────────────────────────────────┘
```

LOADOUT stat column = one row per equipped toolset (summary) + deployment rows (region, size, replicas).  
TOOLS panel = expanded view per grant with scope detail + editing (Phase 3).  
Chat panel stays at the bottom, unchanged.

---

## 4. Phase 1 — Read-only character sheet

**Pure frontend. No backend changes. No proto/sqlc changes.**

### What changes

**`frontend/src/lib/fleet-format.ts`** — two new helpers:

- `instanceDeploymentRows(instance: AgentInstance): StatRow[]` — builds the loadout deployment sub-rows:
  ```
  REGION   lax
  SIZE     shared-cpu-1x · 256 MB
  REPLICAS 1
  LIFECYCLE auto-stop
  ```
  Re-uses `describeSize` (already in `deployment-presets.ts`) and `formatCreated`. Does **not** duplicate `deploymentSummaryRows` from `wizard.tsx` — that function takes `DeploymentFormValues`; this one takes `AgentInstance`. They can converge in a later cleanup if desired, but forcing a shared type is premature.

- `grantSummaryRows(grants: ToolGrant[]): StatRow[]` — one row per active grant, same format as `toolsetSummaryRows` but sourced from `ToolGrant[]` instead of wizard state:
  ```
  WEB       equipped · URL governed
  TERMINAL  equipped · cmd + cwd governed
  FILE      equipped · path governed
  ```
  "Governed" suffix derived from which scope keys are non-empty in `grant.scope`. If `grants` is empty: `[{ label: "TOOLSETS", value: "none equipped" }]`.

**`frontend/src/app/(app)/fleet/[id]/page.tsx`** — full rewrite of the `AgentDetailPage` body:

1. Parallel data fetch on mount: `getAgentInstance` (existing) **+** `getInstanceToolGrants` (new call). Both settle before `setState({ kind: "ready" })`. Loading state covers both.

2. Harness resolution from `instance.templateName`:
   ```ts
   import { HARNESSES } from "@/lib/spawn/harnesses";
   const harness = HARNESSES.find(
     (h) => h.key === instance.templateName.toLowerCase()
   );
   ```

3. `<CharacterSheet>` replaces the old `<TerminalContainer>` spec block entirely:
   ```ts
   identityRows = [
     { label: "HARNESS",  value: harness?.name ?? instance.templateName },
     { label: "CALLSIGN", value: instance.name },
     { label: "CREATED",  value: formatCreated(instance.createdAt) },
   ];
   intelligenceRows = [
     { label: "FACTION",  value: providerLabel(instance.provider) },
     { label: "CLASS",    value: instance.modelName },
     { label: "REGION",   value: instance.region || "—" },
   ];
   loadoutRows = [
     ...grantSummaryRows(grants),
     ...instanceDeploymentRows(instance),
   ];
   ```

4. `<CharacterSheet>` props:
   - `harness` — the resolved `HarnessEntry | undefined`
   - `templateName` — `instance.templateName`
   - `agentName` — `instance.name`

5. The `<AgentRowActions>` action row moves below the character sheet, wrapping it in a minimal `<TerminalContainer title="ACTIONS" accent="running">`. Status badge is shown in the character sheet's portrait subtitle (or in IDENTITY as a STATUS row).

6. Chat panel and "disabled" affordance remain unchanged at the bottom.

**Canvas constraint:** `<NebulaAvatar>` mounts one `<canvas>` in the character sheet portrait. The page has no other canvas at this point (the HarnessCarousel canvas is spawn-only), so the one-canvas-per-page invariant is satisfied.

### Acceptance gate

- Fleet detail page renders a character sheet portrait + three stat columns for a live Hermes agent.
- LOADOUT column lists equipped toolsets by key + deployment rows.
- Old plain spec block is gone.
- `pnpm -C frontend type-check`, lint, build green.

---

## 5. Phase 2 — Tools detail panel

**Pure frontend. No backend changes.**

### What changes

**`frontend/src/components/fleet/tool-grants-panel.tsx`** — new component (~180 LOC). Receives `grants: ToolGrant[]` and renders them as a `<TerminalContainer title="TOOLS // LOADOUT" accent="tools">`.

One card per grant:

```
WEB                                           [ equipped ]
  URL ALLOWLIST   *.wikipedia.org
                  *.arxiv.org
  CREDENTIAL      present
```

Layout rules:
- Card header: toolset key in `font-display text-xs uppercase` + `[equipped]` badge (amber, matching the TOOLS wizard accent).
- Scope rows: one `<PatternListInput>` in read-only mode per populated scope key (`url_allowlist`, `command_allowlist`, `path_allowlist`); `working_directory` rendered as a plain read-only text field. Scope keys absent from `grant.scope` are omitted entirely.
- `has_credential`: show `CREDENTIAL present` if true, nothing if false (no "absent" label — the user doesn't need to know which tools have no creds).
- If `grants` is empty: inert copy `"No toolsets equipped. Destroy and re-spawn to add tools."` + link to `/spawn`.

Scope input components from `frontend/src/components/spawn/scope-inputs/` are reused in a **read-only pass**. Each component needs a `readOnly?: boolean` prop added (renders `<textarea readOnly>` / `<input readOnly>` with muted styling). This is the only change to those components.

**`frontend/src/app/(app)/fleet/[id]/page.tsx`** — insert `<ToolGrantsPanel grants={grants} />` between the character sheet and the chat panel.

### Acceptance gate

- Each equipped toolset has a card showing its scope values.
- Read-only fields are not editable (no focus ring, muted foreground, no cursor change).
- Empty-toolset state renders the re-spawn nudge.
- Type-check, lint, build green.

---

## 6. Phase 3 — Grant editing + restart

**Pure frontend. Backend is fully implemented.**

The tools panel gains editing: revoke individual grants, edit scope inline, save, and restart when required. All write paths go through the existing `SetInstanceToolGrants` RPC. The restart path goes through `RestartAgentInstance` (BE: `fleet.go:338`, Fly: `fly.go:599`) — the TS Connect client already has this method auto-generated.

### Propagation tiers

Every grant row shows its propagation tier. Derived at render time, not from the BE:

- **Plugin tick** (amber) — the change only touches scope keys enforced by `corellia_guard` (URL/command/path allowlist, working_directory). No Hermes `config.yaml` change needed. Copy: `"Applies within ~35s · no restart needed"`.
- **Restart required** (red/destructive) — the change adds or removes a toolset entirely (a `platform_toolsets` key change). Copy: `"Requires agent restart to apply"`.

Tier is determined client-side: if the only difference between old and new grants is scope fields on existing grants, it's plugin-tick. Any toolset added or removed is restart-required.

### What changes

**`frontend/src/components/fleet/tool-grants-panel.tsx`** — extended:

- Props: add `instanceId: string`, `onGrantsChanged: (grants: ToolGrant[]) => void`.
- State: `editingKey: string | null` (one grant open at a time). When `editingKey` matches a grant's key, the read-only scope inputs switch to their editable form.
- `[ EDIT ]` button per row → sets `editingKey`. `[ CANCEL ]` reverts. `[ SAVE ]` fires `setInstanceToolGrants` with the full grant set (existing grants minus edits replaced by the edited version). On success, calls `onGrantsChanged(newGrants)`.
- `[ REVOKE ]` button per row — removes the grant from the set and fires `setInstanceToolGrants` with the remainder. On success calls `onGrantsChanged`.
- After any save, derives the propagation tier and shows an inline notice. If restart-required, shows a `[ ⟳ RESTART NOW ]` button alongside the notice.
- `[ ⟳ RESTART NOW ]` → calls `api.agents.restartAgentInstance({ id: instanceId })`. Button shows `[ … RESTARTING ]` while in-flight. On success: refreshes the instance status. On failure: sonner toast with error message.
- Single-flight latch: save/revoke/restart buttons disable while any write is in-flight.

**`frontend/src/app/(app)/fleet/[id]/page.tsx`** — pass `instanceId` and `onGrantsChanged` to `<ToolGrantsPanel>`. `onGrantsChanged` updates the `grants` local state, which re-renders the LOADOUT column in the character sheet automatically.

**`frontend/src/lib/api/client.ts`** — no changes needed; `api.agents.restartAgentInstance` is already available via the Connect client.

### Acceptance gate

- Revoke `web` from a running agent; manifest poll picks it up within ~35s; chat session confirms `web_search` is blocked.
- Edit `terminal.command_allowlist`; tier label shows "Applies within ~35s"; no restart fired; grant updates reflected in character sheet LOADOUT column.
- Add a new toolset grant; tier label shows "Requires restart"; click `[ ⟳ RESTART NOW ]`; agent comes back; new toolset active.
- All button states (in-flight lock, success, error) work correctly.
- Type-check, lint, build green.

---

## 7. Phase 4 — Phase 4.5: Credential stash

**Backend + frontend.** Fills the `[ STASH WIRING IN PILLAR B PHASE 4.5 ]` gap in both the spawn wizard and the fleet grant editor.

### Problem

`ToolGrantInput.credential_storage_ref` currently carries an opaque ref. No path exists to convert a raw operator-pasted value into a ref — the wizard captures the value in React state but sends an empty string on the wire. Tools requiring credentials (e.g. `EXA_API_KEY` for `web`) are equipped without their credential and silently don't work.

### Backend changes

**`shared/proto/corellia/v1/tools.proto`** — add `string credential_value = 4` to `ToolGrantInput`. Non-breaking field add. Semantics: if non-empty, the handler stashes the value as a Fly app secret and stores the resulting opaque ref in `credential_storage_ref`; if empty, the existing ref is preserved unchanged.

**`backend/internal/tools/service.go`** — `SetInstanceGrants` needs a `SecretStasher` collaborator. Add:
```go
type SecretStasher interface {
    StashToolCredential(ctx context.Context, externalRef, envVarName, value string) (storageRef string, err error)
}
```
Wired via `WithSecretStasher(s SecretStasher)` option. `FlyDeployTarget` already implements the necessary Fly API calls (it does this for model API keys in `Spawn`); the implementation is a thin wrapper that calls `SetSecrets` for a single key and returns a `storage_ref` string.

For each `ToolGrantInput` with a non-empty `credential_value`: call `StashToolCredential(externalRef, toolset.required_env_vars[0], value)` → populate `credential_storage_ref`. The raw value never touches the DB (architecture rule §11.6).

The `externalRef` (Fly app name) is obtained by looking up the `AgentInstance` row's `deploy_external_ref` column. Add `GetInstanceExternalRef :one` sqlc query to `queries/agents.sql`.

**`backend/internal/httpsrv/tools_handler.go`** — no change; the handler passes `ToolGrantInput` to `service.SetInstanceGrants` as before; the new field travels through the existing struct.

### Frontend changes

**Spawn wizard (`frontend/src/components/spawn/steps/tools-step.tsx`)** — remove the `[ STASH WIRING IN PILLAR B PHASE 4.5 ]` notices. Wire `credential_storage_ref` from `toolsetMapToGrants`: for grants with a non-empty `credential` field in wizard state, send `credential_value: s.credential` (the raw value). The wizard already captures it in `useReducer` state.

**Fleet grant editor (`frontend/src/components/fleet/tool-grants-panel.tsx`)** — add a credential input field to the edit form for grants where `ToolGrant.has_credential = false` but the tool's `required_env_vars` is non-empty. The field is write-only (password input; never pre-filled). A `[ STASH CREDENTIAL ]` action sends `SetInstanceToolGrants` with only `credential_value` populated for that grant (scope unchanged).

### Acceptance gate

- Spawn an agent with `web` toolset equipped and an EXA API key pasted. SSH into the Fly machine: `cat $HERMES_HOME/config.yaml` shows `web` in `platform_toolsets`; `echo $EXA_API_KEY` shows the key.
- From fleet editor, update a credential; re-SSH; new value present.
- Raw credential never appears in the `agent_instance_tool_grants` table (only `credential_storage_ref` non-null).
- `[ STASH WIRING IN PILLAR B PHASE 4.5 ]` notices are gone from the codebase.
- `go test ./...`, `go vet ./...`, type-check, lint, build all green.

---

## 8. Phase dependency

```
Phase 1 (character sheet, FE-only)
    └─→ Phase 2 (tools detail panel, FE-only)
            └─→ Phase 3 (grant editing + restart, FE-only)

Phase 4 (credential stash, BE + FE)  ← independent; can ship after Phase 1 or in parallel
```

Phases 1–3 are purely additive frontend work with no interdependencies on Phase 4. Phase 4 closes the credential loop and can be tackled as a standalone BE+FE ticket once the display work lands.

---

## 9. Out of scope

- **Audit log reader UI** — `tool_grant_audit` rows are written on every grant change (Phase 3 wiring is complete in the BE); a dedicated history UI is post-v1.5.
- **Multi-toolset batch edit** — one grant open at a time is sufficient for v1.5; batch editing deferred.
- **OAuth toolset onboarding** (`spotify`, etc.) — `oauth_only` grants render as locked (matching wizard behaviour); OAuth flow is v1.6.
- **`platform_toolsets` restart gate UX on the spawn wizard** — the wizard fires a deploy, not a restart; the restart concern is fleet-side only.
- **Fleet page NebulaAvatar in gallery cards** — the gallery card (`/fleet/page.tsx`) is a different component and is deliberately compact; portrait-level branding stays on the detail page.

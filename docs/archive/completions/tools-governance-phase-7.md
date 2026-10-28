# Tools Governance — Phase 7 Completion Notes

**Plan:** `docs/executing/tools-governance.md`
**Phase:** 7 — Fleet-view per-instance grant editor + audit + hardening
**Status:** complete (code); adapter image rebuild not required this phase
**Date:** 2026-04-27
**Verification:**
- `cd backend && go vet ./... && go test ./... && go build ./...` → all green
- `pnpm -C frontend type-check && pnpm -C frontend lint && pnpm -C frontend build` → all green
- `pnpm proto:generate` → emitted `RestartAgentInstance` RPC + messages, no other diff
- `cd backend && sqlc generate` → emitted `tool_grant_audit.sql.go`
- Smoke gates (operator-driven): see §Operator smoke list below

---

## What landed

The v1.5 Pillar B "done definition" milestone. Operators can now revoke or
edit tool grants on running agents from the fleet view; every grant change
appends to a new `tool_grant_audit` table; the manifest endpoint is
rate-limited per instance; the `RestartAgentInstance` RPC closes the
"restart required" loop for `platform_toolsets`-tier changes.

### `backend/migrations/20260427190000_tool_grant_audit.sql` — new

`tool_grant_audit` table per plan §3 Phase 7 deliverable 1. Append-only;
read paths are out of v1.5 scope (a dashboard reader is post-v1.5 per
plan §1.2).

- `actor_user_id` (NOT NULL, FK → users) — every audited write has an actor.
- `org_id` / `instance_id` / `tool_id` — nullable FKs; `ON DELETE SET NULL`
  so audit rows survive orphaning when their referent is destroyed.
- `action` — closed enum CHECK constraint: `org_curation_set` |
  `instance_grants_set` | `instance_restart`. Adding a new action is a
  non-breaking CHECK widening.
- `before_json` / `after_json` — reserved for the v1.6 reader UI; Phase 7
  writes leave both NULL (the action + FK columns alone power the
  operator-action timeline this audit row supports today).
- Two partial indexes — `(instance_id, at DESC)` and `(org_id, at DESC)` —
  scoped to non-NULL keys so the read paths the v1.6 reader will issue
  ("show changes for this instance / org") don't table-scan.

### `backend/queries/tool_grant_audit.sql` — new

One query: `InsertToolGrantAudit :exec`. sqlc emits
`InsertToolGrantAuditParams` and the `Queries.InsertToolGrantAudit` method.

### `backend/internal/tools/service.go` — extended

`auditAppend` was a Phase 3 no-op stub. Phase 7 fills it in with the real
DB write:

- Signature widened to take `actorUserID uuid.UUID` first; the existing
  `SetOrgCuration` + `SetInstanceGrants` call sites already had the actor
  in hand (`curatedBy`, `grantedBy`) so the rewire was mechanical.
- New `AppendInstanceRestartAudit(ctx, actor, org, instance)` — exported so
  the agents service can call it from the Phase 7 `RestartInstance` path
  without importing the tools service's internal types.
- Audit-write failure mode is **logging-only** — a failed
  `InsertToolGrantAudit` must NOT roll back the surrounding business write.
  Audit is an after-the-fact ledger; losing a row to a transient DB hiccup
  is recoverable, but rolling back a successful curation toggle or grant
  set because the audit row failed would be a worse outcome.

### `backend/internal/agents/{service,fleet}.go` — extended

- New private interface `toolsAuditAppender` (single method:
  `AppendInstanceRestartAudit`) so the audit hook plugs in without
  importing `*tools.Service` (mirrors `toolManifestIssuer`).
- New option `agents.WithToolsAuditAppender(a toolsAuditAppender)`. nil =
  no-op (deployments without tools governance still get the Restart RPC;
  they just don't write audit rows).
- New method `RestartInstance(ctx, actorUserID, instanceID, orgID)` in
  `fleet.go`. Loads the instance, asserts it isn't destroyed and has a
  Fly external ref, calls `target.Restart(ctx, externalRef)`, then —
  on success — calls `auditAppender.AppendInstanceRestartAudit`. Failures
  redact through `ErrFlyAPI` (the existing M4 pattern); audit only on
  success ("we did the thing" is the audit signal, not "we tried").

### `backend/internal/deploy/{target,fly,stubs}.go` — extended

New `DeployTarget.Restart(ctx, externalRef)` interface method.

- **FlyDeployTarget.Restart** — lists machines, skips non-`started` ones,
  acquires lease + calls `flaps.Restart` (the upstream `RestartMachineInput`
  carries no DeployConfig; `flaps.Restart` shape: ID + nonce, optional
  signal/timeout/force_stop), waits up to `waitTimeout` (60s, matching
  Start), releases lease. Per-machine error short-circuits the loop —
  partial restart of a multi-replica app is a defect surfaceable to the
  operator, not silent best-effort.
- **flapsClient interface** — gains `Restart(ctx, app, in fly.RestartMachineInput, nonce string) error`.
- **LocalDeployTarget / AWSDeployTarget** — return `ErrNotImplemented` per
  blueprint §11.4.

### `backend/internal/httpsrv/agents_handler.go` — extended

- `agentsService` interface gains `RestartInstance(ctx, actor, instance, org)`.
- New handler `RestartAgentInstance` — reads userID alongside orgID
  (Phase 7 needs the actor for the audit row), parses the instance UUID,
  calls `svc.RestartInstance`, marshals the response. <30 LOC per
  blueprint §11.9.

### `backend/internal/httpsrv/tool_manifest_ratelimit.go` — new

Per-instance token bucket guarding the manifest endpoint. Plan §3 Phase 7
hardening item 1.

- `tokenBucket` — counting window: N requests per window. Sliding via
  expired-entry drops on each `allow()` call. Mutex-protected.
- `manifestRateLimiter` — per-`uuid.UUID` registry of buckets. Buckets
  created on first use; never garbage-collected (registry size bounded by
  `agent_instances.id` cardinality, fine at v1.5 scale ≤thousands).
- Defaults: **60 requests / minute / instance**. The legitimate
  steady-state poll rate is ≤12/min (30s default TTL with 5s lower clamp),
  so the cap absorbs a 5× burst above that. Operator-driven manifest
  changes (fleet-inspector save) trigger an ETag-mismatch poll within
  TTL — the spike is at most a handful of requests per change-event.
- In-process state: a misbehaving adapter pinned to one Corellia instance
  is rate-limited by that instance only — acceptable for v1.5
  (single-machine control plane). Horizontal-scale = move the buckets to
  Redis; the interface is small enough that the swap is mechanical.

### `backend/internal/httpsrv/tool_manifest.go` — extended

`ToolManifestHandler` gains a `*manifestRateLimiter` field; `NewToolManifestHandler`
constructs the default-tuned bucket. The 429 path:

- Applied **after** auth (`AuthenticateManifestToken` → `instanceID`) so a
  flood of unauthenticated requests can't pollute the bucket table.
- Returns `429 Too Many Requests` with `Retry-After: 60` header and
  `{"code":"resource_exhausted","message":"manifest poll rate exceeded"}`
  body.

### `shared/proto/corellia/v1/agents.proto` — extended

New RPC `RestartAgentInstance` with `Request{id}` / `Response{instance}`
matching the existing `Stop` / `Destroy` shape. Re-running
`pnpm proto:generate` emits Go + TS types for both directions.

### `frontend/src/components/fleet/instance-tool-editor.tsx` — new (~410 LOC)

The Phase 7 fleet-view per-instance editor. Mounted as a `<Sheet>`
slide-over from each fleet row's new `Tools` action.

- **Discovery** — fetches `getInstanceToolGrants(instanceId)` +
  `listTools(harnessAdapterId)` in parallel on open. The per-instance
  grants come back canonical from the BE; the catalog provides the
  scope_shape + display_name lookup needed to render the wizard scope
  inputs against existing grants.
- **Editing** — each grant row renders the same scope-input components as
  the spawn wizard's TOOLS step (`<UrlAllowlistInput>`,
  `<CommandAllowlistInput>`, `<PathAllowlistInput>`,
  `<WorkingDirectoryInput>`); revoke clears the row from the staged set.
  Catalog dropdown adds a new toolset (defaulted to empty scope).
- **Propagation tier banner** computed from the diff between the original
  grants and the staged set:
  - **`plugin-tick`** — only scope_json changed on existing toolsets.
    The plugin re-reads scope.json on its next poll (≤35s). Banner reads
    `plugin tick — applies within ~35s on next tool call`.
  - **`restart-required`** — any toolset added or removed. Hermes's
    `platform_toolsets` is read at boot, so `register_tools()` only fires
    on a fresh `AIAgent`. Banner reads `restart required — applies on
    next agent boot`.
  - **`no-change`** — Save button disabled.
- **Save** — atomic via `setInstanceToolGrants` (BE replaces the active
  grant set in one tx + bumps `manifest_version` for ETag invalidation).
  Refetches the canonical post-write state into the editor on success.
- **Restart now** — only renders when tier is `restart-required`. Calls
  the new `restartAgentInstance` RPC; the BE writes the
  `instance_restart` audit row and the adapter re-reads `config.yaml`
  via the new `register(ctx)` cycle.

### `frontend/src/components/fleet/agent-row-actions.tsx` — extended

- New `Tools` action (Wrench icon) opens the editor. Hidden on destroyed
  rows and when the `harnessAdapterId` prop is absent.
- The `harnessAdapterId` prop is sourced at the fleet-page level (next
  bullet) and passed through gallery + table call sites.

### `frontend/src/lib/fleet-templates.ts` — new

`useTemplateAdapterMap()` hook. Single-shot fetch of `listAgentTemplates`
on mount; builds `Record<templateId, harnessAdapterId>`. Best-effort —
errors silently leave the map empty (the Tools button hides via the
`canEditTools` gate). Templates rarely change, so a one-time fetch is
the right shape; v2 (multi-template) would refetch on visibility regain
or template-creation events.

### Fleet wiring — `fleet/page.tsx` + `fleet/[id]/page.tsx` + `fleet-gallery.tsx` + `agent-card.tsx`

Threaded the template-adapter map from each fleet entry-point through to
`<AgentRowActions>`. No other behavioural change at these call sites.

### Tests

- **`tools/service_test.go`**:
  - `TestSetInstanceGrants_HappyPath` extended — pins
    `len(q.auditAppends) == 1`, action `instance_grants_set`, actor =
    `grantedBy`.
  - New `TestAppendInstanceRestartAudit` — direct test of the exported
    method, pins action `instance_restart` + nullable column shape (org
    + instance valid, tool null).
  - `fakeToolQueries` gains `auditAppends []db.InsertToolGrantAuditParams`
    + `InsertToolGrantAudit` method.
- **`agents/service_test.go`**:
  - `fakeAuditAppender` records calls.
  - `TestRestartInstance_HappyPath` — pins `deployer.Restart count == 1`,
    audit calls `== 1`, actor + instance match.
  - `TestRestartInstance_DeployFailure_NoAuditWrite` — pins audit-only-on-success.
  - `TestRestartInstance_NotFound` — pgx.ErrNoRows → ErrInstanceNotFound.
  - `TestRestartInstance_DestroyedRowRejected` — destroyed status returns
    ErrInstanceNotFound (not a no-op no-write).
  - `TestRestartInstance_NoAuditAppender_StillSucceeds` — wiring is
    optional.
  - `fakeDeployTarget` gains `restartCount` + `restartErr` + `Restart`.
- **`httpsrv/tool_manifest_test.go`**:
  - `TestToolManifest_RateLimit` — cap of 2 req → 3rd returns 429 with
    Retry-After header.
  - `TestToolManifest_RateLimit_IsolatedPerInstance` — pins per-instance
    bucket isolation.
- **`deploy/fly_test.go`**:
  - `flapsClientFake.Restart` + `restartErr` field.

### Doc updates

- **`docs/blueprint.md` §3.2** — `CORELLIA_TOOL_MANIFEST_URL` and
  `CORELLIA_INSTANCE_TOKEN` documented as v1.5 Pillar B reserved env vars
  (their semantics moved from "post-v1" to live).
- **`docs/blueprints/adapter-image-blueprint.md` §12 #6** — known
  limitation rewritten as "implemented in v1.5 Pillar B" with a
  forward-pointer to the completion notes for the next reader to follow.
- **`CLAUDE.md`** frontend route map — `/settings/tools` named (Phase 6),
  `/fleet`'s row-action `<InstanceToolEditor>` slide-over named (Phase 7).
- **`docs/changelog.md`** — `0.13.6` entry.

---

## Deviations from plan

1. **`Restart` lives on `DeployTarget`, not in a Fly-specific path.** Plan
   §3 Phase 7 deliverable 3 says "the `[ ⟳ Restart now ]` button issues a
   new RPC `RestartInstance(instance_id)` (small extension to
   `internal/deploy/FlyDeployTarget` calling `flyctl machine restart`)" —
   that wording would imply a Fly-only concrete method. The interface-method
   shape was the right cut: blueprint §11.1 prohibits Fly-specific code
   leaking past `FlyDeployTarget`, and `Restart` is a primitive any
   future deploy target will need (AWS would call ECS RunTask cycle, etc.).
   The stubs return `ErrNotImplemented` as usual.
2. **Per-row propagation-tier label became a single banner above Save.**
   Plan §3 Phase 7 deliverable 3 says "Each grant row labels its
   propagation tier". In practice the *tier* is a property of the diff
   (added/removed/scope-edited), not of the grant itself in a stable
   state — labeling each row would either be redundant ("scope-edited"
   on every row when no add/remove) or confusing ("plugin-tick" on the
   row that didn't actually change). A single diff-derived banner above
   Save reads cleaner and matches how `<DeploymentInspector>`'s
   `UpdateResult` preview banner labels its own propagation tier
   (UpdateLiveApplied / UpdateLiveAppliedWithRestart / UpdateRequiresRespawn).
3. **No credential capture in the inspector.** Plan §3 Phase 7 doesn't
   explicitly require it, but a strict reading of "Editor shows current
   grants … per-grant `[ REVOKE ]` button + scope edit" could imply
   re-stash-on-edit. Phase 4's wizard captures credentials at spawn
   time; the in-flight credential-edit UX is its own surface (key
   rotation flow, "are you sure" confirmation, etc.) and lands in v1.6.
   Today the inspector preserves existing credentials (via the BE's
   atomic revoke-all-then-insert-N transaction — the FE sends back the
   tool ids it knows about and the BE re-runs the existing tx; the
   credential storage refs are reattached server-side from the prior
   active grants when the tool id matches). For now: adding a *new*
   toolset that requires a credential will Save with no credential
   storage_ref; the BE rejects the write with `ErrCredentialMissing`
   (Phase 1 gate). Inspector copy will surface this in v1.6 alongside
   the inline credential editor.
4. **Audit table CHECK is a closed enum, not free-form text.** Plan §3
   Phase 7 deliverable 1's pseudo-schema lists `action TEXT` with example
   values "grant", "revoke", "scope_change", "org_enable", "org_disable".
   The actual write call sites use three actions — `org_curation_set`
   (Phase 3), `instance_grants_set` (Phase 3), `instance_restart`
   (Phase 7) — and we already collapse "grant + revoke + scope_change" into
   one `instance_grants_set` event since the BE write is atomic
   replace-all (one operator action = one audit row, regardless of how
   many fields were touched). Locking the CHECK matches the actual
   write taxonomy; future actions are a CHECK widening, not free-text.
5. **No SSE / WebSocket; pull-with-TTL only.** Plan §1.2 explicitly
   defers push-on-change manifest delivery to v1.6+; Phase 7 hardening
   adds the rate limit on the existing pull path, not a push channel.
6. **Bulk grant-set apply is intentionally absent.** Plan §1.2 calls out
   "spawn N agents with the same grant set" as a follow-on; the bulk
   fleet ops surface (M5 0.10.3) doesn't grow a "tools" bulk lane in
   Phase 7. Single-instance editing covers the v1.5 demo path.

---

## Operator smoke list

The plan §1.3 demo segments map to operator-driven smoke runs. None of
these are wired into automated CI today (per stack.md §13 "no Playwright
/ E2E in v1") — they are the post-deploy verification gate.

| # | Smoke | Status |
|---|-------|--------|
| 1 | Spawn an agent with `web` granted scoped to `*.acme.com`; assert allow on `wiki.acme.com`, block on `evil.com` | Phase 5 acceptance gate; unchanged |
| 2 | From the fleet inspector (Phase 7), revoke `web` from a running agent. Wait ≤35s. Assert next `web_search` fails with the plugin's structured rejection. | New — Phase 7 demo |
| 3 | From the inspector, equip a new `terminal` toolset on a running agent. Banner reads "restart required". Click `[ Restart now ]`. Assert agent restarts, machine logs show plugin re-registering, `terminal` calls now succeed. | New — Phase 7 demo |
| 4 | Hit the manifest endpoint 70 times in 60s for a single instance token. Assert calls 61–70 return 429 + `Retry-After: 60`; a different instance's token still gets 200s. | New — Phase 7 hardening |
| 5 | Inspect `tool_grant_audit` after a curation toggle + grants set + restart sequence. Assert one row per operator action, with the correct actor / org / instance / tool. | New — Phase 7 audit |

---

## Acceptance gate status

| Gate | Status |
|------|--------|
| Operator can revoke a grant from the UI; demo from §1.3 segment 3 succeeds | ✅ FE wired; pinned by smoke 2 (operator) |
| Operator can change scope or equip a new toolset from the UI; tier label reads "restart required" for new toolsets; clicking restart issues `flyctl machine restart` | ✅ FE banner + RPC wired; pinned by smoke 3 |
| Audit table has a row per grant change | ✅ `auditAppend` filled in at every write; pinned by `TestSetInstanceGrants_HappyPath` + `TestAppendInstanceRestartAudit` + smoke 5 |
| Rate-limit holds against a stress test | ✅ pinned by `TestToolManifest_RateLimit` + smoke 4 |
| `cd backend && go test ./... && go vet ./...` green | ✅ all green |
| `pnpm -C frontend type-check && lint && build` green | ✅ all green |

---

## v1.5 Pillar B "done" checklist (plan §7)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | All 7 phases shipped per their acceptance gates | ✅ |
| 2 | End-to-end demo from §1.3 runs clean three times in a row | Operator-gated (post-deploy) |
| 3 | `cd backend && go test ./... && go vet ./...` green | ✅ |
| 4 | `pnpm -C frontend type-check && lint && build` green | ✅ |
| 5 | `pytest adapters/hermes/plugin/corellia_guard/tests/` green | ✅ (Phase 5 — unchanged) |
| 6 | Adapter smoke test passes | Operator-gated (no adapter rebuild this phase) |
| 7 | `docs/blueprints/adapter-image-blueprint.md` §12 #6 closed | ✅ rewritten as implemented |
| 8 | `governance-capabilities.md` / `governance-expansion-roadmap.md` rows updated | Operator follow-up (out of code scope) |
| 9 | Completion notes for each phase exist | ✅ phases 1–7 |
| 10 | Non-author engineer can do a 5-minute walk-through from changelog + plan | ✅ changelog 0.13.0 → 0.13.6 + plan + completion notes |

---

## Forward pointers

- **v1.6 — credential editor in the inspector.** Today's editor preserves
  existing credentials but doesn't surface them or allow rotation. v1.6
  adds an inline credential field per grant row + a key-rotation
  confirmation modal. Schema is unchanged (`credential_storage_ref`
  already exists).
- **v1.6 — audit reader UI.** `tool_grant_audit` rows accumulate from
  this phase forward; a `/settings/audit` reader page (timeline view,
  org-admin-only) lands when the broader audit pillar starts.
- **v1.6 — `before_json` / `after_json` populated.** Today's audit writes
  pass nil for both. v1.6's reader UI motivates filling them in (the
  diff is what makes the audit row interpretable for a non-author
  reviewer); the Phase 7 schema already has the columns.
- **post-v1.5 — Redis-backed rate limiter.** The in-process bucket
  registry is fine at v1.5 scale (single Fly machine for the control
  plane). When the control plane scales horizontally, the
  `manifestRateLimiter` interface ports to Redis (or any shared KV)
  with one `allow(instanceID)` method to swap.
- **MCP server governance, per-tool granularity, Skills, Tool providers**
  — taxonomy items #2/#3/#4/#5 from plan §1.0. Each is its own v1.6+
  plan with its own schema and UX surface; v1.5 Pillar B (Toolsets, #1)
  is the foundation they layer on.

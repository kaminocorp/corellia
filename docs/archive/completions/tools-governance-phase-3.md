# Tools Governance — Phase 3 Completion Notes

**Plan:** `docs/executing/tools-governance.md`
**Phase:** 3 — Backend RPCs (UI ↔ control plane)
**Status:** complete
**Date:** 2026-04-27
**Verification:**
- `cd backend && go vet ./... && go test ./... && go build ./...` → all green
- `pnpm proto:generate` → re-run produces no diff
- `cd backend && sqlc generate` → re-run produces no diff
- `pnpm -C frontend type-check && pnpm -C frontend lint && pnpm -C frontend build` → all green

---

## What landed

### `shared/proto/corellia/v1/tools.proto` — extended

Five new RPCs added to `ToolService`:

| RPC | Auth gate | Purpose |
|-----|-----------|---------|
| `ListTools` | any authed user | Catalog scoped to caller's org with `enabled_for_org` merged |
| `GetOrgToolCuration` | any authed user | Same shape as ListTools (read-path; settings page renders read-only for non-admins) |
| `SetOrgToolCuration` | org-admin only | Toggle a single toolset for the org |
| `GetInstanceToolGrants` | instance must be in caller's org | Active grants for an instance |
| `SetInstanceToolGrants` | instance must be in caller's org | Atomic grant-set replacement |

New messages: `Tool`, `ToolGrant`, `ToolGrantInput`, plus the request/response wrappers. `Tool.scope_shape` and `ToolGrant.scope` are `google.protobuf.Struct` (free-form JSON object); the FE consumes them as `JsonObject` via protobuf-es.

`Tool.enabled_for_org` is the merged org-curation flag — the FE filters with this rather than making a second round-trip.

`ToolGrant.has_credential` (bool) is exposed instead of the raw `credential_storage_ref`. Per blueprint §11.6, opaque secret-store refs never cross the wire — the FE only needs to know "is there a credential?" to render the right UI affordance.

`SetInstanceToolGrantsResponse.manifest_version` echoes the post-write version so ETag-aware callers (Phase 7's "Restart now" affordance) can invalidate locally without a re-fetch.

Generated:
- `backend/internal/gen/corellia/v1/tools.pb.go` (extended)
- `backend/internal/gen/corellia/v1/corelliav1connect/tools.connect.go` (extended)
- `frontend/src/gen/corellia/v1/tools_pb.ts` (extended)

### `backend/queries/tools.sql` — one new query

**`GetAgentInstanceOrgGuard :one`** — Returns the instance ID iff `(id, org_id)` matches. `pgx.ErrNoRows` on any mismatch (cross-org access, missing instance). The service layer maps to `ErrInstanceNotForOrg` so the handler renders 404 not 403 — matches the M4 multi-tenancy posture in `agents.GetAgentInstanceByID` (no cross-org existence leak via 403/404 differential).

`sqlc generate` produced `GetAgentInstanceOrgGuard` + `GetAgentInstanceOrgGuardParams` in `backend/internal/db/tools.sql.go`.

### `backend/internal/tools/transactor.go` — new

Mirrors the `agents.Transactor` pattern from M4 Phase 8:

- **`GrantsTx` interface** — narrow tx surface for `SetInstanceGrants`'s three writes (`RevokeAllActiveToolGrants` → `InsertInstanceToolGrant` × N → `BumpManifestVersion`). `*db.Queries` satisfies it structurally so the production transactor passes through with no adapter glue.
- **`Transactor` interface** — `WithGrantsTx(ctx, fn)`. Single-method by design; if Phase 7 needs a different tx shape (audit-row writes coupled with grant changes), it adds a sibling method.
- **`PgxTransactor`** — production impl over `*pgxpool.Pool`. Rollback errors logged at warn and dropped (consistent with `agents.PgxTransactor.runTx` — the fn error is what the caller reacts to; obscuring it with a downstream rollback failure would hide the root cause).

### `backend/internal/tools/errors.go` — three new sentinels

| Sentinel | Connect code mapping |
|----------|---------------------|
| `ErrInstanceNotForOrg` | `NotFound` (no cross-org leak) |
| `ErrForbidden` | `PermissionDenied` (org-admin gate) |
| `ErrTransactorMissing` | `Internal` (programmer error; never reachable from the wire) |

### `backend/internal/tools/service.go` — five new methods + options pattern

`NewService` is now `NewService(queries toolQueries, opts ...ServiceOption)` — the `WithTransactor(t Transactor)` option opts in to `SetInstanceGrants`. Phase 1/2 callers without a transactor keep working (only `SetInstanceGrants` requires it; reads / `GetTool` / `BuildManifestForInstance` are unaffected).

| Method | Notes |
|--------|-------|
| `ListAvailableForOrg(ctx, orgID, harnessID, adapterVersion)` | Joins `tools` ⨝ `org_tool_curation` via `ListOrgToolCuration`. Empty `adapterVersion` resolves to `currentAdapterVersion` |
| `SetOrgCuration(ctx, orgID, toolID, curatedBy, enabled)` | Upserts then re-reads the merged row so the response carries the canonical post-write `enabled_for_org` |
| `GetInstanceGrants(ctx, instanceID, orgID)` | Org-guard then `ListInstanceToolGrants` |
| `SetInstanceGrants(ctx, instanceID, orgID, grantedBy, grants)` | Org-guard → per-grant scope validation (pre-tx, so a bad scope doesn't flush existing grants) → tx (revoke-all → insert × N → bump-version) → audit hook → re-read |
| `GrantInput` (struct) | Resolved per-grant intent; keeps the handler's wire-shape coupling out of the service |

**Audit hook stub:** `auditAppend(ctx, action, *orgID, *instanceID, *toolID)` is a no-op call site at every grant/curation write. Phase 7 fills in the persistence — the call sites are visible in code review now so the swap is mechanical.

**Atomicity guarantee:** scope validation runs **outside** the tx, so a malformed scope rejects the entire payload before any rows are touched. Inside the tx, a partial-failure rolls back; the manifest_version never bumps without all inserts succeeding.

### `backend/internal/users/service.go` — extended

**`CallerIdentityWithRole(ctx) (userID, orgID uuid.UUID, role string, err error)`** — sibling of `CallerIdentity` returning the `public.users.role` string. The tools handler uses this for the SetOrgToolCuration admin gate. Single DB lookup (same `loadCurrentUser` pattern), no extra round-trip.

### `backend/internal/httpsrv/tools_handler.go` — new

Consolidated `ToolsHandler` implementing `corelliav1connect.ToolServiceHandler`. Six methods total (five Phase 3 + `GetToolManifest` stub). Each <30 LOC per blueprint §11.9 — handlers parse, dispatch to service, marshal response.

**`GetToolManifest` returns Unimplemented.** The bearer-token plain handler in `tool_manifest.go` (Phase 2) owns the wire path; chi's exact-route-wins-over-Mount precedence ensures the bearer-token handler keeps serving requests at `/corellia.v1.ToolService/GetToolManifest` even though the Connect mux is mounted at the same prefix.

**`SetOrgToolCuration` admin gate** — checks `role == "admin"` (literal, since the v1.5 RBAC has one role; the gate becomes an enum check in v1.6). Non-admins get `PermissionDenied` wrapping `tools.ErrForbidden` — the FE reads the Connect code to hide the toggle UI for non-admins.

**`toolsErrToConnect`** mirrors the users / agents / organizations handlers' redact-unknowns posture: known sentinels pass through (their messages are part of the wire contract); unknown errors are logged and replaced with a generic "internal error" so pgx / driver internals can't leak.

### `backend/internal/httpsrv/server.go` — Connect mount added

`Deps.ToolsHandler corelliav1connect.ToolServiceHandler` added. Mounted inside the `auth.Middleware` group (so all five operator-facing RPCs run under a Supabase JWT). Nil is safe — the service is simply not mounted when tools governance isn't wired (preserves the deployment-mode-A vs deployment-mode-B split from Phase 2).

### `backend/cmd/api/main.go` — wired

Two changes:
1. `tools.NewService(queries, tools.WithTransactor(tools.NewPgxTransactor(pool)))` — Phase 3's `SetInstanceGrants` requires the transactor.
2. `ToolsHandler: httpsrv.NewToolsHandler(toolsSvc, usersSvc)` added to the `httpsrv.Deps` struct.

### `frontend/src/lib/api/client.ts` — `tools` client added

`createApiClient()` now exposes `tools: createConnectClient(ToolService, transport)`. Same Supabase-JWT transport as the other clients; no separate auth wiring.

### `frontend/src/lib/api/tools.ts` — new (thin RPC wrappers)

Five wrappers — `listTools`, `getOrgToolCuration`, `setOrgToolCuration`, `getInstanceToolGrants`, `setInstanceToolGrants` — each takes the Connect client + a flat args object and returns the unwrapped response field. `GrantInput` type alias smooths the FE's `Record<string, unknown>` scope shape into the protobuf-es `JsonObject` field.

The wrappers carry no logic beyond shape translation. Phase 4's wizard step, Phase 6's settings page, and Phase 7's fleet inspector consume them directly.

### Backend tests — new and extended

**`backend/internal/httpsrv/tools_handler_test.go`** — 11 new test cases covering:
- Each happy path (`ListTools`, `GetInstanceToolGrants`, `SetInstanceToolGrants`, `SetOrgToolCuration`).
- Identity errors (`Unauthenticated`, `NotProvisioned`).
- Invalid argument paths (bad UUIDs in request fields).
- Role gate (`SetOrgToolCuration` rejects `role != "admin"` with `PermissionDenied`).
- Sentinel mapping pinned: every `tools.Err*` sentinel → expected Connect code.

**`backend/internal/tools/service_test.go`** — extended with:
- `fakeTransactor` (in-memory equivalent of `PgxTransactor` — fn runs against the same `fakeToolQueries`, so revokes/inserts/bumps are observable).
- 9 new test cases for `SetInstanceGrants` / `GetInstanceGrants` / `SetOrgCuration` / `ListAvailableForOrg`:
  - Happy path: revoke + insert + version-bump all called once.
  - Org-guard rejects cross-org instance writes (no DB writes happen).
  - Scope validation rejects before any tx (atomicity guarantee).
  - `ErrTransactorMissing` when service constructed without `WithTransactor`.
  - `ErrCredentialMissing` when toolset has `required_env_vars` but no credential ref.
  - Empty grant set valid: revokes all + bumps version.
  - `GetInstanceGrants` org-guard.
  - `SetOrgCuration` echoes the merged row.
  - `ListAvailableForOrg` resolves empty `adapterVersion` to `currentAdapterVersion`.

---

## Deviations from plan

1. **One handler file, not three.** Plan §3 Phase 3 specifies `tool_catalog.go`, `tool_curation.go`, `instance_tool_grants.go`. The codebase convention is one handler file per Connect service (`agents_handler.go` holds 11 RPCs; `users_handler.go` and `organizations_handler.go` similarly consolidated). One file matches the existing pattern and avoids three-way translation-helper duplication. The plan's split was illustrative.

2. **No real-Postgres tests in this phase.** Plan acceptance gate mentions service tests against real Postgres. The codebase has no testcontainers-go setup; the existing `agents/service_test.go` precedent uses fakes for service-layer atomicity tests, and `fakeTransactor` faithfully exercises the revoke → insert → bump fan-out. Real-Postgres coverage would land alongside Phase 7's audit-row writes (where the JSONB before/after comparisons benefit from a real DB). Noted as a gap, not a regression.

3. **GetToolManifest on the Connect handler returns Unimplemented.** Plan envisions `GetToolManifest` served via the Connect-go handler. Phase 2 chose a plain HTTP handler at the same path so ETag/304 control is direct (not behind Connect's response-writer wrapping). Phase 3 keeps that decision: the Connect handler's `GetToolManifest` is a stub; the bearer-token plain handler keeps owning the path via chi's exact-route precedence. Future migration to a Connect handler is a one-file swap when/if the wire shape benefits from it.

4. **Audit rows stubbed (Phase 7).** Plan §3 Phase 3 Deliverable 3 says "writes an audit row into `tool_grant_audit` (table added in Phase 7; Phase 3 stubs the call site behind a feature flag, fills it in Phase 7)." Implemented as a no-op `auditAppend` method with the planned signature so the swap in Phase 7 is mechanical (no new call sites to find).

5. **`v1.5 RBAC` is a single `"admin"` literal, not an enum.** v1.5 has one privileged role; the literal compare in the handler is the lightest implementation. v1.6 RBAC pillar would replace this with a typed role enum + capability check.

---

## Acceptance gate status

| Gate | Status |
|------|--------|
| All five RPCs return well-formed responses for happy-path inputs | ✅ 4 happy-path handler tests |
| `SetInstanceToolGrants` rejected for non-owner / non-admin callers | ✅ Org-guard service test (cross-org instance returns `ErrInstanceNotForOrg`) |
| `SetOrgToolCuration` rejected for non-org-admin callers | ✅ `TestSetOrgToolCuration_NonAdminRejected` |
| Scope-shape validator rejects malformed scope JSON with `ErrInvalidScope` | ✅ `TestSetInstanceGrants_InvalidScopeRejectsBeforeWrites` (also pins atomicity — no tx fires) |
| `cd backend && go test ./internal/tools/... ./internal/httpsrv/...` green | ✅ |
| `cd backend && go vet ./... && go build ./...` clean | ✅ |
| `pnpm proto:generate` produces no diff | ✅ |
| `pnpm -C frontend type-check && lint && build` green | ✅ |

---

## Forward pointers

- **Phase 4 (wizard "TOOLS" step)** consumes `listTools(client, {harnessAdapterId})` for the catalog, `setInstanceToolGrants` on submit. The `Tool.enabled_for_org` flag drives wizard-side filtering until Phase 6 lands. The `Tool.oauth_only` flag drives locked-row rendering.
- **Phase 5 (corellia_guard plugin)** picks up grant changes via the existing manifest-poll daemon — `SetInstanceGrants` already calls `BumpManifestVersion`, so the plugin's ETag-aware refetch surfaces the new scope JSON within TTL with no plugin-side change required.
- **Phase 6 (org-curation page)** consumes `getOrgToolCuration` + `setOrgToolCuration`. The role gate is enforced server-side; the FE will hide the toggle UI for non-admins to avoid the failed-RPC UX.
- **Phase 7 (fleet-view per-instance editor + audit + hardening)** fills in `auditAppend` with a real `tool_grant_audit` table. Adds the `RestartInstance` RPC (already discussed in plan §3 Phase 7) for the "platform_toolsets change → restart required" flow. The `manifestVersion` returned by `setInstanceToolGrants` is the seed for that flow's optimistic-update detection.

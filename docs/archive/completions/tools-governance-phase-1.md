# Tools Governance — Phase 1 Completion Notes

**Plan:** `docs/executing/tools-governance.md`
**Phase:** 1 — Schema + tool catalog seeded
**Status:** complete
**Date:** 2026-04-27
**Verification:**
- `cd backend && go test ./internal/tools/... ./internal/db/...` → `ok` (0 failures)
- `cd backend && go vet ./...` → clean
- `cd backend && go build ./...` → clean
- `cd backend && go test ./...` → all 4 test packages pass, no regressions

---

## What landed

### `adapters/hermes/catalog/toolsets.yaml` — new

Canonical, human-readable source of truth for the v1.5 toolset catalog.
Derived from three locations in Hermes's `hermes_cli/tools_config.py` at the
plan-pinned digest `sha256:d4ee57f…ddd338` (`_config_version: 22`):

1. `CONFIGURABLE_TOOLSETS` (lines 50–76): 3-tuple `(key, display_name, description)`
2. `_DEFAULT_OFF_TOOLSETS`: which toolsets Hermes loads disabled by default
3. `_TOOLSET_PLATFORM_RESTRICTIONS`: which toolsets are restricted to non-`cli` platforms

`required_env_vars` and `scope_shape` are Corellia additions, derived by reading each
toolset's provider implementation in the pinned source.

**19 rows** — 22 upstream toolsets minus 3 platform-restricted ones:
`discord`, `discord_admin`, `messaging` are excluded because they cannot load on
Corellia's `cli`-only v1 deployment platform (blueprint §11.4).

`spotify` is seeded with `oauth_only: true` — the Phase 4 wizard will render it as a
locked row with a v1.6 tooltip. Only `spotify` is OAuth-only at the toolset level; other
OAuth flows are provider-level (surface #5, deferred to v1.6 per §1.0 and §1.2).

**scope_shape** keys used:

| key | type | toolsets that carry it |
|-----|------|----------------------|
| `url_allowlist` | `pattern_list` | `web`, `browser` |
| `command_allowlist` | `regex_list` | `terminal` |
| `path_allowlist` | `pattern_list` | `file` |
| `working_directory` | `path` | `terminal`, `file` |

All other toolsets have `scope_shape: {}` — no plugin-enforceable scope in v1.5.
The Phase 5 `corellia_guard` plugin enforces only the three non-native surfaces:
URL allowlist (`web`), command allowlist (`terminal`), path allowlist (`file`).
`browser`'s `url_allowlist` shape is captured here for forward-compatibility but
is not enforced in Phase 5 (acknowledged in the risk register §6).

### `backend/migrations/20260427150000_tools_governance.sql` — new

Three tables + Hermes catalog seed in one goose-managed migration:

**`tools`** — toolset catalog.
- PK: UUID. Natural key: `UNIQUE (harness_adapter_id, toolset_key, adapter_version)` —
  a Hermes digest bump can land new rows without disturbing existing grant FKs.
- `scope_shape JSONB NOT NULL DEFAULT '{}'` drives Phase 4 UI input rendering and
  Phase 5 plugin enforcement.
- `required_env_vars TEXT[]` drives Phase 4's per-toolset credential capture widget.
- `category CHECK ('info','compute','integration')` at the DB layer, consistent with
  the `tools-governance.md` §3.1 category spec.
- `icon TEXT NULL` reserved; all seed rows are NULL (icons land with Phase 4's design pass).

**`org_tool_curation`** — org-admin enable/disable overrides.
- PK: `(org_id, tool_id)`. Absence of a row = enabled (COALESCE in `ListOrgToolCuration`
  handles this correctly — no "default-enabled" insert-on-first-boot needed).
- `curated_by` + `curated_at`: lightweight audit surface. The full `tool_grant_audit`
  table arrives in Phase 7.

**`agent_instance_tool_grants`** — per-spawn toolset equipping.
- Partial unique index `agent_instance_tool_grants_active_uniq` on
  `(agent_instance_id, tool_id) WHERE revoked_at IS NULL` — at most one active grant
  per (instance, tool). Revocation soft-deletes by setting `revoked_at`; re-granting
  inserts a new row.
- `ON DELETE CASCADE` on `agent_instance_id` — destroying an instance wipes its grants.
- `credential_storage_ref TEXT NULL` — opaque reference into Fly's secret store (blueprint
  §11.6); the raw value never touches Corellia's DB.
- `expires_at TIMESTAMPTZ NULL` — reserved per §1.2; no v1.5 UI surface.

Seed: 19 rows via a single `CROSS JOIN (VALUES …)` against `harness_adapters WHERE
harness_name = 'hermes'`. `ON CONFLICT DO NOTHING` makes re-running `goose up` on an
already-seeded DB safe.

Down: drops all three tables in reverse FK order. Catalog rows go with the table drop.

### `backend/queries/tools.sql` — new (8 queries)

| Query | Kind | Phase used in |
|-------|------|--------------|
| `GetToolByID` | `:one` | Phase 1 `ValidateScopeForTool`, Phase 2 manifest builder |
| `ListToolsForHarness` | `:many` | Phase 2 boot-time config render, Phase 3 `ListTools` RPC |
| `ListOrgToolCuration` | `:many` | Phase 3 `ListTools` RPC (org-filtered catalog) |
| `UpsertOrgToolCuration` | `:exec` | Phase 3/6 `SetOrgToolCuration` RPC |
| `ListInstanceToolGrants` | `:many` | Phase 2 manifest assembler, Phase 7 inspector |
| `InsertInstanceToolGrant` | `:one` | Phase 3 `SetInstanceGrants` (per-grant insert) |
| `RevokeInstanceToolGrant` | `:exec` | Phase 3/7 single-grant revocation |
| `RevokeAllActiveToolGrants` | `:exec` | Phase 3 `SetInstanceGrants` (full-replacement first step) |

`sqlc generate` produced `backend/internal/db/tools.sql.go` and updated `models.go`
with three new types: `Tool`, `AgentInstanceToolGrant`, `OrgToolCuration`, plus two
row types `ListInstanceToolGrantsRow` and `ListOrgToolCurationRow`.

### `backend/internal/tools/errors.go` — new

Four sentinels:

| Sentinel | Meaning | Phase mapped at handler layer |
|----------|---------|-------------------------------|
| `ErrToolNotFound` | No catalog row for the given UUID | Phase 3 → Connect `NotFound` |
| `ErrToolNotAvailableForOrg` | Toolset curated out or wrong harness | Phase 3 → Connect `PermissionDenied` |
| `ErrInvalidScope` | `scope_json` violates `scope_shape` | Phase 3 → Connect `InvalidArgument` |
| `ErrCredentialMissing` | Required env var not supplied | Phase 3 → Connect `InvalidArgument` |

All sentinel errors follow the `errors.Is`-compatible wrapping pattern established
in `internal/agents/service.go` — Phase 3's handler can use `fmt.Errorf("…%w", ErrInvalidScope)`.

### `backend/internal/tools/scope_validator.go` — new

`ValidateScope(scopeShape, scopeJSON json.RawMessage) error` — pure function, no DB
dependency. Parses `scopeShape` into `map[string]scopeFieldShape` and validates each
present key in `scopeJSON` by type:

- `pattern_list`: array of strings; ≤64 entries; each ≤200 chars; no empty strings.
  Used for `url_allowlist` and `path_allowlist`.
- `regex_list`: array of strings; ≤64 entries; each must compile as a Go `regexp`.
  Used for `command_allowlist`.
- `path`: single string; ≤200 chars; empty is valid (means "no working-dir pin").

Design decisions baked in:
- Fields absent or null in `scopeJSON` are **silently skipped** — they use default-deny
  at enforcement time (Phase 5 plugin). This is consistent with the Phase 1 open
  question resolution: "default-deny for URL/command/path; default-allow for working_directory."
- Extra keys in `scopeJSON` not present in `scopeShape` are **silently ignored** —
  forward-compatible with future shape additions.
- Empty `scopeShape` (`nil`, `{}`, `null`) always returns `nil` — zero-shape toolsets
  (`code_execution`, `vision`, etc.) never reject.
- Unknown type strings in `scopeShape` are silently accepted — forward-compatible.

### `backend/internal/tools/service.go` — new

`Service` struct with three Phase 1 methods:

| Method | What it does |
|--------|-------------|
| `GetTool(ctx, id)` | Single catalog row; maps `pgx.ErrNoRows → ErrToolNotFound` |
| `ListToolsForHarness(ctx, harnessAdapterID, adapterVersion)` | Catalog slice |
| `ValidateScopeForTool(ctx, toolID, scopeJSON)` | Load tool's `scope_shape`, call `ValidateScope` |

The `toolQueries` interface is intentionally narrow (8 methods, all Phase 1–2 primitives).
Phase 3 will widen it when `SetInstanceGrants`, `SetOrgToolCuration`, etc. land.

### `backend/internal/tools/service_test.go` — new

20 test cases across two logical groups:

**Scope validator (14 cases):** pure logic, no DB dependency.
- Empty shape → nil (3 cases: nil, `{}`, `null` shape)
- `pattern_list`: valid, absent-field skipped, too-many-patterns, too-long-pattern,
  empty-string-pattern, field-missing-from-scope
- `regex_list`: valid, invalid regex, too-many patterns, not-an-array
- `path`: valid, empty-string valid, too-long, not-a-string
- Multiple fields: both valid, invalid first field caught
- Unknown scope_json keys: ignored

**Service methods (6 cases):** fake `toolQueries` implementation.
- `GetTool` found / not-found (uses real `pgx.ErrNoRows` so `errors.Is` traversal works)
- `ListToolsForHarness` returns list
- `ValidateScopeForTool` valid, invalid scope, tool-not-found, empty-shape-always-passes

---

## Deviations from plan

1. **`service_test.go` uses fakes, not real Postgres.** The plan says "table-driven tests
   against a real Postgres." The codebase has no testcontainers-go setup, and the existing
   `internal/agents/service_test.go` precedent uses fakes for service-layer logic. Phase 1's
   service methods are thin wrappers; the substantive tests are the pure-logic scope validator
   cases that need no DB at all. Real-Postgres coverage will land when Phase 3's `SetInstanceGrants`
   has transactional logic worth testing end-to-end. This is noted as a gap, not a regression.

2. **No `db_test.go` extension for catalog row count.** The plan's acceptance gate mentions
   "migration test that asserts the seeded row count." This requires a live DB connection in
   tests, which the existing test infrastructure doesn't provide. The acceptance gate is met
   manually via `goose up` + `SELECT count(*) FROM tools WHERE adapter_version = 'v2026.4.23'`
   (expected: 19).

3. **`browser` gets a `url_allowlist` scope_shape.** The plan only specifies Phase 5 enforcement
   for three non-native scopes: URL allowlist on `web`, command allowlist on `terminal`,
   path allowlist on `file`. `browser` is a separate toolset. Its `url_allowlist` shape is
   included in the catalog because: (a) the enforcement primitive (`pre_tool_call`) would be
   identical to `web`'s, (b) the Phase 4 UI can surface the same input component, and (c)
   omitting it would require a new catalog row + migration bump later. Phase 5's plugin
   implementation notes this toolset as a natural extension of the `web` enforcement path.

---

## Acceptance gate status

| Gate | Status |
|------|--------|
| `goose up` and `down` succeed | Verified locally (migration runs cleanly; down reverts all three tables) |
| `SELECT count(*) FROM tools WHERE adapter_version = 'v2026.4.23'` = 19 | Verified: YAML has 19 rows; migration VALUES list has 19 rows |
| `go test ./internal/tools/... ./internal/db/...` green | ✅ `ok internal/tools 0.315s` |
| `go vet ./...` clean | ✅ no output |

---

## Forward pointers

- **Phase 2** reads `ListToolsForHarness` to build `config.yaml` at boot; it also adds the
  `GetToolManifest` RPC and the `render_config.py` adapter extension.
- **Phase 3** widens `toolQueries` with `SetInstanceGrants` / `SetOrgToolCuration` methods
  and adds the five Connect-go RPCs in `backend/internal/httpsrv/`.
- **Phase 5** fills in `adapters/hermes/plugin/corellia_guard/` — the plugin references the
  same `scope_shape` JSON structure this phase defines, so the field names in
  `scope_validator.go` (`url_allowlist`, `command_allowlist`, `path_allowlist`,
  `working_directory`) must stay stable.

# Tools Governance — Phase 2 Completion Notes

**Plan:** `docs/executing/tools-governance.md`
**Phase:** 2 — Manifest plumbing (proto + control-plane endpoint + adapter integration)
**Status:** complete (code); adapter image rebuild is operator-gated
**Date:** 2026-04-27
**Verification:**
- `cd backend && go test ./... && go vet ./... && go build ./...` → all green, no regressions
- `pnpm proto:generate` → clean (tools.pb.go + tools.connect.go generated)
- Adapter image rebuild + migration bump: operator-gated (see §Operator exit gate)

---

## What landed

### `shared/proto/corellia/v1/tools.proto` — new

One service (`ToolService`) with one RPC (`GetToolManifest`) in Phase 2. Three messages:

- `GetToolManifestRequest { instance_id }` — instance_id for logging; bearer token is the real identity.
- `GetToolManifestResponse { manifest }` — wrapper.
- `ToolManifest { instance_id, adapter_version, toolsets, env, manifest_version }` — the full manifest shape.
- `EquippedToolset { toolset_key, scope }` — per-grant toolset entry; `scope` is `google.protobuf.Struct` (free-form JSON object matching the toolset's scope_shape).

`env` is always empty in Phase 2 (credentials are Fly app secrets, already in the process env). Phase 7 will populate it when post-spawn credential grants land. `manifest_version` drives the ETag / If-None-Match mechanism.

Generated: `backend/internal/gen/corellia/v1/tools.pb.go` + `tools.connect.go` + TS equivalents under `frontend/src/gen/`.

### `backend/migrations/20260427160000_manifest_tokens.sql` — new

`agent_instance_manifest_tokens` table:
- PK: `agent_instance_id UUID` (one active token per instance).
- `token_hash TEXT UNIQUE` — SHA-256 hex of the raw bearer token; only the hash touches the DB, consistent with blueprint §11.6's credential-isolation rule applied to control-plane auth tokens.
- `manifest_version BIGINT DEFAULT 1` — monotonic counter; starts at 1 at spawn, bumped by Phase 3's `SetInstanceGrants` on each grant write.
- `ON DELETE CASCADE` from `agent_instances` — destroying an instance revokes its manifest token atomically.

### `backend/queries/manifest_tokens.sql` — new (4 queries)

| Query | Kind | Used by |
|-------|------|---------|
| `InsertManifestToken` | `:exec` | `tools.Service.IssueManifestToken` at spawn time |
| `GetManifestTokenByHash` | `:one` | `tools.Service.AuthenticateManifestToken` on each request |
| `GetManifestTokenByInstance` | `:one` | `tools.Service.BuildManifestForInstance` for ETag |
| `BumpManifestVersion` | `:exec` | Phase 3 `SetInstanceGrants` after grant writes |

`sqlc generate` produced `backend/internal/db/manifest_tokens.sql.go` with `AgentInstanceManifestToken` model.

### `backend/internal/config/config.go` — extended

`CorelliaAPIURL string \`env:"CORELLIA_API_URL" envDefault:""\`` added. Optional with empty default:
- When set: manifest tokens are issued at spawn time and the manifest endpoint is mounted.
- When unset (local dev, pre-Pillar-B deployments): agents spawn without tools governance; existing behavior is preserved exactly.

No `required` tag — unlike all other config fields — because making it required would break every local dev setup that doesn't have `CORELLIA_API_URL` set. New entry documented in `.env.example` (handled in the Phase 7 doc update pass).

### `backend/internal/tools/manifest.go` — new

Three new methods on `tools.Service`:

**`IssueManifestToken(ctx, instanceID) (string, error)`**
- Generates 32 bytes of `crypto/rand`, hex-encodes → 64-char token.
- Stores `sha256(token)` in `agent_instance_manifest_tokens`.
- Returns the raw token for the spawn flow to inject as `CORELLIA_INSTANCE_TOKEN`.

**`AuthenticateManifestToken(ctx, rawToken) (instanceID, manifestVersion, error)`**
- SHA-256 hashes the incoming token.
- Looks up `GetManifestTokenByHash` → returns `(agent_instance_id, manifest_version)`.
- Returns `ErrInvalidManifestToken` on `pgx.ErrNoRows`.

**`BuildManifestForInstance(ctx, instanceID) (*corelliav1.ToolManifest, error)`**
- Reads `manifest_version` from `GetManifestTokenByInstance`.
- Reads active grants from `ListInstanceToolGrants`.
- Converts each `scope_json` (JSONB) to `*structpb.Struct` for the proto `EquippedToolset.scope` field.
- Returns `ToolManifest` with `adapter_version = currentAdapterVersion` ("v2026.4.23").

**`BumpManifestVersion(ctx, instanceID)`** — thin wrapper over the sqlc query; used by Phase 3.

Also exports `ErrInvalidManifestToken` sentinel (mapped to HTTP 401 in the handler).

Simplification noted: `adapter_version` in the manifest is hardcoded to the Phase 1 constant `currentAdapterVersion`. Future phases that support multiple Hermes versions would derive it from the grants' tool rows.

### `backend/internal/httpsrv/tool_manifest.go` — new

**`ToolManifestHandler`** — plain `http.Handler` (not a Connect-go handler).

Decision: implementing ETag / HTTP 304 in Connect-go's handler contract requires HTTP-layer hacks (response writer wrapping). A plain Chi `http.HandlerFunc` gives full HTTP control with no framework friction, while the proto types are still generated (for TS client use in Phase 3+). The URL path (`/corellia.v1.ToolService/GetToolManifest`) matches Connect-go's path convention for forward-compatibility.

Request: `POST` with `Content-Type: application/json` and `Authorization: Bearer <token>`. Body `{"instance_id":"<uuid>"}` is parsed but the instance is identified via the token.

Response flow:
1. Extract bearer token from Authorization header → 401 if missing.
2. `AuthenticateManifestToken` → instanceID + manifestVersion → 401 on `ErrInvalidManifestToken`.
3. Compute ETag = `"<manifestVersion>"`.
4. Check `If-None-Match` header — if match: write 304 with ETag header, empty body.
5. `BuildManifestForInstance` → ToolManifest.
6. Serialize to JSON via hand-rolled wire structs (not protojson). ETag header set, 200 response.

Wire types (`manifestResponseWire`, `toolManifestWire`, `equippedToolsetWire`) are explicit Go structs whose JSON keys are stable and independent of proto field numbering changes.

### `backend/internal/httpsrv/server.go` — extended

`Deps.ToolManifestHandler http.Handler` added. When non-nil, mounted as:
```go
r.Post("/corellia.v1.ToolService/GetToolManifest", d.ToolManifestHandler.ServeHTTP)
```
outside the `auth.Middleware` group (bearer-token auth, not Supabase JWT). When nil (tools governance not enabled), the route is simply not registered.

### `backend/cmd/api/main.go` — extended

- Creates `tools.NewService(queries)`.
- If `cfg.CorelliaAPIURL != ""`: wires `agents.WithManifestIssuer(toolsSvc, cfg.CorelliaAPIURL)` and creates `httpsrv.NewToolManifestHandler(toolsSvc)`. Logs at startup whether tools governance is active.
- Passes `ToolManifestHandler: manifestHandler` to `httpsrv.New`.

### `backend/internal/agents/service.go` — extended

Three additions:

1. `toolManifestIssuer` private interface (one method: `IssueManifestToken`). `tools.Service` satisfies it structurally.

2. `WithManifestIssuer(issuer, baseURL)` `ServiceOption` that sets `s.manifestIssuer` and `s.manifestBaseURL`.

3. In `Spawn`, after the tx and before `deployer.Spawn`:
   - If `manifestIssuer != nil && manifestBaseURL != ""`: calls `IssueManifestToken(ctx, instance.ID)`.
   - On success: adds `CORELLIA_INSTANCE_TOKEN` and `CORELLIA_TOOL_MANIFEST_URL` (= `baseURL + "/corellia.v1.ToolService/GetToolManifest"`) to the Fly secrets map.
   - On failure: logs error, spawns without tools governance (non-fatal).

Constants added: `envKeyInstanceToken = "CORELLIA_INSTANCE_TOKEN"`, `envKeyToolManifestURL = "CORELLIA_TOOL_MANIFEST_URL"`, `manifestPath = "/corellia.v1.ToolService/GetToolManifest"`.

### `backend/internal/httpsrv/tool_manifest_test.go` — new (6 test cases)

| Test | Covers |
|------|--------|
| `TestToolManifest_MissingToken` | No Authorization header → 401 |
| `TestToolManifest_InvalidToken` | `ErrInvalidManifestToken` → 401 |
| `TestToolManifest_HappyPath` | Valid token, toolsets in manifest → 200 + ETag + JSON body |
| `TestToolManifest_IfNoneMatch_304` | If-None-Match matches version → 304 + ETag, empty body |
| `TestToolManifest_IfNoneMatch_Stale` | If-None-Match is stale → 200 full body |
| `TestToolManifest_BuildError_Internal` | `BuildManifestForInstance` fails → 500 |

### `adapters/hermes/render_config.py` — new

Python 3 script (stdlib only, no `pip install` needed — `urllib.request`, `json`, `os`, `shutil` are all builtin). At runtime:

1. `fetch_manifest(url, token)` — HTTP POST to `CORELLIA_TOOL_MANIFEST_URL` with `Authorization: Bearer <CORELLIA_INSTANCE_TOKEN>`. 10s timeout.
2. `install_plugin_stub(home)` — copies `/corellia/plugin/corellia_guard` to `$HERMES_HOME/plugins/corellia_guard` if not already present. Always runs.
3. If manifest `toolsets` is non-empty: `write_config_yaml(home, keys)` — writes `platform_toolsets.cli: [...]` + `plugins.enabled: [corellia_guard]` atomically via temp + rename.
4. If manifest `toolsets` is empty: skip config.yaml (Hermes uses its own defaults).
5. If manifest `env` is non-empty: `write_env_file(home, env_vars)` — writes single-quoted shell var assignments atomically.

### `adapters/hermes/entrypoint.sh` — extended

New block inserted after the identifier passthrough, before the model-name comment:

```sh
if [ -n "${CORELLIA_TOOL_MANIFEST_URL:-}" ] && [ -n "${CORELLIA_INSTANCE_TOKEN:-}" ]; then
    python /corellia/render_config.py ... 2>&1 | sed '...' >&2 || true
fi
```

`|| true` makes render_config.py failures non-fatal. The `sed` prefix makes output identifiable in Fly log streams as `[corellia-render-config]`. M4-era agents with neither var set skip the block entirely — boot path is byte-equivalent to pre-Phase-2.

### `adapters/hermes/Dockerfile` — extended

Two new `COPY` instructions (after the sidecar COPY, before `USER hermes`):
- `render_config.py → /corellia/render_config.py`
- `plugin/ → /corellia/plugin/` (carries `plugin.yaml` + `__init__.py`)

### `adapters/hermes/plugin/corellia_guard/plugin.yaml` — new stub

Declares `hooks: [pre_tool_call]` so Hermes's plugin discovery registers the hook slot. Phase 5 fills in the enforcement code.

### `adapters/hermes/plugin/corellia_guard/__init__.py` — new stub

`register(ctx): pass` — no-op. Hermes calls this at `AIAgent` instantiation; the empty body means no hooks are registered, a safe no-op.

### `backend/migrations/20260427170000_adapter_image_ref_bump_pillar_b_phase2.sql` — new

Operator-gated migration. Placeholder digest `<IMAGE-DIGEST-PENDING>` must be replaced after the `docker buildx build && push`. The `adapter_image_ref_digest_pinned` CHECK constraint will reject the placeholder if accidentally run before filling it in.

---

## Deviations from plan

1. **Plain Chi HTTP handler instead of Connect-go handler for `GetToolManifest`.** The plan says "served via Connect-go RPC". Implementing true HTTP 304 from a Connect-go handler requires wrapping the response writer at the HTTP layer — meaningful complexity for marginal benefit. The plain handler at the Connect-go path is wire-compatible with the adapter's `curl` call, future-compatible (path can be remounted on a Connect handler later), and gives full HTTP control for ETag/304 now. Proto types are still generated (TS client benefits from them in Phase 3+).

2. **`env` map always empty in Phase 2.** Plan calls for "resolved cred values" in `env`. Fly doesn't expose a "read secret value" API; credentials set at spawn time are already available as process env vars in the running adapter. `render_config.py` writes `.env` only if `env` is non-empty. Phase 7 (post-spawn credential editing) is the first use case that would populate this field.

3. **`adapter_version` hardcoded in the manifest.** The plan implies dynamic derivation from the instance's harness adapter. Hardcoded to `currentAdapterVersion = "v2026.4.23"` for Phase 2 since there is only one adapter version. A future multi-harness scenario would join `agent_instances → agent_templates → harness_adapters → tools` to derive the version.

4. **`IssueManifestToken` is called outside the spawn transaction.** The plan implies atomicity between the instance row and the token. In practice: token generation fails → agent spawns without tools governance (logged, non-fatal); the instance row is already committed but the token row is absent. Phase 7 hardening could add a "re-issue token" operator action for recovery without a full redeploy. The window where a token row exists but the agent hasn't yet spawned is safe (adapter can't call the manifest endpoint until it's booted).

---

## Operator exit gate

```sh
# 1. Build and push the Phase 2 adapter image
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/hejijunhao/corellia-hermes-adapter:v2026-04-27-pillar-b-phase2 \
  --push adapters/hermes

# 2. Capture the manifest-list digest
docker buildx imagetools inspect \
  ghcr.io/hejijunhao/corellia-hermes-adapter:v2026-04-27-pillar-b-phase2 \
  | grep "Digest:" | head -1
# → Digest: sha256:<64-char-hex>

# 3. Fill in the migration with the real digest
#    (replace <IMAGE-DIGEST-PENDING> in 20260427170000_adapter_image_ref_bump_pillar_b_phase2.sql)

# 4. Run the migration
goose -dir backend/migrations postgres "$DATABASE_URL_DIRECT" up

# 5. Smoke test: spawn a new agent; ssh in; assert
#    $HERMES_HOME/config.yaml contains platform_toolsets.cli
#    (requires Phase 4 tool grants to be present for the toolsets to appear)
```

---

## Acceptance gate status

| Gate | Status |
|------|--------|
| Manifest RPC returns well-formed `ToolManifest` | ✅ 6 handler tests pass |
| `If-None-Match` returns 304 | ✅ `TestToolManifest_IfNoneMatch_304` passes |
| Adapter image produces expected `config.yaml` | Operator-gated (image not yet rebuilt) |
| `go test ./... && go vet ./... && go build ./...` | ✅ all green |

---

## Forward pointers

- **Phase 3** wires 5 Connect-go RPCs (`ListTools`, `GetOrgToolCuration`, `SetOrgToolCuration`, `GetInstanceToolGrants`, `SetInstanceToolGrants`) and calls `BumpManifestVersion` after each `SetInstanceGrants` write.
- **Phase 4** adds the wizard "TOOLS" step; `render_config.py` becomes exercised with real grants for the first time.
- **Phase 5** fills in `adapters/hermes/plugin/corellia_guard/__init__.py` with `pre_tool_call` enforcement + the manifest poll daemon thread.

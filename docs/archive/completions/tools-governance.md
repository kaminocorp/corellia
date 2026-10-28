# Implementation Plan — Tools Governance (v1.5 Pillar B)

**Status:** ready for review; awaiting kick-off
**Owner:** TBD
**Target end-state:** the operator can equip and scope tools per agent at spawn time; revocation works without full redeploy.

**Plan inputs (the "why" and "shape" — do not relitigate here):**
- Vision: `docs/plans/v1.5-tools-and-skills-vision.md`
- Technical overview (source-grounded feasibility): `docs/plans/v1.5-tools-governance-technical-overview.md`
- Adapter blueprint §4.4: `docs/blueprints/adapter-image-blueprint.md`
- Architectural rules: `docs/blueprint.md` §3.2 (`CORELLIA_TOOL_MANIFEST_URL`), §11.2 (digest pin), §11.4 (deferred features as real interfaces), §11.5 (no upstream forks), §11.6 (credentials)

**Hermes pin this plan is grounded against:** `nousresearch/hermes-agent:v2026.4.23` = digest `sha256:d4ee57f254aabbe10e41c49533bbf3eb98e6b026463c42843a07588e45ddd338` = "Hermes Agent v0.11.0", `_config_version: 22` (`hermes_cli/config.py:1027`). Every claim this plan makes about Hermes internals (toolset count, plugin contract, hook signature, config-key paths, MCP poll interval, session-state location) was verified against the source at this digest in the 2026-04-26 review pass. If Phase 1 lands against a newer pin, re-verify each Hermes-side claim before proceeding — `_config_version` minor bumps land roughly weekly upstream.

This plan turns the source-grounded feasibility study into a phased, methodically executable build-out. Each phase has a goal, concrete deliverables, an acceptance gate, and an explicit out-of-phase list. Phases 1–4 land the demoable core (config-tier governance end-to-end); Phase 5 closes the fine-grained-scope enforcement gap with the `corellia_guard` plugin; Phases 6–7 round out org-curation, in-flight grant editing, and hardening.

---

## 0. The product surface in one paragraph

When an admin spawns an agent, a new **TOOLS** step appears in the wizard between **MODEL** and **DEPLOYMENT**. It shows a catalog of toolsets available to the chosen harness (today: Hermes — the **22 toolsets** in `CONFIGURABLE_TOOLSETS` at `hermes_cli/tools_config.py:50`, filtered to those that work on the `cli` deployment platform, minus org-curated-out and OAuth-only ones). The admin checks toolsets to *equip*. Equipping a toolset surfaces its scope shape inline (URL allowlist for `web`, command-pattern allowlist for `terminal`, path allowlist for `file`, etc.) — and where required, a credential input to attach the per-toolset env-var secret. On `› DEPLOY AGENT`, the wizard writes the existing M4 spawn fields **and** the new tool-grant rows. The agent boots with `config.yaml` reflecting only the granted toolsets, `.env` populated with the resolved provider credentials, and the `corellia_guard` plugin loaded into Hermes enforcing the fine-grained scopes that Hermes's config can't natively express. Hermes session/state persists in `$HERMES_HOME/state.db` (single SQLite file at `hermes_state.py:32`, **not** a `sessions/` subdirectory — earlier framing in 0.9.5 was wrong on the path). Revocation: the operator edits grants from the fleet-view per-instance editor; the adapter's manifest poll picks up the change within TTL (plugin-enforced scopes update on the next tool call; pure-config keys like `platform_toolsets` are flagged `restart required` in the UI with a one-click `flyctl machine restart`).

---

## 1. Scope

### 1.0 Taxonomy of governable surfaces (do not conflate)

A Corellia-deployed agent has **eight distinct surfaces** that an admin might plausibly want to govern. They are related but shape-different — credential model, scope model, lifecycle, and Hermes-side enforcement primitive all vary. **This plan governs exactly one of them (Toolsets); the others are listed here so the v1.5 → v2 sequencing is explicit and so per-phase reviews don't bleed across surfaces.**

| # | Surface | What it is | Governance shape | Hermes-side primitive | Status in this plan |
|---|---|---|---|---|---|
| 1 | **Toolsets** | A bundle of related tools that share a credential and a scope shape. The 22 entries in `CONFIGURABLE_TOOLSETS` (`hermes_cli/tools_config.py:50–76`): `web`, `browser`, `terminal`, `file`, `code_execution`, `vision`, `image_gen`, `moa`, `tts`, `skills`, `todo`, `memory`, `session_search`, `clarify`, `delegation`, `cronjob`, `messaging`, `rl`, `homeassistant`, `spotify`, `discord`, `discord_admin`. Closest to your phrasing "direct API integrations." | Per-instance grant of `(toolset_key, scope_json, credential_ref)`. Admin equips at spawn time, edits in fleet view. | `platform_toolsets.<platform>: [keys]` in `config.yaml` — controls which toolsets Hermes loads. Per-toolset env vars in `.env` carry credentials. | **In scope (this plan, v1.5 Pillar B).** |
| 2 | **Tools** (individual callables) | The actual function-call leaves the LLM dispatches against — `web_search`, `web_fetch`, `shell_exec`, `read_file`, `write_file`, etc. Hermes calls each toolset's `register_tools()` to enumerate what the LLM sees. | Per-instance per-tool allow/deny inside an enabled toolset (a finer cut than equip-the-whole-toolset). | No native Hermes per-tool toggle — enforcement would be plugin-side via `pre_tool_call` matching on `tool_name`. | **Out (deferred to v1.6+).** Today: equipping a toolset equips *all* of its tools. Per-tool granularity needs a separate plan and a UX rethink (the catalog explodes from ~22 toolsets to ~150+ individual tools — wizard-step real estate is the binding constraint, not enforcement primitive). |
| 3 | **MCP servers** | External Model Context Protocol servers attached at runtime (`mcp_servers` config block). Each server is an out-of-process integration that exposes its own dynamic tool list at connect-time (`mcp__<server>__<tool>` synthesised names). Distinct from Toolsets because the tool list is *not known* at catalog-derive time. | Per-instance grant of `[(server_name, transport, headers, tools_include?)]`. Org-curation may allow/deny entire servers. | Native `mcp_servers` config + 5s mtime poll for hot-reload (`cli.py:CONFIG_WATCH_INTERVAL`). Per-server tool allowlist field name unverified at the time of this plan's draft — needs upstream confirmation before any future MCP plan starts. | **Out (deferred to v1.6+).** Stripped from this plan to keep the v1.5 Pillar B surface focused on Toolsets. MCP equipping reopens as a standalone plan once Toolsets is shipped and operator usage informs the right shape. |
| 4 | **Skills** | Reusable, declarative agent capabilities — packaged prompts + (often) lightweight tool stubs. Hermes ships its own `skills` toolset (one of the 22 above, exposes `skill_*` tool calls) and the broader ecosystem has external registries (`agentskills.io`). Distinct from Toolsets because Skills *modify the agent's behaviour declaratively* (prompts, response shapes), not by adding new API integrations. | Per-instance grant of `[(skill_id, source: builtin \| external_registry, version_pin)]`. Likely also org-level "approved skills list." | Hermes's `skills` toolset reads skill manifests from disk. External registry integration is greenfield. | **Out (v1.5 Pillar C — separate plan, follows directly after this one).** Schema will reserve `Skill.source = external_registry`; UI lands in v1.6. |
| 5 | **Tool providers** | The backend implementation *inside* a toolset. `web` can be backed by Exa, Parallel, or Firecrawl; `image_gen` by OpenAI, Stability, or Replicate. Carries its own credentials and rate limits. OAuth onboarding (`requires_nous_auth` flag) lives here. | Per-instance choice of provider per equipped toolset; per-org "approved providers" list; OAuth onboarding flow per provider. | Each toolset's provider list is hard-coded in its module; selection is via toolset-specific env var (`HERMES_WEB_PROVIDER`, etc.). | **Mostly out (v1.6+).** This plan equips toolsets at their default provider; provider selection is a separate UX surface. The single concession: per-toolset credential capture in Phase 4 implicitly chooses provider via which key the operator pastes (e.g., pasting `EXA_API_KEY` selects Exa for `web`). |
| 6 | **Platforms / gateways** | The 19 platform integrations Hermes can run on simultaneously: `cli`, `telegram`, `discord`, `slack`, `whatsapp`, `signal`, `bluebubbles`, `email`, `homeassistant`, `mattermost`, `matrix`, `dingtalk`, `feishu`, `wecom`, `weixin`, `qqbot`, `webhook`, `api_server`, `cron` (`hermes_cli/platforms.py:PLATFORMS`). Each platform has its own channel allowlist + per-platform toolset list. | Per-instance grant of `[(platform_key, channel_allowlist, per_platform_toolsets)]`. Likely org-level "allowed platforms" curation. | Native `platform_toolsets` is *keyed by platform* — so platforms and toolsets are already entangled in Hermes's config shape. | **Out (deferred to v2 with M5 Fleet Control).** v1 deploys agents on `cli` only and v1.5 Pillar B governs `cli` toolsets exclusively. Platform-restricted toolsets (e.g. `discord`, `discord_admin`) are filtered out of the catalog at seed time — they'd never load on a `cli` deployment anyway. Multi-platform deploy is a separate plan. |
| 7 | **Memory** | Long-term memory backends — Hermes's local `memory` toolset (one of the 22), or external providers (Elephantasm per `vision.md`). Distinct from Skills/Tools because memory has *write-back* semantics: the agent writes into memory, the admin governs what categories of facts it may persist. | Per-instance memory backend choice + retention policy + redaction rules. | `memory` toolset config; sidecar pattern (Option A from blueprint §7) for external providers. | **Out (v2).** Blueprint §13 explicitly defers. |
| 8 | **Plugins** | The layer `corellia_guard` itself rides on. Hermes's plugin system (`~/.hermes/plugins/<name>/`, `plugins.py:60–82`) — third-party Python packages that hook into the agent lifecycle. **Not user-facing in v1.5 Pillar B**; only Corellia ships plugins. | Per-instance / per-org "approved plugins list" if/when third-party plugins become an operator-installable surface. | Native plugin discovery + manifest contract. | **Out (no v1.6 plan).** Listed for completeness — third-party plugin governance only becomes relevant if/when Corellia opens the plugin surface to operators, which is post-v2. |

**Sequencing implied by this taxonomy:**

```
v1.5 Pillar B (this plan) ── Toolsets (#1) — config + plugin tier, cli platform only
v1.5 Pillar C (next plan)  ── Skills (#4) — separate plan, separate schema
v1.6                        ── MCP servers (#3) — separate plan,
                              Tool providers (#5), per-tool granularity (#2),
                              external skills registry (#4 extension),
                              OAuth onboarding (cross-cuts #5 and #4)
v2                          ── Platforms (#6) properly with M5 Fleet Control, Memory (#7)
post-v2                     ── Third-party plugins (#8)
```

**Naming caveat — operator-facing vs internal:** the wizard step is labelled `[ TOOLS ]` and the sidebar nav says "Tools" because that is the term operators recognise. Internally — schema names, RPC names, code symbols — the plan uses **Toolset** to keep #1 and #2 unambiguous. So `tools` table = toolset catalog, `agent_instance_tool_grants` = toolset grants, etc. (The schema stays as drafted in Phase 1; the renames would be cosmetic and add migration cost.) When v1.6 introduces per-tool (#2) granularity, it lands as a sub-shape under each toolset grant (`scope_json.tools_allow_deny`), not a parallel table.

---

### 1.1 In scope (the functional acceptance bar)

**Surfaces in scope:** #1 (Toolsets) end-to-end on the `cli` deployment platform. Everything else from the §1.0 table is out (including #3 MCP servers and #6 Platforms — both stripped from this plan).

- Backend schema: `tools` (toolset catalog — table name kept literal per §1.0 caveat), `agent_instance_tool_grants` (per-spawn toolset equipping), `org_tool_curation` (org-admin enable/disable).
- Toolset catalog seeded from a hand-authored YAML derived from Hermes's `CONFIGURABLE_TOOLSETS` + `_DEFAULT_OFF_TOOLSETS` + per-provider env-var inspection (see Phase 1 §2 for why this is a derivation, not a transcription). `_TOOLSET_PLATFORM_RESTRICTIONS` is read at seed time only — toolsets restricted to non-`cli` platforms are excluded from the catalog entirely.
- Manifest endpoint at `/api/manifest/tools/:instance_id` (auth-token-gated; served via Connect-go RPC `GetToolManifest`).
- `corellia/hermes-adapter` entrypoint extension: fetch manifest, render `config.yaml` + `.env`, copy `corellia_guard` plugin into `$HERMES_HOME/plugins/`, write initial `scope.json`, start a daemon thread for manifest re-poll. (Adapter image rebuild + new digest pin per the existing bump pipeline §5.3 of the adapter blueprint.)
- `corellia_guard` Python plugin: `pre_tool_call` enforcement for the three non-native scopes (URL allowlist on `web`, command-pattern allowlist on `terminal`, path allowlist on `file`).
- Wizard "Tools" step (new step 4 of 6) with per-toolset scope inputs and inline credential capture.
- Org-curation page at `/settings/tools` (toolsets the org allows).
- Fleet-view per-instance grant editor (add/remove grants on running agents; UI labels the propagation tier — hot, plugin-tick, restart-required).
- Backend RPCs (Connect-go): `ListTools`, `GetOrgToolCuration`, `SetOrgToolCuration`, `GetInstanceToolGrants`, `SetInstanceToolGrants`, `GetToolManifest`.
- Smoke pass that demonstrates: spawn an agent with `web` granted scoped to `*.acme.com` → verify `https://wiki.acme.com` is allowed and `https://evil.com` rejected by the plugin → revoke `web` from the fleet view → verify the tool call fails on the next call (no restart).

### 1.2 Out of scope (carries forward to v1.6+)

Restated explicitly so the per-phase reviews don't relitigate. Cross-referenced to §1.0 surface numbers:

- **Skills (surface #4).** Equipping is Pillar C — follows on directly after this plan as a separate document. `agentskills.io` / Nous-hosted skills index integration: schema in Pillar C will reserve `Skill.source = external_registry`; UI lands in v1.6.
- **Per-tool granularity (surface #2).** Equipping a toolset in v1.5 equips all of its constituent tools. v1.6 introduces a `scope_json.tools_allow_deny` sub-shape under each toolset grant; no schema migration — just a new field in the existing `scope_json` JSONB. The `pre_tool_call` matcher gains a tool-name filter at the same time.
- **Tool providers (surface #5).** Provider selection per equipped toolset is implicit in v1.5 (the credential the operator pastes selects the provider). Explicit provider-choice UI + per-org approved-providers curation lands in v1.6.
- **OAuth onboarding (cross-cut on #4 and #5).** OAuth-prompting toolsets — flagged as `oauth_only = true` in the catalog and rendered as locked rows with a "v1.6: OAuth onboarding" tooltip. **Source-grounded scope:** of the 22 entries in `CONFIGURABLE_TOOLSETS`, only `spotify` is OAuth-only at the toolset level. The other names that earlier drafts of this plan listed (GitHub Copilot, OpenAI Codex, MCP-OAuth, Nous Portal) are **not toolsets** — they are tool *providers* (surface #5) that carry a `requires_nous_auth` flag inside one or more toolset's provider list. Provider-level OAuth onboarding is handled by `nous-auth login` and is out of scope for v1.5; the wizard surfaces only toolset-level OAuth gating.
- **MCP server governance (surface #3).** Stripped entirely from this plan. Equipping external MCP servers, per-server tool allowlists, the `mcp_servers` config block — all deferred to v1.6 as a standalone plan once Toolsets is shipped and operator usage informs the right shape. Open question about Hermes's native per-server allowlist field name (formerly Phase 2 prerequisite) reopens with that plan.
- **Platforms / gateways governance (surface #6 beyond `cli`).** Stripped entirely. v1 deploys agents on `cli` only; v1.5 Pillar B governs `cli`'s toolset equipping. Multi-platform deploy + per-platform toolset matrices + channel allowlists wait for M5 Fleet Control / v2. Catalog seed at Phase 1 filters out toolsets whose `_TOOLSET_PLATFORM_RESTRICTIONS` excludes `cli` (e.g. `discord`, `discord_admin`, `messaging`) — they'd never load on a `cli` deployment, and surfacing them would create a "why can't I equip this?" UX gap.
- **Memory governance (surface #7).** Equipping the `memory` toolset is in scope (it's one of the 22), but per-category retention policy and redaction rules — the actual *governance* questions for memory — are deferred to v2 per blueprint §13.
- **Third-party plugin governance (surface #8).** Only Corellia ships plugins in v1.5 (the `corellia_guard` plugin); no operator-facing plugin install surface.
- Time-bounded grants — `expires_at TIMESTAMPTZ NULL` reserved in schema; no UI.
- Approval workflows ("agent requested X, admin approves").
- Audit-log *dashboard*. Grant-change rows do get appended to a `tool_grant_audit` table in Phase 7, but a dedicated reader UI is post-v1.5.
- Sidecar HTTP proxy for `code_execution` Python egress — deferred until concrete demand. The plugin doesn't see Python's `urllib.request` calls; v1.6+ adds the proxy if/when needed.
- Push-on-change manifest delivery (SSE / WebSocket) — pull-with-TTL is the v1.5 mechanism.
- Cross-org tool sharing.
- "Spawn N agents with the same grant set" — the M4 spawn-N path already exists; integrating it with the wizard's tools step is a natural follow-on but not in this plan.

### 1.3 Demo target

Three demo segments, ordered by the underlying mechanism:

1. **Config-tier governance.** Spawn an agent; equip `web`, `terminal`, `code_execution`. Show that `code_execution` (or any other toolset the org has disabled) is absent from the catalog when the org has curated it out. Show that the agent boots with exactly the equipped toolsets in its `~/.hermes/config.yaml` `platform_toolsets.cli`.
2. **Plugin-tier scope enforcement.** With `web` granted scoped to `*.acme.com`, ask the agent to fetch `wiki.acme.com` (allowed) and then `evil.com` (plugin rejects with a structured error). Inspect the `pre_tool_call` rejection in the agent's logs.
3. **Revoke without redeploy.** From the fleet view, revoke `web` from the running agent. Within ~35s the agent's next `web_search` attempt fails (plugin reads the updated `scope.json`). No machine restart.

---

## 2. Architecture orientation

```
   ┌─────────────────────────────────┐
   │ Operator UI                     │
   │ /settings/tools  (org curation) │
   │ /spawn/<id> step 4 (equipping)  │
   │ /fleet (per-instance grants)    │
   └────────────────┬────────────────┘
                    │ Connect-go RPCs
                    ▼
   ┌─────────────────────────────────┐
   │ backend/internal/tools/         │
   │   - Service                     │
   │   - sqlc reads/writes against   │
   │     tools / agent_instance_tool │
   │     _grants / org_tool_curation │
   │     / tool_grant_audit          │
   └────────────────┬────────────────┘
                    │ DB rows
                    ▼
   ┌─────────────────────────────────┐
   │ Postgres (Supabase Direct)      │
   └────────────────┬────────────────┘
                    │ assembled at request time
                    ▼
   ┌─────────────────────────────────┐
   │ /api/manifest/tools/:id         │
   │   GetToolManifest RPC           │
   │   (auth: per-instance bearer)   │
   │   Returns: { toolsets:[],       │
   │              env:{}, scopes:{} }│
   │   Cache headers: ETag           │
   └────────────────┬────────────────┘
                    │ HTTPS
                    ▼
   ┌──────────── Fly Firecracker microVM ────────────┐
   │                                                 │
   │  adapter entrypoint.sh                          │
   │    - fetch manifest                             │
   │    - render $HERMES_HOME/config.yaml            │
   │    - render $HERMES_HOME/.env                   │
   │    - cp plugin → $HERMES_HOME/plugins/          │
   │    - write $HERMES_HOME/corellia/scope.json     │
   │    - exec hermes                                │
   │                                                 │
   │  Hermes (PID 1)                                 │
   │    └── corellia_guard plugin (loaded once)      │
   │           ├── pre_tool_call hook                │
   │           │     reads scope.json on each call   │
   │           └── daemon thread                     │
   │                 polls manifest URL → rewrites   │
   │                 scope.json                      │
   └─────────────────────────────────────────────────┘
```

---

## 3. Phased rollout

The phases are ordered for an end-to-end demoable milestone at the end of Phase 4 (config-tier governance fully working), with Phase 5 deepening enforcement and Phases 6–7 rounding out the admin and fleet-edit surfaces.

### Phase 1 — Schema + tool catalog seeded

**Goal:** every later phase has tables to write into and a catalog to read from. Nothing user-visible.

**Deliverables:**

1. **Migration** `backend/migrations/<ts>_tools_governance.sql` (`goose up` / `down`):
   - `tools` table:
     ```
     id                     UUID PK
     harness_adapter_id     UUID FK → harness_adapters(id)
     toolset_key            TEXT  -- e.g. "web", "terminal", "file"
     display_name           TEXT
     description            TEXT
     category               TEXT  -- "info", "compute", "integration"
     icon                   TEXT NULL
     default_on_in_hermes   BOOL
     oauth_only             BOOL DEFAULT FALSE  -- locked in v1.5 UI
     -- platform-restricted toolsets (e.g. discord_admin) are filtered out
     -- at seed time per §1.2 — no `platform_restricted_to` column needed.
     scope_shape            JSONB  -- structured per-tool input shape (see §3.1.4)
     required_env_vars      TEXT[]  -- e.g. ["EXA_API_KEY"]
     adapter_version        TEXT  -- which adapter this catalog row is keyed against
     UNIQUE (harness_adapter_id, toolset_key, adapter_version)
     ```
   - `org_tool_curation` table:
     ```
     org_id        UUID FK
     tool_id       UUID FK → tools
     enabled       BOOL  -- default TRUE on insert
     curated_by    UUID FK → users(id)
     curated_at    TIMESTAMPTZ
     PRIMARY KEY (org_id, tool_id)
     ```
   - `agent_instance_tool_grants` table:
     ```
     id                       UUID PK
     agent_instance_id        UUID FK → agent_instances(id) ON DELETE CASCADE
     tool_id                  UUID FK → tools
     scope_json               JSONB  -- shape mirrors tools.scope_shape
     credential_storage_ref   TEXT NULL  -- opaque; raw secret in Fly per blueprint §11.6
     granted_by               UUID FK → users(id)
     granted_at               TIMESTAMPTZ
     revoked_at               TIMESTAMPTZ NULL
     expires_at               TIMESTAMPTZ NULL  -- reserved, no v1.5 UI
     UNIQUE (agent_instance_id, tool_id) WHERE revoked_at IS NULL
     ```
   - Seed inserts for the v1.5 toolset catalog. Source: the YAML in step 2.
2. **Catalog YAML** `adapters/hermes/catalog/toolsets.yaml`. **Hand-authored**, not transcribed: Hermes's `CONFIGURABLE_TOOLSETS` (`hermes_cli/tools_config.py:50–76`) is a **3-tuple `(toolset_key, display_name, description)` only** — it does not expose `default_on`, `platform_restricted_to`, `required_env_vars`, or any structured `scope_shape`. Default-off and platform-restriction information lives in **separate** module-level dicts (`_DEFAULT_OFF_TOOLSETS`, `_TOOLSET_PLATFORM_RESTRICTIONS`); env-var requirements are scattered across each toolset's provider implementations; scope-shape is a Corellia-side concept with no upstream representation at all. So the catalog YAML is a multi-source derivation: the 3-tuple base from `CONFIGURABLE_TOOLSETS`, default-off + platform-restriction joined in from the two side-dicts, and `required_env_vars` + `scope_shape` hand-authored per toolset by reading each provider's source. Each entry:
   ```yaml
   - toolset_key: web
     display_name: Web Search & Fetch
     description: |
       Search the web and fetch URLs. Backed by Exa, Parallel, or Firecrawl.
     category: info
     default_on_in_hermes: true
     scope_shape:
       url_allowlist:
         type: pattern_list
         description: Glob patterns. Example "*.acme.com", "wiki.example.org/*"
         default: ["*"]  # default-deny on empty? see Phase 1 open question
     required_env_vars: [EXA_API_KEY]
     oauth_only: false
   ```
   Authoritative for what the seed migration loads. Adapter-version-keyed so a Hermes bump can land a new YAML alongside a new migration without disturbing rows for the old version.
3. **sqlc queries** in `backend/queries/tools.sql`:
   - `GetToolByID`
   - `ListToolsForHarness(harness_adapter_id, adapter_version)`
   - `ListOrgToolCuration(org_id)`
   - `UpsertOrgToolCuration(org_id, tool_id, enabled, curated_by)`
   - `ListInstanceToolGrants(instance_id)` (joined with tools for display fields)
   - `UpsertInstanceToolGrants(instance_id, [...]); RevokeInstanceToolGrant(instance_id, tool_id, revoked_at)`
4. **Domain package** `backend/internal/tools/`:
   - `service.go` — `Service` interface and concrete implementation
   - `errors.go` — sentinels (`ErrToolNotFound`, `ErrToolNotAvailableForOrg`, `ErrInvalidScope`, `ErrCredentialMissing`)
   - `scope_validator.go` — given a tool's `scope_shape` and a candidate `scope_json`, validate that the JSON conforms (regex-list shape, value types, reasonable size limits)
   - `service_test.go` — table-driven tests against a real Postgres
5. **Migration test** `backend/internal/db/db_test.go` extension that asserts the seeded row count.

**Acceptance gate:**
- `goose -dir backend/migrations postgres "$DATABASE_URL_DIRECT" up` and `down` both succeed.
- `select count(*) from tools where adapter_version = '<seeded>'` matches the catalog YAML's row count.
- `cd backend && go test ./internal/tools/... ./internal/db/...` green.
- `go vet ./...` clean.

**Out of phase:**
- RPCs (Phase 3 — backend RPCs).
- Manifest endpoint (Phase 2).
- Adapter changes (Phase 2).
- Any UI (Phase 4 onward).

**Open questions resolved here:**
- Default behaviour of an empty allowlist — default-deny vs default-allow? **Recommendation: default-deny** for `url_allowlist`, `command_allowlist`, `path_allowlist` (operator must explicitly grant); default-allow for `working_directory` (empty = no pin). Coded into the scope-shape spec.
- Are credentials per-instance or per-org? **Recommendation: per-instance for v1.5** (matches existing M4 secret pattern; org-shared creds add a credential-rotation-fans-out problem we don't want this milestone). Reserved for v1.6.

### Phase 2 — Manifest plumbing (proto + control-plane endpoint + adapter integration)

**Goal:** the adapter can fetch a per-instance manifest from the control plane and translate it into `config.yaml` + `.env` at boot. Demonstrably gates toolsets at the Hermes level. **No fine-grained scope enforcement yet** (that's Phase 5). No UI yet (Phase 3+4).

**Deliverables:**

1. **Proto** `shared/proto/corellia/v1/tools.proto`:
   ```proto
   service ToolService {
     rpc GetToolManifest(GetToolManifestRequest)
         returns (GetToolManifestResponse);
   }

   message ToolManifest {
     string instance_id = 1;
     string adapter_version = 2;
     repeated EquippedToolset toolsets = 3;
     map<string, string> env = 4;            // resolved cred values
     int64 manifest_version = 5;             // monotonic; for ETag
   }

   message EquippedToolset {
     string toolset_key = 1;                 // "web", "terminal", ...
     google.protobuf.Struct scope = 2;       // matches tools.scope_shape
   }
   ```
   *(MCP server message intentionally absent — MCP governance is deferred to v1.6 per §1.0 / §1.2. When that plan lands it adds an `McpServer` message + `repeated McpServer mcp_servers = N` field as a non-breaking proto extension.)*
2. **Backend handler** `backend/internal/httpsrv/tool_manifest.go` — Connect-go handler. <30 lines per blueprint §11.9; calls `tools.Service.BuildManifestForInstance(ctx, instance_id)` which assembles the response from the three rows-source (org curation + grants + cred resolution). Auth: validates a per-instance bearer token (see open question).
3. **Manifest assembler** in `backend/internal/tools/manifest.go`:
   - Reads `agent_instance_tool_grants` for the instance, filters out revoked.
   - Resolves `credential_storage_ref` → actual secret value via the existing M4 secret mechanism.
   - Joins on `tools` for `scope_shape` validation.
   - Emits the proto `ToolManifest`.
4. **Caching** — manifest endpoint sets `ETag: "<manifest_version>"` and supports `If-None-Match` returning `304`. The `manifest_version` is incremented by any write to grants for this instance.
5. **`adapters/hermes/entrypoint.sh` extension**:
   - Read `CORELLIA_TOOL_MANIFEST_URL` (already-reserved env var per blueprint §3.2).
   - `curl` it with `Authorization: Bearer $CORELLIA_INSTANCE_TOKEN`.
   - Pipe through a small Python renderer (`adapters/hermes/render_config.py`, also new) that translates the manifest → `config.yaml` + `.env` partials.
   - Write `$HERMES_HOME/config.yaml` (atomically, via temp + `mv`).
   - Write `$HERMES_HOME/.env`.
   - **Empty `corellia_guard` directory** is copied into `$HERMES_HOME/plugins/` as a placeholder — the plugin lands in Phase 5; the *plumbing* (presence + `plugins.enabled: [corellia_guard]` in config.yaml) lands now so Phase 5 is purely a code-fill exercise.
   - `exec hermes` (unchanged).
6. **`adapters/hermes/Dockerfile`** — `COPY` the `render_config.py` module and the (empty-stub) `plugin/` directory into the image at a `/opt/corellia/` location.
7. **Backend** also issues a per-instance manifest token at spawn time (extends the existing `spawnAgent` flow's secret-write step), passing the token to Fly as `CORELLIA_INSTANCE_TOKEN`.
8. **`adapters/hermes/smoke.sh`** — extended to:
   - Hit a hand-rolled stub manifest endpoint returning a fixed manifest with `web` and `terminal` granted.
   - After Hermes boots, assert (via `fly ssh console`) that `$HERMES_HOME/config.yaml` contains `platform_toolsets.cli: [web, terminal]`.
9. **Adapter image bump** per the existing pipeline (`docs/blueprints/adapter-image-blueprint.md` §5.3): new digest captured, migration `<ts>_adapter_image_ref_bump_pillar_b.sql` updates `harness_adapters.adapter_image_ref`.

**Acceptance gate:**
- The manifest RPC returns a well-formed `ToolManifest` for a seeded instance with grants.
- `If-None-Match` round-trip returns `304`.
- The adapter image, booted on Fly with `CORELLIA_TOOL_MANIFEST_URL` + `CORELLIA_INSTANCE_TOKEN` env vars set, produces the expected `config.yaml`.
- The smoke test passes end-to-end.

**Out of phase:**
- The plugin's actual code (Phase 5).
- The frontend (Phases 4, 6, 7).
- Per-instance grant editing on running agents (Phase 7).
- Manifest hot-reload daemon thread inside the plugin — entrypoint writes manifest *once* at boot in this phase; the daemon thread arrives in Phase 5.

**Open questions resolved here:**
- **Auth shape for the manifest endpoint.** Recommendation: per-instance bearer token, generated at spawn time and stored as a Fly app secret; rotates on `RestartInstance` if/when that's exposed. Token format: opaque-128-bit-hex; verified by the BE against an `agent_instance_manifest_tokens` table (single column join; rows deleted with the instance via `ON DELETE CASCADE`).
- **Where the renderer lives.** Recommendation: Python in the adapter image (`render_config.py`). Reasons: (a) the plugin we ship in Phase 5 is Python anyway; (b) YAML rendering is more ergonomic in Python than POSIX shell; (c) keeps the entrypoint shim short and POSIX-shell as the actual PID-1 chain to upstream Hermes (the `exec` discipline from §4.3 of the adapter blueprint stays clean — Python runs as a sub-process, doesn't replace the shell).

### Phase 3 — Backend RPCs (UI ↔ control plane)

**Goal:** every UI surface has the RPCs it needs. Read paths first; write paths next.

**Deliverables:**

1. **Proto additions** to `shared/proto/corellia/v1/tools.proto`:
   ```proto
   service ToolService {
     // …GetToolManifest from Phase 2…

     // Catalog browse — UI use
     rpc ListTools(ListToolsRequest) returns (ListToolsResponse);

     // Org curation
     rpc GetOrgToolCuration(GetOrgToolCurationRequest)
         returns (GetOrgToolCurationResponse);
     rpc SetOrgToolCuration(SetOrgToolCurationRequest)
         returns (SetOrgToolCurationResponse);

     // Per-instance grants
     rpc GetInstanceToolGrants(GetInstanceToolGrantsRequest)
         returns (GetInstanceToolGrantsResponse);
     rpc SetInstanceToolGrants(SetInstanceToolGrantsRequest)
         returns (SetInstanceToolGrantsResponse);
   }
   ```
2. **Handler files** in `backend/internal/httpsrv/`:
   - `tool_catalog.go` — `ListTools` handler (<30 lines). Calls `tools.Service.ListAvailableForOrg(ctx, org_id, harness_adapter_id)` which joins `tools` ⨝ `org_tool_curation` and returns the union, with the `enabled_for_org` flag merged in for UI display.
   - `tool_curation.go` — `GetOrgToolCuration`, `SetOrgToolCuration`. Auth: only org-admin role can write.
   - `instance_tool_grants.go` — `GetInstanceToolGrants`, `SetInstanceToolGrants`. Auth: instance owner (and org-admin?). On write, scope is validated via `scope_validator.go` from Phase 1.
3. **Service-layer methods** added to `backend/internal/tools/service.go`:
   - `ListAvailableForOrg`, `GetOrgCuration`, `SetOrgCuration`, `GetInstanceGrants`, `SetInstanceGrants`.
   - `SetInstanceGrants` is **transactional** — the entire grant set is replaced atomically; partial failures roll back. Bumps the instance's `manifest_version` for ETag invalidation.
   - On `SetInstanceGrants` for a *running* instance, also writes an audit row into `tool_grant_audit` (table added in Phase 7; Phase 3 stubs the call site behind a feature flag, fills it in Phase 7).
4. **Frontend codegen update** — `pnpm proto:generate` regenerates the TS client. Add a thin wrapper in `frontend/src/lib/api/tools.ts`.
5. **Backend tests** — handler tests for each RPC using the in-package interface fake pattern from M4 (`agentsService` precedent). Service tests against real Postgres.

**Acceptance gate:**
- All five RPCs return well-formed responses for happy-path inputs.
- `SetInstanceToolGrants` is rejected for non-owner / non-admin callers.
- `SetOrgToolCuration` is rejected for non-org-admin callers.
- Scope-shape validator rejects malformed scope JSON with `ErrInvalidScope`.
- `cd backend && go test ./internal/tools/... ./internal/httpsrv/...` green.

**Out of phase:**
- Any UI consuming these RPCs (Phases 4, 6, 7).
- Audit log persistence (stubbed; lands Phase 7).

### Phase 4 — Wizard "Tools" step (the operator-facing milestone)

**Goal:** the user-described surface is alive. Spawning an agent walks through HARNESS → IDENTITY → MODEL → **TOOLS** → DEPLOYMENT → REVIEW. End-to-end-demoable for *config-tier* governance (the four non-native scopes still don't enforce until Phase 5; the UI captures them anyway).

**Deliverables:**

1. **Wizard state extension** in `frontend/src/components/spawn/wizard.tsx`:
   - Add `TOOLS` to the `StepKey` union; insert it between `MODEL` and `DEPLOYMENT`.
   - Cascading-invalidation contract preserved (clicking `[ EDIT ]` on TOOLS un-confirms TOOLS + DEPLOYMENT + REVIEW).
   - State extension: `WizardFields.toolsets: { [toolset_key]: { equipped: bool, scope: object, credential_ref?: string } }`.
   - Submit flow extension: `onDeploy` calls `SetInstanceToolGrants` *after* the M4 `spawnAgent` RPC succeeds (which creates the instance row), *before* `router.push("/fleet")`. If the grants write fails, the instance is destroyed (single-shot rollback) and the operator is bounced back to step TOOLS with an error.
2. **`frontend/src/components/spawn/steps/tools-step.tsx`** — the step body:
   - Calls `ListTools(harness_adapter_id)` on mount.
   - Renders a grid of toolset cards (similar in chrome to the harness roster — `<TerminalContainer accent="tools-tbd">` per design system).
   - Each card: toolset name, description, category icon, `[ EQUIP ]` / `[ ✓ EQUIPPED ]` toggle button.
   - When equipped: card expands to show the scope-shape input(s) and the credential input (if `required_env_vars` non-empty). Inline copy mirrors the API-key copy from MODEL step: "Forwarded once to the agent's secret store. Never written to Corellia's database."
   - **Org-curated-out toolsets are hidden entirely** — they don't render even as locked rows. (Locked rendering reserved for OAuth-only toolsets.)
   - **OAuth-only toolsets** render as `[ OAUTH REQUIRED — v1.6 ]` non-button affordance (per blueprint §11.4 "no fake buttons").
3. **Per-scope-shape input components** in `frontend/src/components/spawn/scope-inputs/`:
   - `url-allowlist.tsx` — multi-line textarea, one glob per line. Validation: each line is a non-empty pattern; max 64 patterns; max 200 chars/pattern.
   - `command-allowlist.tsx` — same shape, for terminal command patterns (regex). Validation: each is a valid regex.
   - `path-allowlist.tsx` — same shape; absolute paths or glob.
   - `working-directory.tsx` — single-line input with a "leave blank for no pin" affordance.
4. **Review-step extension** — REVIEW step's read-only `<dl>` gains a `TOOLS` row that summarises equipped toolsets and per-toolset scope counts ("3 toolsets equipped: web (4 URL patterns), terminal (cwd: /workspace), file (2 path globs)"). Click-to-expand expands the full grant list.
5. **Wizard color** — TOOLS step gets a new feature color in `design-system.md` (recommend amber/orange to distinguish from existing five). Caller is `frontend/src/components/spawn/wizard.tsx`'s accent prop.
6. **Frontend tests / storybook stories** for each new step body and scope input.
7. **Doc updates** — `docs/refs/design-system.md` §34.1 (5-step → 6-step layout); CLAUDE.md frontend route map (no path changes; just step count).

**Acceptance gate:**
- Local `pnpm -C frontend type-check` + `lint` + `build` green.
- Manual UI smoke: spawn an agent end-to-end picking 2-3 toolsets with scopes filled. After deploy, verify (via `psql` or a backend query) that `agent_instance_tool_grants` rows exist with the expected scope JSON.
- Manual smoke: SSH into the spawned Fly machine, `cat $HERMES_HOME/config.yaml` shows the equipped toolsets in `platform_toolsets`, and `cat $HERMES_HOME/.env` shows the per-toolset credentials.
- Cancel-mid-wizard / refresh-mid-wizard / equip-then-edit-then-deploy all behave correctly (the ephemeral wizard state from M4 still works).

**Out of phase:**
- Plugin-tier scope enforcement — equipped scopes get *captured* but not all enforced (Phase 5).
- Org-admin curation page — operator currently sees the *full* catalog filtered only by `oauth_only`. Curation page lands Phase 6.
- Per-instance grant editing on running agents — Phase 7.

**Demo at end of Phase 4:** spawn an agent with `web` + `terminal` + `file` granted; agent boots; `web_search` works against the public web (no scope enforcement yet at this phase); equipping/un-equipping a whole toolset is reflected in `platform_toolsets.cli` in `config.yaml`. The three plugin-only scopes (URL allowlist, command allowlist, path allowlist) are *captured* in the manifest but not yet enforced — that's the gap Phase 5 closes.

### Phase 5 — `corellia_guard` plugin (the doorman)

**Goal:** the three non-native scopes that Phase 4 captures actually enforce. Plugin loads inside Hermes via the documented user-plugin discovery path; `pre_tool_call` rejects out-of-scope calls.

**Deliverables:**

1. **`adapters/hermes/plugin/corellia_guard/plugin.yaml`** — Hermes plugin manifest. Field names are upstream-canonical (verified against `plugins/spotify/plugin.yaml` and `plugins/disk-cleanup/plugin.yaml` in the pinned Hermes source); the hook list is keyed `hooks:` (not `provides_hooks:`):
   ```yaml
   name: corellia_guard
   version: 0.1.0
   description: Corellia per-tool scope enforcement
   author: Corellia
   kind: standalone
   hooks: [pre_tool_call]
   ```
2. **`adapters/hermes/plugin/corellia_guard/__init__.py`** — entry point:
   - `register(ctx)` is the upstream-documented entry. Inside it:
     - **Single-flight guard:** Hermes calls `register(ctx)` per `AIAgent` instantiation. Even on `cli`-only deployments — the v1.5 surface this plan governs — any code path that constructs a fresh `AIAgent` (e.g. subagent flows under the `delegation` toolset, future session-isolation patterns) re-enters `register`; without a guard the polling thread leaks linearly with that count. Implementation: a module-level sentinel `_REGISTERED = False` (and a `threading.Lock()` to make the check-and-set atomic across threads); first call flips the sentinel and spawns the thread, every subsequent call only re-registers the hook on the new `ctx` and returns. Hermes has **no plugin-shutdown hook** in `VALID_HOOKS` (verified against `hermes_cli/plugins.py`), so the daemon thread runs for the lifetime of the Python process — which is fine because the daemon flag lets it die with the process; the only thing to prevent is duplicate threads, not an orderly shutdown.
     - Load `$HERMES_HOME/corellia/scope.json` once (initial state).
     - Spawn (under the guard) a `threading.Thread(daemon=True)` that polls `CORELLIA_TOOL_MANIFEST_URL` on a TTL (default 30s; tunable via `CORELLIA_MANIFEST_POLL_TTL` env var). On 200, atomically replaces `scope.json`. On 304, no-op. On error, logs + retries with backoff.
     - Register `pre_tool_call` via `ctx.add_hook("pre_tool_call", _on_pre_tool_call)` (this **does** run every `register` call — hooks are per-`ctx`, the polling thread is process-global).
3. **`adapters/hermes/plugin/corellia_guard/scope.py`** — matchers:
   - `Scope` dataclass: `url_allowlist`, `command_allowlist`, `path_allowlist`, `working_directory_pin`, etc. — typed once, parsed from the JSON.
   - `match_url(scope, url) -> bool` — glob match (using `fnmatch`); empty list = deny per Phase 1's default-deny decision.
   - `match_command(scope, argv) -> bool` — regex against the command string; empty list = deny.
   - `match_path(scope, path) -> bool` — glob; empty list = deny.
   - `match_working_dir(scope, requested_cwd) -> bool` — equality (or prefix?). Reserved for terminal toolset.
4. **`adapters/hermes/plugin/corellia_guard/hook.py`** — the `pre_tool_call` hook body:
   - **Hook signature (kwargs, per `hermes_cli/plugins.py:742–747`):** `tool_name: str`, `args: dict`, `task_id: str`, `session_id: str`, `tool_call_id: str`. The hook is registered via `ctx.add_hook("pre_tool_call", _on_pre_tool_call)` and called by Hermes with these as keyword arguments — the body must accept them by name (typically `def _on_pre_tool_call(*, tool_name, args, task_id, session_id, tool_call_id, **_):` so future kwargs don't break it).
   - Reads cached `scope.json` (mtime stat → skip parse if unchanged; re-parse if mtime newer).
   - Routes by `tool_name` to the appropriate matcher; reads tool arguments from the `args` dict (e.g., `args["url"]` for `web_search`).
   - **Reject return shape (per Hermes's `get_pre_tool_call_block_message`, `plugins.py:766–785`):** `{"action": "block", "message": "<structured reason>"}`. **Not** `{"allow": False, "reason": "..."}` — earlier drafts of this plan had the wrong shape. Returning `None` (or an observer-style result without `action: "block"`) lets the call proceed.
5. **Tests** in `adapters/hermes/plugin/corellia_guard/tests/`:
   - `test_url_matcher.py` — table-driven for `*.acme.com` allowing `wiki.acme.com` and rejecting `evil.com`.
   - `test_command_matcher.py` — regex correctness, including denial-by-empty-list.
   - `test_path_matcher.py`, `test_working_dir.py`.
   - `test_scope_reload.py` — simulates a `scope.json` rewrite mid-process; the hook reads new state on next call.
   - `test_hook_dispatch.py` — verifies the hook routes by tool_name correctly.
   - Integration test (optional, gated on Hermes-image-available env var): spin up Hermes with the plugin and a fake manifest, fire a `pre_tool_call`, assert allow/reject.
6. **Adapter Dockerfile** — replaces the empty `plugin/` directory copy from Phase 2 with the real one. No structural change; just bytes.
7. **Adapter entrypoint.sh** — moves the daemon-thread spawn out of the entrypoint and into `register(ctx)`. (In Phase 2, the entrypoint did a one-shot manifest write; in Phase 5, the entrypoint still does the *initial* write so the plugin reads the right state at startup, then `exec`s Hermes which loads the plugin which spawns the thread which keeps the file fresh.)
8. **CI extension** — `adapters/hermes/plugin/corellia_guard/tests/` gets a `pytest` invocation in CI alongside the existing Go test step.
9. **Adapter image bump** per the standard pipeline.

**Acceptance gate:**
- `pytest adapters/hermes/plugin/corellia_guard/tests/` green.
- Smoke: spawn an agent with `web` granted scoped to `*.acme.com`; verify `web_search` against `wiki.acme.com` succeeds and against `evil.com` returns a structured rejection (`{"action": "block", "message": ...}` visible in the agent's log output via Hermes's `get_pre_tool_call_block_message` path).
- Smoke: from the BE (no UI yet), revoke the `web` grant; verify the agent's *next* `web_search` call fails (TTL-bounded — wait up to 35s).
- Smoke: kill the manifest endpoint mid-flight; verify the plugin keeps enforcing the last-known-good `scope.json` (fail-safe: stale manifest does not relax enforcement).

**Out of phase:**
- UI for editing grants on running agents (Phase 7).
- Sidecar HTTP proxy for `code_execution` egress (deferred to v1.6+).
- Hooks beyond `pre_tool_call` — `pre_gateway_dispatch` (only relevant once Platforms governance lands; deferred with #6), `transform_tool_result` (output redaction; deferred indefinitely).

**Demo at end of Phase 5:** the URL-allowlist plugin demo from §1.3.

### Phase 6 — Org-curation page

**Goal:** org-admins can curate which toolsets the org allows. Wizard now filters on org curation.

**Deliverables:**

1. **Frontend route** `frontend/src/app/(app)/settings/tools/page.tsx`:
   - Server component reads org_id from session.
   - Client `<OrgToolCuration>` calls `ListTools` + `GetOrgToolCuration` and renders a grid of toolset cards.
   - Each card has an enable/disable toggle. On change, calls `SetOrgToolCuration` with debounce.
   - Shows the toolset's scope-shape (read-only preview) so the admin understands what they're allowing.
   - **Audit row** appended on each curation change (`tool_grant_audit` table — Phase 7 introduces the table; Phase 6 writes against it).
2. **Sidebar nav** entry in `frontend/src/components/app/sidebar.tsx` — new "Tools" item under Settings, role-gated to org-admin only (other users get 403 on direct nav).
3. **Wizard catalog filter** — Phase 4's `ListTools` call now correctly filters out org-disabled toolsets (the BE handler's `ListAvailableForOrg` already does this; UI verifies).
4. **Tests** — frontend rendering tests + a backend test that verifies `ListTools` honours `org_tool_curation`.
5. **Doc update** — design-system.md gets a §35 entry for the org-settings family.

**Acceptance gate:**
- Org-admin can disable any toolset (e.g. `code_execution`); spawn flow's TOOLS step no longer surfaces it.
- Non-admin user 403s on `/settings/tools`.
- Type-check + lint + build green.

**Out of phase:**
- Cross-org policy templates ("apply this curation to all orgs in this tenant").
- Curation diffs / history UI (the audit rows are written but not surfaced).

### Phase 7 — Fleet-view per-instance grant editor + audit + hardening

**Goal:** revoke-without-redeploy is operator-driven, not just BE-driven. Audit log captures grant changes. Edges hardened.

**Deliverables:**

1. **`tool_grant_audit` table** (final piece of schema):
   ```
   id              UUID PK
   actor_user_id   UUID FK
   org_id          UUID
   instance_id     UUID NULL  -- NULL for org-curation events
   tool_id         UUID
   action          TEXT  -- "grant", "revoke", "scope_change", "org_enable", "org_disable"
   before_json     JSONB NULL
   after_json      JSONB NULL
   at              TIMESTAMPTZ DEFAULT NOW()
   ```
   Migration `<ts>_tool_grant_audit.sql`. Append-only. Read paths: none in v1.5 (the dashboard is post-v1.5).
2. **Phase 3's stubbed `auditService.Append(...)` call sites filled in** — all `SetOrgToolCuration` / `SetInstanceToolGrants` writes append a row.
3. **Frontend fleet-view extension** — `frontend/src/app/(app)/fleet/page.tsx`:
   - The agent card / row gains a `[ TOOLS ]` chevron action that opens a side-panel `<InstanceToolEditor>` modal.
   - Editor shows current grants; per-grant `[ REVOKE ]` button + scope edit.
   - Save → `SetInstanceToolGrants` → BE bumps `manifest_version` → adapter's poll picks up change.
   - **Each grant row labels its propagation tier:**
     - Plugin-enforced scope change (URL/command/path allowlist edit) → "Plugin tick — applies within ~35s on next tool call"
     - `platform_toolsets` change (granting/revoking a whole toolset) → "Restart required — applies on next agent boot. [ ⟳ Restart now ]"
   - The `[ ⟳ Restart now ]` button issues a new RPC `RestartInstance(instance_id)` (small extension to `internal/deploy/FlyDeployTarget` calling `flyctl machine restart`).
4. **Hardening tasks:**
   - **Manifest endpoint rate-limit** — per-instance-token bucket so a misbehaving adapter can't hammer the BE.
   - **Manifest poll TTL upper-bound** in the adapter — refuse to poll more than once per 5s (lower bound) or less than once per 5min (upper bound, fail-safe against config tampering).
   - **Plugin fail-safe behaviour** — if `scope.json` is missing or unparseable at startup, deny all. If the manifest URL is unreachable for >TTL, log loudly but continue with last-known-good scope.
   - **Connect-handler error mapping** — sentinel errors mapped to Connect codes (NotFound, PermissionDenied, InvalidArgument). Handler-level test per the M4 0.7.5 precedent.
5. **Doc updates:**
   - Changelog entry covering the whole milestone (one minor-version bump bundling all 7 phases? Or per-phase patches throughout the build? — see open question below).
   - `CLAUDE.md` — frontend route map gains `/settings/tools`; "What's left for v1.5" section updated.
   - `docs/blueprint.md` — add `CORELLIA_INSTANCE_TOKEN` to §3.2's reserved env vars.
   - `docs/blueprints/adapter-image-blueprint.md` §12 known limitation #6 either struck or rewritten as "implemented" with a forward-pointer to this plan's completion notes.
6. **Completion notes** in `docs/completions/tools-governance-phase-{1..7}.md` (one per phase, written incrementally as each lands).

**Acceptance gate:**
- Operator can revoke `web` from a running agent in the UI; demo from §1.3 succeeds.
- Operator can change `terminal.cwd` from the UI; UI labels it "restart required"; clicking restart issues `flyctl machine restart`; agent comes back with new cwd.
- Audit table has a row per grant change.
- Rate-limit holds against a stress test.
- Full smoke pass clean.

**Out of phase:**
- Audit dashboard UI.
- Cross-org sharing.
- Time-bounded grants surfacing in UI.

---

## 4. Phase dependency graph

```
Phase 1  ─┐
          ├─→ Phase 2 ─→ Phase 3 ─┐
          │                        ├─→ Phase 4 ──┐
          │                        │              ├─→ Phase 5 ──┐
          │                        ├─→ Phase 6 ──┘              │
          │                        │                            │
          └────────────────────────┴────────────────────────────┴─→ Phase 7
```

Phase 1 unblocks everything. Phase 2 is the boot-time/runtime backbone. Phase 3 unblocks all UI. Phases 4 and 6 are independent UI tracks once Phase 3 lands. Phase 5 deepens enforcement (could ship in parallel with Phase 6 by a different person if there's parallelism). Phase 7 is the catch-all final pass.

**Ship cadence recommendation:** one minor version per phase (so 7 minor bumps), per the existing changelog cadence. Phase 1 = `0.10.0`, Phase 2 = `0.11.0`, etc. Hotfix patches as needed within phases. Final `1.0` bump is reserved for whichever milestone closes v1.5 (likely Pillar C's Skills shipping).

---

## 5. Open decisions surfaced upfront

These are inherited from `tools-governance-technical-overview.md` §8 + new ones surfaced by drafting this plan. Each is forward-pointed to the phase that resolves it.

| # | Decision | Where it lands | Default if not resolved |
|---|---|---|---|
| 1 | Default-deny vs default-allow on empty allowlists | Phase 1 (catalog YAML) | Default-deny on URL/command/path; default-allow on working-dir |
| 2 | Per-instance vs org-shared credentials | Phase 1 | Per-instance only in v1.5; org-shared deferred to v1.6 |
| 3 | Manifest endpoint auth — bearer token vs mTLS | Phase 2 | Per-instance bearer token, stored as Fly secret |
| 4 | Renderer language — POSIX shell vs Python | Phase 2 | Python; entrypoint is shell that calls Python then `exec`s Hermes |
| 5 | TTL for manifest poll | Phase 2 / 5 | 30s default, tunable via env var, clamped 5s–5min |
| 6 | Wizard step color | Phase 4 | Amber/orange (TBD by design pass) |
| 7 | OAuth-only toolsets — locked rows or hidden? | Phase 4 | Locked rows with "v1.6" tooltip, per blueprint §11.4 |
| 8 | Audit row write timing — in-handler vs background-queue | Phase 3 / 7 | In-handler (synchronous) for v1.5; queue is post-v1.5 |
| 9 | Plugin language — Python vs (transpiled) other | Phase 5 | Python — Hermes's plugin contract is Python-shaped |
| 10 | Plugin failure mode on missing scope.json | Phase 5 | Deny all; logs loudly; alert if/when alerting exists |
| 11 | RestartInstance RPC scope — single instance vs bulk | Phase 7 | Single instance for v1.5; bulk in M5/Fleet Control |
| 12 | Changelog cadence — one minor per phase, or one per cluster? | Phase 7 | One minor per phase per existing 0.x cadence |

---

## 6. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Hermes config schema migrates mid-build (`_config_version: 22 → 23`) | Medium (weekly minors) | Adapter rebuild + catalog re-derive | Pin upstream digest at Phase 1; bump in a deliberate phase post-v1.5 |
| Plugin's `pre_tool_call` signature changes upstream | Low (it's been stable) | Plugin rewrite | Pin Hermes digest; CI integration test that asserts plugin loads |
| Manifest endpoint becomes a contention hotspot at scale | Medium (when scale hits) | Fly machine boots stall | ETag + 304; rate-limit per-token; SSE in v1.6 |
| Operator captures a credential in the wizard but the BE writes it to DB by accident | Low | Compliance | Code review gate + the `Secret.storage_ref` pattern from M4 (already enforced) |
| Plugin daemon-thread leaks (Hermes calls `register(ctx)` per `AIAgent` instantiation; even on `cli`-only deployments any code path that constructs a fresh `AIAgent` re-registers) | **High** (confirmed via source: no plugin-shutdown hook in `VALID_HOOKS`; re-registration on instantiation is structural to Hermes) | Memory + duplicate polls + thrash on the manifest endpoint | **Module-level single-flight guard** in `register` (sentinel + `threading.Lock()`) so the polling thread is spawned exactly once per process; hooks still re-attach per-`ctx`. Smoke test stops/starts a session and asserts `threading.active_count()` is unchanged. |
| `code_execution` Python escapes the plugin (urllib direct) | High (known limitation) | Scope bypass for that specific egress | Deferred: documented in the technical overview §3.3; v1.6+ adds sidecar proxy if needed |
| User mistakes the plugin tier label ("plugin tick" vs "restart required") and waits forever | Medium | Confused operator | UI copy is explicit; Phase 7 acceptance includes "restart required" prompt |
| Partial rollout — Phase 4 ships, Phase 5 doesn't, customer notices URL allowlist not enforcing | Medium | Trust hit | Phase 4 UI labels the three plugin-only-scope inputs (URL/command/path allowlist) as `[ ENFORCEMENT IN PILLAR B PHASE 5 ]` while shipped — until Phase 5 lands. Removed in Phase 5. |

---

## 7. Done definition (v1.5 Pillar B)

The milestone is "done" when:

1. ✅ All 7 phases shipped per their acceptance gates.
2. ✅ End-to-end demo from §1.3 runs clean three times in a row from a fresh org.
3. ✅ `cd backend && go test ./... && go vet ./...` green.
4. ✅ `pnpm -C frontend type-check && lint && build` green.
5. ✅ `pytest adapters/hermes/plugin/corellia_guard/tests/` green.
6. ✅ Adapter smoke test passes.
7. ✅ `docs/blueprints/adapter-image-blueprint.md` §12 known-limitation #6 closed (rewritten as "implemented in v1.5 Pillar B").
8. ✅ `docs/plans/governance-capabilities.md` §2 (Tools pillar) marked complete; `docs/plans/governance-expansion-roadmap.md` §2 row 3 status updated.
9. ✅ Completion notes for each phase exist at `docs/completions/tools-governance-phase-{1..7}.md`.
10. ✅ A 5-minute internal walk-through can be done by a non-author engineer reading only the changelog entries + this plan.

---

## 8. What this plan deliberately does NOT specify

- **Exact UI styling** (dimensions, microcopy, animation) — design pass is owned by the existing design-system.md cadence.
- **Exact RPC error codes** beyond the recommended sentinels — the M4 0.7.5 handler-level sentinel-mapping precedent is the reference.
- **Exact poll TTL number** — 30s is a recommended default, tuned in Phase 5 / 7 against real revocation latency feel.
- **Performance budgets** — added in Phase 7 hardening if measurement reveals concerns; not a Phase 1 gate.
- **Per-toolset deep-dives** — each toolset's scope-shape gets its own design micro-iteration during Phase 4. The catalog YAML in Phase 1 is the v1.5 first pass.
- **What goes in the v1.6 plan** — `agentskills.io` integration, audit dashboard, sidecar proxy, OAuth onboarding, time-bounded grants. Each warrants its own plan.

---

## 9. Quick reference — files this plan touches

```
backend/
├── migrations/<ts>_tools_governance.sql                      [Phase 1]
├── migrations/<ts>_adapter_image_ref_bump_pillar_b.sql       [Phase 2]
├── migrations/<ts>_tool_grant_audit.sql                      [Phase 7]
├── queries/tools.sql                                         [Phase 1]
├── internal/tools/{service,errors,scope_validator,manifest}.go  [Phases 1-3]
├── internal/httpsrv/{tool_manifest,tool_catalog,             [Phases 2-3]
│   tool_curation,instance_tool_grants}.go
├── internal/deploy/fly.go (RestartInstance extension)        [Phase 7]

shared/proto/corellia/v1/tools.proto                          [Phases 2-3]

frontend/src/
├── app/(app)/settings/tools/page.tsx                         [Phase 6]
├── app/(app)/fleet/page.tsx (extension)                      [Phase 7]
├── components/spawn/wizard.tsx (extension)                   [Phase 4]
├── components/spawn/steps/tools-step.tsx                     [Phase 4]
├── components/spawn/scope-inputs/{url,command,path,          [Phase 4]
│   working-dir}.tsx
├── components/fleet/instance-tool-editor.tsx                 [Phase 7]
├── lib/api/tools.ts                                          [Phase 3]

adapters/hermes/
├── Dockerfile (extension)                                    [Phases 2, 5]
├── entrypoint.sh (extension)                                 [Phase 2]
├── render_config.py                                          [Phase 2]
├── catalog/toolsets.yaml                                     [Phase 1]
├── plugin/corellia_guard/{plugin.yaml,__init__.py,           [Phase 5]
│   scope.py,hook.py,tests/}
├── smoke.sh (extension)                                      [Phases 2, 5]

docs/
├── refs/design-system.md (§34.1, §35)                        [Phases 4, 6]
├── blueprints/adapter-image-blueprint.md (§12 #6)            [Phase 7]
├── blueprint.md (§3.2 reserved env vars)                     [Phase 7]
├── completions/tools-governance-phase-{1..7}.md              [each phase]
```

---

End of plan.

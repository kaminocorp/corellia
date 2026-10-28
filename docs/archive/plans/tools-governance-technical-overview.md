# Technical Overview — Tools Governance over Hermes Agent (v1.5 Pillar B)

**Status:** technical overview, grounded in upstream-source research; precedes the implementation plan
**Owner:** TBD
**Supersedes:** —
**Related:**
- `docs/plans/v1.5-tools-and-skills-vision.md` (the vision this doc grounds in fact)
- `docs/plans/governance-capabilities.md` §2 (Tools pillar capability spec)
- `docs/blueprint.md` §3.2 (`CORELLIA_TOOL_MANIFEST_URL` reservation), §11.5 (no upstream forks), §11.6 (credential storage), §7 (sidecar pattern)
- Hermes Agent repo: `github.com/NousResearch/hermes-agent` (HEAD on `main`, snapshot 2026-04-26)

This is a **technical overview**, not an implementation plan. Its job is to confirm that the governance vision is implementable, name the upstream primitives we'd be standing on, and pin down the seams where Corellia's code meets Hermes's code. The per-pillar implementation plan (`v1.5-tool-permissions.md`) inherits this as its load-bearing reference.

Every claim about Hermes is cited to a file path + line range or a CLI surface. If a claim is unverified, it's marked `[uncertain]` with what couldn't be confirmed.

---

## 1. Executive answer

**Feasible. The governance layer can be built without forking, patching, or runtime-intercepting Hermes.** The load-bearing reasons:

1. Hermes's tool surface is **configured by file**, not by code. `~/.hermes/config.yaml` (toolset enable/disable + MCP servers + most per-toolset knobs) and `~/.hermes/.env` (credentials) are the entire static configuration contract (`hermes_cli/config.py:210-212`, `docker/entrypoint.sh:5,60-67`).
2. The location of those files is **redirectable via a single env var, `HERMES_HOME`** (`hermes_constants.py:11-56`). The Corellia adapter at container boot writes the files into a Corellia-controlled path, sets `HERMES_HOME=<path>`, then `exec`s Hermes. This is the same boot-time-shim pattern already used for `CORELLIA_*` env-var translation in M3 (blueprint §7 Option D).
3. Hermes's skill format exposes **structured tool-dependency metadata** (`metadata.hermes.requires_toolsets`, `requires_tools`, `fallback_for_toolsets`, `fallback_for_tools` — `agent/skill_utils.py:241-256`). The "skills cascade tool grants" affordance from the vision doc reads off real fields, not prose.
4. Where Corellia wants to enforce a scope Hermes does not natively express (URL allowlist for `web`, command-pattern allowlist for `terminal`, path allowlist for `file`), Hermes provides a **first-class plugin system** with `pre_tool_call` / `post_tool_call` lifecycle hooks (`hermes_cli/plugins.py:60-82`). Corellia can ship a Corellia-authored plugin into `<HERMES_HOME>/plugins/` at boot. That is *not* a fork; it's the documented extension point.

**The places the vision rubs against reality, all manageable:**

- **Hot-reload is MCP-only.** `mcp_servers:` reloads on a 5s mtime poll (`cli.py:7217-7268`); every other config section is read once at startup and never re-read. "Revoke without redeploy" has two tiers in v1.5: instant (MCP-routed tool grants) and bounce-required (everything else). See §6.
- **No native URL / command / path allowlist** for `web`, `terminal`, `file`, or `browser`. Either we accept Hermes's existing isolation primitives (Docker/SSH/Modal `terminal` backends, `terminal.cwd`, optional `tirith` pre-exec scanner), use a plugin hook, or run an outbound HTTP proxy as a sidecar. See §5.3.
- **Sub-tool granularity inside a toolset is mostly absent.** You can't enable `web_search` while disabling `web_extract` from `config.yaml`. Aliased toolset keys (e.g. `search` = web-search-only) provide a coarse opt-in. **MCP is the exception** — `mcp_servers.<name>.tools.include: [...]` allowlists individual tools per server (`hermes_cli/mcp_config.py:391`). See §5.4.
- **Schema churn is real.** `_config_version: 22` (`hermes_cli/config.py:1027`) ⇒ 22 historical schema migrations; weekly minor releases since v0.4.0 (2026-03-23) through v0.11.0 (2026-04-23) — eight minors in ~5 weeks. Pin by image digest (already a v1 rule) and budget for an adapter migration step on bump.
- **OAuth-prompting toolsets cannot be pre-seeded** statically — Spotify, GitHub Copilot, OpenAI Codex, MCP-OAuth, Nous Portal each require interactive callback (`hermes_cli/auth*.py`, `tools/mcp_oauth_manager.py`). v1.5 scopes credentials to env-var-injectable toolsets only.

None of these block the vision; each maps to a specific design decision recorded in §6.

---

## 2. The Hermes configuration contract — what actually exists

Before describing where Corellia hooks in, a precise reading of what Hermes natively reads on startup. Source-cited inline.

### 2.1 The two filesystem stores

```
$HERMES_HOME/
├── config.yaml         # settings (parsed at boot; deep-merged onto DEFAULT_CONFIG)
├── .env                # credentials (env vars take precedence over config.yaml — cli-config.yaml.example:3)
├── skills/             # active skill bundles, one dir per skill
│   └── <name>/SKILL.md
├── plugins/            # opt-in plugin trees (manifest + register())
│   └── <name>/{plugin.yaml, __init__.py}
├── sessions/, cache/   # runtime state
```

`HERMES_HOME` defaults to `~/.hermes` but is overridable via the env var of the same name (`hermes_constants.py:11-56`). The bundled Docker image sets it to `/opt/data` and seeds `config.yaml` from `cli-config.yaml.example` on first boot if missing (`docker/entrypoint.sh:5,66-68`). **Setting `HERMES_HOME` in the spawn machine config redirects everything.**

### 2.2 The toolsets

22 entries, authoritative list at `hermes_cli/tools_config.py:50-73` (`CONFIGURABLE_TOOLSETS`):

```
web, browser, terminal, file, code_execution, vision, image_gen, moa, tts,
skills, todo, memory, session_search, clarify, delegation, cronjob,
messaging, rl, homeassistant, spotify, discord, discord_admin
```

- **Default-off** (`tools_config.py:78`): `moa, homeassistant, rl, spotify, discord, discord_admin`. Everything else default-on.
- **Platform-restricted** (`tools_config.py:87-90`): only `discord` + `discord_admin` (restricted to platform `"discord"`). The "platform" axis is the messaging gateway target — entries in `hermes_cli/platforms.py` `PLATFORMS`: `cli, telegram, discord, whatsapp, slack, signal, qqbot, homeassistant`.
- **Composite presets** (referenced `cli-config.yaml.example:647-658`): `hermes-cli`, `hermes-telegram`, `hermes-discord`, `hermes-whatsapp`, `hermes-slack`, `hermes-signal`, `hermes-qqbot`, `hermes-homeassistant`; meta-presets `debugging`, `safe`, `all`. Resolution lives in `toolsets.py` (`resolve_toolset`).

The `config.yaml` shape is per-platform:

```yaml
platform_toolsets:
  cli: [web, file, terminal, code_execution]
  telegram: [web]
```

(`hermes_cli/tools_config.py:8-9, 629-630, 778`; example at `cli-config.yaml.example:600-608`.)

### 2.3 Per-toolset native knobs

Cited findings from research; full enumeration in §5.3.

- **`terminal`** is the most configurable: `terminal.{backend, cwd, timeout, lifetime_seconds, sudo_password, docker_image, docker_mount_cwd_to_workspace, docker_forward_env, container_cpu/memory/disk/persistent, ssh_host/user/port/key}` (`cli-config.yaml.example:148-236`). Backend can be `local | ssh | docker | singularity | modal | daytona`. **Working-directory pinning is honoured for all backends.** No command-pattern allowlist in config; optional pre-exec scanning via `tirith` binary (`cli-config.yaml.example:266-278`).
- **`browser`**: `browser.inactivity_timeout` only in config.yaml; provider keys (`BROWSERBASE_*`, `BROWSER_SESSION_TIMEOUT`) in `.env`.
- **`code_execution`**: `code_execution.{timeout, max_tool_calls}` (`cli-config.yaml.example:782-784`).
- **`web`**, **`file`**, **`vision`**, **`image_gen`**: **no native allowlist or scope knob in `config.yaml` or `.env`**. Provider keys only (`EXA_API_KEY`, `PARALLEL_API_KEY`, `FIRECRAWL_API_KEY`, `FAL_KEY`, etc. — `.env.example:123-260`). [Verified by searching `DEFAULT_CONFIG` in `hermes_cli/config.py:346+` and `.env.example`; no allowlist key found.]
- **MCP** is the exception — see §5.4.
- **Sub-tool granularity within a toolset:** **none in config**, except via aliased toolset keys (`search` = `web_search` only — `cli-config.yaml.example:631`).

### 2.4 The MCP block — the high-resolution surface

```yaml
mcp_servers:
  my-server:
    command: "..."        # stdio; OR
    url: "..."            # http
    headers: { Authorization: "Bearer ${ENV_KEY}" }
    args: [...]
    env: {...}
    enabled: true
    timeout: 30
    connect_timeout: 10
    auth: oauth
    tools:
      include: [tool_a, tool_b]    # per-server tool allowlist
    sampling: { enabled, model, max_tokens_cap, max_rpm, allowed_models, max_tool_rounds, log_level }
```

(Schema: `hermes_cli/mcp_config.py:70-83, 322-323, 391`; example at `cli-config.yaml.example:706-733`.) **Three properties matter for governance:**

1. **Per-server tool allowlist** (`tools.include`) — granular tool gating Corellia can drive.
2. **Header env-var interpolation** (`Authorization: "Bearer ${ENV_KEY}"`) — credentials inject from `.env` without literal-secret-in-config.
3. **Hot-reload** — see §6.1.

### 2.5 Skills

- **Bundle layout:** `<HERMES_HOME>/skills/<name>/SKILL.md` plus optional `scripts/`, `references/`, `examples/`, `templates/`.
- **External dirs:** `skills.external_dirs: [paths]` mounts read-only additional skill trees (`agent/skill_utils.py:174-224`, `cli-config.yaml.example:487-494`). `~` and `${VAR}` are expanded.
- **Disable keys** (`hermes_cli/skills_config.py:1-13, 27-47`):
  ```yaml
  skills:
    disabled: [skill-a, skill-b]
    platform_disabled:
      telegram: [skill-c]
    external_dirs: [...]
    config: { <skill-declared-keys>: ... }
  ```
- **`SKILL.md` frontmatter parser:** `parse_frontmatter()` (`agent/skill_utils.py:52-86`), YAML between `---` fences, `yaml.CSafeLoader`.
- **Fields actually consumed** by `skill_utils.py`'s extractors:
  - Top-level: `name`, `description`, `platforms` (OS-restricting list)
  - `metadata.hermes.fallback_for_toolsets: [...]`
  - `metadata.hermes.requires_toolsets: [...]`
  - `metadata.hermes.fallback_for_tools: [...]`
  - `metadata.hermes.requires_tools: [...]`
  - `metadata.hermes.config: [{ key, description, default, prompt }]` (per-skill config keys exposed to admin)
- **Other frontmatter fields** (`version`, `author`, `license`, `metadata.hermes.tags`, `related_skills`) appear in shipped SKILL.md files but are not consumed by `skill_utils.py`'s extractors. They're convention, not enforced schema. [Uncertain whether `tools/skills_tool.py` or `tools/skills_hub.py` reads `tags`/`related_skills` for search/listing — not exhaustively traced.]

### 2.6 Plugins — Corellia's escape hatch for non-native scope

`hermes_cli/plugins.py` is the documented extension point. Source priority order (`plugins.py:5-14, 540-646`):

1. Bundled `<repo>/plugins/<name>/`
2. User: `<HERMES_HOME>/plugins/<name>/`
3. Project: `./.hermes/plugins/<name>/` (opt-in via `HERMES_ENABLE_PROJECT_PLUGINS`)
4. Pip entry-points group `hermes_agent.plugins`

Plugin contract (`plugins.py:19-20, 856-858, 148-176`): a `plugin.yaml` manifest plus `__init__.py` exposing `register(ctx)`. Manifest fields: `name, version, description, author, requires_env, provides_tools, provides_hooks, kind ∈ {standalone, backend, exclusive}`. **Plugins are opt-in via `plugins.enabled: [list]` in config.yaml**, with `plugins.disabled: [list]` as deny-list (`plugins.py:94-137`).

Lifecycle hooks (`plugins.py:60-82`):

```
pre_tool_call, post_tool_call,
transform_terminal_output, transform_tool_result,
pre_llm_call, post_llm_call,
pre_api_request, post_api_request,
on_session_start, on_session_end, on_session_finalize, on_session_reset,
subagent_stop, pre_gateway_dispatch
```

**`pre_tool_call` is the seam for Corellia-side scope enforcement that Hermes doesn't express natively.** A Corellia-authored plugin can inspect every outgoing tool call against a granted-scope manifest and reject. The plugin runs in-process inside Hermes, sees structured tool name + arguments, and the contract is upstream-stable across the 22 schema versions.

### 2.7 Credentials

- Two stores per `docker/entrypoint.sh:60-67`: `~/.hermes/.env` (secrets) and `~/.hermes/config.yaml` (settings). `cli-config.yaml.example:3`: env vars take precedence.
- Credentials are **provider-specific env-var names**, not Hermes-uniform. From `.env.example`: `OPENROUTER_API_KEY`, `EXA_API_KEY`, `PARALLEL_API_KEY`, `FIRECRAWL_API_KEY`, `FAL_KEY`, `BROWSERBASE_API_KEY`, `SLACK_BOT_TOKEN`, `TELEGRAM_BOT_TOKEN`, `DISCORD_BOT_TOKEN`, `VOICE_TOOLS_OPENAI_KEY`, `ELEVENLABS_API_KEY`, `XAI_API_KEY`, `GROQ_API_KEY`, `TINKER_API_KEY`, `GITHUB_TOKEN`, `HONCHO_API_KEY`, etc. **There is no generic `WEB_TOOLS_API_KEY` or `BRAVE_API_KEY`.**
- **OAuth-prompting toolsets** require interactive callback and cannot be pre-seeded: Spotify (`tools_config.py:510-537`, `hermes auth spotify`), GitHub Copilot, OpenAI Codex (`hermes_cli/auth*.py`), MCP-OAuth (`mcp_config.py:277-300`, `tools/mcp_oauth_manager`), Nous Portal (`hermes login`).
- MCP HTTP servers can reference env vars in headers (`mcp_config.py:322-323`).

---

## 3. The Corellia → Hermes seam

Where Corellia's code meets Hermes's code at boot and at runtime. Two distinct surfaces:

### 3.1 Boot-time write (one-shot, before Hermes starts)

```
        Spawn machine (Fly Firecracker microVM)
   ┌──────────────────────────────────────────────────┐
   │                                                  │
   │   Corellia adapter entrypoint  (the existing     │
   │   `corellia/hermes-adapter` image — blueprint    │
   │   §4, M3.5 phase 1–7)                            │
   │                                                  │
   │   1. Read CORELLIA_TOOL_MANIFEST_URL             │
   │      (already reserved — blueprint §3.2)         │
   │   2. Fetch JSON manifest from control plane,     │
   │      authenticated with the per-instance token   │
   │   3. Translate manifest → write four artefacts:  │
   │                                                  │
   │      $HERMES_HOME/config.yaml                    │
   │        ├── platform_toolsets.cli: [...]          │
   │        ├── plugins.enabled: [corellia-guard]     │
   │        ├── mcp_servers.<name>.{...}              │
   │        └── skills.disabled / platform_disabled   │
   │                                                  │
   │      $HERMES_HOME/.env                           │
   │        └── per-toolset provider keys             │
   │                                                  │
   │      $HERMES_HOME/skills/<name>/SKILL.md (×N)    │
   │        └── materialised from manifest            │
   │                                                  │
   │      $HERMES_HOME/plugins/corellia-guard/        │
   │        ├── plugin.yaml                           │
   │        └── __init__.py  (register(ctx) +         │
   │             pre_tool_call hook reading the       │
   │             granted-scope subset of the          │
   │             manifest)                            │
   │                                                  │
   │   4. exec hermes ...                             │
   │                                                  │
   └──────────────────────────────────────────────────┘
```

**Every artefact in step 3 is a documented Hermes input** (§§2.1–2.6). No fork, no patching. The adapter is the only Corellia-authored Python the running container holds, and it terminates after `exec`.

### 3.2 Runtime mutation (subset, MCP-routed)

```
   Control plane                              Hermes container
   ────────────                              ────────────────
                                              cli.py 7217-7268:
                                              every 5s, stat
                                              $HERMES_HOME/config.yaml,
                                              if mcp_servers section
                                              changed → diff and
   admin revokes                              call shutdown_mcp_servers()
   tool grant in UI                           + rediscover.
        │
        ▼
   manifest-write hook
   → control plane writes
     instance-specific config
        │
        ▼
   adapter polls manifest URL
   on a TTL (e.g. 30s) and
   re-writes config.yaml's
   mcp_servers section + .env
        │
        ▼
   Hermes picks up the change
   on its next 5s tick.
```

**Total propagation latency:** TTL (Corellia adapter poll, e.g. 30s) + Hermes mtime poll (≤5s) = **~35s upper bound for MCP-routed grants**. For non-MCP toolsets, the adapter's manifest poll detects the change but the only enforcement path is **machine restart** — discussed in §6.1.

For very-low-latency revoke, an alternative is to set the Corellia adapter manifest TTL low (5s) at the cost of more requests. The control plane's manifest endpoint can be fronted with HTTP cache headers (`ETag` + `If-None-Match`) so unchanged manifests return `304 Not Modified` and don't re-trigger Hermes's mtime tick.

### 3.3 Three things Corellia is *not* doing

To pre-empt scope creep:

1. **Not intercepting LLM calls.** No prompt rewriting, no tool-call observation at the model boundary. Enforcement is config-distribution-time and (for non-native scopes) `pre_tool_call`-plugin-time. Hermes runs.
2. **Not running an HTTP proxy by default.** Mentioned in the vision as a fallback for scope-narrowing Hermes can't natively express. The plugin-hook path covers most of the same surface in-process, and is the preferred v1.5 approach. Sidecar proxy stays available as a v1.6+ fallback for cases where the plugin hook can't see the structure (e.g. egress from arbitrary `code_execution` Python).
3. **Not modifying Hermes itself.** Adapter image `FROM`s the upstream Hermes image at a pinned digest (already a v1 rule per blueprint §11.2). No file in the upstream image is overwritten — only `$HERMES_HOME` is populated.

---

## 4. The seven affordances, mapped to Hermes mechanics

The vision doc §2 lists seven affordances Corellia layers on top of Hermes. Each is now grounded in a specific mechanism.

| # | Affordance | Mechanism in Hermes | Where Corellia writes / reads |
|---|---|---|---|
| 1 | Discovery | `CONFIGURABLE_TOOLSETS` (`hermes_cli/tools_config.py:50-73`) + bundled `optional-skills/` + Hermes-hosted `skills-index.json` | Catalog table seeded at v1.5 from a YAML transcribed from `tools_config.py`. UI consumes it. |
| 2 | Org-level curation | `platform_toolsets:` mapping in `config.yaml` — listing only org-allowed toolsets effectively hides the rest from the agent's awareness | Org-admin UI surfaces an enable/disable checklist; manifest endpoint elides disabled entries from any per-instance manifest. |
| 3 | Per-instance equipping | `platform_toolsets.<platform>: [list]`, `mcp_servers.<name>.tools.include`, `skills.disabled` | Spawn-flow Step 7 (per roadmap §7) writes per-instance manifest rows; adapter materialises them into `config.yaml` at boot. |
| 4 | Versioning + pinning | Hermes image digest (already pinned per §11.2); MCP server `command`/`args` (caller-pinned); `SKILL.md` `version` string; per-toolset env vars typically reference a provider with its own versioning | `AgentInstance.image_digest` (existing); `AgentInstanceMCPServer.command_pinned`; `AgentInstanceSkill.version`. Upgrades are explicit admin actions. |
| 5 | Custom org-authored skills | Drop a `<name>/SKILL.md` into `<HERMES_HOME>/skills/` at boot; Hermes treats it identically to bundled skills (`agent/skill_utils.py` parses any frontmatter) | `Skill.source = org_authored`; manifest carries the bundle bytes (or a fetch URL); adapter writes the directory. |
| 6 | Cross-harness abstraction | Corellia's manifest is harness-neutral; the **adapter** is the seam that translates to Hermes vocabulary | Hermes adapter implements `manifest → config.yaml + .env + skills/ + plugins/`. A future Claude Agent SDK adapter implements `manifest → system-prompt fragments + tool registrations`. Same manifest contract. |
| 7 | Scoped grants → skills cascade | Skills declare `metadata.hermes.requires_toolsets`/`requires_tools` (`agent/skill_utils.py:241-256`) — **structured, not prose** | Equipping UI parses these fields at catalog-ingest time, surfaces them as required tool-grant rows, fails closed if grants missing. |

**Affordance 7 is the one whose feasibility depended most on what we found in source.** The vision doc §8 worried that skill tool dependencies might be informal prose, requiring a hand-curated side table. They aren't. Hermes already exposes the side table.

---

## 5. The granularity model — what's possible at each scope level

A precise reading of how fine-grained governance can go without leaving config-native territory.

### 5.1 Org-level

- **Hide a toolset entirely from a platform's manifest.** Org-admin sets `discord_admin` org-disabled → no instance manifest emitted by the control plane will ever include it → no `config.yaml` Corellia writes ever lists it.
- **Hide a skill from the catalog.** Same shape, against the skill catalog table.

This is a **Corellia-side** decision; Hermes never sees it. The Hermes-side state is "the toolset/skill simply isn't enabled."

### 5.2 Instance-level (per spawn)

- **Toolset enable/disable** — per-platform list write into `platform_toolsets`.
- **Per-skill enable/disable** — `skills.disabled: [...]` and `skills.platform_disabled.<platform>: [...]`.
- **Per-skill config** — `skills.config.<key>` from the `metadata.hermes.config` declarations the skill itself ships.
- **Per-MCP-server tool allowlist** — `mcp_servers.<name>.tools.include: [...]` (single config-native sub-tool gate Hermes provides).
- **MCP sampling caps** — `mcp_servers.<name>.sampling.{max_rpm, max_tokens_cap, max_tool_rounds}`.

### 5.3 Per-toolset native scope summary

| Toolset | Native scope knob | Notes |
|---|---|---|
| `terminal` | `terminal.cwd` (working-dir pin), `terminal.backend ∈ {local,ssh,docker,singularity,modal,daytona}`, `terminal.timeout`, `terminal.lifetime_seconds`, `docker_image`, `docker_forward_env`, container limits, optional `tirith` pre-exec scanner | Strongest natively. **No command-pattern allowlist** — needs plugin hook. |
| `browser` | `browser.inactivity_timeout` only | Provider-side scoping via `BROWSERBASE_*` keys. |
| `code_execution` | `code_execution.timeout`, `code_execution.max_tool_calls` | No language/import allowlist. The runtime is a Python sub-process that calls back into Hermes via RPC. |
| `web` | none | URL allowlist needs plugin hook OR sidecar proxy. |
| `file` | none | Path allowlist needs plugin hook. Per-call traversal-rejection in `tools/path_security.py` is hard-coded, not configurable. |
| `vision`, `image_gen`, `tts`, `voice` | none | Provider-side metering only. |
| `slack`, `telegram`, `discord` (gateways) | `<X>_ALLOWED_USERS` env var, `GATEWAY_ALLOW_ALL_USERS=false` default-deny | **No per-channel allowlist in core config** beyond per-user IDs. [uncertain — searched `.env.example` and `cli-config.yaml.example`; per-channel scoping would need either a plugin hook on `pre_gateway_dispatch` or inbound-message filtering.] |
| `mcp` | per-server `tools.include`, `enabled`, `sampling.*` | The most structured surface — see §5.4. |
| `homeassistant`, `spotify`, `cronjob`, `messaging`, `moa`, `rl`, `todo`, `memory`, `session_search`, `clarify`, `delegation`, `image_gen`, `vision`, `tts` | none beyond on/off + provider key | Acceptable for v1.5 — gating at toolset granularity. |

**Implication for v1.5 Pillar B:** the "per-tool scope shape" affordance from the vision doc §5.1 (URL allowlists, channel allowlists, etc.) is **partially native**:

- **Native — ship as config-write:** `terminal.cwd` + `terminal.backend` choice, MCP `tools.include`, MCP `sampling.*`.
- **Plugin-hook required:** URL allowlist on `web`, command-pattern allowlist on `terminal`, path allowlist on `file`, per-channel allowlist on Slack/Discord/Telegram gateways.
- **Sidecar HTTP proxy fallback:** egress from `code_execution` Python (where the structure isn't visible to a `pre_tool_call` hook).

### 5.4 The MCP advantage

MCP is the only Hermes surface with all three governance properties simultaneously:

1. **Per-tool granularity** (`tools.include`)
2. **Hot-reload** (5s mtime poll, `cli.py:7217-7268`)
3. **Header env-var interpolation** (clean credential injection, no literal in config)

A defensible v1.5 design *could* route as much tool surface as possible through MCP servers — running e.g. a Corellia-authored MCP shim in front of `web` that exposes `web_search` and `web_extract` as separate MCP tools, then gating them via `mcp_servers.<name>.tools.include`. **Trade-off:** that's a much larger build than just writing config files, and it duplicates work Hermes already does. The recommendation is to **use MCP for genuinely-MCP tools (the customer's choice of MCP servers) and accept toolset-granularity for Hermes-native toolsets**, with plugin hooks layered on top for the four non-native scopes. The implementation plan revisits this.

---

## 6. Mutability, propagation, and the revoke story

The honest accounting of how fast a revoke takes effect.

### 6.1 What hot-reloads vs what doesn't

Verified from source:

| Section | Reload behaviour | File location |
|---|---|---|
| `mcp_servers` | **Hot — 5s mtime poll** | `cli.py:7217-7268` |
| `platform_toolsets` | Startup-only | `hermes_cli/config.py:3229-3255` (load_config called at boot) |
| `skills.disabled` / `skills.platform_disabled` | Startup-only for the prompt-baked set; new files on disk are discoverable on next `skills_list`/`skill_view` tool call | Preloaded at `cli.py:11034` |
| `terminal.*`, `browser.*`, `code_execution.*` | Startup-only | Same load path |
| `plugins.enabled` | Startup-only | `plugins.py` registers at process init |
| `.env` | `/reload` slash command (`hermes_cli/config.py:3689`) — but that's a CLI surface, not an external trigger | n/a for our use case |

**There is no SIGHUP handler. No watchdog/inotify on non-MCP sections.** `/reload` is a user-typed CLI command, not a programmatic trigger.

### 6.2 The two-tier revoke story

Honest framing for the v1.5 demo:

- **Tier 1 — instant revoke (≤35s):** MCP-routed tool grants, MCP `tools.include` allowlist changes, MCP sampling caps. Customer demos: "revoke this tool from this agent → see it reject the next call within 30s, no restart."
- **Tier 2 — bounce-required (machine restart):** `platform_toolsets` changes, `skills.disabled` changes, `terminal.*` config, `browser.*`, `plugins.enabled`. Customer story: "revoke takes effect on next agent start; we offer a one-click 'restart with new config' that issues `flyctl machine restart` against the agent's machine — typically <30s for a microVM."

The Fly machine-restart path is already paved: `internal/deploy/FlyDeployTarget` has the machine-control APIs from M3. Adding a `RestartInstance(ctx, instance)` handler is a small extension — not a new architectural piece.

### 6.3 The plugin-driven third tier

A Corellia-authored `pre_tool_call` plugin reads its scope state from a file (or from a memory-mapped store) inside `$HERMES_HOME/`. The adapter's manifest poll re-writes that scope-state file on TTL; the plugin reads it on every tool call. **Effective propagation:** TTL only, no Hermes restart. **Trade-off:** the plugin must be willing to re-read the scope file on each call (or watch it itself); the cost is a single mtime stat per tool call. Cheap.

This makes URL-allowlist / command-allowlist / path-allowlist revokes Tier-1-equivalent without depending on Hermes's MCP code path.

---

## 7. Schema-stability risk — concrete assessment

### 7.1 What we found

- License: MIT (`gh api repos/NousResearch/hermes-agent`).
- Stars 117,700 / forks 17,430 / open issues 7,179 — actively used, actively maintained.
- Last push 2026-04-26 (today, hours before this document).
- Eight minor releases v0.4.0 → v0.11.0 over ~5 weeks (2026-03-23 → 2026-04-23).
- `_config_version: 22` (`hermes_cli/config.py:1027`) ⇒ at least 22 historical schema migrations tracked.
- `migrate_config()` and a migration ladder live in `hermes_cli/config.py` near `:1034` — i.e. **upstream itself ships migrations forward**, so old configs aren't rejected, they're rewritten.

### 7.2 What's load-bearing for Corellia

The keys we'd be writing are the most-used and most-stable parts of the schema:

- `platform_toolsets` — present since v0.4.x at least; central to Hermes's own multi-platform story.
- `mcp_servers` — present, schema-stable from `mcp_config.py`'s parser shape. MCP is upstream-strategic (it's *the* extension surface).
- `skills.disabled`, `skills.platform_disabled` — central to the skills subsystem.
- `plugins.enabled` / `plugins.disabled` — central to the plugin contract.
- `HERMES_HOME` env var — `hermes_constants.py:11-56`, foundational.
- `pre_tool_call` plugin hook signature — `plugins.py:60`, foundational.

The volatile area is provider/model config (model catalog refreshes), onboarding flags, and provider-credential env-var renames as new providers come and go. **None of those is on Corellia's write-path.**

### 7.3 The migration story

For each Hermes version Corellia certifies as supported:

1. The Hermes adapter image is built `FROM nousresearch/hermes-agent@sha256:<digest>`. The digest is recorded on `HarnessAdapter.upstream_image_digest` (already a v1 schema field).
2. The adapter version's `corellia.yaml` manifest declares which `_config_version` it writes against.
3. Corellia's catalog-ingest job (a new piece in v1.5) re-derives `CONFIGURABLE_TOOLSETS` from the pinned upstream image's `tools_config.py` (read via `docker run --entrypoint python` against the digest, dump the constant). If the toolset list changes between adapter versions, the catalog table gets a new row set keyed on the adapter version.
4. Org-curation rows reference `(adapter_version, toolset_id)` so an org's curation choices survive an adapter upgrade where the toolset list is unchanged, and require explicit re-confirmation on a toolset added/removed.

This is the same shape as the `HarnessAdapter` table's `validated_at` + `validation_report` columns from `blueprint.md` §4 — Corellia already designed the data model to admit per-version adapter facts.

---

## 8. Two corrections to the vision doc surfaced by the research

The vision doc (`v1.5-tools-and-skills-vision.md`) is broadly accurate, but the source-grounded research surfaced two specifics that should be noted before the implementation plan inherits them.

### 8.1 `agentskills.io` is not Hermes's actual upstream feed

The vision doc §3 frames `agentskills.io` as the community registry Corellia consumes. **`agentskills.io` exists** — `HTTP 308 → /home`, served by Vercel/Mintlify, looks like a docs/marketing site. But the Hermes core does **not** reference it. Searched `tools/skills_hub.py`, `hermes_cli/skills_hub.py`, `hermes_cli/config.py`, `hermes_cli/plugins.py`: zero hits.

What Hermes actually uses:

- **Hermes-hosted index:** `https://hermes-agent.nousresearch.com/docs/api/skills-index.json` (`tools/skills_hub.py:2706`, 6h cache).
- **GitHub-backed source router:** `tools/skills_hub.py:233,426,478,491,1973` — pulls skills from GitHub repos via `api.github.com/repos/{repo}/contents/...` and `.claude-plugin/marketplace.json`.
- **`hermes skills` CLI subcommands** verified in source: `unified_search`, `install`, `uninstall`, `check_for_skill_updates`, `append_audit_log`. [Uncertain on `publish` — did not enumerate the full subcommand surface.]

**Implication:** the v1.6 "external_registry" feed Corellia consumes is the **Nous-hosted skills index + GitHub repo-backed router**, not `agentskills.io`. The schema's `Skill.source = bundled | org_authored | external_registry` is unchanged; just the URL it eventually points at is different. The vision doc should be amended on the next pass to swap "agentskills.io" for "the Nous-hosted Hermes skills index (`hermes-agent.nousresearch.com/docs/api/skills-index.json`) and its GitHub-backed sources."

### 8.2 Scope-narrowing surface area is smaller than the vision implies

Vision doc §5.1 lists per-toolset scope shapes (URL allowlists for `web`, channel allowlists for `slack`, working-directory pins for `terminal`, command-pattern allowlists, path allowlists). **Of those, only `terminal.cwd` is config-native.** The rest need plugin hooks (`pre_tool_call`) or — in the case of code-execution egress — a sidecar HTTP proxy.

This is not a blocker. The plugin route is Hermes-supported, in-process, structured, and stable. But the vision doc's framing made it sound like writing config knobs Hermes already exposes. **Half of those knobs Hermes exposes; half Corellia ships as a plugin.** The implementation-plan scope should reflect that — it's a small Python module per scope shape, plus the plugin-manifest plumbing.

---

## 9. What this overview deliberately does not specify

This doc is a feasibility + technical-mapping artefact. It does **not** specify:

- Concrete schema for `Tool`, `AgentInstanceToolGrant`, `Skill`, `AgentInstanceSkill` tables (the implementation plan's job; the vision doc's §5.2 has the rough sketch).
- The on-the-wire shape of the manifest at `CORELLIA_TOOL_MANIFEST_URL`.
- The auth model for the manifest endpoint (Corellia spawn-time-issued machine token, presumably; pinned at the implementation plan).
- The TTL / cache-header policy for the manifest endpoint.
- The Corellia-authored plugin's name, register-function signature, or scope-state file format.
- The catalog-ingest pipeline (the job that derives `CONFIGURABLE_TOOLSETS` and `optional-skills/` listings from a pinned adapter image).
- The UI shape of the org-curation surface or the spawn-flow Step 7.
- Whether Pillar B's milestone scope-trims by routing certain affordances through MCP-shim vs direct toolset config.

All of those are the implementation plan's territory (`docs/plans/v1.5-tool-permissions.md`).

---

## 10. Summary — feasibility verdict

**The Tools governance vision is feasible inside Corellia's existing architectural rules with no new principles.** Every governance affordance maps to a documented Hermes input or extension point:

- Boot-time config writes (the bulk of the work): `$HERMES_HOME/config.yaml`, `$HERMES_HOME/.env`, `$HERMES_HOME/skills/`, `$HERMES_HOME/plugins/`.
- Hot-reload-capable subset: MCP `mcp_servers` block + Corellia-authored `pre_tool_call` plugin reading scope state from a re-writable file.
- Bounce-required subset: machine restart via existing `FlyDeployTarget` machinery.
- Schema churn: pinned adapter digest + per-version catalog ingest + Hermes-side migration ladder absorbs minor shifts.
- Vision-doc claims that didn't match source: two corrections noted in §8 (the upstream skills feed isn't `agentskills.io`; scope-narrowing is half-config-native and half-plugin-hook).

**The Hermes choice is load-bearing for this exact reason** — its file-based config + first-class plugin system + MCP hot-reload form together a control surface a less-configurable harness would not. A future adapter for a less-file-configurable harness would need a different translation strategy, but that is the cross-harness abstraction's whole point: **the manifest abstraction lives in Corellia; the per-harness mapping lives in the adapter.**

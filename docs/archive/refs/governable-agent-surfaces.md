# Governable Agent Surfaces

A reference taxonomy of the distinct surfaces inside a Corellia-deployed agent that an admin might plausibly want to govern. **Eight surfaces**, each with a different shape: credential model, scope model, lifecycle, and harness-side enforcement primitive all vary. They are *related but not interchangeable* — a single unified governance schema would either lose fidelity or carry weight it shouldn't.

This doc is the canonical reference. When a plan claims to govern surface X, it should cite the row below; when a plan conflates two surfaces, it should be sent back to read this doc first.

**Source:** extracted from `docs/executing/tools-governance.md` §1.0 during the v1.5 Pillar B planning pass on 2026-04-26. Hermes-side specifics are grounded in the v0.11.0 source at digest `sha256:d4ee57f254aabbe10e41c49533bbf3eb98e6b026463c42843a07588e45ddd338` (`nousresearch/hermes-agent:v2026.4.23`).

---

## The eight surfaces

| # | Surface | What it is | Governance shape | Hermes-side primitive | Roadmap status |
|---|---|---|---|---|---|
| 1 | **Toolsets** | A bundle of related tools that share a credential and a scope shape. The 22 entries in `CONFIGURABLE_TOOLSETS` (`hermes_cli/tools_config.py:50–76`): `web`, `browser`, `terminal`, `file`, `code_execution`, `vision`, `image_gen`, `moa`, `tts`, `skills`, `todo`, `memory`, `session_search`, `clarify`, `delegation`, `cronjob`, `messaging`, `rl`, `homeassistant`, `spotify`, `discord`, `discord_admin`. Closest layperson phrasing: "direct API integrations." | Per-instance grant of `(toolset_key, scope_json, credential_ref)`. Admin equips at spawn time, edits in fleet view. | `platform_toolsets.<platform>: [keys]` in `config.yaml` — controls which toolsets Hermes loads. Per-toolset env vars in `.env` carry credentials. | **v1.5 Pillar B** (in flight; plan: `docs/executing/tools-governance.md`). |
| 2 | **Tools** (individual callables) | The actual function-call leaves the LLM dispatches against — `web_search`, `web_fetch`, `shell_exec`, `read_file`, `write_file`, etc. Hermes calls each toolset's `register_tools()` to enumerate what the LLM sees. | Per-instance per-tool allow/deny inside an enabled toolset (a finer cut than equip-the-whole-toolset). | No native Hermes per-tool toggle — enforcement would be plugin-side via `pre_tool_call` matching on `tool_name`. | **v1.6.** Today, equipping a toolset equips *all* of its tools. Per-tool granularity needs a separate plan and a UX rethink (the catalog explodes from ~22 toolsets to ~150+ individual tools — wizard-step real estate is the binding constraint, not enforcement primitive). |
| 3 | **MCP servers** | External Model Context Protocol servers attached at runtime (`mcp_servers` config block). Each server is an out-of-process integration that exposes its own dynamic tool list at connect-time (`mcp__<server>__<tool>` synthesised names). Distinct from Toolsets because the tool list is *not known* at catalog-derive time. | Per-instance grant of `[(server_name, transport, headers, tools_include?)]`. Org-curation may allow/deny entire servers. | Native `mcp_servers` config + 5s mtime poll for hot-reload (`cli.py:CONFIG_WATCH_INTERVAL`). Per-server tool allowlist field name unverified at the time of writing — needs upstream confirmation before any future MCP plan starts. | **v1.6** as a standalone plan once Toolsets is shipped and operator usage informs the right shape. |
| 4 | **Skills** | Reusable, declarative agent capabilities — packaged prompts + (often) lightweight tool stubs. Hermes ships its own `skills` toolset (one of the 22 above, exposes `skill_*` tool calls) and the broader ecosystem has external registries (`agentskills.io`). Distinct from Toolsets because Skills *modify the agent's behaviour declaratively* (prompts, response shapes), not by adding new API integrations. | Per-instance grant of `[(skill_id, source: builtin \| external_registry, version_pin)]`. Likely also org-level "approved skills list." | Hermes's `skills` toolset reads skill manifests from disk. External registry integration is greenfield. | **v1.5 Pillar C** — separate plan, follows directly after Pillar B. Schema will reserve `Skill.source = external_registry`; external-registry UI lands in v1.6. |
| 5 | **Tool providers** | The backend implementation *inside* a toolset. `web` can be backed by Exa, Parallel, or Firecrawl; `image_gen` by OpenAI, Stability, or Replicate. Carries its own credentials and rate limits. OAuth onboarding (`requires_nous_auth` flag) lives here. | Per-instance choice of provider per equipped toolset; per-org "approved providers" list; OAuth onboarding flow per provider. | Each toolset's provider list is hard-coded in its module; selection is via toolset-specific env var (`HERMES_WEB_PROVIDER`, etc.). | **v1.6.** v1.5 Pillar B equips toolsets at their default provider; provider selection is a separate UX surface. (One concession: per-toolset credential capture in v1.5 implicitly chooses provider via which key the operator pastes — e.g., pasting `EXA_API_KEY` selects Exa for `web`.) |
| 6 | **Platforms / gateways** | The 19 platform integrations Hermes can run on simultaneously: `cli`, `telegram`, `discord`, `slack`, `whatsapp`, `signal`, `bluebubbles`, `email`, `homeassistant`, `mattermost`, `matrix`, `dingtalk`, `feishu`, `wecom`, `weixin`, `qqbot`, `webhook`, `api_server`, `cron` (`hermes_cli/platforms.py:PLATFORMS`). Each platform has its own channel allowlist + per-platform toolset list. | Per-instance grant of `[(platform_key, channel_allowlist, per_platform_toolsets)]`. Likely org-level "allowed platforms" curation. | Native `platform_toolsets` is *keyed by platform* — so platforms and toolsets are already entangled in Hermes's config shape. | **v2 with M5 Fleet Control.** v1 deploys agents on `cli` only; v1.5 governs `cli`'s toolset equipping exclusively. Multi-platform deploy + per-platform toolset matrices + channel allowlists wait for M5. |
| 7 | **Memory** | Long-term memory backends — Hermes's local `memory` toolset (one of the 22), or external providers (Elephantasm per `vision.md`). Distinct from Skills/Tools because memory has *write-back* semantics: the agent writes into memory, the admin governs what categories of facts it may persist. | Per-instance memory backend choice + retention policy + redaction rules. | `memory` toolset config; sidecar pattern (Option A from `blueprint.md` §7) for external providers. | **v2.** Blueprint §13 explicitly defers. Equipping the `memory` toolset (turning it on/off) is in scope of v1.5 Pillar B, but the actual *governance* questions — retention, redaction, write-back policy — wait for v2. |
| 8 | **Plugins** | The layer `corellia_guard` itself rides on. Hermes's plugin system (`~/.hermes/plugins/<name>/`, `hermes_cli/plugins.py:60–82`) — third-party Python packages that hook into the agent lifecycle. **Not user-facing today**; only Corellia ships plugins. | Per-instance / per-org "approved plugins list" if/when third-party plugins become an operator-installable surface. | Native plugin discovery + manifest contract (`plugin.yaml` with `name / version / hooks: [...] / kind`). | **Post-v2.** Listed for completeness — third-party plugin governance only becomes relevant if/when Corellia opens the plugin surface to operators. |

---

## Sequencing

Roadmap implied by the surface shapes:

```
v1.5 Pillar B (in flight) ── Toolsets (#1) — config + plugin tier, cli platform only
v1.5 Pillar C (next plan)  ── Skills (#4) — separate plan, separate schema
v1.6                        ── MCP servers (#3) — separate plan,
                              Tool providers (#5), per-tool granularity (#2),
                              external skills registry (#4 extension),
                              OAuth onboarding (cross-cuts #5 and #4)
v2                          ── Platforms (#6) properly with M5 Fleet Control, Memory (#7)
post-v2                     ── Third-party plugins (#8)
```

**Why each surface gets its own plan rather than a unified one-pass build:** the schemas, scope shapes, and enforcement primitives don't share enough structure to bundle. A single "agent governance" schema would either lose fidelity (forcing #4 Skills' write-back semantics into the same shape as #1 Toolsets' read-only API gating) or carry weight it shouldn't (Phase 5's plugin enforcement isn't the right primitive for #7 Memory's redaction rules — those are different threat models). Separate plans, separate ship cadences, shared taxonomy.

---

## Naming caveat — operator-facing vs internal

The wizard step is labelled `[ TOOLS ]` and the sidebar nav says "Tools" because that is the term operators recognise. Internally — schema names, RPC names, code symbols — Corellia uses **Toolset** to keep #1 and #2 unambiguous. So `tools` table = toolset catalog, `agent_instance_tool_grants` = toolset grants, etc. When v1.6 introduces per-tool (#2) granularity, it lands as a sub-shape under each toolset grant (`scope_json.tools_allow_deny`), not a parallel table.

Anything user-facing says "tools." Anything in code or schema discussion should use the precise term from this doc. If a plan or PR description blurs that line, it's a signal to come back to this reference.

---

## How to use this doc

- **Drafting a new plan?** Cite the surface number it governs; if it spans more than one, justify the bundle (and probably reconsider).
- **Reviewing a plan?** Cross-check what it claims to be in scope against the row's status column. Anything claiming to govern a row marked "v2" or "post-v2" needs a roadmap conversation, not a code-review one.
- **Hermes upstream changes?** If `_config_version` bumps or a new toolset lands in `CONFIGURABLE_TOOLSETS`, update the relevant row's source citation. The 22-toolset count and platform-list of 19 are pin-bound to v0.11.0; future pins re-verify.

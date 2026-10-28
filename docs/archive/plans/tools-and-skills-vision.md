# Vision — Tools & Skills Governance (v1.5 Pillars B + C)

**Status:** vision doc, awaiting per-pillar implementation plans
**Owner:** TBD
**Supersedes:** —
**Related:**
- `docs/plans/governance-capabilities.md` §2 (Tools pillar capability spec), §4 (Skills pillar capability spec), §6 (registry + grant pattern)
- `docs/plans/governance-expansion-roadmap.md` §2 (canonical execution sequence — supersedes the original "Memory → Tools → Skills" framing)
- `docs/vision.md` §"Garage" model, §core pillars (skills library, permissions)
- `docs/blueprint.md` §3.2 (configuration contract — `CORELLIA_TOOL_MANIFEST_URL` reserved), §11.3 (`CORELLIA_*` env-var convention), §11.5 (no upstream forks)

This doc captures the vision for Tools and Skills as a single unified narrative. It is **not** an implementation plan — it locks the framing so the per-pillar plans (`v1.5-tool-permissions.md`, `v1.5-skills-library.md`) don't relitigate scope. The roadmap stays the structural source of truth for sequencing and out-of-scope deferrals; this doc is the *why* and the *shape*.

---

## 1. The core insight — Corellia is a governance shell, not a primitive inventor

Hermes Agent already ships with a complete tools-and-skills substrate. From the live repo (`github.com/NousResearch/hermes-agent`):

- **~40 tools** organised into ~22 toolsets (`web`, `browser`, `terminal`, `file`, `code_execution`, `vision`, `image_gen`, `tts`, `skills`, `todo`, `memory`, `session_search`, `clarify`, `delegation`, `cronjob`, `messaging`, `moa`, `rl`, `homeassistant`, `spotify`, `discord`, `discord_admin`, …). Configurable via `hermes tools` CLI; persisted to `~/.hermes/config.yaml` under `platform_toolsets`. Per-platform toggleable. Some default-off; some platform-restricted.
- **Skills as file-based bundles.** Each skill is a directory: a `SKILL.md` with YAML frontmatter (`name`, `description`, `version`, `author`, `license`, `metadata.hermes.tags`, `related_skills`) plus optional `scripts/`, `references/`, `examples/`, `templates/`. Two tiers: default-active (copied to `~/.hermes/skills/` at setup) and `optional-skills/` (~30+ subtrees: `software-development`, `devops`, `research`, `email`, `blockchain`, `creative`, `health`, `mcp`, `productivity`, `social-media`, …). Configured via `~/.hermes/config.yaml` under `skills.disabled` and `skills.platform_disabled.<platform>`. Per-skill on/off, per-platform.
- **Plugin + MCP surface.** `hermes_cli/plugins.py` exposes `discover_plugins()` / `get_plugin_toolsets()`. MCP is a first-class extension point (`optional-skills/mcp/`). A community registry exists at `agentskills.io` with `hermes skills browse / install / publish` subcommands.

**Corellia does not reinvent any of this.** Hermes already won the "what shape is a skill file" and "what shape is a toolset" questions. The vision is to **wrap, curate, and govern** those primitives — and to do the same for the equivalents in every other harness in the garage (Claude Agent SDK, LangGraph, CrewAI, custom). The `SKILL.md` frontmatter and `platform_toolsets` keys become *adapter targets*, not surfaces Corellia owns or invents.

This is the `vision.md` "integrate, don't rebuild" stance cashed out concretely. **What Corellia adds — and what Hermes alone does not — is the multi-tenant, multi-agent, multi-harness, governance-first management layer on top.**

---

## 2. The seven concrete affordances Corellia adds on top of Hermes-native

The same seven apply, with per-harness translation, to every other harness in the garage. Hermes is the v1.5 reference because it's already in the catalog.

1. **Discovery.** One UI surfaces Hermes's built-in toolsets + default-active skills + the `optional-skills/` library + (later) `agentskills.io` registry entries. The admin browses a catalog; they don't `cd ~/.hermes/skills/`.
2. **Org-level curation.** The org-admin picks which built-in tools and skills are *available* to instance-level admins to equip. "No agent in this org wears `discord_admin`" is a config-time decision, made once at the org level, not per-spawn. This is the difference between "Hermes can do X" and "this org's agents are *allowed* to do X."
3. **Per-instance equipping at spawn.** The instance admin checks boxes; Corellia translates "this agent has `software-development/code-review` + `devops/deploy-helper` equipped, with `web` and `terminal` toolsets granted" into the right `~/.hermes/skills/` directory contents + `skills.disabled` entries + `platform_toolsets` keys at container boot. **Adapter territory only** — no upstream fork (blueprint §11.5).
4. **Versioning + pinning.** Skills and toolsets pin by version (or, where the upstream supports it, digest) the same way templates pin image digests per blueprint §11.2. Equipping `code-review v3.2` on Monday means the agent is still running `code-review v3.2` on Friday even if upstream has shipped v3.3 — until an admin clicks upgrade. **Explicit, audited action.** No silent drift.
5. **Custom org-authored skills + tools.** The org publishes its *own* skill bundles (and, later, custom tools) into the same equipping flow, alongside upstream Hermes ones. Corellia eats Hermes's `SKILL.md` shape — it does not invent a new format — so org-private skills are byte-portable to a future open Skills Hub if the org ever decides to publish.
6. **Cross-harness abstraction.** The *same* "equipped skills" / "granted tools" UI works for Hermes today and for Claude Agent SDK / LangGraph / CrewAI / custom harnesses tomorrow. Each harness's adapter translates the Corellia manifest into whatever that harness natively expects. Hermes's `SKILL.md` + `~/.hermes/config.yaml` shape is one translation target; LangGraph's would be another. **The manifest abstraction lives in Corellia; the per-harness mapping lives in adapters** — the LSP analogy from `vision.md` cashed out concretely.
7. **Scoped tool grants the skills cascade through.** Equipping a skill surfaces its tool requirements ("this skill needs `web`, `terminal`, `slack`"); the admin grants those with appropriate scope (Pillar B); only then does the skill activate. **Default-deny by default** — a fresh agent has zero tools and zero skills until granted/equipped. This is the inverse of how most agent frameworks ship today and the single biggest differentiator vs. Composio / Arcade / native Hermes-out-of-the-box.

---

## 3. The strategic frame — `agentskills.io` is a feed, not a competitor

Corellia does not compete with the `agentskills.io` community registry. **Corellia consumes it.** Hermes's skill format wins because it already exists, has community gravity, and ships with a registry. Trying to invent a parallel format would burn engineering effort on a non-differentiating problem (`vision.md` test 2: "Does it differentiate the product?" — a skill file format does not).

What Corellia *does* do that `agentskills.io` alone cannot:

- **Multi-tenant.** `agentskills.io` is a single global registry. Corellia layers org-scoped curation and org-private skills on top.
- **Multi-agent.** `agentskills.io` is one developer + one Hermes install. Corellia is "this skill is equipped on 250 agents across the org; version-bump-once, fleet-wide-effect."
- **Multi-harness.** `agentskills.io` is Hermes-only. Corellia translates the same manifest to whichever harness an instance is running. The same skill-equipped admin experience works whether the underlying agent is Hermes, Claude Agent SDK, LangGraph, or a custom repo.
- **Governance-first.** `agentskills.io` is a discovery surface. Corellia is a *control* surface — pin versions, audit equipping, narrow tool scope, revoke without redeploy.

The relationship is exactly the relationship Vercel has to npm, or that AWS IAM has to the IAM-policy ecosystem: the upstream registry is the source of truth for the artefact format; Corellia is the multi-tenant, governance-tier consumer.

---

## 4. Why Tools first, not Skills first

The roadmap §2 already locks Memory → Tools → Skills. The Hermes research strengthens that ordering rather than weakening it:

- **Hermes skills declare which toolsets they need.** Skill bundles have `related_skills` and (informally, in their own `SKILL.md` text) tool dependencies. Without a tool model, skills have nothing to cascade into — the equipping flow either fakes the dependency check or skips it.
- **Tools alone are demoable.** "This agent has `web` and `terminal` granted, with the URL allowlist set to `*.acme.com`" is a complete demo on its own. Skills add the catalog UX *on top of* working tools.
- **Skills before tools means redoing skills.** Equipping skills before tools work means each skill ships with implicit, unconfigurable, all-or-nothing toolset access — and every skill we equip has to be re-touched once Pillar B's scope-narrowing arrives. Worst-case "redoes itself in v1.6" risk.

**One concession the Hermes finding does buy us.** Pillar C's scope can be lighter than the roadmap currently treats it: the v1.5 Skills milestone can ship as (a) browse + equip Hermes's existing skills, (b) pin versions, (c) drop files into the container at boot, (d) surface tool requirements as informational — *with the actual scope-narrowing of those tools coming from Pillar B already*. Skills become a UX layer over an already-working tools substrate, not a parallel substrate of their own. This is recorded as a candidate scope-trim for the per-pillar plan, not a roadmap rewrite.

---

## 5. Pillar B — Tools, in the Hermes-grounded shape

Replaces the abstract framing in `governance-capabilities.md` §2 with a Hermes-concrete one. The capability spec's affordances all still apply; this section names them in Hermes vocabulary so the per-pillar plan starts with concrete artefacts.

### 5.1 The tool catalog is Hermes's toolsets, surfaced

The org-level catalog in v1.5 is **the ~22 Hermes toolsets**, browseable in the Corellia UI as a curated list. Each entry carries:

- **Toolset name** (`web`, `terminal`, `slack`, `discord`, …) and category.
- **Description**, **icon**, **default-on/off-in-Hermes** flag.
- **Required env vars** (e.g. `WEB_TOOLS_*`, `VISION_TOOLS_*`, `SLACK_BOT_TOKEN`) — these are the secrets the admin attaches.
- **Scope shape** — per-toolset, structured. `slack` has a channel allowlist + send-vs-read flag; `web` has a URL pattern allowlist + method allowlist; `terminal` has a working-directory + command-pattern allowlist; `mcp` has a sub-capability allowlist (which MCP tools within a server). The scope shape is **declared once per toolset** in a Corellia-side metadata table; the spawn UI renders the appropriate input controls from it.
- **Org-availability flag** — the org-admin can hide a toolset from the instance-spawn catalog entirely (`discord_admin` is the canonical example).

Adding a non-Hermes harness later means adding that harness's tool list to the same catalog table, with its own scope shapes and env-var requirements. The catalog table is harness-aware but harness-agnostic at the UI level.

### 5.2 The grant model

`AgentInstanceToolGrant`: `(agent_instance_id, tool_id, scope_json, credential_storage_ref, granted_by, granted_at)`. Per blueprint §11.6, raw credentials live in a secret store; the grant row carries an opaque `storage_ref`. This matches the existing `Secret` table pattern from M4 — same architecture, new domain.

### 5.3 The manifest

The control plane serves a per-instance manifest at `CORELLIA_TOOL_MANIFEST_URL` (already reserved in blueprint §3.2). For Hermes-bound instances, the **Hermes adapter** is what consumes this manifest — at container boot, the adapter:

- Writes `~/.hermes/config.yaml` with the granted toolsets enabled in `platform_toolsets` and the rest disabled.
- Injects per-toolset env vars from the resolved credentials.
- Where Hermes's native scope shape supports it (URL allowlists, channel allowlists), writes those into the toolset config too.
- Where Hermes does not natively narrow scope, the adapter narrows in a sidecar (blueprint §7 Option A) — e.g. an HTTP proxy that filters outbound tool calls against the granted scope. **Corellia narrows at config-distribution time *or* sidecar time, never at runtime via interception of LLM tool calls** (blueprint §11 — enforcement is O(spawn) + O(grant change), not O(tool-call)).

Manifest changes propagate without redeploy. The adapter polls the manifest URL on a TTL; revoking a grant in the UI takes effect within seconds.

### 5.4 What the v1.5 Tools milestone delivers, concretely

- Schema: `Tool`, `AgentInstanceToolGrant` (registry + grant pattern per roadmap §6).
- Seeded tool catalog covering Hermes's 22 toolsets with per-toolset scope shapes declared.
- Org-admin UI to enable/disable toolsets at the org level.
- Instance-spawn UI step (the new step 7 from roadmap §7) that surfaces granted toolsets with per-tool scope inputs.
- Hermes adapter changes to consume `CORELLIA_TOOL_MANIFEST_URL` and write `~/.hermes/config.yaml` accordingly at boot.
- Manifest fetching with TTL-based propagation; revoke-without-redeploy demoable.

---

## 6. Pillar C — Skills, in the Hermes-grounded shape

Replaces the abstract framing in `governance-capabilities.md` §4. Same affordances, named in Hermes vocabulary.

### 6.1 The skill catalog is Hermes's skills, surfaced

The v1.5 skill catalog is **the default-active skills + the `optional-skills/` library** that ship in the Hermes container, plus any Corellia-org-authored skills. Browse experience mirrors `hermes skills browse` but in a multi-tenant UI — with org-level curation deciding which skills are equipping-eligible.

`agentskills.io` integration is **explicitly v1.6** — out of scope for v1.5, but the schema is shaped to consume it (skills carry a `source` enum: `bundled` | `org_authored` | `external_registry` future). The same consideration that drove `HarnessAdapter.source` in `blueprint.md` §4 applies: design the registry to admit external sources from day one, ship only one v1.5.

### 6.2 The equipping model

`AgentInstanceSkill`: `(agent_instance_id, skill_id, version, config_overrides_json, equipped_by, equipped_at)`. Multiple skills per instance (the spawn UI is multi-select). Versioning per roadmap §5 — pinned at equip time, upgrade is an explicit admin action.

The equipping flow surfaces tool requirements as **a visible cascade**: "Equipping `software-development/code-review` requires the `terminal` and `git` toolsets — grant them now?" If the underlying tool grants don't exist, equipping fails closed. This is the Pillar-B → Pillar-C dependency made concrete.

### 6.3 The manifest

`CORELLIA_SKILLS_MANIFEST_URL` (new env var, to be added to blueprint §3.2 when Pillar C lands). For Hermes-bound instances, the adapter at boot:

- Materialises each equipped skill's directory structure into `~/.hermes/skills/<skill-name>/` — `SKILL.md`, `scripts/`, `references/`, `examples/`, `templates/`.
- Writes `skills.disabled` to *exclude every skill that wasn't equipped*, so the agent only sees the curated set even though Hermes ships with more on disk.
- Surfaces per-skill `config_overrides` wherever the skill's `SKILL.md` declares config knobs.

Cross-harness translation: a Claude Agent SDK adapter would translate the same skill manifest into whatever shape that SDK consumes (system-prompt fragments + tool registrations + initial context). The Corellia-side manifest is harness-agnostic; the adapter is the seam.

### 6.4 What the v1.5 Skills milestone delivers, concretely

- Schema: `Skill`, `AgentInstanceSkill`.
- Seeded skill catalog covering the Hermes default-active set + curated subset of `optional-skills/` (start with software-development, devops, research, productivity — leave the rest behind org-level disable flags).
- Org-admin UI to enable/disable skills at the org level.
- Instance-spawn UI step (the new step 8 from roadmap §7) that surfaces skill multi-select with the tool-grant cascade.
- Hermes adapter changes to consume `CORELLIA_SKILLS_MANIFEST_URL` and materialise `~/.hermes/skills/` accordingly at boot.
- Org-authored skill upload path (drop a directory matching `SKILL.md` shape; Corellia treats it identically to a bundled skill).

---

## 7. What this vision deliberately does NOT include

Inherited from `governance-capabilities.md` §7 unchanged. Restated here so the per-pillar plans don't relitigate:

- **`agentskills.io` registry integration.** Schema admits it; UI lands in v1.6.
- **User-defined skills via UI.** Skills are admin-curated artefacts in v1.5; user-authored skills are v2 (per `governance-capabilities.md` §4).
- **Tool runtime / proxy.** Corellia narrows the manifest; the agent talks to actual tool runtimes (MCP servers, HTTP endpoints, Hermes-internal tool implementations) directly. v1.5 does not build a tool proxy — except where sidecar narrowing is the only way to enforce a scope Hermes doesn't natively understand.
- **Approval workflows.** "Agent requested access to tool X, admin approves" is post-v1.5.
- **Time-bounded grants.** `expires_at` reserved in schema, not surfaced in UI.
- **Cross-org sharing.** Registries are org-scoped.
- **A/B-testing skills across a fleet.** Future product surface.
- **Skill inheritance / composition.** ("My skill IS skill X plus these additions.") v2.

---

## 8. Open design questions inherited from the roadmap

Repeated here so the per-pillar plans inherit them as "decision N" prompts. The Hermes findings answer some of them already; called out where they do.

**Tools (`v1.5-tool-permissions.md` will resolve):**
- Tool catalog curation — UI in v1.5, or seeded from a YAML file in the repo? *Hermes-finding suggestion: seeded from a YAML file derived from `hermes_cli/tools_config.py`'s `CONFIGURABLE_TOOLSETS`. Org-admin UI surfaces enable/disable but not authoring in v1.5.*
- Are credentials always per-instance, or do we ship shared org-level credentials in v1.5 too?
- Manifest TTL / fetch cadence — push-on-change or pull-with-TTL? *Default to pull-with-TTL; SSE is a v1.6 add.*
- Where does sidecar scope-narrowing live in the architecture — inside the Hermes adapter image, or a separate Corellia-side proxy container?

**Skills (`v1.5-skills-library.md` will resolve):**
- Are skills first-class in the schema (their own table) or just `AgentTemplate` rows of a different `kind`? *Hermes-finding suggestion: own table — Hermes's data model treats skills and templates as orthogonal, the schema should mirror that.*
- Skill versioning — semver, pure digest, or both? *`SKILL.md` ships a `version` string; pin that string in v1.5, add digest pinning if/when bundled skills get distributed as registry artefacts.*
- Skill prompts — composed at the control plane (one system prompt per agent) or at the harness? *Hermes-finding suggestion: at the harness — Hermes already has its own skill-composition logic, the adapter materialises files and Hermes does the rest. Cross-harness translation might compose at the control plane in v1.6+.*
- Skill catalog seeding — curated subset of `optional-skills/`, or all of it behind org disable flags? *Curated subset for v1.5 (software-development, devops, research, productivity); the rest gated behind an org-admin "show advanced skills" flag.*

---

## 9. Sequencing

Owned by `governance-expansion-roadmap.md` §2. The canonical sequence at this doc's last update: **M5 Fleet Control → M-chat → Tools → Channels → Skills → v1.6 Tools deepening → v2 Memory → v2 IAM**. The Tools pillar's per-pillar plan is `docs/executing/tools-governance.md`; Skills lands at `docs/executing/skills.md` (TBD); Memory deferred to v2 per the roadmap. This vision doc does not duplicate the ordering — it provides the Hermes-grounded shape each plan compares against.

After the in-Hermes pillars ship: the `agentskills.io` registry integration, the audit log, and observability are the natural successors.

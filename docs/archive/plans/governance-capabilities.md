# Governance Pillars — Capability Spec

**Status:** living spec; capability content stable, sequencing owned elsewhere
**Owner:** TBD
**Supersedes:** earlier `v1.5-roadmap.md` framing — sequencing and per-pillar timing now live in `governance-expansion-roadmap.md`; this file retains the capability shape only
**Related:**
- `docs/plans/governance-expansion-roadmap.md` — **owns sequencing** (which pillar lands when, against which surface in the §1.0 taxonomy, with what wizard-step shape)
- `docs/executing/tools-governance.md` §1.0 — the 8-surface taxonomy this spec maps onto
- `docs/blueprint.md` §1 (MVP scope), §3.2 (configuration contract — reserved env-var slots), §9 (data model), §10 (RPG-character-creation flow), §13 (out-of-scope-for-v1 list this spec incrementally retires), §14 (post-v1 roadmap)
- `docs/vision.md` §"Garage" model, §core pillars (skills library, memory, permissions, audit)
- `docs/plans/post-0.2.6-roadmap.md` (v1 sequencing — M1 onboarding → M2 catalog → M3 spawn → M4 fleet view)

This is a **capability-level spec, not a roadmap and not an implementation plan.** Each pillar below describes *what it must do* — admin-perspective UX, agent-perspective contract, governance affordances, scope envelope. The point of this file is to lock the capability shape so per-pillar plan docs (under `docs/executing/`) don't relitigate scope every time, and so reviews can compare a plan against its capability spec without rediscovering the affordances.

## What this doc owns vs what the execution roadmap owns

| Question | Answered in |
|---|---|
| What does the **Tools** pillar (etc.) need to deliver? | **Here** (§2–5) |
| Which pillars come in what **order**? | `governance-expansion-roadmap.md` §2 |
| Which **wizard step** does a pillar add? | `governance-expansion-roadmap.md` §1 |
| Which **surface number** in the 8-surface taxonomy does a pillar govern? | `governance-expansion-roadmap.md` §2 + `executing/tools-governance.md` §1.0 |
| **When** does a pillar ship (v1.5 / v1.6 / v2)? | `governance-expansion-roadmap.md` §2 |
| **How** does a pillar ship (phases, deliverables, tests)? | `docs/executing/<pillar>.md` |

If this doc and `governance-expansion-roadmap.md` ever conflict on sequencing or timing, the roadmap wins. If they conflict on a pillar's capability shape, this doc wins.

---

## 1. Framing — what each pillar adds

**v1** is the spawn-and-deploy slice: an admin can spawn a Hermes agent on Fly with a model API key, see it in a fleet view, and stop or destroy it. That's the demoable hackathon end state per `blueprint.md` §1.

**The governance pillars** turn Corellia from "a deployer" into a *control plane* — the moment where `vision.md`'s "IAM-style governance of which agents can touch which tools, databases, and infrastructure" becomes a concrete artefact instead of a positioning statement. Each pillar adds one new control surface to the spawn wizard and the fleet-view per-instance editor (the expanding-surface principle is documented in `governance-expansion-roadmap.md` §1).

**Why pillars are carved out at all.** Each pillar individually adds non-trivial schema + UI + adapter-contract surface. Bundling two pillars into one milestone produces UX-shape questions, schema-shape questions, and propagation-tier questions that each warrant their own plan. The cost of a bundled milestone always exceeds the savings — so each pillar is one milestone with one plan doc, in series, not in parallel. The 0.2.5 ↔ 0.2.6 collision (two plans both touching `internal/auth/`) is the cheap lesson worth remembering.

**Why this spec overrides `blueprint.md` §13.** The blueprint currently lists skills library, context management, memory integration, IAM, and tool permissions as out-of-scope for v1. After each pillar's plan doc is approved, blueprint §13 is edited to remove that pillar from the deferred list with a forward-pointer to its plan. The remaining §13 deferrals (audit log, full observability, multi-tenant isolation, programmatic adapter generation, additional deploy targets, model gateway, repo linking, agent-to-agent comms, scheduling) stay deferred — those are post-governance-expansion work.

---

## 2. Tools — fine-grained tool/toolset permissioning

### What it must do (from the admin's perspective)

At spawn time (and editable post-spawn), the admin defines **what tools this agent can use, and with what scope**. The UI is a per-tool grant matrix:

- **Tool catalog.** The org has a catalog of tools — Slack, GitHub, Postgres, internal HTTP endpoints, MCP servers, native Hermes capabilities. The catalog is curated by org-admins; instance-spawn-time consumes it, doesn't define it.
- **Per-tool grant.** For each tool, three states: *not granted*, *granted with default scope*, *granted with custom scope*.
- **Per-tool scope.** Heterogeneous and tool-specific. Examples of what scope means in practice:
  - **Slack** — channel allowlist, send-vs-read distinction, DM-allowed boolean.
  - **GitHub** — repo allowlist, read-vs-write distinction, branch protection awareness.
  - **Postgres** — database / schema / role-mapping allowlist, read-only flag.
  - **HTTP** — URL pattern allowlist, method allowlist.
  - **MCP server** — sub-capability allowlist (which MCP tools within the server).
- **Tool credentials.** When granting a tool, the admin attaches a credential — either a per-instance secret (the agent acts as a dedicated bot identity) or a shared org-level credential (the agent acts as the org's generic identity for that tool). Credential rows stay in the existing `Secret` table pattern; the *grant row* references them.

Post-spawn, the agent's detail page shows the granted tools and their scopes. Grants can be revoked, expanded, or narrowed without redeploying — the change propagates via the manifest URL described below.

### What it must do (from the agent's perspective)

The harness adapter receives a per-instance `CORELLIA_TOOL_MANIFEST_URL` (already reserved in `blueprint.md` §3.2). The control plane serves a manifest at that URL describing the tools the agent has been granted, with their scopes already applied. **Crucially:**

- **The agent never sees tools it wasn't granted.** Tools missing from the manifest are invisible to the agent — the LLM can't try to call a tool whose schema it doesn't have.
- **The agent never sees scopes broader than its grant.** A "Slack tool, channel `#sales` only" grant produces a Slack tool whose channel parameter is *fixed* in the manifest (or whose schema enumerates only `#sales`). The agent literally cannot ask to post to `#engineering`.
- **Manifest changes propagate without redeploy.** The manifest URL is fetched on tool-call (or on a TTL), so revoking a grant in the UI takes effect within seconds, not hours.

### Governance affordances this adds

- **Narrowing happens at config-distribution time, not at runtime.** This is the architectural reason the IAM model scales: enforcement is O(spawn) + O(grant change), not O(tool-call). The control plane never needs to intercept individual LLM tool invocations.
- **Heterogeneous scoping as a first-class primitive.** Per-tool scope shapes vary wildly — declaring scope as structured data (rather than free-text policy) means the UI can render appropriate inputs (channel-pickers for Slack, repo-pickers for GitHub) and the manifest generator can enforce them statically.
- **Default-deny by default.** A new agent has *zero* tools until an admin grants them. There is no "default allow" mode and no fallback to a permissive parent grant. This is the inverse of how most agent frameworks ship today, and it's the single biggest differentiator vs. Composio / Arcade / etc.
- **Credential isolation per agent.** Per-instance credentials mean revoking a single agent's access to a tool is "delete the secret"; the rest of the fleet is unaffected. Shared credentials are an opt-in convenience for low-stakes tools.
- **Auditability primitive.** Every grant is a row with `(agent, tool, scope, granted_by, granted_at)`. The post-pillar audit log consumes this table; the table itself ships with this pillar because the spawn flow needs it.

### What's deliberately out of scope for this pillar

- Time-bounded grants (`expires_at` column reserved but not surfaced in the v1.5 UI).
- Approval workflows ("agent requested access to tool X, admin approves").
- Tool runtime / execution itself — Corellia narrows the manifest, but the agent talks to the actual tool runtime (MCP server, HTTP endpoint) directly. This pillar does not build a tool proxy.
- Cross-org tool sharing.
- Per-grant rate limits / quotas (deferred to model gateway pillar in v2).

> Plan doc owning execution: `docs/executing/tools-governance.md` (queued; covers Toolsets surface #1 on `cli` only — sub-shapes #2/#3/#5 land in the v1.6 cluster per the execution roadmap).

---

## 3. Channels — platform/gateway governance

### What it must do (from the admin's perspective)

At spawn time (and editable post-spawn), the admin defines **which platforms this agent can be reached through** and on what scope:

- **Platform catalog.** The 19 Hermes platforms (`cli`, `telegram`, `discord`, `slack`, `whatsapp`, `signal`, `bluebubbles`, `email`, `homeassistant`, `mattermost`, `matrix`, `dingtalk`, `feishu`, `wecom`, `weixin`, `qqbot`, `webhook`, `api_server`, `cron`) become catalog entries; org-admins curate which are enabled for the org.
- **Per-instance platform grant.** Each spawn picks a non-empty subset (default: `cli` only, matching v1 behaviour). Equipping `slack` requires Slack OAuth onboarding; equipping `telegram` requires a bot token; etc. — the credential acquisition shape is per-platform.
- **Per-platform channel allowlist.** Where the platform has a notion of channels/rooms (Slack, Discord, Telegram groups, Matrix rooms), the grant carries an allowlist. The agent literally cannot listen on or post to channels outside the allowlist.
- **Negative allowlist as a first-class state.** "This agent will *never* run WhatsApp" is a recordable decision — locked on the catalog entry so the operator (or a self-bootstrapping agent, see below) can't equip it later without an explicit org-admin override.

Post-spawn, the agent's detail page lists active platforms with their channel scopes, and surfaces an `[ ENABLE PLATFORM ]` affordance for not-yet-equipped ones (gated on org-curation).

### What it must do (from the agent's perspective)

The harness adapter renders the granted platforms into Hermes's `platform_toolsets` config block (which is *keyed by platform* — see surface #6 in the 8-surface taxonomy), provisions per-platform credentials into `.env`, and configures Fly machine ingress for any platform that needs inbound webhooks. The agent only ever loads gateways it was granted; the platforms it wasn't granted simply don't exist in its runtime.

**Defense-in-depth against self-bootstrap.** Without governance, an agent with `terminal` or `file` toolset access could in principle edit `~/.hermes/config.yaml` to add a Telegram listener on its own. The `corellia_guard` plugin (shipped with the Tools pillar) carries a default-on rule denying tool-driven writes to `$HERMES_HOME/config.yaml` and `$HERMES_HOME/.env`. This pillar lifts that defense from "agent can't subvert the config" to "admin positively equips the platforms; nothing else can run."

### Governance affordances this adds

- **Surface area control as a primitive.** The admin/policy-setter framing in `vision.md` becomes load-bearing: the admin governs *which surfaces* the agent presents to the world, not just what tools it carries internally.
- **Per-platform credential isolation.** A leaked Slack bot token affects one agent's Slack presence, not the org's; rotation is per-grant.
- **Channel-scope matches Slack/Discord-native ACLs.** Operators already think in channel allowlists; the governance UI mirrors how they reason about access in those tools.
- **Composes cleanly with Tools pillar.** A platform grant + a tool grant are independent dimensions: an agent can be reachable on `cli + slack`, equipped with `web + terminal`, and the cross-product is unambiguous because the §1.0 taxonomy keeps platforms (#6) and toolsets (#1) on separate axes.

### What's deliberately out of scope for this pillar

- Per-channel rate limits.
- Cross-org channel sharing ("our Slack workspace's `#alerts` channel mirrored into another org's agent").
- Inbound message ACLs ("only this user can talk to this agent on Telegram") — that's IAM territory, post-governance-expansion.
- Custom platforms beyond Hermes's native 19.
- Multi-account-per-platform ("this agent has two Slack identities") — degenerate v1 case is one identity per platform per agent.

> Plan doc owning execution: TBD `docs/executing/channel-governance.md`. Depends on M5 Fleet Control's multi-platform deploy work landing first (per `governance-expansion-roadmap.md` §4 operator note).

---

## 4. Skills — registry-curated capability bundles

### What it must do (from the admin's perspective)

At spawn time, the admin equips the agent with **skills from a registry**:

- **Skill catalog.** The org sees a curated registry of skills — "Slack triage", "GitHub PR reviewer", "Customer support agent", "SQL analyst". Each skill carries: a name, a description, a versioned manifest of what it brings, and an icon/category for the UI.
- **What a skill bundles.** Each skill is a **named, versioned bundle** of:
  - Tools it expects to have access to (from the tool catalog in the Tools pillar).
  - Prompts / instructions / persona that shape the agent's behaviour for that skill's domain.
  - Context (files, documents, structured data) the skill assumes is available.
  - Required env vars / model preferences (e.g. "needs a function-calling-capable model").
- **Skill installation requires its tool grants.** Selecting "Slack triage" automatically requires the underlying Slack tool grants. The admin sees these as a checkbox cascade ("equipping this skill needs: Slack tool with `#triage`-only scope. Grant?"). No skill installs without its tool dependencies satisfied.
- **Multi-skill agents.** An agent can be equipped with multiple skills. The spawn UI is a multi-select; the resulting agent has the union of their tool requirements and a composed persona.
- **Per-skill config overrides.** Each skill exposes config knobs (e.g. "Slack triage: which queue to monitor"). The admin overrides them per-instance, the same way `AgentInstance.config_overrides` overrides `AgentTemplate.default_config` today.

Post-spawn, the agent's detail page lists the equipped skills, their versions, and their config. Skills can be added, removed, or upgraded (to a newer skill version) without redeploying the agent — the adapter re-reads the skill manifest at next start.

### What it must do (from the agent's perspective)

The harness adapter receives a per-instance `CORELLIA_SKILLS_MANIFEST_URL` (new env var to be added to `blueprint.md` §3.2). The manifest is a control-plane-generated document describing:

- The list of skills equipped, in priority order.
- Each skill's tools (already narrowed via the Tools pillar).
- Each skill's prompts/persona, composed into a single system prompt the harness can consume.
- Each skill's context references (URLs to documents the agent should fetch on boot).

The adapter is responsible for translating this into whatever the harness natively expects — typically a system prompt + tool list + initial context window. **The skills-manifest abstraction is independent of which harness ships it.** Future harnesses (LangGraph, CrewAI, custom) consume the same manifest via their own adapters.

### Governance affordances this adds

- **Skills as audit-friendly primitives.** "What can this agent do?" becomes "what skills is it equipped with?" — a much smaller and more legible answer than "here's the system prompt and 47 tool definitions, decode it yourself".
- **Skill versioning + pinning.** Skills follow the same `image_digest`-style pinning as templates per `blueprint.md` §11.2 — equipping "Slack triage v3.2" pins the digest, and upgrading is an explicit, audited admin action. No skill silently changes behaviour under an admin's nose.
- **Skill marketplace primitive (deferred but designed-for).** A versioned, manifest-described skill is exactly the shape a future skill marketplace would consume. The skill catalog table is org-scoped at landing; flipping it to "registry-of-public-skills" later is data-shaped, not architectural.
- **Skills compose, fleets reuse.** Equipping the same skill on 50 agents (one per employee) means the *same* manifest is served — version-bump-once, fleet-wide-effect (gated on per-instance restart, of course). This is what scales the "250 employees, each with a personal agent" target from `vision.md` §scale to a sane operational shape.

### What's deliberately out of scope for this pillar

- User-defined skills via UI (skills are admin-curated artefacts at landing; user-authored skills land in v2).
- Skill marketplace / public registry.
- Skill inheritance / extension ("my skill IS skill X plus these additions").
- A/B testing skills across an agent fleet.
- Skill-level metrics / analytics.

> Plan doc owning execution: TBD `docs/executing/skills.md`. Depends on the Tools pillar landing first (skill bundles compose against the tool catalog).

---

## 5. Memory — provider binding and scope

### What it must do (from the admin's perspective)

At spawn time, the admin chooses **whether and how this agent has memory**:

- **Provider** — which memory backend (Elephantasm, none, future providers). Org-level admins configure which providers are available; instance-level admins pick from the configured list.
- **Scope** — three modes:
  - **None.** Stateless agent, no memory binding.
  - **Per-agent.** This agent has a private memory namespace. Nothing it remembers leaks to other agents in the org.
  - **Shared (per-group).** This agent shares a memory namespace with other agents in the same group (e.g., "all sales agents"). Defines a fleet-level cognitive surface.

Once spawned, the binding is visible in the agent's detail page: "Memory: Elephantasm / namespace `acme-org/alice-hermes-01` / per-agent". The admin can also view memory contents (read-only) if the provider exposes a read API — *not a memory editor*, just a window.

### What it must do (from the agent's perspective)

The harness sees the standard `CORELLIA_MEMORY_ENDPOINT` env var (already reserved in `blueprint.md` §3.2) plus `CORELLIA_MEMORY_NAMESPACE`. The adapter is responsible for plumbing these into Hermes — likely via the sidecar approach described in `blueprint.md` §7 Option A, since Hermes won't natively know about Elephantasm. **Corellia does not invent a memory protocol.** The provider's native API is what the agent talks to; Corellia just binds the agent to a namespace within it.

### Governance affordances this adds

- **Scope isolation as a primitive.** "Per-agent" memory means the org-admin can guarantee that an HR agent's conversations never bleed into a Sales agent's context — at config time, not at runtime, and not based on the agent's good behaviour.
- **Provider portability.** Switching memory providers (Elephantasm → some other vendor) is a per-instance config flip. Agents don't need to be redeployed to migrate.
- **Memory inspection as audit precursor.** Read-only inspection of an agent's memory is the first step toward the audit pillar deferred to post-governance-expansion; this binding makes that future work a UI exercise, not an architectural one.

### What's deliberately out of scope for this pillar

- Memory editing / surgical deletion of specific memories (provider-side concern).
- Memory provider implementations beyond one (Elephantasm or whichever we pick first).
- Cross-org memory sharing.
- Memory quotas / size limits per agent.
- Backfill of an agent's existing conversations into a newly-bound memory provider.

> Plan doc owning execution: TBD `docs/executing/memory-binding.md`. Rescheduled from v1.5 to v2 per `governance-expansion-roadmap.md` §2 — external provider integration is a larger plumbing exercise than the in-Hermes pillars (Tools / Channels / Skills) and earns its own milestone slot once those land.

---

## 6. Cross-cutting: the registry + grant pattern

All pillars converge on the same architectural pattern. Calling it out so per-pillar plans stay structurally consistent:

```
   [Registry table]  →  [Grant/binding table]  →  [AgentInstance]
   (Skill,                (AgentInstanceSkill,
    MemoryProvider,        AgentInstanceMemoryBinding,
    Tool,                  AgentInstanceToolGrant,
    Platform)              AgentInstancePlatformGrant)
```

- The **registry** is org-scoped (or, for tools/memory providers, possibly Corellia-global with org-level enable flags).
- The **grant/binding** carries per-instance scope/config/credential references.
- The **manifest** served to the adapter is a *projection* of the grants — pre-narrowed, pre-composed, ready to consume.

This is intentionally close to AWS IAM's policies-attached-to-principals model. Internalising the analogy now keeps the four subsystems mutually intelligible — and makes it possible to layer org-wide / department-wide policy on top later (the post-v2 IAM tier) without re-architecting any of the pillars.

---

## 7. What the governance pillars deliberately do NOT include

These remain deferred (per `blueprint.md` §13 and §14, unchanged by this spec):

- **Audit log dashboard.** Grant tables exist and are queryable; a UI for "who changed what when across this agent fleet" is post-governance-expansion.
- **Full observability dashboard.** Fly's native logs remain the only operator-facing telemetry surface.
- **Scheduling / cron / long-running jobs.** Agents are spawn-on-demand only.
- **Multi-tenant org isolation.** Pillars ship with the same single-org-per-user assumption (Pattern A) that 0.2.5 introduced.
- **Programmatic adapter generation.** Hand-written Hermes adapter only; auto-generation is post-governance-expansion.
- **Additional deploy targets.** Fly only.
- **Model gateway.** Direct provider calls per agent.
- **Repo linking / custom harnesses / zip upload.** Catalog entries only.
- **Agent-to-agent communication.** Each agent is an island.
- **Cross-org skill / tool / memory / platform sharing.** Registries are org-scoped.

If any of these become blocking before the governance pillars are done, they earn their own roadmap entry and re-prioritisation conversation — they don't slide into a pillar plan silently.

---

## 8. Open design questions per pillar

Listed here so per-pillar plans don't have to rediscover them. Each becomes a "decision N" in the corresponding plan doc.

**Tools:**
- What's the canonical tool runtime — MCP servers, HTTP+OpenAPI, or both? (Affects how scope translates to a manifest.)
- Are credentials always per-instance, or do we ship shared org-level credentials at landing too?
- What's the manifest TTL / fetch cadence? Push-on-change (server-sent events) or pull-with-TTL?
- Tool catalog curation — UI at landing or seeded from a YAML file in the repo?

**Channels:**
- Per-platform credential acquisition — does each platform get its own onboarding mini-flow in the wizard (Slack OAuth, Telegram bot-token paste, WhatsApp Business API setup), or does the wizard hand off to a per-platform settings sub-route?
- Negative allowlist persistence — does "never WhatsApp" live on the org curation row, on the per-instance grant row (with a `denied=true` state), or both?
- Inbound webhook ingress — which platforms need it, and how does Fly's `services` block compose with multi-platform agents?
- Multi-platform identity — does each platform get its own bot identity per agent, or does Corellia mint a single `agent-id` that platforms map to their native ids?

**Skills:**
- Are skills first-class in the schema (their own table) or just `AgentTemplate` rows of a different `kind`? Affects how registry browsing works.
- Skill versioning — semver, or pure digest pinning like adapters?
- Skill prompts: composed at the control plane (one system prompt per agent) or composed at the harness (adapter receives N prompt fragments)?
- Skill catalog seeding — we author the first 5–10 skills ourselves, or ship empty and let admins create?

**Memory:**
- Is "shared per-group" a first-pass deliverable, or do we ship "none / per-agent" only and add shared in a follow-up?
- Does Corellia store a copy of the namespace name, or just the provider's own opaque handle?
- Read-only inspection UI in the first pass, or follow-up?

---

## 9. Sequencing

Owned by `governance-expansion-roadmap.md` §2 — the canonical execution sequence is **M5 Fleet Control → M-chat → Tools → Channels → Skills → v1.6 Tools deepening → v2 Memory → v2 IAM → post-v2 third-party plugins**. This file does not duplicate or re-litigate that ordering; it just provides the capability shape each plan doc compares against.

After the in-Hermes pillars (Tools, Channels, Skills) ship, the natural successor is the **audit log + observability** roadmap — by then there's enough governance state to make "who did what to which agent" worth visualising.

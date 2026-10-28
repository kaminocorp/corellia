# Roadmap — Governance Expansion (post-M5 sequencing)

**Status:** draft, awaiting approval
**Owner:** TBD
**Supersedes:** —
**Related:**
- `docs/plans/governance-capabilities.md` — capability-level spec for each pillar (Tools / Channels / Skills / Memory)
- `docs/executing/fleet-control.md` — M5, in-flight (7 of 11 phases shipped)
- `docs/executing/hermes-chat-sidecar.md` — M-chat, queued
- `docs/executing/tools-governance.md` — v1.5 Pillar B, queued (Toolsets only on `cli`)
- `docs/executing/tools-governance.md` §1.0 — the 8-surface taxonomy this roadmap sequences against
- `docs/blueprint.md` §13 (out-of-scope-for-v1 list this roadmap incrementally retires), §14 (post-v1)

This is a **vision-level execution sequence**, not an implementation plan. Each milestone below earns its own `docs/executing/<name>.md` plan before kick-off. The point of this file is to lock the **order**, the **expanding-surface principle**, and the **per-milestone scope envelope** so each plan doc stays focused and per-phase reviews don't relitigate sequencing.

---

## 1. The expanding-surface principle

Every governance milestone after v1 adds **one more control surface** to the spawn wizard and the fleet-view per-instance editor. The wizard grows by exactly one step per milestone; the fleet-view editor grows by exactly one panel. This is the structural rhythm of v1.5 → v2:

```
v1 wizard: HARNESS → IDENTITY → MODEL → DEPLOYMENT → REVIEW           (5 steps)
+M5:                              ↳ DEPLOYMENT widens (region/size/replicas/lifecycle)
+M-chat:                          ↳ DEPLOYMENT widens (chat-enabled toggle)
+Pillar B: HARNESS → IDENTITY → MODEL → TOOLS → DEPLOYMENT → REVIEW   (6 steps, toolsets)
+Pillar C: + CHANNELS (platforms/gateways)                             (7 steps)
+Pillar D: + SKILLS                                                    (8 steps)
+v1.6:    TOOLS step grows (per-tool granularity, MCP, providers, OAuth)
+v2:      + MEMORY (per-agent / per-group / scope isolation)           (9 steps)
+v2:      + IAM / role binding                                         (10 steps)
```

Same shape on the fleet view: every milestone adds one chevron action on the agent row (`[ DEPLOY CONFIG ]`, `[ CHAT ]`, `[ TOOLS ]`, `[ SKILLS ]`, `[ CHANNELS ]`, `[ MEMORY ]`, …) opening a side-panel editor for that surface only. Editors compose; they don't conflict.

**Why one-surface-per-milestone is the discipline:** each surface has its own credential model, scope shape, lifecycle (hot vs restart-required vs respawn), and Hermes-side enforcement primitive (config tier vs plugin tier vs sidecar). Bundling two surfaces into one milestone produces UX-shape questions (which step comes first?), schema-shape questions (one grants table or two?), and propagation-tier questions (does enabling X force a restart for Y?) that each warrant their own plan. The cost of a bundled milestone always exceeds the savings.

---

## 2. Execution sequence

In-flight and queued, in landing order. Each row is a single milestone with a single `docs/executing/<name>.md` plan.

| # | Milestone | Plan doc | Surface added | Status |
|---|---|---|---|---|
| 1 | **M5 — Fleet Control** | `executing/fleet-control.md` | Deploy-config edit (region, size, replicas, lifecycle) on running agents — widens DEPLOYMENT step + adds `[ DEPLOY CONFIG ]` editor | In-flight (7/11 phases shipped) |
| 2 | **M-chat — Hermes Chat Sidecar** | `executing/hermes-chat-sidecar.md` | Per-instance HTTP `/chat` + `/health`, on-platform chat from FE; `chat_enabled` toggle in DEPLOYMENT step | Queued (waits for M5) |
| 3 | **v1.5 Pillar B — Tools Governance** | `executing/tools-governance.md` | TOOLS step (toolsets, scope inputs, per-toolset credentials); fleet-view `[ TOOLS ]` editor; org-curation page. **Scope: Toolsets (#1) on `cli` only.** | Queued (after M-chat) |
| 4 | **v1.5 Pillar C — Channel Governance** | TBD `executing/channel-governance.md` | CHANNELS step (per-instance platform grants, channel allowlists, per-platform credential capture); fleet-view `[ CHANNELS ]` editor. **Defense-in-depth piece** (`corellia_guard` denies writes to `~/.hermes/` so the agent can't self-bootstrap a platform) folds into Pillar B Phase 5 — see operator note below. **Scope: Platforms (#6).** | Plan to be drafted alongside M5's multi-platform deploy work |
| 5 | **v1.5 Pillar D — Skills** | TBD `executing/skills.md` | SKILLS step (skill grants, version pin, source = builtin / external_registry); fleet-view `[ SKILLS ]` editor. **Scope: Skills (#4).** | Plan to be drafted post-Pillar C |
| 6 | **v1.6 cluster — Tools deepening** | TBD `executing/tools-v1.6.md` (or split) | TOOLS step grows: per-tool granularity (#2), explicit provider selection (#5), MCP servers (#3), OAuth onboarding (cross-cuts #4 + #5), external skills registry (#4 extension), audit-log dashboard. Each may earn its own sub-plan. | After Pillar D |
| 7 | **v2 — Memory** | TBD `executing/memory-binding.md` | MEMORY step (provider, namespace, scope: none / per-agent / per-group); fleet-view memory-inspection panel. **Scope: Memory (#7).** | Per `governance-capabilities.md` §5 framing, deferred to v2 once external provider integration lands |
| 8 | **v2 — IAM** | TBD | Role binding, per-department / per-org policy templates, cross-org sharing | Post-Pillar D |
| 9 | **post-v2 — Third-party plugins** | TBD | Operator-installable Hermes plugins beyond `corellia_guard`. **Scope: Plugins (#8).** | Indefinite |

The 8-surface taxonomy referenced above is the one in `executing/tools-governance.md` §1.0; this roadmap is its scheduling counterpart.

---

## 3. Per-milestone scope envelope (anti-scope-creep)

For each milestone, the **one surface** it adds is the only governance surface in its plan doc. Adjacent surfaces are explicitly listed as out-of-scope with a forward-pointer to the milestone that picks them up. This is the same shape `tools-governance.md` uses (§1.0 + §1.2) and it works — it stops the "while we're in here…" expansion that bloats plans.

The discipline that follows from this:

- **Every plan doc opens with a §1.0-style taxonomy excerpt** restating which surface(s) it owns and which it explicitly defers, cross-referenced to this roadmap.
- **Schema reservations are forward-compatible.** Pillar B's `tools.scope_json` JSONB reserves `tools_allow_deny` for v1.6 per-tool granularity; Pillar C's `skills.source` enum reserves `external_registry` for v1.6. No migration cost when the deferred surface lands — just a new field-shape under the existing column.
- **Proto extensions are non-breaking.** New surfaces add new RPCs and new message fields; existing RPCs never change wire shape. The MCP-server message slot in `ToolService` is the canonical example (`tools-governance.md` Phase 2 note).
- **Plugin-tier enforcement is universal across milestones.** `corellia_guard` is one plugin with growing rule sets. Pillar B teaches it URL/command/path allowlists (toolsets); Pillar D teaches it "deny writes to `~/.hermes/`" (channel self-bootstrap defense); v1.6 teaches it per-tool name matching; v2 may teach it memory-write category filters. **One plugin, one plan-per-rule-set.** The plugin is not a per-milestone deliverable — it's a long-lived enforcement seam every milestone composes onto.

---

## 4. Operator notes carried forward from this roadmap's drafting session

Surfaced during the 2026-04-26 review pass; not yet folded into per-milestone plans. Each is a one-line breadcrumb the next-touched plan should pick up.

- **Channel self-bootstrap defense in Pillar B Phase 5.** Currently nothing blocks an agent with `terminal` or `file` toolset from editing `~/.hermes/config.yaml` to add a Telegram listener. `corellia_guard` should ship a default-on rule denying tool-driven writes to `$HERMES_HOME/config.yaml` and `$HERMES_HOME/.env`. Pillar C lifts this from defense-in-depth to positive equip — but the defense piece is cheap and belongs in Pillar B. Action: `tools-governance.md` Phase 5 deliverables list grows one bullet.
- **Pillar C depth depends on M5's multi-platform deploy work.** Multi-platform deploy isn't just a config change — it's per-platform credential acquisition (Slack OAuth, WhatsApp Business API, Telegram bot tokens), per-platform ingress (some platforms need inbound webhooks, some long-poll outbound), per-platform health probes. M5's machine-config widening is a precondition; Pillar C plans against the M5 result, not against M4's single-platform shape.
- **Channels-before-Skills sequencing (operator decision, 2026-04-26).** Channels (#6) lands as Pillar C; Skills (#4) lands as Pillar D. Reasoning: channel governance closes a structural trust gap (an ungoverned agent can in principle self-bootstrap any platform it has credentials for) that Skills does not. Skills are additive capability; channels are the *surface area* through which the agent interacts with the world — governing that surface area first matches the admin/policy-setter framing in `vision.md`. Skills compose cleanly on top of either ordering; channels do not compose cleanly on top of Skills (a skill that "talks to users" is meaningless without a channel governance model underneath). Supersedes the original Pillar C/D ordering in this doc's first draft.
- **Memory surface (#7) defers behind Skills (#4) deliberately.** The original v1.5 framing was "Memory → Tools → Skills" (preserved in early drafts of `governance-capabilities.md`); the actual landing order swapped to **Tools → Channels → Skills → … → Memory** because external memory-provider integration (Elephantasm or alternative) is a larger plumbing exercise than equipping toolsets that already exist in Hermes. `governance-capabilities.md` §5 stays as the capability spec; this roadmap supersedes it on *when* it ships (v2, not v1.5).
- **No surface earns a milestone before its predecessor's `[ … ]` editor lands in the fleet view.** The wizard step alone is insufficient — operators need post-spawn editing for governance to be load-bearing. Every milestone's Phase 7 (or equivalent final phase) ships the fleet-view editor before the milestone is "done." This is the Pillar B precedent (`tools-governance.md` Phase 7) and the rule for every subsequent pillar.

---

## 5. What this roadmap deliberately does NOT specify

- **Per-milestone phase counts or timelines.** Each plan doc owns its own phasing. The expanding-surface principle (§1) constrains *what* each milestone adds; the plan doc constrains *how* it gets built.
- **UI styling beyond "one wizard step + one fleet-view editor per surface."** Design-system.md owns the visual language; this roadmap owns the structural rhythm.
- **Versioning cadence.** `tools-governance.md` §5 #12 is the canonical "one minor per phase" precedent; subsequent plans inherit unless they argue otherwise.
- **What lands in v1.6 vs v2 vs post-v2 in fine detail.** §2 carves the rough buckets; the plan doc that lifts a deferred surface into "in scope" is where its in-scope/out-of-scope cut gets drawn precisely.
- **Cross-pillar bundles.** No milestone bundles two surfaces. If demand pressure ever argues for it, the bundle proposal earns its own roadmap revision before any plan doc reflects it.

---

End of roadmap.

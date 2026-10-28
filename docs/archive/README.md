# Archive

> **Historical. Superseded by [`../VISION.md`](../VISION.md).**
> These documents describe Corellia as a vendor-agnostic control plane for AI agents (spawn, deploy, govern, observe agent fleets). That direction is no longer pursued. Nothing here is load-bearing for the current direction. Content is preserved unchanged so history and intent are not lost; links and path references inside archived files are as originally written and may be stale.

## What is here

| Path | Contents |
|---|---|
| `vision.md` | The old control-plane vision. |
| `blueprint.md` | Old product architecture, data model and architecture rules (§11). Still the reference for the legacy code in `backend/`. |
| `blueprints/` | Deployment architecture (Fly) and adapter image blueprint (Hermes adapter). |
| `plans/` | Governance expansion roadmap, capability spec, tools and skills vision, Hermes tools governance overview, K8s notes. |
| `completions/` | Phase-by-phase completion notes (spawn redesign, tools governance). |
| `executing/` | Implementation plans and the 2026-04-27 code assessment. |
| `refs/` | Fly commands, governable agent surfaces, Hermes tool-name audit, infra outline, multi-agent deployment frameworks, presentation beat sheet. |
| top-level `*.md` files | Earlier archive: fleet-control and hermes-chat-sidecar phases, UI mods, presentation polish, a spawn-failure issue. |

## Old path to new path (moved 2026-10-28)

Code comments and some docs still cite the old locations. Use this map.

| Old | New |
|---|---|
| `docs/vision.md` | `docs/archive/vision.md` |
| `docs/blueprint.md` | `docs/archive/blueprint.md` |
| `docs/blueprints/deployment-architecture.md` | `docs/archive/blueprints/deployment-architecture.md` |
| `docs/blueprints/adapter-image-blueprint.md` | `docs/archive/blueprints/adapter-image-blueprint.md` |
| `docs/plans/*` | `docs/archive/plans/*` |
| `docs/completions/*` | `docs/archive/completions/*` |
| `docs/executing/*` | `docs/archive/executing/*` |
| `docs/refs/{fly-commands,governable-agent-surfaces,hermes-tool-name-audit,infra-outline,multiagent-deployment-frameworks,presentation-beat-sheet}.md` | `docs/archive/refs/<same name>` |

Some archived files were already in `docs/archive/` before this move. Plans and phase notes cited at older `docs/executing/` paths (for example `docs/executing/fleet-control.md`, `docs/executing/hermes-chat-sidecar.md`) are in the top-level archive as `fleet-control.md`, `hermes-chat-sidecar.md`, and so on. Anything else that is missing is in git history.

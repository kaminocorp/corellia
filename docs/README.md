# Corellia docs

Corellia is a personal agent workspace. Start with [`VISION.md`](VISION.md), then the plan in [`executing/roadmap.md`](executing/roadmap.md).

## Current

| Doc | What it is |
|---|---|
| [`VISION.md`](VISION.md) | Product direction, architecture sketch, dynamic UI approach, open decisions. Source of truth for intent. |
| [`executing/roadmap.md`](executing/roadmap.md) | The ten-phase implementation plan, the defaults taken for VISION section 11, and the progress table. |
| [`completions/`](completions/) | One note per completed phase: what was built, decisions, files, how to run and test, known gaps. |
| [`executing/spikes/`](executing/spikes/) | Runtime spike reports (`cmd/runtime-spike`). |
| [`stack.md`](stack.md) | The implementation stack, codegen, environment, HTTP API, deploy. |
| [`changelog.md`](changelog.md) | Moving record of changes, latest on top. Add an entry for every change. |
| [`../box/README.md`](../box/README.md) | Display-box provisioning and the first-run tests. |
| [`blueprints/toolchain-overview.md`](blueprints/toolchain-overview.md) | One-liner reference for the toolchain in use. |
| [`blueprints/codegen-cheatsheet.md`](blueprints/codegen-cheatsheet.md) | Contract codegen: where types come from. |
| [`blueprints/login-swarm-animation.md`](blueprints/login-swarm-animation.md) | WebGL particle swarm technique (the v1 login animation; the morph scheduler is unused today). |
| [`refs/elephantasm-animation.md`](refs/elephantasm-animation.md) | Volumetric nebula technique the 3D agent is built on. |
| [`refs/design-system.md`](refs/design-system.md) | Visual language of the v1 frontend. Reference only; the display tokens live in `client/src/index.css`. |
| `assets/` | Logo and static assets. |

## Archived

Everything about the old direction (a vendor-agnostic control plane for agent fleets) lives in [`archive/`](archive/README.md). It is historical and superseded by `VISION.md`.

## Conventions

- Live code beats any doc.
- Changelog entries follow the existing format in `changelog.md` (index line, then a dated section).
- Docs use plain, concise prose. No filler.

# Corellia docs

Corellia is now a personal agent workspace. Start with [`VISION.md`](VISION.md).

## Current

| Doc | What it is |
|---|---|
| [`VISION.md`](VISION.md) | Product direction, architecture sketch, dynamic UI approach, open decisions. Source of truth. |
| [`stack.md`](stack.md) | v1 implementation stack. Still describes the code in the tree. Picks are defaults under the new direction. |
| [`changelog.md`](changelog.md) | Moving record of changes, latest on top. Add an entry for every change. |
| [`blueprints/toolchain-overview.md`](blueprints/toolchain-overview.md) | One-liner reference for the toolchain in use. |
| [`blueprints/codegen-cheatsheet.md`](blueprints/codegen-cheatsheet.md) | Proto and sqlc codegen: where types come from. |
| [`blueprints/login-swarm-animation.md`](blueprints/login-swarm-animation.md) | WebGL particle swarm technique. Possible base for the 3D agent. |
| [`refs/elephantasm-animation.md`](refs/elephantasm-animation.md) | Volumetric nebula technique from a sister product. Same relevance. |
| [`refs/design-system.md`](refs/design-system.md) | Visual language of the v1 frontend. Reference only. |
| `assets/` | Logo and static assets. |

## Archived

Everything about the old direction (a vendor-agnostic control plane for agent fleets) lives in [`archive/`](archive/README.md): the old vision and blueprint, plans, per-phase completion notes, deployment and adapter blueprints, and Fly, Hermes governance and presentation references. It is historical and superseded by `VISION.md`.

## Conventions

- Live code beats any doc.
- Changelog entries follow the existing format in `changelog.md` (index line, then a dated section).
- Docs use plain, concise prose. No filler.

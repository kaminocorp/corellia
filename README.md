<div align="center">
  <img src="docs/assets/logo.png" alt="Corellia" width="320" />

  <h1>Corellia</h1>

  <p><b>A personal agent workspace.</b><br/>
  An always-on screen with a 3D agent you talk to by voice or keyboard, and answers built from live UI components.</p>

  <p>
    <a href="docs/VISION.md">Vision</a> ·
    <a href="docs/README.md">Docs</a> ·
    <a href="docs/stack.md">Stack</a> ·
    <a href="docs/archive/README.md">Archive</a> ·
    <a href="docs/changelog.md">Changelog</a>
  </p>
</div>

<!--
  DEMO VIDEO
  Run `pnpm install && pnpm frontend:dev` then `pnpm capture:video`.
  Drag docs/assets/login-animation.mp4 into any GitHub issue/PR comment box
  to get a CDN URL, then replace VIDEO_URL below and uncomment the block.

<div align="center">
  <video src="VIDEO_URL" autoplay loop muted playsinline width="900" />
</div>
-->

---

> **Direction change (2026-10-28).** Corellia is being repurposed from a vendor-neutral agent control plane into a personal agent workspace: a 24/7 screen in the office with a 3D agent, voice and keyboard input, and generated UI. See [`docs/VISION.md`](docs/VISION.md). The sections below describe the **v1 control-plane implementation still in this repo** (spawn, fleet, chat, Fly deploy). It is legacy, and its docs are in [`docs/archive/`](docs/archive/README.md).

---

## What it does

Click **New Agent**. Pick **Hermes**. Name it, choose a model, set a region. Hit deploy.

Thirty seconds later you have a live AI agent — isolated in its own Fly.io microVM, secrets-scoped, health-checked, and fully managed by Corellia. Click the agent's name and start chatting with it directly from the UI.

That's the v1 golden path. Here's what's behind it:

- **Spawn wizard** — "RPG character creation" for agents: harness → name → provider / model → deployment config → deploy. Streams Fly logs in real time as the machine boots.
- **Fleet view** — gallery and list, live status, per-agent actions (start, stop, destroy), bulk ops with a dry-run preview.
- **Fleet inspector** — click any agent, edit its deployment config (region, size, replicas), see every detail.
- **Chat** — for chat-enabled agents, an embedded terminal-style chat panel proxies turns to the running Hermes sidecar over a per-tab bearer-authenticated session.
- **Digest pinning** — every agent instance is bit-identical to its template; upgrades are explicit, audited actions. No mutable tags, ever.

---

## Why Corellia

Organizations want to deploy AI agents at scale — a 250-person company might want *thousands* of agents, each with different skills, tools, data access, and responsibilities. Today that looks like stitching together five point tools:

| Slice | Point tool |
|-------|-----------|
| Orchestration | LangGraph, CrewAI |
| Deployment | LangGraph Platform |
| Tool permissions | Arcade.dev, Composio |
| Provider routing | Portkey, LiteLLM |
| Observability | Langfuse, Helicone |

**Corellia's bet:** the unified, vendor-neutral control plane *is* the product. Deployment is a commodity — governance, fleet management, and access control across *heterogeneous* agents is the unsolved problem.

> Think of it as **IAM for a fleet of agents**, not for a fleet of users.

---

## The "Garage" model

Agents are, at the end of the day, **harnesses wrapped around models**. Corellia treats them like vehicles in a garage — you pick one and drive.

- **Curated library** — pre-integrated harnesses ready to spawn. v1: the [Hermes Agent](https://github.com/NousResearch/hermes-agent) from Nous Research, with a Corellia sidecar baked in.
- **Bring your own** *(post-v1)* — import a custom agent or point Corellia at a public GitHub repo.

This works because of a **harness interface contract** — a spec for how Corellia talks to *any* agent, regardless of framework. Conceptually: LSP, but for agents. Define the spec once; every new framework becomes a one-time integration.

---

## Core pillars

1. **Agent lifecycle** — spawn, deploy, update, decommission
2. **Skills library** — reusable capabilities agents can be equipped with *(post-v1)*
3. **Context management** — files, documents, structured context *(post-v1)*
4. **Memory** — via third-party providers (Elephantasm, etc.) *(post-v1)*
5. **Permissions & access control** — IAM-style governance over tools, DBs, APIs *(post-v1)*
6. **Auditing & observability** — centralized visibility into what every agent is doing *(post-v1)*

---

## Who it's for

The **admin / policy-setter**, not the agent operator:

- Founders and co-owners
- Heads of department
- Solopreneurs running agents for themselves

Admins don't control agent behavior in real time. They define the **guardrails** within which agents operate autonomously — mirroring how AWS IAM or Okta work: the admin defines what is *possible*; the principal decides what *happens*.

---

## Status

**v1 MVP shipped.** The full end-to-end — spawn, deploy, chat, fleet management — works in production.

| Area | State |
|------|-------|
| Spawn wizard (harness → name → model → deploy config → deploy) | ✅ Live |
| Fleet view (gallery + list, status, start / stop / destroy) | ✅ Live |
| Fleet inspector (per-agent config editing, deployment detail) | ✅ Live |
| Bulk fleet ops (multi-select, bulk apply with dry-run preview) | ✅ Live |
| Chat panel (embedded terminal-style chat via Hermes sidecar) | ✅ Live |
| Hermes adapter image (GHCR, multi-arch, digest-pinned) | ✅ Live |
| `FlyDeployTarget` — full spawn / stop / destroy / health lifecycle | ✅ Live |
| Auth (Supabase ES256 / JWKS, fully offline JWT validation) | ✅ Live |
| Connect-go RPCs (agents, fleet, chat, health) | ✅ Live |
| Backend deploy (Fly.io, `corellia-api`) | ✅ Live |
| Frontend deploy (Vercel) | ✅ Live |
| Additional harnesses | 🔜 v2 |
| Skills registry, tool permissions, IAM | 🔜 v2 |
| Additional deploy targets (AWS, SkyPilot, local) | 🔜 v2 |
| Programmatic adapter generation | 🔜 v2 |
| Model gateway (LiteLLM) | 🔜 v2 |

See [`docs/changelog.md`](docs/changelog.md) for the full trail.

---

## Stack

| Layer | Pick |
|-------|------|
| Frontend | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind + shadcn/ui |
| API contract | Protobuf + Connect-go (Go server, ES client) |
| Backend | Go 1.26 + Chi router |
| ORM / queries | sqlc (typed Go from SQL) |
| Migrations | goose |
| Auth | Supabase Auth (ES256 JWT, offline validation via cached JWKS) |
| Database | Supabase Postgres (Direct Connection; `pgxpool` in-process — never transaction pooling) |
| Frontend deploy | Vercel |
| Backend deploy | Fly.io (we dogfood the infra we're orchestrating) |
| Local orchestration | overmind + `Procfile` |
| Env loading | `godotenv/autoload` + `direnv` |

---

## Repo layout

```
corellia/
├── backend/              Go service (Chi + Connect + pgx + sqlc)
│   ├── cmd/api/          HTTP entrypoint
│   ├── internal/
│   │   ├── agents/       domain: spawn, stop, list, chat
│   │   ├── adapters/     HarnessAdapter resolution + digest pinning
│   │   ├── deploy/       DeployTarget interface + FlyDeployTarget
│   │   ├── auth/         Supabase JWT middleware
│   │   ├── config/       env loading (the ONLY place os.Getenv is allowed)
│   │   ├── db/           sqlc-generated queries (never hand-edit)
│   │   ├── gen/          buf-generated Connect server (never hand-edit)
│   │   └── httpsrv/      Chi setup, Connect handler mounts (<30 lines each)
│   ├── queries/          sqlc input — raw SQL per domain
│   └── migrations/       goose-managed SQL
│
├── frontend/             Next.js 15 App Router
│   └── src/
│       ├── app/          routes, layouts, pages
│       ├── components/   UI (shadcn + custom)
│       ├── lib/          supabase + connect clients
│       └── gen/          buf-generated TS client (never hand-edit)
│
├── adapters/             hand-written harness adapter images
│   └── hermes/           CORELLIA_* → Hermes-native env-var shim + chat sidecar
│
├── shared/proto/         Proto IDL — the ONLY FE↔BE contract surface
├── docs/                 VISION.md (current), stack, changelog, archive/ (old direction)
├── Procfile              `overmind start` boots FE + BE together
└── go.work               Go workspace
```

---

## Getting started

### Prerequisites

```bash
# runtimes

> **Direction change (2026-10-28) and implementation in progress.** Corellia is now a personal agent workspace: an always-on office screen with a 3D agent, keyboard and voice input, and UI the agent assembles from a closed component catalog. The plan is [`docs/executing/roadmap.md`](docs/executing/roadmap.md); progress is recorded in `docs/completions/` and `docs/changelog.md`. The control-plane code described below was removed in Phase 1 (git history keeps it; docs in [`docs/archive/`](docs/archive/README.md)). This README is rewritten in Phase 10.
node 20+                                           # via volta or nvm
pnpm 9+                                            # corepack enable
go 1.22+

# dev tools
go install github.com/air-verse/air@latest          # backend hot reload
go install github.com/pressly/goose/v3/cmd/goose@latest
brew install overmind bufbuild/buf/buf direnv
```

Add this once to `~/.zshrc`, then open a new shell:

```bash
eval "$(direnv hook zsh)"
```

### First-time setup

```bash
git clone <this repo> && cd corellia

# 1. Install deps
pnpm install
go work sync

# 2. Configure env — copy the template into per-app files
cp .env.example backend/.env                        # fill in DATABASE_URL, SUPABASE_*, FLY_SPAWN_TOKEN, etc.
cp .env.example frontend/.env.local                 # fill in NEXT_PUBLIC_* vars

# 3. Trust direnv in both app dirs (one-time)
direnv allow backend
direnv allow frontend

# 4. Generate code (committed in-repo, so this is a freshness check)
pnpm proto:generate

# 5. Apply migrations (DATABASE_URL_DIRECT is exported by direnv on `cd backend`)
cd backend && goose -dir migrations postgres "$DATABASE_URL_DIRECT" up
```

### Run it

```bash
# From repo root — boots FE (:3000) + BE (:8080) with hot reload
overmind start

# — or, individually —
pnpm -C frontend dev            # Next.js on :3000
cd backend && air               # Go API on :8080
```

Sign in at `http://localhost:3000/sign-in`. First login flows through the onboarding wizard (display name + org), then lands on the dashboard. From there:

- **`/spawn`** — the agent roster and catalog. Click "New Agent" to start the spawn wizard.
- **`/fleet`** — your live agents. Toggle between gallery and list. Click any agent name for its detail page (and chat panel, if chat-enabled).
- **`/settings`** — org and account settings.

### Everyday commands

```bash
# After editing a .proto file
pnpm proto:generate

# After editing a .sql file in backend/queries/
cd backend && sqlc generate

# New migration
cd backend && goose -dir migrations create <name> sql

# Checks
cd backend && go vet ./... && go test ./...
pnpm -C frontend type-check && pnpm -C frontend lint
```

---

## Architecture rules

These are **blocking** — breaking them is treated as a defect:

1. No Fly-specific code outside `internal/deploy/FlyDeployTarget`.
2. AgentTemplates pin by Docker image **digest**, never by mutable tag.
3. Harness config flows through `CORELLIA_*` env vars — adapters translate to harness-native names.
4. Deferred features are stubbed as real `NotImplemented` interface impls, not dead UI buttons.
5. No forking upstream harnesses — capabilities come via adapter wrappers or sidecars.
6. No Supabase specifics outside `internal/auth/` and `internal/db/`.
7. Generated code (`internal/gen/`, `internal/db/`) is never hand-edited — treat like `node_modules`.
8. All env vars read through `internal/config/` — panic at startup on missing required vars.
9. Connect handlers are <30 lines: parse → call domain → marshal.
10. Frontend uses Supabase *only* for auth — app data flows through Connect RPCs.

Full rationale in [`docs/archive/blueprint.md §11`](docs/archive/blueprint.md) and [`docs/stack.md §11`](docs/stack.md).

---

## Roadmap

**v1 (shipped)** — one harness (Hermes), one deploy target (Fly.io), full spawn + fleet + chat flow.

**v1.5** — repo linking with build pipeline, basic audit log, sidecar logging to a memory provider, per-agent cost visibility. Skills, Memory, and Tool Permissions promoted from v2 to this tier.

**v2** — programmatic adapter generation + validation suite, second deploy target (bare-metal / SkyPilot / AWS), LiteLLM model gateway, full IAM-style tool permission system.

**v3** — local / edge / on-prem via NixOS flakes, custom harness end-to-end (repo → adapter → deploy), full observability pipeline, organizational policy layer (per-department / per-role / org-wide).

---

## The strategic framing

> **Deployment is a commodity; governance is the product.**

Every cloud solves deployment. Management, governance, access control, and fleet visibility across *heterogeneous* agents is the unsolved problem — and that's where engineering effort compounds.

Two tests applied to any decision:

1. **Is it reversible?** If yes (good abstraction shields the rest), pick the easiest option. If no, invest in making it reversible first.
2. **Does it differentiate?** Yes — harness contract, fleet view, IAM, audit — invest deeply. No — VM provider, container runtime — minimum viable attention.

---

## License

See [`LICENSE`](LICENSE).

# Corellia — Deployment Architecture (v1)

The mental-model companion to `blueprint.md` and `stack.md`. Where those docs
describe *what* gets built, this one describes *where each piece lives, what
talks to what, and what's actually running at any given moment*.

If you've shipped backend code before but haven't worked deeply with
container registries, image-based microVMs, or "API as the deploy mechanism"
infrastructure, this is the doc that connects the named-but-abstract pieces
(GHCR, Firecracker, Fly Machines API, OCI image) into a single picture.

---

## 1. The whole thing in one sentence

> Corellia is a stateless Go process running on one Fly machine that calls
> Fly's HTTPS API to boot *more* Fly machines, each running a pre-built OCI
> image we previously pushed to GitHub's container registry.

That's the whole architecture. The rest of this doc unpacks each noun.

---

## 2. The three places where bytes live

```
┌────────────────────────────┐   ┌──────────────────────────────┐   ┌────────────────────────────┐
│      YOUR MAC (dev)        │   │   GHCR (ghcr.io, public)     │   │       FLY.IO CLOUD         │
│                            │   │                              │   │                            │
│  • Source code             │   │  • Adapter OCI images        │   │  • Control-plane VM        │
│  • Dockerfile +            │   │     ghcr.io/<owner>/         │   │     (corellia-api)         │
│    entrypoint.sh           │   │     corellia-hermes-adapter  │   │                            │
│  • Docker Desktop          │   │     @sha256:<digest>         │   │  • Agent VMs (1 per spawn) │
│    (build tool only)       │   │                              │   │     (corellia-agent-<id>)  │
│                            │   │  • Public, immutable,        │   │                            │
│  Build → push to GHCR.     │   │    content-addressed         │   │  Each VM = Firecracker     │
│  After push: Mac is        │   │    by sha256.                │   │  microVM running an OCI    │
│  no longer involved.       │   │                              │   │  image pulled from GHCR.   │
└────────────────────────────┘   └──────────────────────────────┘   └────────────────────────────┘

   build-time only                    storage tier                        runtime tier
   (developer laptop)                 (CDN-fronted blob store)            (Fly's substrate)
```

**Three things to internalize from this picture:**

1. **Your Mac is build-time only.** Docker Desktop is a developer tool that
   produces an image and uploads it to GHCR. Nothing on your Mac is part of
   the production runtime. Turning your laptop off doesn't affect deployed
   agents.
2. **GHCR is a content-addressed blob store.** Once we push
   `ghcr.io/<owner>/corellia-hermes-adapter@sha256:<digest>`, that exact byte
   sequence is immutable forever — the digest *is* the address. This is the
   foundation of `blueprint.md` §11.2's "pin by digest" rule: a digest can't
   silently re-point at different bytes the way a tag (`:latest`) can.
3. **Fly is where everything actually runs.** Both the Corellia control plane
   and every agent it spawns. The control plane and the agents are siblings
   architecturally — both are Fly machines, both pull their image from a
   registry, both are managed via Fly's API. The control plane just happens
   to be the one issuing the API calls instead of receiving them.

---

## 3. Two timelines: build-time vs. runtime

The single most useful frame for understanding "where is Docker?" is to
separate **build-time** (one-shot, developer-driven) from **runtime**
(continuous, no human in the loop).

### Build-time (we do this once per adapter version)

```
  YOUR MAC                                     GHCR
  ────────                                     ─────

  $ docker buildx build \
      --platform linux/amd64,linux/arm64 \
      --tag ghcr.io/<owner>/...:v2026-04-25 \
      --push \
      adapters/hermes
                          │
                          │  HTTPS push
                          ▼
                                          ┌─────────────────────────┐
                                          │  manifest list +        │
                                          │  layer blobs            │
                                          │                         │
                                          │  digest:                │
                                          │  sha256:abc123...       │
                                          └─────────────────────────┘

  $ crane digest <image>      ← capture the digest
  $ goose ... up              ← write the digest into the database
```

After the push:
- **The image is permanently retrievable** at its `@sha256:abc123...` address.
- **The Mac's role is over.** No further laptop interaction is needed for
  the image to be pullable from anywhere on the internet.
- **The digest is recorded** in `harness_adapters.adapter_image_ref` — that's
  the database row that ties Corellia's data model to a specific real-world
  artefact.

### Runtime (this happens every time a user clicks "Deploy")

```
  USER'S BROWSER          CORELLIA CONTROL PLANE                 FLY API                FLY SUBSTRATE
  ──────────────          ──────────────────────                 ───────                ──────────────

  click "Deploy"
       │
       │  HTTPS RPC
       ▼
                          AgentsService.SpawnAgent(...)
                                     │
                                     ▼
                          FlyDeployTarget.spawn(instance):
                          1. POST /apps  ─────────────────────►  create app
                                                                  corellia-agent-<uuid>
                          2. POST /apps/.../secrets  ──────────►  set secrets
                                                                  CORELLIA_MODEL_API_KEY=...
                          3. POST /apps/.../machines  ─────────►  create machine ─────►  ┌──────────────────────┐
                                                                  spec: image =          │  Firecracker microVM │
                                                                    ghcr.io/.../         │  ─────────────────── │
                                                                    @sha256:abc123       │                      │
                                                                                         │  pull image from     │
                                                                                         │  GHCR ─────────────► │ ───┐
                                                                                         │                      │   │
                                                                                         │  unpack layers       │   │ HTTPS pull
                                                                                         │  exec entrypoint.sh  │   │ from GHCR
                                                                                         │                      │   │
                                                                                         │  Hermes process =    │   │
                                                                                         │  PID 1 inside VM     │   │
                                                                                         └──────────────────────┘   │
                                                                                                  ▲                 │
                                                                                                  │                 │
                                                                                                  └─── agent runs ──┘
                                     ▼
                          FlyDeployTarget.health(instance):
                          GET /apps/.../machines/<id>  ───────►  return state: started
                                     │
                                     ▼
                          mark instance.status = "running"
                                     │
                                     ▼
       ◄──── RPC response ───────────┘
   redirect to /fleet
```

**Three things to internalize from this picture:**

1. **The control plane never invokes Docker.** It speaks HTTPS to Fly's API.
   Steps 1–3 above are all `POST` requests carrying JSON bodies. There is
   no `docker run` anywhere. There is no Docker daemon on the control plane
   VM at runtime.
2. **Fly's substrate (`flyd`) is what pulls the image from GHCR.** Not
   Corellia, not your Mac. The control plane just *names* the image (by
   digest, in the machine spec); Fly's infrastructure does the actual pull
   and unpack into a microVM root filesystem.
3. **The agent's VM has no Docker daemon either.** It's a Firecracker
   microVM whose root filesystem *is* the image's unpacked layers. The
   `entrypoint.sh` from the image runs as the VM's primary process. From
   inside the VM, there's no `docker` command, no `/var/run/docker.sock`,
   nothing.

---

## 4. What "Docker" means at each layer (the most common confusion)

The word "Docker" is overloaded. Here's what it actually means at each
layer of this architecture:

| Layer | What "Docker" refers to | Is a Docker daemon running here? |
|---|---|---|
| Your Mac (build-time) | Docker Desktop — a build tool that produces OCI images | Yes, briefly, while you're building |
| GHCR | Nothing — GHCR speaks the OCI Distribution protocol; "Docker" is just the most common producer/consumer | N/A — it's a blob store, not a runtime |
| Corellia control plane VM (runtime) | Nothing — it's a Go binary speaking HTTPS to Fly's API | No |
| Agent VM (runtime) | The OCI *image format* — but no daemon. Firecracker boots the image's filesystem as a microVM | No |

**The takeaway:** Docker is the developer-tooling and image-format layer.
Once the image exists at GHCR, "Docker" is no longer in the picture.
Production runtime is OCI images + Firecracker + Fly's API. Saying "Corellia
runs on Docker" would be wrong; saying "Corellia uses OCI images that Fly
boots as Firecracker microVMs" is right.

This is closer to AWS ECS Fargate or Cloud Run than to "Docker Compose on a
VPS." The image is the unit of deployment; the runtime is hypervisor-grade
microVM isolation.

---

## 5. The control plane is a coordinator, not a host

This is the architectural property that makes "spawn 100 agents in parallel"
trivial. Walk through it:

```
                       CORELLIA CONTROL PLANE
                       ┌───────────────────────────────────────────┐
                       │                                           │
                       │   Go binary (one process)                 │
                       │                                           │
                       │   ┌─────────┐                             │
                       │   │ HTTP    │ ◄── browser RPCs ──         │
                       │   │ server  │                             │
                       │   └────┬────┘                             │
                       │        │                                  │
                       │        ▼                                  │
                       │   ┌─────────────┐                         │
                       │   │ goroutines  │  ── one per spawn ──┐   │
                       │   └─────────────┘                     │   │
                       │                                       │   │
                       │   ┌─────────────────────────────────┐ │   │
                       │   │ Fly API client (HTTPS)          │◄┘   │
                       │   └────┬────────────────────────────┘     │
                       └────────┼──────────────────────────────────┘
                                │
                                ▼
                          Fly's HTTPS API
                                │
       ┌────────────────────────┼─────────────────────────────────────┐
       │                        │                                     │
       ▼                        ▼                                     ▼
  agent VM #1             agent VM #2          ...              agent VM #N
  (Firecracker)           (Firecracker)                         (Firecracker)
```

**Why this is fast at scale:**

- Each spawn is one goroutine making three HTTPS calls. Goroutines are
  ~2KB each; 100 in parallel is trivial Go.
- The control plane *owns nothing* about each agent's runtime — no
  filesystem, no process tree, no memory, no CPU. Once the API call
  returns "machine created," the control plane forgets about that
  machine until the next status check.
- Adding a 101st agent costs the control plane the same as adding the
  first. No host-level resource contention.

This is the **stateless coordinator** pattern. Compare to a hypothetical
alternative where the control plane runs `docker run` against a shared
local daemon: that approach caps at one host's memory, produces noisy-
neighbour problems, and serializes spawns through the daemon's API. The
coordinator pattern doesn't have those properties.

---

## 6. What we deploy vs. what we *spawn*

These are two different things and the words matter:

| Action | Frequency | Mechanism | What lands on Fly |
|---|---|---|---|
| **Deploy Corellia itself** | Once per backend release (manual, by us) | `fly deploy` from `backend/` | The `corellia-api` app + machine, running the Go binary |
| **Spawn an agent** | Once per user click on "Deploy" | RPC → control plane → Fly API | A new `corellia-agent-<uuid>` app + machine, running the Hermes adapter |

The Corellia binary itself is built from `backend/Dockerfile` (multi-stage
Go build) and *its* image is also pushed to a registry — Fly's, in this
case, because `fly deploy` handles registry choice transparently for the
app it's deploying. That image is unrelated to the GHCR-hosted Hermes
adapter image. **Two image-build pipelines, two registries, two purposes:**

```
  CONTROL PLANE PIPELINE                    AGENT IMAGE PIPELINE
  ──────────────────────                    ────────────────────

  backend/Dockerfile                        adapters/hermes/Dockerfile
        │                                          │
        │  fly deploy                              │  docker buildx build --push
        ▼                                          ▼
  registry.fly.io/corellia-api              ghcr.io/<owner>/corellia-hermes-adapter
        │                                          │
        ▼                                          ▼
  one VM running the                        N VMs each running Hermes
  Go HTTP server                            (one per spawned agent)
```

The two pipelines run on different cadences:

- **Control plane redeploys** when we ship Go code changes. Frequent during
  development; rare in production.
- **Agent image rebuilds** when the upstream Hermes digest changes (Nous
  ships a new release) or when our adapter's `entrypoint.sh` changes.
  Rare; the digest pin makes "rebuild without changing anything" impossible.

---

## 7. The end-to-end picture, all in one frame

```
                     ┌──────────────────────────────────────────────────────────────────┐
                     │                                                                  │
   developer ──┐     │   YOUR MAC                                                       │
               │     │   ────────                                                       │
   git push    │     │   • source code                                                  │
   docker push │     │   • adapter Dockerfile + entrypoint                              │
               │     │   • backend Dockerfile                                           │
               │     └──────┬─────────────────────────────────────┬─────────────────────┘
               │            │                                     │
               │            │ docker buildx --push                │ fly deploy
               │            ▼                                     ▼
               │     ┌─────────────────────────┐         ┌─────────────────────────┐
               │     │ GHCR                    │         │ registry.fly.io         │
               │     │ corellia-hermes-adapter │         │ corellia-api            │
               │     │ @sha256:<digest>        │         │ <internal>              │
               │     └─────────┬───────────────┘         └─────────┬───────────────┘
               │               │                                   │
               │               │   image pull (HTTPS)              │   image pull (HTTPS)
               │               │                                   │
   end user ───┴──┐            │                                   │
                  │            │                              ┌────▼─────────────────────┐
   browser RPC    │            │                              │ FLY: corellia-api VM     │
                  ▼            │                              │ ───────────────────────  │
                               │                              │ Go binary; speaks HTTPS  │
                               │                              │ to Fly's Machines API.   │
                               │                              │                          │
                               │              POST /machines  │ Stateless coordinator;   │
                               │              ◄─────────────  │ owns no agent runtime.   │
                               │                              └──────────────────────────┘
                               │                                   │
                               │     spawn N machines              │ POST per spawn
                               ▼                                   ▼
                       ┌───────────────────────────────────────────────────────────────┐
                       │ FLY: agent VMs (one per spawned agent, Firecracker microVMs)  │
                       │                                                               │
                       │   corellia-agent-<uuid-1>     corellia-agent-<uuid-2>   ...   │
                       │   ───────────────────────     ───────────────────────         │
                       │   image: ghcr.io/.../...      image: ghcr.io/.../...          │
                       │           @sha256:<digest>            @sha256:<digest>        │
                       │   PID 1: entrypoint.sh        PID 1: entrypoint.sh            │
                       │          → exec hermes               → exec hermes            │
                       │   secrets: per-agent          secrets: per-agent              │
                       │   (model API key, etc.)      (model API key, etc.)            │
                       └───────────────────────────────────────────────────────────────┘
```

---

## 8. Where the v1.5 "per-user Fly credentials" fits

The whole picture above assumes one Fly account: the `crimson-sun-technologies`
org you operate. Both the control plane VM and every spawned agent VM land in
that org. v1's `FLY_API_TOKEN` env var is a single global credential.

**v1.5 changes one thing**, and only one thing, in the runtime picture: the
control plane resolves the Fly API token from a *per-user* credential row
(decrypted at request time) instead of a single config value:

```
                                          ┌──────────────────────────────┐
                                          │ Postgres                     │
                                          │ ──────────────────────────── │
                                          │ user_deploy_credentials      │
                                          │   user_id │ encrypted_token  │
                                          │   alice   │ <ciphertext>     │
                                          │   bob     │ <ciphertext>     │
                                          └─────────────┬────────────────┘
                                                        │
                                                        │ decrypt at request time
                                                        ▼
                          FlyDeployTarget.spawn(ctx, instance):
                          token := credentials.Get(ctx, userID, "fly")  ◄── new in v1.5
                          1. POST /apps  ───── using alice's token ───► alice's Fly org
                                                                        ─────────────────
                                                                        agent VM lands
                                                                        in alice's infra
```

Three properties of v1's design that make this v1.5 retrofit cheap:

1. **`§11.1 — no Fly outside `FlyDeployTarget`** — only one file knows
   anything about Fly. The credential change touches exactly that file's
   client construction.
2. **The OCI image is identity-free.** The same
   `ghcr.io/.../corellia-hermes-adapter@sha256:<digest>` runs in any Fly
   org; we don't need a per-user image. The digest in the database stays a
   single column for everyone.
3. **The control plane doesn't change shape.** Same goroutines, same API
   calls, same coordinator pattern — just sourcing the auth header from a
   different place per request.

This is the architectural payoff of building the abstraction now and the
multi-tenancy later: the boundary already exists, and v1.5's work is mostly
*new* surface (a Settings UI, a credential table, encryption-at-rest), not
refactoring of *existing* surface.

---

## 9. Glossary

Terms used above, with one-line definitions, in alphabetical order:

- **Control plane.** The Go binary running on Fly that orchestrates
  spawns. The "Corellia" the user sees in their browser. One process.
- **Fly machine.** A single Firecracker microVM managed by Fly's
  Machines API. The unit of deployment.
- **Firecracker.** AWS-developed lightweight hypervisor. Fly uses it to
  run microVMs with hypervisor-grade isolation but VM-fast boot times.
- **GHCR (GitHub Container Registry).** GitHub's OCI image hosting
  service at `ghcr.io`. Where our adapter image lives.
- **OCI image.** The standardized container image format. "Docker
  image" is colloquial; the actual format is OCI (Open Container
  Initiative). Tools that produce/consume OCI images include Docker,
  Podman, buildah, etc.
- **Image digest.** The `sha256:<hash>` content-addressed identifier
  for an OCI image. Immutable; the digest *is* the address.
- **Manifest list.** An OCI manifest that points at multiple
  per-architecture image variants (`linux/amd64`, `linux/arm64`). The
  "manifest list digest" is what we pin in the database — a multi-arch
  pointer.
- **Spawn (verb).** What Corellia does when a user clicks "Deploy."
  Creates one Fly app + one Fly machine running the adapter image.

---

## 10. Reading-order suggestion

If you read this doc and parts still don't click:

1. **Re-read §2 + §3.** The two-timelines split (build vs. runtime) is the
   single most important frame. Most "where does X live?" questions
   resolve to "this layer is build-time only" or "this layer is runtime
   only."
2. **Then read `blueprint.md` §8** ("Fly deployment topology"). It says
   "one AgentInstance = one Fly app = one Fly machine" with the rationale.
   This doc shows you the *picture* of that rule; blueprint.md shows you
   the *why*.
3. **Then read `stack.md` §10** ("Deploy"). That's the operational
   commands list: how *we*, the developers, drive the build-time pipelines.
4. **Optionally**, when you're ready to look at code:
   `backend/internal/deploy/` (lands in M3 Phase 5) is where the runtime
   coordinator pattern is implemented. Reading it after this doc should be
   one-pass — every concept it touches will already have a name.

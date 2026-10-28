# Corellia — Adapter Image Blueprint (v1)

The mental-model companion for the **HarnessAdapter** concept. Where
`blueprint.md` §3–§5 + §11 specify the *rules*, and `stack.md` documents the
*tools*, this doc connects the dots: what an adapter image actually *is*,
what each line in the Hermes adapter does and *why*, how the four-contract
harness interface manifests as bytes on disk and rows in Postgres, and how
v1 (hand-written) is structurally identical to v2 (LLM-generated) — same
table, same `source` enum, same digest-pinning, different author.

If you've read `blueprint.md` §3 and felt the harness contract is abstract,
this is the doc that grounds it in `adapters/hermes/Dockerfile`,
`adapters/hermes/entrypoint.sh`, and the `harness_adapters` row Hermes
seeds.

Companion docs:
- `docs/blueprint.md` §3 (harness interface contract), §4 (adapter
  strategy), §5 (versioning / digest-pinning), §11.2–§11.5 (adapter
  blocking rules)
- `docs/blueprints/deployment-architecture.md` (how adapter images move
  from a developer laptop → GHCR → Fly machine)
- `docs/blueprints/toolchain-overview.md` (what `crane`, `buildx`, and
  `goose` are doing in the bump pipeline)
- `adapters/hermes/README.md` (the v1 example — convention every future
  adapter follows)

When the rules in `blueprint.md` §11 conflict with anything in this doc,
they win. This doc is descriptive of the model and prescriptive of the
*shape* future adapters take; the rules are the unconditional invariants.

---

## 1. The whole thing in one sentence

> A HarnessAdapter is a thin Docker image layered on an upstream harness,
> whose only job is to translate Corellia's standardized contracts into
> whatever the upstream natively expects — without ever forking the
> upstream.

That's the model. The rest of this doc unpacks each noun.

---

## 2. Why the adapter exists

Corellia is **agent-agnostic, model-agnostic, provider-agnostic** by design
(`vision.md`). That neutrality is a marketing claim until something in the
codebase makes it true. The adapter is that something.

Without an adapter:

- Each upstream harness uses different env-var names
  (`OPENROUTER_API_KEY` vs. `ANTHROPIC_API_KEY`; `HERMES_INFERENCE_PROVIDER`
  vs. some other framework's native).
- Each upstream has different boot semantics (CLI vs. HTTP server,
  PID-1 conventions, signal handling).
- Each upstream evolves on its own release cadence.

If Corellia's domain code hardcoded any one harness's quirks, every new
harness would be N×M custom integration work and the "vendor-neutral"
premise would collapse on harness #2.

The adapter pushes all per-harness translation into one tiny shim layer per
harness. Everything outside that shim sees only the four
[harness sub-contracts](#3-the-four-sub-contracts) — uniform across every
harness.

This is structurally analogous to the Language Server Protocol (LSP):
define the spec once, every new harness becomes one-time integration work
rather than touching the rest of the codebase.

---

## 3. The four sub-contracts

The adapter is where these four sub-contracts become real on top of an
upstream image. (Source: `blueprint.md` §3.)

| Sub-contract | What the adapter delivers |
|---|---|
| **Runtime**       | HTTP server on a known port, `GET /health`, `POST /chat`, eventually `POST /tools/invoke` |
| **Configuration** | Standardized `CORELLIA_*` env vars: `CORELLIA_AGENT_ID`, `CORELLIA_MODEL_PROVIDER`, `CORELLIA_MODEL_API_KEY`, `CORELLIA_MODEL_NAME`, plus `CORELLIA_TOOL_MANIFEST_URL` and `CORELLIA_MEMORY_ENDPOINT` post-v1 |
| **Packaging**     | OCI image distributable via a registry, declared by digest, with a known entrypoint, declared exposed ports, and declared minimum resource footprint (CPU, RAM) |
| **Metadata**      | A `corellia.yaml` manifest embedded in the image (or repo) declaring name, version, required env, default model, supported tools (post-v1), resource requirements, adapter version |

> *v1.5 Pillar B refines the **Configuration** sub-contract's runtime
> presence.* The adapter no longer only translates `CORELLIA_*` env vars
> at boot — it also fetches `CORELLIA_TOOL_MANIFEST_URL`, renders a live
> scope-state file, and registers a Corellia-authored Python plugin
> inside Hermes that consults the scope state on every tool call. The
> plugin loads via Hermes's own documented user-plugin discovery path
> (`$HERMES_HOME/plugins/<name>/`) — no upstream fork. See [§4.4](#44-what-v15-pillar-b-adds-the-in-process-plugin-corellia_guard).

Upstream Hermes satisfies *none* of these on its own:

- Native env names: `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`,
  `HERMES_INFERENCE_PROVIDER` (not the `CORELLIA_*` shape).
- CLI-shaped upstream: no `/health`, no `/chat` HTTP endpoints in Hermes 0.x
  itself. The adapter's M-chat sidecar (`sidecar/sidecar.py`) fills this gap
  for chat-enabled instances (changelog 0.11.x).
- No `corellia.yaml` upstream.
- No declared resource floor.

The adapter fills these gaps. Configuration is fully bridged in v1 (the
entrypoint script). Runtime is bridged for chat-enabled instances via the
M-chat sidecar (POST /chat, GET /health — deferred for chat-disabled instances
until a non-chat runtime contract is defined). Metadata (`corellia.yaml`) is
deferred to v1.5 — see [§12 Known limitations](#12-known-limitations-on-the-v1-hermes-adapter).
Packaging is bridged (we publish to GHCR with a captured digest).

---

## 4. The three artifacts that make a v1 adapter

`adapters/hermes/` is the canonical example. Three files, ~150 lines total,
and that's the entire abstraction. (v1.5 Pillar B's tool-governance work
adds a fourth artefact — the in-process plugin described in [§4.4](#44-what-v15-pillar-b-adds-the-in-process-plugin-corellia_guard) —
without changing this section's account of v1's three files.)

```
adapters/hermes/
├── Dockerfile          # 30 lines — FROM <pinned upstream>, COPY entrypoint, ENTRYPOINT
├── entrypoint.sh       # 110 lines — CORELLIA_* → native, then exec upstream
├── README.md           # convention doc (canonical example future adapters follow)
├── smoke.sh            # boots on a real Fly machine, polls state, destroys
└── .dockerignore
```

Pattern for future adapters: `adapters/<name>/` with the same shape. When
v2's generated-adapter pipeline ships, generated adapters won't write into
this directory — they'll be built directly from harness source to the
registry — but the **schema row shape and the four-contract surface area
are identical**. See [§9 v1 hand-written vs. v2 generated](#9-v1-hand-written-vs-v2-generated).

### 4.1 The Dockerfile

```dockerfile
FROM docker.io/nousresearch/hermes-agent@sha256:d4ee57f254aa…   # digest, never a tag

USER root
COPY --chmod=0755 entrypoint.sh /corellia/entrypoint.sh
USER hermes

ENTRYPOINT ["/corellia/entrypoint.sh"]
```

Three structural choices:

1. **`FROM @sha256:<digest>`, never `FROM …:latest` or `FROM …:v0.x.y`.**
   Tags are mutable. Digests are not. This is `blueprint.md` §11.2 enforced
   one layer above the database (the database also enforces it via a
   `CHECK (upstream_image_digest LIKE 'sha256:%')` constraint —
   defense-in-depth).
2. **`USER root` → `COPY` → `USER hermes`.** Upstream's image declares
   `USER hermes` (UID 10000); we briefly elevate to drop the entrypoint
   script under `/corellia/`, then drop back. We can't write into
   `$HERMES_HOME` at build time because that path is a `VOLUME` declaration
   in upstream — anything written there at build time is shadowed by the
   runtime volume mount. `/corellia/` is outside the volume, so it
   survives.
3. **`ENTRYPOINT` overrides upstream.** The wrapper takes over PID 1, does
   its translation work, then `exec`s the upstream entrypoint — see
   [§4.3 the exec discipline](#43-why-exec-is-load-bearing).

### 4.2 The entrypoint script

POSIX shell, deliberately. Zero runtime dependencies, no compile step, no
language version skew. The script has exactly one job and reaches for
nothing larger than `case` and `export`.

The translation table for Hermes 0.x:

| `CORELLIA_*` env | Hermes-native | Notes |
|---|---|---|
| `CORELLIA_AGENT_ID`       | `AGENT_ID` (passthrough) | No native consumer in Hermes 0.x; retained for log filtering and subprocess hooks |
| `CORELLIA_MODEL_PROVIDER` | `HERMES_INFERENCE_PROVIDER` | Documented Hermes runtime override for `model.provider` in `config.yaml` |
| `CORELLIA_MODEL_API_KEY`  | provider-conditional rename to one of `OPENROUTER_API_KEY` / `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GOOGLE_API_KEY` / `NOUS_API_KEY` | Hermes uses provider-specific names rather than a single generic credential |
| `CORELLIA_MODEL_NAME`     | *(no native env-var hook in Hermes 0.x)* | The deprecated `LLM_MODEL` was removed; selection lives in `config.yaml` or `--model`. v1.5 follow-up: write a `config.yaml` fragment from the entrypoint |

Two design rules expressed by the script:

- **Unknown providers exit 64 (`EX_USAGE`) loudly.** Not "fall through to a
  default." Fail-loud-on-misconfiguration is the same posture
  `config.Load()` takes (panic on missing required env at boot) and
  `lib/supabase/client.ts` adopted in 0.3.1 (throw with a contextful
  message). The cost of a five-minute deploy that crashes immediately ≪
  the cost of a "running" agent that silently uses the wrong credentials.
- **Adapter is the *only* place in the codebase that knows Hermes-native
  env names.** This is `blueprint.md` §11.3 made concrete: Corellia code
  outside the adapter never types the string `OPENROUTER_API_KEY` or
  `HERMES_INFERENCE_PROVIDER`. Every translation lives in this one shell
  script.

### 4.3 Why `exec` is load-bearing

The last line of `entrypoint.sh`:

```sh
exec /opt/hermes/docker/entrypoint.sh "$@"
```

`exec` (not a subshell, not a function call) is structurally important.
Without it:

- The wrapper shell stays as **PID 1**.
- Upstream Hermes becomes **PID 2**, parented by the wrapper.
- Fly's `SIGTERM` on graceful-shutdown hits **PID 1** (the shell), not
  Hermes.
- The shell ignores the signal (default behavior); Hermes never gets a
  chance to drain in-flight work.
- The grace-period timer expires; Fly sends `SIGKILL`; in-flight work is
  lost.

With `exec`:

- The shell **replaces itself** in the kernel process table with the
  upstream entrypoint.
- Upstream Hermes inherits **PID 1**.
- `SIGTERM` reaches Hermes directly; graceful drain works.

This subtlety is invisible during local `docker run` testing and only
manifests as data loss under production rolling deploys. The comment block
in `entrypoint.sh` documents it explicitly so a future "let me add
post-exec cleanup" refactor doesn't silently regress it.

### 4.4 What v1.5 Pillar B adds: the in-process plugin (`corellia_guard`)

§4.1–§4.3 describe the v1 adapter: a translation shim that runs *once* at
boot and is gone the moment `exec` hands off to upstream. v1.5 Pillar B
(per-tool scope governance) needs more — a Corellia presence that **stays
alive for the agent's whole life**, enforces per-tool scopes Hermes's
config schema cannot express, and re-reads policy when the operator
changes a grant hours after spawn.

That presence is shipped as a **plugin loaded by Hermes via Hermes's own
documented plugin-discovery path** (`hermes_cli/plugins.py`'s "user
plugins" source: `$HERMES_HOME/plugins/<name>/`). It is *not* a separate
process, *not* a sidecar container, *not* an upstream fork. It is a
Python module that registers a `pre_tool_call` hook and lives inside
Hermes's address space for the agent's whole life — visible to Hermes
through a first-class extension point the upstream team published for
exactly this kind of layered policy.

#### How `adapters/hermes/` grows

```
adapters/hermes/
├── Dockerfile              # +1 COPY line for the plugin source
├── entrypoint.sh           # grows: fetch manifest, render scope.json,
│                           # cp plugin into $HERMES_HOME/plugins/,
│                           # add corellia_guard to plugins.enabled
├── smoke.sh
├── README.md
├── .dockerignore
└── plugin/                 # NEW
    └── corellia_guard/
        ├── plugin.yaml      # Hermes plugin manifest (name, version, hooks)
        ├── __init__.py      # register(ctx) + pre_tool_call hook
        ├── scope.py         # scope-state file reader + matcher logic
        └── tests/           # pytest unit tests, run in CI alongside Go tests
```

The new directory is a sibling of the Dockerfile that ships it — same
review surface, same release cadence, same digest-pinning. **The plugin
is not a separate distribution channel.** Source baked into the adapter
image at build time; copied into Hermes's view of the filesystem at
boot. Versioning is the adapter's versioning; no parallel pin.

#### What stays on the running Fly machine

```
$HERMES_HOME/                        # writable volume layer
├── config.yaml                      # rendered by entrypoint
│                                    #   platform_toolsets: [...]
│                                    #   mcp_servers: { ... }
│                                    #   plugins.enabled: [corellia_guard]
│                                    #   skills.disabled: [...]
├── .env                             # rendered by entrypoint (provider keys)
├── plugins/
│   └── corellia_guard/              # cp -r from /opt/corellia/...
│       ├── plugin.yaml
│       └── __init__.py + scope.py
├── corellia/
│   └── scope.json                   # live channel from control plane
└── skills/                          # (Pillar C; out of v1.5 Tools scope)
```

Three things live on the VM for the agent instance's whole life:

1. **The plugin's source on disk** at
   `$HERMES_HOME/plugins/corellia_guard/`. Sits on the writable
   filesystem layer; never re-fetched, never expires.
2. **The plugin's code loaded into Hermes's process memory.** Hermes's
   plugin-discovery walks `$HERMES_HOME/plugins/` at startup, calls
   `register(ctx)` once, registers the `pre_tool_call` hook in Hermes's
   hook registry. From that point on, **every tool call** the agent
   makes flows through the plugin's matcher before reaching the tool.
3. **The scope-state file** at `$HERMES_HOME/corellia/scope.json` —
   the live channel between control plane and plugin. Written by the
   entrypoint at boot from the manifest; refreshed by a daemon thread
   the plugin spawns inside `register(ctx)` that polls
   `CORELLIA_TOOL_MANIFEST_URL` on a TTL. The plugin re-reads it on
   each tool call (cheap — single mtime stat, parse only on change).

#### Why a plugin and not just config

Hermes's `config.yaml` can express coarse-grained gating ("this agent
has the `web` toolset enabled") but not the fine-grained scopes
Corellia's vision needs. Specifically, four scopes Hermes's schema
does not natively express:

- URL pattern allowlist on the `web` toolset
- Command-pattern allowlist on the `terminal` toolset
- Path allowlist on the `file` toolset
- Per-channel allowlist on Slack / Discord / Telegram gateway toolsets

For each, the `pre_tool_call` hook receives the structured tool name +
arguments Hermes already passes to its plugin contract, matches
against the granted scope read from `scope.json`, and returns
allow / reject. `pre_tool_call` is a stable, documented lifecycle
hook (`hermes_cli/plugins.py:60–82`) intended for exactly this kind
of out-of-tree policy layering. **No upstream fork.** This is
`blueprint.md` §11.5 ("capabilities added via adapter wrappers, never
by modifying upstream") cashed out at runtime instead of at boot.

#### Why this preserves the digest-pinning invariant

The plugin's version is bound to the adapter image's version. New
scope shape, bug fix, matcher refactor: cut a new adapter image,
capture the new manifest-list digest, run the bump pipeline (§5.3),
update `harness_adapters.adapter_image_ref`. Existing AgentInstances
continue running the prior plugin until rolled forward — same
governance primitive as the upstream digest pin. **The plugin has no
separate pinning surface.** Mechanically, it is source code shipped
inside the adapter image, the same way `entrypoint.sh` is.

This preserves the "one HarnessAdapter row per harness, identified
by two digests" model from §5–§6. The adapter is still the single
shim layer; v1.5 just grows the shim to include a runtime resident,
not only a boot-time translator.

#### What the plugin deliberately does *not* do

Three boundaries, stated up front so future work doesn't drift:

- **Does not talk to the model.** No prompt rewriting, no
  system-message manipulation, no tool-result munging. Hermes's LLM
  dispatch is unmodified.
- **Does not intercept network traffic.** No outbound HTTP proxy, no
  TLS termination, no DNS routing. Enforcement happens at Hermes's
  *structured* tool-dispatch boundary, where tool name + arguments
  are visible. Egress from arbitrary `code_execution` Python is the
  one case the plugin can't see; if v1.6+ ever needs to gate that,
  the answer is a narrow sidecar HTTP proxy as a separate Fly
  container — not a fatter plugin.
- **Does not modify Hermes itself.** The upstream image is
  byte-untouched at the pinned digest. The plugin lives in
  `$HERMES_HOME/plugins/`, which is *outside* the upstream image's
  filesystem — it materialises on the writable volume at boot and is
  pure additive.

#### Cross-harness portability

When a future adapter ships at, say, `adapters/claude-sdk/`, the same
shape applies: `Dockerfile` + `entrypoint.sh` + `plugin/` directory,
where the plugin's *contract* with that harness is whatever runtime
extension point that harness publishes (system-prompt fragments,
tool registrations, middleware hooks). The Corellia-authored
manifest the plugin consumes is **harness-neutral**; the per-harness
translation — including the runtime-extension layer — lives in the
adapter. The four sub-contracts hold; only the bytes the adapter
writes change. v2's generated-adapter pipeline (§9) must understand
the runtime-extension surface for whichever harness it's targeting,
exactly the same way it must understand the env-var-translation
surface today.

Source-grounded feasibility study and the per-mechanism citations
into Hermes's source: `docs/plans/v1.5-tools-governance-technical-overview.md`.

---

## 5. The pinning model

Two digests, one coherent rule, one row in Postgres.

```
harness_adapters row (one per harness — Hermes is the v1 seed)
├── upstream_image_digest = "sha256:d4ee57…"
│   └── docker.io/nousresearch/hermes-agent@sha256:d4ee57…   ← what `FROM` quotes
└── adapter_image_ref     = "ghcr.io/<owner>/corellia-hermes-adapter@sha256:<built>"
    └── what every AgentInstance for this template runs
```

Both digests are **manifest-list digests** (not single-arch). `crane digest
docker.io/nousresearch/hermes-agent:<tag>` returns the manifest-list
digest by default — the right granularity for an orchestrator that may
eventually run on machines with different architectures (Fly has both
amd64 and arm64). A single-arch digest would pin to one architecture and
break silently on the other.

### 5.1 Direction: DB → Dockerfile

The database is the single source of truth for the upstream digest. The
Dockerfile **quotes** it. (Reading the Dockerfile is reading a literal that
was sourced from the migration.)

This directionality is what makes the seeded `harness_adapters` row
reliable enough that M3's `UpdateImageRef` and M4's `spawn` can build on
it: the adapter image and the seed row cannot drift, because they ship in
the same PR or fail review.

The schema constraint `CHECK (upstream_image_digest LIKE 'sha256:%')`
encodes `blueprint.md` §11.2 at the database layer — defense-in-depth
past the Go-level convention. Any future seed script, ad-hoc migration,
or operator-with-`psql` who tries to write a tag-pinned reference is
rejected at INSERT time, not at code review.

### 5.2 Why `adapter_image_ref` is `TEXT NULL` in M2 (and why it tightens in M3)

M2 created the schema and seeded the Hermes row before any adapter image
existed — there was nothing to point `adapter_image_ref` at. Two ways to
land that:

- **Empty string.** Passes the schema constraint's spirit
  ("`LIKE 'sha256:%'`" is on `upstream_image_digest`, not
  `adapter_image_ref`) but violates §11.2 in practice — an empty string
  is a placeholder masquerading as a real ref.
- **`NULL`.** Honest: "no built adapter exists yet."

Choosing `NULL` is the smaller harm. Combined with M2's read query that
deliberately doesn't project this column ("narrow projection, not
`SELECT *`"), no caller sees the nullable-ness as a runtime concern.

M3 backfills via the staged migration `20260426120000_adapter_image_ref_backfill.sql`
and tightens the column to `NOT NULL` in the same migration. This is the
canonical "land the column nullable, then tighten" pattern — the same
shape any well-run schema migration follows.

### 5.3 The bump pipeline

When Nous Research publishes a new Hermes release:

1. Capture the new manifest-list digest:
   `crane digest docker.io/nousresearch/hermes-agent:<new-tag>`.
2. Verify multi-arch coverage: `docker manifest inspect <digest>` lists
   `linux/amd64` + `linux/arm64`.
3. Write a goose migration that updates **both** `upstream_image_digest`
   **and** `adapter_image_ref` in the same `UPDATE` (a single coordinated
   atomic change — see `blueprint.md` §5).
4. Update the `FROM` line in `adapters/hermes/Dockerfile` to match.
5. Rebuild the adapter (multi-arch via `buildx`), capture the new
   adapter-image manifest-list digest, paste into the migration's UPDATE
   in the same PR.
6. Apply the migration, push the image, redeploy the control plane.
7. **Existing AgentInstances continue running the *old* digest** until
   rolled forward explicitly per `blueprint.md` §5.

That last step is the governance primitive: immutable artifacts +
explicit upgrades + an audit trail of *which release* was running *when*.
Every existing agent stays bit-identical to what it was when spawned;
upgrades are an operator-driven, audited event.

A `corellia adapter bump <harness> <new-digest>` operator CLI is the
next-write of `adapters.Service.UpdateImageRef` (introduced in M3
Phase 5); a separate plan covers it post-v1.

---

## 6. The data model

```
HarnessAdapter (one row per harness — only Hermes in v1)
├── id                       UUID
├── harness_name             "hermes"                              UNIQUE
├── upstream_image_digest    "sha256:d4ee57…"                      CHECK LIKE 'sha256:%'
├── adapter_image_ref        "ghcr.io/.../corellia-hermes-adapter@sha256:…"
│                                                                   NULL in M2,
│                                                                   NOT NULL in M3
├── manifest_yaml            corellia.yaml content (post-v1, NULL on hand-written rows)
├── source                   "hand_written" | "generated"          CHECK enum
├── generated_at             nullable
├── validated_at             nullable
├── validation_report        nullable JSONB
├── created_at, updated_at
└── (no manifest_yaml / validation_report consumers in v1 — landed
    by v2's analyzer alongside their first reader)

AgentTemplate (zero, one, or many per HarnessAdapter)
├── harness_adapter_id       FK → HarnessAdapter.id
├── default_config           JSONB
├── created_by_user_id       NULL = system seed; non-NULL = post-v1 user-defined
└── …

AgentInstance (one per spawn, bound to template)
├── agent_template_id        FK → AgentTemplate.id (transitively pinned to a digest)
└── …
```

Three observations:

- **`source` enum has two legal values** — `hand_written` and `generated`
  — encoded as `CHECK (source IN ('hand_written', 'generated'))`. No
  `CREATE TYPE` ceremony, no separate down-block step, no migration
  ordering for type drops. v2's generated-adapter pipeline lands without
  a schema change.
- **`manifest_yaml` and `validation_report` columns exist in v1 schema
  but stay NULL on v1's hand-written Hermes row.** This is `blueprint.md`
  §11.4 ("deferred features stub as real interfaces, not fake buttons")
  applied at the data-model layer: the columns are the interface; the
  v2 analyzer is the fill-it-in implementation. No schema migration is
  needed when v2 ships.
- **The transitivity of digest-pinning** is what makes the governance
  story end-to-end coherent: HarnessAdapter pins by digest →
  AgentTemplate pins to a HarnessAdapter → AgentInstance pins to an
  AgentTemplate. By induction, every running agent traces back to one
  specific upstream digest *plus* one specific adapter digest. That pair
  is what a future audit query joins on.

---

## 7. Where the adapter image runs

The adapter image is an OCI image. Like every OCI image, where it runs is
orthogonal to what it is. In Corellia v1:

```
registry (storage)              orchestrator (runtime)
─────────────────               ──────────────────────
ghcr.io/<owner>/                Fly.io control plane
  corellia-hermes-adapter         calls Fly Machines API
  @sha256:<digest>                to boot one Firecracker
                                  microVM per AgentInstance,
                                  each pulling this image.
```

(See `docs/blueprints/deployment-architecture.md` for the GHCR ↔ Fly
picture in detail.)

What's important for the adapter mental model:

- **The same image runs every AgentInstance from the same template**, by
  digest. Bit-identical. This is what makes "all instances of a template
  are bit-identical" (`blueprint.md` §5) literally true rather than
  approximately true.
- **Per-instance variation comes from environment variables, not image
  variants.** Each Fly app gets its own `CORELLIA_AGENT_ID`,
  `CORELLIA_MODEL_PROVIDER`, `CORELLIA_MODEL_API_KEY`,
  `CORELLIA_MODEL_NAME` injected as Fly app secrets. The adapter image is
  shared; the secrets are isolated per agent.
- **Adapter behavior is defined entirely by `entrypoint.sh` reading those
  env vars at boot.** No runtime config server, no per-instance overlay
  files, no template substitution at deploy time. The adapter is
  stateless code; the AgentInstance is the env-var configuration applied
  to that code.

This is what makes one-app-per-agent (`blueprint.md` §8) cheap: the only
thing varying per agent is a small bag of env vars, all already
managed by Fly's per-app secret store.

---

## 8. The smoke test loop

`adapters/hermes/smoke.sh` boots the registry-published adapter image on
a real Fly machine, polls `state == started`, dumps the tail of logs, and
destroys the app on EXIT (trap-guarded — runs even if `set -e` aborts
mid-script).

```sh
export FLY_ORG_SLUG=<your-org-slug>
export CORELLIA_SMOKE_API_KEY=sk-or-v1-<key>   # OpenRouter free-tier is fine
./adapters/hermes/smoke.sh
```

What the smoke does:

- Creates a Fly app with a name derived from the current timestamp.
- Sets `CORELLIA_*` secrets on it (mimicking what the M4 spawn flow will
  do programmatically).
- `fly machines run` with the published adapter digest.
- Polls `fly machines list --json` for `state == started`.
- Tails recent logs (bounded to 15s via `gtimeout` or a backgrounded-and-
  killed fallback) for an operator eyeball-check.
- `fly apps destroy` on EXIT regardless of success or failure.

What it probes (post-M-chat Phase 7):

- **Machine state poll** — `fly machines list --json` for `state == started`.
- **`GET /health`** — unauthenticated; asserts `{"ok":true}` (up to 60s
  retries for Hermes boot after the sidecar is up).
- **`POST /chat`** with per-smoke bearer token — asserts `{"content":...}`.

The smoke is the first end-to-end exercise of *the adapter image as it
will actually run in production*: same digest, same registry pull path,
same Firecracker microVM, same env-var injection mechanism. It's the
closest thing to integration testing the adapter has in v1, and the
shape future adapters' smokes will follow.

---

## 9. v1 hand-written vs. v2 generated

The data model treats both as first-class via the `source` enum. The
difference is *who wrote the adapter*, not *what shape it takes*:

| | **v1 — hand-written** | **v2 — generated** |
|---|---|---|
| **Author** | Human, in `adapters/<name>/` | LLM pipeline, output to registry directly |
| **Input**  | Upstream README + `.env.example` + `config.yaml.example`, read by a human | Harness source (repo + commit SHA), parsed structurally |
| **Translation logic** | POSIX shell `entrypoint.sh` | Generated `entrypoint.sh` (or equivalent) |
| **`corellia.yaml`** | Hand-written (or omitted in v1) | Extracted by Opus from structural map |
| **Validation** | Manual smoke test + operator eyeball | Sandbox boot + endpoint probing + env-var consumption verification |
| **`harness_adapters.source`** | `'hand_written'` | `'generated'` |
| **`validation_report`** | NULL | JSONB capturing what the validator probed and confirmed |
| **Cache key** | n/a (one row per harness, in-tree code) | `{source_ref}` — clone, parse, generate, cache by source SHA |
| **Regeneration trigger** | Operator opens a PR | Source-ref change |

The v2 pipeline (`blueprint.md` §4):

1. Input: harness source (repo + commit SHA) or image reference.
2. Cache lookup on `{source_ref}`. Hit → return.
3. Miss → clone, parse with tree-sitter, feed structural map + README +
   Dockerfile to Opus, extract `corellia.yaml`, build adapter image.
4. **Validate**: spin up harness in sandbox, probe claimed endpoints,
   verify env-var consumption.
5. Cache adapter image + manifest, keyed by source ref.
6. Regenerate on source-ref change.

What stays identical between v1 and v2:

- The four sub-contracts.
- The `harness_adapters` row shape.
- The digest-pinning rule and `CHECK` constraint.
- The bump pipeline (manual or automated, the migration shape is the
  same).
- The runtime: same Fly Machine, same Firecracker microVM, same env-var
  injection path.

This means v2 ships **without retracting any v1 commitments** — generated
adapters slot into the same row, run on the same substrate, bind to the
same templates and instances. The only new thing is the column-fills
that hand-written rows leave NULL.

---

## 10. The full lifecycle of one adapter

```
                       Author (human or LLM)
                                │
                                ▼
                    adapters/<name>/Dockerfile
                    adapters/<name>/entrypoint.sh
                                │
                                │  docker buildx build --push
                                ▼
        ┌──────────────────────────────────────────┐
        │  GHCR: ghcr.io/<owner>/corellia-<name>-  │
        │        adapter@sha256:<adapter-digest>   │
        └──────────────────────────────────────────┘
                                │
                                │  goose migration UPDATE
                                ▼
        ┌──────────────────────────────────────────┐
        │  Postgres: harness_adapters row          │
        │    upstream_image_digest = sha256:...    │
        │    adapter_image_ref     = ghcr.io/...   │
        │    source                = 'hand_written'│
        └──────────────────────────────────────────┘
                                │
                                │  AgentTemplate FK harness_adapter_id
                                ▼
        ┌──────────────────────────────────────────┐
        │  AgentTemplate row (catalog entry)       │
        └──────────────────────────────────────────┘
                                │
                                │  Spawn flow: AgentInstance row created,
                                │  FlyDeployTarget.spawn(instance) called
                                ▼
        ┌──────────────────────────────────────────┐
        │  Fly app: corellia-agent-<uuid>          │
        │    one Firecracker microVM               │
        │    pulls adapter_image_ref from GHCR     │
        │    boots /corellia/entrypoint.sh         │
        │    which exec's upstream Hermes          │
        └──────────────────────────────────────────┘
                                │
                                │  Per-instance env vars set as
                                │  Fly app secrets:
                                │    CORELLIA_AGENT_ID
                                │    CORELLIA_MODEL_PROVIDER
                                │    CORELLIA_MODEL_API_KEY
                                │    CORELLIA_MODEL_NAME
                                ▼
                       running agent
```

Every box on this diagram is content-addressed (digest-pinned) or row-keyed
(UUID); none of it is ambient state. This is the property that makes
governance possible: any running agent is reducible to "one
`harness_adapters` row + one `agent_templates` row + one `agent_instances`
row + the env vars at spawn time," and all of those are auditable.

v1.5 Pillar B extends the *running agent* box without changing any
other box on the diagram. The same Fly machine, booted from the same
adapter digest, additionally fetches `CORELLIA_TOOL_MANIFEST_URL`,
materialises the `corellia_guard` plugin (§4.4) into
`$HERMES_HOME/plugins/`, writes the initial scope state to
`$HERMES_HOME/corellia/scope.json`, and the plugin's `register()`
spawns a daemon thread that re-fetches the manifest on TTL. The
audit identity ("one `harness_adapters` row + one template + one
instance + env vars") is unchanged — the manifest is per-instance
state served by the control plane and identified by the same instance
ID. Pillar B is purely additive on the §10 lifecycle.

---

## 11. Reversibility test (`blueprint.md` §15)

Two questions every architectural choice answers:

1. **Reversibility:** is it cheap to back out?
   **Yes** — the adapter is a Docker image. Replacing it is a migration
   plus a rebuild. No cross-component coupling outside the
   `harness_adapters` table.
2. **Differentiation:** does it make Corellia distinctly *Corellia*?
   **Yes, deeply** — the adapter contract is the harness interface, which
   is the entire vendor-neutral premise of the product.

So: minimal investment in the **adapter implementation** (POSIX shell,
~110 lines), maximal investment in the **adapter contract** (four sub-
contracts, four database columns, two image refs, `CHECK` constraints,
governance rules). The contract is permanent; any single adapter
implementation is replaceable.

If a future revision needs to swap POSIX shell for, say, a Go binary
(more expressive translation logic, structured logging at boot, embedded
`corellia.yaml` reader), nothing outside the adapter directory changes.
The migration shape, the runtime substrate, the data model, and the
domain code are all insulated.

---

## 12. Known limitations on the v1 Hermes adapter

Deliberate gaps, flagged so the next reader doesn't assume the contract
is fully implemented. (Source: `adapters/hermes/README.md`.)

1. **No HTTP runtime contract.** Hermes 0.x is CLI-shaped — no `/health`
   or `/chat` endpoints. The smoke test asserts `fly machines list
   --json` reports `state == started` plus a log-tail eyeball-check.
   M4's `Health()` polling currently has no `/health` to probe and falls
   back to machine-state checks. Closing this gap (likely a sidecar HTTP
   wrapper in front of `hermes chat`) is a v1.5 concern.
2. **`CORELLIA_MODEL_NAME` not wired.** Hermes 0.x removed the
   `LLM_MODEL` env var; model selection is `config.yaml`'s `model.default`
   or the `--model` CLI flag. v1.5 fix: the entrypoint generates a
   minimal `config.yaml` fragment from the env var before exec'ing
   upstream.
3. **No embedded `corellia.yaml`.** The Metadata sub-contract
   (`blueprint.md` §3.4) is unfilled in v1 — there is no `corellia.yaml`
   bundled into `adapters/hermes/`. The catalog page hardcodes the
   "Hermes" name and description in the seed migration and the static FE
   sneak-peek list. v1.5 follow-up: hand-write `corellia.yaml`, COPY it
   into the image, expose it via a `corellia adapter manifest` operator
   command. v2's analyzer generates it.
4. **Single base-arch dependency.** The adapter inherits whatever
   architectures upstream publishes. Per the M3 pre-work inspection,
   upstream is multi-arch (`linux/amd64` + `linux/arm64`) on the pinned
   digest, so the adapter is built multi-arch too — but if upstream
   ever drops an architecture, the adapter would silently follow.
5. **Cosign / Sigstore provenance not verified.** The pin today is "this
   digest is bit-identical to what we captured" — *not* "this digest is
   signed by Nous's published key." When upstream publishes signatures,
   add a `cosign verify` step to the bump pipeline and a
   `harness_adapters.signature_verified_at TIMESTAMPTZ NULL` column. Out
   of scope for hackathon; flagged as the canonical "real governance
   posture" follow-up.
6. **Tool / scope enforcement: implemented in v1.5 Pillar B.** The v1
   entrypoint translated only the four `CORELLIA_*` model-binding env
   vars; v1.5 Pillar B added the manifest-poll integration (`CORELLIA_TOOL_MANIFEST_URL`
   + `CORELLIA_INSTANCE_TOKEN` per `blueprint.md` §3.2), the
   `corellia_guard` Hermes plugin (URL / command / path allowlist
   enforcement on `pre_tool_call`), the org-curation page at
   `/settings/tools`, and the per-instance grant editor + restart
   button on the fleet view. Per-tool granularity (#2 in the §1.0
   taxonomy of `docs/executing/tools-governance.md`) and MCP / Skills
   governance (#3, #4) remain v1.6+ work. Implementation reference:
   completion notes `docs/completions/tools-governance-phase-{1..7}.md`.

---

## 13. Architectural rules that touch the adapter

These are the `blueprint.md` §11 rules (and `stack.md` §11 extensions)
that constrain any adapter, hand-written or generated. Defects, not
guidelines.

- **§11.2 — AgentTemplates pin by digest, never by mutable tag.** The
  Dockerfile's `FROM` line and the `harness_adapters.upstream_image_digest`
  column both honor this. Database `CHECK` constraint enforces it.
- **§11.3 — Harness configuration flows through `CORELLIA_*` env vars.**
  Adapters translate; Corellia code outside the adapter never reaches
  into a harness's native env-var names.
- **§11.4 — Deferred features are stubbed as real interface
  implementations, not fake UI.** v2's generated-adapter columns
  (`manifest_yaml`, `validation_report`) exist in v1 schema as nullable;
  v1's hand-written row leaves them NULL.
- **§11.5 — No forking of upstream harnesses.** Capabilities are added
  via adapter wrappers (this doc) or sidecars (post-v1 observability /
  memory). Upstream sources are read-only inputs.
- **§11.6 — No Supabase specifics outside `internal/auth/` + `internal/db/`.**
  Adapters never touch Supabase; the domain code that *does* touch
  `harness_adapters` (`internal/adapters/`) is a thin sqlc-typed wrapper
  that reads `db.HarnessAdapter` rows. Adapter images run on Fly without
  any awareness Supabase exists.
- **§11.9 — Connect handlers stay <30 lines.** When M3's
  `UpdateImageRef` lands, its handler parses → calls
  `adapters.Service.UpdateImageRef` → marshals. Translation lives in the
  domain package; the digest-format `CHECK` lives in Postgres; nothing
  smart lands in the handler.

---

## 14. What's authoritative

When in doubt:

- The rules in `blueprint.md` §3, §4, §5, §11.2–§11.5 are the
  unconditional invariants. They win on conflict.
- The live code in `adapters/hermes/` and `backend/internal/adapters/`
  supersedes anything in this doc that has gone stale.
- The migration files in `backend/migrations/` are the source of truth
  for the `harness_adapters` schema and the seeded Hermes digest.
- This doc is the mental-model bridge between those three. When the
  shape of the adapter model changes, update this doc; when only the
  digest changes, the migration is the only edit needed.

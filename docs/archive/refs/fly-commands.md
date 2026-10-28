# Fly CLI (`flyctl`) — Command Reference for Corellia

**Local CLI version:** `fly v0.4.37 darwin/arm64` (commit `dc77d940`, build 2026-04-20)
**Captured at:** 2026-04-26
**Sources:** `fly --help` recursion + cross-check with https://fly.io/docs/flyctl/

This reference enumerates the `flyctl` commands actually available on this
machine, organized as the local CLI groups them. Written after an M3 Phase 2
plan-vs-reality drift (where I claimed `fly machine run --rm` "doesn't exist"
when it does — see §"Plan-vs-reality corrections" below) — the doc's purpose
is to be the source of truth for "what the CLI does on this machine, today,"
so future M3+ work writes against verified empirical shape rather than
reconstructed memory or upstream docs that may have drifted.

**Authority hierarchy when this doc disagrees with something:**

1. `fly <cmd> --help` on this machine wins (the local CLI is what executes).
2. Online docs at https://fly.io/docs/flyctl/ — second, may lag the CLI by
   a release.
3. This doc — third, may lag both. Treat as a navigation aid, not a contract.

---

## 1. Top-level command map

The `fly` binary groups commands into 8 categories (matched against the local
`fly --help` output and Fly's online reference; the online reference uses a
flat alphabetical list, the CLI groups them — both enumerate the same set).

### Deploying apps & machines

| Command | One-liner |
|---|---|
| `fly apps` | Manage apps (create, destroy, list, restart, ...). |
| `fly deploy` | Deploy Fly applications from a `fly.toml` + Dockerfile or image. |
| `fly launch` | Create *and* configure a new app from source code or a Docker image (one-shot). |
| `fly machine` | Manage Fly Machines (run, list, status, exec, destroy, ...). Aliases: `machines`, `m`. |
| `fly status` | Show app status. |

### Configuration & scaling

| Command | One-liner |
|---|---|
| `fly certs` | Manage TLS certificates. |
| `fly config` | Manage an app's `fly.toml` configuration. |
| `fly image` | Manage app image (show, update). |
| `fly ips` | Manage IP addresses for apps. |
| `fly scale` | Scale app resources (count, memory, vm). |
| `fly secrets` | Manage application secrets (set, unset, list, deploy, sync, import). |
| `fly volumes` | Manage Fly Volumes. Aliases: `volume`, `vol`. |

### Monitoring & managing things

| Command | One-liner |
|---|---|
| `fly checks` | Manage health checks. |
| `fly console` | Run a console in a new or existing machine. |
| `fly dashboard` | Open browser on Fly Web UI for the current app. |
| `fly dig` | Make DNS requests against Fly.io's internal DNS server. |
| `fly incidents` | Show platform incidents. |
| `fly logs` | View app logs. |
| `fly mcp` | flyctl Model Context Protocol (MCP integration). |
| `fly ping` | Test connectivity with ICMP ping messages over WireGuard. |
| `fly proxy` | Proxy local connections to a Fly Machine (port-forward). |
| `fly releases` | List app releases. |
| `fly services` | Show the application's services. |
| `fly sftp` | Get or put files from a remote VM. |
| `fly ssh` | SSH into or run commands on Machines. |
| `fly wireguard` | Manage WireGuard peer connections. |

### Databases & extensions

| Command | One-liner | Corellia uses? |
|---|---|---|
| `fly consul` | Enable and manage Consul clusters. | No |
| `fly extensions` | Add functionality to apps. | No (v1) |
| `fly litefs-cloud` | LiteFS Cloud management. | No |
| `fly mpg` | Managed Postgres clusters. | **No** — we use Supabase Postgres, not Fly's. |
| `fly mysql` | MySQL database clusters. | No |
| `fly postgres` | Unmanaged Postgres clusters (legacy). | No |
| `fly redis` | Redis databases via Upstash. | No (v1) |
| `fly storage` | Tigris object storage buckets. | No (v1) |

### Access control

| Command | One-liner |
|---|---|
| `fly auth` | Manage authentication (login, logout, whoami, signup, docker). |
| `fly orgs` | Manage Fly organizations (create, delete, list, show, invite). |
| `fly tokens` | Manage Fly.io API tokens (create, list, revoke, attenuate, debug). |

### Help & troubleshooting

| Command | One-liner |
|---|---|
| `fly docs` | View Fly documentation in the browser. |
| `fly doctor` | Debug Fly environment (auth, networking, etc.). |
| `fly platform` | Fly platform information (regions, vm-sizes, status). |

### Additional / utility

| Command | One-liner |
|---|---|
| `fly agent` | Manage the Fly agent (background WireGuard process). |
| `fly completion` | Generate shell autocompletion scripts. |
| `fly help` | Help about any command. |
| `fly jobs` | Show jobs at Fly.io. |
| `fly settings` | Manage flyctl settings. |
| `fly synthetics` | Synthetic monitoring. |
| `fly version` | Show version information. |

### Common aliases (for grep purposes)

| Canonical | Alias(es) |
|---|---|
| `fly apps` | `fly app` |
| `fly machine` | `fly machines`, `fly m` |
| `fly volumes` | `fly volume`, `fly vol` |
| `fly machine list` | `fly machine ls` |
| `fly machine destroy` | `fly machine remove`, `fly machine rm` |
| `fly apps destroy` | `fly apps delete`, `fly apps remove`, `fly apps rm` |

---

## 2. Commands Corellia actively uses

These get the full surface treatment: subcommands, key flags, Corellia
usage notes.

### `fly apps`

```
fly apps create <name> [--org NAME] [--name NAME] [--generate-name] [--save] [-y]
fly apps destroy <name> [-y]                # aliases: delete, remove, rm
fly apps list                               # supports -j/--json
fly apps move <name> --org TARGET_ORG
fly apps open                               # opens the app's URL in browser
fly apps releases <name>
fly apps restart <name>
fly apps errors <name>                      # Sentry-integrated
```

**Corellia usage:**

- **Per-spawn agent app creation.** v1 `FlyDeployTarget.spawn()` calls
  the Machines API directly (not the CLI), but the conceptual mapping is
  `fly apps create corellia-agent-<uuid> --org crimson-sun-technologies`.
- **Per-rehearsal/smoke ephemeral apps.** Phase 2 used this exactly:
  `fly apps create corellia-rehearsal-<8-char-uuid> --org $ORG`.
- **`fly apps destroy --yes <name>`** is the full-cleanup primitive.
  Removes the app *and* all of its machines + secrets + IPs + volumes
  atomically. This is the canonical "tear it all down" command — used
  in trap-on-EXIT cleanup blocks throughout Phase 2/3/7.
- **`fly apps move`** is what you'd use for a v1.5 multi-tenant
  re-homing if a user's agent needs to move between orgs. Not used in
  v1.

### `fly machine`

The single most important command surface for Corellia. Aliases: `machines`,
`m`.

#### Subcommands

```
fly machine api-proxy   --app NAME             # WireGuard tunnel for local Machines API access
fly machine clone        ID                    # duplicate a machine
fly machine cordon       ID                    # deactivate services on machine (drain)
fly machine create       <image> --app NAME    # create but don't start
fly machine destroy      ID...                 # destroy (machines must be stopped or use --force)
fly machine exec         ID <command>          # run a command in a running machine
fly machine kill         ID                    # SIGKILL the machine
fly machine leases       ID                    # manage leases (advanced concurrency control)
fly machine list         --app NAME            # also: --json, --quiet (ids only)
fly machine place        ...                   # simulate placement (dry-run)
fly machine restart      ID...
fly machine run          <image> [command]     # primary command — see flag table below
fly machine start        ID...
fly machine status       ID                    # also: -d/--display-config (show JSON)
fly machine stop         ID...
fly machine suspend      ID...
fly machine uncordon     ID                    # reverse of cordon
fly machine update       ID                    # update image, env, ports, etc.
fly machine wait         ID --state STATE      # block until state matches; default 5m timeout
```

#### `fly machine run` flags (the most-used; full list)

The full help has 40+ flags across multiple sections. Table below covers
**every flag** present in the local CLI's help, in roughly the order
they appear:

| Flag | Description | Corellia notes |
|---|---|---|
| `-a, --app NAME` | Application name. **Required** unless a `fly.toml` is in CWD or interactive prompt is acceptable. | Always pass explicitly in scripts. Phase 2's "prompt: non interactive" failure was missing this. |
| `--autostart` | Auto-start a stopped Machine on network request (default `true`). | M4 spawn flow: leave default; idle agents wake on access. |
| `--autostop[=stop\|suspend\|off]` | Auto-stop on no traffic. Default `off`. | M4: `stop` is the right shape for "idle agents are free." |
| `--build-depot` / `--build-nixpacks` / `--dockerfile PATH` | Build image inline (alternative to passing a pre-built image). | We don't use these — image is pre-built and pushed to GHCR. |
| `--cachedrive-size MB` | Cache drive size. | Not used. |
| `--command STRING` | With `--shell`: command to run when shelling in. | Not used in v1. |
| `-c, --config PATH` | Path to `fly.toml`. | Not used (no `fly.toml` for spawned agents). |
| `--container NAME` | Multi-container apps: which container to update. | Not used in v1. |
| `--detach` | Return immediately instead of monitoring. | Phase 2 rehearsal used this; useful in scripts. |
| `--entrypoint CMD` | Override the image's `ENTRYPOINT`. | Phase 2 rehearsal used `--entrypoint /bin/sh` to bypass our wrapper. |
| `-e, --env NAME=VALUE` | Set env vars at machine creation. **Repeatable.** | Use for non-secret config. Secrets go via `fly secrets set` first. |
| `--file-literal PATH=B64VAL` | Mount a literal value as a file. | Not used. |
| `--file-local PATH=LOCAL` | Mount a local file. | Not used. |
| `--file-secret PATH=SECRET_NAME` | Mount a Fly app secret as a file. | Not used in v1; potentially v1.5+ for cert/keypair injection. |
| `--host-dedication-id ID` | Pin to dedicated hosts. | Not used. |
| `--id ID` | Use a known machine ID. | Not used. |
| `--kernel-arg ARG` | Kernel args. **Repeatable.** | Not used. |
| `--machine-config PATH` | Read machine config from JSON file or string. | Useful for v1.5 advanced config; not v1. |
| `-m, --metadata NAME=VALUE` | Metadata pairs. **Repeatable.** | Could be useful for tagging spawned agents with `corellia_user_id`, `corellia_template_id`. v1.5+. |
| `-n, --name NAME` | Machine name. Auto-generated if omitted. | Auto-gen is fine for v1; Fly assigns a `<adjective>-<noun>-<number>` style name. |
| `--org SLUG` | Org owning the *app*. | Used when implicitly creating an app; otherwise the app's existing org applies. |
| `-p, --port SPEC` | External port mapping (`port[:machinePort][/protocol[:handler...]]`). **Repeatable.** | M4: not used (Hermes was CLI-shaped, no listener). M-chat: `-p 443:8642/tcp:http:tls` for the chat sidecar; Fly's edge terminates TLS on `:443` and forwards plain HTTP to the sidecar's internal `:8642`. Chat-disabled spawns omit this flag — no port exposure, matching the M4 posture. |
| `-r, --region CODE` | Target region (see `fly platform regions`). | Phase 2 used `iad`. M4: pass user's preferred region; default to closest to their org. |
| `--restart {no,always,on-failure}` | Restart policy. Default `on-failure` for `fly deploy` / scheduled; `always` otherwise. | Phase 2 rehearsal used `no`; M4 spawn uses `always`. |
| `--rm` | **Auto-remove machine on exit. Sets `--restart=never` if not otherwise specified.** | Real flag — Phase 2's earlier "doesn't exist" claim was wrong. Cleans up the *machine*, not the *app*. For full ephemeral run: combine with explicit `fly apps create` + `fly apps destroy`. |
| `--rootfs-persist` / `--rootfs-size GB` | Root FS persistence + sizing. | Not used; v1 agents are stateless. |
| `--schedule HOURLY\|DAILY\|...` | Schedule a recurring run. | Not used in v1. v2+ for cron-like jobs. |
| `--shell` | Open a shell on the machine after creation. | Useful for debugging; not used in v1 scripts. |
| `--skip-dns-registration` | Don't register the machine's 6PN IP. | Not used. |
| `--standby-for MACHINE_ID` | Standby/failover relationship. | Not used. |
| `--swap-size MB` | Swap disk size. | Not used. |
| `--use-zstd` | Enable zstd compression for image transfer. | Default fine. |
| `--user USER` | With `--shell`: shell-as-this-user. | Not used. |
| `--vm-cpu-kind {shared,performance}` | CPU kind. | Default `shared` is fine for Hermes (1× shared CPU, ~256MB). |
| `--vm-cpus N` (alias `--cpus`) | CPU count. | Default fine. |
| `--vm-gpu-kind X` / `--vm-gpus N` | GPU attachment. | Not used (Hermes calls hosted LLM APIs; no local inference). |
| `--vm-memory MB` | Memory. | Phase 2 rehearsal used default `256MB`. M4 may need to bump to `512MB`+ depending on Hermes runtime profile. |
| `--vm-size NAMED` | Named VM size (e.g., `shared-cpu-1x`, `performance-1x`). | M4: probably `shared-cpu-1x` for v1; promote later if needed. |
| `-v, --volume SPEC` | Mount a volume (`name:path`). **Repeatable.** | Not used in v1 (stateless agents). |
| `--wg` | Use WireGuard for communication. | Default fine. |
| `--build-secret`, `--build-target`, etc. | Build-time options. | Not used (image is pre-built). |
| `-t, --access-token TOKEN` | Override the API token. | Useful for v1.5 multi-tenancy: pass per-user token here. |
| `--debug` / `--verbose` | Logging. | Useful when troubleshooting. |

#### `fly machine wait`

```
fly machine wait <id> [-a APP] [--state STATE] [-w TIMEOUT]
```

- Default state: `settled` (any terminal state).
- Other states: `created`, `started`, `stopped`, `destroyed`.
- **Default timeout: 5 minutes.** Override with `-w 30s`, `-w 2m`, etc.
- M4 spawn flow uses this to wait until the machine is `started` before
  flipping `agent_instances.status = "running"`.

#### `fly machine status`

```
fly machine status <id> [-a APP] [-d/--display-config]
```

- Without `-d`: human-readable summary.
- With `-d`: machine config as JSON — useful for debugging spawn-payload
  discrepancies between what we *sent* via the API and what Fly
  *materialized*.

### `fly secrets`

```
fly secrets set NAME=VALUE NAME=VALUE ... -a APP [--stage] [--detach] [--dns-checks]
fly secrets unset NAME NAME ... -a APP
fly secrets list -a APP                       # also -j/--json
fly secrets deploy -a APP                     # deploy staged secrets
fly secrets sync -a APP                       # reconcile local view with server-side state
fly secrets import -a APP                     # NAME=VALUE pairs from stdin
```

**Corellia usage:**

- **`fly secrets set` after `fly apps create`, before `fly machines run`**
  is the canonical M4 spawn-flow pattern. The plan's `smoke.sh` does
  exactly this:
  ```
  fly secrets set --app "$APP" \
    CORELLIA_AGENT_ID="$APP" \
    CORELLIA_MODEL_PROVIDER="openrouter" \
    CORELLIA_MODEL_NAME="..." \
    CORELLIA_MODEL_API_KEY="$KEY"
  ```
- **`--stage`** sets secrets without immediately re-deploying the app.
  Useful when batching multiple secret changes; **not used in v1
  spawn flow** (we set everything at once before the machine exists).
- **`--detach`** returns immediately; default monitors deployment
  progress. Worth using in scripts that want fast control flow.

### `fly logs`

```
fly logs -a APP [-r REGION] [-n/--no-tail] [-j/--json]
```

**Quirk discovered in Phase 2 (verified empirically):**

- **`--no-tail` does *not* exit immediately on empty log streams.** The
  flag's documented description is "Do not continually stream logs," but
  in practice it waits for at least one log batch. If the app has zero
  logs (machine never produced output, or app just created), the command
  hangs indefinitely.
- **Workaround:** wrap in a timeout. macOS lacks GNU `timeout` by
  default; install `coreutils` (`brew install coreutils`) for `gtimeout`,
  or use a backgrounded-and-killed pattern:
  ```bash
  ( fly logs -a "$APP" & FLYPID=$!; sleep 15; kill "$FLYPID" 2>/dev/null )
  ```
- **For Phase 7 `smoke.sh`:** prefer the backgrounded-kill pattern
  (portable, no extra brew dependency) over `gtimeout`.

### `fly deploy`

```
fly deploy [-a APP] [-c CONFIG] [-i IMAGE] [-e NAME=VALUE] [-s SIGNAL] [-y]
```

**Key flags (full list in `fly deploy --help`; not all listed here):**

- `-i, --image IMAGE` — deploy a pre-built image (skip the build step).
  This is what we'd use for the *control plane* deploy in M3 if we
  pre-build via `docker buildx`; otherwise `fly deploy` does the build
  itself from `backend/Dockerfile`.
- `-e NAME=VALUE` — set env vars at deploy time. Persisted across
  restarts.
- `-s SIGNAL` — stop signal (default `SIGINT`).
- `-y, --yes` — accept all confirmations (CI-friendly).

**Corellia usage in v1:**

- **Control plane deploy (M3 Phase 8 onwards):** `fly deploy` from
  `backend/` with a `fly.toml` configured for `corellia-api`. **This is
  not the same as machine spawning** — `fly deploy` is for "deploy this
  app's image to its app"; agent spawning uses `fly machines run` (or
  the API equivalent) for "create one new machine in a fresh app."

### `fly auth`

```
fly auth login                  # interactive (opens browser via device-code flow)
fly auth logout
fly auth whoami                 # email or service identity
fly auth signup                 # create a new Fly account
fly auth docker                 # add registry.fly.io to Docker daemon's auth (5-min token)
```

**Corellia usage:**

- **`fly auth login`** runs once per developer machine; persists the
  token in `~/.fly/config.yml`.
- **`fly auth whoami`** is the cheapest "am I authenticated" check.
  `pkhelfried@gmail.com` for this machine.
- **`fly auth docker`** is what wires Docker Desktop to push to
  `registry.fly.io` for `fly deploy`. **Not used for our adapter image
  push** (that goes to GHCR via `docker login ghcr.io`, separate from
  Fly's own registry).

### `fly orgs`

```
fly orgs list
fly orgs show <slug>
fly orgs create <name>
fly orgs delete <slug>
fly orgs invite <slug> <email>
fly orgs remove <slug> <email>
fly orgs replay-sources       # advanced — request-replay routing config
```

**Corellia usage:**

- **`fly orgs list`** during Phase 2 confirmed `crimson-sun-technologies`,
  `kessel-run-industries`, `ebb-amp-flow-group`, `personal` all exist
  for this user.
- **`fly orgs show crimson-sun-technologies`** would dump full details
  (members, billing, etc.) — useful for v1.5 onboarding to validate
  permissions.
- **No use of `create/invite/delete` in v1** — orgs are operator-managed
  outside Corellia.

### `fly platform`

```
fly platform regions       # 30 regions (table format)
fly platform vm-sizes      # 25 VM sizes
fly platform status        # current platform incidents/maintenance (also -j/--json)
```

**Corellia usage:**

- **`fly platform regions`** is the source for the M4 spawn flow's
  region-picker dropdown (a static list is fine — regions change rarely).
  Currently 30 regions; codes are 3-letter (e.g., `iad`, `lhr`, `nrt`,
  `jnb`, `sin`).
- **`fly platform vm-sizes`** is the source for the M4 spawn flow's
  VM-size picker (if we expose one). 25 sizes; canonical small-VM
  identifier is `shared-cpu-1x`.

### `fly status`

```
fly status -a APP [-j/--json]
```

Shows app summary: machines, IPs, recent releases. Cheap "is the app
healthy" pulse.

### `fly releases`

```
fly releases -a APP [-j/--json]
```

History of `fly deploy` invocations against this app. **Not relevant for
agent apps** (we don't `fly deploy` against them); useful for control-plane
deploy history.

### `fly ssh` / `fly console` / `fly sftp`

```
fly ssh console -a APP [--machine ID] [-C COMMAND]   # SSH into a running machine
fly ssh issue                                         # issue a new SSH credential
fly ssh log                                           # log of all issued SSH certs
fly ssh sftp                                          # SFTP (alias for fly sftp)

fly console -a APP [--machine ID] [-C COMMAND]       # spin up a console machine
fly sftp shell -a APP                                 # interactive SFTP shell
```

**Corellia usage:**

- **`fly ssh console -a corellia-agent-<uuid>`** is the operator's
  debugging escape hatch for a specific spawned agent — useful when
  Phase 7 smoke fails or when M4+ surfaces a runtime issue. Not part of
  any production code path.

### `fly proxy`

```
fly proxy LOCAL[:REMOTE] -a APP [-b BIND_ADDR] [-s/--select]
```

Port-forwards a remote machine port to local. Useful for poking at a
machine's internal services from a developer laptop without exposing them
publicly.

### `fly ips` / `fly scale` / `fly volumes` / `fly checks`

Used minimally in v1; full subcommand maps available via `--help` if
needed. Notable:

- **`fly ips list -a APP`** to see what public IPs an app holds. v1
  agents may have only IPv6 (no IPv4 by default — Fly charges for IPv4).
- **`fly scale count N -a APP`** is how `fly deploy`-managed apps scale
  horizontally. **Not used for agent apps** (we control machine count
  manually via `fly machines run`).
- **`fly volumes create`** for stateful apps. v1 agents are stateless.
- **`fly checks list -a APP`** for app-level health checks. Not used in
  v1 (no HTTP services on agents).

### `fly tokens`

```
fly tokens create deploy --app APP                  # app-scoped deploy token
fly tokens create machine-exec --app APP            # token for fly machine exec
fly tokens create org --org SLUG                    # org-wide deploy token
fly tokens create readonly --org SLUG               # read-only org token
fly tokens create ssh --app APP                     # SSH-only token
fly tokens list                                     # all tokens for current user
fly tokens revoke ID
fly tokens attenuate ID                             # narrow scope of an existing token
fly tokens debug ID                                 # show what a token can do
```

**Corellia usage — high importance for v1.5:**

- **`fly tokens create deploy --app APP`** generates an app-scoped token
  with deploy permissions only. **This is the shape v1.5's per-user-Fly-
  credential intake should accept** — users paste a deploy-scoped token
  rather than a full-account token, dramatically reducing blast radius.
- **`fly tokens create org --org SLUG`** is the equivalent for "let
  Corellia spawn agents anywhere in this org." Stronger but cleaner
  than per-app tokens for the multi-app v1 deploy topology
  (one-app-per-agent).
- **`fly tokens attenuate`** is the v1.5+ governance primitive for
  "narrow this user's already-issued token." Rare but valuable for
  incident response.

---

## 3. Commands Corellia almost certainly won't use

One-liner each, recorded so a future "is there a fly command for X?"
question has an answer here.

| Command | One-liner | Why we don't use it |
|---|---|---|
| `fly mpg` / `fly postgres` / `fly mysql` / `fly redis` / `fly consul` / `fly litefs-cloud` / `fly storage` | Database/state providers managed by Fly. | We use Supabase for Postgres + auth; v1 is stateless beyond that. |
| `fly certs` | TLS cert management. | Fly auto-issues certs for `*.fly.dev`; we don't need custom domains in v1. |
| `fly dashboard` | Open browser to web UI. | Convenience; not scriptable. |
| `fly dig` | DNS queries against Fly's internal DNS. | Debugging-only. |
| `fly extensions` | Installable add-ons. | None used in v1. |
| `fly image` | Inspect/update an app's current image. | Conceptually overlaps with `fly machines update`; we don't use either in v1. |
| `fly incidents` | Platform incident feed. | Useful for ops, not code. |
| `fly jobs` | Running jobs at Fly. | Not used. |
| `fly launch` | One-shot: create app + first deploy from a Dockerfile. | We separate `fly apps create` + `fly machines run` for explicit control. |
| `fly mcp` | MCP integration for flyctl. | Not used. |
| `fly ping` | ICMP ping over WireGuard. | Debugging-only. |
| `fly services` | View `fly.toml` service config. | We don't use `fly.toml` for agent apps. |
| `fly settings` | Local flyctl config (telemetry, etc.). | Operator-side only. |
| `fly synthetics` | Synthetic monitoring (uptime checks). | Not used. |
| `fly wireguard` | Manage WireGuard peers. | `fly agent` uses WireGuard transparently; manual management not needed. |
| `fly agent` | Background WireGuard process for `fly proxy` etc. | Auto-managed; subcommands (`start/stop/ping/restart/run`) are recovery-only. |
| `fly doctor` | Environment diagnostic. | Useful when troubleshooting; runs ad-hoc. |
| `fly completion` | Shell autocomplete generator. | Operator-side ergonomics. |
| `fly help` | Help for any command. | Built-in; documented above as `--help`. |

---

## 4. Plan-vs-reality corrections (M3 audit)

This section records cases where M3's plan doc or my own narration drifted
from CLI reality. Each one was caught empirically; recording them here
prevents recurrence.

### Correction 1: `fly machine run --rm` *exists* (was wrongly claimed missing in Phase 2 v1 narration)

**The claim:** "the `--rm` flag does not exist in `fly machines run`"
(Phase 2 completion doc, original v1 narration).

**The reality:** `--rm` is a real flag on `fly machine run`. Full
description from the local CLI:

```
--rm    Automatically remove the Machine when it exits. Sets the
        restart-policy to 'never' if not otherwise specified.
```

**Why I missed it:** I read the `fly machine run --help` output via
`head -80` and the `--rm` line is below that line count. The help has
~136 lines total; `--rm` is in the second half.

**The actual failure of the original Phase 2 invocation:** The plan's
`fly machines run --rm --org $FLY_ORG_SLUG --region iad <image> -- ...`
failed with `Error: prompt: non interactive` because **no `--app` was
provided** — `fly machines run` requires app context (either `--app NAME`,
a `fly.toml` in CWD, or interactive prompt). `--rm` doesn't substitute
for app context; it only handles inner-machine cleanup on exit, not app
creation/cleanup.

**Lesson:** when reading help output, `--help | wc -l` first to know the
true surface size, *then* drill in. `head -N` on a help output is a
correct-but-truncated read; never trust it as exhaustive.

### Correction 2: `fly logs --no-tail` hangs on empty log streams

**The claim (implicit in plan):** `fly logs --no-tail` returns
immediately after dumping existing logs.

**The reality:** The flag's documented description is "Do not
continually stream logs," but the command waits for at least one log
batch to materialize. For an app with zero logs (machine never produced
output, or app just created), the command hangs indefinitely.

**Workarounds:**

```bash
# Portable: background + sleep + kill
( fly logs -a "$APP" & FLYPID=$!; sleep 15; kill "$FLYPID" 2>/dev/null )

# macOS with brew install coreutils:
gtimeout 15 fly logs -a "$APP" || true

# Linux (or macOS with GNU coreutils named normally):
timeout 15 fly logs -a "$APP" || true
```

**Where this matters:** Phase 7's smoke script must use one of these;
the plan-as-written would hang. Phase 3 should set this up.

### Correction 3: `fly machine run <image>@sha256:DIGEST` doubles the digest in the API payload

**The claim (implicit):** Passing a manifest-list digest works the same
as a tag for `fly machine run`.

**The reality:** When passed a manifest-list digest, the Fly CLI resolves
it to a per-arch image manifest digest (e.g., the `linux/amd64` variant)
and *appends* the per-arch digest to the original ref *without stripping
the original digest*. The resulting `<image>@sha256:X@sha256:Y` is
rejected by the Machines API with `config.image: invalid image
identifier`.

**Workaround for CLI usage:** pass a tag (e.g., `:v2026-04-26-0ece98b`)
instead of a digest. Same image content, no double-resolution.

**Workaround for production code (M3 Phase 5+):** Don't go through the
CLI. `FlyDeployTarget.spawn()` calls Fly's HTTP Machines API directly
and constructs the machine-config payload itself — it can pass the
canonical `@sha256:DIGEST` form without the CLI's resolution layer.
**This is one of the load-bearing reasons the §11.1 abstraction
exists** — production code bypasses CLI quirks because the API path
doesn't have them.

### Correction 4: `fly apps destroy` removes machines too (no need for explicit machine destroy first)

**The claim (implicit in plan §Phase 3 task 1):** Order matters — kill
machines first, then destroy app.

**The reality:** `fly apps destroy --yes <app>` removes the app and
*all its machines, secrets, IPs, volumes* atomically. No need to
`fly machine destroy ID...` first; the app-level destroy cascades.

**Lesson:** `fly apps destroy` is the simplest possible cleanup
primitive. Use it as the trap-on-EXIT for any ephemeral
`corellia-rehearsal-*` or `corellia-smoke-*` app.

---

## 5. Caveats / known quirks

Caught during the M3 audit; not all are bugs (some are design
decisions that surprise newcomers).

- **`fly logs --no-tail` doesn't actually return on empty streams.**
  See Correction 2.
- **`fly machine run` digest doubling.** See Correction 3.
- **`fly machine run` requires app context.** See Correction 1.
- **`fly machine destroy` requires `--force` for running machines.**
  Default behavior fails with "machine is not in a stopped or
  suspended state."
- **`fly apps create` does *not* create a `fly.toml` automatically.**
  Use `fly config save -a <name>` if you want one. Spawned agent apps
  in v1 don't have or need `fly.toml`.
- **`fly secrets set` against an app with no machines is fine.**
  Secrets are app-scoped; subsequent machines inherit them. Order
  matters: set secrets *before* `fly machine run` so the new machine
  picks them up at boot.
- **`fly auth docker` tokens expire after 5 minutes.** Re-run before
  every `fly deploy` if the previous run was >5 min ago.
- **The `corellia` buildx builder is not a Fly concept.** It's a
  Docker buildx builder named "corellia" we created in Phase 2. Not
  visible to or relevant to `fly` commands; mentioning here only
  because the names overlap and are easy to confuse.
- **`fly platform regions` returns a *table* by default**, not a
  list — pipe to `awk '/[a-z]{3}/{print $NF}' | grep -E '^[a-z]{3}$'`
  if you need just the codes.
- **Region codes are 3-letter ICAO airport codes** (e.g., `iad` =
  Washington Dulles, `nrt` = Tokyo Narita, `lhr` = London Heathrow).
  Useful mnemonic.

---

## 6. Cross-references to Corellia docs

- `docs/blueprint.md` §8 — Fly deployment topology (one app = one
  machine = one agent, Firecracker microVMs, etc.).
- `docs/stack.md` §10 — Backend deploy section (uses `fly deploy`
  for the control plane).
- `docs/deployment-architecture.md` §3 — Build-time vs. runtime
  picture of what flyctl actually does.
- `docs/executing/hermes-adapter-and-fly-wiring.md` §Phase 2 + §Phase
  3 + §Phase 7 — where flyctl invocations are prescribed; reference
  this doc when those plans drift from CLI reality.
- `docs/completions/hermes-adapter-and-fly-wiring-phase-2.md` — the
  phase that motivated this reference doc.

---

## 7. Maintenance

This doc reflects `fly v0.4.37` as of 2026-04-26. When the local CLI
upgrades:

1. Run `fly version` to confirm the new version.
2. Run `fly --help` and re-derive §1's tables — note any new top-level
   commands.
3. For each command Corellia uses (§2), `fly <cmd> --help | wc -l`
   first to detect surface-area growth, then drill in if the line
   count changed materially.
4. Update §4 if any of the corrections turned out to be CLI bugs that
   later got fixed (the doubled-digest CLI quirk in particular is the
   kind of thing that may be patched upstream).

The doc is intentionally maintained as a navigation aid, not a contract
— `fly --help` on the operator's machine remains the source of truth.

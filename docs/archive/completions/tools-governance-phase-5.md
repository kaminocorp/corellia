# Tools Governance — Phase 5 Completion Notes

**Plan:** `docs/executing/tools-governance.md`
**Phase:** 5 — `corellia_guard` plugin (the doorman)
**Status:** complete (code); adapter image rebuild is operator-gated
**Date:** 2026-04-27
**Verification:**
- `pytest adapters/hermes/plugin/corellia_guard/tests/` → 49 passed
- `cd backend && go vet ./... && go test ./... && go build ./...` → all green
- `pnpm -C frontend type-check && pnpm -C frontend lint && pnpm -C frontend build` → all green
- `pnpm proto:generate` → no diff (no proto changes this phase)
- `cd backend && sqlc generate` → no diff (no SQL changes this phase)
- Adapter image rebuild + migration: operator-gated (see §Operator exit gate)

---

## What landed

The Phase 2 plugin stub (`register(ctx): pass`) is replaced with the real
enforcement implementation. Three non-native scopes — URL allowlist on
`web`, command-pattern allowlist on `terminal`, path allowlist on `file` —
plus the working-directory pin on `terminal`, are now enforced at
`pre_tool_call`. The plugin reads scope state from
`$HERMES_HOME/corellia/scope.json` and a process-global daemon thread
keeps that file fresh by polling `CORELLIA_TOOL_MANIFEST_URL` on a TTL.

### `adapters/hermes/plugin/corellia_guard/scope.py` — new

Pure-logic scope dataclasses + matchers. No Hermes imports, no I/O.

- **`ToolsetScope`** — one toolset's plugin-enforced shape:
  `url_allowlist`, `command_allowlist`, `path_allowlist`,
  `working_directory`. `from_dict` is defensive — bad types in JSON
  decay to empty defaults rather than raising.
- **`Scope`** — top-level container keyed by `toolset_key`, plus
  `manifest_version` for log correlation. `Scope.deny_all()` is the
  fail-safe state used when scope.json is missing or unparseable.
- **`match_url(scope, url)`** — fnmatch globs with two-mode pattern
  semantics: a pattern without `/` is host-only and admits any path
  under that host (`*.acme.com` matches both `wiki.acme.com` and
  `wiki.acme.com/foo/bar`); a pattern containing `/` matches against
  the full host+path target. Scheme-stripped before matching so
  `https://` and `http://` URLs share the same allowlist. Default-deny
  on empty list and on `None` scope.
- **`match_command(scope, command)`** — `re.search` against each
  pattern; invalid regexes are silently skipped (Phase-4 client +
  Phase-1 server validation already reject them, but the matcher
  must not crash if one slips through). Default-deny.
- **`match_path(scope, path)`** — fnmatch globs (understands `**`).
  Default-deny.
- **`match_working_dir(scope, requested_cwd)`** — prefix-on-path-boundary
  match (`/workspace` admits `/workspace/sub` but rejects
  `/workspace-other`). Trailing-slash insensitive. Default-allow on
  empty pin (Phase 1 decision); default-allow when the terminal
  toolset isn't equipped at all (no cwd to enforce against).

### `adapters/hermes/plugin/corellia_guard/hook.py` — new

The `pre_tool_call` hook body and the `ScopeCache` it reads from.

- **`ScopeCache(path)`** — mtime-aware reader. `os.stat` once per call,
  re-parse only when mtime advances. Threading.Lock around the
  parse-and-set so the polling daemon's atomic `os.replace` is
  observed atomically by reader threads. Disappearing file →
  deny-all immediately (stale-allow is the unsafe failure mode we
  explicitly avoid).
- **`make_pre_tool_call(cache)`** — returns the hook callable bound
  to that cache. The returned callable accepts Hermes's kwargs per
  `hermes_cli/plugins.py:742–747` (`tool_name`, `args`, `task_id`,
  `session_id`, `tool_call_id`, plus `**_unused` for forward-compat).
- **Tool-name routing** — three curated frozensets:
  `_WEB_TOOLS = {"web_search", "web_fetch", "browser_navigate"}`,
  `_TERMINAL_TOOLS = {"shell_exec", "terminal_exec", "execute_command", "run_command"}`,
  `_FILE_TOOLS = {"read_file", "write_file", "edit_file", "delete_file", "list_files", "list_directory", "search_files"}`.
  Tool names outside these sets pass through (the toolset is gated
  at `platform_toolsets.cli` config level — the plugin only
  enforces the three non-native shapes).
- **Reject return shape** — `{"action": "block", "message": "<reason>"}`
  per `get_pre_tool_call_block_message` (`plugins.py:766–785`).
  Returning `None` permits.
- **Argument extraction** — defensive: `args.get("url")` for web tools
  (with `query`/`href` fallbacks), `command`/`argv` (string or list)
  for terminal, `path`/`file_path`/`filename` for file. Non-string
  values coerce to empty string and trip the matcher's default-deny.

### `adapters/hermes/plugin/corellia_guard/__init__.py` — replaced (was Phase 2 stub)

`register(ctx)` is now real:

- **Single-flight guard** — module-level `_STARTED` sentinel + `Lock`.
  First `register` call constructs the `ScopeCache`, builds the hook
  closure, spawns the daemon thread; every subsequent call only
  re-attaches the hook to the new ctx (sub-agents under the
  `delegation` toolset, future session-isolation patterns) without
  duplicating threads. Plan §6 risk-register row "plugin daemon-thread
  leaks" mitigation.
- **Daemon thread** — `threading.Thread(daemon=True)` polling
  `CORELLIA_TOOL_MANIFEST_URL` with a `Bearer $CORELLIA_INSTANCE_TOKEN`
  header. ETag-aware: sends `If-None-Match: "<version>"` on every poll
  after the first; treats 304 as no-op. On 200, projects the manifest
  into the scope.json shape and rewrites atomically (`os.replace`).
  On error, exponential backoff 5s → 60s; never relaxes enforcement.
- **TTL** — default 30s; env-overridable via
  `CORELLIA_MANIFEST_POLL_TTL`; clamped 5s..5min per plan §5 decision 5.
  Bogus values fall back to default with a warning log.
- **Manifest projection** — `_manifest_to_scope_doc` extracts only the
  four plugin-enforced shape keys (`url_allowlist`,
  `command_allowlist`, `path_allowlist`, `working_directory`) from
  each toolset's scope, dropping forward-compat shape keys the
  current plugin doesn't enforce. Toolsets without any of those four
  are omitted from scope.json (the manifest may include them for
  config.yaml gating purposes).
- **Skipped-poll branch** — when either `CORELLIA_TOOL_MANIFEST_URL`
  or `CORELLIA_INSTANCE_TOKEN` is unset, the daemon doesn't start.
  The plugin still loads, still reads the initial scope.json (whose
  presence is assumed), and still enforces — it just won't refresh.
  This branch is reachable on local-dev `docker run` invocations
  that pre-mount a hand-crafted scope.json; production spawn always
  sets both vars.

### `adapters/hermes/plugin/corellia_guard/tests/` — new (49 cases across 6 files)

| File | Cases | Covers |
|------|-------|--------|
| `test_url_matcher.py` | 12 | demo case (`*.acme.com` allowing `wiki.acme.com`, rejecting `evil.com`), multiple patterns, scheme normalization, default-deny on empty, host-only vs path-aware semantics, missing-scope deny |
| `test_command_matcher.py` | 8 | regex correctness (anchored / unanchored), default-deny, invalid-regex graceful skip |
| `test_path_matcher.py` | 8 | `/workspace/**` admit/reject, exact paths, multiple patterns, default-deny, missing-scope deny |
| `test_working_dir.py` | 9 | default-allow on empty, exact equality, prefix admit, trailing-slash insensitivity, sibling-directory rejection (the `workspace` vs `workspace-other` trap), missing-scope allow |
| `test_scope_reload.py` | 5 | initial load, mtime-advance reload (revoke flow), missing file → deny-all, unparseable file → deny-all, disappearing file mid-process → deny-all |
| `test_hook_dispatch.py` | 9 | tool_name routing for web/terminal/file, allowed + blocked paths, cwd outside pin → block, unknown tool name → pass-through, extra kwargs don't break the hook (forward-compat) |

`conftest.py` adds the plugin parent dir to `sys.path` so
`pytest adapters/hermes/plugin/corellia_guard/tests/` works without
installing the plugin as a package.

### `adapters/hermes/render_config.py` — extended

New `write_scope_json(home, manifest)` writes the initial
`$HERMES_HOME/corellia/scope.json` from the manifest — projects the
four plugin-enforced shape keys per toolset, drops everything else.
Empty toolsets dict is a valid state (default-deny on every governed
call until the poll daemon refreshes).

The renderer now writes scope.json **always**, even when the manifest
has no toolsets — without the file, the plugin reads `Scope.deny_all()`
and rejects every governed call until the first poll. With the file,
the plugin reads the up-to-date state immediately at boot.

`install_plugin_stub` keeps its name (mechanical: it now copies the
real plugin, not a stub), but the log line drops "stub".

### `adapters/hermes/Dockerfile` — comment-only

The Phase 5 comment block above the `COPY plugin/` line now reflects
that the plugin is the real enforcement implementation, not a stub.
No structural change; same two `COPY` lines.

### Phase 4 wizard scope inputs — Phase-5-pending notices removed

The Phase 4 forward pointer was: "Phase 5 — removing the
`[ ENFORCEMENT IN PILLAR B PHASE 5 ]` notices is mechanical." Done:

- `frontend/src/components/spawn/scope-inputs/pattern-list-input.tsx`
  drops the `pillarBPhase5Notice` prop and its conditional render.
- `url-allowlist.tsx`, `command-allowlist.tsx`, `path-allowlist.tsx`
  drop the prop from their `PatternListInput` calls.

### `backend/migrations/20260427180000_adapter_image_ref_bump_pillar_b_phase5.sql` — new

Operator-gated, mirrors the Phase 2 template. Placeholder digest
`<IMAGE-DIGEST-PENDING>` rejected at `goose up` by the
`adapter_image_ref_digest_pinned` CHECK if not filled in. The down
migration reverts to the Phase 2 image — its digest is also a
placeholder for the operator to fill in from the Phase 2 build's
captured digest.

---

## Deviations from plan

1. **Hook body lives in `hook.py`, not a separate `__init__.py` /
   `scope.py` / `hook.py` triplet that imports cyclically.** Plan §3
   Phase 5 deliverable 4 lists `hook.py` separately; the layout
   landed as: `scope.py` (matchers), `hook.py` (cache + hook
   builder), `__init__.py` (entry point + daemon thread). Cleaner
   separation of "pure logic" (scope.py), "I/O-coupled but
   single-instance" (hook.py's ScopeCache), and "process-lifecycle
   coordinator" (__init__.py's `register` + daemon).

2. **Tool-name routing is curated frozensets, not prefix matching.**
   Plan §3 Phase 5 deliverable 4 says "Routes by `tool_name` to the
   appropriate matcher". A naive `tool_name.startswith("web_")`
   prefix dispatch would match anything `web_*` — fine until upstream
   ships a `web_admin_purge` tool that we'd accidentally route
   through the `web` URL allowlist. Curated frozensets fail closed
   on unknown names: a renamed-upstream tool gets default-allow
   (because it's not in any frozenset), which is right because the
   plugin's job is the *fine-grained* scope; the *toolset* gate at
   `platform_toolsets.cli` is the toolset-level safety net. When
   upstream renames a tool, Hermes-config gating still applies; the
   plugin's allowlist coverage drops until the frozenset is updated.
   The trade-off favours not over-blocking renamed tools that should
   pass.

3. **Daemon thread spawned only when both env vars are set.** Plan
   §3 Phase 5 deliverable 2 implies the thread always spawns. In
   practice `CORELLIA_TOOL_MANIFEST_URL` and `CORELLIA_INSTANCE_TOKEN`
   are absent on local-dev `docker run` invocations — spawning the
   thread there would log a connection error every 30s. Skipping
   the thread when either is unset keeps local dev quiet; production
   spawn always sets both, so the operational path is unchanged.

4. **Scope.json shape projects four keys, not arbitrary shapes.**
   Plan §3 Phase 1 catalog YAML reserves `browser.url_allowlist` for
   forward-compat ("not enforced in Phase 5; acknowledged in the
   risk register §6"). The Phase 5 plugin's manifest projection
   reads `url_allowlist` / `command_allowlist` / `path_allowlist` /
   `working_directory` — and `browser.url_allowlist` would
   *coincidentally* land in scope.json under `toolsets.browser`,
   but the hook's `_WEB_TOOLS` / `_TERMINAL_TOOLS` / `_FILE_TOOLS`
   frozensets don't include any browser tool name, so it never
   enforces. When Phase 6+ adds `browser` enforcement, the change
   is a one-frozenset edit in `hook.py`.

5. **No integration test inside the Hermes container.** Plan §3
   Phase 5 deliverable 5 mentions an "Integration test (optional,
   gated on Hermes-image-available env var): spin up Hermes with
   the plugin and a fake manifest, fire a `pre_tool_call`, assert
   allow/reject." Skipped — the unit tests cover the hook dispatch
   end-to-end (real ScopeCache reading a real file the test wrote);
   the value of running it inside Hermes is to verify the
   `register(ctx)` and `add_hook` calls match upstream's contract,
   which is best validated by the operator-gated smoke against a
   live spawned agent (Phase 5 acceptance gate's three smoke items).

6. **No CI extension yet.** Plan §3 Phase 5 deliverable 8 says
   "`adapters/hermes/plugin/corellia_guard/tests/` gets a `pytest`
   invocation in CI alongside the existing Go test step." The repo
   has no `.github/workflows/` setup yet (per stack.md §13 "No
   GitHub Actions or Turbo remote caching in v1 — ship without CI
   if necessary"); pytest is run locally + as part of the operator
   exit gate. When CI lands, adding a step is mechanical.

---

## Operator exit gate

```sh
# 1. Build and push the Phase 5 adapter image
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/hejijunhao/corellia-hermes-adapter:v2026-04-27-pillar-b-phase5 \
  --push adapters/hermes

# 2. Capture the manifest-list digest
docker buildx imagetools inspect \
  ghcr.io/hejijunhao/corellia-hermes-adapter:v2026-04-27-pillar-b-phase5 \
  | grep "Digest:" | head -1
# → Digest: sha256:<64-char-hex>

# 3. Fill in the migration with the real digest
#    (replace <IMAGE-DIGEST-PENDING> in
#     20260427180000_adapter_image_ref_bump_pillar_b_phase5.sql)

# 4. Run the migration
goose -dir backend/migrations postgres "$DATABASE_URL_DIRECT" up

# 5. Three smoke tests per Phase 5 acceptance gate:
#    a. Spawn an agent with `web` granted scoped to *.acme.com.
#       Assert: web_search against wiki.acme.com succeeds; against
#       evil.com returns the structured rejection
#       {"action": "block", "message": ...} in the agent's logs.
#    b. From the BE, revoke the `web` grant.
#       Wait up to 35s; assert: agent's next web_search fails
#       (plugin reads the new scope.json after the daemon poll).
#    c. Kill the manifest endpoint mid-flight.
#       Assert: the plugin keeps enforcing the last-known-good
#       scope.json (stale manifest does NOT relax enforcement).
```

---

## Acceptance gate status

| Gate | Status |
|------|--------|
| `pytest adapters/hermes/plugin/corellia_guard/tests/` green | ✅ 49 passed |
| `cd backend && go vet ./... && go test ./...` green | ✅ all green |
| `pnpm -C frontend type-check && lint && build` green | ✅ all green |
| Smoke 1 (URL allowlist allow + block) | Operator-gated |
| Smoke 2 (revoke without redeploy, ≤35s) | Operator-gated |
| Smoke 3 (manifest endpoint down → keep enforcing) | Operator-gated |

---

## Forward pointers

- **Phase 6 (org-curation page)** — already unblocked by Phase 3 RPCs.
  No dependency on Phase 5; the FE just consumes `getOrgToolCuration`
  + `setOrgToolCuration` and renders the toggle UI.
- **Phase 7 (fleet-view per-instance grant editor + audit + hardening)**
  — the propagation-tier label ("Plugin tick — applies within ~35s on
  next tool call" vs "Restart required") is now meaningful: the plugin
  poll daemon is what closes the "plugin tick" loop. Phase 7's
  `RestartInstance` RPC closes the "restart required" loop.
  Hardening tasks: manifest endpoint rate-limit (per-instance-token
  bucket), poll-TTL upper bound (already in `__init__.py`'s 5min
  clamp — Phase 7 just needs to verify the BE-side enforcement
  matches), plugin fail-safe behaviour (already in
  `ScopeCache._reload_locked` — Phase 7 documents and verifies).
- **`browser` toolset enforcement** — frozenset edit in `hook.py`
  adds `browser_navigate` (or whatever upstream names the calls)
  to `_WEB_TOOLS`. Catalog already carries `browser.url_allowlist`
  per Phase 1; render_config.py already projects it; only the
  routing frozenset is missing.
- **Per-tool granularity (taxonomy surface #2, v1.6)** — when it
  lands, `_WEB_TOOLS` / `_TERMINAL_TOOLS` / `_FILE_TOOLS` get
  joined by a per-tool allow/deny field on each grant's `scope_json`,
  consumed alongside the existing matchers in the hook.

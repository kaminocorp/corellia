# Hermes Tool-Name Audit

The `corellia_guard` plugin enforces scopes by routing on `tool_name`. The
routing is a curated frozenset (`_WEB_TOOLS`, `_BROWSER_TOOLS`,
`_TERMINAL_TOOLS`, `_FILE_TOOLS` in
`adapters/hermes/plugin/corellia_guard/hook.py`). A rename upstream that
nobody catches at pin-bump time creates a fail-open: the renamed tool
falls into the unknown-name pass-through path and the operator's
allowlist no longer applies.

This file is the audit log of the canonical Hermes tool surface at the
currently pinned digest. Update it whenever the Hermes pin in
`adapters/hermes/Dockerfile` moves; CI does not enforce drift today
(future work — see "drift detection" below) but a stale audit is a
review-time blocker.

## Pinned Hermes digest

`sha256:d4ee57f254aabbe10e41c49533bbf3eb98e6b026463c42843a07588e45ddd338`

The digest also appears in `adapters/hermes/plugin/corellia_guard/hook.py`
header comment so the routing-frozenset edit ties to a specific upstream.

## Tool-name surface (Hermes 0.x at the pin)

Last audited: 2026-04-27 (changelog 0.13.9, post-Phase-7 hardening).

The audit was performed by reading `hermes_cli/tools/*` at the pinned
digest and the `register_tools` call in each toolset. Toolsets that
ship with Hermes but are not enforced by `corellia_guard` (memory,
delegation, todo, …) are out of scope for this file — the
`platform_toolsets.cli` config gate at boot is the only enforcement
they get.

| Toolset key | Hermes tool name(s)               | Routed to             | Scope shape enforced     |
|-------------|-----------------------------------|-----------------------|--------------------------|
| `web`       | `web_fetch`                       | `_WEB_TOOLS`          | `url_allowlist`          |
| `web`       | `web_search`                      | (pass-through)        | none — query is not a URL; toolset gate is the safety net |
| `browser`   | `browser_navigate`                | `_BROWSER_TOOLS`      | `url_allowlist`          |
| `terminal`  | `shell_exec`                      | `_TERMINAL_TOOLS`     | `command_allowlist`, `working_directory` |
| `terminal`  | `terminal_exec`, `execute_command`, `run_command` | `_TERMINAL_TOOLS` | same |
| `file`      | `read_file`, `write_file`, `edit_file`, `delete_file`, `list_files`, `list_directory`, `search_files` | `_FILE_TOOLS` | `path_allowlist` |

### Notes

- **`web_search` is intentionally NOT enforced** by URL allowlist. The
  argument is a search string, not an operator-controlled URL — the
  upstream search provider's domain is fixed by the toolset itself
  (Exa). Routing it through `_enforce_web` historically caused every
  benign search to fail the allowlist (the search string was matched
  as if it were a URL). The toolset gate (`platform_toolsets.cli`) is
  the safety net: if `web_search` is undesirable, the operator
  disables `web` entirely.

- **`browser_navigate` routes to `_BROWSER_TOOLS`**, not `_WEB_TOOLS`.
  The `browser` toolset's catalog row carries its own `url_allowlist`
  separate from `web`'s; mixing them would have enforced the wrong
  allowlist on browser navigation.

- **Defense-in-depth shell-pattern guard**: `hook.py` runs a fallback
  regex (`_SHELL_SHAPED_RE`) over any tool name that misses every
  explicit frozenset. Names that look shell-shaped (`bash_exec`,
  `shell.run`, `invoke_command`, …) get routed through the terminal
  command-allowlist enforcement WITH a loud log entry. This catches
  the most dangerous fail-open case (Hermes renames `shell_exec` →
  `bash_exec` between digest pins) without default-denying every
  unknown tool name.

## Drift detection (future work)

There is no automated drift check today. Options for v1.6:

1. A pre-commit hook in `adapters/hermes/` that fetches the pinned
   digest and grep-walks `hermes_cli/tools/*` for `register_tools`
   calls; diffs the discovered names against the frozensets. Fails
   on drift.
2. A pytest fixture in `tests/test_audit_drift.py` that does the same,
   gated behind a slow marker so it doesn't run on every push.
3. The minimum bar: when the Hermes digest moves, manually re-run the
   audit table above and update the routing frozensets. The
   `_SHELL_SHAPED_RE` fail-closed guard mitigates the worst case of
   forgetting.

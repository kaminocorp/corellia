# Code Assessment — 2026-04-27

Comprehensive review of the Corellia repository at `master` (post-0.11.2 / M-chat Phase 3). Methodology: four parallel Explore agents covering backend domain, backend infrastructure, frontend spawn/fleet, and remaining surfaces (presentation, adapters, proto, lib). Every BLOCKER claim from the agents was spot-checked against the source before inclusion here; several were rejected as false positives (see §6).

Priority filter, per the assessment ask: **functionality, accuracy, maintainability, clean code only — nice-to-haves dropped.**

---

## 1. Executive summary

**Overall:** the codebase is in good shape for its stage. Architecture rules from `blueprint.md` §11 / `stack.md` §11 are observed throughout — verified by direct inspection of every cross-package boundary. No security-bypass-class defects. No dead end-to-end paths. Test coverage on the spawn/fleet domain is substantial (52 tests in `agents/service_test.go`).

**Two real correctness findings worth fixing:**
1. `BulkUpdateDeployConfig` discards `errgroup.Wait()` — context cancellation from caller timeouts is silently lost.
2. Eight files exceed 500 LOC; four are over 600 and constitute the bulk of the maintainability cost. Concrete decomposition proposals below.

**No other BLOCKERs survived verification.** Several agent-flagged claims (entrypoint signal handling, R3F buffer leaks, `lib/api/client.ts` unauthenticated fallthrough, JWKS rate-limiting) were checked against the source and rejected — see §6 for transparency on what was investigated and ruled out.

**Two pre-existing v1.5 backlog items** were surfaced in agent reports as if they were new findings; they are already documented in code with explicit rationale: `respawn` doesn't refetch the API key (`fleet.go:268–274`), and `logsURL` knows Fly's URL scheme (`service.go:869–874`). Listed in §5 for tracking, not action.

---

## 2. Correctness findings (priority order)

### 2.1 ~~BLOCKER~~ FIXED — `BulkUpdateDeployConfig` swallows context-cancellation errors

**Fixed in 0.11.7 / post-assessment patch.** `fleet.go:497` now propagates `g.Wait()` errors; `TestBulkUpdateDeployConfig_ContextCancellation` added to `service_test.go`.

**Location:** `backend/internal/agents/fleet.go` (was line 497)

The bulk-apply pattern intentionally uses per-row error capture in `BulkResult.Err` so a single failed instance doesn't fail the batch — that's correct. But discarding `g.Wait()`'s return value also discarded **errgroup-level errors**: specifically, `sem.Acquire(gctx, 1)` returns the context's error when `gctx` is cancelled (parent timeout, client disconnect, server shutdown). Those errors disappeared into `_`, and the call returned `(results, nil)` with some `results[i]` zero-valued because `applyBulkOne` was never invoked.

**Applied fix:**

```go
if err := g.Wait(); err != nil {
    return results, err
}
return results, nil
```

Returning `results` alongside the error preserves the partial-progress information the BE already computes, while making the cancellation observable.

---

### 2.2 INFO — `BulkUpdateDeployConfig` partial-result indices on cancellation

Tied to 2.1. After fixing the swallowed `Wait()`, the caller still sees `results` with potentially-zero entries for un-attempted indices. Worth either (a) returning only the populated prefix, or (b) marking un-attempted slots with a sentinel `ErrCancelled` so the FE bulk-modal can render "12 applied, 38 cancelled" instead of "12 applied, 38 with empty errors."

Lower priority than 2.1; the wire contract isn't lying once 2.1 is fixed, just slightly noisy.

---

## 3. Maintainability — files >500 LOC

LOC counts measured via `wc -l`, excluding generated trees. Test files are de-prioritized unless deeply tangled; production files are flagged in size order.

| File | LOC | Severity |
|---|---|---|
| `backend/internal/agents/service_test.go` | 1612 | low (well-organized) |
| `frontend/src/components/spawn/wizard.tsx` | 1051 | **HIGH** |
| `backend/internal/deploy/fly.go` | 985 | **HIGH** |
| `backend/internal/agents/service.go` | 977 | **HIGH** |
| `backend/internal/deploy/fly_test.go` | 795 | low (test) |
| `frontend/src/components/ui/sidebar.tsx` | 723 | none (shadcn upstream) |
| `backend/internal/agents/fleet.go` | 642 | medium |
| `frontend/src/components/fleet/deployment-inspector.tsx` | 617 | medium |
| `frontend/scripts/bake-sign-in-shapes.ts` | 591 | none (one-shot script) |
| `frontend/src/components/fleet/bulk-config-delta-form.tsx` | 581 | medium |
| `frontend/src/components/fleet/deployment-config-form.tsx` | 533 | low |

### 3.1 `backend/internal/deploy/fly.go` (985 LOC)

Single file owns: spawn, update, lifecycle (start/stop/destroy), region cache + refresh loop, lease acquisition, machine config merging, health probe, region listing, placement check, image-digest validation. Eight distinct concerns in one file.

**Proposed split** (file names approximate; keep them all in `internal/deploy/`):

- `fly.go` (~120 LOC) — `FlyDeployTarget` struct, `FlyCredentials`, `flapsClient` interface, `NewFlyDeployTarget`, package-level constants, `validateImageRef`.
- `fly_spawn.go` (~150 LOC) — `Spawn`, `machineConfigFor`, `chatSidecarServices`, `appNameFor`, deferred-cleanup-on-error pattern.
- `fly_update.go` (~180 LOC) — `Update`, `PreviewUpdate`, `mergeMachineConfig`, `updateOneMachineConfig`, `lifoTail`.
- `fly_lifecycle.go` (~120 LOC) — `Stop`, `Start`, `stopOne`, `startOne`, `Destroy`, `destroyMachine`.
- `fly_observe.go` (~140 LOC) — `Health`, `ListMachines`, `projectMachine`, `mapFlyState`.
- `fly_regions.go` (~150 LOC) — region cache state, `regionRefreshLoop`, `refreshRegions`, `ListRegions`, `CheckPlacement`.
- `fly_lease.go` (~80 LOC) — `acquireLease` and the cleanup-context pattern around lease release.

Test file follows naturally: `fly_test.go` can split along the same seam (e.g., `fly_spawn_test.go`, `fly_update_test.go`) once the SUT is split. Not required day one.

**Why this seam:** each file maps to a Phase in the changelog (spawn = M3, update/lifecycle = M5 Phases 4–6, observe = M5 Phase 1) and to a single Fly Machines API surface area. Diffs in the next phase land in one file instead of three.

### 3.2 `backend/internal/agents/service.go` (977 LOC) + `fleet.go` (642 LOC)

These already split spawn vs. fleet at the file level, but both files have grown into mixed-concern modules. `service.go` carries spawn lifecycle, list/get reads, validation, **all proto conversion**, and Fly-aware helpers (`logsURL`, `chatURL`); `fleet.go` carries M4 lifecycle + M5 update/scale/start + drift detection.

**Proposed split:**

- `service.go` shrinks to ~400 LOC: keep `Spawn`, `SpawnN`, `pollHealth`, `resolveSpawnDeps`, `Service` struct + constructor.
- New `proto.go` (~250 LOC) — every `toProtoTemplate`, `toProtoInstance*`, `providerToProto`, `logsURL`, `chatURL`, `tsToRFC3339`, `stringDeref`. The Fly-aware helpers (`logsURL`, `chatURL`) live in this file as a deliberate "thin proto-conversion layer" — no behaviour change, but they cluster with their callers and the §11.1 tension is documented in one place instead of spread across the file.
- New `validation.go` (~150 LOC) — `validateSpawn`, `validateName`, `validateNamePrefix`, `isValidProvider`, related sentinel errors.
- New `reads.go` (~120 LOC) — `List`, `Get`, `ReapStalePending` (these are read-mostly and don't belong with spawn write paths).
- `fleet.go` shrinks to ~500 LOC: keep `UpdateDeployConfig`, `ResizeReplicas`, `ResizeVolume`, `StartInstance`, `BulkUpdateDeployConfig`, `applyBulkOne`, `respawnAgent`.
- New `drift.go` (~130 LOC) — `DetectDrift`, `DriftReport`, `DriftMismatch`.

`service_test.go` (1612 LOC) is *not* on the priority list. It's well-organized, tests are clearly named, and the size reflects coverage, not tangle. Split when adding the next phase if it grows past 2000 LOC.

### 3.3 `frontend/src/components/spawn/wizard.tsx` (1051 LOC)

The single largest production file in the repo. Mixes: top-level state machine + RPC orchestration + 5 step components + form-field primitives + deploy-log surface + 3 fetch-error branches.

**Proposed split:**

- `wizard.tsx` (~300 LOC) — top-level `Wizard`, fetch + render branching, `StepShell`, step dispatcher. The "what does the spawn flow look like" file.
- `wizard-steps.tsx` (~400 LOC) — `HarnessStep`, `IdentityStep`, `ModelStep`, `DeploymentStep`, `ReviewStep`. Each step is a pure component over `(state, dispatch)`.
- `wizard-form-chrome.tsx` (~150 LOC) — `Field`, `ProviderField`, `ApiKeyField`, `SpecRow`, `ConfirmedSummary`, plus helpers (`providerLabel`, `maskApiKey`).
- `wizard-deploy-log.tsx` (~100 LOC) — `DeployLog`, `SYNTHETIC_LINES`, the synthetic-tick `useEffect`. Extract a `useSyntheticLogTick(active, lines)` hook so the lifecycle is testable.
- `wizard-states.tsx` (~50 LOC) — `WizardSkeleton`, `WizardError`, `WizardNotFound` fetch-state branches.

**Why this seam:** the file is currently one component-per-screen-position, which means a change to "how Step 4 validates" requires reading 1000 lines to be sure nothing else depends on a shared closure. Splitting along step boundaries makes each step independently reasonable.

### 3.4 `frontend/src/components/fleet/deployment-inspector.tsx` (617 LOC)

Owns three modes (view / edit / preview) plus a destructive-confirm flow with name-match gating.

**Proposed split:**

- `deployment-inspector.tsx` (~180 LOC) — `DeploymentInspector` (Sheet wrapper + keying) and `InspectorBody` (mode-state machine + RPC handlers).
- `view-pane.tsx` (~80 LOC) — `ViewPane`, `SpecRow`.
- `edit-pane.tsx` (~40 LOC) — `EditPane` (thin wrapper around `DeploymentConfigForm`).
- `preview-pane.tsx` (~200 LOC) — `PreviewPane`, `DestructiveApplyButton`, `DriftBanner`, `driftCategoryLabel`. Concentrating the destructive-confirm logic in one file makes the safety contract reviewable.
- `inspector-helpers.ts` (~50 LOC) — `deploymentValuesFromInstance`, `deployConfigFromValues`. Reusable by bulk-apply.

### 3.5 `frontend/src/components/fleet/bulk-config-delta-form.tsx` (581 LOC) + `deployment-config-form.tsx` (533 LOC)

These two forms duplicate `RegionInput`, `SizeInput`, and `RestartInput` with near-identical logic and slightly different "skip / don't change" wrappers in the bulk variant.

**Proposed split (one shared, one per-form):**

- New `frontend/src/components/fleet/form-inputs/region-input.tsx`, `size-input.tsx`, `restart-input.tsx` — single source for each input shape.
- `deployment-config-form.tsx` shrinks to ~300 LOC by importing the shared inputs.
- `bulk-config-delta-form.tsx` shrinks to ~350 LOC; the bulk-specific concerns (the "Don't change" `FieldRow` wrapper, `summarizeSelection`) stay.
- New `frontend/src/lib/fleet/use-deployment-regions.ts` — `useDeploymentRegions()` hook caching the region list at the app level instead of refetching per form mount. Used by both forms.

This is a single coherent change (~1 day). Do it together; splitting across PRs creates a stale-duplicate window.

---

## 4. Architecture rule compliance

Verified by direct inspection during the assessment.

| Rule | Status | Notes |
|---|---|---|
| §11.1 — No Fly code outside `internal/deploy/FlyDeployTarget` | **observed with one documented exception** | `service.go:869–874` (`logsURL`) and `chat.go` (`chatURL`) hardcode the `fly.io/apps/...` URL scheme. The trade-off is explicitly commented in code with a v1.5 follow-up plan to lift onto `DeployTarget`. Acceptable for v1; tracked. |
| §11.2 — Templates pin by digest, never tag | observed | Enforced at `validateImageRef` (`fly.go`); every `Spawn` path passes through it. |
| §11.3 — `CORELLIA_*` env vars; adapters translate | observed | `entrypoint.sh` is the only place that knows Hermes-native env var names. Backend never references `OPENROUTER_API_KEY` etc. directly. |
| §11.4 — Deferred features stubbed as real interfaces | observed | `LocalDeployTarget` and `AWSDeployTarget` in `stubs.go` return `ErrNotImplemented`; not empty fakes. |
| §11.5 — No upstream forks | observed | Hermes is consumed via image digest + adapter wrapper + sidecar. No fork. |
| §11.6 — No Supabase outside `auth/` and `db/` | observed | grep'd — zero hits elsewhere. |
| §11.7 — Generated code never hand-edited | observed | `internal/gen/`, `internal/db/*.sql.go`, `frontend/src/gen/` are all generator-owned. |
| §11.8 — All env reads through `internal/config/` | observed | `os.Getenv` appears only in `config/config.go`. |
| §11.9 — Business logic never in handlers | observed | Sampled handlers (`SpawnAgent`, `UpdateAgentDeployConfig`, `BulkUpdateAgentDeployConfig`) are 9–33 lines. The 33-line outlier is bulk and consists of UUID parsing + per-ID loop setup, not logic. |
| §11.10 — Frontend never reaches Supabase for app data | observed | `lib/supabase/client.ts` is auth-only. All app data flows through `createApiClient()`. |
| §11.11 — Deploy-target credentials never in DB | observed | `FlyCredentials` struct loaded from env into `FlyDeployTarget`; no DB row references it. v1.5 user-supplied targets will use opaque `storage_ref` per the rule. |

**No active violations.** The §11.1 tension is the only one worth tracking and it is already self-documenting.

---

## 5. Pre-existing v1.5 backlog (surfaced for visibility, not action)

Both items are explicitly documented in code with rationale. Listing them here so they don't get lost when the v1.5 planning starts.

### 5.1 `respawn` doesn't refetch the model API key

**Location:** `backend/internal/agents/fleet.go:268–274` (in-code comment)

When `UpdateDeployConfig` triggers a respawn (region change, lifecycle-mode change), the new Fly app spawns without `CORELLIA_MODEL_API_KEY` in its env. The audit `Secret` row points at the storage_ref but the secret-store fetch path doesn't exist yet. Today's workaround per the comment: operators re-paste the API key via the wizard.

This is a real gap (the agent caught it correctly), but it's a **scoped, documented v1 limitation**, not a regression. v1.5 work item: implement the secret-store fetch and pass the materialized key into `respawnAgent`'s `spec.Env`.

### 5.2 `logsURL` / `chatURL` know Fly's URL scheme

**Location:** `backend/internal/agents/service.go:869–874`, `chat.go` similar

A small §11.1 tension. The trade-off (vs. widening `DeployTarget` with a `LogsURL` method most callers don't need) is documented inline. v1.5 candidate when the second deploy target lands.

---

## 6. Investigated and rejected claims

For transparency: the agent reports flagged the following as BLOCKERs. Each was spot-checked against the source and ruled out. Listed here so they don't recirculate in future reviews.

1. **`auth/middleware.go:40` "missing email-claim validation"** — The unique identity is `AuthUserID`, parsed and validated as a UUID at line 41–45 (rejection on parse failure). `email` is informational and used downstream for display/audit. Empty email is not a security bypass; downstream domain code reads it from `AuthClaims` knowing it may be empty. Adding a hard-fail-on-empty-email check would reject valid Supabase tokens that omit email (e.g., phone-auth flows once those land). Not a defect.

2. **`lib/api/client.ts:14–20` "RPC sent without auth header"** — When `data.session` is null, the client sends without an `Authorization` header. The backend returns `Code.Unauthenticated`, which the layout (`(app)/layout.tsx`) translates into a redirect to `/sign-in`. This is the intended flow — fail-fast at the client would duplicate logic that already lives at the layout boundary. Stylistic preference, not a bug.

3. **`adapters/hermes/entrypoint.sh:128–162` "signal handling race"** — The agent claimed the trap is "synchronous" and SIGTERM during `wait` would not invoke `forward_term`. **Wrong.** POSIX shell traps interrupt blocking `wait` calls; the script's own line-152 comment documents this explicitly: "The trap fires asynchronously if SIGTERM arrives mid-wait; afterward we still fall through to the kill+wait teardown so the sidecar can drain." The implementation is correct.

4. **`tangle-web-scene.tsx:140` "Float32Array recreated every frame"** — The agent mis-read `useMemo(() => new Float32Array(...), [edges.length])` as having an empty deps array. The deps are `[edges.length]`; the buffer is created once per edge-count change and mutated in place via `attr.needsUpdate = true`, which is the standard R3F pattern. R3F's auto-disposal on `<Canvas>` unmount handles geometry cleanup. No leak.

5. **`frontend/src/components/spawn/wizard.tsx:260` "router.push race on unmount"** — Next.js handles unmount during route transitions; `router.push` doesn't return a promise that needs awaiting in this pattern. The "user navigates back during 200ms transition" scenario is not a state-corruption bug — the Wizard's local state is already detached from the new route's tree.

6. **`auth/jwks.go` "unknown-kid rate-limiting not configured"** — The `MicahParks/keyfunc/v3` library handles this internally with its default refresh + backoff policy. Not a defect; the agent flagged absence of *explicit* configuration but the defaults are correct for this use case.

7. **`fly.go:501` lease release "should retry"** — The 30-second TTL on the Fly side is the safety net for failed releases; lease state is bounded. Adding retry logic in the release closure adds complexity for a problem the protocol already handles. Logging on failure is the correct response.

---

## 7. Recommended action order

1. ~~**Fix `BulkUpdateDeployConfig` `Wait()` discard** (§2.1) — 2-line change + 1 test.~~ **Done.**
2. **Split `wizard.tsx`** (§3.3) — biggest single maintainability win. Unblocks all future spawn-flow work.
3. **Split `fly.go`** (§3.1) — second-biggest maintainability win. Each phase already maps to one of the proposed seams; doing this now sets up Phase 6 (Hermes-readiness) and the v1.5 second-target story.
4. **Extract `form-inputs/`** (§3.5) — single coherent change, eliminates 200+ LOC of near-duplicate code between bulk and standard config forms.
5. **Split `service.go` + `fleet.go`** (§3.2) — lower urgency than the above; do when starting M-chat Phase 4 (`ChatWithAgent`) to keep that work from inflating service.go further.
6. **Split `deployment-inspector.tsx`** (§3.4) — concentrate destructive-confirm logic in one file. Lower urgency.

Items 1–4 are roughly 2–3 days of focused work and resolve every actionable finding from this assessment. Items 5–6 are opportunistic — fold into the next adjacent feature change.

---

## Appendix — assessment methodology

- Four parallel Explore agents, each given a slice of the repo with a target word budget of 1500–2500 words.
- Every BLOCKER claim from the agent reports was spot-checked against the source before inclusion. Seven were rejected (§6).
- Architecture rule compliance was verified by direct grep + spot-reads on cross-package boundaries, not inferred from agent reports.
- LOC counts measured via `wc -l`, excluding `*/gen/`, `*/db/*.sql.go`, `*/db/models.go`, `*/db/querier.go`, `*/db/copyfrom.go`, `node_modules/`, `.next/`.

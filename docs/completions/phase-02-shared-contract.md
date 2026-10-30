# Phase 2: Shared contract (schema, catalog, codegen, validation)

**Date:** 2026-10-29. **Branch:** `feat/vision-implementation`. **Changelog:** 0.15.2. **Roadmap:** [`../executing/roadmap.md`](../executing/roadmap.md) Phase 2.

## Summary

The one-schema-two-languages contract from VISION.md 5.1 to 5.5 exists and is enforced. `shared/schema/` holds JSON Schemas for the UI spec, the incremental ops, the server-to-client events, the HTTP API bodies and the catalog shape; `shared/catalog/catalog.json` is the v1 component catalog (15 components). One script generates Go and TypeScript types, both committed, both drift-tested. Each language has a schema validator, a catalog-aware op validator, a whole-spec validator and a reducer, and 41 shared fixtures (reducer goldens, valid sequences, invalid ops, reducer errors, invalid specs) pass identically in Go and TypeScript.

## What was built

### `shared/`

- `schema/ui-spec.schema.json`: `UISpec {spec_version, root, nodes, data, actions}`, `Node {type, props, slots, actions, ttl_ms, pinned}`, `Binding {bind}`, `BindPath`, `ActionRef {id, label, hotkey}`, `Action {kind, tool, args, target, message, risk}` with per-kind required fields.
- `schema/ops.schema.json`: `add_node`, `set_props`, `set_slot`, `set_data` (merge or path write), `set_action`, `remove_node`, `set_root`, `clear {all}`, `done`.
- `schema/events.schema.json`: `session` snapshot (spec, pending proposals, capabilities, transcript), `state`, `turn_started`, `text_delta`, `spec_op`, `speech`, `proposal`, `tool_call`, `tool_result`, `turn_done`, `error`, `proactive`, `heartbeat`; all carry `seq` and `ts`.
- `schema/api.schema.json`: `TurnRequest`, `TurnResponse`, `CancelRequest`, `ConfirmRequest`, `ActionRequest`, `ErrorResponse`.
- `schema/catalog.schema.json`: the shape of a catalog entry (description, category, fit, props schema, bindable, slots with `accepts`/`max`, actions, tags, example).
- `schema/REDUCER.md`: the normative semantics both reducers implement, with error codes.
- `schema/fixtures/`: `reducer/*.json` + `*.golden.json` (10), `valid/` (5), `invalid/` (14), `reducer-errors/` (3), `invalid-spec/` (8).
- `catalog/catalog.json`: layout `Stack`, `Grid`, `Split`, `Overlay`; content `Card`, `Markdown`, `Stat`, `List`, `Table`, `Chart`, `Timeline`, `Image`, `Map`; action `Confirm`; status `Status`.

### Codegen

- `scripts/contracts-generate.sh`: go-jsonschema (v0.20, `--only-models`) into `backend/internal/contract/gen/`, byte copies into `backend/internal/contract/embed/`, json-schema-to-typescript via `scripts/gen-ts-types.mjs` into `client/src/contract/gen/`. Root script `pnpm contracts:generate`.
- Drift tests: Go `TestEmbeddedCopiesMatchShared` and `TestGeneratedGoIsFresh`; TS `drift.test.ts`.

### Backend

- `internal/contract`: `Load()` compiles every schema (santhosh-tekuri/jsonschema v6, draft 2020-12, formats asserted) and the catalog, validates the catalog against its schema, compiles one props validator per component. `ValidateSpec/Op/Event/API`, `ValidateProps(component, props, bound)` (bound keys removed, `required` failures naming only bound keys ignored), `DecodeOp` into the generated structs, `OpName`.
- `internal/uispec`: `ParsePath`, `Resolve`, `SetPath`, `IsBinding`, `ResolveProps`; `New`, `Apply`, `Clone`, `Canonical`; `Validator.CheckOp` (pre-apply, catalog-aware) and `Validator.CheckSpec` (dangling refs, slot types, budget 64 nodes / depth 8, unresolved bindings, resolved props, cycles). Fixture-driven tests plus unit tests for paths.

### Client

- `src/contract/schemas.ts` imports the shared JSON directly (no copy). `registry.ts` (Ajv 2020 + formats, same validator surface and the same bound-prop rule), `path.ts`, `reducer.ts` (pure, structural sharing, `canonical`/`stableStringify`), `validate.ts` (`checkOp`, `checkSpec`), `index.ts` re-exports. Tests: `fixtures.test.ts` over the same fixtures via `import.meta.glob`, `path.test.ts`, `drift.test.ts`.

## Design decisions

- **JSON Schema, not protobuf.** As the roadmap default and because `buf` is unavailable; the recursive, per-component-typed spec fits JSON Schema naturally.
- **Flat node map, dangling refs allowed per op, caught at `done`.** Streaming needs parents before children. `CheckOp` only checks children that already exist; `CheckSpec` runs when the stream ends.
- **Bound props validate lazily.** A `{bind}` prop is removed before schema validation and `required` is relaxed for it; at `done`, props are resolved against `data` and validated for real.
- **`clear` keeps data and actions unless `all`.** A follow-up turn can rebuild a tree over data already on the client. `pinned` is a hint for the decision layer, not reducer behaviour (REDUCER.md).
- **Reducer in Go mutates, in TS returns new objects.** Each idiomatic for its consumer (server state vs React state); the goldens prove equivalence.
- **Catalog props schemas compiled standalone.** Each component's `props` is a self-contained JSON Schema, so the model-facing description (Phase 4) and both validators use the same object.
- **Generator quirks absorbed in the schema, not in code.** `const` values carry an explicit `type`; `default: {}` was removed from map-typed props (go-jsonschema emitted invalid Go); the API schema has an indexing root object so json-schema-to-typescript emits every definition; `Binding` is a documented hand-written structural type in `path.ts` because `Binding | literal` folds to `unknown`.
- **Image `src` pattern is `^https://\S+$` with `maxLength`.** Go's regexp rejects repeat counts above 1000.
- **pnpm/vitest read `shared/` straight from disk.** Only Go needs copies (`go:embed` cannot leave the module), hence the embed directory and its drift test.

## Files changed

Added: `shared/schema/*`, `shared/catalog/catalog.json`, `scripts/contracts-generate.sh`, `scripts/gen-ts-types.mjs`, `backend/internal/contract/{registry.go,ops.go,*_test.go,gen/*,embed/*}`, `backend/internal/uispec/{path.go,reducer.go,validate.go,*_test.go}`, `client/src/contract/{schemas,registry,path,reducer,validate,index}.ts`, `client/src/contract/gen/*`, `client/src/contract/*.test.ts`. Edited: `backend/go.mod`, `backend/go.sum`, `client/package.json` (ajv, ajv-formats, json-schema-to-typescript), `package.json`, `pnpm-lock.yaml`, `docs/changelog.md`, roadmap progress.

## How to run

```bash
pnpm contracts:generate       # after any change under shared/
cd backend && go test ./internal/contract/... ./internal/uispec/...
cd backend && go test ./internal/uispec -update   # rewrite reducer goldens from the Go reducer
pnpm -C client test
```

## How to test

Verified: Go 5 packages green (contract: 6 tests, uispec: 5 fixture suites + path tests); client 65 tests green including 41 shared-fixture cases and the codegen drift test; `pnpm type-check`, `pnpm lint`, `pnpm build` green; `./scripts/contracts-generate.sh && git diff --exit-code` clean.

## Known gaps

- No `slot_type_not_allowed` fixture: every v1 slot accepts `*`. The code path exists in both languages and is unit-tested only indirectly.
- `TestGeneratedGoIsFresh` skips when go-jsonschema is not installed; the embedded-copy test still catches schema drift.
- The catalog is not yet served to the client or described to a model (Phase 4), and nothing renders yet.
- Ajv runs with `strict: false` because the schemas use `default` and union types the strict mode flags; the Go library validates the schemas against the 2020-12 metaschema, which covers correctness.

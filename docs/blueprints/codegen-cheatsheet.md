# Contract codegen cheatsheet

Source of truth: `shared/schema/*.schema.json` (UI spec, ops, events, API, catalog shape) and `shared/catalog/catalog.json` (the components).

```bash
pnpm contracts:generate          # = scripts/contracts-generate.sh
```

| Output | Generator | Notes |
|---|---|---|
| `backend/internal/contract/gen/*.go` | go-jsonschema (`--only-models`) | Types only; runtime validation uses the schemas themselves |
| `backend/internal/contract/embed/*.json` | byte copies | `go:embed` cannot leave the module; drift-tested |
| `client/src/contract/gen/*.ts` | json-schema-to-typescript | Vite imports `shared/` JSON directly for validation; only the types are generated |

Checks: `go test ./internal/contract` (embedded copies and Go output fresh), `pnpm -C client test` (`drift.test.ts`). Reducer semantics live in `shared/schema/REDUCER.md`; goldens are written by `go test ./internal/uispec -update` and verified by the TS reducer against the same fixtures.

Generator quirks absorbed in the schemas: every `const` carries a `type`; map-typed props have no `default: {}`; `api.schema.json` has an indexing root object so every definition is emitted; `Binding` is a documented hand-written type in `client/src/contract/path.ts`.

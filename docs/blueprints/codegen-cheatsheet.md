# Codegen Cheatsheet

Where types come from, what generates them, and where to edit first.

---

## Two codegen pipelines

### 1. Proto → Go + TS (wire types, crosses FE↔BE)

**Command:** `pnpm proto:generate` (from repo root)

| Input | Output | Contains |
|---|---|---|
| `shared/proto/corellia/v1/*.proto` | `backend/internal/gen/corellia/v1/*.pb.go` | Go message structs (`corelliav1.User`) |
| | `backend/internal/gen/corellia/v1/corelliav1connect/*.connect.go` | Go Connect handler interfaces |
| | `frontend/src/gen/corellia/v1/*_pb.ts` | TS types + service descriptor |

### 2. SQL → Go (DB types, backend only)

**Command:** `sqlc generate` (from `backend/`)

| Input | Output | Contains |
|---|---|---|
| `backend/migrations/*.sql` (schema) | `backend/internal/db/models.go` | One struct per table (the row shape) |
| `backend/queries/*.sql` (queries) | `backend/internal/db/<name>.sql.go` | Query functions + param structs |
| all queries | `backend/internal/db/querier.go` | Interface listing all queries (unused) |
| sqlc framework | `backend/internal/db/db.go` | `Queries` struct + `New(pool)` |

**Never hand-edit generated files.** Only `backend/internal/db/pool.go` is hand-written.

---

## Where types meet

```
Wire types (proto)              Row types (sqlc)
   │                                │
   └──────┐                  ┌──────┘
          ▼                  ▼
   backend/internal/<domain>/service.go   ← YOU WRITE
        (domain package, one per bounded concept)
          │
          ▼
   backend/internal/httpsrv/<domain>_handler.go ← YOU WRITE
        (thin Connect glue, <30 lines)
```

The domain service is the **only** place that imports both `db.*` and `corelliav1.*`. It maps between them explicitly — that's the firewall that keeps DB-internal fields off the wire.

---

## Entry-point matrix — "I want to X, I start by editing Y"

| Goal | Edit first | Run | Auto-updates |
|---|---|---|---|
| Add/alter a column | `backend/migrations/<new>.sql` (via `goose create`) | `goose up` + `sqlc generate` | `db/models.go` |
| Add/modify a SQL query | `backend/queries/<name>.sql` | `sqlc generate` | `db/<name>.sql.go`, `db/querier.go` |
| Add a new wire field | `shared/proto/corellia/v1/<name>.proto` | `pnpm proto:generate` | `backend/internal/gen/**`, `frontend/src/gen/**` |
| Add a new RPC | same proto file (add `rpc` to service) | `pnpm proto:generate` | same, plus new interface method to implement |
| Add business logic / policy | `backend/internal/<domain>/service.go` | — | nothing (you wrote the final code) |
| Wire an RPC to a service method | `backend/internal/httpsrv/<domain>_handler.go` + `httpsrv/server.go` | — | nothing |
| Call an RPC from the frontend | `frontend/src/lib/api/client.ts` (add service) + UI component | — | nothing |

---

## New domain end-to-end (example: `agents`)

Do these in order; each step is unblocked by the previous.

1. **Schema** — `goose create add_agent_instances sql` → write SQL → `goose up`.
2. **Queries** — `backend/queries/agents.sql` → `sqlc generate`.
3. **Proto** — `shared/proto/corellia/v1/agents.proto` (service + messages) → `pnpm proto:generate`.
4. **Domain** — `backend/internal/agents/service.go` (`package agents`, `Service` struct, methods mapping `db.*` → `corelliav1.*`).
5. **Handler** — `backend/internal/httpsrv/agents_handler.go` (thin wrapper).
6. **Mount** — add `r.Mount(corelliav1connect.NewAgentsServiceHandler(...))` in `httpsrv/server.go`.
7. **Frontend** — add `agents: createConnectClient(AgentsService, transport)` in `frontend/src/lib/api/client.ts`; call from a React component.

One package per domain. Do not consolidate into a single `domain/` folder — Go packages are the encapsulation seam.

---

## Quick rules

- **Wire type ≠ DB type**, even when fields look identical. `db.User` has `AuthUserID`/`CreatedAt`; `corelliav1.User` doesn't. The mapping step is intentional — skip a field to keep it private.
- **Field numbers in proto are forever.** Once shipped, never change or reuse a number; mark retired ones `reserved`. Breaking changes go to `v2`, never silent edits to `v1`.
- **Generated code is committed.** CI runs both codegen commands and fails on drift (`git diff --exit-code`).
- **`DATABASE_URL` is Direct Connection.** `pgxpool` is the transaction pooler — in-process, per-query checkout. Session Pooler (`*.pooler.supabase.com:5432`) is the IPv4 fallback only. **Never Transaction Pooler** (`:6543`) — breaks pgx's prepared-statement cache.
- **Business logic never in handlers.** If a Connect handler is >30 lines, move the logic into the domain service.

---

## File pointers (for ctrl-click navigation)

- Proto input: [shared/proto/corellia/v1/users.proto](../../shared/proto/corellia/v1/users.proto)
- Generated Go wire: [backend/internal/gen/corellia/v1/users.pb.go](../../backend/internal/gen/corellia/v1/users.pb.go)
- Generated TS wire: [frontend/src/gen/corellia/v1/users_pb.ts](../../frontend/src/gen/corellia/v1/users_pb.ts)
- SQL migration: [backend/migrations/](../../backend/migrations/)
- SQL queries: [backend/queries/users.sql](../../backend/queries/users.sql)
- Generated row types: [backend/internal/db/models.go](../../backend/internal/db/models.go)
- Generated query funcs: [backend/internal/db/users.sql.go](../../backend/internal/db/users.sql.go)
- Domain service (example): [backend/internal/users/service.go](../../backend/internal/users/service.go)
- Connect handler (example): [backend/internal/httpsrv/users_handler.go](../../backend/internal/httpsrv/users_handler.go)
- FE API client: [frontend/src/lib/api/client.ts](../../frontend/src/lib/api/client.ts)

---

## Related canonical docs (for *why*, not *how*)

- `docs/archive/blueprint.md` §9 — full data model
- `docs/archive/blueprint.md` §11 — architecture rules (blocking)
- `docs/stack.md` §3 — why proto + Connect-go
- `docs/stack.md` §6 — data model ↔ Supabase, two-URL DB strategy
- `docs/stack.md` §11 — implementation rules (blocking)
- `docs/changelog.md` 0.1.0 — backend scaffolding decisions
- (frontend scaffolding notes were removed from the tree; see git history)

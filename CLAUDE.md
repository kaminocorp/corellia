# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this repo is

Corellia is a personal agent workspace: an always-on office screen showing a 3D agent that Phil talks to by keyboard and voice, answering with speech and with UI assembled from a closed component catalog. Read [`docs/VISION.md`](docs/VISION.md) first, then the implementation plan [`docs/executing/roadmap.md`](docs/executing/roadmap.md). Each finished phase has notes in `docs/completions/` and an entry in `docs/changelog.md`.

The previous product (a control plane for agent fleets) was removed from the tree on the `feat/vision-implementation` branch in Phase 1. Its docs live under `docs/archive/`; its code is in git history before commit "phase 1". Do not reintroduce it.

**Live code is authoritative.** When a doc conflicts with the code, the code wins; fix the doc.

## Layout

```
corellia/
├── backend/          Go 1.26 service: API + SSE event stream + serves the built client (one binary)
│   ├── cmd/api/      entrypoint
│   └── internal/     config, auth (device token), httpsrv (Chi router, static), domain packages per phase
├── client/           Vite + React 19 + TypeScript + React Three Fiber static client (browser on macOS, Chromium kiosk on the box)
├── shared/           language-neutral contracts only: JSON Schemas + component catalog (from Phase 2)
├── adapters/hermes/  legacy Hermes adapter image; target of the hermes AgentRuntime (Phase 7)
├── box/              display-box provisioning (Phase 10)
└── docs/             VISION.md, executing/roadmap.md, completions/, changelog.md, archive/
```

Go module path: `github.com/hejijunhao/corellia/backend`.

## Rules (treated as defects when broken)

1. `AgentRuntime` (`backend/internal/runtime`) is the only seam to any model, harness or agent framework. Provider SDKs and wire formats stay inside `internal/runtime/<impl>/`.
2. The client renders only what validates against the catalog; the server validates every spec op before forwarding. Nothing of the model's choosing reaches the DOM except typed props the catalog declares.
3. One schema, two languages: `shared/schema` and `shared/catalog` are the source; generated Go and TS are committed and never hand-edited; drift tests fail the build.
4. All env vars are read in `backend/internal/config`. The client reads runtime values from `/api/config`.
5. Side effects go through propose then confirm. Tools that mutate anything outside Corellia's own store are `requiresConfirm`.
6. No pointer paths. Every action is reachable by keyboard or voice.
7. Deferred features are real interface implementations returning `NotImplemented`, never fake UI.
8. No Mission or OpenWorld code is read or copied.
9. Handlers in `httpsrv` stay thin: parse, call a domain package, write the response.

## Commands

```bash
# Backend (from backend/)
go vet ./... && go test ./...
go build -o bin/api ./cmd/api && ./bin/api      # serves ../client/dist on :8080
air                                             # hot reload

# Client (from repo root)
pnpm install
pnpm -C client dev                              # Vite on :5173, proxies /api and /healthz to :8080
pnpm -C client type-check && pnpm -C client lint && pnpm -C client test && pnpm -C client build

# Everything
pnpm check
overmind start                                  # Procfile: client dev server + backend with air
```

## Conventions

- Go: table-driven tests colocated as `<file>_test.go`; domain packages accept narrow interfaces so tests need no network or services. Format with `$(go env GOROOT)/bin/gofmt -w .` (gofmt is not on PATH here).
- Client: vitest + Testing Library for logic and components; no E2E.
- Environment: `backend/.env` (gitignored), template in `.env.example`. No API keys are required for development; cloud runtimes and voice providers activate when their keys are set.
- Git: all work on `feat/vision-implementation`; never push to master, never merge, never open PRs, never deploy.
- Docs: every phase ends with `docs/completions/phase-NN-<name>.md`, a `docs/changelog.md` entry (index line plus dated section, latest first) and an update to the roadmap's progress table.

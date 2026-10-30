# Toolchain overview

| Tool | Used for | Install |
|---|---|---|
| Go 1.26 | backend | https://go.dev/dl |
| Node 24 + pnpm 12 (corepack) | client, contract codegen | `corepack enable` |
| air | backend hot reload | `go install github.com/air-verse/air@latest` |
| overmind | run client + backend together (`Procfile`) | `brew install overmind` |
| go-jsonschema | Go types from `shared/schema` (installed by `scripts/contracts-generate.sh`) | `go install github.com/atombender/go-jsonschema@v0.20.0` |
| json-schema-to-typescript, Ajv | TS types and runtime validation (client devDependencies) | `pnpm install` |
| Docker (optional) | `backend/Dockerfile` image | |

No database, no protobuf toolchain, no cloud CLI is required. Credentials (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) are optional and switch on the cloud runtime and voice providers.

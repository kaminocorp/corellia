#!/usr/bin/env bash
# Regenerates everything derived from shared/schema and shared/catalog:
#   - Go types            backend/internal/contract/gen/*.go      (go-jsonschema)
#   - Go embedded copies  backend/internal/contract/embed/*.json  (byte copies)
#   - TS types            client/src/contract/gen/*.ts            (json-schema-to-typescript)
#   - TS validators       client/src/contract/gen/validators.js    (Ajv standalone, no eval at runtime)
# Run from anywhere. Commit the output; drift tests in both languages fail
# when the output is stale.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCHEMA="$ROOT/shared/schema"
CATALOG="$ROOT/shared/catalog"
GO_GEN="$ROOT/backend/internal/contract/gen"
GO_EMBED="$ROOT/backend/internal/contract/embed"
TS_GEN="$ROOT/client/src/contract/gen"

# The Go generator runs at a pinned version through `go run` so every
# machine (and CI) produces the same code; a locally installed binary of
# another version used to make the committed types drift (review
# 2026-10-30, item 7). GO_JSONSCHEMA overrides the command for experiments.
GO_JSONSCHEMA_VERSION="v0.24.1"
GOJS="${GO_JSONSCHEMA:-go run github.com/atombender/go-jsonschema@$GO_JSONSCHEMA_VERSION}"

mkdir -p "$GO_GEN" "$GO_EMBED" "$TS_GEN"

# --- Go types ---------------------------------------------------------------
(
  cd "$SCHEMA"
  $GOJS -p gen --only-models --tags json --capitalization ID --capitalization URL \
    --schema-root-type https://corellia.dev/schema/ui-spec.schema.json=UISpec \
    --schema-root-type https://corellia.dev/schema/ops.schema.json=SpecOp \
    --schema-root-type https://corellia.dev/schema/events.schema.json=SessionEvent \
    --schema-root-type https://corellia.dev/schema/api.schema.json=API \
    --schema-root-type https://corellia.dev/schema/catalog.schema.json=Catalog \
    --schema-output https://corellia.dev/schema/ui-spec.schema.json="$GO_GEN/uispec.go" \
    --schema-output https://corellia.dev/schema/ops.schema.json="$GO_GEN/ops.go" \
    --schema-output https://corellia.dev/schema/events.schema.json="$GO_GEN/events.go" \
    --schema-output https://corellia.dev/schema/api.schema.json="$GO_GEN/api.go" \
    --schema-output https://corellia.dev/schema/catalog.schema.json="$GO_GEN/catalog.go" \
    ui-spec.schema.json ops.schema.json events.schema.json api.schema.json catalog.schema.json
)
"$(go env GOROOT)/bin/gofmt" -w "$GO_GEN"

# --- Go embedded copies -----------------------------------------------------
cp "$SCHEMA"/*.schema.json "$GO_EMBED/"
cp "$CATALOG/catalog.json" "$GO_EMBED/catalog.json"

# --- TS types ---------------------------------------------------------------
node "$ROOT/scripts/gen-ts-types.mjs" "$SCHEMA" "$TS_GEN"

# --- TS precompiled validators ---------------------------------------------
node "$ROOT/scripts/gen-validators.mjs" "$ROOT/shared" "$TS_GEN/validators.js"

echo "contracts generated"

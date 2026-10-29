#!/usr/bin/env bash
# Live check of the Anthropic runtime, then the VISION 7 spike against it.
# Needs ANTHROPIC_API_KEY (in the environment or backend/.env). Nothing here
# touches the display box or the running server.
#
#   scripts/anthropic-live-check.sh              # check + spike report
#   scripts/anthropic-live-check.sh --check-only # just the pass/fail table
#
# Outputs:
#   - a pass/fail table on stdout (exit 1 on any failed check, 2 on config)
#   - docs/executing/spikes/anthropic-<date>.md (the spike report; commit it)
#
# If every check fails the same way, the table's diagnosis line names the
# setting to change (ANTHROPIC_API_KEY, CORELLIA_MODEL,
# CORELLIA_ANTHROPIC_FALLBACKS=false, CORELLIA_EFFORT).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/backend"

if [ -z "${ANTHROPIC_API_KEY:-}" ] && ! grep -qs '^ANTHROPIC_API_KEY=.\+' .env; then
  echo "anthropic-live-check: ANTHROPIC_API_KEY is not set (environment or backend/.env)" >&2
  exit 2
fi

export CORELLIA_RUNTIME=anthropic
export CORELLIA_DATA_DIR="${CORELLIA_DATA_DIR:-$(mktemp -d)}"

echo "== runtime-check (anthropic) =="
go run ./cmd/runtime-check -runtime anthropic

if [ "${1:-}" = "--check-only" ]; then
  exit 0
fi

echo
echo "== runtime-spike (anthropic) =="
go run ./cmd/runtime-spike -runtime anthropic -out "$ROOT/docs/executing/spikes"
echo
echo "Live Go test (same turn inside go test):"
echo "  cd backend && CORELLIA_LIVE=1 go test ./internal/runtime/anthropic -run TestLiveAnthropic -v"

#!/usr/bin/env bash
# Real-browser smoke test: builds the client and the backend, then runs the
# Playwright suite in client/e2e against the Go server serving the bundle.
# Fails on any console error (a CSP violation, a React loop, a bad op).
#
#   pnpm e2e                      # everything
#   pnpm e2e -- --headed          # extra args go to playwright
#
# First run on a machine without Playwright's Chromium:
#   pnpm -C client exec playwright install chromium-headless-shell
# On Linux without sudo, scripts/chromium-libs.sh fetches the system
# libraries Chromium needs; it runs automatically here.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ "${E2E_SKIP_BUILD:-}" != "1" ]; then
  pnpm -C client build >/dev/null
  (cd backend && go build -o bin/api ./cmd/api)
fi

ENV_SCRIPT="$(scripts/chromium-libs.sh)" || true
if [ -n "$ENV_SCRIPT" ]; then
  eval "$ENV_SCRIPT"
fi

cd client
exec pnpm exec playwright test "$@"

#!/usr/bin/env bash
# Builds what the display box's backend service expects, on the development
# machine (the Mac): the Linux amd64 binary and the built client, into one
# directory to copy over.
#   ./box/release.sh [out-dir]          # default: box/release
#   scp -r box/release box:/tmp/corellia-release
#   sudo ./provision.sh --backend http://127.0.0.1:8080 --with-backend --release /tmp/corellia-release
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${1:-$HERE/box/release}"
VERSION="$(git -C "$HERE" describe --tags --always --dirty 2>/dev/null || echo dev)"
COMMIT="$(git -C "$HERE" rev-parse --short HEAD 2>/dev/null || echo unknown)"
mkdir -p "$OUT"
echo "== client"
pnpm -C "$HERE/client" build
rm -rf "$OUT/client"
cp -R "$HERE/client/dist" "$OUT/client"
echo "== backend (linux/amd64)"
(cd "$HERE/backend" && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
  -ldflags "-X main.version=${VERSION} -X main.commit=${COMMIT}" \
  -o "$OUT/api" ./cmd/api)
echo "== done: $OUT/api, $OUT/client/ (version $VERSION, commit $COMMIT)"

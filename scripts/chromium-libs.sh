#!/usr/bin/env bash
# Makes Playwright's cached Chromium runnable on a Debian/Ubuntu machine
# where its shared libraries are missing and sudo is not available (a dev
# container, a locked-down box). It downloads the packages with
# `apt-get download` (no root needed), extracts them under
# client/.chromium-libs/ and prints the environment to export. On a machine
# with sudo, `pnpm -C client exec playwright install-deps chromium` is the
# supported route and this script does nothing.
#
#   eval "$(scripts/chromium-libs.sh)"   # then run pnpm e2e
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LIBS="$ROOT/client/.chromium-libs"
CACHE="${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}"

if [ "$(uname -s)" != "Linux" ]; then
  exit 0
fi
BIN="$(find "$CACHE" -path '*chromium_headless_shell-*' -name chrome-headless-shell -type f 2>/dev/null | sort | tail -1 || true)"
if [ -z "$BIN" ]; then
  echo "# no cached Playwright Chromium; run: pnpm -C client exec playwright install chromium-headless-shell" >&2
  exit 0
fi

missing() {
  LD_LIBRARY_PATH="$LIBS/usr/lib/x86_64-linux-gnu:$LIBS/lib/x86_64-linux-gnu${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}" ldd "$BIN" 2>/dev/null | awk '/not found/ {print $1}'
}

if [ -n "$(missing)" ] || [ ! -d "$LIBS/etc/fonts" ]; then
  if ! command -v apt-get >/dev/null || ! command -v dpkg-deb >/dev/null; then
    echo "# Chromium libraries are missing and apt-get/dpkg-deb are not available; install them with playwright install-deps" >&2
    exit 0
  fi
  # Everything chrome-headless-shell links against on Debian 13 plus their
  # dependencies, and a fontconfig configuration so text renders.
  PKGS="libatk1.0-0t64 libatk-bridge2.0-0t64 libatspi2.0-0t64 libx11-6 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 libxi6 libxrender1 libxau6 libxdmcp6 libxcb1 libxkbcommon0 libgbm1 libdrm2 libwayland-server0 libasound2t64 libdbus-1-3 libglib2.0-0t64 fontconfig-config fonts-dejavu-core"
  TMP="$(mktemp -d "$LIBS.XXXXXX")"
  trap 'rm -rf "$TMP"' EXIT
  mkdir -p "$LIBS"
  (cd "$TMP" && apt-get download $PKGS >&2 && for d in *.deb; do dpkg-deb -x "$d" "$LIBS"; done)
  # fontconfig-config ships fonts.conf under /etc; point fontconfig at the extracted tree.
  if [ -d "$LIBS/usr/share/fontconfig/conf.avail" ] && [ -d "$LIBS/etc/fonts" ]; then
    mkdir -p "$LIBS/etc/fonts/conf.d"
  fi
  if [ -n "$(missing)" ]; then
    echo "# still missing after download: $(missing | tr '\n' ' ')" >&2
    exit 1
  fi
fi

echo "export LD_LIBRARY_PATH=\"$LIBS/usr/lib/x86_64-linux-gnu:$LIBS/lib/x86_64-linux-gnu\${LD_LIBRARY_PATH:+:\$LD_LIBRARY_PATH}\""
if [ -f "$LIBS/etc/fonts/fonts.conf" ]; then
  echo "export FONTCONFIG_FILE=\"$LIBS/etc/fonts/fonts.conf\""
  echo "export FONTCONFIG_PATH=\"$LIBS/etc/fonts\""
  echo "export XDG_DATA_DIRS=\"$LIBS/usr/share\${XDG_DATA_DIRS:+:\$XDG_DATA_DIRS}\""
fi

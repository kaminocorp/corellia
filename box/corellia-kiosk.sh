#!/usr/bin/env bash
# Runs Chromium in kiosk mode against the Corellia backend; restarts it if
# it exits. Reads /etc/corellia/box.env (CORELLIA_BOX_ENV overrides the path;
# a missing file is fine when the variables are already in the environment).
# CORELLIA_KIOSK_PRINT=1 prints the Chromium command instead of running it
# (box/test.sh).
set -u
BOX_ENV="${CORELLIA_BOX_ENV:-/etc/corellia/box.env}"
# shellcheck disable=SC1090
[ -f "$BOX_ENV" ] && . "$BOX_ENV"
: "${CORELLIA_URL:?CORELLIA_URL is not set}"
URL="${CORELLIA_URL%/}/?${CORELLIA_KIOSK_QUERY:-kiosk=1}"
if [ -n "${CORELLIA_DEVICE_TOKEN:-}" ]; then
  URL="${URL}&token=${CORELLIA_DEVICE_TOKEN}"
fi
PROFILE="${HOME}/.corellia-chromium"

# Browsers give a page the microphone only in a secure context: HTTPS, or
# plain http on localhost. A backend reached as http://192.168.x.y:8080
# would have no voice. Chromium can treat one named origin as secure; the
# flag applies per profile, which --user-data-dir makes ours. HTTPS (a
# reverse proxy, `tailscale serve`) is the better fix; this keeps a plain
# LAN backend usable (review 2026-10-30 round 4, item 4).
insecure_origin_flag() {
  local url="$1" scheme rest host
  scheme="${url%%://*}"
  [ "$scheme" = "http" ] || return 0
  rest="${url#*://}"
  rest="${rest%%/*}"          # host[:port]
  host="${rest%%:*}"
  case "$host" in
    localhost|127.*|\[::1\]|::1) return 0 ;;
  esac
  printf -- '--unsafely-treat-insecure-origin-as-secure=%s://%s' "$scheme" "$rest"
}

ARGS=(
  --kiosk "$URL"
  --user-data-dir="$PROFILE"
  --no-first-run --no-default-browser-check --disable-infobars
  --disable-session-crashed-bubble --disable-features=TranslateUI
  --autoplay-policy=no-user-gesture-required
  --use-fake-ui-for-media-stream
  --enable-features=VaapiVideoDecoder
  --ignore-gpu-blocklist --enable-gpu-rasterization
  --overscroll-history-navigation=0
  --start-fullscreen --noerrdialogs --disable-pinch
)
flag="$(insecure_origin_flag "$CORELLIA_URL")"
[ -n "$flag" ] && ARGS+=("$flag")

if [ "${CORELLIA_KIOSK_PRINT:-0}" = 1 ]; then
  printf '%s\n' "${ARGS[@]}"
  exit 0
fi

mkdir -p "$PROFILE"
while true; do
  # A crashed session must not show the "restore pages" bar.
  if [ -f "$PROFILE/Default/Preferences" ]; then
    sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/; s/"exited_cleanly":false/"exited_cleanly":true/' "$PROFILE/Default/Preferences" || true
  fi
  chromium "${ARGS[@]}"
  sleep 2
done

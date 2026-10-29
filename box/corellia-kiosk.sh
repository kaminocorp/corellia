#!/usr/bin/env bash
# Runs Chromium in kiosk mode against the Corellia backend; restarts it if
# it exits. Reads /etc/corellia/box.env.
set -u
# shellcheck disable=SC1091
. /etc/corellia/box.env
URL="${CORELLIA_URL%/}/?${CORELLIA_KIOSK_QUERY:-kiosk=1}"
if [ -n "${CORELLIA_DEVICE_TOKEN:-}" ]; then
  URL="${URL}&token=${CORELLIA_DEVICE_TOKEN}"
fi
PROFILE="${HOME}/.corellia-chromium"
mkdir -p "$PROFILE"
# A crashed session must not show the "restore pages" bar.
if [ -f "$PROFILE/Default/Preferences" ]; then
  sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/; s/"exited_cleanly":false/"exited_cleanly":true/' "$PROFILE/Default/Preferences" || true
fi
while true; do
  chromium \
    --kiosk "$URL" \
    --user-data-dir="$PROFILE" \
    --no-first-run --no-default-browser-check --disable-infobars \
    --disable-session-crashed-bubble --disable-features=TranslateUI \
    --autoplay-policy=no-user-gesture-required \
    --use-fake-ui-for-media-stream \
    --enable-features=VaapiVideoDecoder \
    --ignore-gpu-blocklist --enable-gpu-rasterization \
    --overscroll-history-navigation=0 \
    --start-fullscreen --noerrdialogs --disable-pinch
  sleep 2
done

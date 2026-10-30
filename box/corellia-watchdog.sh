#!/usr/bin/env bash
# Restarts the kiosk when the kiosk's heartbeat is stale (page hung), when no
# kiosk has checked in for a long time after boot (Chromium sits on its own
# error page, which posts no heartbeat), or when the backend has been
# unreachable for several checks in a row. Runs every 30 s from the timer.
# Only the kiosk's heartbeats count (the page tags them via ?kiosk=1); a
# browser on another machine using the same backend is ignored.
#
# Overridable for box/test.sh: CORELLIA_BOX_ENV (env file), CORELLIA_URL,
# CORELLIA_WATCHDOG_STATE_DIR (default /run), CORELLIA_WATCHDOG_SYSTEMCTL
# (default systemctl).
set -u
BOX_ENV="${CORELLIA_BOX_ENV:-/etc/corellia/box.env}"
# shellcheck disable=SC1090
[ -f "$BOX_ENV" ] && . "$BOX_ENV"
: "${CORELLIA_URL:?CORELLIA_URL is not set}"
STATE_DIR="${CORELLIA_WATCHDOG_STATE_DIR:-/run}"
SYSTEMCTL="${CORELLIA_WATCHDOG_SYSTEMCTL:-systemctl}"
FAILS="$STATE_DIR/corellia-watchdog.fails"
NOCLIENT="$STATE_DIR/corellia-watchdog.noclient"
# Heartbeat older than this (seconds): the page is hung.
MAX_AGE="${CORELLIA_WATCHDOG_MAX_AGE:-90}"
# Backend unreachable this many checks in a row: restart the kiosk (it may
# be showing a stale page; a fresh load reconnects).
MAX_FAILS="${CORELLIA_WATCHDOG_MAX_FAILS:-5}"
# No client has ever checked in, this many checks in a row (10 × 30 s =
# 5 min): Chromium loaded before the backend answered and is showing its
# error page, which has no Corellia code to post a heartbeat (review
# 2026-10-30 round 4). The timer's OnBootSec already gives the first boot
# two minutes before the first check.
MAX_NOCLIENT="${CORELLIA_WATCHDOG_MAX_NOCLIENT:-10}"

restart_kiosk() {
  echo "$1; restarting kiosk"
  "$SYSTEMCTL" restart corellia-kiosk.service
  echo 0 > "$FAILS"
  echo 0 > "$NOCLIENT"
}

fails=$(cat "$FAILS" 2>/dev/null || echo 0)
body=$(curl -fsS --max-time 5 "${CORELLIA_URL%/}/healthz" 2>/dev/null) || body=""
if [ -z "$body" ]; then
  fails=$((fails + 1))
  echo "$fails" > "$FAILS"
  if [ "$fails" -ge "$MAX_FAILS" ]; then
    restart_kiosk "backend unreachable ${fails}x"
  fi
  exit 0
fi
echo 0 > "$FAILS"
# The kiosk's own age when the backend reports one (phase 17): a Mac tab on
# the same backend posts heartbeats too, and its age must not stand in for
# a hung kiosk (review 2026-10-30 round 5). Older backends only have the
# generic age.
age=$(echo "$body" | jq -r 'if has("kiosk_heartbeat_age_s") then .kiosk_heartbeat_age_s else (.client_heartbeat_age_s // -1) end')
if [ "$age" = "-1" ]; then
  # No client has checked in since the backend started.
  noclient=$(cat "$NOCLIENT" 2>/dev/null || echo 0)
  noclient=$((noclient + 1))
  echo "$noclient" > "$NOCLIENT"
  if [ "$noclient" -ge "$MAX_NOCLIENT" ]; then
    restart_kiosk "no client has checked in for ${noclient} checks"
  fi
  exit 0
fi
echo 0 > "$NOCLIENT"
if [ "$(printf '%.0f' "$age")" -gt "$MAX_AGE" ]; then
  restart_kiosk "client heartbeat age ${age}s > ${MAX_AGE}s"
fi

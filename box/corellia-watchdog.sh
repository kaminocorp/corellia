#!/usr/bin/env bash
# Restarts the kiosk when the client heartbeat is stale (page hung) or the
# backend has been unreachable for several checks in a row.
set -u
# shellcheck disable=SC1091
. /etc/corellia/box.env
STATE=/run/corellia-watchdog.fails
MAX_AGE="${CORELLIA_WATCHDOG_MAX_AGE:-90}"
MAX_FAILS="${CORELLIA_WATCHDOG_MAX_FAILS:-5}"
fails=$(cat "$STATE" 2>/dev/null || echo 0)
body=$(curl -fsS --max-time 5 "${CORELLIA_URL%/}/healthz" 2>/dev/null) || body=""
if [ -z "$body" ]; then
  fails=$((fails + 1))
  echo "$fails" > "$STATE"
  if [ "$fails" -ge "$MAX_FAILS" ]; then
    echo "backend unreachable ${fails}x; restarting kiosk"
    systemctl restart corellia-kiosk.service
    echo 0 > "$STATE"
  fi
  exit 0
fi
echo 0 > "$STATE"
age=$(echo "$body" | jq -r '.client_heartbeat_age_s // -1')
# -1 means no client has checked in since the backend started: give the
# kiosk time to boot before judging it.
if [ "$age" != "-1" ] && [ "$(printf '%.0f' "$age")" -gt "$MAX_AGE" ]; then
  echo "client heartbeat age ${age}s > ${MAX_AGE}s; restarting kiosk"
  systemctl restart corellia-kiosk.service
fi

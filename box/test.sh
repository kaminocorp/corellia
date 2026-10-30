#!/usr/bin/env bash
# Tests for the box scripts that can run without a box: the kiosk's Chromium
# flags (secure-context handling per backend URL) and the watchdog's restart
# decisions against a fake /healthz. Needs bash, curl, jq and python3; skips
# with a message when one is missing. Run from anywhere: ./box/test.sh
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for tool in curl jq python3; do
  command -v "$tool" >/dev/null 2>&1 || { echo "box/test.sh: $tool not installed; skipping"; exit 0; }
done
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"; [ -n "${SERVER_PID:-}" ] && kill "$SERVER_PID" 2>/dev/null || true' EXIT
fail() { echo "FAIL: $*" >&2; exit 1; }
pass=0

# --- kiosk flags -----------------------------------------------------------
kiosk_flags() {
  CORELLIA_BOX_ENV=/nonexistent CORELLIA_URL="$1" CORELLIA_DEVICE_TOKEN="${2:-}" CORELLIA_KIOSK_PRINT=1 HOME="$TMP" bash "$HERE/corellia-kiosk.sh"
}
out="$(kiosk_flags http://192.168.1.10:8080 tok)"
grep -qx -- '--unsafely-treat-insecure-origin-as-secure=http://192.168.1.10:8080' <<<"$out" || fail "LAN http URL: insecure-origin flag missing:
$out"
grep -qx -- 'http://192.168.1.10:8080/?kiosk=1&token=tok' <<<"$out" || fail "kiosk URL with token missing:
$out"
grep -qx -- '--kiosk' <<<"$out" || fail "--kiosk missing"
grep -qx -- '--autoplay-policy=no-user-gesture-required' <<<"$out" || fail "autoplay flag missing"
pass=$((pass+1))
for url in http://127.0.0.1:8080 http://localhost:8080 https://box.tail1234.ts.net https://corellia.example.com:8443; do
  out="$(kiosk_flags "$url")"
  grep -q -- 'unsafely-treat-insecure-origin' <<<"$out" && fail "$url: insecure-origin flag set on a secure URL"
  grep -qx -- "${url}/?kiosk=1" <<<"$out" || fail "$url: kiosk URL wrong:
$out"
  pass=$((pass+1))
done
out="$(CORELLIA_BOX_ENV=/nonexistent CORELLIA_URL=http://10.0.0.5:8080/ CORELLIA_KIOSK_QUERY='kiosk=1&particles=6000' CORELLIA_KIOSK_PRINT=1 HOME="$TMP" bash "$HERE/corellia-kiosk.sh")"
grep -qx -- 'http://10.0.0.5:8080/?kiosk=1&particles=6000' <<<"$out" || fail "trailing slash / query: $out"
grep -qx -- '--unsafely-treat-insecure-origin-as-secure=http://10.0.0.5:8080' <<<"$out" || fail "origin from a URL with a trailing slash: $out"
pass=$((pass+1))

# --- watchdog ----------------------------------------------------------------
BODY="$TMP/healthz.json"
python3 - "$BODY" "$TMP/port" <<'PY' &
import http.server, socketserver, sys, os
body_path, port_path = sys.argv[1], sys.argv[2]
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            data = open(body_path, "rb").read()
        except FileNotFoundError:
            data = b""
        if not data:
            self.send_response(503); self.end_headers(); return
        self.send_response(200); self.send_header("Content-Type", "application/json"); self.end_headers(); self.wfile.write(data)
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", 0), H) as s:
    open(port_path, "w").write(str(s.server_address[1]))
    s.serve_forever()
PY
SERVER_PID=$!
for _ in $(seq 1 50); do [ -s "$TMP/port" ] && break; sleep 0.1; done
PORT="$(cat "$TMP/port")"
STATE="$TMP/state"; mkdir -p "$STATE"
LOG="$TMP/systemctl.log"; : > "$LOG"
cat > "$TMP/systemctl" <<SH
#!/usr/bin/env bash
echo "\$*" >> "$LOG"
SH
chmod +x "$TMP/systemctl"
tick() {  # tick <url>: one watchdog run
  CORELLIA_BOX_ENV=/nonexistent CORELLIA_URL="$1" CORELLIA_WATCHDOG_STATE_DIR="$STATE" \
    CORELLIA_WATCHDOG_SYSTEMCTL="$TMP/systemctl" CORELLIA_WATCHDOG_MAX_NOCLIENT=3 CORELLIA_WATCHDOG_MAX_FAILS=2 \
    bash "$HERE/corellia-watchdog.sh" >/dev/null
}
restarts() { grep -c 'restart corellia-kiosk.service' "$LOG" || true; }
URL="http://127.0.0.1:$PORT"

# Healthy: a recent heartbeat never restarts.
echo '{"ok":true,"client_heartbeat_age_s":12}' > "$BODY"
for _ in 1 2 3 4 5; do tick "$URL"; done
[ "$(restarts)" = 0 ] || fail "healthy heartbeat restarted the kiosk"
pass=$((pass+1))

# Stale heartbeat: restart at once.
echo '{"ok":true,"client_heartbeat_age_s":120.4}' > "$BODY"
tick "$URL"
[ "$(restarts)" = 1 ] || fail "stale heartbeat did not restart (got $(restarts))"
pass=$((pass+1))

# No client ever (-1): restart only after MAX_NOCLIENT checks in a row
# (Chromium on its own error page posts no heartbeat; review round 4).
: > "$LOG"
echo '{"ok":true,"client_heartbeat_age_s":-1}' > "$BODY"
tick "$URL"; tick "$URL"
[ "$(restarts)" = 0 ] || fail "-1 restarted before the grace ran out"
tick "$URL"
[ "$(restarts)" = 1 ] || fail "-1 for MAX_NOCLIENT checks did not restart (got $(restarts))"
# The counter reset: two more quiet checks do not restart again.
tick "$URL"; tick "$URL"
[ "$(restarts)" = 1 ] || fail "-1 counter did not reset after the restart"
# A client that then checks in resets the count.
echo '{"ok":true,"client_heartbeat_age_s":3}' > "$BODY"
tick "$URL"
echo '{"ok":true,"client_heartbeat_age_s":-1}' > "$BODY"
tick "$URL"; tick "$URL"
[ "$(restarts)" = 1 ] || fail "a heartbeat did not reset the no-client count"
pass=$((pass+1))

# Backend unreachable: restart after MAX_FAILS checks in a row, then reset.
: > "$LOG"
DEAD="http://127.0.0.1:1"
tick "$DEAD"
[ "$(restarts)" = 0 ] || fail "one unreachable check restarted"
tick "$DEAD"
[ "$(restarts)" = 1 ] || fail "unreachable for MAX_FAILS did not restart (got $(restarts))"
tick "$DEAD"
[ "$(restarts)" = 1 ] || fail "fail counter did not reset after the restart"
pass=$((pass+1))

# A 503 (backend up but unhealthy) counts as unreachable, not as a client.
: > "$LOG"; : > "$BODY"
tick "$URL"; tick "$URL"
[ "$(restarts)" = 1 ] || fail "503 did not count as unreachable (got $(restarts))"
pass=$((pass+1))

echo "box/test.sh: $pass checks passed"

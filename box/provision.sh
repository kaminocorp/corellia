#!/usr/bin/env bash
# Provision a Debian 13 display box for Corellia. Idempotent. Run as root.
#   sudo ./provision.sh --backend http://127.0.0.1:8080 --token <device token> [--with-backend]
# Untested on real hardware as of 2026-10-29; see box/README.md.
set -euo pipefail

BACKEND_URL=""
TOKEN=""
WITH_BACKEND=0
KIOSK_QUERY="kiosk=1"
while [ $# -gt 0 ]; do
  case "$1" in
    --backend) BACKEND_URL="$2"; shift 2 ;;
    --token) TOKEN="$2"; shift 2 ;;
    --with-backend) WITH_BACKEND=1; shift ;;
    --query) KIOSK_QUERY="$2"; shift 2 ;;
    *) echo "unknown argument $1" >&2; exit 2 ;;
  esac
done
[ -n "$BACKEND_URL" ] || { echo "--backend is required" >&2; exit 2; }
[ "$(id -u)" = 0 ] || { echo "run as root" >&2; exit 2; }

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "== packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends \
  chromium xserver-xorg xinit openbox unclutter x11-xserver-utils \
  curl jq ca-certificates mesa-va-drivers intel-media-va-driver alsa-utils pulseaudio

echo "== user"
id corellia >/dev/null 2>&1 || useradd -m -s /bin/bash -G audio,video corellia

echo "== auto-login on tty1"
mkdir -p /etc/systemd/system/getty@tty1.service.d
cat > /etc/systemd/system/getty@tty1.service.d/override.conf <<'UNIT'
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin corellia --noclear %I $TERM
UNIT

echo "== config"
mkdir -p /etc/corellia /opt/corellia
cat > /etc/corellia/box.env <<ENV
CORELLIA_URL=${BACKEND_URL}
CORELLIA_DEVICE_TOKEN=${TOKEN}
CORELLIA_KIOSK_QUERY=${KIOSK_QUERY}
ENV
chmod 640 /etc/corellia/box.env
chown root:corellia /etc/corellia/box.env

echo "== scripts and units"
install -m 755 "$HERE/corellia-kiosk.sh" /opt/corellia/corellia-kiosk.sh
install -m 755 "$HERE/corellia-watchdog.sh" /opt/corellia/corellia-watchdog.sh
install -m 644 "$HERE/xinitrc" /home/corellia/.xinitrc
chown corellia:corellia /home/corellia/.xinitrc
install -m 644 "$HERE/corellia-kiosk.service" /etc/systemd/system/corellia-kiosk.service
install -m 644 "$HERE/corellia-watchdog.service" /etc/systemd/system/corellia-watchdog.service
install -m 644 "$HERE/corellia-watchdog.timer" /etc/systemd/system/corellia-watchdog.timer
if [ "$WITH_BACKEND" = 1 ]; then
  install -m 644 "$HERE/corellia-api.service" /etc/systemd/system/corellia-api.service
  [ -f /etc/corellia/api.env ] || { echo "PORT=8080" > /etc/corellia/api.env; echo "CORELLIA_CLIENT_DIR=/opt/corellia/client" >> /etc/corellia/api.env; echo "CORELLIA_DATA_DIR=/var/lib/corellia" >> /etc/corellia/api.env; }
  mkdir -p /var/lib/corellia && chown corellia:corellia /var/lib/corellia
fi

systemctl daemon-reload
systemctl enable corellia-kiosk.service corellia-watchdog.timer
[ "$WITH_BACKEND" = 1 ] && systemctl enable corellia-api.service
systemctl set-default multi-user.target

echo "== done. Reboot to start the kiosk. Backend: ${BACKEND_URL}"

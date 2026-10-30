#!/usr/bin/env bash
# Provision a Debian 13 display box for Corellia. Idempotent. Run as root.
#   sudo ./provision.sh --backend <url> --token <device token> [--with-backend [--release <dir>]] [--query kiosk=1]
#
#   --backend      the URL the kiosk opens. http://127.0.0.1:8080 with
#                  --with-backend; otherwise an https:// URL (see README:
#                  voice needs a secure context) or a plain LAN http:// URL,
#                  which corellia-kiosk.sh marks as secure for Chromium.
#   --token        CORELLIA_DEVICE_TOKEN of the backend (not needed when the
#                  backend runs on the box in dev mode).
#   --with-backend also install corellia-api.service, which runs
#                  /opt/corellia/api serving /opt/corellia/client.
#   --release      a directory made by box/release.sh (api + client/) to
#                  install into /opt/corellia.
# Untested on real hardware as of 2026-10-30; see box/README.md.
set -euo pipefail

BACKEND_URL=""
TOKEN=""
WITH_BACKEND=0
RELEASE=""
KIOSK_QUERY="kiosk=1"
while [ $# -gt 0 ]; do
  case "$1" in
    --backend) BACKEND_URL="$2"; shift 2 ;;
    --token) TOKEN="$2"; shift 2 ;;
    --with-backend) WITH_BACKEND=1; shift ;;
    --release) RELEASE="$2"; shift 2 ;;
    --query) KIOSK_QUERY="$2"; shift 2 ;;
    *) echo "unknown argument $1" >&2; exit 2 ;;
  esac
done
[ -n "$BACKEND_URL" ] || { echo "--backend is required" >&2; exit 2; }
[ "$(id -u)" = 0 ] || { echo "run as root" >&2; exit 2; }
if [ -n "$RELEASE" ]; then
  [ -x "$RELEASE/api" ] && [ -f "$RELEASE/client/index.html" ] || { echo "--release $RELEASE must hold api and client/index.html (box/release.sh)" >&2; exit 2; }
fi

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "== packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends \
  chromium xserver-xorg xinit openbox unclutter x11-xserver-utils \
  curl jq ca-certificates mesa-va-drivers intel-media-va-driver alsa-utils pulseaudio

echo "== user"
id corellia >/dev/null 2>&1 || useradd -m -s /bin/bash -G audio,video corellia

echo "== tty1"
# Earlier versions auto-logged corellia in on tty1 through getty while the
# kiosk unit also took tty1; the two fought over the terminal. The kiosk
# unit now owns tty1 (Conflicts=getty@tty1.service); the override goes.
if [ -f /etc/systemd/system/getty@tty1.service.d/override.conf ]; then
  rm -f /etc/systemd/system/getty@tty1.service.d/override.conf
  rmdir /etc/systemd/system/getty@tty1.service.d 2>/dev/null || true
fi
# Rootless Xorg from a unit: the wrapper must allow a non-console user.
if [ -f /etc/X11/Xwrapper.config ]; then
  sed -i 's/^allowed_users=.*/allowed_users=anybody/' /etc/X11/Xwrapper.config
  grep -q '^allowed_users=' /etc/X11/Xwrapper.config || echo 'allowed_users=anybody' >> /etc/X11/Xwrapper.config
  grep -q '^needs_root_rights=' /etc/X11/Xwrapper.config || echo 'needs_root_rights=yes' >> /etc/X11/Xwrapper.config
else
  mkdir -p /etc/X11
  printf 'allowed_users=anybody\nneeds_root_rights=yes\n' > /etc/X11/Xwrapper.config
fi

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

if [ -n "$RELEASE" ]; then
  echo "== release -> /opt/corellia"
  install -m 755 "$RELEASE/api" /opt/corellia/api
  rm -rf /opt/corellia/client
  cp -R "$RELEASE/client" /opt/corellia/client
  chown -R root:root /opt/corellia/client
fi

if [ "$WITH_BACKEND" = 1 ]; then
  echo "== backend service"
  install -m 644 "$HERE/corellia-api.service" /etc/systemd/system/corellia-api.service
  if [ ! -f /etc/corellia/api.env ]; then
    cat > /etc/corellia/api.env <<ENV
PORT=8080
CORELLIA_CLIENT_DIR=/opt/corellia/client
CORELLIA_DATA_DIR=/var/lib/corellia
# Add ANTHROPIC_API_KEY=... and the rest from .env.example here.
# Leave CORELLIA_TZ empty to use the box's zone (timedatectl set-timezone).
ENV
  fi
  # Read by systemd as root; it will hold API keys.
  chmod 600 /etc/corellia/api.env
  chown root:root /etc/corellia/api.env
  mkdir -p /var/lib/corellia && chown corellia:corellia /var/lib/corellia
  if [ ! -x /opt/corellia/api ] || [ ! -f /opt/corellia/client/index.html ]; then
    echo "!! /opt/corellia/api or /opt/corellia/client/index.html is missing: corellia-api.service will fail until they are installed." >&2
    echo "   Build on the development machine with box/release.sh, copy the directory here, and rerun with --release <dir>." >&2
  fi
fi

systemctl daemon-reload
systemctl enable corellia-kiosk.service corellia-watchdog.timer
[ "$WITH_BACKEND" = 1 ] && systemctl enable corellia-api.service
systemctl set-default multi-user.target

echo "== done. Reboot to start the kiosk. Backend: ${BACKEND_URL}"

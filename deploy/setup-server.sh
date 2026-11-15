#!/usr/bin/env bash
# One-time setup on an Ubuntu or Debian server. Run as root:
#   sudo bash setup-server.sh
# It installs Nginx and certbot, creates a "deploy" user that can only write the site folder,
# and serves shimaazimi.ir. Safe to run again.
set -euo pipefail

DOMAIN=shimaazimi.ir
SITE_DIR=/var/www/$DOMAIN
DEPLOY_USER=deploy
HERE="$(cd "$(dirname "$0")" && pwd)"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run this as root: sudo bash $0" >&2
  exit 1
fi

apt-get update
apt-get install -y nginx rsync certbot python3-certbot-nginx

# Deploy user: logs in with a key only, owns nothing but the site
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
touch "/home/$DEPLOY_USER/.ssh/authorized_keys"
chown "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh/authorized_keys"
chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys"

# The deploy user swaps the "current" link inside the site folder, so it must own the folder itself
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$SITE_DIR" "$SITE_DIR/releases"
# A placeholder until the first deploy arrives
if [ ! -e "$SITE_DIR/current" ]; then
  install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$SITE_DIR/releases/placeholder"
  echo '<!doctype html><meta charset="utf-8"><title>Shima Azimi</title><p>Coming soon.</p>' > "$SITE_DIR/releases/placeholder/index.html"
  chown -R "$DEPLOY_USER:$DEPLOY_USER" "$SITE_DIR/releases/placeholder"
  ln -sfn "$SITE_DIR/releases/placeholder" "$SITE_DIR/current"
  chown -h "$DEPLOY_USER:$DEPLOY_USER" "$SITE_DIR/current"
fi

install -m 644 "$HERE/nginx.conf" "/etc/nginx/sites-available/$DOMAIN"
ln -sfn "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
nginx -t
systemctl reload nginx

echo
echo "Nginx is serving $DOMAIN over HTTP."
echo "Next:"
echo "  1. Paste the deploy public key into /home/$DEPLOY_USER/.ssh/authorized_keys"
echo "  2. Once DNS points to this server, get HTTPS with:"
echo "     certbot --nginx -d $DOMAIN -d www.$DOMAIN --redirect"

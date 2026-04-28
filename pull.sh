#!/bin/bash
set -e

# CloudLinux/cPanel deployment helper.
# Run this from /home/hqdriedfruits/repositories/HQ-Dried-Fruits.

echo "Starting deployment..."

NODEVENV_BIN="/home/hqdriedfruits/nodevenv/repositories/HQ-Dried-Fruits/18/bin"

if [ -d "$NODEVENV_BIN" ]; then
    export PATH="$NODEVENV_BIN:$PATH"
fi

echo "Backing up uploads..."
mkdir -p dist_uploads_backup
cp -r public/uploads/* dist_uploads_backup/ 2>/dev/null || true

echo "Fetching latest changes from GitHub..."
git fetch --all
git reset --hard origin/main
git clean -fd

echo "Restoring uploads..."
mkdir -p public/uploads
cp -r dist_uploads_backup/* public/uploads/ 2>/dev/null || true

if ! command -v npm >/dev/null 2>&1; then
    echo "npm command not found."
    echo "Open cPanel -> Setup Node.js App -> Run NPM Install, then Restart."
    exit 1
fi

echo "Installing dependencies and rebuilding production bundle..."
npm install
npm run build

echo "Deployment complete."
echo "Restart the app in cPanel Node.js App manager."

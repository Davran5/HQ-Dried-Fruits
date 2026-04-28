#!/bin/bash
set -e

# CloudLinux/cPanel deployment helper.
# Run this from /home/hqdriedfruits/repositories/HQ-Dried-Fruits.

echo "Starting deployment..."

NODEVENV_BIN="/home/hqdriedfruits/nodevenv/repositories/HQ-Dried-Fruits/18/bin"
if [ -d "$NODEVENV_BIN" ]; then
    export PATH="$NODEVENV_BIN:$PATH"
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    echo "node/npm command not found."
    echo "Open cPanel -> Setup Node.js App -> select Node 18.20.8 -> Run NPM Install, then Restart."
    exit 1
fi

NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
if [ "$NODE_MAJOR" -ne 18 ]; then
    echo "Node 18.20.8 is required. Current version: $(node -v)"
    echo "Change cPanel -> Setup Node.js App to Node 18.20.8 before installing."
    exit 1
fi

echo "Node: $(node -v)"
echo "npm: $(npm -v)"

echo "Backing up uploads..."
BACKUP_DIR="$(mktemp -d)"
trap 'rm -rf "$BACKUP_DIR"' EXIT
mkdir -p "$BACKUP_DIR/uploads"
cp -r public/uploads/* "$BACKUP_DIR/uploads/" 2>/dev/null || true

echo "Fetching latest changes from GitHub..."
git fetch --all
git reset --hard origin/main
git clean -fd

echo "Restoring uploads..."
mkdir -p public/uploads
cp -r "$BACKUP_DIR/uploads/"* public/uploads/ 2>/dev/null || true

echo "Installing dependencies..."
npm install --omit=dev --ignore-scripts

echo "Deployment complete."
echo "Restart the app in cPanel Node.js App manager."

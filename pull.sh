#!/bin/bash
set -e

# CloudLinux/cPanel deployment helper.
# Run this from /home/hqdriedfruits/repositories/HQ-Dried-Fruits.

echo "Starting deployment..."

for NODEVENV_BIN in \
    "/home/hqdriedfruits/nodevenv/repositories/HQ-Dried-Fruits/20/bin" \
    "/home/hqdriedfruits/nodevenv/repositories/HQ-Dried-Fruits/18/bin"
do
    if [ -d "$NODEVENV_BIN" ]; then
        export PATH="$NODEVENV_BIN:$PATH"
        break
    fi
done

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    echo "node/npm command not found."
    echo "Open cPanel -> Setup Node.js App -> select Node 20.x -> Run NPM Install, then Restart."
    exit 1
fi

NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
if [ "$NODE_MAJOR" -lt 20 ]; then
    echo "Node 20.x is required. Current version: $(node -v)"
    echo "Change cPanel -> Setup Node.js App to Node 20.x before installing."
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
npm install

echo "Deployment complete."
echo "Restart the app in cPanel Node.js App manager."

#!/bin/bash

# --- Professional Deployment Script ---
echo "🚀 Starting deployment..."

# Backup database and uploads
echo "💾 Backing up database and uploads..."
cp database.json database.json.backup 2>/dev/null || true
mkdir -p dist_uploads_backup
cp -r dist/uploads/* dist_uploads_backup/ 2>/dev/null || true

# 1. Sync with GitHub
echo "📥 Fetching latest changes from GitHub..."
git fetch --all
git reset --hard origin/main
git clean -fd

# Restore database and uploads
echo "♻️ Restoring database and uploads..."
cp database.json.backup database.json 2>/dev/null || true
mkdir -p dist/uploads
cp -r dist_uploads_backup/* dist/uploads/ 2>/dev/null || true

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# 3. Finalize
echo "✅ Deployment complete!"
echo "💡 Remember to click 'Restart' in your cPanel Node.js App manager."

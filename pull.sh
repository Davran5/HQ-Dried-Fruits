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

# Restore uploads but NOT database (to prevent overwriting new translations)
echo "♻️ Restoring uploads..."
mkdir -p dist/uploads
cp -r dist_uploads_backup/* dist/uploads/ 2>/dev/null || true

# ⚠️ WARNING: Ensure you ran 'npm run build' locally before pushing!

# 2. Install dependencies
echo "📦 Installing dependencies..."
if command -v npm &> /dev/null; then
    npm install --production
else
    echo "⚠️  npm command not found in this shell."
    echo "   👉 Please go to cPanel -> 'Setup Node.js App' and click 'Run NPM Install' instead."
fi

# 3. Finalize
echo "✅ Deployment complete!"
echo "💡 Remember to click 'Restart' in your cPanel Node.js App manager."

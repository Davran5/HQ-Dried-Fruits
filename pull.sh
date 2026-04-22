#!/bin/bash

# --- Professional Deployment Script ---
echo "🚀 Starting deployment..."

# 1. Sync with GitHub
echo "📥 Fetching latest changes from GitHub..."
git fetch --all
git reset --hard origin/main
git clean -fd

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# 3. Finalize
echo "✅ Deployment complete!"
echo "💡 Remember to click 'Restart' in your cPanel Node.js App manager."

#!/usr/bin/env bash
# Auto-deploy script triggered by GitHub Webhook or manual run
set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$APP_DIR/deploy.log"

echo "==========================================" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting auto deployment..." >> "$LOG_FILE"

cd "$APP_DIR"

# 1. Pastikan folder data dan database tidak tersentuh
mkdir -p "$APP_DIR/data"

# 2. Ambil perubahan terbaru dari GitHub
if [ -d "$APP_DIR/.git" ]; then
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
  echo "Pulling latest code from branch: $CURRENT_BRANCH..." >> "$LOG_FILE"
  git fetch origin "$CURRENT_BRANCH" >> "$LOG_FILE" 2>&1
  git reset --hard "origin/$CURRENT_BRANCH" >> "$LOG_FILE" 2>&1
fi

# 3. Install dependency jika ada paket baru & build frontend
echo "Building project..." >> "$LOG_FILE"
npm install --legacy-peer-deps >> "$LOG_FILE" 2>&1
npm run build >> "$LOG_FILE" 2>&1

# 4. Restart server via PM2
echo "Restarting PM2 process..." >> "$LOG_FILE"
pm2 restart pinjamlaptop >> "$LOG_FILE" 2>&1 || pm2 start "npm run start" --name "pinjamlaptop" >> "$LOG_FILE" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deployment completed successfully!" >> "$LOG_FILE"
echo "==========================================" >> "$LOG_FILE"

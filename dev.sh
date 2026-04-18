#!/usr/bin/env bash
# dev.sh — one-command dev server for Dawat.
#
# Starts ngrok v3 on port 8081, grabs its public HTTPS URL, then launches
# Metro with EXPO_PACKAGER_PROXY_URL pointed at that URL so the dev build
# on any iPhone can reach Metro over the internet.
#
# Why this exists: `npx expo start --tunnel` is permanently broken on the
# free ngrok tier because @expo/ngrok bundles a v2 binary (v2.3.41) that
# ngrok's servers now reject. See Linear ticket linked in the repo for the
# full post-mortem.
#
# Prereqs (one-time setup):
#   1. brew install ngrok
#   2. ngrok config add-authtoken <your-token>   (free token from https://dashboard.ngrok.com)
#
# Usage:
#   ./dev.sh
#
# Then scan the QR on your iPhone Camera app.
# Ctrl+C cleanly stops both ngrok and Metro.

set -e

# ── Preflight ────────────────────────────────────────────────
if ! command -v ngrok >/dev/null 2>&1; then
  echo "❌ ngrok not installed. Run: brew install ngrok" >&2
  exit 1
fi

if ! ngrok config check >/dev/null 2>&1; then
  echo "❌ ngrok has no authtoken configured." >&2
  echo "   1. Sign up free at https://dashboard.ngrok.com/signup" >&2
  echo "   2. Copy your token from https://dashboard.ngrok.com/get-started/your-authtoken" >&2
  echo "   3. Run: ngrok config add-authtoken <YOUR_TOKEN>" >&2
  exit 1
fi

# ── Cleanup on exit ──────────────────────────────────────────
cleanup() {
  echo ""
  echo "🧹 Stopping ngrok and Metro..."
  [ -n "$NGROK_PID" ] && kill "$NGROK_PID" 2>/dev/null || true
  [ -n "$METRO_PID" ] && kill "$METRO_PID" 2>/dev/null || true
  pkill -f "ngrok http 8081" 2>/dev/null || true
  pkill -f "expo start" 2>/dev/null || true
  wait 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

# ── Start ngrok ──────────────────────────────────────────────
# Kill any stale ngrok first
pkill -f "ngrok http 8081" 2>/dev/null || true
sleep 1

echo "🌐 Starting ngrok tunnel → port 8081..."
ngrok http 8081 --log=stdout > /tmp/dawat-ngrok.log 2>&1 &
NGROK_PID=$!

# Poll ngrok API for public URL (up to 20s)
TUNNEL_URL=""
for i in $(seq 1 20); do
  sleep 1
  TUNNEL_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print(next((t['public_url'] for t in d.get('tunnels',[]) if t['public_url'].startswith('https')),''))" 2>/dev/null)
  [ -n "$TUNNEL_URL" ] && break
done

if [ -z "$TUNNEL_URL" ]; then
  echo "❌ ngrok failed to open a tunnel. Check /tmp/dawat-ngrok.log" >&2
  cleanup
  exit 1
fi

echo "✅ Tunnel live: $TUNNEL_URL"
echo ""

# ── Start Metro ──────────────────────────────────────────────
echo "🚀 Starting Metro with proxy URL..."
echo ""
export EXPO_PACKAGER_PROXY_URL="$TUNNEL_URL"

# Run Metro in foreground so QR code + logs show in this terminal
npx expo start --dev-client &
METRO_PID=$!
wait "$METRO_PID"

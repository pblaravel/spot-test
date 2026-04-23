#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEMO_PORT="${DEMO_API_PORT:-3099}"
FRONT_PORT="${FRONT_DEMO_PORT:-3011}"

# Не использовать pkill -f demo-video-server.mjs — совпадает с командной строкой оболочки.
if [[ -f /tmp/demo-video-server.pid ]]; then
  kill "$(cat /tmp/demo-video-server.pid)" 2>/dev/null || true
  rm -f /tmp/demo-video-server.pid
fi
if [[ -f /tmp/next-demo.pid ]]; then
  kill "$(cat /tmp/next-demo.pid)" 2>/dev/null || true
  rm -f /tmp/next-demo.pid
fi

node "$ROOT/scripts/demo-video-server.mjs" > /tmp/demo-api.log 2>&1 &
echo $! > /tmp/demo-video-server.pid

cd "$ROOT/frontend"
NEXT_PUBLIC_API_URL="http://127.0.0.1:$DEMO_PORT" pnpm exec next dev -p "$FRONT_PORT" > /tmp/next-demo.log 2>&1 &
echo $! > /tmp/next-demo.pid

for _ in $(seq 1 60); do
  curl -sf "http://127.0.0.1:$DEMO_PORT/spot/ticker/BTC%2FUSDT" >/dev/null 2>&1 && curl -sf "http://127.0.0.1:$FRONT_PORT" >/dev/null 2>&1 && break
  sleep 1
done

echo "Demo API: http://127.0.0.1:$DEMO_PORT"
echo "Frontend: http://127.0.0.1:$FRONT_PORT/trading"
echo "PIDs: demo $(cat /tmp/demo-video-server.pid) next $(cat /tmp/next-demo.pid)"

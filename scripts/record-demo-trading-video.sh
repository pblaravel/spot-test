#!/usr/bin/env bash
# Демо-видео: два тестовых аккаунта входят и открывают /trading (котировки с Binance через CCXT в demo API).
# Зависимости: node, ffmpeg, google-chrome, xdotool, xvfb-run; в frontend/: pnpm install

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ARTIFACT_DIR="${ARTIFACT_DIR:-/opt/cursor/artifacts}"
mkdir -p "$ARTIFACT_DIR"
VIDEO="${VIDEO:-$ARTIFACT_DIR/demo-two-accounts-trading.mp4}"
DEMO_PORT="${DEMO_API_PORT:-3099}"
FRONT_PORT="${FRONT_DEMO_PORT:-3010}"

cleanup() {
  kill "${DEMO_PID:-0}" 2>/dev/null || true
  kill "${NEXT_PID:-0}" 2>/dev/null || true
}
trap cleanup EXIT

echo "Starting demo API :$DEMO_PORT ..."
node "$ROOT/scripts/demo-video-server.mjs" &
DEMO_PID=$!

echo "Starting Next.js :$FRONT_PORT ..."
(cd "$ROOT/frontend" && NEXT_PUBLIC_API_URL="http://127.0.0.1:$DEMO_PORT" pnpm exec next dev -p "$FRONT_PORT") &
NEXT_PID=$!

for _ in $(seq 1 120); do
  curl -sf "http://127.0.0.1:$DEMO_PORT/spot/ticker/BTC%2FUSDT" >/dev/null 2>&1 && curl -sf "http://127.0.0.1:$FRONT_PORT" >/dev/null 2>&1 && break
  sleep 1
done

echo "Recording -> $VIDEO"

xvfb-run -a -s "-screen 0 1280x720x24 -ac +extension RANDR" bash -c "
  set -e
  export CHROME_BIN=\"\${CHROME_BIN:-google-chrome}\"
  FFLOG=\"\${TMPDIR:-/tmp}/demo-ffmpeg.log\"
  ffmpeg -y -loglevel error -f x11grab -video_size 1280x720 -framerate 12 -i \"\${DISPLAY}.0\" \
    -codec:v libx264 -pix_fmt yuv420p -preset veryfast \"$VIDEO\" 2>\"\$FFLOG\" &
  FFPID=\$!

  USER_DATA=\"\${TMPDIR:-/tmp}/chrome-demo-profile-\$\$\"
  mkdir -p \"\$USER_DATA\"
  \"\$CHROME_BIN\" --user-data-dir=\"\$USER_DATA\" --no-first-run --disable-sync --disable-extensions \
    --disable-dev-shm-usage --no-sandbox --window-size=1280,720 \
    \"http://127.0.0.1:$FRONT_PORT/login?email=demo.alice%40cryptospot.demo\" &
  CHPID=\$!
  sleep 7
  xdotool key Tab
  xdotool type --delay 30 'DemoTrader123!'
  sleep 0.4
  xdotool key Return
  sleep 5
  xdotool key ctrl+l
  sleep 0.6
  xdotool type --delay 20 \"http://127.0.0.1:$FRONT_PORT/trading\"
  xdotool key Return
  sleep 9
  xdotool key ctrl+l
  sleep 0.6
  xdotool type --delay 20 \"http://127.0.0.1:$FRONT_PORT/login?email=demo.bob%40cryptospot.demo\"
  xdotool key Return
  sleep 6
  xdotool key Tab
  xdotool type --delay 30 'DemoTrader123!'
  sleep 0.4
  xdotool key Return
  sleep 5
  xdotool key ctrl+l
  sleep 0.6
  xdotool type --delay 20 \"http://127.0.0.1:$FRONT_PORT/trading\"
  xdotool key Return
  sleep 10

  kill \"\$CHPID\" 2>/dev/null || true
  kill -INT \"\$FFPID\" 2>/dev/null || true
  wait \"\$FFPID\" 2>/dev/null || true
"

echo "Done: $VIDEO"
ls -la "$VIDEO"

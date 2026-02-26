#!/usr/bin/env bash
# Capture the current iOS Simulator window to app-store-screenshots/<name>.png
# Usage: ./scripts/capture-screenshot.sh 01-play
# Run with app open in Simulator and on the screen you want.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OUT_DIR="$ROOT_DIR/app-store-screenshots"
NAME="${1:-screenshot}"

mkdir -p "$OUT_DIR"
OUT="$OUT_DIR/${NAME}.png"

xcrun simctl io booted screenshot "$OUT" 2>/dev/null || {
  echo "No booted simulator found. Start the app in iOS Simulator first (e.g. iPhone 15 Pro Max), then run this again."
  exit 1
}

echo "Saved: $OUT"

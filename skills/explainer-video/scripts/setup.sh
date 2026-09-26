#!/usr/bin/env bash
# One-time, idempotent setup of the shared toolchain in $EXPLAINER_VIDEO_CACHE (default ~/.cache/explainer-video):
#   node_modules/ (Playwright + Chromium), venv/ (Kokoro TTS, mascot prep deps), kokoro/ (voice model, ~350 MB).
set -euo pipefail
CACHE="${EXPLAINER_VIDEO_CACHE:-$HOME/.cache/explainer-video}"
missing=()
for bin in node npm npx ffmpeg python3 curl; do command -v "$bin" >/dev/null || missing+=("$bin"); done
if ((${#missing[@]})); then echo "missing: ${missing[*]} (install Node 18+, ffmpeg, Python 3.10+ and curl first)" >&2; exit 1; fi
mkdir -p "$CACHE/kokoro"
if [ ! -d "$CACHE/node_modules/playwright" ]; then
  (cd "$CACHE" && { [ -f package.json ] || npm init -y >/dev/null; } && npm install --silent playwright@^1.49)
fi
(cd "$CACHE" && npx --yes playwright install chromium >/dev/null)
if [ ! -x "$CACHE/venv/bin/python" ]; then python3 -m venv "$CACHE/venv"; fi
"$CACHE/venv/bin/python" -m pip install --quiet --upgrade pip
"$CACHE/venv/bin/python" -m pip install --quiet kokoro-onnx soundfile numpy pillow scipy
BASE=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  [ -s "$CACHE/kokoro/$f" ] || { echo "downloading $f"; curl -fsSL -o "$CACHE/kokoro/$f" "$BASE/$f"; }
done
echo "ready: $CACHE"

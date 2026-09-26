#!/usr/bin/env bash
# Usage: new-project.sh <project-dir> [mascot-dir|--default]
# Copies the engine template and a mascot pack into a new project, and links the shared toolchain from setup.sh.
# Mascot: --default bypasses saved preferences; otherwise explicit pack, saved pack, then presenter mascot.
# A mascot pack is either a code mascot (mascot.js defining figure() and window.READY) or an image mascot
# (figure.png + meta.js from prep_mascot.py).
set -euo pipefail
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
CACHE="${EXPLAINER_VIDEO_CACHE:-$HOME/.cache/explainer-video}"
CONFIG="${EXPLAINER_VIDEO_CONFIG:-$HOME/.config/explainer-video}"
OUT="${1:?usage: new-project.sh <project-dir> [mascot-dir|--default]}"
if [ "${2:-}" = "--default" ]; then MASCOT="$SKILL/mascots/presenter"; elif [ -n "${2:-}" ]; then MASCOT="$2"; elif [ -d "$CONFIG/mascot" ]; then MASCOT="$CONFIG/mascot"; else MASCOT="$SKILL/mascots/presenter"; fi
[ -d "$CACHE/node_modules/playwright" ] || { echo "run $SKILL/scripts/setup.sh first" >&2; exit 1; }
if [ -e "$OUT" ] && [ -n "$(ls -A "$OUT")" ]; then echo "$OUT exists and is not empty" >&2; exit 1; fi
mkdir -p "$OUT/mascot" "$OUT/build"
cp -R "$SKILL/template/." "$OUT/"
if [ -f "$MASCOT/mascot.js" ]; then
  cp -R "$MASCOT/." "$OUT/mascot/"
elif [ -f "$MASCOT/figure.png" ] && [ -f "$MASCOT/meta.js" ]; then
  cp "$MASCOT/figure.png" "$MASCOT/meta.js" "$OUT/mascot/"
  cp "$SKILL/mascots/image-mascot.js" "$OUT/mascot/mascot.js"
else
  echo "$MASCOT is not a mascot pack: need mascot.js, or figure.png + meta.js (see references/mascot.md)" >&2; exit 1
fi
sed "s#<skill-dir>#$SKILL#g" "$SKILL/references/scene-brief.md" > "$OUT/BRIEF.md"
ln -s "$CACHE/node_modules" "$OUT/node_modules"
ln -s "$CACHE/venv" "$OUT/venv"
echo "created $OUT (mascot: $MASCOT)"

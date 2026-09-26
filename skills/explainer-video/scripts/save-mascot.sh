#!/usr/bin/env bash
# Usage: save-mascot.sh <mascot-dir>
# Saves a mascot pack as the user's mascot in $EXPLAINER_VIDEO_CONFIG/mascot (default ~/.config/explainer-video/mascot).
# new-project.sh uses the saved mascot whenever no mascot is passed. Replaces any previously saved mascot.
set -euo pipefail
CONFIG="${EXPLAINER_VIDEO_CONFIG:-$HOME/.config/explainer-video}"
SRC="${1:?usage: save-mascot.sh <mascot-dir>}"
if [ ! -f "$SRC/mascot.js" ] && { [ ! -f "$SRC/figure.png" ] || [ ! -f "$SRC/meta.js" ]; }; then
  echo "$SRC is not a mascot pack: need mascot.js, or figure.png + meta.js (see references/mascot.md)" >&2; exit 1
fi
mkdir -p "$CONFIG"
rm -rf "$CONFIG/mascot.tmp"; cp -R "$SRC" "$CONFIG/mascot.tmp"
rm -rf "$CONFIG/mascot"; mv "$CONFIG/mascot.tmp" "$CONFIG/mascot"
echo "saved mascot: $CONFIG/mascot"

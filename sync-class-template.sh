#!/bin/sh
# Copy the main skill folder into class-template so all three copies stay identical.
# Edit deploy-to-cloudflare/ only, then run this script.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
NAME="deploy-to-cloudflare"
for DIR in .claude/skills .agents/skills; do
  DEST="$ROOT/class-template/$DIR"
  rm -rf "$DEST/$NAME"
  mkdir -p "$DEST"
  cp -R "$ROOT/$NAME" "$DEST/$NAME"
  echo "synced -> class-template/$DIR/$NAME"
done

#!/bin/sh
# Install the deploy-to-cloudflare skill.
# Usage:  ./install.sh         -> Claude Code   (~/.claude/skills)
#         ./install.sh --all   -> also OpenCode (~/.config/opencode/skills)
#                                 and Antigravity (~/.gemini/config/skills, plus the
#                                 older ~/.gemini/antigravity/skills if it exists)
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
NAME="deploy-to-cloudflare"
SRC="$ROOT/$NAME"
[ -f "$SRC/SKILL.md" ] || { echo "SKILL.md not found in $SRC"; exit 1; }

DESTS="$HOME/.claude/skills"
if [ "$1" = "--all" ]; then
  DESTS="$DESTS $HOME/.config/opencode/skills $HOME/.gemini/config/skills"
  [ -d "$HOME/.gemini/antigravity" ] && DESTS="$DESTS $HOME/.gemini/antigravity/skills"
fi

for DEST in $DESTS; do
  rm -rf "$DEST/$NAME"
  mkdir -p "$DEST"
  cp -R "$SRC" "$DEST/$NAME"
  echo "installed -> $DEST/$NAME"
done

command -v node >/dev/null 2>&1 && echo "node: $(node -v)" \
  || echo "note: Node.js not found yet - the skill will install it when you ask the AI to deploy."

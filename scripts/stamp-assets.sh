#!/usr/bin/env bash
# Sustituye __BUILD__ en los HTML por un identificador de versión (cache busting).
# Uso: ./scripts/stamp-assets.sh [version]
# Sin argumento usa el short SHA de git, o "dev" si no hay repo.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="${1:-$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo dev)}"

for file in index.html gracias.html; do
  if [[ ! -f "$ROOT/$file" ]]; then
    echo "No existe $file" >&2
    exit 1
  fi
  sed "s/__BUILD__/${VERSION}/g" "$ROOT/$file" > "$ROOT/$file.tmp"
  mv "$ROOT/$file.tmp" "$ROOT/$file"
done

echo "Assets stamped with version: ${VERSION}"

#!/usr/bin/env bash
set -euo pipefail

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="backups/alumni-${STAMP}.sql"
mkdir -p backups

npx wrangler d1 export alumni-db --remote --output "$OUT"
echo "Backup tersimpan di $OUT"

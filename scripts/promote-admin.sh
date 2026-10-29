#!/usr/bin/env bash
set -euo pipefail

EMAIL="${1:-}"
TARGET="${2:-remote}"

if [[ -z "$EMAIL" ]]; then
  echo "Usage: npm run db:promote -- nama@email.com [local|remote]" >&2
  exit 1
fi

if [[ ! "$EMAIL" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
  echo "Email tidak valid." >&2
  exit 1
fi

FLAG="--remote"
if [[ "$TARGET" == "local" ]]; then
  FLAG="--local"
fi

npx wrangler d1 execute alumni-db "$FLAG" \
  --command "UPDATE users SET role = 'admin', status = 'active', updated_at = $(date +%s)000 WHERE email = '$EMAIL'" \
  --json

#!/bin/sh
# Container entrypoint — keeps the Neon database schema in sync with
# src/models/schema.ts before the API starts.
#
# Every deploy diffs the live database against the schema definition and
# applies whatever is missing (new tables, new columns, new enums), so a
# schema change only needs a rebuild — no manual `npm run db:push`.
#
# Env:
#   AUTO_MIGRATE=false    skip the sync entirely
#   MIGRATE_STRICT=true   abort startup if the sync fails (default: warn + start)
set -e

if [ "${AUTO_MIGRATE:-true}" != "true" ]; then
  echo "⏭️  AUTO_MIGRATE=${AUTO_MIGRATE} — skipping database schema sync"
elif [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL is not set — skipping database schema sync"
else
  echo "🔄 Syncing database schema with src/models/schema.ts ..."
  # stdin is closed so drizzle-kit never blocks on an interactive prompt;
  # --force auto-approves statements it flags as potentially destructive.
  if npx drizzle-kit push --force --verbose < /dev/null; then
    echo "✅ Database schema is up to date"
  else
    echo "❌ Database schema sync failed"
    if [ "${MIGRATE_STRICT:-false}" = "true" ]; then
      echo "   MIGRATE_STRICT=true — aborting startup"
      exit 1
    fi
    echo "⚠️  Starting the API against the existing schema anyway"
    echo "   (set MIGRATE_STRICT=true to fail the deploy instead)"
  fi
fi

exec "$@"

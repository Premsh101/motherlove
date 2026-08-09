#!/bin/sh
# Container entrypoint — brings the Neon database up to date before the API
# starts:
#
#   1. schema sync — diffs the live database against src/models/schema.ts and
#      creates whatever is missing (tables, columns, enums)
#   2. seed        — creates the sample admin/doctor/patient accounts if they
#      are not there yet
#
# Both steps are idempotent, so this runs safely on every deploy.
#
# Env:
#   AUTO_MIGRATE=false    skip the schema sync
#   AUTO_SEED=false       skip the seed
#   MIGRATE_STRICT=true   abort startup if either step fails (default: warn and
#                         start anyway)
set -e

schema_ok=false

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
    schema_ok=true
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

if [ "${AUTO_SEED:-true}" != "true" ]; then
  echo "⏭️  AUTO_SEED=${AUTO_SEED} — skipping database seed"
elif [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL is not set — skipping database seed"
elif [ "${AUTO_MIGRATE:-true}" = "true" ] && [ "$schema_ok" != "true" ]; then
  # Without a synced schema the tables may not exist — seeding would only add
  # noise to an already-failing startup.
  echo "⏭️  Skipping database seed — schema sync did not succeed"
else
  echo "🌱 Seeding initial data (existing records are left untouched) ..."
  if node dist/seed.js < /dev/null; then
    echo "✅ Seed complete"
  else
    echo "❌ Database seed failed"
    if [ "${MIGRATE_STRICT:-false}" = "true" ]; then
      echo "   MIGRATE_STRICT=true — aborting startup"
      exit 1
    fi
    echo "⚠️  Starting the API anyway"
  fi
fi

exec "$@"

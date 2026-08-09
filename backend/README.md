# MotherNest API

Express + Drizzle ORM backend, backed by Neon Postgres.

## Database schema

`src/models/schema.ts` is the single source of truth. **The schema is applied
automatically on every backend start** — the container entrypoint
(`docker-entrypoint.sh`) diffs the live database against `schema.ts` and creates
whatever is missing (tables, columns, enums, indexes, foreign keys) before the
API boots.

So adding a table or a column is just:

1. Edit `src/models/schema.ts`
2. Redeploy — `docker compose up -d --build backend`

No manual `npm run db:push` step, and nothing to run by hand on the server.

The sync is idempotent: when the database already matches the schema it logs
`No changes detected` and moves on. Existing rows are untouched — a new column
is added with `ALTER TABLE ... ADD COLUMN`, not by recreating the table.

### Env flags

| Variable | Default | Effect |
| --- | --- | --- |
| `AUTO_MIGRATE` | `true` | Set to `false` to skip the schema sync entirely |
| `MIGRATE_STRICT` | `false` | Set to `true` to abort startup if the sync fails. By default a failed sync logs a warning and the API starts against the existing schema. |

### Running it manually

```bash
npm run db:sync     # apply schema.ts to the database (same command the entrypoint runs)
npm run db:studio   # browse the database
npm run start:migrate  # sync, then start the API (for non-Docker deploys)
```

### A note on destructive changes

The sync runs with `--force`, which auto-approves statements Drizzle flags as
potentially data-losing (dropping a column, narrowing a type). Adding tables and
columns — the common case — is always safe. Renaming a column is seen as
drop + add, so back the data up (or do the rename in two deploys: add the new
column, copy the data, then remove the old one) before shipping one.

## Seeding

The database starts empty; there are no built-in accounts. To create the sample
admin/doctor/patient users:

```bash
npm run db:seed
```

Credentials it creates are printed at the end of the run. Phone numbers are
unique, so the seed only works on a database that has not been seeded yet.

## Local development

```bash
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm install
npm run dev
```

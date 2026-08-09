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
| `AUTO_SEED` | `true` | Set to `false` to skip the seed (see below) |
| `MIGRATE_STRICT` | `false` | Set to `true` to abort startup if the sync or seed fails. By default a failure logs a warning and the API starts against the existing schema. |

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

The sample accounts and their visit histories are created **automatically on
startup**, right after the schema sync. A fresh deploy therefore comes up with
working logins and a populated demo dataset — nothing to run by hand.

| Role | Phone | Password |
| --- | --- | --- |
| Admin | `9000000001` | `admin123` |
| Doctor (Dr. Priya) | `9000000002` | `doctor123` |
| Doctor (Dr. Neha) | `9000000003` | `doctor123` |
| Patient (Aarohi, 28 wks) | `9000000010` | `patient123` |
| Patient (Meera, 20 wks) | `9000000011` | `patient123` |
| Patient (Sanya, 34 wks, high risk) | `9000000012` | `patient123` |

**Change these passwords before the site handles anything real** — they are
committed to this repository.

The seed only ever adds what is missing; it never updates or deletes:

- Accounts are matched on their (unique) phone number. An account that already
  exists is left exactly as it is, so a password changed after the first deploy
  survives every later deploy.
- A patient's visit history is only created when that patient has **no** visits
  at all. Once a doctor has entered a real visit, the seed leaves that patient
  alone permanently.

That makes it safe on every restart. Set `AUTO_SEED=false` to turn it off — for
example once the demo accounts are no longer wanted in production. Deleting the
sample accounts while `AUTO_SEED=true` just recreates them on the next deploy.

To run it manually:

```bash
npm run db:seed
```

## Local development

```bash
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm install
npm run dev
```

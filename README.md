# MotherNest

Pregnancy monitoring platform — Next.js frontend, Express + Drizzle backend,
Neon Postgres.

| Service | Port | Notes |
| --- | --- | --- |
| `frontend` | 3030 | Next.js (standalone). The only service that needs to be publicly reachable. |
| `backend` | 5030 | Express API. |

## How the two talk to each other

The browser only ever calls the **frontend's own origin**. The Next server
forwards `/api/*` and `/uploads/*` to the backend over the internal Docker
network (`next.config.ts` rewrites → `http://backend:5030`).

That means:

- The backend does not need a public URL, a subdomain, or an open port.
- There is no cross-origin request, so CORS never comes into play.
- Nothing has to be rebuilt when the site's domain changes.

If you would rather have the browser call the backend directly, set
`NEXT_PUBLIC_API_URL` to the backend origin (e.g. `https://api.example.com`) —
it is read at **build** time, and `FRONTEND_URL` on the backend must then list
the site's origin so CORS allows it.

## Deploying

Create a `.env` next to `docker-compose.yml`:

```bash
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="a-long-random-string"
FRONTEND_URL="https://your-site"     # only used for direct (non-proxied) calls
```

Then:

```bash
docker compose build --no-cache
docker compose up -d
docker compose logs -f backend
```

On start the backend creates any missing tables and columns from
`backend/src/models/schema.ts` and seeds the sample accounts — see
[`backend/README.md`](backend/README.md) for the full workflow and the env flags
(`AUTO_MIGRATE`, `AUTO_SEED`, `MIGRATE_STRICT`).

`NEXT_PUBLIC_API_URL` is baked into the frontend at build time, so changing it
requires `docker compose build --no-cache frontend` — a restart is not enough.

## Sample logins

| Role | Phone | Password |
| --- | --- | --- |
| Admin | `9000000001` | `admin123` |
| Doctor | `9000000002` | `doctor123` |
| Patient | `9000000010` | `patient123` |

Full list in [`backend/README.md`](backend/README.md). **Change these before the
site handles real data**, or set `AUTO_SEED=false` to stop them being created.

## Troubleshooting

**Login fails with `Unexpected token '<', "<!DOCTYPE"... is not valid JSON`**
The browser asked for `/api/...` and got an HTML page back, which means the
request never reached the backend. Check that the frontend image was built with
the rewrites in place (`docker compose build --no-cache frontend`), and that
`NEXT_PUBLIC_API_URL` is either empty or a URL the browser can actually reach.

**Login fails with `Invalid phone number or password`**
The request reached the API but the account is not there. Check
`docker compose logs backend` for the seed summary, or run
`docker compose exec backend npm run db:seed`.

**Uploaded documents disappear after a deploy**
Uploads live in the `mothernest-uploads` volume. Confirm it is still attached
with `docker volume ls`; `docker compose down -v` deletes it.

## Local development

```bash
cd backend  && cp .env.example .env && npm install && npm run dev
cd frontend && npm install && npm run dev
```

The frontend dev server proxies to `http://backend:5030` by default; set
`BACKEND_INTERNAL_URL=http://localhost:5030` when running the backend outside
Docker.

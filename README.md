# ChurchFlow

Multi-tenant church management platform built with **Next.js 16**, **Prisma 7** and **PostgreSQL**.

Modules: members, families, departments, attendance, finance & giving, events, small groups,
visitors & follow-ups, prayer requests, counseling, sermons, reports, settings, and a platform
admin panel for the super admin.

## Getting started

Requirements: Node 20+, and a PostgreSQL database (local or hosted).

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Local database (option 1 — Docker)

```bash
npm run db:up        # starts Postgres on 5432 (postgres:16-alpine)
npm run db:migrate   # applies migrations
npm run db:seed      # demo data
```

### Local database (option 2 — installed PostgreSQL)

Create a database and set `DATABASE_URL` in `.env`:

```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/churchflow?schema=public
AUTH_SECRET=<any-long-random-string>
```

Then:

```bash
npm run db:migrate
npm run db:seed
```

### Demo accounts (after seeding)

| Role          | Email                   | Password     |
| ------------- | ----------------------- | ------------ |
| Super admin   | admin@churchflow.app    | admin123     |
| Church admin  | admin@lighthouse.church | password123  |

## Useful scripts

```bash
npm run dev         # development server
npm run build       # production build
npm run lint        # eslint
npm run db:migrate  # prisma migrate dev
npm run db:seed     # seed demo data
npm run db:studio   # prisma studio
```

## Deploy to Vercel

1. Push this repository to GitHub (done: `sboaho-boop/churchflow`).
2. Go to https://vercel.com/new and **Import** the `churchflow` repo (sign in with GitHub).
3. Vercel auto-detects Next.js — keep the default build command.
4. Add environment variables under **Settings → Environment Variables**:
   - `DATABASE_URL` — your production Postgres URL (e.g. from Neon, Supabase or Railway)
   - `AUTH_SECRET` — a long random string (`openssl rand -base64 32`)
5. Click **Deploy**. The build runs `prisma generate` (postinstall) automatically.
6. After first deploy, apply schema to the production database:
   ```bash
   npx prisma migrate deploy
   ```
   and optionally seed it (`npx prisma db seed`).

> The app also deploys without a database: the auth pages work and data pages show a
> friendly "Database not connected" notice until you add `DATABASE_URL`.

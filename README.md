This is a [Next.js](https://nextjs.org) project with [Payload CMS](https://payloadcms.com) for portfolio, clients, and team content.

Production uses **Supabase Postgres** for the database, **Cloudflare R2** for media uploads, and **Vercel** for hosting the site and admin.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — Supabase **transaction pooler** URL (port 6543)
- `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `CONTENT_PROVIDER=payload`
- `PAYLOAD_SEED_PASSWORD` — for seeding admin users (not stored in git)
- `R2_BUCKET`, `R2_ENDPOINT`, `R2_PUBLIC_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`

### 3. Set up database and content

After cloning, run:

```bash
npm run setup
```

This will:

1. Copy `.env.example` → `.env` if you don't have one yet
2. Run `npm run migrate` against Supabase
3. Seed admin users from `data/payload/seed-users.json`
4. Seed portfolio, clients, and team from `src/data/static*.ts` (uploads go to R2)

Then start the dev server:

```bash
npm run dev
```

- Site: [http://localhost:3000](http://localhost:3000)
- Payload admin: [http://localhost:3000/admin](http://localhost:3000/admin)

Log in with an email from `data/payload/seed-users.json` and the password from `PAYLOAD_SEED_PASSWORD` in your `.env`.

### Adding or updating admin users for the team

1. Add the email to `data/payload/seed-users.json`
2. Commit and push that file
3. Teammates run `npm run seed` (or `npm run setup` on first clone)

Passwords are **not** stored in git. Everyone uses the shared dev password from `PAYLOAD_SEED_PASSWORD` in `.env`.

### Updating CMS content

With Supabase + R2, edits in the **Payload admin** are live for everyone on the same database. No need to re-export static files for production.

Optional: run `npm run export-cms` to sync CMS data back into `src/data/static*.ts` for git backup or static fallback.

Static seed sources (used by `npm run seed`):

- `src/data/staticProjects.ts`
- `src/data/staticClients.ts`
- `src/data/staticTeam.ts`

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run setup` | Migrate + seed (first-time setup) |
| `npm run migrate` | Apply Payload DB migrations to Supabase |
| `npm run migrate:create` | Create a new migration after schema changes |
| `npm run seed` | Re-seed users and CMS content |
| `npm run export-cms` | Export CMS → static `src/data/static*.ts` (optional) |
| `npm run migrate-tags` | **Legacy** — SQLite-only one-time tag migration; do not use on Supabase |
| `npm run generate:types` | Regenerate Payload TypeScript types |

## Deploy on Vercel

1. Connect the repo and set the same env vars as `.env.example` (use production `NEXT_PUBLIC_SERVER_URL`).
2. Use the Supabase **transaction pooler** connection string for `DATABASE_URL` (port **6543**, not direct `:5432`).
3. Set **all** `R2_*` variables on Vercel (Production + Preview) so the admin import map and uploads work at build time and runtime.
4. `npm run build` runs `generate:importmap`, migrations, then `next build`.
5. After deploy, verify `/admin` login and a test media upload (check R2 bucket).

If a private GitHub **organization** repo blocks Vercel Hobby Git deploys, use GitHub Actions with the Vercel CLI or upgrade to Vercel Pro.

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

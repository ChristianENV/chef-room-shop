# Database (Prisma + Neon PostgreSQL)

Chef Room uses **Prisma** against **Neon PostgreSQL**. Migrations and seeds run from the CLI using `DATABASE_URL`.

## Configure `DATABASE_URL`

1. Copy the example file:

   ```bash
   cp .env.example .env.local
   ```

2. Set `DATABASE_URL` in **`.env.local`** (Next.js and local scripts):

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
   ```

   Use a **development** Neon branch/database. Do not point migrations at production.

3. Prisma CLI reads `DATABASE_URL` from the environment. On Windows PowerShell for a one-off command:

   ```powershell
   $env:DATABASE_URL = "postgresql://..."
   npx prisma validate
   ```

   > Tip: keep `NODE_ENV=development` in `.env.local` and avoid host/database names containing `prod` or `production`.

## Validate schema & generate client

```bash
npx prisma validate
npx prisma generate
# or
npm run db:validate
npm run db:generate
```

## Create / apply migrations (dev)

First migration (empty database):

```bash
npx prisma migrate dev --name init
```

New changes after editing `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name describe_your_change
```

**Do not** run `migrate dev` against production. Use `prisma migrate deploy` in CI/CD for staging/prod.

If the database already has tables not managed by Prisma, baseline or reset in dev before applying `init` — see [Prisma baselining](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/add-prisma-migrate-to-a-project#baseline-your-production-database).

## Seed reference data

```bash
npm run db:seed
```

Seeds (idempotent `upsert`):

- Roles: `CUSTOMER`, `ADMIN`, `SUPERADMIN`
- Permissions + role mappings
- Product types, sizes, colors
- Customization areas & options

Social `Account` rows for real users are created at sign-in (see [auth-google.md](./auth-google.md)).

### Demo seed (optional, DEV only)

```bash
# .env.local: ALLOW_DEMO_SEED="true"
npm run db:seed:demo
```

See [demo-seed.md](./demo-seed.md) for credentials, guards, and dataset scope.

## Regenerate Prisma Client

After any schema change:

```bash
npx prisma generate
```

Import in server code:

```ts
import { prisma } from '@/src/server/db/prisma'
```

## Inspect data

```bash
npx prisma studio
```

## Initial migration (DEV)

| Item | Value |
|------|--------|
| Migration | `20260519204007_init` |
| Tables | 37 application tables + `_prisma_migrations` |
| Seed | Roles, permissions, catalog reference data |

## Optional DEV admin user

Requires Better Auth env + seed vars in `.env.local`:

```env
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
SEED_ADMIN_EMAIL="admin@chefroom.local"
SEED_ADMIN_PASSWORD="your-dev-password"
```

Then run `npm run db:seed`. See [auth.md](./auth.md).

## Troubleshooting

| Issue | Action |
|-------|--------|
| `Environment variable not found: DATABASE_URL` | Export `DATABASE_URL` or use `.env.local` in shell |
| `P1001` / connection errors | Check Neon is awake, IP allowlist, `sslmode=require` |
| Drift detected | `prisma migrate reset` **only in dev** (destructive) |

# Demo seed (DEV / Neon only)

Advanced, idempotent dataset for validating admin dashboard, storefront, orders, and customization flows.

**Never run against production.**

## Prerequisites

1. Base seed applied:

   ```bash
   npm run db:seed
   ```

2. In `.env.local`:

   ```env
   DATABASE_URL="postgresql://...neon.../..."
   BETTER_AUTH_SECRET="<at least 32 characters>"
   ALLOW_DEMO_SEED="true"
   NODE_ENV="development"
   ```

3. Optional full reset of demo rows before re-run:

   ```env
   ALLOW_DEMO_SEED_RESET="true"
   ```

## Commands

```bash
npm run db:seed:demo
# or base + demo:
npm run db:seed:all
```

## Guards

The demo seed aborts when:

- `DATABASE_URL` is missing
- `NODE_ENV=production`
- `ALLOW_DEMO_SEED` is not `"true"`
- `DATABASE_URL` contains prod markers (`prod`, `production`, `/main`, production domains)
- `BETTER_AUTH_SECRET` is missing

Passwords are hashed via **Better Auth** `signUpEmail` (stored on `Account.password`, not on `User`).

## Demo credentials

All accounts use password: **`12345678`** (do not use outside DEV).

### Admins

| Email | Role | Name |
|-------|------|------|
| cnoriegava@gmail.com | SUPERADMIN | Christian Noriega |
| cnoriegava+1@gmail.com | ADMIN | Admin Chef Room |
| cnoriegava+2@gmail.com | ADMIN | Operaciones Chef Room |
| cnoriegava+3@gmail.com | ADMIN | Ventas Chef Room |
| cnoriegava+4@gmail.com | ADMIN | Producción Chef Room |
| cnoriegava+5@gmail.com | ADMIN | Soporte Chef Room |

### Customers (20)

| Emails | Role |
|--------|------|
| `cliente.demo+1@chefroom.test` … `cliente.demo+20@chefroom.test` | CUSTOMER |

### Provider distribution

| Users | Auth |
|-------|------|
| `cliente.demo+1` … `+8` | Email/password only |
| `cliente.demo+9` … `+14` | Email/password + linked Google (`google-demo-user-{n}`) |
| `cliente.demo+15` … `+20` | Email/password + linked Facebook (`facebook-demo-user-{n}`) |

Social rows are **metadata only** for QA listings; login always works with email + `12345678`.

## What is seeded

- 8 demo products (`demo-*` slugs), images, variants, customization rules
- Designs, addresses, carts (ACTIVE / ABANDONED / CONVERTED)
- 25 orders (`CR-2026-000001` … `000025`) with items and events
- Conekta-style payments, attempts, webhook events (sanitized JSON)
- Shipments for shipped/delivered orders
- Email messages (RESEND provider enum → `OTHER` for demo)
- Audit logs (SUPERADMIN actor)

## What is NOT seeded

- Real Conekta / Cloudinary / email delivery
- Order claiming for guests
- GraphQL resolvers

## Reset behavior

With `ALLOW_DEMO_SEED_RESET=true`, only demo-scoped data is deleted:

- Users matching `cnoriegava@gmail.com`, `cnoriegava+*@gmail.com`, legacy `cnoriega+*@gmail.com`, or `@chefroom.test`
- Products with slug prefix `demo-`
- Orders with prefix `CR-2026-`

Base roles, permissions, and non-demo users are preserved.

## Manual verification script

```bash
npx tsx scripts/test-guest-merge.ts
```

See [guest-checkout.md](./guest-checkout.md) for guest session merge (separate from demo seed).

## Schema notes

The seed follows the current Prisma schema:

- `DesignStatus`: `DRAFT`, `SAVED`, `IN_CART`, `PURCHASED` (no `ACTIVE`)
- `CartStatus`: `CONVERTED` instead of `COMPLETED`
- `Order` / `CartItem`: totals on order; cart lines use `configSnapshotJson`
- `ProductVariant`: `stockQty`, `priceCents`

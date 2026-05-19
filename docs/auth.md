# Authentication (Better Auth)

Chef Room uses **[Better Auth](https://www.better-auth.com/)** for identity: email/password, social login (Google first), sessions, verification, and account linking.

**Business domain** (catalog, cart, orders, RBAC) stays in Prisma + GraphQL BFF at `/api/graphql`.

## Why Better Auth

- Maintained auth core (sessions, OAuth, credentials) instead of custom token/cookie code.
- Extensible for Google, Apple, Facebook, GitHub, Microsoft without redesigning DB auth tables.
- Fits Next.js App Router (`/api/auth/[...all]`) and Vercel serverless.

## Tables owned by Better Auth

| Prisma model | DB table | Purpose |
|--------------|----------|---------|
| `User` | `users` | Core user + Chef Room profile fields |
| `Session` | `sessions` | Server sessions (opaque token) |
| `Account` | `accounts` | Credential password + OAuth provider links |
| `Verification` | `verifications` | Email verify, password reset, OAuth state |

Chef Room fields on `User`: `status`, `firstName`, `lastName`, `phone`, `marketingOptIn`, `lastLoginAt`, `deletedAt`. Profile photo uses Better Auth `image` (not `avatarUrl`).

Passwords are stored on `Account.password` (hashed by Better Auth), **not** on `User`.

## Tables owned by Chef Room

| Models | Purpose |
|--------|---------|
| `Role`, `Permission`, `UserRole`, `RolePermission` | RBAC (ADMIN, CUSTOMER, SUPERADMIN) |
| `GuestSession` | Guest checkout / designs before register |
| `LoginAttempt` | Optional audit of login attempts |
| All catalog, cart, order, payment, shipment models | Business domain |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL (DEV for migrations) |
| `BETTER_AUTH_SECRET` | Yes | Min 32 characters; session signing (generate with `openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Yes | Public app URL — must match local/prod domain (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Recommended | Used by auth client + trusted origins |
| `NEXT_PUBLIC_APP_URL` | Recommended | Used by auth client + trusted origins |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | For Google | Enables provider when both set |
| `SEED_ADMIN_*` | Optional | DEV admin via `npm run db:seed` |
| `ADMIN_AUTH_ENFORCE` | Optional | `true` = proxy requires session cookie on `/admin/*` |

Generate secret (example):

```bash
openssl rand -base64 32
```

## DEV admin user

In `.env.local`:

```env
BETTER_AUTH_SECRET="your-32-char-secret"
BETTER_AUTH_URL="http://localhost:3000"
SEED_ADMIN_EMAIL="admin@chefroom.local"
SEED_ADMIN_PASSWORD="your-dev-password"
```

```bash
npm run db:seed
```

Creates user via `auth.api.signUpEmail`, assigns role **ADMIN**, never prints the password.

## Endpoints

| Path | Handler |
|------|---------|
| `/api/auth/*` | Better Auth (`toNextJsHandler`) |
| `/api/graphql` | GraphQL Yoga (business only) |

### Manual test (no UI)

**Sign up**

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"chef@example.com\",\"password\":\"securepass123\",\"name\":\"Ana Chef\"}" \
  -c cookies.txt
```

**Sign in**

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"chef@example.com\",\"password\":\"securepass123\"}" \
  -c cookies.txt -b cookies.txt
```

**Session**

```bash
curl http://localhost:3000/api/auth/get-session -b cookies.txt
```

**Sign out**

```bash
curl -X POST http://localhost:3000/api/auth/sign-out -b cookies.txt
```

Assign **CUSTOMER** role after first sign-up (until UI hooks exist):

```sql
-- Or via seed / admin script
INSERT INTO user_roles (...)
```

## Admin RBAC

- Middleware (Edge): optional cookie presence via `getSessionCookie` when `ADMIN_AUTH_ENFORCE=true`.
- Server layouts / resolvers: `requireAdminSession()` / `requireAdmin()` load session with `auth.api.getSession` and check `UserRole` in Prisma.
- Roles **ADMIN** and **SUPERADMIN** access admin; **SUPERADMIN** has all permissions.

## Guest checkout

`GuestSession` is unchanged. Guest merge after login is **not** implemented yet.

## Code map

| File | Role |
|------|------|
| `src/server/auth/build-auth.ts` | Better Auth config (shared with seed) |
| `src/server/auth/better-auth.ts` | App singleton |
| `src/lib/auth/auth-client.ts` | React client (future UI) |
| `src/app/api/auth/[...all]/route.ts` | Route handler |
| `src/server/auth/current-user.ts` | Session + RBAC → `CurrentUser` |
| `src/server/auth/require-admin.ts` | Admin guards |

## Google OAuth

Configure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. In Google Cloud Console add redirect URI:

```text
{BETTER_AUTH_URL}/api/auth/callback/google
```

Example local: `http://localhost:3000/api/auth/callback/google`

Storefront/admin login forms call `authClient.signIn.social({ provider: 'google' })`. See [auth-google.md](./auth-google.md).

## UI (storefront + admin)

| Surface | Component | Behavior |
|---------|-----------|----------|
| `/login`, `/register` | `LoginForm`, `RegisterForm` | Better Auth email + Google |
| Header | `PublicNavbarSession` | `useSession`, sign out |
| `/admin/login` | `LoginForm variant="admin"` | RBAC check after login |
| Admin shell | `requireAdminSession` | Server-side ADMIN/SUPERADMIN |

### CUSTOMER role

Assigned automatically via `databaseHooks.user.create.after` in `build-auth.ts`, plus `ensureCustomerRoleAction()` after email sign-up/sign-in from the UI (belt-and-suspenders).

## Adding more social providers

1. Add env vars in `.env.example`.
2. Register provider in `src/server/auth/build-auth.ts` under `socialProviders`.
3. Configure redirect URLs in the provider console → Better Auth callback paths.

## Security notes

- Session cookie is HttpOnly (Better Auth default).
- OAuth `accessToken` / `refreshToken` may be stored on `Account` when providers return them; consider encryption hooks before production scopes.
- Do not use GraphQL for login/register — use `/api/auth/*`.
- `LoginAttempt` remains for custom audit if needed.

## Pending

- [ ] Google account linking UX
- [ ] Guest session merge on sign-in
- [ ] Email provider (verification / reset)
- [ ] Auto-assign CUSTOMER role on sign-up (Better Auth hook)
- [ ] Encrypt OAuth tokens at rest if required

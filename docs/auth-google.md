# Google login (Better Auth)

Google sign-in is configured through **Better Auth** (`socialProviders.google` in `src/server/auth/build-auth.ts`), not the legacy custom `OAuthAccount` / `OAuthState` tables.

> **Deprecated:** `OAuthAccount`, `OAuthState`, `PasswordResetToken`, and `EmailVerificationToken` were removed in favor of Better Auth `Account` and `Verification`.

## Environment

```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
```

Redirect URI in Google Cloud Console:

```text
http://localhost:3000/api/auth/callback/google
```

(Use your production `BETTER_AUTH_URL` in production.)

## Expected flow (when UI is wired)

1. User clicks “Continuar con Google” → `authClient.signIn.social({ provider: 'google' })`.
2. Better Auth creates/updates `Account` with `providerId: google`.
3. Session cookie set; `User.image` / `firstName` / `lastName` mapped via `mapProfileToUser`.
4. Assign **CUSTOMER** role in Prisma (hook / post-sign-up job — pending).
5. **Guest merge** (pending): merge `GuestSession` carts/designs after login.

## Security notes

- Better Auth may persist OAuth tokens on `Account`; MVP uses default scopes only.
- Do not store card data in auth tables.
- For production, review token storage and enable encryption hooks if needed.

## Pending

- [ ] Google button in storefront / admin login
- [ ] Account linking UI
- [ ] Guest merge after OAuth
- [ ] CUSTOMER role assignment hook

See [auth.md](./auth.md) for full auth architecture.

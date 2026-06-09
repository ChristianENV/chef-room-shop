# Google login (Better Auth)

Google sign-in is configured through **Better Auth** (`socialProviders.google` in `src/server/auth/build-auth.ts`).

> **Deprecated:** `OAuthAccount`, `OAuthState`, `PasswordResetToken`, and `EmailVerificationToken` were removed in favor of Better Auth `Account` and `Verification`.

## Environment

```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Redirect URI in Google Cloud Console:

```text
http://localhost:3000/api/auth/callback/google
```

(Use your production `BETTER_AUTH_URL` in production.)

## Flow

1. User clicks **Iniciar sesión con Google** on `/login` or `/register` (shown when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set).
2. `authClient.signIn.social({ provider: 'google', callbackURL })` → Better Auth OAuth state stores the callback.
3. Google redirects to `/api/auth/callback/google`; Better Auth creates/updates `Account` with `providerId: google` and sets the session cookie.
4. Better Auth redirects to `/auth/social-complete?source=…&callbackUrl=…` (see `buildSocialOAuthCallbackURL`).
5. The server page (`completeSocialAuthAndRedirect`) reads the session cookie, assigns CUSTOMER role, merges guest session, then `redirect()`s to `callbackUrl` from post-checkout (e.g. `/account/orders/ORD-…?from=checkout&token=…`) instead of the landing page.

### Post-checkout

`post-checkout-order-modal` links to `login({ callbackUrl: postCheckoutOrderDetail(...) })`. That `callbackUrl` is preserved through Google OAuth and the social-complete step.

## Security notes

- Better Auth validates `callbackURL` against `trustedOrigins` (`BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`).
- OAuth tokens may persist on `Account`; MVP uses default scopes only.
- Do not store card data in auth tables.

## Pending

- [ ] Account linking UI

See [auth.md](./auth.md) for full auth architecture.

# Google login (schema + BFF — planned)

Chef Room uses **email/password** and **Google OAuth**, plus **guest checkout**. Session is stored in our DB (`Session`) with an **HttpOnly** cookie. Google tokens are **not** persisted in MVP.

## Expected flow (implementation pending)

1. **Start** — `GET /api/auth/google` (or similar)
   - Create `OAuthState` with hashed `state` (and optional PKCE `codeVerifierHash`).
   - Optionally set `guestSessionId` to merge guest cart/designs after login.
   - Redirect to Google authorization URL.

2. **Callback** — `GET /api/auth/google/callback`
   - Validate `state` against `OAuthState` (not expired, `usedAt` null).
   - Exchange `code` for tokens (server-side only; do not store tokens in DB).
   - Fetch Google profile (`sub`, email, name, picture).

3. **Account resolution**
   - `providerAccountId` = Google `sub`, `provider` = `GOOGLE`.
   - If `OAuthAccount` exists → sign in that `userId`.
   - Else if verified email matches existing `User.email` → link new `OAuthAccount`.
   - Else create `User` (role `CUSTOMER`), set `emailVerifiedAt` if Google verified email.

4. **Session**
   - Create `Session` with hashed token, set HttpOnly cookie.
   - Update `User.lastLoginAt`, `OAuthAccount.lastLoginAt`, optional `avatarUrl` from Google.

5. **Guest merge** (later)
   - If `OAuthState.guestSessionId` present → merge carts/orders/designs to user.

## Security notes

- Never store `access_token`, `refresh_token`, or `id_token` in `OAuthAccount` for MVP.
- Never store PAN/CVV or card data in auth tables.
- Mark `OAuthState.usedAt` after successful callback to prevent replay.

## Environment

See `.env.example`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`.

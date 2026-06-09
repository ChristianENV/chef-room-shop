# Guest checkout & session merge (V1)

## Cookie `chefroom_guest`

- **Name:** `chefroom_guest` (`GUEST_SESSION_COOKIE_NAME`)
- **TTL:** 30 days (`GUEST_SESSION_TTL_DAYS`)
- **Flags:** `httpOnly`, `sameSite=lax`, `path=/`, `secure` in production
- **Storage:** Only a random token in the cookie; `GuestSession.tokenHash` (SHA-256) in the database

Helpers live in `src/server/guest/guest-session.ts`.

## When is a `GuestSession` created?

**V1 decision:** We do **not** create a guest session on every storefront visit.

`getOrCreateGuestSession()` is called only from future guest actions, for example:

- Save / create a design as guest
- Add to cart (when the real cart API exists)
- Start guest checkout

Until those features call `getOrCreateGuestSession()`, visitors may have no cookie and nothing to merge.

## What merges on login / register?

After successful storefront **email** sign-in or sign-up, the UI calls `mergeCurrentGuestSessionAction()` (via `runPostAuthGuestMerge()`):

| Entity | Behavior |
|--------|----------|
| **Designs** | `userId` set where `guestSessionId` matches and `userId` is null |
| **Addresses** | `userId` set where `guestSessionId` matches and `userId` is null |
| **Cart (ACTIVE)** | Guest cart moved to user, or line items merged with dedupe on `productId` + `productVariantId` + `designId`; guest cart → `MERGED` |
| **GuestSession** | `mergedToUserId` set; cookie cleared on success |

Merge is **idempotent** for the same user. If the session was already merged to another user, merge returns `conflict: true` and does not move data.

Implementation: `src/server/guest/merge-guest-session.ts` (Prisma transaction + `AuditLog`).

## What does NOT merge yet

| Entity | Reason |
|--------|--------|
| **Orders** | No automatic order claiming until email verification and safe paid-order rules exist |
| **Paid / in-production orders** | Avoid insecure merge of payment-bound records |
| **OAuth-only first login** | Social redirect does not run form post-hooks; merge on next email login or future account callback |

## Orders rule (future)

Guest orders stay on `guestSessionId` until:

1. Real email verification exists
2. Explicit, secure “claim order” flow is defined (e.g. matching verified email + unpaid or policy-approved states)

Do not auto-assign `Order.userId` in V1.

## Manual testing

1. Create a guest session and data (script or DB):

   ```bash
   npx tsx scripts/test-guest-merge.ts
   ```

2. Set the printed cookie in the browser (DevTools → Application → Cookies) or use the script’s instructions.
3. Register or log in on `/register` or `/login`.
4. Confirm designs/addresses/cart are linked to the user and `guest_sessions.merged_to_user_id` is set.
5. Confirm `chefroom_guest` cookie is removed after merge.

## Pending (checkout real)

- Wire `getOrCreateGuestSession()` to customizer, cart API, and checkout
- Guest checkout flow + Conekta
- Email verification + secure order claiming
- Merge hook after OAuth callback (account page or Better Auth hook)
- E2E tests for merge and conflict paths

See also: [auth.md](./auth.md), [order-claim-transfer.md](./order-claim-transfer.md).

# Transactional emails (v1)

Server-only layer for order/payment notifications. Checkout and webhooks **never fail** if email delivery fails.

## Safety guardrails

Real email providers (`resend`, `mailtrap`) are **always blocked** when any of the following conditions is true:

| Condition                  | Effect                                       |
| -------------------------- | -------------------------------------------- |
| `NODE_ENV=test`            | Forces provider to `disabled` (silent no-op) |
| `CI=true`                  | Forces provider to `disabled`                |
| `DISABLE_EMAIL_SENDS=true` | Forces provider to `disabled`                |

These guards are checked in `resolveActiveEmailProvider` (`email.config.ts`) **before** any provider-specific logic. If a real provider was configured, a server-side warning is logged:

```
[email] Email provider disabled in test/CI environment. Configured provider "resend" will NOT be used.
```

This means automated tests and CI pipelines **can never accidentally send real emails**, regardless of what `EMAIL_PROVIDER` or API keys are set.

## Environment variables

| Variable              | Default                            | Description                                                |
| --------------------- | ---------------------------------- | ---------------------------------------------------------- |
| `EMAIL_PROVIDER`      | `console`                          | `console` \| `resend` \| `mailtrap`                        |
| `EMAIL_FROM`          | `Chef Room <no-reply@chefroom.mx>` | Sender header                                              |
| `RESEND_API_KEY`      | —                                  | Required when `EMAIL_PROVIDER=resend` (prod)               |
| `MAILTRAP_TOKEN`      | —                                  | Mailtrap Sending API token (optional)                      |
| `DISABLE_EMAIL_SENDS` | —                                  | Set to `true` to disable all real sends in any environment |

**Build** passes without keys. Missing Resend key in **production** throws only when sending with `EMAIL_PROVIDER=resend`. In development, missing keys fall back to **console**.

## Providers

| Logical    | Prisma `EmailProvider` | Behavior                                                                      |
| ---------- | ---------------------- | ----------------------------------------------------------------------------- |
| `disabled` | `OTHER`                | Silent no-op. No DB record skipped but no external call. Used in test / CI.   |
| `console`  | `OTHER`                | Logs to server console (`[email:console]`). Safe for local dev.               |
| `resend`   | `RESEND`               | [Resend](https://resend.com) API. Only used outside test/CI with key present. |
| `mailtrap` | `OTHER`                | Mailtrap Sending API (`send.api.mailtrap.io`). Optional staging channel.      |

## Environment behavior summary

| Environment                | Effective provider    | When                                         |
| -------------------------- | --------------------- | -------------------------------------------- |
| `NODE_ENV=test`            | `disabled` (always)   | Automated unit/integration tests             |
| `CI=true`                  | `disabled` (always)   | GitHub Actions / any CI runner               |
| `DISABLE_EMAIL_SENDS=true` | `disabled` (always)   | Manual opt-out for scripts/seeds             |
| Local dev (default)        | `console`             | `EMAIL_PROVIDER` not set or unrecognized     |
| Local dev (explicit)       | `resend` / `mailtrap` | Keys present; only for manual smoke tests    |
| Production/NP              | `resend` / `mailtrap` | `NODE_ENV=production`; throws if key missing |

## Templates

| `templateKey`                        | Trigger                                         | Subject pattern                              |
| ------------------------------------ | ----------------------------------------------- | -------------------------------------------- |
| `order_created`                      | After `createCheckoutOrder` (post-commit)       | Recibimos tu pedido {orderNumber}            |
| `payment_confirmed`                  | Conekta webhook: paid                           | Pago confirmado para tu pedido {orderNumber} |
| `payment_failed`                     | Conekta webhook: failed                         | No pudimos confirmar el pago…                |
| `payment_expired`                    | Conekta webhook: expired/cancelled              | Tu referencia de pago expiró…                |
| `email_verification`                 | Better Auth `sendVerificationEmail`             | Verifica tu correo en Chef Room              |
| `password_reset`                     | Better Auth `sendResetPassword`                 | Restablece tu contraseña de Chef Room        |
| `shipping_update`                    | Skydropx webhook: shipped                       | Tu pedido está en camino                     |
| `delivered`                          | Skydropx webhook: delivered                     | Tu pedido fue entregado                      |
| `order_claim_transfer_authorization` | `requestOrderClaimTransfer` (guest order claim) | Solicitud de transferencia de pedido         |

HTML uses brand color `#2B3280`, Spanish copy, minimal layout (no React Email).

### Tracking CTAs (order claim v1)

| Context                           | CTA link                        | Copy                                                                |
| --------------------------------- | ------------------------------- | ------------------------------------------------------------------- |
| Guest (`claimUrl`)                | `/claim-order?token=...`        | Crea tu cuenta para consultar el estado y seguimiento de tu pedido. |
| Authenticated (`accountOrderUrl`) | `/account/orders/[orderNumber]` | Consulta el estado de tu pedido desde tu cuenta.                    |
| Payment retry                     | `checkoutSuccessUrl`            | Completar / reintentar pago (sin email en URL)                      |

Helpers: `buildOrderClaimUrl`, `buildAccountOrderUrl`, `buildOrderEmailTrackingLinks` in `email.links.ts`. See `docs/order-claim.md`.

## Persistence (`EmailMessage`)

Prisma model fields used:

- `toEmail`, `subject`, `templateKey`, `orderId`
- `status`: `QUEUED` → `SENT` or `FAILED`
- `provider`, `providerMessageId`, `sentAt`
- `metadataJson`: orderNumber, totalCents, links, `logicalProvider`, `errorMessage` on failure

**Not stored:** PAN/CVV, Conekta raw payloads, card data.

**Idempotency (webhooks):** before send, checks existing `SENT` row for same `orderId` + `templateKey`.

## Code layout

```
src/server/email/
  email.config.ts
  email.errors.ts
  email.links.ts
  email.providers.ts
  email.service.ts      # sendTransactionalEmail, safeSend*
  email.templates.ts
  email.types.ts
```

## When emails fire

1. **Checkout** — `checkout.service.ts` after order transaction commits → `order_created`.
2. **Conekta webhook** — after DB update + `processedAt` → `payment_confirmed` / `payment_failed` / `payment_expired`.

## Local testing (console)

```env
EMAIL_PROVIDER=console
```

1. Complete checkout → server log `[email:console]` with `order_created`.
2. Prisma Studio → `email_messages` row `SENT`, `provider` `OTHER`, `metadataJson.logicalProvider` = `console`.

## Resend setup

1. Create API key at Resend.
2. Verify domain / use onboarding address in dev.
3. Set:

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
EMAIL_FROM="Chef Room <onboarding@resend.dev>"
```

4. Place a test order with your email.

## Prisma Studio

Filter `email_messages` by `orderId` or `templateKey`. On failure, `status` = `FAILED` and `metadataJson.errorMessage` explains why.

## Testing emails manually (non-test environment)

To verify real email delivery locally without accidentally sending in CI:

1. Use a dedicated test inbox (Mailtrap sandbox or personal address).
2. Set `EMAIL_PROVIDER=resend` (or `mailtrap`) + API key in `.env.local`.
3. Ensure `NODE_ENV` is **not** `test` and `CI` is not `true`.
4. Trigger the flow (e.g. place a test checkout order).
5. Inspect the email in your test inbox and the `email_messages` table in Prisma Studio.

> **Never** commit real API keys. Never run real-provider tests in automated CI.

## Not in v1

- Newsletter
- React Email components
- Background queue / retries
- Admin email log UI

## Related

- [checkout-ui.md](./checkout-ui.md)
- [conekta-sandbox.md](./conekta-sandbox.md)
- [graphql-checkout.md](./graphql-checkout.md)

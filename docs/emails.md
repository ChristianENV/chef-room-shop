# Transactional emails (v1)

Server-only layer for order/payment notifications. Checkout and webhooks **never fail** if email delivery fails.

## Environment

| Variable         | Default                            | Description                                  |
| ---------------- | ---------------------------------- | -------------------------------------------- |
| `EMAIL_PROVIDER` | `console`                          | `console` \| `resend` \| `mailtrap`          |
| `EMAIL_FROM`     | `Chef Room <no-reply@chefroom.mx>` | Sender header                                |
| `RESEND_API_KEY` | —                                  | Required when `EMAIL_PROVIDER=resend` (prod) |
| `MAILTRAP_TOKEN` | —                                  | Mailtrap Sending API token (optional)        |

**Build** passes without keys. Missing Resend key in **production** throws only when sending with `EMAIL_PROVIDER=resend`. In development, missing keys fall back to **console**.

## Providers

| Logical    | Prisma `EmailProvider` | Behavior                                                |
| ---------- | ---------------------- | ------------------------------------------------------- |
| `console`  | `OTHER`                | Logs to server console (`metadataJson.logicalProvider`) |
| `resend`   | `RESEND`               | [Resend](https://resend.com) API                        |
| `mailtrap` | `OTHER`                | Mailtrap Sending API (`send.api.mailtrap.io`)           |

## Templates (v1)

| `templateKey`        | Trigger                                   | Subject pattern                              |
| -------------------- | ----------------------------------------- | -------------------------------------------- |
| `order_created`      | After `createCheckoutOrder` (post-commit) | Recibimos tu pedido {orderNumber}            |
| `payment_confirmed`  | Webhook paid                              | Pago confirmado para tu pedido {orderNumber} |
| `payment_failed`     | Webhook failed                            | No pudimos confirmar el pago…                |
| `payment_expired`    | Webhook expired/cancelled                 | Tu referencia de pago expiró…                |
| `email_verification` | Better Auth `sendVerificationEmail`       | Verifica tu correo en Chef Room              |

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

## Not in v1

- Password reset / Better Auth verification emails
- Newsletter
- React Email components
- Background queue / retries
- Admin email log UI
- Shipping / CFDI emails

## Related

- [checkout-ui.md](./checkout-ui.md)
- [conekta-sandbox.md](./conekta-sandbox.md)
- [graphql-checkout.md](./graphql-checkout.md)

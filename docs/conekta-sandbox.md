# Conekta Sandbox v1

Hosted checkout (redirect) for Chef Room orders. No PAN/CVV is collected or stored on our servers.

## Environment variables

| Variable | Scope | Description |
|----------|--------|-------------|
| `CONEKTA_PRIVATE_KEY` | Server | Secret API key (`key_...`) for REST calls |
| `NEXT_PUBLIC_CONEKTA_PUBLIC_KEY` | Client | Public key for Checkout Component (future; optional in v1) |
| `CONEKTA_WEBHOOK_SECRET` | Server | Shared secret or Digest match for webhooks (dev) |
| `CONEKTA_WEBHOOK_PUBLIC_KEY` | Server | RSA public key PEM for Digest verification (production) |
| `CONEKTA_API_VERSION` | Server | Default `2.2.0` |
| `CONEKTA_ENV` | Server | `sandbox` or `production` (informational) |

Set these in `.env.local`. **Build passes without keys**; payment operations fail at runtime with a controlled GraphQL error.

## Sandbox keys

1. Sign in to [Conekta Dashboard](https://panel.conekta.com/) (sandbox mode).
2. Go to **API keys** and copy the private key (`key_...`).
3. Set `CONEKTA_PRIVATE_KEY` in `.env.local`.
4. Restart `npm run dev`.

## GraphQL: `createConektaCheckout`

```graphql
mutation CreateConektaCheckout($input: CreateConektaCheckoutInput!) {
  createConektaCheckout(input: $input) {
    orderNumber
    checkoutUrl
    checkoutId
    providerOrderId
    status
    amountCents
  }
}
```

**Input**

- `orderNumber` — local order (`CR-YYYY-######`)
- `email` — required for guests; must match `order.customerEmail`

**Authorization**

- Authenticated: `order.userId` must match session, or guest cookie matches `order.guestSessionId`.
- Guest: `email` + `chefroom_guest` cookie must match the order.

**Server flow**

1. Load order `PENDING_PAYMENT` and recalculate total from DB (never from client).
2. `POST https://api.conekta.io/orders` with `checkout.type: HostedPayment`.
3. Update `Payment.providerOrderId` → Conekta `ord_...`.
4. Create `PaymentAttempt` with sanitized JSON (no card data).
5. `OrderEvent` `PAYMENT_UPDATED`.

Returns `checkoutUrl` → redirect user to Conekta hosted page.

## Webhook

**URL:** `POST /api/webhooks/conekta`

Configure in Conekta panel → Webhooks → point to:

`https://<your-ngrok-or-domain>/api/webhooks/conekta`

**Idempotency:** `ConektaWebhookEvent.eventId` unique; already processed events return `200`.

**Events handled (via `event.type`):**

| Event pattern | Payment | Order |
|---------------|---------|-------|
| `order.paid`, `charge.paid` | `PAID` | `PAID` |
| `charge.failed` | `FAILED` | `PAYMENT_FAILED` |
| `order.expired`, `charge.expired` | `CANCELLED` | stays / note event |

**Security**

- Production: set `CONEKTA_WEBHOOK_PUBLIC_KEY` (RSA Digest per [Conekta docs](https://developers.conekta.com/docs/autenticación-webhooks)).
- Dev: optional `CONEKTA_WEBHOOK_SECRET` matched against `Digest` / `Authorization` headers.
- Without verification in production, webhooks are rejected.

## Redirect URLs

| URL | Purpose |
|-----|---------|
| `/checkout/success?token=<opaque>` | Conekta `success_url` / `failure_url` (preferred) |
| `/checkout/success?token=...&payment=failed` | Failure hint only |
| `/checkout/success?orderNumber=CR-...` | Legacy in-flight sessions |

Real payment state comes from `checkoutResultByToken` / `orderByNumber` + webhooks, not from `payment=failed`.

## Webhook testing (ngrok)

1. Run the app: `npm run dev`
2. Expose with ngrok: `ngrok http 3000`
3. In Conekta panel → **Webhooks** → add endpoint:
   `https://<subdomain>.ngrok-free.app/api/webhooks/conekta`
4. Copy the webhook public key into `CONEKTA_WEBHOOK_PUBLIC_KEY` (or use `CONEKTA_WEBHOOK_SECRET` in dev).
5. Create an order and complete Conekta checkout, or replay an event from the panel.

**Idempotency:** send the same `event.id` twice → second request returns `200` without duplicating `Payment` / `Order` updates. Check `conekta_webhook_events.processedAt` in Prisma Studio.

**Prisma Studio checks:**

| Model | Field | After `order.paid` |
|-------|--------|-------------------|
| `Order` | `status` | `PAID` |
| `Payment` | `status` | `PAID` |
| `ConektaWebhookEvent` | `processedAt` | set |

## `/checkout/success` (Payment Status UX)

Token path: `checkoutResultByToken` + polling every **5s** (max **24** attempts). Legacy: `orderByNumber` with sessionStorage email.

When webhook marks order `PAID`, UI shows **Pago confirmado** without manual refresh.

| BFF status | UI title |
|------------|----------|
| `PENDING` / `PENDING_PAYMENT` | Confirmando pago |
| `PAID` | Pago confirmado |
| `FAILED` / `PAYMENT_FAILED` | Pago no completado (+ auto-retry) |
| `CANCELLED` / `EXPIRED` | Pago expirado (+ auto-retry) |

Cash (`OXXO` → “Pago en efectivo”): reference/expiry from `PaymentAttempt.rawResponseJson` when available.

## Manual smoke

1. Add product → `/checkout` → **Continuar al pago** → Conekta redirect (same tab).
2. Complete payment in sandbox (test cards in Conekta docs).
3. Return to `/checkout/success?token=...` → polling → **Pago confirmado**.
4. Failed payment → auto-retry redirect via `retryCheckoutPayment`.
5. Guest success without login: summary + login/register dialog (no session error).

**Local webhook curl (dev secret):**

```bash
curl -X POST http://localhost:3000/api/webhooks/conekta \
  -H "Content-Type: application/json" \
  -H "Digest: <CONEKTA_WEBHOOK_SECRET-if-set>" \
  -d "{\"id\":\"evt_test_001\",\"type\":\"order.paid\",\"data\":{\"object\":{\"id\":\"ord_REPLACE\",\"object\":\"order\"}}}"
```

Replace `ord_REPLACE` with the `Payment.providerOrderId` from Prisma.

## Transactional emails

After webhook processing, the server may send (idempotent):

| Event | Email template |
|-------|----------------|
| Paid | `payment_confirmed` |
| Failed | `payment_failed` |
| Expired/cancelled | `payment_expired` |

See [emails.md](./emails.md). Email failures do not block webhook `200` responses.

## Frontend

- `useCompleteCheckoutMutation` — checkout submit
- `useCheckoutResultByTokenQuery` with `pollWhilePending`
- `useRetryCheckoutPaymentMutation` — retry redirect
- `getPaymentStatusUi` — copy and polling rules
- `CheckoutConektaPay` — retry-only on success (legacy `createConektaCheckout` fallback)

## Not in v1

- Card capture in our UI / saved cards
- Refunds, chargebacks, MSI
- Transactional emails
- Production hardening checklist (rate limits, alerting)
- 3DS configuration

## Related

- [graphql-checkout.md](./graphql-checkout.md)
- [checkout-ui.md](./checkout-ui.md)

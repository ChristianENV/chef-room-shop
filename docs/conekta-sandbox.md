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

Copy from `.env.example` into `.env.local`. **Build passes without keys**; payment operations fail at runtime with a controlled GraphQL error.

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

## Manual smoke

1. Add product → checkout → success page.
2. Success page calls `createConektaCheckout` → **Pagar ahora** opens Conekta URL.
3. Complete payment in sandbox (test cards in Conekta docs).
4. Webhook updates `Payment` + `Order` to `PAID`.
5. Wrong email → GraphQL `FORBIDDEN`.

**Local webhook testing:** use ngrok + Conekta panel, or POST a fixture:

```bash
curl -X POST http://localhost:3000/api/webhooks/conekta \
  -H "Content-Type: application/json" \
  -H "Digest: <your-dev-secret-if-configured>" \
  -d @fixtures/conekta-order-paid.json
```

## Frontend

- `useCreateConektaCheckoutMutation`
- `CheckoutConektaPay` on `/checkout/success`

## Not in v1

- Card capture in our UI / saved cards
- Refunds, chargebacks, MSI
- Transactional emails
- Production hardening checklist (rate limits, alerting)
- 3DS configuration

## Related

- [graphql-checkout.md](./graphql-checkout.md)
- [checkout-ui.md](./checkout-ui.md)

# Payments flow (Chef Room)

One-step checkout with Conekta HostedPayment and token-based success page.

## Happy path

1. **`/checkout`** — user completes form → `completeCheckout` mutation
2. **BFF** — creates `Order` (`PENDING_PAYMENT`), `CheckoutReturnToken` (48h), Conekta `HostedPayment`
3. **On Conekta OK** — cart → `CONVERTED`, `order_created` email, guest `OrderClaimToken`
4. **Browser** — `window.location.assign(paymentRedirectUrl)` (same tab)
5. **Conekta** — user pays → redirect to `/checkout/success?token=...`
6. **Success** — `checkoutResultByToken` + polling until webhook sets `PAID`; UI de confirmación ~30s con botones bloqueados mientras `confirming`

## GraphQL

| Operation | Purpose |
|-----------|---------|
| `completeCheckout` | Order + Conekta + `returnToken` + `paymentRedirectUrl` |
| `checkoutResultByToken(token)` | Public order summary (no session/email) |
| `retryCheckoutPayment({ token })` | New Conekta attempt for same order |
| `verifyMyOrderPayment(orderNumber)` | Account: manual Conekta sync (fallback to webhook) |
| `retryMyOrderPayment(orderNumber)` | Account: retry payment for owned order |
| `createCheckoutOrder` | Legacy: order only (cart converted immediately) |
| `createConektaCheckout` | Legacy: Conekta for existing order by `orderNumber` |

## Token model

- **`CheckoutReturnToken`** — opaque token in URL; SHA-256 hash in DB; 48h expiry
- Module: `src/server/checkout/checkout-return-token.ts`
- Success URLs: `src/lib/checkout-redirect-urls.ts` (`?token=` preferred, `?orderNumber=` legacy)

## Payment methods (UI)

| UI | BFF / Conekta |
|----|----------------|
| Tarjeta | `CARD` → `card` |
| Pago en efectivo | `OXXO` → `cash` |
| SPEI | `SPEI` → `bank_transfer` |

Cash reference/expiry (when available) stored in `PaymentAttempt.rawResponseJson`; success page reads via `checkoutResultByToken`.

## Source of truth

Conekta **webhook** updates `Payment.status` and `Order.status` → `PAID`. Success page polling reflects webhook updates.

**Manual verification** (`verifyMyOrderPayment` from `/account/orders`) calls Conekta `GET /orders/{ord_*}` when the webhook is delayed or missing. It uses the same `applyConektaPaymentStatusUpdate` helper as the webhook processor. It does **not** replace webhooks.

## Account payment actions

| Action | When shown | Backend |
|--------|------------|---------|
| Verificar pago | Pending / authorized / failed / cancelled | `verifyMyOrderPayment` |
| Continuar pago | Pending + cached `checkoutUrl` in attempts | Opens URL from BFF `paymentActions.paymentRedirectUrl` |
| Reintentar pago | Failed / expired / no valid URL | `retryMyOrderPayment` → `startConektaCheckoutForOrder` |

Limitations:

- Requires authenticated session; order must belong to user.
- Does not expose Conekta raw responses to the client.
- Does not mark paid from frontend or query params.

## Failure handling

| Failure | Cart | Order |
|---------|------|-------|
| Conekta error during `completeCheckout` | Stays `ACTIVE` | `PENDING_PAYMENT` (orphan; user retries from checkout) |
| Payment failed/expired after redirect | — | `retryCheckoutPayment` from success page |

## Key files

| Path | Role |
|------|------|
| `complete-checkout.service.ts` | Orchestration |
| `checkout-result.service.ts` | Token lookup |
| `payments.service.ts` | `startConektaCheckoutForOrder` |
| `checkout/page.tsx` | Submit + redirect |
| `checkout/success/page.tsx` | Token-first confirmation |

See also: [graphql-checkout.md](./graphql-checkout.md), [conekta-sandbox.md](./conekta-sandbox.md), [checkout-ui.md](./checkout-ui.md).

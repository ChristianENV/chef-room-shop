# GraphQL Checkout BFF (v1)

Converts the **ACTIVE** cart into an `Order` with `PENDING_PAYMENT`. Preferred path: **`completeCheckout`** (order + Conekta + return token in one step).

## Operations

### Mutation: `completeCheckout` (preferred)

```graphql
mutation CompleteCheckout($input: CreateCheckoutOrderInput!) {
  completeCheckout(input: $input) {
    orderNumber
    orderId
    status
    paymentStatus
    totalCents
    shippingCents
    currency
    paymentRedirectUrl
    paymentProviderOrderId
    paymentMethod
    successUrl
    returnToken
    claimUrl
    accountOrderUrl
  }
}
```

- Cart stays `ACTIVE` until Conekta checkout is created successfully.
- On Conekta OK: cart → `CONVERTED`, `order_created` email, guest claim token.
- Client redirects to `paymentRedirectUrl` (same tab).

### Mutation: `retryCheckoutPayment`

```graphql
mutation RetryCheckoutPayment($input: RetryCheckoutPaymentInput!) {
  retryCheckoutPayment(input: $input) {
    paymentRedirectUrl
    returnToken
    orderNumber
  }
}
```

Reuses existing order (`PENDING_PAYMENT` / `PAYMENT_FAILED`); no new order.

### Query: `checkoutResultByToken`

```graphql
query CheckoutResultByToken($token: String!) {
  checkoutResultByToken(token: $token) {
    orderNumber
    status
    paymentStatus
    totalCents
    paymentMethod
    items { name quantity totalPriceCents }
    paymentReference
    paymentExpiresAt
    cashPaymentLocations
    canViewDetails
    loginUrl
    registerUrl
  }
}
```

No session or email required. Used by `/checkout/success?token=...`.

### Mutation: `createCheckoutOrder` (legacy)

```graphql
mutation CreateCheckoutOrder($input: CreateCheckoutOrderInput!) {
  createCheckoutOrder(input: $input) {
    orderNumber
    orderId
    status
    paymentStatus
    totalCents
    shippingCents
    currency
    claimUrl
    accountOrderUrl
  }
}
```

Guest checkout returns `claimUrl`; authenticated returns `accountOrderUrl`. See `docs/order-claim.md`.

**Input highlights**

- `email`, `phone` — stored on the order
- `shippingAddress` — mapped to Prisma `Address` (`line1` = street, `line2` = ext/int, `label` = neighborhood/references)
- `billingAddress` — optional when `useSameBillingAddress: false`
- `paymentMethod` — `CARD` | `OXXO` | `SPEI` (OXXO UI label: “Pago en efectivo”)
- `shippingRateId` — id of selected `ShippingRate` from quote BFF (required unless `ALLOW_CHECKOUT_WITHOUT_SHIPPING=true` on server)
- Totals and shipping amounts are **never** accepted from the client — `shippingCents` comes from `ShippingRate.amountCents` in DB

### Shipping rate validation

`resolveCheckoutShippingRate` (see `checkout-shipping.ts`):

- Rate must belong to quote linked to the **same ACTIVE cart**
- Quote `userId` / `guestSessionId` must match checkout owner
- Rate must not be expired (`expiresAt`)
- Sets `selectedAt` on the rate if not already selected
- Links `ShippingQuote.orderId` after order creation
- Does **not** call Skydropx shipments / labels

### Query: `orderByNumber`

```graphql
query OrderByNumber($orderNumber: String!, $email: String!) {
  orderByNumber(orderNumber: $orderNumber, email: $email) {
    orderNumber
    status
    paymentStatus
    totalCents
    items { name quantity totalPriceCents }
  }
}
```

Returns `null` if the order does not exist or the email does not match `customerEmail` (case-insensitive).

> **Temporal / receipt only:** used by `/checkout/success` for polling and confirmation while the tab is open. **Not** for post-purchase tracking in emails or new features — use account order detail + claim token (`docs/order-claim.md`).

## Guest vs authenticated

| Context | Owner | Guest session |
|---------|--------|----------------|
| Logged in | `userId` on order + addresses | — |
| Guest | `guestSessionId` | Must exist via `chefroom_guest` cookie (not created at checkout if missing) |

If there is no active guest session: *Tu carrito está vacío o expiró.*

## Server flow (`completeCheckout`)

1. `createCheckoutOrderCore(..., { convertCart: false })`
2. `createCheckoutReturnToken(orderId)` — 48h opaque token
3. `startConektaCheckoutForOrder` with token-based redirect URLs
4. On Conekta OK: `finalizeCheckoutOrderSideEffects` (cart converted, email, claim token)

## Server flow (`createCheckoutOrder` legacy)

1. Resolve owner (auth user or existing guest session).
2. Load ACTIVE cart with items.
3. Resolve `shippingRateId` → `shippingCents` from DB (or 0 if dev override).
4. Recompute totals: subtotal + customization + shipping − discount + tax (tax/discount = 0).
5. Create shipping (+ billing) `Address` rows.
6. Create `Order` with real `shippingCents` and `totalCents`.
7. Create `OrderItem` rows with snapshots from cart.
8. Create `Payment` placeholder with `amountCents = totalCents`.
9. `PaymentAttempt` + `OrderEvent` (includes carrier/service when rate present).
10. `ShippingQuote.orderId` ← order id.
11. Cart → `CONVERTED`.

## Server env

| Variable | Purpose |
|----------|---------|
| `ALLOW_CHECKOUT_WITHOUT_SHIPPING` | If `true`, `shippingRateId` optional and `shippingCents = 0`. **Not for production MVP.** |

Client dev flag `NEXT_PUBLIC_ALLOW_CHECKOUT_WITHOUT_SHIPPING` only affects UI validation — server always enforces `ALLOW_CHECKOUT_WITHOUT_SHIPPING`.

## Conekta

`createConektaCheckout` uses `Order.totalCents` and `Order.shippingCents` via `shipping_lines` — no Conekta changes required when shipping is on the order.

## Manual smoke (GraphQL Playground / curl)

**Prerequisites:** items in ACTIVE cart (`addCartItem` or PDP).

```json
{
  "input": {
    "email": "guest@example.com",
    "phone": "+525551234567",
    "paymentMethod": "CARD",
    "useSameBillingAddress": true,
    "shippingAddress": {
      "firstName": "Ana",
      "lastName": "Chef",
      "phone": "+525551234567",
      "street": "Av. Reforma 100",
      "city": "Ciudad de México",
      "state": "CDMX",
      "country": "MX",
      "postalCode": "06600"
    }
  }
}
```

Then:

```graphql
query {
  orderByNumber(orderNumber: "CR-2026-000042", email: "guest@example.com") {
    orderNumber
    totalCents
  }
}
```

Use session cookies (`chefroom_guest` or Better Auth) on `POST /api/graphql`.

## Frontend

- `useCompleteCheckoutMutation` — `/checkout` submit + redirect
- `useCheckoutResultByTokenQuery` — success page token path
- `useRetryCheckoutPaymentMutation` — failed payment retry
- `useCreateCheckoutOrderMutation`, `useOrderByNumberQuery` — legacy

## Conekta (sandbox v1)

`completeCheckout` returns `paymentRedirectUrl`. Payment confirmation via webhook (`POST /api/webhooks/conekta`).

Legacy: `createConektaCheckout` after `createCheckoutOrder`.

See [conekta-sandbox.md](./conekta-sandbox.md) and [payments.md](./payments.md).

## Not in v1

- Coupons, real tax beyond shipping rate
- CFDI / RFC
- MSI, refunds

## Related

- [graphql-cart.md](./graphql-cart.md)
- [checkout-ui.md](./checkout-ui.md)
- [payments.md](./payments.md)

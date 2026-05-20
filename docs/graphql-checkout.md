# GraphQL Checkout BFF (v1)

Converts the **ACTIVE** cart into an `Order` with `PENDING_PAYMENT` — no Conekta charge, no emails.

## Operations

### Mutation: `createCheckoutOrder`

```graphql
mutation CreateCheckoutOrder($input: CreateCheckoutOrderInput!) {
  createCheckoutOrder(input: $input) {
    orderNumber
    orderId
    status
    paymentStatus
    totalCents
    currency
  }
}
```

**Input highlights**

- `email`, `phone` — stored on the order
- `shippingAddress` — mapped to Prisma `Address` (`line1` = street, `line2` = ext/int, `label` = neighborhood/references)
- `billingAddress` — optional when `useSameBillingAddress: false`
- `paymentMethod` — `CARD` | `OXXO` | `SPEI` (placeholder only)
- Totals are **never** accepted from the client

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

## Guest vs authenticated

| Context | Owner | Guest session |
|---------|--------|----------------|
| Logged in | `userId` on order + addresses | — |
| Guest | `guestSessionId` | Must exist via `chefroom_guest` cookie (not created at checkout if missing) |

If there is no active guest session: *Tu carrito está vacío o expiró.*

## Server flow (`createCheckoutOrder`)

1. Resolve owner (auth user or existing guest session).
2. Load ACTIVE cart with items.
3. Recompute totals from line items (`shipping` / `tax` / `discount` = 0 in v1).
4. Create shipping (+ billing) `Address` rows.
5. Create `Order` (`CR-YYYY-######`, `PENDING_PAYMENT`, `UNFULFILLED`).
6. Create `OrderItem` rows with `productSnapshotJson` / `designSnapshotJson` from cart snapshots.
7. Create `Payment` placeholder (`CONEKTA`, `PENDING`, `providerOrderId`: `checkout_pending_{orderId}`).
8. Create `PaymentAttempt` with sanitized placeholder JSON (no card data).
9. `OrderEvent` type `CREATED`.
10. Set cart `status` → `CONVERTED` (items kept).

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

## Frontend (prepared, UI not wired)

- `src/features/storefront/checkout/graphql/*`
- `src/features/storefront/checkout/api/*`
- Hooks: `useCreateCheckoutOrderMutation`, `useOrderByNumberQuery`

## Not in v1

- Conekta charges / webhooks
- Transactional emails
- Coupons, real tax/shipping
- CFDI / RFC
- Guest order claim by email only (no magic link)
- Checkout UI (`/checkout` still uses mocks)

## Related

- [graphql-cart.md](./graphql-cart.md)

# GraphQL — Shipping Quote BFF v1

Server-only Skydropx integration for quoting outbound shipping from the **active cart**. Checkout UI uses these operations in step Envío — see `docs/checkout-shipping-ui.md`. Hooks: `src/features/storefront/shipping/`.

## Operations

| Operation              | Type     | Description                                              |
| ---------------------- | -------- | -------------------------------------------------------- |
| `createShippingQuote`  | Mutation | Quote from active cart + destination CP                  |
| `shippingQuoteById`    | Query    | Load persisted quote + rates (no Skydropx call)          |
| `refreshShippingQuote` | Mutation | `GET /api/v1/quotations/:id` when `isCompleted` is false |
| `selectShippingRate`   | Mutation | Sets `selectedAt` on one rate, clears others             |

All mutations return `ShippingQuotePayload { quote, recommendedRate }`.

## Input rules

`CreateShippingQuoteInput.destination`:

- `postalCode` — required, 5 digits (Mexico)
- `city`, `state`, `country` — optional (`country` defaults to `MX`)

**Rejected from client:** weight, dimensions, `amountCents`, carrier prices, `userId`, `guestSessionId`.

## Auth & cart

- **Authenticated:** `userId` from Better Auth session; ACTIVE cart for that user.
- **Guest:** existing `chefroom_guest` cookie only — **no new guest session** is created.
- No active cart or empty cart → `BAD_REQUEST` — _Tu carrito está vacío._
- Quote/rate access is scoped to the same owner (`FORBIDDEN` otherwise).

## Package calculation

From cart line quantities via `getPackageForCartItems` (`src/server/shipping/shipping.package.ts`). See `docs/skydropx.md` for tier table.

## Persistence

- `ShippingQuote` — origin/destination CP, `packageJson`, Skydropx ids, `isCompleted`, `expiresAt` (24h)
- `ShippingRate` — one row per Skydropx rate; `expiresAt` 24h; `selectedAt` when chosen

Rates are replaced on each Skydropx refresh (`deleteMany` + `createMany`).

## recommendedRate

1. If any rate has `selectedAt`, that rate is returned.
2. Else cheapest `amountCents`.
3. Tie-break: lowest `estimatedDays` (null = slowest).

## Idempotency (v1)

`createShippingQuote` reuses the latest quote for the same `cartId` + `destinationPostalCode` when:

- created within **30 minutes**, and
- at least one non-expired rate exists.

Otherwise a new Skydropx quotation is created.

## Skydropx polling

After `createShippingQuote`, if `quote.isCompleted === false`, the client should call `refreshShippingQuote` until completed or rates stabilize (hooks: `useRefreshShippingQuoteMutation`).

## Checkout UI (rate selection)

- The storefront **deduplicates** `quote.rates` before display (see `shipping-rate-ranking.ts`).
- **`selectShippingRate`** is called when the customer picks a rate; **`createShippingQuote`** is not called again on selection.
- `recommendedRate` from the payload is preferred for the “Recomendado” highlight; if absent, the UI picks a balanced score (65% price / 35% days).

## Errors

| Code                        | When                                                   |
| --------------------------- | ------------------------------------------------------ |
| `BAD_REQUEST`               | Empty cart, invalid CP, expired rate                   |
| `FORBIDDEN`                 | Quote/rate owned by another session                    |
| `NOT_FOUND`                 | Unknown quote/rate id                                  |
| `SERVICE_UNAVAILABLE`       | Missing `SKYDROPX_CLIENT_ID` / `SECRET`                |
| `SKYDROPX_VALIDATION_ERROR` | Origen inválido, CP, teléfono, paquete, o Skydropx 422 |
| `SKYDROPX_AUTH_ERROR`       | Credenciales Skydropx rechazadas                       |
| `SKYDROPX_API_ERROR`        | Skydropx 5xx / 502                                     |

Build succeeds without Skydropx credentials; runtime calls throw `SERVICE_UNAVAILABLE`.

### Debug de cotización

```bash
SKYDROPX_DEBUG=true
pnpm tsx scripts/skydropx-create-quote-smoke.ts 72830
pnpm tsx scripts/skydropx-create-quote-smoke.ts 72830 --send --city "San Andrés Cholula" --state Puebla
```

Origen validado igual que guías (`validateShippingOriginForQuotation`). `SHIPPING_ORIGIN_REFERENCE` máximo **30 caracteres** (Skydropx trunca automáticamente si excede).

## Example — create quote (guest)

```graphql
mutation CreateShippingQuote($input: CreateShippingQuoteInput!) {
  createShippingQuote(input: $input) {
    quote {
      id
      isCompleted
      destinationPostalCode
      rates {
        id
        carrier
        amountCents
        selectedAt
      }
    }
    recommendedRate {
      id
      carrier
      amountCents
    }
  }
}
```

Variables:

```json
{
  "input": {
    "destination": { "postalCode": "03100", "city": "Ciudad de México", "state": "CDMX" }
  }
}
```

Requires items in cart and guest cookie from `addCartItem`.

## Pending

- [x] Checkout UI — rate selector (`docs/checkout-shipping-ui.md`)
- [x] `createCheckoutOrder` — `shippingRateId` → `shippingCents` on order (`docs/graphql-checkout.md`)
- [ ] Admin label generation
- [ ] Skydropx webhooks
- [ ] Tracking UI
- [ ] Redis OAuth cache

## Related

- `docs/skydropx.md` — API client & env
- `docs/graphql-cart.md` — cart owner resolution
- `docs/checkout-ui.md` — checkout (still `shippingCents = 0`)

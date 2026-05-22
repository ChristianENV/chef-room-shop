# Skydropx PRO — Shipping integration (Chef Room)

Chef Room uses **Skydropx PRO** (`api-pro.skydropx.com`) as the logistics aggregator for economical nationwide shipping in Mexico. This document covers the foundation layer, **Shipping Quote BFF** (`docs/graphql-shipping.md`), and **Admin Label BFF** (`docs/graphql-admin-shipping.md`). Admin UI for labels is a separate PR.

## Credentials

1. In Skydropx PRO: **Conexiones → API**
2. Copy **Client ID** and **Client Secret** (server-only)
3. Set in `.env.local`:

| Variable | Purpose |
|----------|---------|
| `SKYDROPX_ENV` | `sandbox` or `production` (logical label) |
| `SKYDROPX_API_BASE_URL` | Default `https://api-pro.skydropx.com` |
| `SKYDROPX_CLIENT_ID` | OAuth client id |
| `SKYDROPX_CLIENT_SECRET` | OAuth secret — never expose to the browser |
| `SKYDROPX_WEBHOOK_SECRET` | Webhook HMAC/Bearer/header (required in production) |

Missing credentials **do not** break `npm run build`. Any server call into the Skydropx client throws `SkydropxConfigError` at runtime.

## Authentication

- `POST /api/v1/oauth/token`
- `grant_type=client_credentials` with `client_id` and `client_secret` (`application/x-www-form-urlencoded`)
- Response: `access_token`, `expires_in` (7200 seconds = 2 hours)
- Implementation: `src/server/shipping/skydropx/skydropx.auth.ts` — in-memory cache per instance, refresh ~2 minutes before expiry
- **Rate limit:** 2 requests/second (account-level); `skydropx-rate-limit.ts` enforces 500ms spacing per serverless instance

For production at scale, consider **Redis** for shared token cache and request scheduling.

## API flow (target)

```mermaid
sequenceDiagram
  participant BFF as Checkout/Admin BFF
  participant DB as PostgreSQL
  participant SP as Skydropx PRO

  BFF->>SP: POST /quotations
  SP-->>BFF: quotation id
  BFF->>SP: GET /quotations/{id}
  SP-->>BFF: rates[]
  BFF->>DB: ShippingQuote + ShippingRate
  Note over BFF,SP: Customer selects rate at checkout
  BFF->>SP: POST /shipments/ (rate_id)
  SP-->>BFF: label + tracking
  BFF->>DB: Shipment + label fields
  SP-->>BFF: webhooks (future)
```

### Endpoints wrapped in client

| Method | Path | Client function |
|--------|------|-----------------|
| POST | `/api/v1/oauth/token` | `getSkydropxAccessToken` |
| POST | `/api/v1/quotations` | `createSkydropxQuotation` |
| GET | `/api/v1/quotations/{id}` | `getSkydropxQuotation` |
| POST | `/api/v1/shipments/` | `createSkydropxShipment` |
| GET | `/api/v1/shipments/{id}` | `getSkydropxShipment` |
| POST | `/api/v1/shipments/{id}/cancellations` | `cancelSkydropxLabelOrShipment` |
| GET | `/api/v1/shipments/tracking` | `getSkydropxTracking` |

## Origin (Puebla)

Configured via `SHIPPING_ORIGIN_*` env vars. Default postal code `72000`, city/state Puebla, country `MX`. Read with `getShippingOriginConfig()` in `src/server/shipping/shipping.config.ts`.

## Standard package (chef apparel v1)

Tiered by total garment quantity (`src/server/shipping/shipping.package.ts`):

| Quantity | Dimensions (L×W×H cm) | Weight (kg) |
|----------|------------------------|-------------|
| 1 | 30 × 20 × 5 | 0.5 |
| 2–3 | 35 × 25 × 8 | 0.9 |
| 4–6 | 40 × 30 × 12 | 1.5 |
| >6 | 40 × 30 × 12 | 1.5 + 0.15 kg per extra unit |

**Pending:** true multi-parcel shipments for large orders.

Env defaults (`SHIPPING_DEFAULT_PACKAGE_*`) match the single-garment tier.

## Database (Prisma)

- `ShippingQuote` — quote session linked to user/guest/cart/order
- `ShippingRate` — carrier options for a quote
- `ShippingWebhookEvent` — idempotent webhook inbox (not wired yet)
- `ShippingProvider.SKYDROPX`
- `Shipment` — provider, `providerShipmentId`, `labelUrl`, `quoteId`, `rateId`, `costCents`, `rawResponseJson` (migración `skydropx_shipments`)

## Code layout

```
src/server/shipping/
  shipping.config.ts
  shipping.package.ts
  skydropx/
    skydropx.config.ts
    skydropx.errors.ts
    skydropx.types.ts
    skydropx.auth.ts
    skydropx-rate-limit.ts
    skydropx.client.ts
    skydropx.mappers.ts
src/config/shipping.ts   # non-secret constants
```

All Skydropx modules use `import 'server-only'`.

## GraphQL BFF (v1)

Implemented in `src/server/graphql/modules/shipping/`:

- `createShippingQuote`, `shippingQuoteById`, `refreshShippingQuote`, `selectShippingRate`
- Hooks: `src/features/storefront/shipping/api/*` (UI not connected)

See `docs/graphql-shipping.md` for ownership, idempotency, and `recommendedRate` rules.

## Shipment mappers

`skydropx.mappers.ts`:

- `mapOrderToSkydropxShipmentPayload` — `rate_id`, origin, destination, `printing_format`
- `parseSkydropxShipmentResponse` — tracking, label URL, carrier, cost (defensivo)

## v1 decisions

- Checkout usa `shippingRateId` y `shippingCents` desde DB
- Admin genera guía **después de producción**, no al pagar
- Mappers usan parsing defensivo (`unknown`) en respuestas Skydropx
- Webhook route: `POST /api/webhooks/skydropx` — see `docs/skydropx-webhooks.md`

## Pending (next PRs)

- [x] Checkout shipping quote BFF — `docs/graphql-shipping.md`
- [x] Admin label BFF — `docs/graphql-admin-shipping.md`
- [ ] Admin UI: botón "Generar guía" en drawer de pedidos
- [x] Skydropx webhooks — `docs/skydropx-webhooks.md`
- [ ] Pickups API
- [ ] Tracking UI for customers and admin
- [ ] Redis-backed OAuth token cache
- [ ] Production carrier activation in Skydropx dashboard

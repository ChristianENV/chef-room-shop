# Checkout — Shipping quote UI

Integrates Skydropx shipping quotes into `/checkout` (step **Envío**) without changing `createCheckoutOrder` yet.

## Flow

1. Customer completes contact + shipping address (CP, city, state).
2. **Cotizar envío** calls `createShippingQuote` with destination only (no weight/dimensions/price from client).
3. Rates render in `ShippingRateSelector` with hierarchy (not a flat list of 20+ cards):
   - **Opciones destacadas** (max 3): recomendado, más económico, más rápido (badges can stack on one card).
   - **Más opciones de envío**: filtros siempre visibles; **3 tarifas visibles** por defecto; el resto colapsado (“Ver más tarifas”); al expandir, paginación de 8 en 8.
   - UI **deduplicates** rates by `providerRateId`, or `carrier + service + amount + days`.
4. Selecting a rate calls **`selectShippingRate` only** (never `createShippingQuote` again) → BFF sets `selectedAt`; `selectedShipping` comes from the mutation response.
5. If `isCompleted === false`, the UI polls with `refreshShippingQuote` (~2.5s, max 12 attempts).
6. Customer cannot advance to **Pago** without a selected rate (unless dev override below).
7. **Create order** sends `shippingRateId` only — server reads `amountCents` from DB.

## Components

| File | Role |
|------|------|
| `shipping-rate-selector.tsx` | Quote button, highlights, collapsible “otras opciones”, polling |
| `shipping-rate-card.tsx` | Carrier, price, badges, accessible select state |
| `lib/shipping-rate-ranking.ts` | Dedup, cheapest/fastest/recommended, sort/filter helpers |
| `shipping-quote-{loading,error,empty}.tsx` | States |

Checkout page: `src/app/(storefront)/checkout/page.tsx`  
Session draft: `checkout-shipping-session.ts` (`quoteId`, `selectedRateId`, summary).

## Order summary

Shows **Envío seleccionado** + **Total** including selected rate. `createCheckoutOrder` persists `Order.shippingCents` and `Order.totalCents` with shipping included.

## Dev override

Set in `.env.local`:

```env
NEXT_PUBLIC_ALLOW_CHECKOUT_WITHOUT_SHIPPING=true
```

Allows skipping rate selection when Skydropx returns `SERVICE_UNAVAILABLE`. **Do not enable in production.**

## Errors (Spanish)

| Case | Message |
|------|---------|
| Skydropx off | La cotización de envío no está disponible en este momento. |
| API failure | No pudimos cotizar el envío. Intenta de nuevo. |
| No rates | No encontramos tarifas para este destino. |
| Select rate failed | No pudimos guardar esta tarifa. Intenta de nuevo. |
| No selection | Selecciona una opción de envío para continuar. |

## Pending

- [x] `createCheckoutOrder` with `shippingRateId` → real `shippingCents` on order
- [ ] Admin label generation
- [ ] Webhooks / tracking UI
- [ ] Fallback UX when Skydropx is down in production (hold order vs manual quote)

## Related

- `docs/graphql-shipping.md`
- `docs/checkout-ui.md`
- `docs/skydropx.md`

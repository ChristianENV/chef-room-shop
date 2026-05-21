# Checkout — Shipping quote UI

Integrates Skydropx shipping quotes into `/checkout` (step **Envío**) without changing `createCheckoutOrder` yet.

## Flow

1. Customer completes contact + shipping address (CP, city, state).
2. **Cotizar envío** calls `createShippingQuote` with destination only (no weight/dimensions/price from client).
3. Rates render in `ShippingRateSelector`; `recommendedRate` shows **Recomendado** badge.
4. Selecting a rate calls `selectShippingRate` → `selectedAt` in DB.
5. If `isCompleted === false`, the UI polls with `refreshShippingQuote` (~2.5s, max 12 attempts).
6. Customer cannot advance to **Pago** without a selected rate (unless dev override below).

## Components

| File | Role |
|------|------|
| `shipping-rate-selector.tsx` | Quote button, rates list, polling |
| `shipping-rate-card.tsx` | Carrier, price, badges |
| `shipping-quote-{loading,error,empty}.tsx` | States |

Checkout page: `src/app/(storefront)/checkout/page.tsx`  
Session draft: `checkout-shipping-session.ts` (`quoteId`, `selectedRateId`, summary).

## Order summary

Shows **Envío seleccionado** + **Total estimado** including selected rate cents. Copy explains the amount applies on order confirmation in the next backend PR.

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
| No rates | No hay tarifas disponibles para este destino. |
| No selection | Selecciona una opción de envío para continuar. |

## Pending

- [ ] `createCheckoutOrder(input: { shippingRateId })` → persist `shippingCents` on order
- [ ] Admin label generation
- [ ] Webhooks / tracking UI
- [ ] Fallback UX when Skydropx is down in production (hold order vs manual quote)

## Related

- `docs/graphql-shipping.md`
- `docs/checkout-ui.md`
- `docs/skydropx.md`

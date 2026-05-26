# Checkout UI (storefront)

## Overview

`/checkout` uses the real cart from the Cart BFF (`myCart`) and completes purchase via **`completeCheckout`** (order + Conekta in one step).

## Flow

1. **Cart load** — `useMyCartQuery` loads the active cart (guest or authenticated).
2. **Steps** — Contact → shipping/billing → payment.
3. **Prefill (authenticated)** — `useMeProfileQuery` + `useMyAddressesQuery` prefill contact/shipping; `SavedAddressSelector` lets users keep or replace saved address.
4. **Submit** — `useCompleteCheckoutMutation` → `completeCheckout` (customer/address data only; totals from server).
5. **Redirect** — `window.location.assign(paymentRedirectUrl)` to Conekta (same tab). Minimal confirmation saved in `sessionStorage` (`returnToken`, `orderNumber`, etc.).
6. **Success** — Conekta redirects to `/checkout/success?token=...` → `checkoutResultByToken` + polling until webhook confirms `PAID`.

Legacy flow (`createCheckoutOrder` → success → manual Conekta) remains supported via `?orderNumber=` + sessionStorage email.

## GraphQL

| Operation | Purpose |
|-----------|---------|
| `myCart` | Checkout summary |
| `completeCheckout` | Order + Conekta + `paymentRedirectUrl` + `returnToken` |
| `checkoutResultByToken(token)` | Success page (no session/email) |
| `retryCheckoutPayment({ token })` | Retry Conekta from success |
| `createCheckoutOrder` | Legacy order-only |
| `orderByNumber(orderNumber, email)` | Legacy success fallback |

See [graphql-checkout.md](./graphql-checkout.md) and [payments.md](./payments.md).

## Payment methods

UI tabs: **Tarjeta**, **Pago en efectivo**, **SPEI** → BFF: `CARD`, `OXXO`, `SPEI`.

Cash payment points listed from `CASH_PAYMENT_LOCATIONS` (`src/config/payment-vars.ts`).

No card number, CVV, or bank details are collected on Chef Room.

## Guest checkout

- Guest cart tied to `chefroom_guest` cookie.
- Checkout BFF resolves owner from session; does not create guest session at checkout.
- Guest claim link sent by email (`order_created`); success page shows login/register CTAs without requiring session.

## Success page

`src/app/(storefront)/checkout/success/page.tsx`

Resolution priority:

1. `?token=` → `checkoutResultByToken` + polling
2. Legacy `?orderNumber=` + sessionStorage email → `orderByNumber`
3. sessionStorage fallback (`returnToken`, order snapshot)

UX:

- **Confirming (0–30s)** — progress bar + spinner, copy “Confirmando tu pago”, **Ver pedido** y **Seguir comprando** deshabilitados
- **Paid** — “Pago confirmado”; cuenta regresiva de 8s y redirección automática al detalle del pedido (o login/claim según sesión); el usuario puede ir ya o quedarse en la página
- **Failed / expired / cancelled** — retry Conekta + “Verificar pago nuevamente”
- **Pending after 30s** — mensaje de espera, “Verificar pago nuevamente”, seguir comprando habilitado, ver pedido con badge “Pago pendiente” si hay URL
- **Polling** — rápido (~4s) durante ~32s, luego lento (~12s) hasta ~2 min; no marca PAID en frontend
- **Guest without session** — resumen + diálogo login / registro / claim

## Validation

- `src/features/storefront/checkout/lib/checkout-form.validation.ts`
- `src/features/storefront/checkout/lib/checkout-step-validation.ts`

## Files

| Path | Role |
|------|------|
| `src/app/(storefront)/checkout/page.tsx` | Checkout flow + redirect |
| `src/app/(storefront)/checkout/success/page.tsx` | Token-first confirmation |
| `src/features/storefront/checkout/saved-address-selector.tsx` | Auth address picker |
| `src/features/storefront/checkout/mappers/checkout-ui.mapper.ts` | Cart → summary, prefill mapper |
| `src/features/storefront/checkout/lib/checkout-session.ts` | Session storage fallback |
| `src/lib/checkout-redirect-urls.ts` | Token-based success URLs |

## Conekta

Hosted checkout redirect; webhook confirms payment. See [conekta-sandbox.md](./conekta-sandbox.md).

## Transactional email

After successful `completeCheckout` (Conekta OK), server sends `order_created`. Failures do not roll back the order. See [emails.md](./emails.md).

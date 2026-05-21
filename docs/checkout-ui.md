# Checkout UI (storefront)

## Overview

`/checkout` uses the real cart from the Cart BFF (`myCart`) and creates orders via Checkout BFF v1 (`createCheckoutOrder`). Payment methods are placeholders until Conekta is integrated.

## Flow

1. **Cart load** — `useMyCartQuery` loads the active cart (guest or authenticated).
2. **Steps** — Contact → shipping/billing → payment (no card capture).
3. **Submit** — `useCreateCheckoutOrderMutation` sends customer and address data only (no totals, items, `userId`, or `guestSessionId`).
4. **Success** — Redirect to `/checkout/success?orderNumber=...` with confirmation stored in `sessionStorage` (email not in URL).

## GraphQL

| Operation | Purpose |
|-----------|---------|
| `myCart` | Checkout summary (items, subtotal, customization, total) |
| `createCheckoutOrder` | Creates `Order` with `PENDING_PAYMENT`, converts cart to `CONVERTED` |
| `orderByNumber(orderNumber, email)` | Success page detail |

## Payment methods (placeholder)

UI tabs: Tarjeta, OXXO, SPEI → BFF: `CARD`, `OXXO`, `SPEI`.

Copy shown to users: *Pago real pendiente de integración con Conekta.*

No card number, CVV, or bank details are collected.

## Guest checkout

- Guest cart is tied to `chefroom_guest` cookie (created when adding to cart).
- Checkout BFF resolves owner from session; does not create a new guest session at checkout.
- Orders link to `GuestSession` when unauthenticated, or `userId` when logged in.

## Success page

`src/app/(storefront)/checkout/success/page.tsx`

- Reads `orderNumber` from query string.
- Reads email from `sessionStorage` (`chefroom_checkout_confirmation`) for `orderByNumber`.
- Falls back to session payload if the query fails.
- Shows order number, `PENDING_PAYMENT`, total, payment method, and items when available.
- Guest CTA: **Crear cuenta para ver seguimiento** → `claimUrl` from `createCheckoutOrder` (stored in session).
- Authenticated CTA: **Ver pedido** → `/account/orders/[orderNumber]`.

Post-purchase tracking for guests: `/claim-order?token=...` from email (see `docs/order-claim.md`). `orderByNumber` remains for same-tab receipt/polling only.

## Validation

Zod schema: `src/features/storefront/checkout/lib/checkout-form.validation.ts`

Step helpers: `src/features/storefront/checkout/lib/checkout-step-validation.ts`

## Files

| Path | Role |
|------|------|
| `src/app/(storefront)/checkout/page.tsx` | Checkout flow |
| `src/app/(storefront)/checkout/success/page.tsx` | Confirmation |
| `src/features/storefront/checkout/mappers/checkout-ui.mapper.ts` | Cart → summary, form → mutation input |
| `src/features/storefront/checkout/lib/checkout-session.ts` | Session storage for success |
| `src/config/routes.ts` | `checkout`, `checkoutSuccess` |

## Conekta payment (sandbox v1)

On `/checkout/success`, `CheckoutConektaPay` calls `createConektaCheckout` and shows **Pagar ahora** → Conekta hosted checkout. See [conekta-sandbox.md](./conekta-sandbox.md).

## Transactional email (v1)

After `createCheckoutOrder` commits, the server sends `order_created` via `safeSendTransactionalEmail` (console/Resend). Failures do not roll back the order. See [emails.md](./emails.md).

## Payment Status UX (v1)

- `getPaymentStatusUi` drives banner copy, badge, and when to poll.
- `useOrderByNumberQuery({ pollWhilePending: true })` refetches every 5s while pending (max ~2 min).
- Email stays in `sessionStorage` (not in URL); cleared only after `PAID`.
- `payment=failed` in URL is informational after Conekta redirect only.

## Not in scope (v1)

- Card capture in Chef Room UI
- Refunds, MSI, saved cards
- Transactional emails
- Coupons, real shipping/taxes, CFDI
- **Real shipping quotes** — Skydropx foundation is in place (`docs/skydropx.md`); checkout still uses `shippingCents = 0` until the quote BFF PR
- Guest order claim
- Advanced public tracking

## Related docs

- `docs/graphql-cart.md`
- `docs/graphql-checkout.md`

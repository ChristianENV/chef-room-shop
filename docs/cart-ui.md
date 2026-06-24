# Cart UI — BFF integration

Storefront cart surfaces read from the GraphQL Cart BFF (`myCart` and mutations). Amounts from the API are in **cents**; UI mappers convert to pesos with `centsToPesos` before `formatCurrencyMXN`.

## Connected surfaces

| Surface                         | Query                                       | When it runs                                |
| ------------------------------- | ------------------------------------------- | ------------------------------------------- |
| `/cart`                         | `useMyCartQuery()`                          | On page load                                |
| `CartPopover` (desktop)         | `useMyCartQuery()`                          | Shared with navbar badge                    |
| Navbar badge (desktop + mobile) | `useCartBadgeCount()` → `myCart.totalItems` | On header mount (TanStack cache, 60s stale) |

## Guest session behavior

- The httpOnly cookie `chefroom_guest` is set when the server runs `getOrCreateGuestSession()` (inside `myCart`).
- The navbar badge calls `myCart` once on load so `totalItems` stays in sync; guests get a session on first storefront page view with chrome.
- Badge is hidden when `totalItems === 0`.

## Hooks

- `useMyCartQuery({ enabled? })` — fetch active cart
- `useAddCartItemMutation` — usado por customizador (`/customize`) con `designId`
- `useUpdateCartItemQuantityMutation` — quantity on `/cart`
- `useRemoveCartItemMutation` — remove line on `/cart`
- `useClearCartMutation` — available; no UI button yet

All mutations invalidate `cartQueryKeys.myCart()`.

## Mapper

`src/features/storefront/cart/mappers/cart-ui.mapper.ts`

- `mapBffCartToCartPage` — full cart page state (shipping promo + totals)
- `mapBffCartToCartPreview` — popover preview
- `mapBffCartItemToUiItem` — line item for `CartItemCard` / popover

## Mobile header

Mobile cart icon links to `routes.cart` (no popover). Badge uses the same `useCartBadgeCount()` as the desktop popover trigger.

## Diseño personalizado en UI

- `cart-ui.mapper.ts` prioriza `customizationSnapshot.previewUrl` como thumbnail del item personalizado.
- El resumen de personalización muestra:
  - badge de personalizado,
  - áreas,
  - y líneas de texto derivadas de `configJson.elements` (hasta 3).

## Pending

- PDP add-to-cart with `designId` (customizer) — see [product-add-to-cart.md](./product-add-to-cart.md)
- Checkout flow (still mock cart on `/checkout`)
- Conekta payments
- Guest → auth cart merge on login
- Mobile cart sheet (instead of link to `/cart`)
- PDP add-to-cart con designId (fuera del customizador)
- `clearCart` UI button

## Related docs

- [graphql-cart.md](./graphql-cart.md) — BFF schema and server rules

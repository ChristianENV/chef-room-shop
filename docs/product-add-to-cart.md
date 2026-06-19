# Product Add to Cart (PDP v1)

The product detail page (`/products/[slug]`) adds **non-customized** lines via the Cart BFF mutation `addCartItem`.

## Flow

1. User selects **color** (variant color slug) and **size** (uppercase label from BFF).
2. `ProductInfo` resolves `productVariantId` from `product.variants` (mapped in `mapCatalogProductToDetail`).
3. `useAddCartItemMutation` sends:

```graphql
mutation {
  addCartItem(input: { productId: "...", productVariantId: "...", quantity: 1 }) {
    totalItems
  }
}
```

4. On success, `cartQueryKeys.myCart()` is invalidated; navbar badge and `/cart` reflect the new line.
5. Inline success banner offers **Ver carrito** (`routes.cart`) and **Finalizar compra** (`routes.checkout`).

## Variant rules

- Multiple variants: user must pick color + size; otherwise: _Selecciona una talla y color para continuar._
- Single variant: auto-selected on load.
- Sizes without stock for the selected color are disabled (`stockQty === 0`).
- Quantity: 1–10 in UI (BFF allows up to 99).

## Guest session

The first `addCartItem` for an anonymous user creates/reuses `chefroom_guest` (same as `myCart`).

## Not in v1

- `designId` / customizer integration
- Checkout / Conekta
- Guest → auth cart merge
- Stock reservation
- Auto-opening `CartPopover` after add (popover loads `myCart` when opened)

## Related

- [graphql-cart.md](./graphql-cart.md) — Cart BFF schema
- [cart-ui.md](./cart-ui.md) — Cart page & popover UI

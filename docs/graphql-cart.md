# GraphQL Cart BFF (v1)

Storefront cart operations live on the business BFF at `/api/graphql`. Authentication uses Better Auth session cookies; guests use an httpOnly guest session cookie.

## Guest vs authenticated cart

| Context | Owner key | Cookie / session |
|--------|-----------|------------------|
| Guest | `guestSessionId` on `Cart` | `chefroom_guest` (httpOnly, 30 days, `sameSite=lax`, `secure` in production) |
| Logged-in customer | `userId` on `Cart` | Better Auth session |

`resolveCartOwner` (server) never accepts `userId` from the client:

1. If `context.currentUser` exists → cart scoped by `userId`.
2. Otherwise → `getOrCreateGuestSession()` creates or reuses `GuestSession` and sets `chefroom_guest`.

Guest sessions are **not** created for admin routes (referer guard in `guest-session.ts`).

### Pending: guest → auth merge

When a user logs in after browsing as a guest, carts are **not** merged automatically in v1. A future change should merge guest cart lines into the user’s ACTIVE cart and mark the guest session merged. See `src/server/guest/merge-guest-session.ts` for related groundwork.

## Operations

### Query

- `myCart: Cart!` — returns or creates the ACTIVE cart for the current owner.

### Mutations

- `addCartItem(input: AddCartItemInput!): Cart!`
- `updateCartItemQuantity(input: UpdateCartItemQuantityInput!): Cart!` — `quantity: 0` removes the line.
- `removeCartItem(itemId: ID!): Cart!`
- `clearCart: Cart!` — deletes all lines on the ACTIVE cart.

## Snapshots

Line items persist display data in `CartItem.configSnapshotJson`:

```json
{
  "productSnapshot": {
    "productId": "...",
    "variantId": "...",
    "slug": "filipina-clasica",
    "name": "...",
    "sku": "...",
    "imageUrl": "...",
    "productType": "Filipina",
    "colorName": "Blanco",
    "colorHex": "#FFFFFF",
    "sizeName": "M"
  },
  "customizationSnapshot": {
    "designId": "...",
    "previewUrl": "...",
    "summary": ["Logo pecho"],
    "areas": ["pecho"],
    "hasLogo": true,
    "hasEmbroidery": false,
    "embroideredName": null
  }
}
```

If snapshots are missing (legacy rows), the API rebuilds them from product/variant/design relations at read time.

## Totals

The Prisma `Cart` model does **not** store cent columns. Totals are computed when mapping to GraphQL:

- `subtotalCents` = Σ `unitPriceCents × quantity`
- `customizationTotalCents` = Σ `customizationPriceCents × quantity`
- `shippingCostCents` = `0` (v1)
- `discountTotalCents` = `0` (v1)
- `totalCents` = subtotal + customization + shipping − discount
- `totalItems` = Σ `quantity`

`customizationPriceCents` for a design is `max(0, design.configJson.finalPriceCents − basePrice)` when `finalPriceCents` is set.

## Security

GraphQL responses do **not** expose `userId`, `guestSessionId`, or guest token hashes.

## Examples

```graphql
query MyCart {
  myCart {
    id
    totalItems
    subtotalCents
    customizationTotalCents
    totalCents
    items {
      id
      quantity
      productSnapshot { name colorName sizeName }
      customizationSnapshot { hasLogo hasEmbroidery summary }
    }
  }
}
```

```graphql
mutation AddItem {
  addCartItem(input: {
    productId: "PRODUCT_UUID"
    productVariantId: "VARIANT_UUID"
    quantity: 1
  }) {
    totalItems
    totalCents
  }
}
```

## Frontend (prepared, not wired to UI)

- Documents: `src/features/storefront/cart/graphql/`
- API + hooks: `src/features/storefront/cart/api/`
- Types: `src/features/storefront/cart/types/cart-bff.types.ts`

Cart popover and `/cart` still use mocks until UI is connected.

## Not in v1

- Checkout and order creation
- Conekta payments
- Real shipping / tax / coupons
- Real customizer integration
- `localStorage` cart persistence
- Full guest → authenticated cart merge

## Manual smoke

1. **Guest:** `POST /api/graphql` with `myCart` (no auth cookie) → empty cart + `Set-Cookie: chefroom_guest`.
2. **Add item:** `addCartItem` with a real `productId` from catalog seed.
3. **Auth:** sign in as `cliente.demo+1@chefroom.test` / `12345678`, repeat `myCart` and mutations.
4. **Validation:** invalid `productId`, variant from another product, or another user’s `itemId` should return GraphQL errors (`NOT_FOUND` / `FORBIDDEN`).

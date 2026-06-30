# Product Options

Commercial product configuration options for Chef Room products.

## Overview

Product options are pre-defined configuration choices that customers can select when purchasing a product. Unlike product variants (color + size combinations) and free-form customizer personalization (logos, text, artwork), product options are structured commercial add-ons or modifications to the base product.

**Key distinction:**

- **Product variants**: Color + size SKU combinations (e.g., Filipina Blanca, size M)
- **Product options**: Commercial configuration choices (e.g., dry fit fabric, cargo pockets, +10cm length)
- **Customizer personalization**: Free-form user-uploaded designs (logos, embroidery artwork, text placement)

## Schema

Product options are defined via two models:

### ProductOptionGroup

Represents a group of related options (e.g., "Dry fit en espalda", "Bolsas", "Bordado").

**Fields:**

- `id` (UUID): Unique identifier
- `productId` (UUID, optional): If set, this option group applies to a specific product
- `productTypeId` (UUID, optional): If set, this option group applies to all products of this type
- `slug` (string): Kebab-case slug for the group (e.g., "dry-fit-back")
- `name` (string): Display name (e.g., "Dry fit en espalda")
- `description` (string, optional): Explanation for customers
- `inputType` (enum): `SINGLE_SELECT` or `BOOLEAN`
- `isRequired` (boolean): Whether the customer must make a selection
- `isActive` (boolean): Whether this option is currently available
- `sortOrder` (int): Display order
- `configJson` (JSON, optional): Flexible configuration for business rules

**Rules:**

- At least one of `productId` or `productTypeId` must be set
- Product-specific options override or extend product-type options
- Slug must be unique within the product or product type scope

### ProductOptionValue

Represents an individual choice within an option group (e.g., "Sin dry fit", "Con dry fit en espalda").

**Fields:**

- `id` (UUID): Unique identifier
- `optionGroupId` (UUID): Parent option group
- `slug` (string): Kebab-case slug for the value (e.g., "sin-dry-fit")
- `label` (string): Display label (e.g., "Sin dry fit")
- `description` (string, optional): Additional explanation
- `priceDeltaCents` (int): Price adjustment in centavos (positive = add, 0 = no change)
- `isDefault` (boolean): Whether this is the default selection
- `isActive` (boolean): Whether this value is currently available
- `sortOrder` (int): Display order within the group
- `configJson` (JSON, optional): Value-specific metadata

**Rules:**

- Slug must be unique within the option group
- Price delta must be non-negative (≥0)
- Only one value per group can be marked as default

## Seeded Options

### A. Chef Jackets / Filipinas

**Option Group: `dry-fit-back`**

- **Name**: Dry fit en espalda
- **Input Type**: SINGLE_SELECT
- **Required**: No
- **Applied To**: Product type `chef-jacket`

**Values:**

1. `sin-dry-fit`: Sin dry fit (default, 0¢)
2. `con-dry-fit`: Con dry fit en espalda (0¢)

**Config:**

```json
{
  "appliesToPanel": "back",
  "note": "Dry fit only applies to back panel"
}
```

### B. Pants / Pantalón

**Option Group: `pockets`**

- **Name**: Bolsas
- **Input Type**: SINGLE_SELECT
- **Required**: Yes
- **Applied To**: Product type `pants`

**Values:**

1. `sin-bolsas-cargo`: Sin bolsas cargo (default, 0¢)
2. `con-bolsas-cargo`: Con bolsas cargo (0¢)

**Config:**

```json
{
  "notes": "Cargo style includes side pockets and rear pockets"
}
```

### C. Apron / Mandil

#### C1. Embroidery Main Option

**Option Group: `embroidery`**

- **Name**: Bordado
- **Input Type**: SINGLE_SELECT
- **Required**: No
- **Applied To**: Product type `apron`

**Values:**

1. `sin-bordado`: Sin bordado (default, 0¢)
2. `con-bordado`: Con bordado (0¢)

#### C2. Embroidery Position

**Option Group: `embroidery-position`**

- **Name**: Posición del bordado
- **Input Type**: SINGLE_SELECT
- **Required**: No
- **Applied To**: Product type `apron`

**Values:**

1. `derecha`: Derecha (default, 0¢)
2. `izquierda`: Izquierda (0¢)

#### C3. Embroidery Size

**Option Group: `embroidery-size`**

- **Name**: Tamaño del bordado
- **Input Type**: SINGLE_SELECT
- **Required**: No
- **Applied To**: Product type `apron`

**Values:**

1. `chica`: Chica (0¢)
2. `mediana`: Mediana (default, 0¢)
3. `grande`: Grande (0¢)

#### C4. Apron Length

**Option Group: `apron-length`**

- **Name**: Largo del mandil
- **Input Type**: SINGLE_SELECT
- **Required**: No
- **Applied To**: Product type `apron`

**Values:**

1. `normal`: Largo normal (default, 0¢)
2. `mas-10cm`: +10 cm (0¢)

## Cart & Order Snapshots

Selected product options are preserved in cart items and order items via:

### CartItem

- `selectedOptionsJson` (JSON, optional): Snapshot of selected options
- `optionPriceCents` (int): Total option price delta for this item

### OrderItem

- `selectedOptionsJson` (JSON, optional): Snapshot of selected options at purchase time
- `optionPriceCents` (int): Total option price delta for this item

**Snapshot structure:**

```json
[
  {
    "groupId": "uuid",
    "groupSlug": "dry-fit-back",
    "groupName": "Dry fit en espalda",
    "valueId": "uuid",
    "valueSlug": "con-dry-fit",
    "valueLabel": "Con dry fit en espalda",
    "priceDeltaCents": 0
  }
]
```

**Why snapshots?**

- Orders must preserve option labels/prices even if Admin later edits option names
- Cart can store IDs + snapshot for real-time updates
- Order history is immutable

## Admin GraphQL API

### Queries

#### `adminProductOptionGroups`

Fetch option groups filtered by product or product type.

**Input:**

```graphql
input GetAdminProductOptionGroupsInput {
  productId: ID
  productTypeId: ID
  includeInactive: Boolean
}
```

**Returns:** `AdminProductOptionGroupsPayload`

#### `adminProductOptionGroupById`

Fetch a single option group by ID.

**Input:**

```graphql
input GetAdminProductOptionGroupInput {
  id: ID!
}
```

**Returns:** `AdminProductOptionGroupPayload`

### Mutations

#### `createAdminProductOptionGroup`

Create a new option group.

**Input:**

```graphql
input CreateAdminProductOptionGroupInput {
  productId: ID
  productTypeId: ID
  slug: String!
  name: String!
  description: String
  inputType: ProductOptionInputType!
  isRequired: Boolean!
  isActive: Boolean!
  sortOrder: Int!
  configJson: JSON
}
```

**Validation:**

- At least one of `productId` or `productTypeId` required
- Slug must be kebab-case
- Slug must be unique within product/product type scope

**Returns:** `AdminProductOptionGroupPayload`

#### `updateAdminProductOptionGroup`

Update an existing option group.

**Input:**

```graphql
input UpdateAdminProductOptionGroupInput {
  id: ID!
  slug: String
  name: String
  description: String
  inputType: ProductOptionInputType
  isRequired: Boolean
  isActive: Boolean
  sortOrder: Int
  configJson: JSON
}
```

**Returns:** `AdminProductOptionGroupPayload`

#### `archiveAdminProductOptionGroup`

Soft-delete an option group (sets `isActive = false`).

**Input:**

```graphql
input ArchiveAdminProductOptionGroupInput {
  id: ID!
}
```

**Returns:** `ArchiveAdminProductOptionGroupPayload`

#### `createAdminProductOptionValue`

Create a new option value.

**Input:**

```graphql
input CreateAdminProductOptionValueInput {
  optionGroupId: ID!
  slug: String!
  label: String!
  description: String
  priceDeltaCents: Int!
  isDefault: Boolean!
  isActive: Boolean!
  sortOrder: Int!
  configJson: JSON
}
```

**Validation:**

- Slug must be kebab-case
- Price delta must be non-negative (≥0)
- Slug must be unique within option group
- If `isDefault = true`, unset other defaults in same group

**Returns:** `AdminProductOptionValuePayload`

#### `updateAdminProductOptionValue`

Update an existing option value.

**Input:**

```graphql
input UpdateAdminProductOptionValueInput {
  id: ID!
  slug: String
  label: String
  description: String
  priceDeltaCents: Int
  isDefault: Boolean
  isActive: Boolean
  sortOrder: Int
  configJson: JSON
}
```

**Returns:** `AdminProductOptionValuePayload`

#### `archiveAdminProductOptionValue`

Soft-delete an option value (sets `isActive = false`).

**Input:**

```graphql
input ArchiveAdminProductOptionValueInput {
  id: ID!
}
```

**Returns:** `ArchiveAdminProductOptionValuePayloadGql`

## Implementation Status

✅ **Completed:**

- [x] Audit existing customization models
- [x] Prisma schema for ProductOptionGroup and ProductOptionValue
- [x] Prisma migration (`20260629120000_product_options`)
- [x] Cart/Order snapshot fields (`selectedOptionsJson`, `optionPriceCents`)
- [x] Seed initial option groups for chef jackets, pants, and apron
- [x] Admin GraphQL CRUD operations (queries & mutations)
- [x] Admin authentication guards
- [x] GraphQL type definitions
- [x] Validation (slug format, price deltas, uniqueness, default values)
- [x] Expose public product option groups via catalog/product BFF (server)
- [x] **Phase 1 foundation:** `src/server/product-options/` helpers (validation, snapshots, pricing)
- [x] Unit tests for commercial option helpers (`tests/unit/product-options.test.ts`)
- [x] **Phase 2 server wiring:** cart add-to-cart validation, persistence, dedup, totals, checkout copy
- [x] Cart GraphQL: `selectedCommercialOptions` input, `commercialOptionsSnapshot` output, `optionTotalCents`
- [x] Unit tests for cart/checkout wiring (`tests/unit/cart-product-options-wiring.test.ts`)
- [x] **Phase 3A PDP:** query `optionGroups`, selectors, estimated price display, `selectedCommercialOptions` on add-to-cart
- [x] Unit tests for PDP commercial options (`tests/unit/storefront-product-commercial-options.test.ts`)
- [x] **Phase 3B cart UI:** `commercialOptionsSnapshot` on cart lines, `optionTotalCents` in cart/checkout summaries
- [x] Unit tests for cart commercial options UI (`tests/unit/cart-commercial-options-ui.test.ts`)
- [x] **Phase 3C order detail:** `commercialOptionsSnapshot` on account/admin order items, option totals in summaries
- [x] Unit tests for order commercial options UI (`tests/unit/order-commercial-options-ui.test.ts`)
- [x] **Phase 4 admin UI:** Product Form “Opciones” tab for product-scoped commercial option groups/values
- [x] Unit tests for admin product options UI (`tests/unit/admin-product-options-ui.test.ts`)

⏳ **Pending:**

- [ ] Product-type-level / global option management in admin (API supports `productTypeId`; UI is product-specific only)
- [ ] Option dependency handling (e.g., embroidery position/size disabled until embroidery selected)
- [ ] Integration tests (cart, checkout, order)

## Phase 2 Cart & Checkout Wiring

### Naming separation

| Concept                    | Field / type                                                           | Used for                                          |
| -------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| Customizer personalization | `customizationSnapshot.selectedOptions`                                | Logo, text, fabric choices from 3D customizer     |
| Commercial product options | `commercialOptionsSnapshot` (GraphQL) / `selectedOptionsJson` (Prisma) | Dry fit, pockets, embroidery config, apron length |

Prisma keeps `selectedOptionsJson` on `CartItem` / `OrderItem` for commercial snapshots only at persistence layer. GraphQL exposes `commercialOptionsSnapshot` to avoid collision with customizer `selectedOptions`.

### Add to cart

`addCartItem(input: AddCartItemInput!)` accepts optional `selectedCommercialOptions`. Server validates via `validateSelectedProductOptions`, applies defaults, persists `optionPriceCents` + snapshot JSON, and deduplicates lines by:

`productId:variantId:designId:commercialOptionsKey`

### Cart totals

- Line: `(unitPriceCents + customizationPriceCents + optionPriceCents) × quantity`
- Cart: `optionTotalCents` summed across lines; included in `totalCents`

### Checkout

Order items copy `selectedOptionsJson` and `optionPriceCents` from cart lines without recalculating option prices.

## Phase 3A PDP

- `PRODUCT_BY_SLUG_QUERY` fetches `optionGroups` from catalog BFF.
- `ProductOptionSelectors` renders commercial options on the PDP (radio-card style).
- Defaults are pre-selected in UI state; required groups without a selection block add-to-cart.
- Estimated price on PDP = variant/base price + selected option deltas (**display only**; server pricing is authoritative).
- `addCartItem` sends `selectedCommercialOptions` with `groupId` + `valueId` only.

**Naming:** PDP uses `selectedCommercialOptions` / `commercialOptionSelections` — never `customizationSnapshot.selectedOptions`.

## Phase 3B Cart & Checkout UI

- `MY_CART_QUERY` fetches `optionTotalCents`, `optionPriceCents`, and `commercialOptionsSnapshot`.
- Cart drawer, cart page, and checkout review show commercial option labels per line (separate from customizer personalization).
- Cart summary shows **Opciones** row when `optionTotalCents > 0`.
- Final cart total uses server `totalCents` + estimated shipping.

## Phase 3C Order Detail Display

- `AccountOrderItem` and `AdminOrderItem` GraphQL types expose `optionPriceCents` and `commercialOptionsSnapshot` (mapped from `OrderItem.selectedOptionsJson`).
- Customer account order detail (`order-item-row`) shows **Opciones** per line via `CartCommercialOptionsSummary`.
- Admin order detail shows the same commercial options for production/ops (compact layout).
- Order totals may show an **Opciones** row when line option totals sum above zero (client-side sum from items; final total remains server `totalCents`).

**Naming:** Order detail uses `commercialOptionsSnapshot` / `optionPriceCents` — never customizer `selectedOptions` or `customizationSnapshot.selectedOptions`.

## Phase 4 Admin Product Form “Opciones” Tab

**Scope:** Product-specific commercial options only (`productId`). Product-type-level groups (`productTypeId`) remain API/seed managed until a dedicated admin surface is added.

**Location:** Admin → Products → Edit product → **Opciones** tab (`ProductCommercialOptionsTab`).

**Capabilities:**

- List option groups and values for the current product (includes inactive via `includeInactive: true`)
- Create / edit / archive groups (`name`, `slug`, `description`, `inputType`, `isRequired`, `isActive`, `sortOrder`)
- Create / edit / archive values (`label`, `slug`, `description`, `priceDeltaCents` via MXN input, `isDefault`, `isActive`, `sortOrder`)
- Empty state when no groups exist; create-mode message when product is not saved yet

**Client layer:**

| File | Role |
| ---- | ---- |
| `graphql/admin-product-options.queries.ts` | `adminProductOptionGroups` query |
| `graphql/admin-product-options.mutations.ts` | Group/value CRUD + archive mutations |
| `api/admin-product-options.api.ts` | `fetchGraphQL` wrappers |
| `api/use-admin-product-options.ts` | React Query hooks + cache invalidation |
| `mappers/admin-product-options-ui.mapper.ts` | Form mapping, MXN↔cents, validation |

**Naming:** Admin UI manages `ProductOptionGroup` / `ProductOptionValue` only — not `CustomizationOption` or customizer `selectedOptions`.

## Phase 1 Server Helpers

Commercial product options use explicit naming — **not** customizer `selectedOptions`.

| Module                                 | Purpose                                                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `validateSelectedProductOptions`       | Validates `selectedCommercialOptions` against server groups/values; applies defaults; enforces required groups |
| `buildProductOptionSnapshots`          | Builds `ProductOptionSnapshot[]` for cart/order `selectedOptionsJson`                                          |
| `calculateProductOptionsPriceCents`    | Sums `priceDeltaCents` from validated snapshots                                                                |
| `resolveApplicableProductOptionGroups` | Merges product + product-type groups (product wins on slug collision)                                          |

**Input type:** `ProductOptionSelectionInput` (`groupId`/`groupSlug` + `valueId`/`valueSlug`)

**Snapshot type:** `ProductOptionSnapshot` (stable display + server-side `priceDeltaCents`)

## Known Gaps

1. **Real price deltas**: Seeded option values may still have `priceDeltaCents = 0`. Configure pricing per product in Admin → Opciones.
2. **Option dependencies**: Embroidery position/size should be disabled or hidden until embroidery is selected. This can be implemented with:
   - Client-side UX rules
   - `configJson` metadata for dependencies
   - Helper text: "Selecciona bordado para configurar posición y tamaño"
3. **Size measurements**: Real product size tables are pending.
4. **Product-type options in admin**: GraphQL supports `productTypeId` scope; admin UI currently manages product-specific groups only.

## Next Steps

1. Product-type-level option management in admin (optional)
2. Guest checkout confirmation display of commercial options (if needed)
3. Add integration tests for cart/checkout/order flows
4. Option dependency UX on PDP (embroidery position/size)

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

⏳ **Pending:**
- [ ] Admin UI for managing product options
- [ ] Storefront PDP query/types for `optionGroups`
- [ ] Render option selectors on Storefront PDP
- [ ] Option price delta display and total price calculation on PDP
- [ ] Update add-to-cart flow to include `selectedCommercialOptions`
- [ ] Wire cart/checkout services to validate and persist commercial option snapshots
- [ ] Display selected options in cart/order detail (Admin & Storefront)
- [ ] Option dependency handling (e.g., embroidery position/size disabled until embroidery selected)
- [ ] Integration tests (cart, checkout, order)
- [ ] Documentation updates for storefront/cart/admin UI

## Phase 1 Server Helpers

Commercial product options use explicit naming — **not** customizer `selectedOptions`.

| Module | Purpose |
|--------|---------|
| `validateSelectedProductOptions` | Validates `selectedCommercialOptions` against server groups/values; applies defaults; enforces required groups |
| `buildProductOptionSnapshots` | Builds `ProductOptionSnapshot[]` for cart/order `selectedOptionsJson` |
| `calculateProductOptionsPriceCents` | Sums `priceDeltaCents` from validated snapshots |
| `resolveApplicableProductOptionGroups` | Merges product + product-type groups (product wins on slug collision) |

**Input type:** `ProductOptionSelectionInput` (`groupId`/`groupSlug` + `valueId`/`valueSlug`)

**Snapshot type:** `ProductOptionSnapshot` (stable display + server-side `priceDeltaCents`)


## Known Gaps

1. **Real price deltas**: All option values currently have `priceDeltaCents = 0`. Actual pricing needs to be configured based on business costs.
2. **Option dependencies**: Embroidery position/size should be disabled or hidden until embroidery is selected. This can be implemented with:
   - Client-side UX rules
   - `configJson` metadata for dependencies
   - Helper text: "Selecciona bordado para configurar posición y tamaño"
3. **Size measurements**: Real product size tables are pending.
4. **Admin UI**: No visual interface for managing options yet. Currently requires GraphQL mutations.
5. **Storefront integration**: Options exposed in catalog BFF server-side; PDP query/UI not wired yet.

## Next Steps

1. **Phase 2:** Extend `AddCartItemInput`, `cart.service.ts`, `checkout.service.ts` to accept `selectedCommercialOptions`, validate via `validateSelectedProductOptions`, persist snapshots and `optionPriceCents`
2. Add `optionGroups` to storefront PDP GraphQL query and render selectors
3. Display selected commercial options in cart and order views
4. Build Admin UI for option management
5. Add integration tests for cart/checkout/order flows
6. Configure real price deltas based on production costs

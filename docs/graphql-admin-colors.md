# GraphQL Admin Colors

Admin Color CRUD for reference data in the `colors` table. Requires authenticated admin (`ADMIN` or `SUPERADMIN` via `requireAdminGraphQL`).

## Queries

### `adminColors(includeInactive: Boolean): [AdminColor!]!`

Lists colors ordered by `sortOrder`, then name.

- Default `includeInactive: true` in Admin UI.
- When `includeInactive: false`, returns only `isActive: true` rows.

### `adminColorById(id: ID!): AdminColor`

Returns a single color or `null`.

## Mutations

### `createAdminColor(input: CreateAdminColorInput!): AdminColor!`

Creates a color.

Validation:

- `slug` — required, kebab-case, unique
- `name` — required
- `hex` — required, `#RRGGBB`
- At least one of `isFabricColor`, `isProductColor`, `isGeneralColor` must be `true`
- `sortOrder` — integer ≥ 0

### `updateAdminColor(id: ID!, input: UpdateAdminColorInput!): AdminColor!`

Partial update with the same validation rules when scope fields are sent.

### `archiveAdminColor(id: ID!): AdminColor!`

Soft-archive: sets `isActive: false`. Does **not** delete rows or variants.

Blocked when the color is referenced by **active** product variants (`ProductVariant.deletedAt: null` on variants whose parent product is `ACTIVE` and not deleted). Returns `CONFLICT` with usage details in extensions.

## Type `AdminColor`

| Field            | Type    |
| ---------------- | ------- |
| `id`             | ID!     |
| `slug`           | String! |
| `name`           | String! |
| `hexCode`        | String! |
| `isFabricColor`  | Boolean! |
| `isProductColor` | Boolean! |
| `isGeneralColor` | Boolean! |
| `isActive`       | Boolean! |
| `sortOrder`      | Int!    |
| `createdAt`      | String! |
| `updatedAt`      | String! |

## Relationship to product variants

- `adminProductFormOptions.colors` returns rows with `isProductColor: true` (includes inactive for legacy editing).
- Variant dropdown filters by `PRODUCT_TYPE_VARIANT_COLOR_SLUGS` **and** excludes fabric-only/inactive colors for new selections.
- `upsertAdminProductVariant` still validates allowed slugs server-side.

## Files

| Layer    | Path |
| -------- | ---- |
| Service  | `src/server/graphql/modules/admin-colors/admin-colors.service.ts` |
| Guards   | `src/server/graphql/modules/admin-colors/admin-colors.guards.ts` |
| Validation | `src/server/graphql/modules/admin-colors/admin-colors.validation.ts` |
| Resolver | `src/server/graphql/resolvers/admin-colors.resolver.ts` |
| Admin UI | `src/features/admin/colors/` |
| Page     | `src/app/(admin)/admin/(protected)/colors/page.tsx` |

## Example

```graphql
mutation CreateFabricColor {
  createAdminColor(
    input: {
      slug: "petrol-blue"
      name: "Azul petróleo"
      hex: "#1F4E5F"
      isFabricColor: true
      isProductColor: false
      isGeneralColor: false
      sortOrder: 150
    }
  ) {
    id
    slug
    isActive
  }
}
```

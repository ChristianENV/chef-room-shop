# Catalog colors

This document describes how color concepts are separated in Chef Room Shop before any Prisma schema changes.

## Concepts

### Fabric colors

Fabric colors are **design/customizer** colors used to tint 3D garment materials and store visual choices in `Design.configJson`. They live primarily in the static customizer palette:

- `src/features/storefront/customizer/constants/fabric-colors.ts`

The palette includes many tones (Esenciales, Neutros, Contemporáneos) that are **not** sellable product variants.

### Product / variant colors

Product variant colors are **sellable SKU** dimensions: `Product` + `Color` + `Size` → `ProductVariant`. They are stored in the database `colors` table and referenced by `ProductVariant.colorId`.

Variant colors must be allowed **per product type**. Rules are defined in:

- `src/config/catalog-colors.ts` → `PRODUCT_TYPE_VARIANT_COLOR_SLUGS`

| Product type (`ProductType.slug`) | Allowed variant colors                     |
| --------------------------------- | ------------------------------------------ |
| `chef-jacket`                     | `black`, `white`, `chef-blue`, `warm-gray` |
| `apron`                           | `black`, `white`                           |
| `pants`                           | `black`                                    |
| `shoes`                           | `black`                                    |

Unknown product types have **no** allowed variant colors (empty list).

### General colors

General colors are non-textile sellable colors (e.g. `black` for shoes). Today they are a subset of the same `colors` table; shoes use the `shoes` product-type rule (`black` only).

## Shared configuration

| File                               | Role                                                             |
| ---------------------------------- | ---------------------------------------------------------------- |
| `src/config/catalog-colors.ts`     | Runtime + seed source of truth for per-type variant color rules  |
| `prisma/seed-catalog-reference.ts` | Re-exports shared rules for Prisma seeds (sizes + color aliases) |
| `fabric-colors.ts`                 | Customizer fabric palette + fabric→catalog mapping               |

Seeds and tests must import variant color lists from the shared config (directly or via `seed-catalog-reference.ts`) so rules do not diverge.

## Fabric → catalog mapping

Customizer fabric ids and catalog slugs are not always identical. Only **explicit** mappings are allowed:

| Fabric id        | Catalog slug | Notes                                   |
| ---------------- | ------------ | --------------------------------------- |
| `chef-room-blue` | `chef-blue`  | Same hex `#2B3280` (confirmed in audit) |

`warm-gray` uses the same slug in both fabric palette and catalog; `getCatalogColorSlugForFabricColor` returns catalog slugs when the id is already known.

Fabric-only colors (e.g. `olive-green`, `petrol-blue`) **do not** map to catalog colors and must **not** be added to product variant matrices automatically.

## Enforcement status

**Phase 1:** shared config + documentation + tests (`src/config/catalog-colors.ts`).

**Phase 2:** Admin enforcement without Prisma schema changes (form filter + GraphQL validation).

**Phase 3 (current):** seed remediation soft-deletes active variants outside the canonical matrix for the five production catalog products. Orphan rows (e.g. mandil `chef-blue`) get `deletedAt` set; disposable `cart_items` pointing at those variants are removed. Order history is never deleted. Admin enforcement prevents recreating invalid combinations.

**Later:**

- Optional `Color` usage flags in schema

## Canonical seed matrices

Canonical production seed matrices use the shared rules:

- Filipinas (`chef-jacket`): all allowed garment colors × apparel sizes
- Mandiles (`apron`): black and white × apparel sizes
- Pantalones (`pants`): black × apparel sizes
- STICO (`shoes`): black × shoe sizes 22–30

Generated variants use `stockQty: 0` until updated in Admin when stock enforcement applies.

## Seed remediation (Phase 3)

After upserting canonical variants, `seedCanonicalProducts` calls `remediateCanonicalProductVariants` for each canonical product slug. Any **active** variant whose color×size is not in the seed matrix is soft-deleted (`deletedAt`). Cart rows tied only to those variants are removed; orders and order items are untouched.

Audit (read-only): `npx tsx scripts/catalog/audit-canonical-variants.ts`

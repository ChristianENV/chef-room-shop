# Catalog colors

This document describes how color concepts are separated in Chef Room Shop.

## Concepts

### Fabric colors

Fabric colors are **design/customizer** colors used to tint 3D garment materials and store visual choices in `Design.configJson`. They live in:

- Static customizer palette: `src/features/storefront/customizer/constants/fabric-colors.ts`
- Database `colors` rows with `isFabricColor=true`

The palette includes many tones (Esenciales, Neutros, Contemporáneos) that are **not** sellable product variants.

### Product / variant colors

Product variant colors are **sellable SKU** dimensions: `Product` + `Color` + `Size` → `ProductVariant`. They are stored in the database `colors` table and referenced by `ProductVariant.colorId`.

Variant colors must be allowed **per product type**. Base slug rules live in:

- `src/config/catalog-colors.ts` → `PRODUCT_TYPE_VARIANT_COLOR_SLUGS`
- `src/config/variant-color-eligibility.ts` → ProductType-aware resolver (scopes + Filipinas exception)

| Product type (`ProductType.slug`) | Allowed variant colors                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| `chef-jacket` (Filipinas)         | All **active fabric colors** (`isFabricColor=true`) plus explicit product colors when needed |
| `apron`                           | `black`, `white` (`isProductColor=true` only)                                                |
| `pants`                           | `black` (`isProductColor=true` only)                                                         |
| `shoes`                           | `black` (`isProductColor=true` only)                                                         |

**Filipinas exception:** active fabric colors from Admin Colors / customizer palette may be used as sellable variant colors. Fabric-only colors do **not** automatically appear for Mandil, Pantalón, Zapato, or other types.

Frontend matrix, Admin form filters, and GraphQL validation all use `isVariantColorEligibleForProductType()`.

### General colors

General colors (`isGeneralColor=true`) are non-textile sellable colors (e.g. `black` for shoes/accessories). They may overlap with product variant colors.

## Color scopes (Prisma)

| Field            | Meaning                                       |
| ---------------- | --------------------------------------------- |
| `isFabricColor`  | Usable in customizer / design tinting         |
| `isProductColor` | Usable as product variant SKU color           |
| `isGeneralColor` | General sellable color (e.g. accessories)     |
| `isActive`       | Visible/selectable; `false` = archived/hidden |
| `sortOrder`      | Admin list ordering                           |

Helpers: `src/lib/color-scopes.ts`

## Shared configuration

| File                                      | Role                                                |
| ----------------------------------------- | --------------------------------------------------- |
| `src/config/catalog-colors.ts`            | Slug allowlists per product type (seed + reference) |
| `src/config/variant-color-eligibility.ts` | ProductType + scope resolver for Admin variants     |
| `prisma/seed-colors.data.ts`              | Product + fabric-only color seed rows               |
| `prisma/seed-catalog-reference.ts`        | Re-exports shared rules for Prisma seeds            |
| `fabric-colors.ts`                        | Customizer fabric palette + fabric→catalog mapping  |

## Fabric → catalog mapping

Customizer fabric ids and catalog slugs are not always identical. Only **explicit** mappings are allowed:

| Fabric id        | Catalog slug | Notes                                   |
| ---------------- | ------------ | --------------------------------------- |
| `chef-room-blue` | `chef-blue`  | Same hex `#2B3280` (confirmed in audit) |

`warm-gray` uses the same slug in both fabric palette and catalog.

Fabric-only DB slugs (e.g. `olive-green`, `chef-room-blue`) **do not** map to catalog variant colors for restricted product types. For **Filipinas (`chef-jacket`)**, active fabric colors are eligible variant colors without adding them to `PRODUCT_TYPE_VARIANT_COLOR_SLUGS`.

## Admin Color Management

Route: `/admin/colors`

Admins can create/edit/deactivate colors with scope flags. Deactivation sets `isActive=false` (no hard delete).

When to set scopes:

| Use case                          | Flags                                        |
| --------------------------------- | -------------------------------------------- |
| Customizer-only fabric            | `isFabricColor` only                         |
| Sellable variant (filipina, etc.) | `isFabricColor` + `isProductColor` (+ rules) |
| Shoes/accessories general black   | `isProductColor` + `isGeneralColor`          |

See `docs/graphql-admin-colors.md` for GraphQL operations.

## Enforcement status

**Phase 1:** shared config + documentation + tests.

**Phase 2:** Admin product form filter + GraphQL validation (no schema scope flags).

**Phase 3:** seed remediation for canonical products.

**Phase 4 (current):** `Color` scope fields + fabric palette seeded in DB + Admin Colors CRUD. Customizer still uses static palette; DB fabric colors prepare future BFF integration without changing storefront runtime.

## Canonical seed matrices

Canonical production seed matrices use the shared rules:

- Filipinas (`chef-jacket`): all allowed garment colors × apparel sizes
- Mandiles (`apron`): black and white × apparel sizes
- Pantalones (`pants`): black × apparel sizes
- STICO (`shoes`): black × shoe sizes 22–30

Generated variants use `stockQty: 0` until updated in Admin when stock enforcement applies.

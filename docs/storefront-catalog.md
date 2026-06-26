# Storefront catalog (GraphQL BFF)

## Data flow

1. Client pages use TanStack Query hooks → `catalog.api` / `products.api`.
2. API modules call `fetchGraphQL` → `POST /api/graphql`.
3. Responses map to legacy `Product` UI type via `catalog-ui.mapper.ts` / `product-ui.mapper.ts`.

## TanStack Query

**Provider:** `src/providers/app-providers.tsx` wraps `ThemeProvider` + `QueryProvider` in root `layout.tsx`.

Defaults: `staleTime` 60s, `retry` 1, `refetchOnWindowFocus` false. Devtools in development only.

### Query keys

- `catalogQueryKeys` — `src/features/storefront/catalog/api/catalog.query-keys.ts`
- `productQueryKeys` — `src/features/storefront/products/api/products.query-keys.ts`

### Hooks

| Hook                       | Purpose                                       |
| -------------------------- | --------------------------------------------- |
| `useProductsQuery(params)` | Product list with BFF filters/sort            |
| `useCatalogFiltersQuery()` | `productTypes`, `colors`, `sizes` for sidebar |
| `useProductQuery(slug)`    | PDP by slug                                   |
| `useShopNavCategories()`   | Dynamic navbar/footer shop category links     |

## `/shop` filtering

1. **Reference data** — `useCatalogFiltersQuery()` populates filter sidebar from active `ProductType` rows.
2. **URL category param** — `/shop?category=` uses **`ProductType.shopSlug`** (falls back to `slug` when `shopSlug` is null).
3. **Products** — `useProductsQuery(buildProductsQueryParams(filters, sort))` calls BFF with:
   - Single `productTypeSlug` when one category selected (internal slug, e.g. `chef-jacket`, `shoes`)
   - Single `colorSlug` / `sizeSlug` when one selected
   - `isCustomizable` when checkbox active
4. **Client-only** — Multi-select category/color/size, price range, popular/rating sort via `applyClientFilters`.
5. **Unknown categories** — Invalid `?category=` values do **not** fall back to Filipinas; the shop shows an empty state instead.

Filter state stores **internal ProductType slugs** in `categories`, `colors`, `sizes`.

## Product categories (`ProductType`)

`ProductType` is the **source of truth** for storefront categories (Prisma `product_types`):

| Field          | Purpose                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------- |
| `slug`         | Internal stable key (e.g. `chef-jacket`, `shoes`) — used in BFF filters                  |
| `shopSlug`     | Public `/shop?category=` value (e.g. `filipinas`, `zapatos`)                             |
| `nameEs`       | Spanish label in filters, cards, PDP, nav                                                |
| `sortOrder`    | Order for filters, nav, landing                                                          |
| `isActive`     | When `false`, category is hidden from storefront filters                                 |
| `showInNav`    | When `false`, category is excluded from navbar/footer/landing nav                        |
| `cardImageUrl` | Optional landing/category card image (R2 WebP URL); takes priority over static fallbacks |
| `cardImageAlt` | Alt text for the category card image on the landing                                      |

Seeded via `pnpm db:seed`. Admin manages categories at `/admin/categories`.

**Canonical products** (`prisma/seed-canonical-products.data.ts`): Filipina Clásica, Filipina Executive, Mandil Profesional Chef, Pantalón Chef Comfort, Zapato STICO Real Safety — all **ACTIVE** with full variant matrices. Seed remediation soft-deletes any non-canonical active variants (e.g. legacy mandil `chef-blue`). PDP color swatches come from **non-deleted** variants only. Archived/test products are **not** in production seed.

**STICO Real Safety** is under `shoes` / `zapatos` with `customizable: false` and black × sizes 22–30 variants (non-customizer PDP flow).

### Helpers

- `src/features/storefront/catalog/product-type.helpers.ts` — public slug resolution, labels, active/nav filters
- `src/config/shop-category.ts` — `/shop?category=` ↔ filter state sync
- `src/features/storefront/catalog/build-shop-nav-categories.ts` — nav link builder

## Pages

| Route              | Data                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `/shop`            | TanStack: filters + products                                                                                     |
| `/products/[slug]` | Server `generateMetadata` (Prisma `getProductBySlug`) + client `ProductPageClient` (`useProductQuery` + related) |

### PDP metadata (`/products/[slug]`)

Server wrapper (`page.tsx`) calls `buildProductPageMetadata`:

| Field              | Source                                                       |
| ------------------ | ------------------------------------------------------------ |
| `title`            | `seoTitle` → `name`                                          |
| `description`      | `seoDescription` → `shortDescription` → `description`        |
| OG / Twitter image | `seoImageId` → primary `ProductImage` → first by `sortOrder` |

Resolver: `src/lib/product-seo-image.ts` (`resolveProductOgImageUrl`). No new image upload on storefront — uses existing `ProductImage` URLs from catalog BFF / Prisma.

| `/customize` | TanStack: `useCustomizableProductsQuery` + default filipina via `useProductQuery` |
| `/customize/[slug]` | TanStack: `useProductQuery(slug)` + reglas de personalización |

Product cards and PDP display **`product.productType.nameEs`** (mapped to `Product.category`) and link to shop using **`categoryShopSlug`**.

CTAs de producto deben usar `routes.customizeProduct(slug)`. CTAs genéricos usan `routes.customize`.

Both are client components with loading / error / empty states. User-facing errors are generic (no GraphQL internals).

## Still on mocks

- `lib/mock-data.ts` — cart, checkout, account, admin, landing featured, demos
- `CustomizationSummaryCard` — static areas/options
- Production time / material filters — UI only (no BFF)

## Pendientes

- Pagination real (cursor/offset UX)
- Sorting avanzado server-side
- GraphQL codegen
- Wire `CustomizationSummaryCard` to `customizationRules`
- Real images in cards/gallery

## Landing category card images

The landing **Colecciones** section (`CategorySection`) resolves each nav category image in this order:

1. `ProductType.cardImageUrl` from the BFF (`productTypes` query)
2. Static asset map by `shopSlug` (`landing-media.ts` — e.g. filipinas, mandiles, pantalones)
3. Neutral premium fallback visual when neither exists

Admins manage card images from `/admin/categories` (R2-backed upload). Storefront exposes `cardImageUrl` and `cardImageAlt` only — not `cardImagePublicId`.

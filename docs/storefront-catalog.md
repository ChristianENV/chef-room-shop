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

| Field       | Purpose                                                                 |
| ----------- | ----------------------------------------------------------------------- |
| `slug`      | Internal stable key (e.g. `chef-jacket`, `shoes`) — used in BFF filters |
| `shopSlug`  | Public `/shop?category=` value (e.g. `filipinas`, `zapatos`)            |
| `nameEs`    | Spanish label in filters, cards, PDP, nav                               |
| `sortOrder` | Order for filters, nav, landing                                         |
| `isActive`  | When `false`, category is hidden from storefront filters                |
| `showInNav` | When `false`, category is excluded from navbar/footer/landing nav       |

Seeded via `pnpm db:seed`. Admin manages categories at `/admin/categories`.

**STICO Real Safety** (`zapato-stico-real-safety`) is seeded as `DRAFT` under `shoes` / `zapatos` with `customizable: false` and no variants until price, SKU, stock, and images are confirmed. Shoes use color/size variants (not the customizer).

### Helpers

- `src/features/storefront/catalog/product-type.helpers.ts` — public slug resolution, labels, active/nav filters
- `src/config/shop-category.ts` — `/shop?category=` ↔ filter state sync
- `src/features/storefront/catalog/build-shop-nav-categories.ts` — nav link builder

## Pages

| Route               | Data                                                                              |
| ------------------- | --------------------------------------------------------------------------------- |
| `/shop`             | TanStack: filters + products                                                      |
| `/products/[slug]`  | TanStack: `useProductQuery` + related from `useProductsQuery`                     |
| `/customize`        | TanStack: `useCustomizableProductsQuery` + default filipina via `useProductQuery` |
| `/customize/[slug]` | TanStack: `useProductQuery(slug)` + reglas de personalización                     |

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
- `generateMetadata` for PDP (server wrapper)
- Wire `CustomizationSummaryCard` to `customizationRules`
- Real images in cards/gallery
- Landing category hero images for new categories (neutral fallback used until media is added)

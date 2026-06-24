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

## `/shop` filtering

1. **Reference data** — `useCatalogFiltersQuery()` populates filter sidebar (Spanish labels from BFF `name`).
2. **Products** — `useProductsQuery(buildProductsQueryParams(filters, sort))` calls BFF with:
   - Single `productTypeSlug` when one category selected (`chef-jacket`, `apron`, `pants`)
   - Single `colorSlug` / `sizeSlug` when one selected
   - `isCustomizable` when checkbox active
3. **Client-only** — Multi-select category/color/size, price range, popular/rating sort via `applyClientFilters`.

Filter state stores **BFF slugs** in `categories`, `colors`, `sizes`.

## Pages

| Route               | Data                                                                              |
| ------------------- | --------------------------------------------------------------------------------- |
| `/shop`             | TanStack: filters + products                                                      |
| `/products/[slug]`  | TanStack: `useProductQuery` + related from `useProductsQuery`                     |
| `/customize`        | TanStack: `useCustomizableProductsQuery` + default filipina via `useProductQuery` |
| `/customize/[slug]` | TanStack: `useProductQuery(slug)` + reglas de personalización                     |

CTAs de producto deben usar `routes.customizeProduct(slug)`. CTAs genéricos usan `routes.customize`.

Both are client components with loading / error / empty states. User-facing errors are generic (no GraphQL internals).

## Still on mocks

- `lib/mock-data.ts` — cart, checkout, account, admin, landing featured, demos
- `CustomizationSummaryCard` — static areas/options
- Production time / material filters — UI only (no BFF)

## Pendientes

- Pagination real (cursor/offset UX)
- URL query params for filters
- Sorting avanzado server-side
- GraphQL codegen
- `generateMetadata` for PDP (server wrapper)
- Wire `CustomizationSummaryCard` to `customizationRules`
- Real images in cards/gallery

# Storefront catalog (GraphQL BFF)

## Data flow

1. Client pages call `getCatalogProducts` / `getProductBySlug` in `src/features/storefront/catalog/api` and `products/api`.
2. API modules use `fetchGraphQL` → `POST /api/graphql`.
3. Responses map to legacy `Product` UI type via `catalog-ui.mapper.ts` / `product-ui.mapper.ts`.

## Pages connected

| Route | Source |
|-------|--------|
| `/shop` | `getCatalogProducts` + client-side filters |
| `/products/[slug]` | `getProductBySlug` + related from catalog list |

Both are **client components** (`'use client'`) with loading / error / empty states.

## Still on mocks

- `lib/mock-data.ts` — cart, checkout, account, admin, landing featured, demos
- `CustomizationSummaryCard` — static areas/options (rules from BFF not wired to card yet)

## Pendientes

- TanStack Query hooks + `QueryProvider`
- Server Components + `generateMetadata` for PDP SEO
- Wire filter sidebar to `getCatalogFilters()` reference data
- Real images in cards/gallery when Cloudinary URLs exist
- `CustomizationSummaryCard` from `customizationRules`

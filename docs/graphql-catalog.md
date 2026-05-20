# Catalog BFF (GraphQL v1)

Business catalog queries live at `POST /api/graphql`. Authentication is **not** required for catalog reads.

## Manual test queries

### Health

```graphql
query Health {
  health
}
```

### Products (listing)

```graphql
query Products {
  products(limit: 8) {
    total
    items {
      id
      slug
      name
      basePriceCents
      productType {
        slug
        name
      }
      images {
        url
        alt
        isPrimary
      }
      variants {
        sku
        priceCents
        color {
          name
          hexCode
        }
        size {
          name
        }
      }
    }
  }
}
```

### Product by slug (PDP)

Demo seed slug example: `demo-filipina-executive-blanca`

```graphql
query ProductBySlug {
  productBySlug(slug: "demo-filipina-executive-blanca") {
    id
    name
    slug
    customizationRules {
      area {
        slug
        name
      }
      option {
        slug
        name
        basePriceCents
      }
    }
  }
}
```

### Filter reference data

```graphql
query Filters {
  productTypes {
    slug
    name
  }
  colors {
    slug
    name
    hexCode
  }
  sizes {
    slug
    name
  }
}
```

## cURL smoke test

```bash
curl -s -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ health products(limit: 1) { total items { slug } } }"}'
```

## Rules

- Only `ACTIVE` products with `deletedAt: null`
- Variant `priceCents` falls back to product `basePriceCents` when null
- Amounts are integers in **cents** (no currency formatting in GraphQL)

## Client documents

- `src/features/storefront/catalog/graphql/catalog.queries.ts`
- `src/features/storefront/products/graphql/product.queries.ts`

Storefront UI is not wired yet; connect when TanStack Query (or fetch helper) is in place.

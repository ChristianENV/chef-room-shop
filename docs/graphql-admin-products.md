# Admin Products GraphQL BFF (v1)

Gestión de catálogo para el dashboard Chef Room. Requiere sesión **ADMIN** o **SUPERADMIN**. **CUSTOMER** recibe `FORBIDDEN`.

## Autenticación

Todas las operaciones usan `requireAdminGraphQL` (mismo guard que admin-dashboard / admin-orders).

## Queries

| Query | Descripción |
|-------|-------------|
| `adminProducts` | Lista paginada con filtros |
| `adminProductById` | Detalle por UUID |
| `adminProductBySlug` | Detalle por slug |
| `adminProductFormOptions` | Tipos, colores y tallas para formularios |

### Ejemplo listado

```graphql
query AdminProductsList {
  adminProducts(limit: 5, filter: { status: "ACTIVE" }) {
    total
    items {
      id
      slug
      name
      status
      basePriceCents
      productType { slug name }
      variants { sku priceCents }
    }
  }
}
```

### Filtros

- `search` — name, slug, description
- `productTypeSlug`
- `status` — `DRAFT` \| `ACTIVE` \| `ARCHIVED`
- `customizable`
- `includeArchived` — incluye filas con `deletedAt` (por defecto se excluyen)

Orden default: `updatedAt desc`. Límite default 20, máx 100.

## Mutations

| Mutation | Descripción |
|----------|-------------|
| `createAdminProduct` | Crea producto + AuditLog CREATE |
| `updateAdminProduct` | Actualiza campos + AuditLog UPDATE |
| `archiveAdminProduct` | `status: ARCHIVED` + `deletedAt: now` |
| `duplicateAdminProduct` | Copia producto, imágenes, variantes y reglas de personalización |
| `updateAdminProductStatus` | Solo cambia status; ACTIVE limpia `deletedAt` |
| `upsertAdminProductVariant` | Crea/actualiza variante |
| `deleteAdminProductVariant` | Soft delete (`deletedAt`) |
| `upsertAdminProductImage` | URL placeholder (sin Cloudinary) |
| `deleteAdminProductImage` | Borra imagen; reasigna primary |

## Reglas de slug

- Si no se envía `slug`, se genera con `slugifyProductName(name)`.
- Colisiones → sufijo `-2`, `-3`, … (incluye productos archivados; `slug` es único en BD).
- Duplicar usa `{slug-original}-copia` + sufijo si hace falta.

## Reglas de SKU

- Formato auto: `CR-{SLUG}-{COLOR}-{SIZE}` (normalizado).
- Colisiones → sufijo numérico.
- Variante única por `(productId, colorId, sizeId)`.

## Archive vs delete

- **archiveAdminProduct:** `status = ARCHIVED` y `deletedAt = now` (oculto en storefront y listado admin por defecto).
- **deleteAdminProductVariant:** soft delete; no borra físico (histórico de pedidos).
- **deleteAdminProductImage:** borrado físico de fila `ProductImage`.

## Storefront

`products` / `productBySlug` del catalog BFF solo exponen `status: ACTIVE` y `deletedAt: null`. Productos archivados no aparecen en `/shop`.

## Modelo (Prisma, sin cambios en v1)

- `Product.basePriceCents`, `customizable`, `ProductStatus`
- `ProductVariant.priceCents` opcional (fallback `basePriceCents`)
- `Color.hex` → GraphQL `hexCode`
- `currency` en GraphQL siempre `MXN` (no hay columna en BD)

## Frontend (hooks listos, UI pendiente)

- `src/features/admin/products/api/*`
- `src/features/admin/products/graphql/*`
- `/admin/products` sigue usando `lib/mock-data.ts`

## Pendientes (v1)

- Upload Cloudinary real
- CRUD de ProductType / Color / Size
- Bulk import / export CSV
- Inventario avanzado
- CRUD completo de reglas de personalización en UI admin
- SEO automation

## Smoke manual

Admin: `cnoriega+2@gmail.com` / `12345678`

1. `adminProductFormOptions`
2. `adminProducts(limit: 5)`
3. `createAdminProduct` → `updateAdminProduct` → `duplicateAdminProduct`
4. `upsertAdminProductVariant` / `upsertAdminProductImage`
5. `archiveAdminProduct`
6. Customer: queries admin → `FORBIDDEN`

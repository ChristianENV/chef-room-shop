# Admin Products GraphQL BFF (v1)

Gestión de catálogo para el dashboard Chef Room. Requiere sesión **ADMIN** o **SUPERADMIN**. **CUSTOMER** recibe `FORBIDDEN`.

Las **categorías** (`ProductType`) tienen operaciones dedicadas en [graphql-admin-product-types.md](./graphql-admin-product-types.md).

## Autenticación

Todas las operaciones usan `requireAdminGraphQL` (mismo guard que admin-dashboard / admin-orders).

## Queries

| Query                     | Descripción                                              |
| ------------------------- | -------------------------------------------------------- |
| `adminProducts`           | Lista paginada con filtros                               |
| `adminProductById`        | Detalle por UUID                                         |
| `adminProductBySlug`      | Detalle por slug                                         |
| `adminProductFormOptions` | Tipos (`ProductType`), colores y tallas para formularios |

Las **categorías** del formulario provienen de `ProductType` dinámico (`nameEs`, `slug`, `sortOrder`, `isActive`). Tras crear/editar categorías en `/admin/categories`, la query se invalida vía `adminProductsQueryKeys.formOptions()`.

Los productos pueden crearse con `customizable: false` (por ejemplo calzado): no requieren reglas de personalización ni modelo 3D, pero sí admiten variantes color/talla e imágenes.

### Producto STICO (catálogo canónico)

`Zapato STICO Real Safety` (`slug: zapato-stico-real-safety`) forma parte del seed canónico en `prisma/seed-canonical-products.data.ts` con estado **`ACTIVE`**, `customizable: false`, variantes negro × tallas 22–30, precio/stock/SKU según datos confirmados en NP. **Filipina Clásica** (`demo-filipina-chef-room`) se siembra como **`DRAFT`** (sin variantes en NP; activar en admin cuando existan tallas/SKU reales). Los productos archivados/de prueba no se siembran en `pnpm db:seed` (solo en `pnpm db:seed:demo` con `ALLOW_DEMO_SEED=true`).

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
      productType {
        slug
        name
      }
      variants {
        sku
        priceCents
      }
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

| Mutation                    | Descripción                                                     |
| --------------------------- | --------------------------------------------------------------- |
| `createAdminProduct`        | Crea producto + AuditLog CREATE                                 |
| `updateAdminProduct`        | Actualiza campos + AuditLog UPDATE                              |
| `archiveAdminProduct`       | `status: ARCHIVED` + `deletedAt: now`                           |
| `duplicateAdminProduct`     | Copia producto, imágenes, variantes y reglas de personalización |
| `updateAdminProductStatus`  | Solo cambia status; ACTIVE limpia `deletedAt`                   |
| `upsertAdminProductVariant` | Crea/actualiza variante                                         |
| `deleteAdminProductVariant` | Soft delete (`deletedAt`)                                       |
| `upsertAdminProductImage`   | URL placeholder (sin Cloudinary)                                |
| `deleteAdminProductImage`   | Borra imagen; reasigna primary                                  |

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

## UI conectada (`/admin/products`)

La pantalla admin de productos ya consume el BFF (sin `lib/mock-data`).

| Capa    | Ruta                                                              |
| ------- | ----------------------------------------------------------------- |
| Página  | `src/app/(admin)/admin/(protected)/products/page.tsx`             |
| Mapper  | `src/features/admin/products/mappers/admin-products-ui.mapper.ts` |
| Docs UI | `docs/admin-products-ui.md`                                       |

### Hooks en UI

- `useAdminProductsQuery` — listado + filtros + orden
- `useAdminProductByIdQuery` — drawer edición
- `useAdminProductFormOptionsQuery` — tipos, colores, tallas
- `useCreateAdminProductMutation` / `useUpdateAdminProductMutation`
- `useArchiveAdminProductMutation` / `useDuplicateAdminProductMutation`
- `useUpdateAdminProductStatusMutation`
- `useUpsertAdminProductVariantMutation` / `useDeleteAdminProductVariantMutation`
- `useUpsertAdminProductImageMutation` / `useDeleteAdminProductImageMutation`

### Acciones disponibles en UI

Crear, editar, archivar, duplicar, cambiar estado, variantes (color/talla/precio/stock), imágenes por URL, búsqueda y filtros por tipo/estado/personalizable.

### Pendiente en UI (siguiente fase)

- Upload Cloudinary real
- CRUD Color / Size
- Inventario avanzado y reglas de personalización en esta pantalla

## Pendientes (BFF / producto)

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

## Mutations 3D model (ProductModelAsset)

createAdminProductModelUpload(input: CreateAdminProductModelUploadInput!): ProductModelUploadPayload!
confirmAdminProductModelUpload(input: ConfirmAdminProductModelUploadInput!): AdminProductModel3d!
deleteAdminProductModelAsset(modelAssetId: ID!): Boolean!
setActiveAdminProductModelAsset(modelAssetId: ID!): AdminProductModel3d!

Flujo: crear (obtiene presigned URL) → PUT directo a R2 → confirmar (HEAD para verificar). Solo ADMIN/SUPERADMIN.
El confirm desactiva modelos anteriores del producto y activa el nuevo.
El delete hace soft delete y borra de R2 (best-effort).

AdminProduct ahora incluye: model3d: AdminProductModel3d

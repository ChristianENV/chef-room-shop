# Admin Customization Rules GraphQL BFF (v1)

Gestión de reglas de personalización por producto para el dashboard Chef Room. Requiere sesión **ADMIN** o **SUPERADMIN**. **CUSTOMER** recibe `FORBIDDEN`.

## Autenticación

Todas las operaciones usan `requireAdminGraphQL` (mismo guard que admin-dashboard / admin-products / admin-orders).

## Modelo Prisma (sin cambios en v1)

| Modelo | Campos relevantes |
|--------|-------------------|
| `CustomizationArea` | `slug`, `nameEs`, `nameEn`, `sortOrder` |
| `CustomizationOption` | `slug`, `nameEs`, `priceCents` |
| `ProductCustomizationRule` | `productId`, `areaId`, `optionId`, `isEnabled`, `configJson` |

**No hay** `deletedAt` en reglas: el delete admin es borrado físico. Unicidad: `(productId, areaId, optionId)`.

## Mapeo `configJson` ↔ GraphQL

Los campos de negocio viven en `configJson` (compatible con seed y catalog BFF):

```json
{
  "priceCents": 24900,
  "maxDimensionsCm": { "width": 8, "height": 8 },
  "allowedFileTypes": ["png", "jpg", "svg"],
  "pricePerCmCents": 0,
  "minQuantity": 1,
  "extraProductionDays": 0,
  "validationMessage": "...",
  "notes": "...",
  "metadata": { }
}
```

| GraphQL | Origen |
|---------|--------|
| `enabled` | `isEnabled` |
| `basePriceCents` | `configJson.priceCents` o fallback `option.priceCents` |
| `maxWidthCm` / `maxHeightCm` | `configJson.maxDimensionsCm` |
| `pricePerCmCents` | `configJson.pricePerCmCents` |
| `allowedFileTypes` | `configJson.allowedFileTypes` |
| `validationMessage` / `notes` | `configJson` |
| `metadataJson` | `configJson.metadata` |
| `area.description` | `area.nameEn` |
| `area.isActive` / `option.isActive` | siempre `true` (no hay columna en BD) |
| `option.pricePerCmCents` (catálogo base) | `null`; por regla viene de `configJson` |

Áreas y opciones se leen del **seed** (`prisma/seed.ts`); v1 no expone CRUD de áreas/opciones.

## Queries

| Query | Descripción |
|-------|-------------|
| `adminCustomizationAreas` | Áreas ordenadas por `sortOrder` |
| `adminCustomizationOptions` | Opciones (técnicas) |
| `adminCustomizationProducts` | Productos no archivados; filtros `search`, `customizable` |
| `adminCustomizationRules` | Lista paginada con filtros |
| `adminCustomizationRulesByProduct` | Reglas de un producto |
| `adminCustomizationRuleById` | Detalle por UUID |
| `adminCustomizationPricingPreview` | Preview v1 de precio |

### Filtros de reglas

- `productId`, `productSlug`
- `areaSlug`, `optionSlug`
- `enabled`
- `search` — nombre producto, área u opción

Límite default **50**, máximo **200**. Orden: producto → área → opción.

### Ejemplo listado

```graphql
query AdminCustomizationRulesList {
  adminCustomizationRules(limit: 10, filter: { enabled: true }) {
    total
    items {
      id
      enabled
      basePriceCents
      product { name slug }
      area { slug name }
      option { slug name }
    }
  }
}
```

## Mutations

| Mutation | Descripción |
|----------|-------------|
| `createAdminCustomizationRule` | Crea regla; evita duplicado `(product, area, option)` |
| `updateAdminCustomizationRule` | Actualiza regla y `configJson` |
| `deleteAdminCustomizationRule` | Borrado físico + AuditLog DELETE |
| `toggleAdminCustomizationRule` | Cambia `isEnabled` |
| `duplicateCustomizationRulesToProduct` | Copia reglas entre productos |

### Duplicar reglas

```graphql
mutation DuplicateRules {
  duplicateCustomizationRulesToProduct(
    input: {
      fromProductId: "..."
      toProductId: "..."
      overwriteExisting: false
    }
  ) {
    id
    productId
    area { slug }
    option { slug }
  }
}
```

- `overwriteExisting: true` — elimina reglas del destino y recrea desde origen.
- `false` — omite combinaciones `(areaId, optionId)` ya existentes en destino.

## Pricing preview (v1)

```graphql
query Preview {
  adminCustomizationPricingPreview(
    input: {
      productId: "..."
      areaId: "..."
      optionId: "..."
      widthCm: 8
      heightCm: 8
    }
  ) {
    basePriceCents
    sizeFactorCents
    totalExtraCents
    formulaLabel
  }
}
```

Fórmula: `totalExtraCents = basePriceCents + (width × height × pricePerCmCents)`. Sin dimensiones, `sizeFactorCents = 0`. Label: `"Base + área personalizada"`.

Requiere regla existente para la terna producto/área/opción.

## Seguridad

- Sin sesión → `UNAUTHENTICATED`
- CUSTOMER → `FORBIDDEN`
- No se acepta `userId` del cliente para autorización

## Frontend (hooks listos, UI pendiente)

- `src/features/admin/customization/api/*`
- `src/features/admin/customization/graphql/*`
- `/admin/customization` sigue usando `lib/mock-data.ts`

## Pendientes

- UI admin conectada al BFF
- Customizador visual (canvas / Fabric / Three.js)
- Upload Cloudinary real
- Motor de precios avanzado (cantidad, matrices)
- Validación real de archivos
- CRUD de `CustomizationArea` / `CustomizationOption`
- Previsualización de prenda

## Smoke manual

Admin: `cnoriega+2@gmail.com` / `12345678`

1. `adminCustomizationAreas` / `adminCustomizationOptions`
2. `adminCustomizationProducts(customizable: true)`
3. `adminCustomizationRulesByProduct(productId)` en producto demo personalizable
4. `createAdminCustomizationRule` → `update` → `toggle` → `adminCustomizationPricingPreview`
5. `duplicateCustomizationRulesToProduct` → `deleteAdminCustomizationRule`
6. Customer: mismas queries → `FORBIDDEN`

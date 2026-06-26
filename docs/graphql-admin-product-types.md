# Admin Product Categories GraphQL BFF

Gestión de **categorías de catálogo** en el dashboard Chef Room. La entidad de persistencia es `ProductType` en Prisma — no existe un modelo `ProductCategory` separado.

Requiere sesión **ADMIN** o **SUPERADMIN** (`requireAdminGraphQL`). **CUSTOMER** recibe `FORBIDDEN`.

## Modelo

`ProductType` representa una categoría administrable con:

| Campo               | Descripción                                             |
| ------------------- | ------------------------------------------------------- |
| `slug`              | Identificador interno único (kebab-case)                |
| `shopSlug`          | Slug opcional para rutas de tienda (único si se define) |
| `nameEs` / `nameEn` | Nombres localizados                                     |
| `description`       | Texto opcional de categoría                             |
| `sortOrder`         | Orden en listados y navegación futura                   |
| `isActive`          | Categoría visible/usable (`false` = archivada)          |
| `showInNav`         | Bandera para navegación de tienda                       |
| `cardImageUrl`      | URL pública (WebP) de la imagen de tarjeta en landing   |
| `cardImagePublicId` | Clave R2 del WebP (solo admin)                          |
| `cardImageAlt`      | Texto alternativo de la imagen de categoría             |
| `cardImageThumbUrl` | URL del thumbnail WebP (solo admin, opcional)           |

Los productos siguen enlazándose con `Product.productTypeId`.

## Queries

| Query                  | Descripción                                          |
| ---------------------- | ---------------------------------------------------- |
| `adminProductTypes`    | Lista categorías; `includeInactive` (default `true`) |
| `adminProductTypeById` | Detalle por UUID con conteos de productos            |

### Ejemplo listado

```graphql
query AdminProductTypes {
  adminProductTypes(includeInactive: true) {
    id
    slug
    shopSlug
    nameEs
    nameEn
    description
    sortOrder
    isActive
    showInNav
    productCount
    activeProductCount
    createdAt
    updatedAt
  }
}
```

## Mutations

| Mutation                             | Descripción                                                     |
| ------------------------------------ | --------------------------------------------------------------- |
| `createAdminProductType`             | Crea categoría                                                  |
| `updateAdminProductType`             | Actualiza campos, incl. `isActive`, `showInNav`, `cardImageAlt` |
| `archiveAdminProductType`            | Soft archive: `isActive: false`, `showInNav: false`             |
| `removeAdminProductTypeImage`        | Elimina imagen de tarjeta y limpia campos en `ProductType`      |
| `createAdminProductTypeImageUpload`  | Emite URLs presignadas R2 (webp/jpg/thumb)                      |
| `confirmAdminProductTypeImageUpload` | Confirma subida y persiste `cardImage*` en `ProductType`        |

Las subidas de imagen requieren **ADMIN/SUPERADMIN** y reutilizan el pipeline R2 de imágenes de producto (procesado WebP/JPG/thumb en el cliente). Claves de objeto:

`product-types/{productTypeId}/card/{imageId}/image.webp`

### Validación

- `slug` requerido en create; minúsculas kebab-case; único.
- `shopSlug` opcional; kebab-case; único cuando se envía.
- `nameEs` requerido en create.
- `nameEn` y `description` opcionales.
- No se permite archivar si existen productos con `status: ACTIVE` y `deletedAt: null`.

### Ejemplo create

```graphql
mutation CreateCategory {
  createAdminProductType(
    input: {
      slug: "shoes"
      shopSlug: "zapatos"
      nameEs: "Zapatos"
      nameEn: "Shoes"
      sortOrder: 40
      isActive: true
      showInNav: true
    }
  ) {
    id
    slug
    shopSlug
  }
}
```

## Relación con admin products

- `adminProductFormOptions` sigue exponiendo `productTypes` para formularios de producto.
- El tipo GraphQL `AdminProductType` incluye los campos de categoría; los formularios actuales solo solicitan un subconjunto (`id`, `slug`, `name`, `sortOrder`, `isActive`).
- La UI de administración de categorías (listado/CRUD) es una fase posterior.

## UI de administración

Ruta: `/admin/categories` — listado, creación, edición, imagen de tarjeta (subir/cambiar/eliminar + alt text) y desactivación desde el dashboard (requiere rol admin).

La imagen de categoría es opcional al crear; hay que guardar la categoría antes de subir la primera imagen (se necesita el UUID de `ProductType`).

## Errores comunes

| Código            | Situación                                                   |
| ----------------- | ----------------------------------------------------------- |
| `UNAUTHENTICATED` | Sin sesión                                                  |
| `FORBIDDEN`       | Rol distinto de admin                                       |
| `NOT_FOUND`       | UUID inexistente                                            |
| `CONFLICT`        | `slug`/`shopSlug` duplicado o archivo con productos activos |

Ver también: [graphql-admin-products.md](./graphql-admin-products.md).

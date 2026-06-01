# Admin Products UI (`/admin/products`)

Interfaz operativa conectada al **Admin Products BFF v1**. Copy en español; precios en pesos en formularios, centavos en GraphQL.

## Flujo operativo

1. **Listado** — `useAdminProductsQuery` con filtros servidor (búsqueda, tipo, estado, personalizable, orden).
2. **Crear / editar** — `ProductFormDialog` (`max-w-5xl`) con `useAdminProductFormOptionsQuery`, `useCreateAdminProductMutation`, `useUpdateAdminProductMutation`.
3. **Variantes** — pestaña Variantes: `upsertAdminProductVariant` / `deleteAdminProductVariant` (color/talla desde form options).
4. **Imágenes** — `ProductImageUploader` con R2: drag & drop, edición (crop/rotación), WebP/JPG/thumb, reorder vía `reorderAdminProductImages`.
5. **Archivar** — `archiveAdminProduct` (no borrado destructivo del producto) vía `AlertDialog`.
6. **Duplicar** — `duplicateAdminProduct` → copia en borrador.
7. **Estado** — menú “Cambiar estado” → `updateAdminProductStatus` (ACTIVE reactiva y limpia `deletedAt`).

## Patrón UX: Dialogs vs Drawers

| Caso | Componente |
|------|------------|
| Formulario crear/editar producto | `ProductFormDialog` |
| Confirmación archivar | `AlertDialog` |
| Navegación mobile admin | `Sheet` — sin cambio |

## Archivos clave

| Área | Ruta |
|------|------|
| Página | `src/app/(admin)/admin/(protected)/products/page.tsx` |
| Mapper UI | `src/features/admin/products/mappers/admin-products-ui.mapper.ts` |
| Tipos UI | `src/features/admin/products/types/admin-products-ui.types.ts` |
| Hooks | `src/features/admin/products/api/*` |
| Tabla / toolbar / dialog | `src/features/admin/products/products-*.tsx`, `product-form-dialog.tsx` |
| Imágenes R2 | `src/features/admin/products/components/product-image-*.tsx` |

## ProductImageUploader

| Archivo | Rol |
|---------|-----|
| `product-image-uploader.tsx` | Orquestador: cola, upload, reorder, delete |
| `product-image-dropzone.tsx` | Drag & drop + file picker (sin cámara) |
| `product-image-grid.tsx` | Grid sortable (`@dnd-kit`) |
| `product-image-sortable-card.tsx` | Preview, estados, editar/eliminar |
| `product-image-editor-dialog.tsx` | Crop libre, presets 1:1 / 4:5, zoom, rotación |
| `uploads/lib/product-image-processing.ts` | WebP/JPG max 1600px + thumb 400px |

**Crear:** seleccionar imágenes → previews locales → al guardar producto, batch upload R2.

**Editar:** upload inmediato; reorder con drag o flechas; primera imagen = principal.

## Hooks usados

- `useAdminProductsQuery`
- `useAdminProductByIdQuery`
- `useAdminProductFormOptionsQuery`
- `useCreateAdminProductMutation`
- `useUpdateAdminProductMutation`
- `useArchiveAdminProductMutation`
- `useDuplicateAdminProductMutation`
- `useUpdateAdminProductStatusMutation`
- `useUpsertAdminProductVariantMutation`
- `useDeleteAdminProductVariantMutation`
- `useDeleteAdminProductImageMutation`
- `useReorderAdminProductImagesMutation`
- `useProductImageUploadMutation` (R2)

## Acciones en tabla

- Editar, duplicar, cambiar estado (Borrador / Activo / Archivado), archivar, reactivar (archivado → Activo).

## data-testid

| ID | Ubicación |
|----|-----------|
| `admin-product-form-dialog` | Dialog crear/editar |

## Limitaciones (v1)

- ~~Sin upload real a Cloudinary.~~ **Imágenes vía Cloudflare R2** (`ProductImageUploader`).
- Sin borrado físico automático de objetos R2 al eliminar `ProductImage` (pendiente).
- Sin inventario avanzado ni matrices de variantes.
- Sin CRUD de colores, tallas ni tipos de producto en admin.
- Sin reglas avanzadas de personalización en esta pantalla.
- Sin página dedicada `/admin/products/[id]` (futuro: enlace desde dialog).
- `lib/mock-data.ts` sigue usado en otras pantallas (p. ej. customización demo), no en `/admin/products`.

## Seguridad

- Layout admin + RBAC bloquean a **CUSTOMER**.
- GraphQL admin sin rol → `FORBIDDEN`.

## Storefront

Solo productos `ACTIVE` con `deletedAt: null` en catálogo. Borrador y archivado no aparecen en `/shop`.

## Smoke manual

Ver checklist en `docs/graphql-admin-products.md` (sección UI conectada).

# Admin Products UI (`/admin/products`)

Interfaz operativa conectada al **Admin Products BFF v1**. Copy en español; precios en pesos en formularios, centavos en GraphQL.

## Flujo operativo

1. **Listado** — `useAdminProductsQuery` con filtros servidor (búsqueda, tipo, estado, personalizable, orden).
2. **Crear / editar** — `ProductFormDialog` (`max-w-5xl`) con `useAdminProductFormOptionsQuery`, `useCreateAdminProductMutation`, `useUpdateAdminProductMutation`.
3. **Variantes** — pestaña Variantes: `upsertAdminProductVariant` / `deleteAdminProductVariant` (color/talla desde form options).
4. **Imágenes** — URLs manuales: `upsertAdminProductImage` / `deleteAdminProductImage` (sin upload Cloudinary).
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
- `useUpsertAdminProductImageMutation`
- `useDeleteAdminProductImageMutation`

## Acciones en tabla

- Editar, duplicar, cambiar estado (Borrador / Activo / Archivado), archivar, reactivar (archivado → Activo).

## data-testid

| ID | Ubicación |
|----|-----------|
| `admin-product-form-dialog` | Dialog crear/editar |

## Limitaciones (v1)

- Sin upload real a Cloudinary.
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

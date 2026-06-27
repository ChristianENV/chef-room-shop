# Admin Products UI (`/admin/products`)

Interfaz operativa conectada al **Admin Products BFF v1**. Copy en español; precios en pesos en formularios, centavos en GraphQL.

## Flujo operativo

1. **Listado** — `useAdminProductsQuery` con filtros servidor (búsqueda, tipo, visibilidad, estado, personalizable, orden).
   - **Por defecto** muestra solo productos **activos** (`visibilityFilter: active`, estado `ACTIVE`, sin archivados).
   - Pestañas **Activos / Ocultos / Todos** (`admin-products-visibility-filter`) para alternar el catálogo visible vs archivado/oculto.
   - **Ocultos** — productos con `status: ARCHIVED` (soft-delete vía `archiveAdminProduct`); requiere `includeArchived: true` en GraphQL.
   - **Borradores** siguen accesibles desde **Activos** usando el filtro de estado **Borrador**.
2. **Crear / editar** — `ProductFormDialog` (`max-w-5xl`) con `useAdminProductFormOptionsQuery`, `useCreateAdminProductMutation`, `useUpdateAdminProductMutation`.
   - **Categoría** — dropdown dinámico desde `adminProductFormOptions.productTypes` (`nameEs`, incluye p. ej. Zapatos).
   - **Personalizable** — switch; desactivar para productos sin customizer (calzado). Variantes e imágenes siguen disponibles.
   - **Tallas** — selector ordenado por `Size.sortOrder` (incluye 22–30 para calzado; medias tallas solo si existen en seed).
3. **Variantes** — pestaña Variantes con editor visual:
   - **Seleccionar colores** — diálogo con grid visual de tarjetas (swatch grande circular + nombre debajo). Toggle por tarjeta, búsqueda _Buscar color..._, footer **Cancelar** / **Aplicar colores**. Colores con variantes existentes quedan bloqueados. Chips compactos junto al botón (máx. 5 visibles + _+ N colores_).
   - **Escritorio (lg+)** — matriz color × talla con filas visibles = defaults de categoría + colores aplicados + colores con variantes existentes. Celdas: **Crear**, **Editar**, **Desactivar** / **Reactivar** (sin switch).
   - **Móvil** — lista de tarjetas (`ProductVariantList`) con swatch, talla, SKU, precio, stock y estado.
   - **Stock masivo / Precio masivo** (`ProductVariantBulkTools`) — encima de la matriz. Campo **Cantidad** + **Aplicar a**: _Todas las variantes visibles_, _Solo variantes activas_, _Color seleccionado_, _Talla seleccionada_, _Celdas seleccionadas_; selects opcionales de color/talla; checkbox _Crear variantes faltantes al aplicar stock_; botón **Aplicar stock**. Precio: campo + **Aplicar precio base** / **Aplicar precio personalizado**.
     - El stock debe ser entero no negativo; el precio no negativo.
     - **Solo edición local**: aplicar stock/precio **no llama a la API** y no sobrescribe SKU (precio no toca stock y viceversa).
     - Por defecto solo afecta variantes existentes/activas. Con _Crear variantes faltantes_ activado, las celdas visibles sin variante se crean en borrador con precio base, stock indicado y SKU determinístico `CR-{SLUG}-{COLOR}-{SIZE}`. _Solo variantes activas_ nunca crea variantes nuevas.
   - **Selección de celdas** — cada celda tiene un checkbox de selección (no abre el editor); las celdas seleccionadas se resaltan. La barra muestra _N celdas seleccionadas_ + _Limpiar selección_ y habilita el alcance _Celdas seleccionadas_. Crear/Editar/Desactivar/Reactivar siguen funcionando aparte (sin anidar elementos interactivos).
   - **Acciones masivas** — _Generar variantes faltantes_ (solo filas visibles/seleccionadas), _Aplicar precio base_, _Stock inicial_.
   - **Defaults al generar** — precio = precio base del producto, stock = 0, SKU determinístico `CR-{SLUG}-{COLOR}-{SIZE}`, sin sobrescribir variantes existentes.
   - **Colores** — pool completo desde `adminProductFormOptions` (activos con `isProductColor` o `isFabricColor`). Elegibilidad por categoría en `src/config/variant-color-eligibility.ts`. Filipinas pueden seleccionar colores de tela activos manualmente; no se agregan todos automáticamente.
   - **Tallas** — zapatos (`shoes`) muestran 22–30; resto de categorías usan tallas de ropa (XS–XXL), ordenadas por `sortOrder`.
   - Variantes legadas con color no permitido se muestran al editar con etiqueta de error; el guardado se rechaza hasta corregir el color o eliminar la variante.
   - El backend valida en `upsertAdminProductVariant` y en `syncAdminProductVariants`; cambiar categoría con variantes incompatibles bloquea `updateAdminProduct`.
   - **Guardado en lote** — al guardar, todas las ediciones locales de variantes se envían en **una sola** mutación `syncAdminProductVariants` (atómica, dentro de transacción). Ya no se hace una llamada por variante. Si el lote falla (p. ej. SKU duplicado o color inválido), el diálogo permanece abierto y muestra el error sin escribir nada.
4. **Imágenes** — `ProductImageUploader` con R2: drag & drop, edición (crop/rotación), WebP/JPG/thumb, reorder vía `reorderAdminProductImages`.
5. **SEO** — pestaña SEO: título, descripción e **imagen SEO** (`ProductSeoImagePicker`) elegida solo entre fotos ya subidas en Imágenes (sin upload en SEO).
   - Copy: _Imagen SEO_ / _Selecciona una foto del producto para usarla al compartir esta página._
   - Si no hay selección: _Si no seleccionas una imagen, se usará la imagen principal del producto._
   - Campo GraphQL: `seoImageId` (nullable); se persiste con `updateAdminProduct`.
   - **Guardado** — mientras hay operaciones pendientes (producto, lote de variantes, imágenes o modelo 3D), el diálogo muestra un **overlay de carga a pantalla completa** (`ProductFormSavingOverlay`) que cubre todo el diálogo, deshabilita tabs/campos/botones y **bloquea el cierre** (X, Escape, clic fuera, Cancelar). Estado único derivado `isProductFormBusy = isSaving || isSavingVariantsBatch || isImageUploadBusy || isModel3dBusy`. Copy del overlay: _Guardando producto_ / _Estamos sincronizando la información del producto. No cierres esta ventana._ con pasos: _Guardando datos generales..._, _Sincronizando variantes..._, _Actualizando imágenes..._, _Guardando modelo 3D..._, _Finalizando..._ Si el guardado falla, se quita el overlay y se muestra el error. Mensaje de cierre bloqueado: _Espera a que termine el guardado antes de cerrar._
6. **Eliminar producto** — doble confirmación estilo GitHub (`DeleteProductDialog`): el admin escribe el nombre exacto del producto y confirma. Internamente llama `archiveAdminProduct` (soft-delete: `ARCHIVED` + `deletedAt`). **No hay borrado permanente** desde Admin; el historial de órdenes se conserva. El producto desaparece del listado **Activos** y de la tienda; usar pestaña **Ocultos** para verlo archivado.
7. **Duplicar** — `duplicateAdminProduct` → copia en borrador.
8. **Estado** — menú “Cambiar estado” → `updateAdminProductStatus` (ACTIVE reactiva y limpia `deletedAt`).

## Patrón UX: Dialogs vs Drawers

| Caso                             | Componente           |
| -------------------------------- | -------------------- |
| Formulario crear/editar producto | `ProductFormDialog`  |
| Confirmación eliminar producto   | `AlertDialog`        |
| Navegación mobile admin          | `Sheet` — sin cambio |

## Archivos clave

| Área                     | Ruta                                                                    |
| ------------------------ | ----------------------------------------------------------------------- |
| Página                   | `src/app/(admin)/admin/(protected)/products/page.tsx`                   |
| Mapper UI                | `src/features/admin/products/mappers/admin-products-ui.mapper.ts`       |
| Filtros listado          | `src/features/admin/products/lib/admin-products-list-filters.ts`        |
| Guardas formulario       | `src/features/admin/products/lib/product-form-dialog-guards.ts`         |
| Tipos UI                 | `src/features/admin/products/types/admin-products-ui.types.ts`          |
| Hooks                    | `src/features/admin/products/api/*`                                     |
| Tabla / toolbar / dialog | `src/features/admin/products/products-*.tsx`, `product-form-dialog.tsx` |
| Imágenes R2              | `src/features/admin/products/components/product-image-*.tsx`            |
| Imagen SEO (picker)      | `src/features/admin/products/components/product-seo-image-picker.tsx`   |

## ProductImageUploader

| Archivo                                   | Rol                                           |
| ----------------------------------------- | --------------------------------------------- |
| `product-image-uploader.tsx`              | Orquestador: cola, upload, reorder, delete    |
| `product-image-dropzone.tsx`              | Drag & drop + file picker (sin cámara)        |
| `product-image-grid.tsx`                  | Grid sortable (`@dnd-kit`)                    |
| `product-image-sortable-card.tsx`         | Preview, estados, editar/eliminar             |
| `product-image-editor-dialog.tsx`         | Crop libre, presets 1:1 / 4:5, zoom, rotación |
| `uploads/lib/product-image-processing.ts` | WebP/JPG max 1600px + thumb 400px             |

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
- `useSyncAdminProductVariantsMutation` (lote del formulario)
- `useUpsertAdminProductVariantMutation`
- `useDeleteAdminProductVariantMutation`
- `useDeleteAdminProductImageMutation`
- `useReorderAdminProductImagesMutation`
- `useProductImageUploadMutation` (R2)

## Acciones en tabla

- Editar, duplicar, cambiar estado (Borrador / Activo / Archivado), **Eliminar producto** (archiva vía `archiveAdminProduct`), reactivar (archivado → Activo).

## Eliminar producto (archivo / soft-delete)

| Aspecto          | Comportamiento                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Acción en menú   | **Eliminar producto** (destructiva)                                                             |
| Confirmación     | Escribir el **nombre exacto** del producto                                                      |
| Mutación GraphQL | `archiveAdminProduct` — no existe `deleteAdminProduct` en Admin                                 |
| Efecto en BD     | `status: ARCHIVED`, `deletedAt: now()` — filas de producto, variantes e imágenes **permanecen** |
| Storefront       | Producto archivado no aparece en `/shop` ni PDP (`ACTIVE` + `deletedAt: null` requeridos)       |
| Órdenes          | Historial de pedidos e ítems **se conserva** (sin cascade delete)                               |
| Variantes        | Permanecen en BD; quedan inaccesibles en tienda porque el producto padre está archivado         |

Copy del diálogo: _El producto se ocultará de la tienda y ya no podrá comprarse. El historial de órdenes se conservará._

## data-testid

| ID                                        | Ubicación                  |
| ----------------------------------------- | -------------------------- |
| `admin-product-form-dialog`               | Dialog crear/editar        |
| `admin-product-form-submit`               | Botón guardar producto     |
| `admin-product-form-save-status`          | Mensaje guardando          |
| `admin-products-visibility-filter`        | Tabs Activos/Ocultos/Todos |
| `admin-products-visibility-active`        | Tab Activos                |
| `admin-products-visibility-hidden`        | Tab Ocultos                |
| `admin-products-visibility-all`           | Tab Todos                  |
| `admin-product-delete-dialog`             | Confirmación eliminar      |
| `admin-product-delete-confirmation-input` | Input nombre en eliminar   |
| `admin-product-delete-confirm-button`     | Botón confirmar eliminar   |
| `admin-product-delete-button`             | Menú acciones → Eliminar   |
| `admin-product-form-saving-overlay`       | Overlay de guardado        |
| `admin-product-form-saving-stage`         | Paso actual del guardado   |
| `admin-product-variant-editor`            | Editor de variantes        |
| `admin-product-variant-bulk-tools`        | Stock/Precio masivo        |
| `admin-product-bulk-apply-stock`          | Botón aplicar stock        |
| `admin-product-bulk-create-missing`       | Checkbox crear faltantes   |
| `admin-product-bulk-clear-selection`      | Limpiar selección celdas   |
| `admin-product-variant-cell-select`       | Checkbox selección celda   |
| `admin-product-variant-matrix`            | Matriz desktop             |
| `admin-product-variant-list`              | Lista mobile               |
| `admin-product-variant-generate-missing`  | Generar variantes          |

## Limitaciones (v1)

- ~~Sin upload real a Cloudinary.~~ **Imágenes vía Cloudflare R2** (`ProductImageUploader`).
- Sin borrado físico automático de objetos R2 al eliminar `ProductImage` (pendiente).
- CRUD de categorías (`ProductType`) en `/admin/categories`; colores en `/admin/colors`; tallas siguen siendo datos de referencia globales.
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

## Subir modelo 3D GLB

Solo se acepta `.glb`. Flujo desde **Admin → Editar Producto → pestaña General → sección "Modelo 3D del producto"**:

El uploader usa clases del tema admin (`bg-card`, `bg-muted`, `border-border`, `text-primary`) y soporta **dark mode** (sin fondos blancos fijos).

1. Guardar el producto primero (se requiere `productId`).
2. Arrastrar o seleccionar el `.glb` (máximo 120 MB original).
3. El cliente valida magic bytes GLB (`0x46 0x54 0x6C 0x67`).
4. Optimización automática: `dedup → prune → weld → reorder → quantize`.
5. Si el optimizado queda > 25 MB → error y se pide optimizar offline.
6. Se muestra comparación: Original / Optimizado / Ahorro estimado.
7. El GLB optimizado se sube directo a R2 con presigned `PUT` URL.
8. `confirmAdminProductModelUpload` valida con HEAD en R2 y activa el `ProductModelAsset`.
9. El customizador usa `product.model3d.url` automáticamente (prioridad 1).

### Límites de tamaño

| Límite                   | Valor   |
| ------------------------ | ------- |
| Tamaño original máximo   | 120 MB  |
| Tamaño optimizado máximo | 25 MB   |
| Tamaño recomendado       | < 12 MB |

### Optimización offline

```bash
pnpm glb:optimize input.glb output.glb
```

Usar cuando el navegador no puede optimizar o el GLB viene directamente del modelador.

### QA manual — Modelo 3D

Checklist para validar de punta a punta sin E2E automatizado:

**1. Admin Upload**

- [ ] Ir a `/admin/products` → buscar producto demo.
- [ ] Abrir edición → pestaña General → sección "Modelo 3D del producto".
- [ ] Seleccionar un `.glb` válido (o usar `tests/fixtures/models/minimal-valid.glb`).
- [ ] Estado **Validando** aparece brevemente.
- [ ] Estado **Optimizando** aparece con barra de progreso y comparativa.
- [ ] Estado **Listo para subir** muestra tamaño original vs optimizado.
- [ ] Clic "Subir modelo optimizado" → estado **Subiendo a R2…**.
- [ ] Estado **Confirmando…**.
- [ ] Estado **success**: nombre de archivo, enlace "Ver en R2", botón "Reemplazar", botón eliminar.

**2. Validar en DB**

```sql
SELECT id, url, size_bytes, original_size_bytes, compression_ratio, status, is_active
FROM product_model_assets
WHERE product_id = '<product-uuid>'
ORDER BY created_at DESC
LIMIT 3;
```

Esperado: fila con `status = 'ACTIVE'`, `is_active = true`, `url` apuntando a R2.

**3. Validar en R2**

Con las credenciales configuradas o desde la consola de Cloudflare:

```
products/{productId}/models/{modelAssetId}/model.glb
```

Verificar que el objeto existe y que `Content-Type` es `model/gltf-binary`.

**4. Validar en el customizador**

- [ ] Ir a `/customize/demo-filipina-executive-blanca`.
- [ ] El modelo debe cargar desde la URL de R2 (no desde fallback local).
- [ ] Abrir DevTools → Network → buscar `model.glb` → verificar URL.
- [ ] Cambiar colores → el material cambia en el modelo 3D.
- [ ] Agregar texto/logo → decals se adhieren al modelo.

**5. GraphQL smoke**

```graphql
# Storefront
query ProductModelSmoke {
  productBySlug(slug: "demo-filipina-executive-blanca") {
    id
    name
    model3d {
      id
      url
      sizeBytes
      compressionRatio
    }
  }
}

# Admin (requiere sesión ADMIN)
query AdminProductModelSmoke {
  adminProductBySlug(slug: "demo-filipina-executive-blanca") {
    id
    model3d {
      id
      url
      originalSizeBytes
      sizeBytes
      compressionRatio
    }
  }
}
```

**6. Errores comunes**

| Error                                     | Causa probable                                           | Solución                                                     |
| ----------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| "Solo se permiten archivos .glb"          | Archivo con extensión incorrecta                         | Subir un `.glb` válido                                       |
| "El archivo no es un GLB válido"          | Magic bytes incorrectos (ZIP, FBX, etc.)                 | Exportar correctamente desde el modelador                    |
| "El modelo sigue siendo demasiado pesado" | Optimizado > 25 MB                                       | Reducir polígonos/texturas; usar `pnpm glb:optimize` offline |
| "Optimización fallida"                    | `gltf-transform` o Meshopt no disponible en el navegador | Usar `pnpm glb:optimize` offline y subir el resultado        |
| R2 CORS error al cargar en customizador   | Bucket sin regla CORS para GET                           | Agregar regla CORS (ver `docs/uploads-r2.md`)                |
| "Presigned URL expirada"                  | Más de 10 min entre `create` y `PUT`                     | Reintentar la subida completa                                |

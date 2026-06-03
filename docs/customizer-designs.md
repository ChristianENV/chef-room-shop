# Persistencia de diseños del customizador

## Objetivo

Conectar el customizador con persistencia real de `Design` y flujo de carrito con `designId`.

## Backend GraphQL (Yoga)

Se agregó un módulo nuevo en:

- `src/server/graphql/modules/designs/designs.service.ts`
- `src/server/graphql/modules/designs/designs.types.ts`
- `src/server/graphql/modules/designs/designs.validation.ts`
- `src/server/graphql/resolvers/designs.resolver.ts`

### Queries

- `designById(designId: ID!): AccountDesign`

### Mutations

- `createDesignDraft(input: CreateDesignDraftInput!): AccountDesign!`
- `updateDesign(input: UpdateDesignInput!): AccountDesign!`
- `saveDesignPreview(input: SaveDesignPreviewInput!): AccountDesign!`
- `deleteDesignDraft(input: DeleteDesignDraftInput!): Boolean!`

## Ownership y seguridad

- No se acepta `userId` desde cliente.
- Si hay sesión auth, ownership por `currentUser.id`.
- Si es guest, ownership por `guestSessionId` vía cookie (`getOrCreateGuestSession`).
- Solo el dueño puede editar/leer su diseño.
- `deleteDesignDraft` hace soft delete (`deletedAt`) y `status=ARCHIVED`.

## Auditoría de eventos

Se registran `DesignEvent`:

- `CREATED` al crear borrador
- `UPDATED` al actualizar config
- `UPDATED` al guardar preview
- `UPDATED` al soft delete (metadata `action: "soft-delete"`)

## Frontend customizer

Nuevos hooks:

- `src/features/storefront/customizer/api/use-create-design-draft.ts`
- `src/features/storefront/customizer/api/use-update-design.ts`
- `src/features/storefront/customizer/api/use-save-design-preview.ts`
- `src/features/storefront/customizer/api/use-design-query.ts`

Nuevas operaciones GraphQL:

- `src/features/storefront/customizer/api/customizer-designs.graphql.ts`
- `src/features/storefront/customizer/api/customizer-designs.api.ts`

Store (`customizer.store.ts`) ahora incluye:

- `designId`
- `isDirty`
- `lastSavedAt`
- `saveStatus`
- `setDesignId`, `setSaveStatus`, `setLastSavedAt`, `markDirty`

## Guardado desde UI

- Botón **Guardar diseño** activo.
- Autosave con debounce (~1200ms) cuando hay cambios (`isDirty=true`).
- Si no existe `designId` crea draft; si existe, actualiza `configJson`.

## Preview frontal y trasera

Flujo al **Guardar diseño** (manual):

1. Persistir `configJson` (`createDesignDraft` / `updateDesign`).
2. Capturar canvas WebGL (vista 3D) frente y espalda (`preserveDrawingBuffer: true`).
3. Optimizar a WebP (máx. 1200px, calidad 0.82, fondo `#0c0c18`).
4. `createDesignPreviewUpload` → PUT presigned a R2 → `confirmDesignPreviewUpload`.

### Almacenamiento (sin migración Prisma)

| Vista | Campo principal |
| --- | --- |
| Frontal | `Design.previewUrl` + `Design.previewPublicId` |
| Trasera | `DesignAsset` (`type: PREVIEW`, `sortOrder: 10`) |
| Ambas | `configJson.previews.front` / `configJson.previews.back` |

Keys R2:

- `designs/{designId}/previews/front.webp` (+ `.jpg` opcional)
- `designs/{designId}/previews/back.webp` (+ `.jpg` opcional)

### GraphQL

- `createDesignPreviewUpload(input: CreateDesignPreviewUploadInput!)`
- `confirmDesignPreviewUpload(input: ConfirmDesignPreviewUploadInput!)`
- `saveDesignPreview` (legacy, una sola URL) sigue disponible.

### Autosave

El autosave solo guarda `configJson` (no captura previews en cada cambio).

### Carrito (activo)

El botón **Agregar al carrito** en `CustomizerShell` ahora:

1. Valida variante (`talla/color`) y stock.
2. Guarda/actualiza `Design` si está sucio o no existe `designId`.
3. Asegura previews front/back (`ensureDesignPreviews`).
4. Ejecuta `addCartItem({ productId, productVariantId, designId, quantity })`.
5. Muestra éxito: `Tu diseño se agregó al carrito.` con CTAs de seguir diseñando o ir al carrito.

En backend (`cart.service.ts`):

- valida ownership y relación diseño-producto,
- persiste snapshot de personalización en `CartItem.configSnapshotJson`,
- actualiza `Design.status` a `IN_CART`,
- registra `DesignEventType.ADDED_TO_CART`.

### Limitaciones

- Vista 2D no genera capturas (mensaje al usuario).
- `preserveDrawingBuffer` puede tener impacto leve en rendimiento WebGL.
- Logos/textos en capas aún no se renderizan sobre el modelo 3D.

## Estado de checks

- `pnpm run typecheck`: OK
- `pnpm exec next build`: OK
- `pnpm run lint`: falla por error preexistente fuera del scope (`checkout/lib/use-paid-order-redirect-countdown.ts`)


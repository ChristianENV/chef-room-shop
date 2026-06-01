# Persistencia de diseños del customizador

## Objetivo

Conectar el customizador con persistencia real de `Design` para usuarios autenticados y guest, sin conectar carrito ni checkout en esta fase.

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

## Preview

`saveDesignPreview` ya está implementado en BFF + hook frontend.

Pendiente en esta fase:

- Exportar imagen real del viewport (webp/png) y subirla a R2.
- Invocar `saveDesignPreview` con URL pública al terminar export/upload.

## Estado de checks

- `pnpm run typecheck`: OK
- `pnpm exec next build`: OK
- `pnpm run lint`: falla por error preexistente fuera del scope (`checkout/lib/use-paid-order-redirect-countdown.ts`)


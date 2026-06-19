# Account UI — conexión al Account BFF v1

## Avatar editable

La página `/account` muestra un `AccountProfileHeader` con el componente `EditableAvatar`.

### Flujo de edición de avatar

1. El usuario hace clic en el badge de lápiz (o en el avatar).
2. Se abre `AvatarUploadDialog` (shadcn Dialog, sin Drawer).
3. El usuario arrastra, selecciona desde disco o captura con cámara (`capture="user"`).
4. `AvatarCropper` (react-easy-crop) permite recortar en círculo 1:1, rotar y hacer zoom.
5. Al confirmar, `processAvatarImage` genera en el browser:
   - `avatar.webp` 256×256 — calidad 0.82
   - `avatar.jpg` 256×256 — calidad 0.86
6. `useAvatarUploadMutation` orquesta:
   - `createAvatarUpload` → presigned PUT URLs
   - PUT WebP directo a R2
   - PUT JPG directo a R2
   - `confirmAvatarUpload` → actualiza `User.image` en BD
7. El mutation hook invalida `meProfile` y `accountSummary` → el avatar se refresca sin reload.
8. El componente aplica el nuevo URL de forma optimista mientras refetch corre.

### Componentes

| Archivo                                                                 | Responsabilidad                                                   |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `components/shared/user-avatar.tsx`                                     | Avatar con imagen u opción de iniciales; sizes sm/md/lg/xl        |
| `src/features/uploads/components/editable-avatar.tsx`                   | Avatar xl + badge lápiz + abre dialog                             |
| `src/features/uploads/components/avatar-upload-dialog.tsx`              | Dialog 5 estados: empty/editing/uploading/success/error           |
| `src/features/uploads/components/avatar-cropper.tsx`                    | Crop circular + zoom + rotación (react-easy-crop)                 |
| `src/features/uploads/lib/image-processing.ts`                          | Utilidades canvas: `getCroppedCanvas`, `canvasToBlob`, validación |
| `src/features/uploads/lib/avatar-image-processing.ts`                   | `processAvatarImage` — produce WebP + JPG 256×256                 |
| `src/features/storefront/account/components/account-profile-header.tsx` | Header de perfil con `EditableAvatar` + nombre/email              |

### Cámara móvil

El segundo `<input>` tiene `capture="user"` para activar la cámara frontal en móvil.
En desktop el atributo es ignorado y el input funciona como un file picker normal.

### Accesibilidad

- `EditableAvatar` es un `<button>` con `aria-label="Editar foto de perfil"`.
- El drop zone tiene `role="button"`, `tabIndex={0}` y responde a Enter/Space.
- `AvatarUploadDialog` usa `DialogTitle` y `DialogDescription` de Radix.
- Los estados Uploading y Success tienen `role="status" aria-live="polite"`.
- El estado Error tiene `role="alert" aria-live="assertive"`.
- Todos los botones tienen `aria-label` descriptivo.

---

## Páginas conectadas

| Ruta                            | Hooks                                          | Datos                                                               |
| ------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------- |
| `/account`                      | `useMeProfileQuery`, `useAccountSummaryQuery`  | Perfil, dirección default, pedidos y diseños recientes              |
| `/account/orders`               | `useMyOrdersQuery`, `useMeProfileQuery`        | Listado de pedidos con items y tracking                             |
| `/account/orders/[orderNumber]` | `useMyOrderByNumberQuery`, `useMeProfileQuery` | Detalle premium del pedido (timeline, pago, envío, personalización) |
| `/account/designs`              | `useMyDesignsQuery`, `useMeProfileQuery`       | Diseños guardados del usuario                                       |
| `/account/addresses`            | `useMyAddressesQuery` + mutations              | CRUD de direcciones                                                 |

## Hooks de mutación

- `useUpdateMyProfileMutation` — listo; UI de edición de perfil aún no conectada
- `useCreateMyAddressMutation`
- `useUpdateMyAddressMutation`
- `useDeleteMyAddressMutation`
- `useSetDefaultAddressMutation`

Invalidan `meProfile`, `accountSummary` y/o `myAddresses` según corresponda.

## Mapeo BFF → UI

`src/features/storefront/account/mappers/account-ui.mapper.ts` traduce DTOs GraphQL al shape legacy de `lib/types` usado por los componentes existentes.

## Autenticación

- `fetchGraphQL` envía `credentials: "include"`.
- `useAccountAuthRedirect` redirige a `routes.login?callbackUrl=...` si el BFF responde sin sesión.
- Sin login, las páginas no muestran datos privados (redirección o mensaje genérico).

## Detalle de pedido (`/account/orders/[orderNumber]`)

- Datos vía `myOrderByNumber` (Account BFF), **sin** email en URL ni `orderByNumber` público.
- Requiere sesión y **`emailVerified`** en backend (`EMAIL_NOT_VERIFIED` si no está verificado).
- Tras guest claim, redirect a esta ruta.
- Componentes en `src/features/storefront/account/order-detail/`.
- **Verificar pago:** mutation `verifyMyOrderPayment(orderNumber)` consulta Conekta (`GET /orders/ord_*`) y reconcilia `Payment`/`Order` si el webhook no llegó. Es **fallback manual**; el webhook sigue siendo la fuente principal.
- **Continuar pago:** si hay `paymentRedirectUrl` vigente en `paymentActions`, abre el checkout Conekta existente (URL extraída server-side de `PaymentAttempt`, sin exponer raw JSON).
- **Reintentar pago:** mutation `retryMyOrderPayment(orderNumber)` reutiliza `startConektaCheckoutForOrder` (sin crear nueva orden).

## Mis pedidos — acciones de pago

En `/account/orders`, cada pedido con pago pendiente muestra:

- Badge **Pago pendiente**
- Botón **Verificar pago** (loading por pedido)
- **Continuar pago** si hay URL Conekta vigente
- **Reintentar pago** si falló, expiró o no hay URL

Hooks: `useVerifyMyOrderPaymentMutation`, `useRetryMyOrderPaymentMutation` (invalidan `myOrders`, `myOrderByNumber`, `myAccountSummary`).

Copy visible:

- “Verificar pago” consulta el estado más reciente de Conekta.
- “La confirmación final depende de Conekta. Si acabas de pagar, puede tardar unos minutos.”

## Qué sigue mockeado

- **Carrito / checkout** — sin cambios
- **Admin dashboard** — mocks en `lib/mock-data.ts`
- **Diseños — acciones:** agregar al carrito, duplicar y eliminar siguen como stub local (sin mutations BFF)
- **Edición de perfil** — botón “Editar” en resumen sin formulario conectado a `updateMyProfile`
- **Ver diseño** desde detalle — CTA deshabilitado (“próximamente”)
- **Factura / CFDI** — no implementado
- **Repetir pedido** — solo CTA a tienda en pedidos entregados
- **Tracking URL real** — solo copiar guía; sin proveedor de rastreo

## Cómo probar

1. `npm run dev`
2. Login: `cliente.demo+1@chefroom.test` / `12345678`
3. Visitar `/account`, `/account/orders`, `/account/designs`, `/account/addresses`
4. En direcciones: crear, editar, eliminar, marcar predeterminada
5. Logout y confirmar que `/account` redirige a login

## Datos del seed demo

El usuario demo incluye (según seed):

- Pedidos con distintos estados y pagos
- Diseños guardados vinculados a productos del catálogo
- Direcciones de envío/facturación en México

Ver `docs/graphql-account.md` para el contrato GraphQL completo.

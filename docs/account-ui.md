# Account UI — conexión al Account BFF v1

## Páginas conectadas

| Ruta | Hooks | Datos |
|------|-------|-------|
| `/account` | `useMeProfileQuery`, `useAccountSummaryQuery` | Perfil, dirección default, pedidos y diseños recientes |
| `/account/orders` | `useMyOrdersQuery`, `useMeProfileQuery` | Listado de pedidos con items y tracking |
| `/account/orders/[orderNumber]` | `useMyOrderByNumberQuery`, `useMeProfileQuery` | Detalle premium del pedido (timeline, pago, envío, personalización) |
| `/account/designs` | `useMyDesignsQuery`, `useMeProfileQuery` | Diseños guardados del usuario |
| `/account/addresses` | `useMyAddressesQuery` + mutations | CRUD de direcciones |

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
- Pago pendiente: reutiliza `CheckoutConektaPay` (Conekta hosted).

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

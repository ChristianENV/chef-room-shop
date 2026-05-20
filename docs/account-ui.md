# Account UI — conexión al Account BFF v1

## Páginas conectadas

| Ruta | Hooks | Datos |
|------|-------|-------|
| `/account` | `useMeProfileQuery`, `useAccountSummaryQuery` | Perfil, dirección default, pedidos y diseños recientes |
| `/account/orders` | `useMyOrdersQuery`, `useMeProfileQuery` | Listado de pedidos con items y tracking |
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

## Qué sigue mockeado

- **Carrito / checkout** — sin cambios
- **Admin dashboard** — mocks en `lib/mock-data.ts`
- **Diseños — acciones:** agregar al carrito, duplicar y eliminar siguen como stub local (sin mutations BFF)
- **Edición de perfil** — botón “Editar” en resumen sin formulario conectado a `updateMyProfile`
- **Detalle de pedido** — no hay página/modal de detalle; solo listado

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

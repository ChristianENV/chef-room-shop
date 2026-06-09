# Autorización de transferencia de órdenes invitadas (v1)

Documentación del flujo post-compra cuando el correo de sesión **no coincide** con el correo de la compra. Complementa [`order-claim.md`](./order-claim.md) (claim por token de email) y el claim automático por checkout token.

## Contexto de entorno

Chef Room **todavía no tiene ambientes separados** formalmente:

- Seguimos en fase **desarrollo / pruebas**.
- **Local** y el **preview de Vercel** usan la **misma base de datos** (Neon).
- **No existe producción formal** todavía; los lifecycles dev/staging/prod se definirán después.
- Las migraciones actuales se aplican contra esa DB compartida con `pnpm db:migrate`.

## Problema original

Las órdenes de invitado se crean con `Order.userId = null`. Tras Conekta, el usuario puede ver el detalle en:

`/account/orders/[orderNumber]?from=checkout&token=...`

gracias al **checkout return token**. Sin embargo, la orden **no aparecía en “Mis pedidos”** porque `myOrders` filtra por `userId` de la sesión autenticada.

## Claim automático (mismo correo)

Cuando el usuario vuelve autenticado con un checkout token válido, `claimGuestOrderByCheckoutToken`:

| Condición | Resultado |
|-----------|-----------|
| Email sesión = email orden + email verificado | `CLAIMED` — se vincula `Order.userId` |
| Email sesión = email orden, email sin verificar | `EMAIL_VERIFICATION_REQUIRED` |
| Orden ya vinculada al mismo usuario | `ALREADY_CLAIMED_BY_USER` (idempotente) |
| Orden ya vinculada a otro usuario | `ORDER_ALREADY_CLAIMED` |
| Token inválido / expirado | `TOKEN_INVALID` / `TOKEN_EXPIRED` |

Implementación: `src/server/orders/claim-guest-order-by-checkout-token.service.ts`.

## Email mismatch (correos distintos)

Si el email de sesión **NO** coincide con `order.customerEmail`:

- **No** se vincula automáticamente (por seguridad).
- La orden sigue operativa vía checkout token en la URL.
- **Admin** sigue viendo la orden con normalidad.
- El modal post-checkout muestra `EMAIL_MISMATCH` con la opción **“Enviar autorización al correo de la compra”**.

## Transfer authorization

Flujo cuando el usuario logueado (email B) quiere guardar una orden comprada con email A:

1. Usuario B solicita transferencia desde el modal (`requestOrderClaimTransfer`).
2. Se valida el **checkout return token** y que la orden siga sin `userId`.
3. Se crea `OrderClaimTransferRequest` con status `PENDING`.
4. Se envía email al **correo original de la compra** (A) con enlace a `/claim-order/authorize?token=...`.
5. El dueño del correo A abre el enlace, revisa datos enmascarados y confirma o cancela.
6. Al aprobar, `Order.userId` pasa al usuario solicitante (B).

### Modelo y TTL

| Campo / regla | Valor |
|---------------|-------|
| Modelo | `OrderClaimTransferRequest` |
| TTL del token | **48 horas** |
| Token en DB | Solo **SHA-256 hash** (`tokenHash`) |
| Token plano | Solo en email / URL, nunca en logs ni DB |

### Rutas y consumo del token

| Acción | Consume token |
|--------|---------------|
| GET `/claim-order/authorize?token=...` (preview) | **No** |
| POST “Autorizar vinculación” | **Sí** → `APPROVED`, `consumedAt` |
| POST “No autorizar” | **Sí** → `CANCELLED`, `consumedAt` |

Estados del request: `PENDING`, `APPROVED`, `EXPIRED`, `CANCELLED`.

### GraphQL

- `requestOrderClaimTransfer(orderNumber, checkoutToken)` — requiere sesión.
- `approveOrderClaimTransfer(token)` — público (autorización vía token del email).

Server actions en la página de autorización: `src/features/storefront/order-claim-transfer/actions.ts`.

## Seguridad

| Regla | Implementación |
|-------|----------------|
| No email en URL como autorización | Solo `token` opaco en query |
| No vincular mismatch sin aprobación | Claim bloqueado; transfer requiere email A |
| No token plano en DB | `hashOrderClaimToken` (SHA-256) |
| No respuestas raw de pago | Servicios no exponen payloads Conekta |
| Orden ya de otro usuario | Rechazo en claim y en approve |
| Token usado / expirado | `ALREADY_USED`, `TOKEN_EXPIRED` |
| Aprobación atómica | Transacción Prisma + `linkGuestOrderToUser` |

Relacionado: [`order-claim.md`](./order-claim.md), [`graphql-checkout.md`](./graphql-checkout.md), [`guest-checkout.md`](./guest-checkout.md).

## Comandos útiles

```bash
pnpm db:migrate
pnpm db:generate
pnpm db:validate
pnpm run typecheck
pnpm run lint
pnpm exec next build
pnpm run test:unit
pnpm exec tsx scripts/orders/qa-order-claim-transfer-flow.ts
```

El script `qa-order-claim-transfer-flow.ts` ejecuta regresión automatizada contra la DB configurada en `.env.local` (mismos escenarios del checklist de QA manual).

## Migración

Archivo: `prisma/migrations/20260604120000_order_claim_transfer_requests/migration.sql`

Solo agrega enum `OrderClaimTransferRequestStatus`, tabla `order_claim_transfer_requests`, índices y FKs. **No** altera columnas ni datos existentes de `orders`.

# Order Claim + Auth Tracking (v1)

> **Transferencia por mismatch de correos (post-checkout):** ver [`order-claim-transfer.md`](./order-claim-transfer.md).

## Por qué forzamos cuenta para tracking

- El checkout invitado sigue sin fricción (sin registro obligatorio).
- No exponemos seguimiento público con `orderNumber` + email en URL.
- Después de comprar, el invitado recibe un enlace seguro de **claim** por correo.
- Para ver el estado del pedido más adelante debe **crear cuenta o iniciar sesión** y vincular la orden.

## Flujo guest

1. Compra como invitado → se crea `OrderClaimToken` (hash SHA-256, no token plano en DB).
2. Email `order_created` incluye `claimUrl` → `/claim-order?token=...`
3. Sin sesión → pantalla pide registro/login con `callbackUrl` de vuelta al claim.
4. Con sesión → mutation `claimOrder` valida email de sesión vs `order.customerEmail`.
5. **Email verificado** (`User.emailVerified`) — obligatorio para cuentas email/password; OAuth con email verificado (p. ej. Google) puede reclamar de inmediato.
6. Redirect a `/account/orders/[orderNumber]` (detalle premium; requiere email verificado).

## Flujo autenticado

- No se crea claim token.
- Email y checkout devuelven `accountOrderUrl` → `/account/orders/[orderNumber]`.

## Seguridad

| Regla | Implementación |
|--------|----------------|
| No email en URL | Solo `token` en query |
| No token plano en DB | `tokenHash` único |
| No `userId` desde cliente | Solo sesión Better Auth |
| Email debe coincidir | `currentUser.email` === `order.customerEmail` |
| Email verificado | `currentUser.emailVerified` antes de vincular |
| Token usado/expirado | Preview null / mensaje controlado |
| Pedido de otro usuario | `FORBIDDEN` si `userId` distinto |

## Expiración

- Default: **14 días** (`expiresInDays` en `createOrderClaimToken`).
- Emails de pago para invitados pueden generar un token nuevo si aún no hay cuenta.

## GraphQL

- `orderClaimPreview(token)` — público, datos mínimos.
- `claimOrder(token)` — requiere sesión.

## Rutas

- `/claim-order?token=...`
- `/verify-email` — aviso y reenvío de verificación
- `/account/orders/[orderNumber]` — hero, timeline, items, pago, envío, totales (solo cuenta + email verificado)

## Tracking público temporal

`orderByNumber(orderNumber, email)` sigue en BFF para `/checkout/success` (receipt + polling). **No** usar en emails ni nuevas pantallas. Ver `docs/graphql-checkout.md`.

## Pendientes

- Reemitir claim link (soporte / self-service).
- Flujo soporte para links expirados.
- Panel admin de claims.
- Eliminar dependencia de `orderByNumber` + email en success cuando haya alternativa solo-auth.

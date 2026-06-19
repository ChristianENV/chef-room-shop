# Admin Shipping Label GraphQL BFF (v1)

Generación de guías **Skydropx PRO** desde el panel admin. Requiere sesión **ADMIN** o **SUPERADMIN**. **CUSTOMER** → `FORBIDDEN`.

No incluye en v1: pickups, tracking público, generación automática al pagar. Actualización de estados vía webhooks: `docs/skydropx-webhooks.md`.

## Autenticación

`requireAdminGraphQL(context)` en todas las operaciones. No se aceptan montos, `rate_id` de Skydropx ni credenciales desde el cliente.

## Modelo `Shipment` (ampliado)

Tras migración `skydropx_shipments`, cada guía guarda:

| Campo | Uso |
|-------|-----|
| `provider` | `SKYDROPX` |
| `providerShipmentId` | ID envío Skydropx |
| `providerLabelId` | ID etiqueta (si aplica) |
| `labelUrl` | URL PDF/ZPL para imprimir |
| `labelFormat` | `PDF`, `ZPL`, `EPL` |
| `quoteId` / `rateId` | Cotización y tarifa usadas |
| `costCents` | Desde `ShippingRate.amountCents` (DB) |
| `carrier`, `service`, `trackingNumber` | Respuesta Skydropx |
| `rawResponseJson` | Solo servidor; no expuesto en GraphQL |

## Query

### `adminShipmentByOrderNumber`

```graphql
query AdminShipment($orderNumber: String!) {
  adminShipmentByOrderNumber(orderNumber: $orderNumber) {
    id
    orderNumber
    carrier
    trackingNumber
    labelUrl
    status
    costCents
    events {
      status
      message
      createdAt
    }
  }
}
```

Retorna `null` si no hay envío.

## Mutations

### `adminCreateShippingLabel`

```graphql
mutation CreateLabel {
  adminCreateShippingLabel(
    input: { orderNumber: "CR-20260520-0001", labelFormat: "PDF" }
  ) {
    trackingNumber
    labelUrl
    carrier
    service
    status
    costCents
  }
}
```

**Flujo servidor:**

1. Orden existe y `paymentStatus` = `PAID`.
2. `Order.status` ∈ `PAID`, `IN_PRODUCTION`, `READY_TO_SHIP`.
3. No existe guía activa (`providerShipmentId` o `labelUrl`) → si existe: `CONFLICT` *"La guía ya fue generada."*
4. `ShippingQuote` vinculada por `orderId`.
5. Tarifa: `rateId` del input (debe pertenecer a la quote) o tarifa con `selectedAt` en checkout.
6. Tarifa no expirada (`expiresAt`).
7. Validación de origen (`SHIPPING_ORIGIN_*`), dirección (colonia en `Address.label`, número en `line2`) y `providerQuoteId`.
8. `createShippingProvider().createShipment()` → live Skydropx or mock provider (`SKYDROPX_MODE`)
9. Transacción Prisma: `Shipment`, `ShipmentEvent`, `OrderEvent`, actualización de orden.

**Estado de orden tras crear guía:**

| Condición | `Order.status` | `fulfillmentStatus` |
|-----------|----------------|---------------------|
| Hay `trackingNumber` | `SHIPPED` | `SHIPPED` |
| Solo `labelUrl` | `READY_TO_SHIP` | `PROCESSING` |

**`labelFormat`:** `PDF` (default) → `standard`; `ZPL` / `EPL` → `thermal` en Skydropx.

### `adminCancelShippingLabel`

Cancela en Skydropx (`POST .../cancellations`) si hay `providerShipmentId`. Motivo opcional solo en `OrderEvent` local.

### `adminRefreshShipmentTracking`

Consulta `GET /api/v1/shipments/tracking` con `trackingNumber` + `carrier` del `Shipment` guardado. **Bloqueado en `SKYDROPX_MODE=mock`.**

### `adminSimulateMockShipmentTrackingStatus`

Simula cambios de tracking sin llamar a Skydropx. Solo admin, solo mock mode, solo envíos mock (`CRMOCK-*`).

Input: `{ orderNumber, trackingStatus }` donde `trackingStatus` ∈ `created | label_generated | in_transit | delivered | exception`.

Persiste `Shipment.status`, `shippedAt`/`deliveredAt` cuando aplica, y actualiza `Order.status` / `fulfillmentStatus` igual que el webhook mapper (p. ej. `in_transit` → `SHIPPED`, `delivered` → `DELIVERED`).

En transición a enviado/in transit, crea notificación USER `ORDER_SHIPPED`. En transición a entregado, crea `ORDER_DELIVERED`. Solo pedidos autenticados; dedupe por `orderId`. Ver `docs/notifications.md`.

## Validaciones de error

| Caso | Código |
|------|--------|
| Sin sesión admin | `UNAUTHENTICATED` / `FORBIDDEN` |
| Pedido no pagado | `BAD_REQUEST` |
| Pedido cancelado / entregado | `BAD_REQUEST` |
| Guía ya generada | `CONFLICT` |
| Sin quote o sin tarifa seleccionada | `BAD_REQUEST` |
| Tarifa expirada | `BAD_REQUEST` |
| Error Skydropx | `SKYDROPX_API_ERROR` (mensaje amigable por status HTTP) |
| Origen incompleto | `BAD_REQUEST` — configurar `SHIPPING_ORIGIN_*` |
| Dirección incompleta | `BAD_REQUEST` |

### Debug

- `SKYDROPX_DEBUG=true` — logs sanitizados en servidor (`skydropx.debug.ts`)
- `pnpm tsx scripts/skydropx-create-label-smoke.ts <orderNumber>` — dry-run del payload
- Ver `docs/skydropx.md` → sección *Debug de generación de guías*

## Frontend UI

Conectado en el drawer de `/admin/orders` (`AdminShipmentCard`). Ver `docs/admin-shipping-ui.md`.

```
src/features/admin/shipping/
  components/admin-shipment-card.tsx
  api/use-admin-shipment-by-order-number-query.ts
  api/use-admin-create-shipping-label-mutation.ts
  api/use-admin-cancel-shipping-label-mutation.ts
  api/use-admin-refresh-shipment-tracking-mutation.ts
```

## Prueba manual (sandbox)

1. Checkout con cotización y tarifa seleccionada; pagar orden (o `paymentStatus` PAID en dev).
2. `markAdminOrderReadyToShip` si aplica.
3. Ejecutar `adminCreateShippingLabel`.
4. Verificar en DB: `shipments`, `shipment_events`, `order_events`, segunda llamada → `CONFLICT`.

## Archivos

| Área | Ruta |
|------|------|
| Service | `src/server/graphql/modules/admin-shipping/admin-shipping.service.ts` |
| Resolver | `src/server/graphql/resolvers/admin-shipping.resolver.ts` |
| Mappers Skydropx | `src/server/shipping/skydropx/skydropx.mappers.ts` |

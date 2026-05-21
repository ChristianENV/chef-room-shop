# Skydropx Webhooks (v1)

Recepción y procesamiento idempotente de eventos Skydropx PRO para actualizar envíos, pedidos y emails transaccionales.

## Endpoint

```
POST /api/webhooks/skydropx
```

URL pública (ejemplo):

```
https://tu-dominio.com/api/webhooks/skydropx
```

Configura esta URL en Skydropx PRO (solicitud a [hola@skydropx.com](mailto:hola@skydropx.com) o panel Webhooks).

## Autenticación

Variable de entorno:

| Variable | Uso |
|----------|-----|
| `SKYDROPX_WEBHOOK_SECRET` | HMAC SHA-512, Bearer, header o query `?secret=` |

Modos soportados (cualquiera válido si el secret coincide):

1. **HMAC (recomendado Skydropx):** `Authorization: HMAC <firma_hex>` sobre el body crudo.
2. **Bearer:** `Authorization: Bearer <secret>`
3. **Header:** `x-skydropx-webhook-secret`, `x-webhook-secret`
4. **Query (dev/smoke):** `?secret=<secret>`

| Entorno | Sin secret |
|---------|------------|
| Development | Acepta con warning en logs |
| Production | Responde `401` |

## Formato de payload (JSON:API)

Skydropx envía paquetes con estructura similar a:

```json
{
  "data": {
    "id": "package-uuid",
    "type": "packages",
    "attributes": {
      "status": "in_transit",
      "tracking_number": "794874381730",
      "label_url": "https://..."
    },
    "relationships": {
      "shipment": {
        "data": { "id": "shipment-uuid", "type": "shipments" }
      }
    }
  }
}
```

El procesador también acepta shapes legacy con `event_type`, `event_id`, etc.

## Idempotencia

- Tabla `shipping_webhook_events` con `eventId` **unique**.
- `eventId` = `data.id` del webhook (o hash del body si falta).
- Si `processedAt` ya existe → `200` con `duplicate: true` (sin reprocesar emails ni DB).

## Resolución de Shipment

Orden de búsqueda:

1. `providerShipmentId` = `relationships.shipment.data.id`
2. `trackingNumber` en attributes
3. `orderNumber` en `reference` / metadata

Si no hay shipment local:

- Se guarda `processingError: shipment_not_found`
- Respuesta `200` con `skipped: true` (evita reintentos infinitos)

## Mapeo de estados

| Skydropx / evento | `ShipmentStatus` | Order |
|-------------------|------------------|-------|
| created, label | `LABEL_CREATED` | fulfillment `PROCESSING` |
| in_transit, tracking.updated | `IN_TRANSIT` | `SHIPPED` |
| out_for_delivery, last_mile | `OUT_FOR_DELIVERY` | `SHIPPED` |
| delivered | `DELIVERED` | `DELIVERED` |
| cancelled | `CANCELLED` | — |
| exception, failed | `FAILED` | — |
| in_return | `RETURNED` | — |

No se degradan estados (ej. `DELIVERED` no vuelve a `IN_TRANSIT`).

## Side effects

Por evento aplicable (transacción Prisma):

- `Shipment` — status, tracking, carrier, `shippedAt`, `deliveredAt`
- `ShipmentEvent` — timeline (visible en detalle de cuenta si hay datos)
- `OrderEvent` — `FULFILLMENT_UPDATED`
- `Order` — `status` / `fulfillmentStatus` cuando aplica

## Emails

| Template | Cuándo | Idempotencia |
|----------|--------|--------------|
| `shipping_update` | Primera vez `IN_TRANSIT` / `OUT_FOR_DELIVERY` | `dedupeKey: shipped` |
| `delivered` | Primera vez `DELIVERED` | `dedupeKey: delivered` |

- Fallo de email **no** bloquea el webhook.
- Links: cuenta (`accountOrderUrl`) o claim (`claimUrl`) para invitados.

## Inspección en DB

```sql
SELECT event_id, event_type, processed_at, processing_error, shipment_id, order_id
FROM shipping_webhook_events
ORDER BY received_at DESC
LIMIT 20;
```

## Smoke local

1. Orden con guía y `providerShipmentId` real en `shipments`.
2. Ejecutar:

```bash
npx tsx scripts/skydropx-webhook-smoke.ts in_transit <providerShipmentId> <tracking>
npx tsx scripts/skydropx-webhook-smoke.ts delivered <providerShipmentId> <tracking>
```

3. Repetir mismo `eventId` (5º argumento) → no debe duplicar emails.

## Limitaciones (v1)

- Sin pickups
- Sin tracking público sin cuenta
- Sin panel admin de webhooks
- Sin DLQ / cola de reintentos
- Sin multi-paquete por orden
- Sin regeneración de etiquetas vía webhook

## Archivos

| Archivo | Rol |
|---------|-----|
| `src/app/api/webhooks/skydropx/route.ts` | HTTP handler |
| `src/server/shipping/skydropx/skydropx.webhook-verify.ts` | Auth |
| `src/server/shipping/skydropx/skydropx.webhook-processor.ts` | Lógica |
| `src/server/shipping/skydropx/skydropx.sanitize.ts` | Sanitización |

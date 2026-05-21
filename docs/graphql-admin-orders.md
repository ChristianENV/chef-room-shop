# Admin Orders GraphQL BFF (v1)

Operaciones internas de pedidos para el dashboard Chef Room. Requiere sesión **ADMIN** o **SUPERADMIN** (Better Auth + RBAC). Los usuarios **CUSTOMER** reciben `FORBIDDEN`.

## Autenticación

Todas las queries y mutations llaman `requireAdminGraphQL(context)`:

- Sin sesión → `UNAUTHENTICATED`
- Rol `CUSTOMER` → `FORBIDDEN`
- `ADMIN` / `SUPERADMIN` → permitido

No se acepta `userId` desde el cliente para operaciones sensibles. El actor de eventos se toma de `context.currentUser`.

## Datos no expuestos

- `PaymentAttempt.rawResponseJson`
- Payloads de webhooks Conekta
- Credenciales / tokens de Better Auth

## Queries

### `adminOrders`

Lista paginada con filtros y orden.

```graphql
query AdminOrdersList {
  adminOrders(
    filter: {
      search: "CR-"
      productionOnly: true
      hasCustomDesign: true
    }
    sort: { field: "createdAt", direction: "desc" }
    limit: 20
    offset: 0
  ) {
    total
    items {
      orderNumber
      status
      paymentStatus
      fulfillmentStatus
      totalCents
      customer { email name }
      hasCustomDesign
    }
  }
}
```

**Filtros:** `search` (orderNumber, email, teléfono, nombre de usuario), `status`, `paymentStatus`, `fulfillmentStatus`, `productionOnly` (PAID / IN_PRODUCTION / READY_TO_SHIP), `hasCustomDesign`, `dateFrom` / `dateTo`.

**Orden:** `createdAt` (default desc), `totalCents`, `status`, `paymentStatus`, `orderNumber`. Límite default 20, máx 100.

### `adminOrderByNumber`

Detalle completo de una orden.

### `adminOrderStatusSummary`

Conteos por `Order.status` para tarjetas del dashboard.

### `adminOrderProductionQueue`

Órdenes en pipeline de producción (PAID, IN_PRODUCTION, READY_TO_SHIP), orden `updatedAt` asc.

### `adminOrderProductionSheet`

Hoja de producción: items, snapshots, notas, cliente.

## Mutations

| Mutation | Descripción |
|----------|-------------|
| `updateAdminOrderStatus` | Cambia `Order.status` + `OrderEvent` STATUS_CHANGED |
| `moveAdminOrderToProduction` | Requiere pago; `status` → IN_PRODUCTION, `fulfillmentStatus` → PROCESSING |
| `markAdminOrderReadyToShip` | `status` → READY_TO_SHIP, `fulfillmentStatus` → PROCESSING |
| `addAdminOrderTracking` | Crea/actualiza `Shipment`, `ShipmentEvent`, `status` → SHIPPED |
| `cancelAdminOrder` | No si DELIVERED; sin reembolso automático |
| `addAdminOrderNote` | `OrderEvent` NOTE_ADDED + append en `order.notes` |

### Ejemplo: producción y envío

```graphql
mutation OpsFlow {
  move: moveAdminOrderToProduction(orderNumber: "CR-2026-0001") {
    orderNumber
    status
  }
  ready: markAdminOrderReadyToShip(orderNumber: "CR-2026-0001") {
    status
  }
  ship: addAdminOrderTracking(
    input: {
      orderNumber: "CR-2026-0001"
      carrier: "Estafeta"
      trackingNumber: "1234567890"
    }
  ) {
    status
    shipments { trackingNumber carrier }
  }
}
```

### Cancelación

```graphql
mutation Cancel {
  cancelAdminOrder(orderNumber: "CR-2026-0002", reason: "Cliente solicitó cancelación") {
    status
    events { type message }
  }
}
```

**Pendiente v2:** reembolso Conekta, devolución automática al cancelar si ya estaba PAID.

## Estados

### OrderStatus (Prisma)

`PENDING_PAYMENT`, `PAYMENT_FAILED`, `PAID`, `IN_PRODUCTION`, `READY_TO_SHIP`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`

### FulfillmentStatus

No tiene `IN_PRODUCTION` / `READY_TO_SHIP`. El BFF mapea producción a `PROCESSING` y envío a `SHIPPED`.

### paymentStatus (GraphQL derivado)

Último `Payment.status` o inferido desde `Order.status` (ver `derivePaymentStatus`).

## Reglas de producción

1. `moveAdminOrderToProduction`: solo si `paymentStatus === PAID` o `order.status` es PAID / ya en pipeline de producción.
2. `markAdminOrderReadyToShip`: desde PAID, IN_PRODUCTION o READY_TO_SHIP.
3. `addAdminOrderTracking`: no en CANCELLED / REFUNDED; actualiza primera shipment o crea una nueva.

## Frontend (hooks listos, UI pendiente)

- `src/features/admin/orders/api/*` — TanStack Query
- `src/features/admin/orders/graphql/*` — documentos GraphQL
- `/admin/orders` sigue usando `lib/mock-data.ts` hasta conectar UI

## Pendientes (fuera de v1)

- Reembolsos reales / Conekta
- Labels y paquetería real
- Email `shipping_update` al agregar tracking
- Export CSV, realtime, permisos finos por acción
- `updateAdminOrderStatus` hook en UI (mutation expuesta en API; hook opcional si se necesita en UI)

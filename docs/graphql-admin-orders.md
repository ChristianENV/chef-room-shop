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
| `addAdminOrderTracking` | Crea/actualiza `Shipment` manual (sin Skydropx), `status` → SHIPPED |
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

## UI conectada (`/admin/orders`)

La página admin de órdenes consume el BFF vía TanStack Query. Ver también `docs/admin-orders-ui.md`.

### Hooks usados

| Hook | Uso en UI |
|------|-----------|
| `useAdminOrdersQuery` | Tabla principal + filtros |
| `useAdminOrderStatusSummaryQuery` | Tarjetas de resumen |
| `useAdminOrderByNumberQuery` | Drawer de detalle |
| `useAdminOrderProductionSheetQuery` | Pestaña ficha de producción |
| `useMoveAdminOrderToProductionMutation` | Tabla + drawer |
| `useMarkAdminOrderReadyToShipMutation` | Tabla + drawer |
| `useAddAdminOrderTrackingMutation` | Drawer (diálogo guía) |
| `useCancelAdminOrderMutation` | Tabla + drawer |
| `useAddAdminOrderNoteMutation` | Drawer |

### Acciones disponibles en UI

- Ver listado y detalle reales
- Filtrar por búsqueda, estado, pago, pipeline de producción
- Mover a producción, marcar lista para envío, agregar tracking, cancelar (sin refund), agregar nota
- Ver ficha de producción e imprimir (`window.print`)

### Qué sigue mockeado / deshabilitado

- `lib/mock-data.ts` — otras páginas admin si aplica; **no** `/admin/orders`
- Exportar CSV — botón deshabilitado
- Crear orden manual — botón deshabilitado
- Rango de fechas — no expuesto aún
- `updateAdminOrderStatus` genérico — no en UI (se usan mutations específicas)

### Prueba manual

1. Login admin: `cnoriega+2@gmail.com` / `12345678`
2. Ir a `/admin/orders`
3. Verificar tarjetas, tabla, drawer, mutations
4. Login customer `cliente.demo+1@chefroom.test` → layout admin debe bloquear acceso

## Guías Skydropx (BFF separado)

La generación de etiquetas **no** usa `addAdminOrderTracking`. Ver `docs/graphql-admin-shipping.md`:

- `adminCreateShippingLabel` — cotización/tarifa de DB, `POST /api/v1/shipments/`
- `adminShipmentByOrderNumber` — consulta guía existente
- Hooks: `useAdminShipmentByOrderNumberQuery`, `useAdminCreateShippingLabelMutation` en `src/features/admin/shipping/`

El drawer de pedidos conectará estos hooks en un PR de UI (invalidar `adminOrdersQueryKeys` + `adminShippingQueryKeys` tras crear guía).

## Pendientes (fuera de v1)

- Reembolsos reales / Conekta
- UI admin "Generar guía" (BFF listo)
- Email `shipping_update` (webhooks / tracking PR)
- Export CSV, realtime, permisos finos por acción
- `updateAdminOrderStatus` hook en UI (mutation expuesta en API; hook opcional si se necesita en UI)

# Admin Orders UI

Operación de pedidos en `/admin/orders` conectada al BFF GraphQL (v1).

## Flujo operativo

1. **Resumen** — Tarjetas por estado (`adminOrderStatusSummary`). Clic filtra la tabla.
2. **Listado** — `adminOrders` con búsqueda, filtros de estado/pago y toggle “Solo pipeline de producción”.
3. **Detalle** — Drawer con `adminOrderByNumber`: cliente, direcciones, pago, items, timeline, notas.
4. **Producción** — Pestaña “Ficha producción” (`adminOrderProductionSheet`) + impresión básica.
5. **Acciones** — Mutations desde menú de tabla o drawer; queries se invalidan al éxito.

## Mapper UI

`src/features/admin/orders/mappers/admin-orders-ui.mapper.ts` traduce tipos BFF → shapes de componentes:

- Centavos → pesos con `formatCurrencyMXN`
- `OrderStatus` / `PaymentStatus` / `FulfillmentStatus` → etiquetas en español
- Snapshots de diseño → áreas/resumen para `CustomizationSnapshot`

## Estados visibles

| BFF | Etiqueta UI |
|-----|-------------|
| PENDING_PAYMENT | Pendiente de pago |
| PAID | Pagada |
| IN_PRODUCTION | En producción |
| READY_TO_SHIP | Lista para envío |
| SHIPPED | Enviada |
| DELIVERED | Entregada |
| CANCELLED / REFUNDED | Cancelada |

## Acciones y reglas

- **Mover a producción** — Solo si pagada y no cancelada/entregada.
- **Lista para envío** — Desde pagada, en producción o ya lista.
- **Agregar guía** — Carrier + tracking; marca orden como enviada en BFF.
- **Cancelar** — Diálogo con motivo opcional; mensaje: sin reembolso automático.
- **Nota interna** — `addAdminOrderNote` + append en `order.notes`.

## Limitaciones (v1)

- Sin reembolsos Conekta desde UI
- Sin integración paquetería real (carriers son texto libre / select fijo)
- Sin export CSV
- Sin PDF avanzado de ficha
- Sin email automático al agregar tracking
- Sin filtro por rango de fechas en toolbar
- Sin `updateAdminOrderStatus` genérico en UI

## Archivos clave

- `src/app/(admin)/admin/(protected)/orders/page.tsx`
- `src/features/admin/orders/*`
- `docs/graphql-admin-orders.md`

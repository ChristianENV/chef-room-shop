# Admin Orders UI

Operación de pedidos en `/admin/orders` conectada al BFF GraphQL (v1).

## Flujo operativo

1. **Resumen** — Tarjetas por estado (`adminOrderStatusSummary`). Clic filtra la tabla.
2. **Listado** — `adminOrders` con búsqueda, filtros de estado/pago y toggle “Solo pipeline de producción”.
3. **Detalle rápido** — Dialog (`OrderDetailDialog`) con `adminOrderByNumber`: cliente, direcciones, pago, items, timeline, notas, guía Skydropx.
4. **Página completa** — `/admin/orders/[orderNumber]` reutiliza los mismos componentes (`AdminOrderDetailPageView`) en layout de dos columnas.
5. **Producción** — Pestaña o sección “Ficha producción” (`adminOrderProductionSheet`) + impresión básica.
6. **Acciones** — Mutations desde menú de tabla, dialog o página; queries se invalidan al éxito.

## Rutas

| Ruta | Uso |
|------|-----|
| `/admin/orders` | Listado + dialog de detalle |
| `/admin/orders/[orderNumber]` | Vista operativa completa (`routes.adminOrderDetail`) |

Desde el dialog: **Abrir página completa** → navega a la ruta dedicada.

## Patrón UX: Dialogs vs Drawers

| Caso | Componente |
|------|------------|
| Lectura / detalle denso (orden, producto, regla) | `Dialog` (ancho `max-w-5xl` / `max-w-6xl`, scroll interno) |
| Confirmaciones destructivas (cancelar orden, archivar, cancelar guía) | `AlertDialog` |
| Navegación mobile del admin | `Sheet` (sidebar) — no cambiar |
| Popovers / dropdowns de tabla | Sin cambio |

Los drawers laterales ya no se usan para detalle de orden.

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
- **Guía Skydropx** — En dialog o página: generar etiqueta, abrir/imprimir PDF, refresh tracking, cancelar (ver `docs/admin-shipping-ui.md`).
- **Cancelar** — Diálogo con motivo opcional; mensaje: sin reembolso automático.
- **Nota interna** — `addAdminOrderNote` + append en `order.notes`.

## Limitaciones (v1)

- Sin reembolsos Conekta desde UI
- Guías vía Skydropx en dialog/página (sin paquetería manual en v1)
- Sin export CSV
- Sin PDF avanzado de ficha
- Sin email automático al agregar tracking
- Sin filtro por rango de fechas en toolbar
- Sin `updateAdminOrderStatus` genérico en UI

## Hooks de envío (dialog / página)

| Hook | Uso |
|------|-----|
| `useAdminShipmentByOrderNumberQuery` | Carga guía Skydropx |
| `useAdminCreateShippingLabelMutation` | Generar guía |
| `useAdminRefreshShipmentTrackingMutation` | Actualizar tracking |
| `useAdminCancelShippingLabelMutation` | Cancelar guía |

Ver `docs/admin-shipping-ui.md`.

## data-testid

| ID | Ubicación |
|----|-----------|
| `admin-orders-table` | Tabla de órdenes |
| `admin-order-detail-dialog` | Dialog de detalle |
| `admin-order-detail-full-page-link` | Enlace a página completa |
| `admin-order-detail-page` | Página `/admin/orders/[orderNumber]` |
| `admin-shipping-card` | Sección guía Skydropx |
| `admin-create-label-button` | Generar guía |

## Archivos clave

- `src/app/(admin)/admin/(protected)/orders/page.tsx`
- `src/app/(admin)/admin/(protected)/orders/[orderNumber]/page.tsx`
- `src/features/admin/orders/order-detail-dialog.tsx`
- `src/features/admin/orders/order-detail/*`
- `src/features/admin/shipping/components/admin-shipment-card.tsx`
- `docs/graphql-admin-orders.md`

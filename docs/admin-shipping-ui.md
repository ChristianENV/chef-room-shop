# Admin Shipping UI (Skydropx)

Generación y gestión de guías desde el drawer de `/admin/orders`.

## Dónde vive

- Sección **Guía Skydropx** en pestaña Detalles del drawer (`AdminShipmentCard`).
- Menú de tabla: **Guía Skydropx** abre el drawer en la misma sección.

## Flujo: generar guía

1. Orden **pagada** y en `PAID`, `IN_PRODUCTION` o `READY_TO_SHIP`.
2. Sin guía activa (`providerShipmentId` o `labelUrl`).
3. Clic **Generar guía** → diálogo de confirmación (formato PDF por defecto; ZPL/EPL disponibles).
4. Mutation `adminCreateShippingLabel` → muestra carrier, tracking, costo y botones de etiqueta.

**No se genera automáticamente al pagar.** Operaciones debe marcar lista para envío y luego generar la guía.

## Botón visible cuando

| Condición | UI |
|-----------|-----|
| No pagada | Mensaje: *Disponible cuando el pedido esté pagado.* |
| Ya tiene guía | Mensaje: *Esta orden ya tiene guía.* + acciones de etiqueta |
| Cancelada / entregada | Mensaje de no disponible |
| Elegible | Botón **Generar guía** |

## Etiqueta e impresión

- **Abrir etiqueta** — `window.open(labelUrl)` en nueva pestaña.
- **Imprimir** — abre la misma URL (impresión desde el navegador/PDF de Skydropx).
- Sin visor PDF embebido ni ZPL/EPL avanzado en v1.

## Tracking

- **Actualizar tracking** — `adminRefreshShipmentTracking` (requiere número de guía y paquetería).
- Feedback: *Tracking actualizado* o *Sin cambios recientes*.

## Cancelar guía

- **Cancelar guía** — diálogo con motivo opcional → `adminCancelShippingLabel`.
- Solo si existe `providerShipmentId` en Skydropx.
- No afecta pagos ni reembolsos Conekta.

## Invalidación de queries

Tras crear, cancelar o refrescar:

- `adminShippingQueryKeys.all`
- `adminOrdersQueryKeys.all`
- `adminDashboardQueryKeys.all`

## Limitaciones (v1)

- Sin webhooks Skydropx (estado no se actualiza solo).
- Sin pickups.
- Sin email `shipping_update`.
- Sin tracking público para clientes.
- Sin paquetería manual (reemplazada por Skydropx en drawer).
- ZPL/EPL: se envían al BFF; impresión térmica avanzada pendiente.

## Archivos

```
src/features/admin/shipping/
  components/admin-shipment-card.tsx
  components/admin-create-label-dialog.tsx
  components/admin-cancel-label-dialog.tsx
  mappers/admin-shipping-ui.mapper.ts
  api/use-admin-*-mutation.ts
```

Ver también `docs/graphql-admin-shipping.md`.

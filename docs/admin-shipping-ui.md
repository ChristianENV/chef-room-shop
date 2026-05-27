# Admin Shipping UI (Skydropx)

Generación y gestión de guías desde el detalle de orden (dialog o página `/admin/orders/[orderNumber]`).

## Dónde vive

- Sección **Guía Skydropx** en panel Detalles (`AdminShipmentCard`).
- Menú de tabla: **Guía Skydropx** abre el dialog en la misma sección.
- Página completa: misma tarjeta en columna derecha sticky.

## Flujo: generar guía

1. Orden **pagada** y en `PAID`, `IN_PRODUCTION` o `READY_TO_SHIP`.
2. Sin guía activa (`providerShipmentId` o `labelUrl`).
3. Clic **Generar guía** → `AlertDialog` de confirmación (formato PDF por defecto; ZPL/EPL disponibles).
4. Mutation `adminCreateShippingLabel` → muestra carrier, tracking, costo y botones de etiqueta.

**No se genera automáticamente al pagar.** Operaciones debe marcar lista para envío y luego generar la guía.

## Botón visible cuando

| Condición | UI |
|-----------|-----|
| No pagada | Mensaje: *Disponible cuando el pedido esté pagado.* |
| Ya tiene guía | Mensaje: *Esta orden ya tiene guía.* + acciones de etiqueta |
| Cancelada / entregada | Mensaje de no disponible |
| Elegible | Botón **Generar guía** (`data-testid="admin-create-label-button"`) |

## Etiqueta e impresión

- **Abrir etiqueta** — `window.open(labelUrl)` en nueva pestaña.
- **Imprimir** — abre la misma URL (impresión desde el navegador/PDF de Skydropx).
- Sin visor PDF embebido ni ZPL/EPL avanzado en v1.

## Tracking

- **Actualizar tracking** — `adminRefreshShipmentTracking` (requiere número de guía y paquetería).
- Feedback: *Tracking actualizado* o *Sin cambios recientes*.

## Cancelar guía

- **Cancelar guía** — `AlertDialog` con motivo opcional → `adminCancelShippingLabel`.
- Solo si existe `providerShipmentId` en Skydropx.
- No afecta pagos ni reembolsos Conekta.

## Patrón UX: Dialogs vs Drawers

| Caso | Componente |
|------|------------|
| Detalle de orden + guía | `Dialog` o página dedicada |
| Confirmar generar / cancelar guía | `AlertDialog` |
| Drawer lateral | No usar para lectura de guía |

## Invalidación de queries

Tras crear, cancelar o refrescar:

- `adminShippingQueryKeys.all`
- `adminOrdersQueryKeys.all`
- `adminDashboardQueryKeys.all`

## Mensajes de error (mutation)

Mapeados en `shipping-mutation-errors.ts`:

| Caso | Mensaje UI |
|------|------------|
| 502 Skydropx | *Skydropx no pudo generar la guía…* + nota de reintentar |
| 422 Skydropx | Detalle si Skydropx lo envía; si no, revisar teléfono 10 dígitos y CP |
| Tarifa expirada | *Vuelve a cotizar el envío antes de generar la guía.* |
| Dirección incompleta | *La dirección del pedido está incompleta. Faltan: …* |
| Origen no configurado | *Configura la dirección de origen… Faltan: …* |
| Teléfono inválido | *El teléfono debe tener 10 dígitos…* |
| Saldo / carrier | *Revisa saldo o servicios habilitados en Skydropx.* |

## Limitaciones (v1)

- Sin webhooks Skydropx (estado no se actualiza solo).
- Sin pickups.
- Sin email `shipping_update`.
- Sin tracking público para clientes.
- Sin paquetería manual (reemplazada por Skydropx).
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

## data-testid

| ID | Ubicación |
|----|-----------|
| `admin-shipping-card` | Tarjeta guía Skydropx |
| `admin-create-label-button` | Botón generar guía |

Ver también `docs/graphql-admin-shipping.md`.

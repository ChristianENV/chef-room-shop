import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildAdminShipmentsListVariables,
  mapAdminShipmentListItemToTableRow,
} from '@/src/features/admin/shipping/mappers/admin-shipments-list-ui.mapper'
import { deriveShipmentLabelStatus } from '@/src/server/graphql/modules/admin-shipping/admin-shipping.mappers'

describe('admin shipments', () => {
  it('builds list variables from filters', () => {
    const variables = buildAdminShipmentsListVariables({
      search: 'CR-2026',
      statusFilter: 'IN_TRANSIT',
    })

    assert.equal(variables.filter?.search, 'CR-2026')
    assert.equal(variables.filter?.status, 'IN_TRANSIT')
  })

  it('maps shipment list item to table row with formatted labels', () => {
    const row = mapAdminShipmentListItemToTableRow({
      id: 'ship-1',
      orderNumber: 'CR-2026-000001',
      customerName: 'Chef Demo',
      customerEmail: 'demo@chefroom.test',
      status: 'IN_TRANSIT',
      carrier: 'FedEx',
      trackingNumber: '1234567890',
      labelStatus: 'Etiqueta activa',
      costCents: 15900,
      currency: 'MXN',
      createdAt: '2026-02-01T09:55:00.000Z',
      updatedAt: '2026-02-01T10:05:00.000Z',
      trackingUpdatedAt: '2026-02-02T08:00:00.000Z',
    })

    assert.equal(row.statusLabel, 'En tránsito')
    assert.equal(row.carrier, 'FedEx')
    assert.equal(row.trackingNumber, '1234567890')
    assert.equal(row.labelStatus, 'Etiqueta activa')
    assert.match(row.costLabel, /\$159/)
    assert.equal(row.orderNumber, 'CR-2026-000001')
  })

  it('derives label status for admin list', () => {
    assert.equal(
      deriveShipmentLabelStatus({
        status: 'CANCELLED',
        labelUrl: 'https://example.com/label.pdf',
        providerLabelId: 'lbl_1',
        providerShipmentId: 'shp_1',
      } as Parameters<typeof deriveShipmentLabelStatus>[0]),
      'Etiqueta cancelada',
    )

    assert.equal(
      deriveShipmentLabelStatus({
        status: 'PENDING',
        labelUrl: null,
        providerLabelId: null,
        providerShipmentId: null,
      } as Parameters<typeof deriveShipmentLabelStatus>[0]),
      'Sin etiqueta',
    )

    assert.equal(
      deriveShipmentLabelStatus({
        status: 'LABEL_CREATED',
        labelUrl: 'https://example.com/label.pdf',
        providerLabelId: 'lbl_1',
        providerShipmentId: 'shp_1',
      } as Parameters<typeof deriveShipmentLabelStatus>[0]),
      'Etiqueta creada',
    )
  })
})

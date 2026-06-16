import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildAdminDesignsListVariables,
  mapAdminDesignListItemToTableRow,
  mapDesignStatusToLabel,
} from '@/src/features/admin/designs/mappers/admin-designs-ui.mapper'
import {
  resolveDesignFinalPriceCents,
  toDesignShortId,
} from '@/src/server/graphql/modules/admin-designs/admin-designs.mappers'

describe('admin designs', () => {
  it('builds list variables from filters', () => {
    const variables = buildAdminDesignsListVariables({
      search: 'A1B2C3D4',
      statusFilter: 'SAVED',
      ownerFilter: 'GUEST',
    })

    assert.equal(variables.filter?.search, 'A1B2C3D4')
    assert.equal(variables.filter?.status, 'SAVED')
    assert.equal(variables.filter?.ownerType, 'GUEST')
  })

  it('maps design list item to table row with guest owner label', () => {
    const row = mapAdminDesignListItemToTableRow({
      id: '11111111-2222-3333-4444-555555555555',
      shortId: '11111111',
      name: 'Mi filipina',
      previewUrl: 'https://example.com/preview.png',
      productName: 'Filipina clásica',
      productSlug: 'filipina-clasica',
      ownerType: 'GUEST',
      customerName: null,
      customerEmail: null,
      status: 'SAVED',
      finalPriceCents: 249900,
      currency: 'MXN',
      createdAt: '2026-02-01T09:55:00.000Z',
      updatedAt: '2026-02-01T10:05:00.000Z',
      relatedOrderNumber: null,
      relatedCartId: 'cart-123',
      relatedCartStatus: 'ACTIVE',
    })

    assert.equal(row.ownerLabel, 'Invitado')
    assert.equal(row.customerName, 'Invitado')
    assert.equal(row.customerEmail, null)
    assert.equal(row.statusLabel, 'Guardado')
    assert.match(row.finalPriceLabel, /\$2,499/)
    assert.equal(row.relatedCartLabel, 'Carrito cart-123…')
  })

  it('derives short id and final price from config json', () => {
    assert.equal(toDesignShortId('a1b2c3d4-e5f6-7890-abcd-ef1234567890'), 'A1B2C3D4')
    assert.equal(
      resolveDesignFinalPriceCents({
        pricing: { totalPriceCents: 199900 },
      }),
      199900,
    )
    assert.equal(mapDesignStatusToLabel('IN_CART'), 'En carrito')
  })
})

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildAdminPaymentsListVariables,
  mapAdminPaymentToTableRow,
} from '@/src/features/admin/payments/mappers/admin-payments-ui.mapper'

function maskProviderPaymentId(providerOrderId: string): string {
  const trimmed = providerOrderId.trim()
  if (!trimmed) return '—'
  if (trimmed.length <= 8) return '••••'
  return `${trimmed.slice(0, 4)}••••${trimmed.slice(-4)}`
}

describe('admin payments', () => {
  it('masks provider payment ids', () => {
    assert.equal(maskProviderPaymentId('ord_2t4Xx8k9ZqP1mN3vL7wR'), 'ord_••••L7wR')
    assert.equal(maskProviderPaymentId('short'), '••••')
  })

  it('builds list variables from filters', () => {
    const variables = buildAdminPaymentsListVariables({
      search: 'CR-2026',
      statusFilter: 'PAID',
    })

    assert.equal(variables.filter?.search, 'CR-2026')
    assert.equal(variables.filter?.status, 'PAID')
  })

  it('maps payment to table row with formatted labels', () => {
    const row = mapAdminPaymentToTableRow({
      id: 'pay-1',
      orderId: 'order-1',
      orderNumber: 'CR-2026-000001',
      customerName: 'Chef Demo',
      customerEmail: 'demo@chefroom.test',
      provider: 'CONEKTA',
      method: 'CARD',
      status: 'PAID',
      amountCents: 199900,
      currency: 'MXN',
      providerPaymentIdMasked: 'ord_••••7wR',
      paidAt: '2026-02-01T10:00:00.000Z',
      createdAt: '2026-02-01T09:55:00.000Z',
      updatedAt: '2026-02-01T10:05:00.000Z',
    })

    assert.equal(row.providerLabel, 'Conekta')
    assert.equal(row.methodLabel, 'Tarjeta')
    assert.equal(row.statusLabel, 'Pagado')
    assert.match(row.amountLabel, /\$1,999/)
    assert.equal(row.orderNumber, 'CR-2026-000001')
  })
})

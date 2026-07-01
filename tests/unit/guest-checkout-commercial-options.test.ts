import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

import { ORDER_BY_CHECKOUT_TOKEN_QUERY } from '@/src/features/storefront/checkout/graphql/checkout.queries'
import { mapCheckoutResultToOrderDetailViewModel } from '@/src/features/storefront/orders/mappers/map-checkout-result-to-order-detail-view-model'

describe('guest checkout commercial options query wiring', () => {
  it('fetches optionPriceCents and commercialOptionsSnapshot on token-scoped order detail', () => {
    assert.match(ORDER_BY_CHECKOUT_TOKEN_QUERY, /optionPriceCents/)
    assert.match(ORDER_BY_CHECKOUT_TOKEN_QUERY, /commercialOptionsSnapshot/)
    assert.match(ORDER_BY_CHECKOUT_TOKEN_QUERY, /priceDeltaCents/)
  })

  it('maps public checkout items with commercial options into account order detail items', () => {
    const viewModel = mapCheckoutResultToOrderDetailViewModel({
      orderId: 'order-1',
      orderNumber: 'CR-GUEST-001',
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
      fulfillmentStatus: 'UNFULFILLED',
      totalCents: 120000,
      shippingCents: 0,
      subtotalCents: 100000,
      customizationTotalCents: 0,
      discountTotalCents: 0,
      taxTotalCents: 0,
      currency: 'MXN',
      paymentMethod: 'CARD',
      createdAt: '2026-06-01T00:00:00.000Z',
      placedAt: null,
      maskedCustomerEmail: 'g***@example.com',
      items: [
        {
          id: 'item-1',
          name: 'Mandil ejecutivo',
          quantity: 1,
          totalPriceCents: 120000,
          customizationPriceCents: 0,
          optionPriceCents: 15000,
          commercialOptionsSnapshot: [
            {
              groupId: 'group-1',
              groupSlug: 'apron-length',
              groupName: 'Largo',
              valueId: 'value-1',
              valueSlug: 'mas-10cm',
              valueLabel: '+10 cm',
              priceDeltaCents: 15000,
            },
          ],
          productSnapshotJson: { name: 'Mandil ejecutivo' },
          designSnapshotJson: null,
        },
      ],
      payments: [],
      shipments: [],
      events: [],
      paymentActions: {
        canVerifyPayment: true,
        canContinuePayment: false,
        canRetryPayment: false,
        paymentRedirectUrl: null,
      },
      claimUrl: null,
      accountOrderUrl: null,
      canViewDetails: false,
      viewerEmailMatchesOrder: false,
      detailUrl: '/account/orders/CR-GUEST-001?from=checkout&token=abc',
      paymentReference: null,
      paymentExpiresAt: null,
      cashPaymentLocations: null,
      returnTokenValid: true,
      tokenExpired: false,
      loginUrl: '/login',
      registerUrl: '/register',
    })

    assert.equal(viewModel.items[0]?.optionPriceCents, 15000)
    assert.equal(viewModel.items[0]?.commercialOptionsSnapshot[0]?.valueSlug, 'mas-10cm')
  })

  it('uses the shared order detail UI that renders commercial options per line', () => {
    const orderItemRowSource = readFileSync(
      resolve('src/features/storefront/account/order-detail/order-item-row.tsx'),
      'utf8',
    )

    assert.match(orderItemRowSource, /CartCommercialOptionsSummary/)
    assert.match(orderItemRowSource, /data-testid="order-item-commercial-options"/)
  })
})

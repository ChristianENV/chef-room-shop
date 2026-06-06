import type { Page, Route } from '@playwright/test'

const MOCK_TOKEN = 'e2e-checkout-return-token'
const MOCK_ORDER_NUMBER = 'CR-E2E-0001'

export type MockCheckoutResultOptions = {
  status?: string
  paymentStatus?: string
  canViewDetails?: boolean
  pollSequence?: Array<{ status: string; paymentStatus: string }>
  verifySequence?: Array<{ status: string; paymentStatus: string }>
}

function buildOrderPayload(overrides: {
  status: string
  paymentStatus: string
}) {
  return {
    id: 'order-e2e-1',
    orderNumber: MOCK_ORDER_NUMBER,
    status: overrides.status,
    paymentStatus: overrides.paymentStatus,
    fulfillmentStatus: 'UNFULFILLED',
    customerEmail: 'guest@example.com',
    customerPhone: null,
    subtotalCents: 220000,
    customizationTotalCents: 15000,
    shippingCostCents: 15000,
    discountTotalCents: 0,
    taxTotalCents: 0,
    totalCents: 250000,
    currency: 'MXN',
    placedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    items: [
      {
        id: 'item-1',
        name: 'Filipina Chef Room',
        sku: 'FJ-001',
        quantity: 1,
        unitPriceCents: 205000,
        customizationPriceCents: 15000,
        totalPriceCents: 220000,
        productSnapshotJson: {
          name: 'Filipina Chef Room',
          sizeName: 'M',
          imageUrl: null,
        },
        designSnapshotJson: null,
      },
    ],
    payments: [
      {
        id: 'pay-1',
        provider: 'CONEKTA',
        method: 'CARD',
        status: overrides.paymentStatus,
        amountCents: 250000,
        currency: 'MXN',
        paidAt: overrides.paymentStatus === 'PAID' ? new Date().toISOString() : null,
        expiresAt: null,
      },
    ],
    shipments: [],
    events: [],
    paymentActions: {
      canVerifyPayment: overrides.paymentStatus !== 'PAID',
      canContinuePayment: false,
      canRetryPayment: overrides.paymentStatus === 'FAILED',
      paymentRedirectUrl: null,
    },
  }
}

function buildCheckoutResult(overrides: {
  status: string
  paymentStatus: string
  canViewDetails?: boolean
}) {
  const order = buildOrderPayload(overrides)
  const postCheckoutUrl = `/account/orders/${MOCK_ORDER_NUMBER}?from=checkout&token=${MOCK_TOKEN}`

  return {
    orderNumber: order.orderNumber,
    orderId: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    totalCents: order.totalCents,
    shippingCents: order.shippingCostCents,
    subtotalCents: order.subtotalCents,
    customizationTotalCents: order.customizationTotalCents,
    discountTotalCents: order.discountTotalCents,
    taxTotalCents: order.taxTotalCents,
    currency: order.currency,
    paymentMethod: 'CARD',
    createdAt: order.createdAt,
    placedAt: order.placedAt,
    maskedCustomerEmail: 'gu***@example.com',
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      totalPriceCents: item.totalPriceCents,
      customizationPriceCents: item.customizationPriceCents,
      productSnapshotJson: item.productSnapshotJson,
      designSnapshotJson: item.designSnapshotJson,
    })),
    payments: order.payments,
    shipments: order.shipments,
    events: order.events,
    paymentActions: order.paymentActions,
    claimUrl: null,
    accountOrderUrl: `/account/orders/${MOCK_ORDER_NUMBER}`,
    canViewDetails: overrides.canViewDetails ?? false,
    viewerEmailMatchesOrder: false,
    detailUrl: postCheckoutUrl,
    paymentReference: null,
    paymentExpiresAt: null,
    cashPaymentLocations: null,
    returnTokenValid: true,
    tokenExpired: false,
    loginUrl: `/login?callbackUrl=${encodeURIComponent(postCheckoutUrl)}`,
    registerUrl: `/register?callbackUrl=${encodeURIComponent(postCheckoutUrl)}`,
  }
}

export function getMockCheckoutToken(): string {
  return MOCK_TOKEN
}

export function getMockOrderNumber(): string {
  return MOCK_ORDER_NUMBER
}

export async function mockCheckoutPostOrderFlow(
  page: Page,
  options: MockCheckoutResultOptions = {},
): Promise<void> {
  const sequence =
    options.pollSequence ??
    [
      {
        status: options.status ?? 'PENDING_PAYMENT',
        paymentStatus: options.paymentStatus ?? 'PENDING',
      },
    ]

  const verifySequence =
    options.verifySequence ??
    sequence

  let checkoutCallIndex = 0
  let orderCallIndex = 0
  let verifyCallIndex = 0

  await page.route('**/api/graphql', async (route: Route) => {
    const request = route.request()
    const payload = request.postDataJSON() as { query?: string }
    const query = payload.query ?? ''

    if (query.includes('query CheckoutResultByToken')) {
      const entry = sequence[Math.min(checkoutCallIndex, sequence.length - 1)]
      checkoutCallIndex += 1

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            checkoutResultByToken: buildCheckoutResult({
              status: entry.status,
              paymentStatus: entry.paymentStatus,
              canViewDetails: options.canViewDetails,
            }),
          },
        }),
      })
      return
    }

    if (query.includes('query OrderByCheckoutToken')) {
      const entry = sequence[Math.min(orderCallIndex, sequence.length - 1)]
      orderCallIndex += 1
      const order = buildOrderPayload(entry)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            orderByCheckoutToken: {
              returnTokenValid: true,
              tokenExpired: false,
              viewerEmailMatchesOrder: false,
              maskedCustomerEmail: 'gu***@example.com',
              order,
            },
          },
        }),
      })
      return
    }

    if (query.includes('mutation VerifyCheckoutPaymentByToken')) {
      const entry = verifySequence[Math.min(verifyCallIndex, verifySequence.length - 1)]
      verifyCallIndex += 1

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            verifyCheckoutPaymentByToken: {
              orderNumber: MOCK_ORDER_NUMBER,
              orderStatus: entry.status,
              paymentStatus: entry.paymentStatus,
              paymentMethod: 'CARD',
              canRetryPayment: entry.paymentStatus === 'FAILED',
              canContinuePayment: false,
              paymentRedirectUrl: null,
              checkedAt: new Date().toISOString(),
              message:
                entry.paymentStatus === 'PAID'
                  ? 'Pago confirmado.'
                  : 'Conekta aún no confirma el pago.',
            },
          },
        }),
      })
      return
    }

    await route.continue()
  })
}

/** @deprecated Use mockCheckoutPostOrderFlow */
export async function mockCheckoutResultByToken(
  page: Page,
  options: MockCheckoutResultOptions = {},
): Promise<void> {
  await mockCheckoutPostOrderFlow(page, options)
}

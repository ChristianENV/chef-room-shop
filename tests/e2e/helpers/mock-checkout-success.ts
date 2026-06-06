import type { Page, Route } from '@playwright/test'

const MOCK_TOKEN = 'e2e-checkout-return-token'

export type MockCheckoutResultOptions = {
  status?: string
  paymentStatus?: string
  canViewDetails?: boolean
  pollSequence?: Array<{ status: string; paymentStatus: string }>
}

function buildCheckoutResult(overrides: {
  status: string
  paymentStatus: string
  canViewDetails?: boolean
}) {
  return {
    orderNumber: 'CR-E2E-0001',
    orderId: 'order-e2e-1',
    status: overrides.status,
    paymentStatus: overrides.paymentStatus,
    fulfillmentStatus: 'UNFULFILLED',
    totalCents: 250000,
    shippingCents: 15000,
    subtotalCents: 220000,
    customizationTotalCents: 15000,
    discountTotalCents: 0,
    taxTotalCents: 0,
    currency: 'MXN',
    paymentMethod: 'CARD',
    createdAt: new Date().toISOString(),
    placedAt: new Date().toISOString(),
    maskedCustomerEmail: 'gu***@example.com',
    items: [
      {
        id: 'item-1',
        name: 'Filipina Chef Room',
        quantity: 1,
        totalPriceCents: 220000,
        customizationPriceCents: 15000,
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
    claimUrl: null,
    accountOrderUrl: '/account/orders/CR-E2E-0001',
    canViewDetails: overrides.canViewDetails ?? false,
    viewerEmailMatchesOrder: false,
    detailUrl: overrides.canViewDetails ? '/account/orders/CR-E2E-0001?from=checkout' : null,
    paymentReference: null,
    paymentExpiresAt: null,
    cashPaymentLocations: null,
    returnTokenValid: true,
    tokenExpired: false,
    loginUrl: `/login?callbackUrl=${encodeURIComponent(`/checkout/success?token=${MOCK_TOKEN}&from=purchase`)}`,
    registerUrl: `/register?callbackUrl=${encodeURIComponent(`/checkout/success?token=${MOCK_TOKEN}&from=purchase`)}`,
  }
}

export function getMockCheckoutToken(): string {
  return MOCK_TOKEN
}

export async function mockCheckoutResultByToken(
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

  let callIndex = 0

  await page.route('**/api/graphql', async (route: Route) => {
    const request = route.request()
    const payload = request.postDataJSON() as { query?: string }
    const query = payload.query ?? ''

    if (query.includes('query CheckoutResultByToken')) {
      const entry = sequence[Math.min(callIndex, sequence.length - 1)]
      callIndex += 1

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

    await route.continue()
  })
}

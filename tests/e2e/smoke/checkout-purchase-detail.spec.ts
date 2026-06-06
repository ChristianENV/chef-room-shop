import { expect, test } from '@playwright/test'

import {
  getMockCheckoutToken,
  mockCheckoutResultByToken,
} from '../helpers/mock-checkout-success'

test.describe('Checkout purchase detail', () => {
  test('guest purchase return shows unified purchase detail page', async ({ page }) => {
    await mockCheckoutResultByToken(page, {
      status: 'PAID',
      paymentStatus: 'PAID',
    })

    const token = getMockCheckoutToken()
    await page.goto(`/checkout/success?token=${token}`)

    await expect(page.getByTestId('checkout-success-page')).toBeVisible()
    await expect(page.getByTestId('purchase-detail-page')).toBeVisible()
    await expect(page.getByTestId('purchase-status-hero')).toBeVisible()
    await expect(page.getByTestId('purchase-payment-confirmed')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'CR-E2E-0001' })).toBeVisible()
    await expect(page.getByText('Filipina Chef Room')).toBeVisible()
    await expect(page.getByTestId('guest-create-account-button')).toBeVisible()
    await expect(page.getByTestId('guest-login-button')).toBeVisible()
  })

  test('guest login link includes purchase callbackUrl', async ({ page }) => {
    await mockCheckoutResultByToken(page, { status: 'PAID', paymentStatus: 'PAID' })

    const token = getMockCheckoutToken()
    await page.goto(`/checkout/success?token=${token}`)

    const loginLink = page.getByTestId('guest-login-button')
    await expect(loginLink).toBeVisible()

    const href = await loginLink.getAttribute('href')
    expect(href).toContain('/login')
    expect(href).toContain('callbackUrl=')
    expect(decodeURIComponent(href ?? '')).toContain(`/checkout/success?token=${token}`)
  })

  test('guest register link includes purchase callbackUrl', async ({ page }) => {
    await mockCheckoutResultByToken(page, { status: 'PAID', paymentStatus: 'PAID' })

    const token = getMockCheckoutToken()
    await page.goto(`/checkout/success?token=${token}`)

    const registerLink = page.getByTestId('guest-create-account-button')
    const href = await registerLink.getAttribute('href')
    expect(href).toContain('/register')
    expect(href).toContain('callbackUrl=')
    expect(decodeURIComponent(href ?? '')).toContain('from=purchase')
  })

  test('authenticated owner redirects to account order detail', async ({ page }) => {
    await mockCheckoutResultByToken(page, {
      status: 'PAID',
      paymentStatus: 'PAID',
      canViewDetails: true,
    })

    const token = getMockCheckoutToken()
    await page.goto(`/checkout/success?token=${token}`)

    await page.waitForURL(/\/account\/orders\/CR-E2E-0001/, { timeout: 15_000 })
    expect(page.url()).toContain('from=checkout')
  })

  test('delayed payment shows loading then confirmed state', async ({ page }) => {
    await mockCheckoutResultByToken(page, {
      pollSequence: [
        { status: 'PENDING_PAYMENT', paymentStatus: 'PENDING' },
        { status: 'PENDING_PAYMENT', paymentStatus: 'PENDING' },
        { status: 'PAID', paymentStatus: 'PAID' },
      ],
    })

    const token = getMockCheckoutToken()
    await page.goto(`/checkout/success?token=${token}`)

    await expect(page.getByTestId('purchase-confirmation-loading')).toBeVisible()
    await expect(page.getByTestId('purchase-payment-confirmed')).toBeVisible({
      timeout: 45_000,
    })
  })

  test('payment timeout shows manual verify CTA without auto Conekta redirect', async ({
    page,
  }) => {
    await mockCheckoutResultByToken(page, {
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
    })

    const token = getMockCheckoutToken()
    await page.goto(`/checkout/success?token=${token}`)

    await expect(page.getByTestId('verify-payment-button')).toBeVisible({
      timeout: 40_000,
    })
    await expect(page.getByTestId('purchase-payment-timeout')).toBeVisible({
      timeout: 40_000,
    })

    await page.waitForTimeout(2000)
    expect(page.url()).toContain('/checkout/success')
    expect(page.url()).not.toContain('conekta')
  })
})

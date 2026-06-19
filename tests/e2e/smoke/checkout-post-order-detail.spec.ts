import { expect, test } from '@playwright/test'

import {
  getMockCheckoutToken,
  getMockOrderNumber,
  mockCheckoutPostOrderFlow,
} from '../helpers/mock-checkout-success'

test.describe('Checkout post-order detail flow', () => {
  test('success bridge redirects to account order detail with checkout context', async ({
    page,
  }) => {
    await mockCheckoutPostOrderFlow(page, {
      status: 'PAID',
      paymentStatus: 'PAID',
    })

    const token = getMockCheckoutToken()
    await page.goto(`/checkout/success?token=${token}`)

    await expect(page.getByTestId('checkout-success-redirecting')).toBeVisible()
    await page.waitForURL(
      new RegExp(`/account/orders/${getMockOrderNumber()}\\?from=checkout&token=${token}`),
      { timeout: 15_000 },
    )
    expect(page.url()).not.toContain('/checkout/success')
  })

  test('guest post-checkout sees order detail behind blocking modal', async ({ page }) => {
    await mockCheckoutPostOrderFlow(page, {
      status: 'PAID',
      paymentStatus: 'PAID',
    })

    const token = getMockCheckoutToken()
    await page.goto(`/account/orders/${getMockOrderNumber()}?from=checkout&token=${token}`)

    await expect(page.getByTestId('account-order-detail-page')).toBeAttached()
    await expect(page.getByTestId('post-checkout-order-modal')).toBeVisible()
    await expect(page.getByTestId('post-checkout-payment-confirmed')).toBeVisible()
    await expect(page.getByTestId('account-order-detail-page')).toContainText(getMockOrderNumber())
    await expect(page.getByTestId('account-order-detail-page')).toContainText('Filipina Chef Room')
    await expect(page.getByTestId('post-checkout-create-account-button')).toBeVisible()
    await expect(page.getByTestId('post-checkout-login-button')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Close' })).toHaveCount(0)
  })

  test('guest login link includes order detail callbackUrl', async ({ page }) => {
    await mockCheckoutPostOrderFlow(page, { status: 'PAID', paymentStatus: 'PAID' })

    const token = getMockCheckoutToken()
    await page.goto(`/account/orders/${getMockOrderNumber()}?from=checkout&token=${token}`)

    const loginLink = page.getByTestId('post-checkout-login-button')
    await expect(loginLink).toBeVisible()

    const href = await loginLink.getAttribute('href')
    expect(href).toContain('/login')
    expect(href).toContain('callbackUrl=')
    expect(decodeURIComponent(href ?? '')).toContain(
      `/account/orders/${getMockOrderNumber()}?from=checkout&token=${token}`,
    )
  })

  test('guest register link includes order detail callbackUrl', async ({ page }) => {
    await mockCheckoutPostOrderFlow(page, { status: 'PAID', paymentStatus: 'PAID' })

    const token = getMockCheckoutToken()
    await page.goto(`/account/orders/${getMockOrderNumber()}?from=checkout&token=${token}`)

    const registerLink = page.getByTestId('post-checkout-create-account-button')
    const href = await registerLink.getAttribute('href')
    expect(href).toContain('/register')
    expect(href).toContain('callbackUrl=')
    expect(decodeURIComponent(href ?? '')).toContain('from=checkout')
    expect(decodeURIComponent(href ?? '')).toContain(`token=${token}`)
  })

  test('payment verification from modal updates to paid', async ({ page }) => {
    await mockCheckoutPostOrderFlow(page, {
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
      verifySequence: [
        { status: 'PENDING_PAYMENT', paymentStatus: 'PENDING' },
        { status: 'PAID', paymentStatus: 'PAID' },
      ],
    })

    const token = getMockCheckoutToken()
    await page.goto(`/account/orders/${getMockOrderNumber()}?from=checkout&token=${token}`)

    await expect(page.getByTestId('post-checkout-payment-confirmed')).toBeVisible({
      timeout: 45_000,
    })
  })

  test('payment timeout shows manual verify without auto Conekta redirect', async ({ page }) => {
    await mockCheckoutPostOrderFlow(page, {
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
      verifySequence: [{ status: 'PENDING_PAYMENT', paymentStatus: 'PENDING' }],
    })

    const token = getMockCheckoutToken()
    await page.goto(`/account/orders/${getMockOrderNumber()}?from=checkout&token=${token}`)

    await expect(page.getByTestId('post-checkout-payment-timeout')).toBeVisible({
      timeout: 45_000,
    })
    await expect(page.getByTestId('post-checkout-verify-payment-button')).toBeVisible()

    await page.waitForTimeout(2000)
    expect(page.url()).toContain(`/account/orders/${getMockOrderNumber()}`)
    expect(page.url()).not.toContain('conekta')
  })
})

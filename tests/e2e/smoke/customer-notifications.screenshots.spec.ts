import { test } from '@playwright/test'

import { loginAsCustomer } from '../helpers/customer-login'
import { mockNotificationsGraphQL } from '../helpers/mock-notifications'

test('capture notification UI screenshots', async ({ page }) => {
  await mockNotificationsGraphQL(page)
  await loginAsCustomer(page)
  await page.goto('/')
  await page.setViewportSize({ width: 1280, height: 800 })

  await page.getByTestId('customer-notifications-bell').click()
  await page.getByTestId('customer-notifications-panel').waitFor({ state: 'visible' })

  await page.screenshot({
    path: 'test-results/customer-notifications-panel.png',
    fullPage: false,
  })

  await page.goto('/account/notifications')
  await page.getByTestId('account-notifications-page').waitFor({ state: 'visible' })
  await page.screenshot({
    path: 'test-results/customer-notifications-page.png',
    fullPage: true,
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({
    path: 'test-results/customer-notifications-page-mobile.png',
    fullPage: true,
  })
})

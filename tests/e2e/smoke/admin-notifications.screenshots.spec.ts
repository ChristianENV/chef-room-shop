import { test } from '@playwright/test'

import { loginAsAdmin } from '../helpers/admin-login'
import {
  defaultAdminMockNotifications,
  mockNotificationsGraphQL,
} from '../helpers/mock-notifications'

test('capture admin notification UI screenshots', async ({ page }) => {
  await loginAsAdmin(page)
  await mockNotificationsGraphQL(page, { initial: defaultAdminMockNotifications })
  await page.goto('/admin/dashboard')
  await page.setViewportSize({ width: 1280, height: 800 })

  await page.getByTestId('admin-notifications-bell').click()
  await page.getByTestId('admin-notifications-panel').waitFor({ state: 'visible' })

  await page.screenshot({
    path: 'test-results/admin-notifications-panel.png',
    fullPage: false,
  })

  await page.goto('/admin/notifications')
  await page.getByTestId('admin-notifications-page').waitFor({ state: 'visible' })
  await page.getByTestId('admin-notification-item').nth(2).waitFor({ state: 'visible' })
  await page.screenshot({
    path: 'test-results/admin-notifications-page.png',
    fullPage: true,
  })
})

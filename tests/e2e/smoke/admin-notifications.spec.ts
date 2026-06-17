import { expect, test } from '@playwright/test'

import { loginAsAdmin } from '../helpers/admin-login'
import { loginAsCustomer } from '../helpers/customer-login'
import {
  defaultAdminMockNotifications,
  mockNotificationsGraphQL,
} from '../helpers/mock-notifications'

test.describe('admin notifications UI', () => {
  test('admin sees notification bell and unread badge', async ({ page }) => {
    await loginAsAdmin(page)
    await mockNotificationsGraphQL(page, { initial: defaultAdminMockNotifications })

    await page.goto('/admin/dashboard')
    await expect(page.getByTestId('admin-notifications-bell')).toBeVisible()
    await expect(page.getByTestId('admin-notifications-badge')).toHaveText('2')
  })

  test('admin panel opens and lists admin notifications', async ({ page }) => {
    await loginAsAdmin(page)
    await mockNotificationsGraphQL(page, { initial: defaultAdminMockNotifications })
    await page.goto('/admin/dashboard')

    await page.getByTestId('admin-notifications-bell').click()
    await expect(page.getByTestId('admin-notifications-panel')).toBeVisible()
    await expect(page.getByTestId('admin-notification-item')).toHaveCount(3)
    await expect(page.getByText('Nuevo pedido demo')).toBeVisible()
  })

  test('mark all read clears admin unread badge', async ({ page }) => {
    await loginAsAdmin(page)
    const { getState } = await mockNotificationsGraphQL(page, {
      initial: defaultAdminMockNotifications,
    })
    await page.goto('/admin/dashboard')

    await page.getByTestId('admin-notifications-bell').click()
    await page.getByTestId('admin-notifications-mark-all-read').click()

    await expect.poll(() => countUnreadAdmin(getState().notifications)).toBe(0)
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('admin-notifications-badge')).toHaveCount(0)
  })

  test('admin notifications page renders', async ({ page }) => {
    await loginAsAdmin(page)
    await mockNotificationsGraphQL(page, { initial: defaultAdminMockNotifications })

    await page.goto('/admin/notifications')
    await expect(page.getByTestId('admin-notifications-page')).toBeVisible()
    await expect(page.getByTestId('admin-notification-item')).toHaveCount(3)
  })

  test('customer cannot access admin notifications page', async ({ page }) => {
    await loginAsCustomer(page)

    await page.goto('/admin/notifications')
    await expect(page).not.toHaveURL(/\/admin\/notifications$/)
  })
})

function countUnreadAdmin(
  notifications: typeof defaultAdminMockNotifications.notifications,
): number {
  return notifications.filter((item) => item.audience === 'ADMIN' && !item.readAt).length
}

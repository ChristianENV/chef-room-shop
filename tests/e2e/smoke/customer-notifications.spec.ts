import { expect, test } from '@playwright/test'

import { loginAsCustomer } from '../helpers/customer-login'
import { defaultMockNotifications, mockNotificationsGraphQL } from '../helpers/mock-notifications'

test.describe('customer notifications UI', () => {
  test('guest does not see notification bell or fetch notifications', async ({ page }) => {
    let unreadRequests = 0
    let listRequests = 0

    await page.route('**/api/graphql', async (route) => {
      const request = route.request()
      if (request.method() === 'POST') {
        const payload = request.postDataJSON() as { query?: string }
        const query = payload.query ?? ''
        if (query.includes('myUnreadNotificationCount')) unreadRequests += 1
        if (query.includes('myNotifications')) listRequests += 1
      }
      await route.continue()
    })

    await page.goto('/')
    await expect(page.getByTestId('storefront-navbar')).toBeVisible()

    await expect(page.getByTestId('customer-notifications-bell')).toHaveCount(0)
    expect(unreadRequests).toBe(0)
    expect(listRequests).toBe(0)
  })

  test('authenticated user sees bell and unread badge', async ({ page }) => {
    await mockNotificationsGraphQL(page)
    await loginAsCustomer(page)

    await page.goto('/')
    await expect(page.getByTestId('customer-notifications-bell')).toBeVisible()
    await expect(page.getByTestId('customer-notifications-badge')).toHaveText('2')
  })

  test('opening panel fetches notifications', async ({ page }) => {
    await mockNotificationsGraphQL(page)
    await loginAsCustomer(page)
    await page.goto('/')

    await page.getByTestId('customer-notifications-bell').click()
    await expect(page.getByTestId('customer-notifications-panel')).toBeVisible()
    await expect(page.getByTestId('customer-notification-item')).toHaveCount(3)
    await expect(page.getByText('Pedido registrado')).toBeVisible()
  })

  test('mark one read updates item and count', async ({ page }) => {
    const { getState } = await mockNotificationsGraphQL(page)
    await loginAsCustomer(page)
    await page.goto('/')

    await page.getByTestId('customer-notifications-bell').click()
    const unreadItem = page
      .getByTestId('customer-notification-item')
      .filter({ hasText: 'Diseño guardado' })
      .first()

    await unreadItem.click()

    await expect.poll(() => getState().unreadCount).toBe(1)

    await page.keyboard.press('Escape')
    await expect(page.getByTestId('customer-notifications-badge')).toHaveText('1')
  })

  test('mark all read clears unread badge', async ({ page }) => {
    const { getState } = await mockNotificationsGraphQL(page)
    await loginAsCustomer(page)
    await page.goto('/')

    await page.getByTestId('customer-notifications-bell').click()
    await page.getByTestId('customer-notifications-mark-all-read').click()

    await expect.poll(() => getState().unreadCount).toBe(0)
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('customer-notifications-badge')).toHaveCount(0)
  })

  test('account notifications page renders on mobile', async ({ page }) => {
    await mockNotificationsGraphQL(page)
    await loginAsCustomer(page)

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/account/notifications')

    await expect(page.getByTestId('account-notifications-page')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Notificaciones' }).first()).toBeVisible()
    await expect(page.getByTestId('customer-notification-item')).toHaveCount(
      defaultMockNotifications.notifications.length,
    )
  })
})

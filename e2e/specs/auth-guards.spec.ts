import { test, expect } from '@playwright/test'

import { loginAsAdmin, loginAsCustomer, logout } from '../helpers/auth'
import { routes } from '../../src/config/routes'

test.describe('Auth guards', () => {
  test('customer cannot access admin dashboard', async ({ page }) => {
    await loginAsCustomer(page)
    await page.goto(routes.adminDashboard)
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('admin can access admin dashboard', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto(routes.adminDashboard)
    await expect(page).not.toHaveURL(/\/admin\/login/)
    await expect(page.getByRole('heading', { name: /dashboard|panel|resumen/i })).toBeVisible({
      timeout: 15_000,
    })
  })

  test('account orders requires login', async ({ page }) => {
    await logout(page)
    await page.goto(`${routes.account}/orders`)
    await expect(page).toHaveURL(/\/login/)
  })

  test('account order detail requires login', async ({ page }) => {
    await logout(page)
    await page.goto(routes.accountOrderDetail('CR-DEMO-0001'))
    await expect(page).toHaveURL(/\/login/)
  })
})

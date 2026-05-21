import { test, expect } from '@playwright/test'

import { loginAsAdmin } from '../helpers/auth'
import { openAdminOrders, openOrderDrawer } from '../helpers/admin'

const runMutations = process.env.E2E_RUN_ADMIN_MUTATIONS === 'true'

test.describe('Admin orders smoke', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await openAdminOrders(page)
  })

  test('shows orders table and opens detail drawer', async ({ page }) => {
    await expect(page.getByTestId('admin-orders-table')).toBeVisible()
    const firstOrderCell = page.locator('tbody tr').first().getByRole('cell').first()
    const orderNumber = (await firstOrderCell.textContent())?.trim()
    expect(orderNumber).toBeTruthy()

    if (orderNumber) {
      await openOrderDrawer(page, orderNumber)
      await expect(page.getByText('Cliente', { exact: false })).toBeVisible()
      await expect(page.getByRole('tab', { name: 'Items' })).toBeVisible()
    }
  })

  test('search filters orders', async ({ page }) => {
    const search = page.getByTestId('admin-orders-search')
    await search.fill('CR-')
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15_000 })
  })

  const describeMutations = runMutations ? test.describe : test.describe.skip

  describeMutations('admin mutations (E2E_RUN_ADMIN_MUTATIONS=true)', () => {
    test('can add internal note from drawer', async ({ page }) => {
      const orderNumber = (
        await page.locator('tbody tr').first().getByRole('cell').first().textContent()
      )?.trim()
      test.skip(!orderNumber, 'No orders in demo seed')

      await openOrderDrawer(page, orderNumber!)
      await page.getByPlaceholder('Nota para el equipo').fill('Nota E2E automatizada')
      await page.getByRole('button', { name: 'Guardar nota' }).click()
      await expect(page.getByText(/nota agregada/i)).toBeVisible({ timeout: 15_000 })
    })
  })
})

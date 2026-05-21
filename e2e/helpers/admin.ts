import type { Page } from '@playwright/test'

import { routes } from '../../src/config/routes'

/**
 * Navigates to admin orders list.
 */
export async function openAdminOrders(page: Page): Promise<void> {
  await page.goto(routes.adminOrders)
  await page.getByTestId('admin-orders-table').waitFor({ timeout: 30_000 })
}

/**
 * Filters admin table by order number search.
 */
export async function findOrder(page: Page, orderNumber: string): Promise<void> {
  const search = page.getByTestId('admin-orders-search')
  await search.fill(orderNumber)
  await page.waitForTimeout(500)
  await page.getByRole('cell', { name: orderNumber }).first().waitFor({ timeout: 15_000 })
}

/**
 * Opens order detail drawer from table row.
 */
export async function openOrderDrawer(page: Page, orderNumber: string): Promise<void> {
  await findOrder(page, orderNumber)
  await page.getByRole('row').filter({ hasText: orderNumber }).first().click()
  await page.getByRole('heading', { name: orderNumber }).waitFor({ timeout: 15_000 })
}

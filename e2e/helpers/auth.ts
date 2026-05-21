import type { Page } from '@playwright/test'

import { routes } from '../../src/config/routes'

export const DEMO_CUSTOMER = {
  email: process.env.E2E_CUSTOMER_EMAIL ?? 'cliente.demo+1@chefroom.test',
  password: process.env.E2E_CUSTOMER_PASSWORD ?? '12345678',
}

export const DEMO_ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL ?? 'cnoriegava+2@gmail.com',
  password: process.env.E2E_ADMIN_PASSWORD ?? '12345678',
}

/**
 * Signs in via storefront /login (Better Auth email).
 */
export async function loginAsCustomer(page: Page): Promise<void> {
  await page.goto(routes.login)
  await page.locator('#email').fill(DEMO_CUSTOMER.email)
  await page.locator('#password').fill(DEMO_CUSTOMER.password)
  await page.getByRole('button', { name: /Iniciar sesi/i }).click()
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30_000 })
}

/**
 * Signs in via admin /admin/login.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto(routes.adminLogin)
  await page.locator('#email').fill(DEMO_ADMIN.email)
  await page.locator('#password').fill(DEMO_ADMIN.password)
  await page.getByRole('button', { name: /Iniciar sesi/i }).click()
  await page.waitForURL(/\/admin\/(dashboard|orders)/, { timeout: 30_000 })
}

/**
 * Clears session by visiting login (storefront).
 */
export async function logout(page: Page): Promise<void> {
  await page.context().clearCookies()
  await page.goto(routes.login)
}

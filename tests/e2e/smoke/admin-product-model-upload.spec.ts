/**
 * Admin Product Model 3D Upload — E2E Smoke
 *
 * Validates the admin flow for uploading a GLB model to a product:
 *   Login → Admin Products → Open demo product → Upload GLB → Success state
 *
 * All external dependencies (GraphQL mutations, R2 PUT) are mocked via
 * `page.route()` so the test runs without real R2 credentials.
 *
 * Run with server already started:
 *   PLAYWRIGHT_SKIP_WEBSERVER=true PLAYWRIGHT_BASE_URL=http://localhost:3000 \
 *   pnpm exec playwright test tests/e2e/smoke/admin-product-model-upload.spec.ts
 *
 * Variables:
 *   E2E_ADMIN_EMAIL     Admin email (default: cnoriegava+1@gmail.com)
 *   E2E_ADMIN_PASSWORD  Admin password (default: 12345678)
 *   E2E_PRODUCT_SLUG    Product slug to edit (default: demo-filipina-executive-blanca)
 */

import path from 'node:path'
import { type Page, expect, test } from '@playwright/test'
import { loginAsAdmin } from '../helpers/admin-login'
import {
  mockProductModelUploadFlow,
  MOCK_PUBLIC_URL,
} from '../helpers/mock-product-model-upload'

const PRODUCT_SLUG =
  process.env.E2E_PRODUCT_SLUG ?? 'demo-filipina-executive-blanca'
const GLB_FIXTURE = path.resolve(__dirname, '../../fixtures/models/minimal-valid.glb')

/** Shared helper: log in, navigate to products, open the demo product's edit dialog. */
async function openDemoProductForm(page: Page) {
  await loginAsAdmin(page)
  await page.goto('/admin/products')
  // Products list may take time to hydrate in dev.
  await expect(page.getByTestId('admin-product-row').first()).toBeVisible({ timeout: 30_000 })

  // The `data-product-slug` attribute is on the row element itself.
  const productRow = page.locator(`[data-testid="admin-product-row"][data-product-slug="${PRODUCT_SLUG}"]`)
  await expect(productRow).toBeVisible({ timeout: 10_000 })

  // Open the actions kebab menu.
  await productRow.getByRole('button').filter({ has: page.locator('svg') }).last().click()

  // Click "Editar" — the attribute is on the menu item itself.
  const editItem = page.locator(`[data-testid="admin-product-edit-button"][data-product-slug="${PRODUCT_SLUG}"]`)
  await expect(editItem).toBeVisible()
  await editItem.click()

  // Wait for the form dialog to appear.
  await expect(page.getByTestId('admin-product-form-dialog')).toBeVisible({ timeout: 15_000 })
}

test.describe('Admin product 3D model upload', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept mutations + R2 PUT before any navigation.
    await mockProductModelUploadFlow(page, { fileName: 'minimal-valid.glb' })
  })

  test('upload GLB → success state shown', async ({ page }) => {
    await openDemoProductForm(page)

    // The uploader must be in idle state (product already exists → no "save first" banner).
    const uploader = page.getByTestId('admin-product-model-uploader')
    await expect(uploader).toBeVisible({ timeout: 10_000 })
    await expect(uploader).toHaveAttribute('data-state', 'idle')

    // Upload the fixture GLB via the hidden file input.
    const fileInput = page.getByTestId('admin-product-model-file-input')
    await fileInput.setInputFiles(GLB_FIXTURE)

    // Wait for success state (validation + optimization + mocked upload are fast).
    await expect(page.getByTestId('admin-product-model-success')).toBeVisible({
      timeout: 30_000,
    })

    // Filename is displayed.
    await expect(page.getByTestId('admin-product-model-filename')).toContainText('minimal-valid.glb')

    // R2 URL is linked.
    const urlLink = page.getByTestId('admin-product-model-url')
    await expect(urlLink).toHaveAttribute('href', MOCK_PUBLIC_URL)

    // Delete button is present.
    await expect(page.getByTestId('admin-product-model-delete')).toBeVisible()
  })

  test('invalid file (not .glb) shows validation error', async ({ page }) => {
    await openDemoProductForm(page)

    await expect(page.getByTestId('admin-product-model-uploader')).toBeVisible({ timeout: 10_000 })

    // Upload a non-GLB buffer — should trigger client-side validation error immediately.
    const fileInput = page.getByTestId('admin-product-model-file-input')
    await fileInput.setInputFiles({
      name: 'malicious.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not a glb file'),
    })

    await expect(page.getByTestId('admin-product-model-error')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('admin-product-model-error-message')).toContainText(/\.glb/i)
  })
})

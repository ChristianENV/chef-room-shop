import { expect, test, type Page } from '@playwright/test'

const CUSTOMIZER_SLUG =
  process.env.E2E_CUSTOMIZER_SLUG ?? 'demo-filipina-executive-blanca'
const USE_PREVIEW_MOCK = process.env.E2E_MOCK_CUSTOMIZER_PREVIEWS === 'true'

async function mockCustomizerPreviewFlow(page: Page) {
  await page.route('**/__e2e__/uploads/**', async (route) => {
    if (route.request().method() === 'PUT') {
      await route.fulfill({ status: 200, body: '' })
      return
    }
    await route.continue()
  })

  await page.route('**/api/graphql', async (route) => {
    const request = route.request()
    const payload = request.postDataJSON() as { query?: string; variables?: unknown }
    const query = payload.query ?? ''

    if (query.includes('mutation CreateDesignPreviewUpload')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            createDesignPreviewUpload: {
              uploadId: 'e2e-preview-upload',
              expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
              keys: {
                front: { webp: 'e2e/front.webp', jpg: 'e2e/front.jpg' },
                back: { webp: 'e2e/back.webp', jpg: 'e2e/back.jpg' },
              },
              publicUrls: {
                front: { webp: 'https://cdn.example/e2e/front.webp', jpg: 'https://cdn.example/e2e/front.jpg' },
                back: { webp: 'https://cdn.example/e2e/back.webp', jpg: 'https://cdn.example/e2e/back.jpg' },
              },
              presignedUrls: {
                front: {
                  webp: 'http://localhost:3100/__e2e__/uploads/front.webp',
                  jpg: 'http://localhost:3100/__e2e__/uploads/front.jpg',
                },
                back: {
                  webp: 'http://localhost:3100/__e2e__/uploads/back.webp',
                  jpg: 'http://localhost:3100/__e2e__/uploads/back.jpg',
                },
              },
            },
          },
        }),
      })
      return
    }

    if (query.includes('mutation ConfirmDesignPreviewUpload')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            confirmDesignPreviewUpload: {
              id: 'e2e-design',
              previewUrl: 'https://cdn.example/e2e/front.webp',
              previewPublicId: 'e2e/front.webp',
              configJson: {
                previews: {
                  front: {
                    url: 'https://cdn.example/e2e/front.webp',
                    publicId: 'e2e/front.webp',
                  },
                  back: {
                    url: 'https://cdn.example/e2e/back.webp',
                    publicId: 'e2e/back.webp',
                  },
                },
              },
              status: 'SAVED',
              updatedAt: new Date().toISOString(),
            },
          },
        }),
      })
      return
    }

    await route.continue()
  })
}

test('customize -> add to cart smoke', async ({ page }) => {
  if (USE_PREVIEW_MOCK) {
    await mockCustomizerPreviewFlow(page)
  }

  await page.goto(`/customize/${CUSTOMIZER_SLUG}`)
  await expect(page.getByTestId('customizer-root')).toBeVisible()

  await page.getByRole('button', { name: /colores/i }).first().click()
  const baseColors = page.getByTestId('customizer-base-colors')
  await expect(baseColors).toBeVisible()

  const colorOptions = page.getByTestId('customizer-color-option')
  const colorCount = await colorOptions.count()
  if (colorCount > 1) {
    await colorOptions.nth(1).click()
  } else if (colorCount === 1) {
    await colorOptions.first().click()
  }

  await page.getByRole('button', { name: /extras/i }).first().click()
  const sizeContainer = page.getByTestId('customizer-size-options')
  await expect(sizeContainer).toBeVisible()
  const sizeOptions = page.getByTestId('customizer-size-option')
  const sizeCount = await sizeOptions.count()
  expect(sizeCount).toBeGreaterThan(0)
  await sizeOptions.first().click()

  await page.getByRole('button', { name: /texto/i }).first().click()
  const addTextButton = page.getByTestId('customizer-add-text-button').first()
  await expect(addTextButton).toBeVisible()
  await addTextButton.click()

  const textInput = page.getByTestId('customizer-text-input')
  await expect(textInput).toBeVisible()
  await textInput.fill('Chef Carlos')
  await expect(textInput).toHaveValue('Chef Carlos')
  await expect(page.getByText('Chef Carlos').first()).toBeVisible()

  await page.getByTestId('customizer-add-to-cart-button').click()
  await expect(page.getByText(/tu dise[ñn]o se agreg[oó] al carrito/i)).toBeVisible()

  await page.getByRole('link', { name: /ver carrito/i }).click()
  await expect(page).toHaveURL(/\/cart/)

  const cartItems = page.getByTestId('cart-item-card')
  await expect(cartItems.first()).toBeVisible()
  await expect(page.getByTestId('cart-custom-design-badge').first()).toBeVisible()
  await expect(page.getByTestId('cart-customization-summary').first()).toContainText('Chef Carlos')

  if (!USE_PREVIEW_MOCK) {
    await expect(cartItems.first().locator('img').first()).toBeVisible()
  }
})

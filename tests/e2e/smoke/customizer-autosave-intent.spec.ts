import { expect, test } from '@playwright/test'
import { ensureCustomizer3DReady } from '../helpers/ensure-customizer-3d-ready'
import {
  mockCustomizerPreviewFlow,
  shouldMockCustomizerPreviews,
} from '../helpers/mock-customizer-previews'
import {
  selectCustomizerColorAndSize,
  selectCustomizerFabricColor,
} from '../helpers/select-customizer-variant'

const CUSTOMIZER_SLUG = process.env.E2E_CUSTOMIZER_SLUG ?? 'demo-filipina-clasica'
const USE_PREVIEW_MOCK = shouldMockCustomizerPreviews()
const DRAFT_KEY = 'chefroom.customizer.draft'

test.describe('customizer autosave intent', () => {
  test('opening and closing without edits does not create a design', async ({ page }) => {
    let createDraftCalls = 0

    await page.route('**/api/graphql', async (route) => {
      const request = route.request()
      if (request.method() !== 'POST') {
        await route.continue()
        return
      }

      const payload = request.postDataJSON() as { query?: string }
      if (payload.query?.includes('createDesignDraft')) {
        createDraftCalls += 1
      }

      await route.continue()
    })

    await page.goto(`/customize/${CUSTOMIZER_SLUG}`)
    await expect(page.getByTestId('customizer-root')).toBeVisible()
    await expect(page.getByText('Listo para diseñar')).toBeVisible()

    await page.getByRole('link', { name: /volver a tienda/i }).click()
    await expect(page).toHaveURL(/\/shop/)

    expect(createDraftCalls).toBe(0)
  })

  test('guest meaningful edit saves draft to localStorage', async ({ page }) => {
    await page.addInitScript((key) => {
      window.localStorage.removeItem(key)
    }, DRAFT_KEY)

    await page.goto(`/customize/${CUSTOMIZER_SLUG}`)
    await expect(page.getByTestId('customizer-root')).toBeVisible()

    await selectCustomizerFabricColor(page, 'chef-room-blue')

    await expect
      .poll(
        async () => {
          return page.evaluate((storageKey) => window.localStorage.getItem(storageKey), DRAFT_KEY)
        },
        { timeout: 10_000 },
      )
      .not.toBeNull()

    await expect(page.getByText('Guardado localmente')).toBeVisible({ timeout: 10_000 })
  })

  test('add to cart creates a design when needed', async ({ page }) => {
    if (USE_PREVIEW_MOCK) {
      await mockCustomizerPreviewFlow(page)
    }

    let createDraftCalls = 0

    await page.route('**/api/graphql', async (route) => {
      const request = route.request()
      if (request.method() !== 'POST') {
        await route.continue()
        return
      }

      const payload = request.postDataJSON() as { query?: string }
      if (payload.query?.includes('createDesignDraft')) {
        createDraftCalls += 1
      }

      await route.continue()
    })

    await page.goto(`/customize/${CUSTOMIZER_SLUG}`)
    await expect(page.getByTestId('customizer-root')).toBeVisible()

    await selectCustomizerColorAndSize(page, {
      colorId: 'chef-room-blue',
      sizeLabel: 'L',
    })

    await ensureCustomizer3DReady(page)
    await page.getByTestId('customizer-add-to-cart-button').click()

    await expect.poll(() => createDraftCalls, { timeout: 60_000 }).toBeGreaterThan(0)
  })
})

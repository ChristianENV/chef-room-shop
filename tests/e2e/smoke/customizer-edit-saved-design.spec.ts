import { expect, test } from '@playwright/test'
import { ensureCustomizer3DReady } from '../helpers/ensure-customizer-3d-ready'
import {
  mockCustomizerPreviewFlow,
  shouldMockCustomizerPreviews,
} from '../helpers/mock-customizer-previews'
import { selectCustomizerColorAndSize } from '../helpers/select-customizer-variant'

const CUSTOMIZER_SLUG =
  process.env.E2E_CUSTOMIZER_SLUG ?? 'demo-filipina-clasica'
const USE_PREVIEW_MOCK = shouldMockCustomizerPreviews()

test('edit saved design hydrates size, color and text', async ({ page }) => {
  if (USE_PREVIEW_MOCK) {
    await mockCustomizerPreviewFlow(page)
  }

  let savedDesignId: string | null = null

  await page.route('**/api/graphql', async (route) => {
    const request = route.request()
    if (request.method() !== 'POST') {
      await route.continue()
      return
    }

    const payload = request.postDataJSON() as { query?: string }
    const query = payload.query ?? ''

    if (query.includes('createDesignDraft') || query.includes('updateDesign')) {
      const response = await route.fetch()
      const body = (await response.json()) as {
        data?: {
          createDesignDraft?: { id: string }
          updateDesign?: { id: string }
        }
      }

      savedDesignId =
        body.data?.createDesignDraft?.id ?? body.data?.updateDesign?.id ?? savedDesignId

      await route.fulfill({ response })
      return
    }

    await route.continue()
  })

  await page.goto(`/customize/${CUSTOMIZER_SLUG}`)
  await expect(page.getByTestId('customizer-root')).toBeVisible()

  await selectCustomizerColorAndSize(page, {
    colorId: 'chef-room-blue',
    sizeLabel: 'L',
  })

  await page.getByRole('button', { name: /texto/i }).first().click()
  await page.getByTestId('customizer-add-text-button').first().click()
  await page.getByTestId('customizer-text-input').fill('Chef Editado')
  await page.getByTestId('customizer-text-done-button').click()

  await ensureCustomizer3DReady(page)
  await page.getByRole('button', { name: /guardar diseño/i }).click()
  await expect.poll(() => savedDesignId, { timeout: 60_000 }).not.toBeNull()

  const designId = savedDesignId!
  await page.goto(`/customize/${CUSTOMIZER_SLUG}?designId=${designId}`)

  await expect(page.getByTestId('customizer-editing-saved-design-banner')).toBeVisible()
  await page.getByRole('button', { name: /extras/i }).first().click()
  await expect(page.getByTestId('customizer-size-option-l')).toHaveClass(/border-primary/)
  await expect(page.getByText('Chef Editado').first()).toBeVisible()

  const inlineTextInput = page.getByTestId('customizer-text-input-inline')
  await expect(inlineTextInput).toHaveValue('Chef Editado')
  await inlineTextInput.fill('Chef Actualizado')
  await page.getByRole('button', { name: /guardar diseño/i }).click()

  await page.goto(`/customize/${CUSTOMIZER_SLUG}?designId=${designId}`)
  await expect(page.getByText('Chef Actualizado').first()).toBeVisible()
})

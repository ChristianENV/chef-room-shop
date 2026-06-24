import type { Page } from '@playwright/test'

export function shouldMockCustomizerPreviews(): boolean {
  return process.env.E2E_MOCK_CUSTOMIZER_PREVIEWS !== 'false'
}

function getE2eUploadBase(): string {
  return (
    process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${process.env.PLAYWRIGHT_PORT ?? 3100}`
  )
}

export async function mockCustomizerPreviewFlow(page: Page): Promise<void> {
  const uploadBase = getE2eUploadBase()

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
                front: {
                  webp: 'https://cdn.example/e2e/front.webp',
                  jpg: 'https://cdn.example/e2e/front.jpg',
                },
                back: {
                  webp: 'https://cdn.example/e2e/back.webp',
                  jpg: 'https://cdn.example/e2e/back.jpg',
                },
              },
              presignedUrls: {
                front: {
                  webp: `${uploadBase}/__e2e__/uploads/front.webp`,
                  jpg: `${uploadBase}/__e2e__/uploads/front.jpg`,
                },
                back: {
                  webp: `${uploadBase}/__e2e__/uploads/back.webp`,
                  jpg: `${uploadBase}/__e2e__/uploads/back.jpg`,
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

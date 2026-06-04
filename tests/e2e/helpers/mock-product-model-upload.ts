import type { Page, Route } from '@playwright/test'

export const MOCK_MODEL_ASSET_ID = 'mock-model-asset-id-e2e'
export const MOCK_PRESIGNED_URL = 'https://mock-r2.example.com/upload/mock-model.glb'
export const MOCK_PUBLIC_URL = 'https://mock-r2.example.com/products/demo/models/mock-model.glb'

type MockPayloadOptions = {
  productId?: string
  fileName?: string
}

/**
 * Intercepts the three GraphQL mutations + R2 PUT involved in a product
 * model 3D upload flow, returning deterministic mock responses.
 *
 * - createAdminProductModelUpload → presigned URL mock
 * - PUT to the presigned URL → 200 OK
 * - confirmAdminProductModelUpload → model asset mock
 */
export async function mockProductModelUploadFlow(
  page: Page,
  opts: MockPayloadOptions = {},
): Promise<void> {
  const productId = opts.productId ?? 'mock-product-id'
  const fileName = opts.fileName ?? 'minimal-valid.glb'

  await page.route('**/api/graphql', async (route: Route) => {
    const request = route.request()
    const rawBody = request.postData() ?? ''

    // Only intercept our specific mutations; everything else passes through untouched.
    if (rawBody.includes('createAdminProductModelUpload')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            createAdminProductModelUpload: {
              uploadId: MOCK_MODEL_ASSET_ID,
              modelAssetId: MOCK_MODEL_ASSET_ID,
              publicId: `products/${productId}/models/${MOCK_MODEL_ASSET_ID}/model.glb`,
              publicUrl: MOCK_PUBLIC_URL,
              presignedUrl: MOCK_PRESIGNED_URL,
              expiresAt: new Date(Date.now() + 600_000).toISOString(),
            },
          },
        }),
      })
      return
    }

    if (rawBody.includes('confirmAdminProductModelUpload')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            confirmAdminProductModelUpload: {
              id: MOCK_MODEL_ASSET_ID,
              productId,
              url: MOCK_PUBLIC_URL,
              publicId: `products/${productId}/models/${MOCK_MODEL_ASSET_ID}/model.glb`,
              fileName,
              originalFileName: fileName,
              format: 'glb',
              contentType: 'model/gltf-binary',
              sizeBytes: 48,
              originalSizeBytes: 48,
              compressionRatio: 1.0,
              isActive: true,
              status: 'ACTIVE',
              materialHintsJson: null,
              meshHintsJson: null,
              anchorsJson: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        }),
      })
      return
    }

    // All other GraphQL operations continue normally (products list, auth, etc.)
    await route.continue()
  })

  // Intercept the presigned PUT to R2 (any URL that looks like the mock presigned URL).
  await page.route('**mock-r2.example.com**', async (route: Route) => {
    if (route.request().method() === 'PUT') {
      await route.fulfill({ status: 200, body: '' })
      return
    }
    await route.continue()
  })
}

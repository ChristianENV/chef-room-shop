import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { GraphQLError } from 'graphql'

import { mapSeoImagePickerOptions } from '@/src/features/admin/products/mappers/admin-products-seo-image.mapper'
import {
  mapAdminProductToFormValues,
  mapFormValuesToAdminProductInput,
} from '@/src/features/admin/products/mappers/admin-products-ui.mapper'
import { buildProductPageMetadata } from '@/src/features/storefront/products/lib/product-page-metadata'
import { resolveProductOgImageUrl } from '@/src/lib/product-seo-image'
import { adminProductInputSchema } from '@/src/server/graphql/modules/admin-products/admin-products.validation'
import { assertSeoImageBelongsToProduct } from '@/src/server/graphql/modules/admin-products/admin-products.seo-image'

const productId = '11111111-1111-4111-8111-111111111111'
const otherProductId = '22222222-2222-4222-8222-222222222222'
const imageA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const imageB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const imageOther = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'

const sampleImages = [
  {
    id: imageA,
    url: 'https://cdn.example/primary.webp',
    isPrimary: true,
    sortOrder: 0,
  },
  {
    id: imageB,
    url: 'https://cdn.example/secondary.webp',
    isPrimary: false,
    sortOrder: 1,
  },
]

describe('resolveProductOgImageUrl', () => {
  it('uses seo image when seoImageId matches a product photo', () => {
    const url = resolveProductOgImageUrl(sampleImages, imageB)
    assert.equal(url, 'https://cdn.example/secondary.webp')
  })

  it('falls back to primary image when seoImageId is null', () => {
    const url = resolveProductOgImageUrl(sampleImages, null)
    assert.equal(url, 'https://cdn.example/primary.webp')
  })

  it('falls back to first sorted image when no primary exists', () => {
    const url = resolveProductOgImageUrl(
      [
        { id: imageB, url: 'https://cdn.example/first.webp', isPrimary: false, sortOrder: 0 },
        { id: imageA, url: 'https://cdn.example/second.webp', isPrimary: false, sortOrder: 1 },
      ],
      null,
    )
    assert.equal(url, 'https://cdn.example/first.webp')
  })

  it('returns null when no images exist', () => {
    assert.equal(resolveProductOgImageUrl([], null), null)
  })
})

describe('buildProductPageMetadata', () => {
  it('sets Open Graph image from seo image first', () => {
    const metadata = buildProductPageMetadata({
      slug: 'filipina-clasica',
      name: 'Filipina Clásica',
      seoImageId: imageB,
      images: sampleImages,
    })

    const ogImages = metadata.openGraph?.images
    assert.ok(Array.isArray(ogImages))
    assert.equal(ogImages[0]?.url, 'https://cdn.example/secondary.webp')
    assert.equal(metadata.twitter?.images?.[0], 'https://cdn.example/secondary.webp')
  })

  it('falls back to primary image for Open Graph when seoImageId is null', () => {
    const metadata = buildProductPageMetadata({
      slug: 'filipina-clasica',
      name: 'Filipina Clásica',
      seoImageId: null,
      images: sampleImages,
    })

    const ogImages = metadata.openGraph?.images
    assert.ok(Array.isArray(ogImages))
    assert.equal(ogImages[0]?.url, 'https://cdn.example/primary.webp')
  })
})

describe('assertSeoImageBelongsToProduct', () => {
  it('accepts seoImageId from the same product', async () => {
    const prisma = {
      productImage: {
        findFirst: async (args: { where: { id: string; productId: string } }) =>
          args.where.productId === productId && args.where.id === imageA ? { id: imageA } : null,
      },
    }

    await assertSeoImageBelongsToProduct(prisma, productId, imageA)
  })

  it('rejects seoImageId from another product', async () => {
    const prisma = {
      productImage: {
        findFirst: async (args: { where: { id: string; productId: string } }) =>
          args.where.id === imageOther && args.where.productId === otherProductId
            ? { id: imageOther }
            : null,
      },
    }

    await assert.rejects(
      () => assertSeoImageBelongsToProduct(prisma, productId, imageOther),
      (error: unknown) => {
        assert.ok(error instanceof GraphQLError)
        assert.match(error.message, /foto existente de este producto/)
        return true
      },
    )
  })
})

describe('admin product seoImageId input', () => {
  it('allows clearing seoImageId with null', () => {
    const parsed = adminProductInputSchema.parse({
      name: 'Filipina',
      productTypeId: productId,
      basePriceCents: 10000,
      seoImageId: null,
    })

    assert.equal(parsed.seoImageId, null)
  })

  it('maps form values with seoImageId to admin input', () => {
    const input = mapFormValuesToAdminProductInput({
      name: 'Filipina',
      slug: 'filipina',
      shortDescription: '',
      description: '',
      productTypeId: productId,
      basePricePesos: 100,
      customizable: true,
      status: 'DRAFT',
      seoTitle: '',
      seoDescription: '',
      seoImageId: imageA,
      variants: [],
      images: [],
    })

    assert.equal(input.seoImageId, imageA)
  })

  it('round-trips seoImageId in admin form mapper', () => {
    const values = mapAdminProductToFormValues(
      {
        id: productId,
        slug: 'filipina',
        name: 'Filipina',
        shortDescription: null,
        description: null,
        basePriceCents: 10000,
        currency: 'MXN',
        customizable: true,
        status: 'DRAFT',
        seoTitle: null,
        seoDescription: null,
        seoImageId: imageB,
        deletedAt: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
        productType: {
          id: 'type-1',
          slug: 'chef-jacket',
          name: 'Filipinas',
          nameEs: 'Filipinas',
          description: null,
          sortOrder: 1,
          isActive: true,
        },
        images: [
          {
            id: imageA,
            url: 'https://cdn.example/a.webp',
            publicId: null,
            alt: null,
            sortOrder: 0,
            isPrimary: true,
          },
          {
            id: imageB,
            url: 'https://cdn.example/b.webp',
            publicId: null,
            alt: null,
            sortOrder: 1,
            isPrimary: false,
          },
        ],
        variants: [],
        model3d: null,
      },
      undefined,
    )

    assert.equal(values.seoImageId, imageB)
  })
})

describe('mapSeoImagePickerOptions', () => {
  it('marks the selected seo image in picker options', () => {
    const options = mapSeoImagePickerOptions(
      [
        {
          id: imageA,
          url: 'https://cdn.example/a.webp',
          publicId: null,
          alt: 'A',
          sortOrder: 0,
          isPrimary: true,
          isPersisted: true,
        },
        {
          id: imageB,
          url: 'https://cdn.example/b.webp',
          publicId: null,
          alt: 'B',
          sortOrder: 1,
          isPrimary: false,
          isPersisted: true,
        },
      ],
      imageB,
    )

    assert.equal(options.find((option) => option.id === imageB)?.isSelected, true)
    assert.equal(options.find((option) => option.id === imageA)?.isSelected, false)
  })
})

import { randomUUID } from 'node:crypto'

import { type Prisma } from '@prisma/client'
import { GraphQLError } from 'graphql'

import {
  MAX_PRODUCT_IMAGES,
  PRESIGNED_PUT_TTL_SECONDS,
  buildAvatarObjectKeys,
  buildProductImageObjectKeys,
  buildProductTypeCardImageObjectKeys,
  buildPublicR2Url,
  buildPublicUrlsForKeys,
  createPresignedPutUrlsForKeys,
  deriveSiblingImageKeysFromWebpPublicId,
  r2DeleteObject,
  r2HeadObject,
  requireR2Config,
  validateUploadContentType,
  validateUploadSize,
} from '@/src/server/storage/r2'

import type { GraphQLContext } from '../../context'
import { mapAdminProductTypeToGql } from '../admin-product-types/admin-product-types.mappers'
import { mapUserToAccountUser } from '../account/account.mappers'
import {
  requireAvatarUploadActor,
  requireProductImageUploadActor,
  requireProductTypeCardImageUploadActor,
} from './uploads.auth'
import {
  mapKeysToGql,
  mapPresignedUrlsToGql,
  mapProductImageToGql,
  mapPublicUrlsToGql,
  toUploadGraphQLError,
} from './uploads.mappers'
import {
  decodeAvatarUploadToken,
  decodeProductUploadToken,
  decodeProductTypeCardUploadToken,
  encodeAvatarUploadToken,
  encodeProductUploadToken,
  encodeProductTypeCardUploadToken,
} from './uploads.token'
import type {
  AvatarUploadPayloadGql,
  ConfirmAvatarUploadInput,
  ConfirmProductImageUploadInput,
  ConfirmProductTypeCardImageUploadInput,
  ConfirmProductTypeCardImageUploadPayloadGql,
  CreateAvatarUploadInput,
  CreateProductImageUploadInput,
  CreateProductTypeCardImageUploadInput,
  ProductImageGql,
  ProductImageUploadPayloadGql,
  ProductTypeCardImageUploadPayloadGql,
  UserAvatarPayloadGql,
} from './uploads.types'
import {
  confirmAvatarUploadSchema,
  confirmProductImageUploadSchema,
  confirmProductTypeCardImageUploadSchema,
  createAvatarUploadSchema,
  createProductImageUploadSchema,
  createProductTypeCardImageUploadSchema,
} from './uploads.validation'

const userWithRolesInclude = {
  roles: { include: { role: true } },
} satisfies Prisma.UserInclude

function expiresAtIso(ttlSeconds = PRESIGNED_PUT_TTL_SECONDS): string {
  return new Date(Date.now() + ttlSeconds * 1000).toISOString()
}

function notFound(entity: string): GraphQLError {
  return new GraphQLError(`${entity} no encontrado.`, {
    extensions: { code: 'NOT_FOUND' },
  })
}

function objectNotUploaded(): GraphQLError {
  return new GraphQLError(
    'No encontramos el archivo subido. Vuelve a intentar la subida antes de confirmar.',
    { extensions: { code: 'BAD_USER_INPUT', reason: 'R2_OBJECT_NOT_FOUND' } },
  )
}

/**
 * Issues presigned PUT URLs to upload the authenticated user's avatar.
 * Keys are deterministic per user; the upload overwrites any previous avatar.
 */
export async function createAvatarUpload(
  context: GraphQLContext,
  input: CreateAvatarUploadInput,
): Promise<AvatarUploadPayloadGql> {
  const userId = requireAvatarUploadActor(context)
  const parsed = createAvatarUploadSchema.parse(input)

  try {
    requireR2Config()
    if (parsed.originalContentType) {
      validateUploadContentType(parsed.originalContentType)
    }
    validateUploadSize(parsed.webpSizeBytes, 'avatar')
    if (parsed.jpgSizeBytes != null) {
      validateUploadSize(parsed.jpgSizeBytes, 'avatar')
    }

    const keys = buildAvatarObjectKeys(userId)
    const presigned = await createPresignedPutUrlsForKeys(keys)
    const publicUrls = buildPublicUrlsForKeys(keys)

    return {
      uploadId: encodeAvatarUploadToken(userId),
      keys: mapKeysToGql(keys),
      publicUrls: mapPublicUrlsToGql(publicUrls),
      presignedUrls: mapPresignedUrlsToGql(presigned),
      expiresAt: expiresAtIso(),
    }
  } catch (error) {
    toUploadGraphQLError(error)
  }
}

/**
 * Confirms the avatar upload: verifies the object exists in R2, then stores its
 * public WebP URL on `User.image`. A version query param busts CDN/browser cache
 * since the object key itself is stable.
 */
export async function confirmAvatarUpload(
  context: GraphQLContext,
  input: ConfirmAvatarUploadInput,
): Promise<UserAvatarPayloadGql> {
  const userId = requireAvatarUploadActor(context)
  const parsed = confirmAvatarUploadSchema.parse(input)

  const token = decodeAvatarUploadToken(parsed.uploadId)
  if (token.userId !== userId) {
    throw new GraphQLError('No puedes confirmar la subida de otro usuario.', {
      extensions: { code: 'FORBIDDEN' },
    })
  }

  try {
    requireR2Config()
    const keys = buildAvatarObjectKeys(userId)

    const exists = await r2HeadObject(keys.webp)
    if (!exists) {
      throw objectNotUploaded()
    }

    const imageUrl = `${buildPublicR2Url(keys.webp)}?v=${Date.now()}`

    const user = await context.prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
      include: userWithRolesInclude,
    })

    return {
      user: mapUserToAccountUser(user),
      image: user.image,
    }
  } catch (error) {
    toUploadGraphQLError(error)
  }
}

/**
 * Issues presigned PUT URLs (webp + jpg + thumb) for a product image.
 * `imageId` is server-generated when omitted and is reused as the eventual
 * `ProductImage.id` so the object key path matches the DB row.
 */
export async function createProductImageUpload(
  context: GraphQLContext,
  input: CreateProductImageUploadInput,
): Promise<ProductImageUploadPayloadGql> {
  requireProductImageUploadActor(context)
  const parsed = createProductImageUploadSchema.parse(input)

  const product = await context.prisma.product.findFirst({
    where: { id: parsed.productId, deletedAt: null },
    select: { id: true },
  })
  if (!product) {
    throw notFound('Producto')
  }

  const isNewImage = !parsed.imageId
  if (isNewImage) {
    const imageCount = await context.prisma.productImage.count({
      where: { productId: parsed.productId },
    })
    if (imageCount >= MAX_PRODUCT_IMAGES) {
      throw new GraphQLError(
        `Un producto puede tener un máximo de ${MAX_PRODUCT_IMAGES} imágenes.`,
        { extensions: { code: 'BAD_USER_INPUT' } },
      )
    }
  }

  try {
    requireR2Config()
    validateUploadSize(parsed.webpSizeBytes, 'product')
    if (parsed.jpgSizeBytes != null) {
      validateUploadSize(parsed.jpgSizeBytes, 'product')
    }
    if (parsed.thumbSizeBytes != null) {
      validateUploadSize(parsed.thumbSizeBytes, 'product')
    }

    const imageId = parsed.imageId ?? randomUUID()
    const keys = buildProductImageObjectKeys(parsed.productId, imageId)
    const presigned = await createPresignedPutUrlsForKeys(keys)
    const publicUrls = buildPublicUrlsForKeys(keys)

    return {
      uploadId: encodeProductUploadToken(parsed.productId, imageId),
      imageId,
      keys: mapKeysToGql(keys),
      publicUrls: mapPublicUrlsToGql(publicUrls),
      presignedUrls: mapPresignedUrlsToGql(presigned),
      expiresAt: expiresAtIso(),
    }
  } catch (error) {
    toUploadGraphQLError(error)
  }
}

/**
 * Confirms a product image upload: verifies the WebP object exists, then
 * creates (or replaces) the `ProductImage` row using the public WebP URL.
 * The R2 object key is stored in `publicId` for future delete/replace.
 */
export async function confirmProductImageUpload(
  context: GraphQLContext,
  input: ConfirmProductImageUploadInput,
): Promise<ProductImageGql> {
  requireProductImageUploadActor(context)
  const parsed = confirmProductImageUploadSchema.parse(input)

  const token = decodeProductUploadToken(parsed.uploadId)

  const product = await context.prisma.product.findFirst({
    where: { id: token.productId, deletedAt: null },
    select: { id: true },
  })
  if (!product) {
    throw notFound('Producto')
  }

  try {
    requireR2Config()
    const keys = buildProductImageObjectKeys(token.productId, token.imageId)

    const exists = await r2HeadObject(keys.webp)
    if (!exists) {
      throw objectNotUploaded()
    }

    const imageUrl = buildPublicR2Url(keys.webp)

    const image = await context.prisma.$transaction(async (tx) => {
      const existing = await tx.productImage.findUnique({
        where: { id: token.imageId },
      })

      const hasPrimary = await tx.productImage.findFirst({
        where: { productId: token.productId, isPrimary: true },
        select: { id: true },
      })

      const shouldBePrimary = parsed.isPrimary ?? (existing?.isPrimary || !hasPrimary)

      if (shouldBePrimary) {
        await tx.productImage.updateMany({
          where: { productId: token.productId },
          data: { isPrimary: false },
        })
      }

      const data = {
        url: imageUrl,
        publicId: keys.webp,
        alt: parsed.altText ?? existing?.alt ?? null,
        sortOrder: parsed.sortOrder ?? existing?.sortOrder ?? 0,
        isPrimary: shouldBePrimary,
      }

      if (existing) {
        return tx.productImage.update({ where: { id: existing.id }, data })
      }

      return tx.productImage.create({
        data: {
          id: token.imageId,
          productId: token.productId,
          ...data,
        },
      })
    })

    return mapProductImageToGql(image)
  } catch (error) {
    toUploadGraphQLError(error)
  }
}

async function bestEffortDeleteR2Keys(keys: {
  webp: string
  jpg: string
  thumb?: string
}): Promise<void> {
  const targets = [keys.webp, keys.jpg, keys.thumb].filter((key): key is string => Boolean(key))
  await Promise.all(
    targets.map(async (key) => {
      try {
        await r2DeleteObject(key)
      } catch (err) {
        console.warn(`[r2] Could not delete object ${key}:`, err)
      }
    }),
  )
}

/**
 * Issues presigned PUT URLs for a product type (category) landing card image.
 */
export async function createAdminProductTypeImageUpload(
  context: GraphQLContext,
  input: CreateProductTypeCardImageUploadInput,
): Promise<ProductTypeCardImageUploadPayloadGql> {
  requireProductTypeCardImageUploadActor(context)
  const parsed = createProductTypeCardImageUploadSchema.parse(input)

  const productType = await context.prisma.productType.findUnique({
    where: { id: parsed.productTypeId },
    select: { id: true },
  })
  if (!productType) {
    throw notFound('Categoría')
  }

  try {
    requireR2Config()
    if (parsed.originalContentType) {
      validateUploadContentType(parsed.originalContentType)
    }
    validateUploadSize(parsed.webpSizeBytes, 'productType')
    if (parsed.jpgSizeBytes != null) {
      validateUploadSize(parsed.jpgSizeBytes, 'productType')
    }
    if (parsed.thumbSizeBytes != null) {
      validateUploadSize(parsed.thumbSizeBytes, 'productType')
    }

    const imageId = parsed.imageId ?? randomUUID()
    const keys = buildProductTypeCardImageObjectKeys(parsed.productTypeId, imageId)
    const presigned = await createPresignedPutUrlsForKeys(keys)
    const publicUrls = buildPublicUrlsForKeys(keys)

    return {
      uploadId: encodeProductTypeCardUploadToken(parsed.productTypeId, imageId),
      imageId,
      keys: mapKeysToGql(keys),
      publicUrls: mapPublicUrlsToGql(publicUrls),
      presignedUrls: mapPresignedUrlsToGql(presigned),
      expiresAt: expiresAtIso(),
    }
  } catch (error) {
    toUploadGraphQLError(error)
  }
}

/**
 * Confirms a product type card image upload and stores URLs on `ProductType`.
 */
export async function confirmAdminProductTypeImageUpload(
  context: GraphQLContext,
  input: ConfirmProductTypeCardImageUploadInput,
): Promise<ConfirmProductTypeCardImageUploadPayloadGql> {
  requireProductTypeCardImageUploadActor(context)
  const parsed = confirmProductTypeCardImageUploadSchema.parse(input)

  const token = decodeProductTypeCardUploadToken(parsed.uploadId)

  const existing = await context.prisma.productType.findUnique({
    where: { id: token.productTypeId },
  })
  if (!existing) {
    throw notFound('Categoría')
  }

  try {
    requireR2Config()
    const keys = buildProductTypeCardImageObjectKeys(token.productTypeId, token.imageId)

    const exists = await r2HeadObject(keys.webp)
    if (!exists) {
      throw objectNotUploaded()
    }

    const imageUrl = buildPublicR2Url(keys.webp)
    const thumbUrl = keys.thumb ? buildPublicR2Url(keys.thumb) : null

    const productType = await context.prisma.productType.update({
      where: { id: token.productTypeId },
      data: {
        cardImageUrl: imageUrl,
        cardImagePublicId: keys.webp,
        cardImageThumbUrl: thumbUrl,
        cardImageAlt: parsed.altText ?? existing.cardImageAlt ?? null,
      },
    })

    if (existing.cardImagePublicId && existing.cardImagePublicId !== keys.webp) {
      const previousKeys = deriveSiblingImageKeysFromWebpPublicId(existing.cardImagePublicId)
      void bestEffortDeleteR2Keys(previousKeys)
    }

    return {
      productType: mapAdminProductTypeToGql(productType),
    }
  } catch (error) {
    toUploadGraphQLError(error)
  }
}

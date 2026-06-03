import { randomUUID } from 'node:crypto'
import {
  DesignAssetType,
  DesignEventType,
  DesignStatus,
  ProductStatus,
  type Design,
  type Prisma,
} from '@prisma/client'
import { GraphQLError } from 'graphql'

import { getOrCreateGuestSession } from '@/src/server/guest/guest-session'
import {
  buildDesignAssetLogoKeys,
  buildDesignPreviewUploadKeys,
  buildPublicR2Url,
  buildPublicUrlsForKeys,
  createPresignedPutUrlsForKeys,
  PRESIGNED_PUT_TTL_SECONDS,
  requireR2Config,
  r2HeadObject,
  validateUploadSize,
} from '@/src/server/storage/r2'

import type { GraphQLContext } from '../../context'
import { mapDesignToGql, mapProductForDesign } from '../account/account.mappers'
import type { AccountDesignGql } from '../account/account.types'
import {
  decodeDesignAssetUploadToken,
  decodeDesignPreviewUploadToken,
  encodeDesignAssetUploadToken,
  encodeDesignPreviewUploadToken,
} from './designs.preview-token'
import type {
  ConfirmDesignAssetUploadInput,
  ConfirmDesignPreviewUploadInput,
  CreateDesignAssetUploadInput,
  CreateDesignPreviewUploadInput,
  CreateDesignDraftInput,
  DeleteDesignDraftInput,
  DesignAssetGql,
  DesignAssetUploadPayloadGql,
  DesignPreviewUploadPayloadGql,
  DesignPreviewViewUrlsGql,
  SaveDesignPreviewInput,
  UpdateDesignInput,
} from './designs.types'
import {
  confirmDesignAssetUploadSchema,
  confirmDesignPreviewUploadSchema,
  createDesignAssetUploadSchema,
  createDesignDraftSchema,
  createDesignPreviewUploadSchema,
  deleteDesignDraftSchema,
  designByIdSchema,
  saveDesignPreviewSchema,
  updateDesignSchema,
} from './designs.validation'

type DesignActor = {
  userId: string | null
  guestSessionId: string | null
}

type DesignConfigRecord = Record<string, unknown>
type InputJsonValue = Prisma.InputJsonValue

/** sortOrder for back preview in DesignAsset (front lives on Design.previewUrl). */
const BACK_PREVIEW_ASSET_SORT_ORDER = 10
const LOGO_ASSET_SORT_ORDER = 20

function expiresAtIso(ttlSeconds = PRESIGNED_PUT_TTL_SECONDS): string {
  return new Date(Date.now() + ttlSeconds * 1000).toISOString()
}

function mapViewKeysToGql(keys: { webp: string; jpg: string }): DesignPreviewViewUrlsGql {
  return { webp: keys.webp, jpg: keys.jpg }
}

function mapViewUrlsToGql(urls: { webp: string; jpg: string }): DesignPreviewViewUrlsGql {
  return { webp: urls.webp, jpg: urls.jpg }
}

function mapViewPresignedToGql(presigned: {
  webp: { url: string }
  jpg: { url: string }
}): DesignPreviewViewUrlsGql {
  return { webp: presigned.webp.url, jpg: presigned.jpg.url }
}

function mapDesignAssetToGql(asset: {
  id: string
  designId: string
  type: DesignAssetType
  url: string
  publicId: string | null
  sortOrder: number | null
}): DesignAssetGql {
  return {
    id: asset.id,
    designId: asset.designId,
    type: asset.type,
    url: asset.url,
    publicId: asset.publicId,
    sortOrder: asset.sortOrder,
  }
}

function mergePreviewConfig(
  configJson: unknown,
  previews: {
    front: { url: string; publicId: string }
    back: { url: string; publicId: string }
  },
): InputJsonValue {
  const base =
    configJson && typeof configJson === 'object' && !Array.isArray(configJson)
      ? { ...(configJson as DesignConfigRecord) }
      : {}
  return {
    ...base,
    previews: {
      front: previews.front,
      back: previews.back,
    },
  } as InputJsonValue
}

const productForDesignInclude = {
  productType: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: {
    where: { deletedAt: null },
    include: { color: true, size: true },
  },
  customizationRules: {
    where: { isEnabled: true },
    include: { area: true, option: true },
  },
} satisfies Prisma.ProductInclude

function designError(message: string, code: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code } })
}

async function resolveDesignActor(context: GraphQLContext): Promise<DesignActor> {
  if (context.currentUser) {
    return { userId: context.currentUser.id, guestSessionId: null }
  }
  const { guestSession } = await getOrCreateGuestSession()
  return { userId: null, guestSessionId: guestSession.id }
}

function actorWhere(actor: DesignActor): Prisma.DesignWhereInput {
  if (actor.userId) {
    return { userId: actor.userId, deletedAt: null }
  }
  return { guestSessionId: actor.guestSessionId, deletedAt: null }
}

function configProductSlug(configJson: unknown): string | null {
  if (!configJson || typeof configJson !== 'object' || Array.isArray(configJson)) return null
  const slug = (configJson as DesignConfigRecord).productSlug
  return typeof slug === 'string' && slug.length > 0 ? slug : null
}

async function resolveDesignProduct(
  context: GraphQLContext,
  design: Design,
) {
  const slug = configProductSlug(design.configJson)
  if (!slug) return null

  const product = await context.prisma.product.findFirst({
    where: { slug, deletedAt: null, status: ProductStatus.ACTIVE },
    include: productForDesignInclude,
  })

  return product ? mapProductForDesign(product) : null
}

async function mapDesignPayload(
  context: GraphQLContext,
  design: Design,
): Promise<AccountDesignGql> {
  const product = await resolveDesignProduct(context, design)
  return mapDesignToGql(design, product)
}

async function assertProductExists(
  context: GraphQLContext,
  productId: string,
  productVariantId?: string | null,
) {
  const product = await context.prisma.product.findFirst({
    where: { id: productId, deletedAt: null, status: ProductStatus.ACTIVE },
    select: { id: true, slug: true },
  })
  if (!product) throw designError('Producto no encontrado.', 'NOT_FOUND')

  if (productVariantId) {
    const variant = await context.prisma.productVariant.findFirst({
      where: { id: productVariantId, productId, deletedAt: null },
      select: { id: true },
    })
    if (!variant) {
      throw designError('Variante no encontrada para este producto.', 'NOT_FOUND')
    }
  }
}

async function assertDesignOwnership(
  context: GraphQLContext,
  actor: DesignActor,
  designId: string,
): Promise<Design> {
  const design = await context.prisma.design.findFirst({
    where: { id: designId, ...actorWhere(actor) },
  })

  if (!design) {
    throw designError('Diseño no encontrado o sin permisos.', 'NOT_FOUND')
  }

  return design
}

async function createDesignEvent(
  context: GraphQLContext,
  designId: string,
  type: DesignEventType,
  metadataJson?: unknown,
) {
  await context.prisma.designEvent.create({
    data: {
      designId,
      type,
      metadataJson: (metadataJson as InputJsonValue | undefined) ?? undefined,
    },
  })
}

/**
 * Creates a draft design for an authenticated user or guest session.
 * Ownership is resolved server-side from auth/cookie context.
 */
export async function createDesignDraft(
  context: GraphQLContext,
  input: CreateDesignDraftInput,
): Promise<AccountDesignGql> {
  const parsed = createDesignDraftSchema.parse(input)
  const actor = await resolveDesignActor(context)
  await assertProductExists(context, parsed.productId, parsed.productVariantId)

  const design = await context.prisma.design.create({
    data: {
      userId: actor.userId,
      guestSessionId: actor.guestSessionId,
      status: DesignStatus.DRAFT,
      configJson: parsed.configJson as InputJsonValue,
      name: 'Borrador',
    },
  })

  await createDesignEvent(context, design.id, DesignEventType.CREATED, {
    productId: parsed.productId,
    productVariantId: parsed.productVariantId ?? null,
  })

  return mapDesignPayload(context, design)
}

/**
 * Updates draft/saved design configuration JSON.
 */
export async function updateDesign(
  context: GraphQLContext,
  input: UpdateDesignInput,
): Promise<AccountDesignGql> {
  const parsed = updateDesignSchema.parse(input)
  const actor = await resolveDesignActor(context)
  await assertDesignOwnership(context, actor, parsed.designId)

  const design = await context.prisma.design.update({
    where: { id: parsed.designId },
    data: {
      configJson: parsed.configJson as InputJsonValue,
      status: DesignStatus.SAVED,
    },
  })

  await createDesignEvent(context, design.id, DesignEventType.UPDATED, {
    action: 'config',
  })

  return mapDesignPayload(context, design)
}

/**
 * Issues presigned PUT URLs for front and back design preview images.
 * Ownership is verified server-side; keys are deterministic per designId.
 */
export async function createDesignPreviewUpload(
  context: GraphQLContext,
  input: CreateDesignPreviewUploadInput,
): Promise<DesignPreviewUploadPayloadGql> {
  const parsed = createDesignPreviewUploadSchema.parse(input)
  const actor = await resolveDesignActor(context)
  await assertDesignOwnership(context, actor, parsed.designId)

  requireR2Config()
  validateUploadSize(parsed.frontWebpSizeBytes, 'design')
  validateUploadSize(parsed.backWebpSizeBytes, 'design')
  if (parsed.frontJpgSizeBytes != null) {
    validateUploadSize(parsed.frontJpgSizeBytes, 'design')
  }
  if (parsed.backJpgSizeBytes != null) {
    validateUploadSize(parsed.backJpgSizeBytes, 'design')
  }

  const keys = buildDesignPreviewUploadKeys(parsed.designId)
  const [frontPresigned, backPresigned] = await Promise.all([
    createPresignedPutUrlsForKeys(keys.front),
    createPresignedPutUrlsForKeys(keys.back),
  ])
  const frontPublic = buildPublicUrlsForKeys(keys.front)
  const backPublic = buildPublicUrlsForKeys(keys.back)

  return {
    uploadId: encodeDesignPreviewUploadToken(parsed.designId),
    keys: {
      front: mapViewKeysToGql(keys.front),
      back: mapViewKeysToGql(keys.back),
    },
    publicUrls: {
      front: mapViewUrlsToGql(frontPublic),
      back: mapViewUrlsToGql(backPublic),
    },
    presignedUrls: {
      front: mapViewPresignedToGql(frontPresigned),
      back: mapViewPresignedToGql(backPresigned),
    },
    expiresAt: expiresAtIso(),
  }
}

/**
 * Confirms front/back preview uploads in R2 and persists URLs on Design + DesignAsset.
 */
export async function confirmDesignPreviewUpload(
  context: GraphQLContext,
  input: ConfirmDesignPreviewUploadInput,
): Promise<AccountDesignGql> {
  const parsed = confirmDesignPreviewUploadSchema.parse(input)
  const token = decodeDesignPreviewUploadToken(parsed.uploadId)
  const actor = await resolveDesignActor(context)
  const existing = await assertDesignOwnership(context, actor, token.designId)

  requireR2Config()
  const keys = buildDesignPreviewUploadKeys(token.designId)

  const [frontExists, backExists] = await Promise.all([
    r2HeadObject(keys.front.webp),
    r2HeadObject(keys.back.webp),
  ])

  if (!frontExists || !backExists) {
    throw designError(
      'No encontramos las vistas previas subidas. Vuelve a intentar la subida.',
      'BAD_USER_INPUT',
    )
  }

  const frontUrl = buildPublicR2Url(keys.front.webp)
  const backUrl = buildPublicR2Url(keys.back.webp)
  const nextConfig = mergePreviewConfig(existing.configJson, {
    front: { url: frontUrl, publicId: keys.front.webp },
    back: { url: backUrl, publicId: keys.back.webp },
  })

  const design = await context.prisma.$transaction(async (tx) => {
    await tx.designAsset.deleteMany({
      where: {
        designId: token.designId,
        type: DesignAssetType.PREVIEW,
        sortOrder: BACK_PREVIEW_ASSET_SORT_ORDER,
      },
    })

    await tx.designAsset.create({
      data: {
        designId: token.designId,
        type: DesignAssetType.PREVIEW,
        url: backUrl,
        publicId: keys.back.webp,
        sortOrder: BACK_PREVIEW_ASSET_SORT_ORDER,
      },
    })

    return tx.design.update({
      where: { id: token.designId },
      data: {
        previewUrl: frontUrl,
        previewPublicId: keys.front.webp,
        configJson: nextConfig,
        status: DesignStatus.SAVED,
      },
    })
  })

  await createDesignEvent(context, design.id, DesignEventType.UPDATED, {
    action: 'preview',
    views: ['front', 'back'],
  })

  return mapDesignPayload(context, design)
}

/**
 * Issues presigned PUT URLs for a logo asset tied to a design.
 */
export async function createDesignAssetUpload(
  context: GraphQLContext,
  input: CreateDesignAssetUploadInput,
): Promise<DesignAssetUploadPayloadGql> {
  const parsed = createDesignAssetUploadSchema.parse(input)
  if (parsed.assetType !== 'LOGO') {
    throw designError('Tipo de asset no soportado.', 'BAD_USER_INPUT')
  }
  const actor = await resolveDesignActor(context)
  await assertDesignOwnership(context, actor, parsed.designId)

  requireR2Config()
  validateUploadSize(parsed.webpSizeBytes, 'designAsset')
  if (parsed.pngSizeBytes != null) {
    validateUploadSize(parsed.pngSizeBytes, 'designAsset')
  }

  const assetId = randomUUID()
  const keys = buildDesignAssetLogoKeys(parsed.designId, assetId)
  const publicUrls = buildPublicUrlsForKeys(keys)
  const presignedUrls = await createPresignedPutUrlsForKeys(keys)

  return {
    uploadId: encodeDesignAssetUploadToken(parsed.designId, assetId),
    assetId,
    expiresAt: expiresAtIso(),
    keys: { webp: keys.webp, png: keys.jpg },
    publicUrls: { webp: publicUrls.webp, png: publicUrls.jpg },
    presignedUrls: { webp: presignedUrls.webp.url, png: presignedUrls.jpg.url },
  }
}

/**
 * Confirms a logo upload and persists DesignAsset metadata.
 */
export async function confirmDesignAssetUpload(
  context: GraphQLContext,
  input: ConfirmDesignAssetUploadInput,
): Promise<DesignAssetGql> {
  const parsed = confirmDesignAssetUploadSchema.parse(input)
  const token = decodeDesignAssetUploadToken(parsed.uploadId)
  const actor = await resolveDesignActor(context)
  await assertDesignOwnership(context, actor, token.designId)

  requireR2Config()
  const keys = buildDesignAssetLogoKeys(token.designId, token.assetId)
  const exists = await r2HeadObject(keys.webp)
  if (!exists) {
    throw designError(
      'No encontramos el logotipo subido. Intenta de nuevo.',
      'BAD_USER_INPUT',
    )
  }

  const url = buildPublicR2Url(keys.webp)
  const asset = await context.prisma.designAsset.upsert({
    where: { id: token.assetId },
    update: {
      type: DesignAssetType.LOGO,
      url,
      publicId: keys.webp,
      sortOrder: LOGO_ASSET_SORT_ORDER,
    },
    create: {
      id: token.assetId,
      designId: token.designId,
      type: DesignAssetType.LOGO,
      url,
      publicId: keys.webp,
      sortOrder: LOGO_ASSET_SORT_ORDER,
    },
  })

  await createDesignEvent(context, token.designId, DesignEventType.UPDATED, {
    action: 'logo-upload',
    assetId: asset.id,
  })

  return mapDesignAssetToGql(asset)
}

/**
 * Stores preview URL/public id for a design and logs UPDATE event.
 */
export async function saveDesignPreview(
  context: GraphQLContext,
  input: SaveDesignPreviewInput,
): Promise<AccountDesignGql> {
  const parsed = saveDesignPreviewSchema.parse(input)
  const actor = await resolveDesignActor(context)
  await assertDesignOwnership(context, actor, parsed.designId)

  const design = await context.prisma.design.update({
    where: { id: parsed.designId },
    data: {
      previewUrl: parsed.previewUrl,
      previewPublicId: parsed.previewPublicId ?? null,
    },
  })

  await createDesignEvent(context, design.id, DesignEventType.UPDATED, {
    action: 'preview',
  })

  return mapDesignPayload(context, design)
}

/**
 * Soft-deletes a draft/saved design owned by current actor.
 */
export async function deleteDesignDraft(
  context: GraphQLContext,
  input: DeleteDesignDraftInput,
): Promise<boolean> {
  const parsed = deleteDesignDraftSchema.parse(input)
  const actor = await resolveDesignActor(context)
  const design = await assertDesignOwnership(context, actor, parsed.designId)

  if (design.status === DesignStatus.PURCHASED) {
    throw designError('No puedes eliminar un diseño comprado.', 'BAD_USER_INPUT')
  }

  await context.prisma.design.update({
    where: { id: design.id },
    data: {
      deletedAt: new Date(),
      status: DesignStatus.ARCHIVED,
    },
  })

  await createDesignEvent(context, design.id, DesignEventType.UPDATED, {
    action: 'soft-delete',
  })

  return true
}

/**
 * Returns a design by id if the current actor owns it.
 */
export async function getDesignById(
  context: GraphQLContext,
  designId: string,
): Promise<AccountDesignGql | null> {
  const parsed = designByIdSchema.parse({ designId })
  const actor = await resolveDesignActor(context)

  const design = await context.prisma.design.findFirst({
    where: { id: parsed.designId, ...actorWhere(actor) },
  })

  if (!design) return null
  return mapDesignPayload(context, design)
}

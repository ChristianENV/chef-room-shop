import 'server-only'

import { randomUUID } from 'node:crypto'
import { ProductModelAssetStatus } from '@prisma/client'
import { GraphQLError } from 'graphql'

import {
  buildProductModelObjectKey,
  buildPublicR2Url,
  createR2PresignedPutUrl,
  MAX_UPLOAD_BYTES,
  PRESIGNED_PUT_TTL_SECONDS,
  r2DeleteObject,
  r2HeadObject,
  requireR2Config,
  validateUploadSize,
} from '@/src/server/storage/r2'

// GLB content type is not a StoredImageContentType (image/*) — cast for presigned PUT.
const GLB_CONTENT_TYPE = 'model/gltf-binary' as const

import type { GraphQLContext } from '../../context'
import { requireAdminGraphQL } from './admin-products.auth'
import type {
  AdminProductModel3dGql,
  ConfirmAdminProductModelUploadInput,
  CreateAdminProductModelUploadInput,
  ProductModelUploadPayloadGql,
} from './admin-products.types'

function expiresAtIso(ttlSeconds = PRESIGNED_PUT_TTL_SECONDS): string {
  return new Date(Date.now() + ttlSeconds * 1000).toISOString()
}

function notFoundError(entity = 'Producto'): GraphQLError {
  return new GraphQLError(`${entity} no encontrado.`, {
    extensions: { code: 'NOT_FOUND' },
  })
}

/**
 * Validates that the file name ends in .glb and the declared content type is
 * acceptable for a GLB binary. Browsers sometimes send application/octet-stream
 * for .glb files — we tolerate that as long as the extension is .glb.
 */
function validateGlbUpload(fileName: string, contentType: string): void {
  if (!fileName.toLowerCase().endsWith('.glb')) {
    throw new GraphQLError(
      'Solo se aceptan archivos .glb para modelos 3D. No se permiten .max, .blend, .fbx, .obj ni .zip.',
      { extensions: { code: 'INVALID_FILE_TYPE' } },
    )
  }

  const normalizedCt = contentType.trim().toLowerCase()
  const allowed = ['model/gltf-binary', 'application/octet-stream']
  if (!allowed.includes(normalizedCt)) {
    throw new GraphQLError(
      `Content-Type "${contentType}" no está permitido para modelos 3D. Usa model/gltf-binary.`,
      { extensions: { code: 'INVALID_CONTENT_TYPE' } },
    )
  }
}

// ---------------------------------------------------------------------------
// Create upload
// ---------------------------------------------------------------------------

export async function createAdminProductModelUpload(
  context: GraphQLContext,
  input: CreateAdminProductModelUploadInput,
): Promise<ProductModelUploadPayloadGql> {
  requireAdminGraphQL(context)

  const {
    productId,
    fileName,
    originalFileName,
    sizeBytes,
    contentType,
    originalSizeBytes,
    compressionRatio,
    optimizationReportJson,
  } = input

  validateGlbUpload(fileName, contentType)
  validateUploadSize(sizeBytes, 'productModel')

  const product = await context.prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    select: { id: true },
  })
  if (!product) throw notFoundError()

  const modelAssetId = randomUUID()
  const key = buildProductModelObjectKey(productId, modelAssetId)
  requireR2Config() // throws if R2 not configured

  const presignedResult = await createR2PresignedPutUrl({
    key,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contentType: GLB_CONTENT_TYPE as any,
    expiresInSeconds: PRESIGNED_PUT_TTL_SECONDS,
  })
  const presignedUrl = presignedResult.url

  const publicUrl = buildPublicR2Url(key)

  // Create a PROCESSING record so we can confirm later.
  await context.prisma.productModelAsset.create({
    data: {
      id: modelAssetId,
      productId,
      url: publicUrl,
      publicId: key,
      fileName,
      originalFileName: originalFileName ?? null,
      format: 'glb',
      contentType: 'model/gltf-binary',
      sizeBytes,
      originalSizeBytes: originalSizeBytes ?? null,
      compressionRatio: compressionRatio ?? null,
      optimizationReportJson: optimizationReportJson
        ? (optimizationReportJson as object)
        : undefined,
      isActive: false,
      status: ProductModelAssetStatus.PROCESSING,
      createdByUserId: context.currentUser?.id ?? null,
    },
  })

  return {
    uploadId: modelAssetId,
    modelAssetId,
    publicId: key,
    publicUrl,
    presignedUrl,
    expiresAt: expiresAtIso(),
  }
}

// ---------------------------------------------------------------------------
// Confirm upload
// ---------------------------------------------------------------------------

export async function confirmAdminProductModelUpload(
  context: GraphQLContext,
  input: ConfirmAdminProductModelUploadInput,
): Promise<AdminProductModel3dGql> {
  requireAdminGraphQL(context)

  const { uploadId, metadataJson, materialHintsJson, meshHintsJson, anchorsJson } = input

  const asset = await context.prisma.productModelAsset.findFirst({
    where: { id: uploadId, deletedAt: null },
  })
  if (!asset) throw notFoundError('Modelo 3D')

  // Verify file actually exists in R2.
  const exists = await r2HeadObject(asset.publicId)
  if (!exists) {
    throw new GraphQLError('El archivo no se encontró en el almacenamiento. Reintenta el upload.', {
      extensions: { code: 'UPLOAD_NOT_FOUND' },
    })
  }

  // Deactivate any other active models for this product.
  await context.prisma.productModelAsset.updateMany({
    where: {
      productId: asset.productId,
      isActive: true,
      id: { not: uploadId },
      deletedAt: null,
    },
    data: { isActive: false, status: ProductModelAssetStatus.INACTIVE },
  })

  // Activate the confirmed model.
  const confirmed = await context.prisma.productModelAsset.update({
    where: { id: uploadId },
    data: {
      isActive: true,
      status: ProductModelAssetStatus.ACTIVE,
      metadataJson: metadataJson ? (metadataJson as object) : undefined,
      materialHintsJson: materialHintsJson ? (materialHintsJson as object) : undefined,
      meshHintsJson: meshHintsJson ? (meshHintsJson as object) : undefined,
      anchorsJson: anchorsJson ? (anchorsJson as object) : undefined,
    },
  })

  return mapProductModelAssetToGql(confirmed)
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteAdminProductModelAsset(
  context: GraphQLContext,
  modelAssetId: string,
): Promise<boolean> {
  requireAdminGraphQL(context)

  const asset = await context.prisma.productModelAsset.findFirst({
    where: { id: modelAssetId, deletedAt: null },
  })
  if (!asset) throw notFoundError('Modelo 3D')

  // Soft delete.
  await context.prisma.productModelAsset.update({
    where: { id: modelAssetId },
    data: {
      deletedAt: new Date(),
      isActive: false,
      status: ProductModelAssetStatus.INACTIVE,
    },
  })

  // If this was the active model, promote the next most-recent one.
  if (asset.isActive) {
    const next = await context.prisma.productModelAsset.findFirst({
      where: {
        productId: asset.productId,
        deletedAt: null,
        status: ProductModelAssetStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
    })
    if (next) {
      await context.prisma.productModelAsset.update({
        where: { id: next.id },
        data: { isActive: true },
      })
    }
  }

  // Best-effort delete from R2 (non-blocking).
  r2DeleteObject(asset.publicId).catch((err: unknown) => {
    console.warn(`[r2] Could not delete product model ${asset.publicId}:`, err)
  })

  return true
}

// ---------------------------------------------------------------------------
// Set active
// ---------------------------------------------------------------------------

export async function setActiveAdminProductModelAsset(
  context: GraphQLContext,
  modelAssetId: string,
): Promise<AdminProductModel3dGql> {
  requireAdminGraphQL(context)

  const asset = await context.prisma.productModelAsset.findFirst({
    where: { id: modelAssetId, deletedAt: null },
  })
  if (!asset) throw notFoundError('Modelo 3D')

  await context.prisma.productModelAsset.updateMany({
    where: {
      productId: asset.productId,
      isActive: true,
      id: { not: modelAssetId },
      deletedAt: null,
    },
    data: { isActive: false, status: ProductModelAssetStatus.INACTIVE },
  })

  const updated = await context.prisma.productModelAsset.update({
    where: { id: modelAssetId },
    data: { isActive: true, status: ProductModelAssetStatus.ACTIVE },
  })

  return mapProductModelAssetToGql(updated)
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

import type { ProductModelAsset } from '@prisma/client'

export function mapProductModelAssetToGql(asset: ProductModelAsset): AdminProductModel3dGql {
  return {
    id: asset.id,
    productId: asset.productId,
    url: asset.url,
    publicId: asset.publicId,
    fileName: asset.fileName,
    originalFileName: asset.originalFileName,
    format: asset.format,
    contentType: asset.contentType,
    sizeBytes: asset.sizeBytes,
    originalSizeBytes: asset.originalSizeBytes,
    compressionRatio: asset.compressionRatio,
    isActive: asset.isActive,
    status: asset.status as string,
    metadataJson: asset.metadataJson ?? null,
    materialHintsJson: asset.materialHintsJson ?? null,
    meshHintsJson: asset.meshHintsJson ?? null,
    anchorsJson: asset.anchorsJson ?? null,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
  }
}

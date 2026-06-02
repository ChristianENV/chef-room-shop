import { z } from 'zod'

export const createDesignDraftSchema = z.object({
  productId: z.string().uuid(),
  productVariantId: z.string().uuid().nullish(),
  configJson: z.unknown(),
})

export const updateDesignSchema = z.object({
  designId: z.string().uuid(),
  configJson: z.unknown(),
})

export const saveDesignPreviewSchema = z.object({
  designId: z.string().uuid(),
  previewUrl: z.string().url().max(4096),
  previewPublicId: z.string().max(512).nullish(),
})

export const deleteDesignDraftSchema = z.object({
  designId: z.string().uuid(),
})

export const designByIdSchema = z.object({
  designId: z.string().uuid(),
})

export const createDesignPreviewUploadSchema = z.object({
  designId: z.string().uuid(),
  frontWebpSizeBytes: z.number().int().positive(),
  backWebpSizeBytes: z.number().int().positive(),
  frontJpgSizeBytes: z.number().int().positive().nullish(),
  backJpgSizeBytes: z.number().int().positive().nullish(),
})

export const confirmDesignPreviewUploadSchema = z.object({
  uploadId: z.string().min(1).max(4096),
})

const allowedDesignAssetMime = ['image/png', 'image/jpeg', 'image/webp'] as const

export const createDesignAssetUploadSchema = z.object({
  designId: z.string().uuid(),
  assetType: z.literal('LOGO'),
  webpSizeBytes: z.number().int().positive(),
  pngSizeBytes: z.number().int().positive().nullish(),
  originalFileName: z.string().trim().max(255).nullish(),
  originalContentType: z
    .string()
    .trim()
    .max(120)
    .nullish()
    .refine((value) => {
      if (!value) return true
      return allowedDesignAssetMime.includes(value as (typeof allowedDesignAssetMime)[number])
    }, 'Formato no soportado. Usa PNG, JPG o WebP.'),
})

export const confirmDesignAssetUploadSchema = z.object({
  uploadId: z.string().trim().min(1).max(4096),
})

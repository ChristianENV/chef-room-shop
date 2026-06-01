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

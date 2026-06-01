import { z } from 'zod'

const uuidSchema = z.string().uuid()
const sizeSchema = z.number().int().positive()

export const createAvatarUploadSchema = z.object({
  webpSizeBytes: sizeSchema,
  jpgSizeBytes: sizeSchema.optional().nullable(),
  originalFileName: z.string().trim().max(255).optional().nullable(),
  originalContentType: z.string().trim().max(120).optional().nullable(),
})

export const confirmAvatarUploadSchema = z.object({
  uploadId: z.string().trim().min(1).max(2000),
})

export const createProductImageUploadSchema = z.object({
  productId: uuidSchema,
  imageId: uuidSchema.optional().nullable(),
  webpSizeBytes: sizeSchema,
  jpgSizeBytes: sizeSchema.optional().nullable(),
  thumbSizeBytes: sizeSchema.optional().nullable(),
  originalFileName: z.string().trim().max(255).optional().nullable(),
  altText: z.string().trim().max(200).optional().nullable(),
})

export const confirmProductImageUploadSchema = z.object({
  uploadId: z.string().trim().min(1).max(2000),
  altText: z.string().trim().max(200).optional().nullable(),
  isPrimary: z.boolean().optional().nullable(),
  sortOrder: z.number().int().min(0).optional().nullable(),
})

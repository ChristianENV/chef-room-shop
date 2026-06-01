import type { AccountUserGql } from '../account/account.types'

export type UploadKeysGql = {
  webp: string
  jpg: string
  thumb: string | null
}

export type UploadPublicUrlsGql = {
  webp: string
  jpg: string
  thumb: string | null
}

export type UploadPresignedUrlsGql = {
  webp: string
  jpg: string
  thumb: string | null
}

export type AvatarUploadPayloadGql = {
  uploadId: string
  keys: UploadKeysGql
  publicUrls: UploadPublicUrlsGql
  presignedUrls: UploadPresignedUrlsGql
  expiresAt: string
}

export type ProductImageUploadPayloadGql = {
  uploadId: string
  imageId: string
  keys: UploadKeysGql
  publicUrls: UploadPublicUrlsGql
  presignedUrls: UploadPresignedUrlsGql
  expiresAt: string
}

export type UserAvatarPayloadGql = {
  user: AccountUserGql
  image: string | null
}

/** Public GraphQL ProductImage shape (matches catalog `ProductImage` type). */
export type ProductImageGql = {
  id: string
  url: string
  publicId: string | null
  alt: string | null
  sortOrder: number | null
  isPrimary: boolean
}

export type CreateAvatarUploadInput = {
  webpSizeBytes: number
  jpgSizeBytes?: number | null
  originalFileName?: string | null
  originalContentType?: string | null
}

export type ConfirmAvatarUploadInput = {
  uploadId: string
}

export type CreateProductImageUploadInput = {
  productId: string
  imageId?: string | null
  webpSizeBytes: number
  jpgSizeBytes?: number | null
  thumbSizeBytes?: number | null
  originalFileName?: string | null
  altText?: string | null
}

export type ConfirmProductImageUploadInput = {
  uploadId: string
  altText?: string | null
  isPrimary?: boolean | null
  sortOrder?: number | null
}

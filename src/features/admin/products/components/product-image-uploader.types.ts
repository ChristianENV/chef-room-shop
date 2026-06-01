export type ProductImageUploaderItemStatus =
  | 'uploaded'
  | 'processing'
  | 'uploading'
  | 'pending'
  | 'error'

export type ProductImageUploaderItem = {
  key: string
  id: string | null
  previewUrl: string
  url: string | null
  alt: string
  sortOrder: number
  isPrimary: boolean
  status: ProductImageUploaderItemStatus
  progress: number
  errorMessage: string | null
  originalFileName?: string
  /** Local object URL of source file while editing (revoke when done). */
  sourceObjectUrl?: string
  processed?: {
    webp: Blob
    jpg: Blob
    thumb: Blob
    estimatedBytes: number
  }
}

export type ProductImageUploaderHandle = {
  uploadPendingImages: (productId: string) => Promise<void>
  hasPendingUploads: () => boolean
}

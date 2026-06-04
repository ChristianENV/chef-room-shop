'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'
import {
  CONFIRM_ADMIN_PRODUCT_MODEL_UPLOAD_MUTATION,
  CREATE_ADMIN_PRODUCT_MODEL_UPLOAD_MUTATION,
  DELETE_ADMIN_PRODUCT_MODEL_ASSET_MUTATION,
} from '../graphql/admin-products-model.mutations'
import { adminProductsQueryKeys } from './admin-products.query-keys'
import { validateGlbFile, MAX_GLB_OPTIMIZED_BYTES } from '../lib/glb-validation'
import { optimizeGlbInBrowser } from '../lib/optimize-glb-in-browser'
import type { GlbOptimizationProgress } from '../lib/glb-optimization.types'

export type UploadProductModelStage =
  | 'idle'
  | 'validating'
  | 'optimizing'
  | 'readyToUpload'
  | 'uploading'
  | 'confirming'
  | 'success'
  | 'error'

export type AdminProductModel3dResult = {
  id: string
  productId: string
  url: string
  publicId: string
  fileName: string
  originalFileName: string | null
  format: string
  contentType: string
  sizeBytes: number
  originalSizeBytes: number | null
  compressionRatio: number | null
  isActive: boolean
  status: string
  createdAt: string
  updatedAt: string
}

type UploadInput = {
  productId: string
  file: File
  onStageChange?: (stage: UploadProductModelStage) => void
  onOptimizationProgress?: (progress: GlbOptimizationProgress) => void
}

type UploadState = {
  stage: UploadProductModelStage
  originalSizeBytes: number | null
  optimizedSizeBytes: number | null
  compressionRatio: number | null
  error: string | null
  result: AdminProductModel3dResult | null
  warnings: string[]
}

type CreateUploadPayload = {
  createAdminProductModelUpload: {
    uploadId: string
    modelAssetId: string
    presignedUrl: string
    publicUrl: string
    publicId: string
    expiresAt: string
  }
}

type ConfirmUploadPayload = {
  confirmAdminProductModelUpload: AdminProductModel3dResult
}

export function useAdminProductModelUploadMutation() {
  const queryClient = useQueryClient()

  const { mutateAsync: runUpload, isPending } = useMutation({
    mutationFn: async (input: UploadInput): Promise<UploadState> => {
      const { productId, file, onStageChange, onOptimizationProgress } = input

      const state: UploadState = {
        stage: 'idle',
        originalSizeBytes: null,
        optimizedSizeBytes: null,
        compressionRatio: null,
        error: null,
        result: null,
        warnings: [],
      }

      const setStage = (s: UploadProductModelStage) => {
        state.stage = s
        onStageChange?.(s)
      }

      // 1. Validate
      setStage('validating')
      const validation = await validateGlbFile(file)
      if (!validation.ok) {
        state.error = validation.error
        setStage('error')
        return state
      }
      if (validation.sizeWarning) state.warnings.push(validation.sizeWarning)
      state.originalSizeBytes = validation.sizeBytes

      // 2. Optimize
      setStage('optimizing')
      const optimized = await optimizeGlbInBrowser(file, onOptimizationProgress)

      let uploadBlob: Blob
      let finalSizeBytes: number
      let compressionRatio: number | null = null
      let originalSizeBytes: number = validation.sizeBytes

      if (optimized.ok) {
        uploadBlob = optimized.blob
        finalSizeBytes = optimized.optimizedSizeBytes
        compressionRatio = optimized.compressionRatio
        originalSizeBytes = optimized.originalSizeBytes
        state.optimizedSizeBytes = finalSizeBytes
        state.compressionRatio = compressionRatio
        state.warnings.push(...optimized.warnings)
      } else {
        // Optimization failed — check if we have a fallback blob (small enough original).
        if (optimized.fallbackBlob) {
          state.warnings.push(optimized.error)
          state.warnings.push('Subiendo archivo original sin optimizar.')
          uploadBlob = optimized.fallbackBlob
          finalSizeBytes = optimized.originalSizeBytes
        } else {
          state.error = optimized.error
          setStage('error')
          return state
        }
      }

      if (finalSizeBytes > MAX_GLB_OPTIMIZED_BYTES) {
        const mb = Math.round(finalSizeBytes / 1024 / 1024)
        state.error = `El modelo pesa ${mb} MB y excede el límite de ${MAX_GLB_OPTIMIZED_BYTES / 1024 / 1024} MB. Usa pnpm glb:optimize para reducir el tamaño.`
        setStage('error')
        return state
      }

      setStage('readyToUpload')

      // 3. Get presigned URL
      const createData = await fetchGraphQL<CreateUploadPayload, { input: Record<string, unknown> }>({
        query: CREATE_ADMIN_PRODUCT_MODEL_UPLOAD_MUTATION,
        variables: {
          input: {
            productId,
            fileName: file.name,
            originalFileName: file.name,
            sizeBytes: finalSizeBytes,
            originalSizeBytes,
            contentType: 'model/gltf-binary',
            compressionRatio,
          },
        },
      })
      const { uploadId, presignedUrl } = createData.createAdminProductModelUpload

      // 4. Upload to R2
      setStage('uploading')
      const putResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: uploadBlob,
        headers: { 'Content-Type': 'model/gltf-binary' },
      })
      if (!putResponse.ok) {
        state.error = `Error al subir a R2: ${putResponse.status} ${putResponse.statusText}`
        setStage('error')
        return state
      }

      // 5. Confirm
      setStage('confirming')
      const confirmData = await fetchGraphQL<ConfirmUploadPayload, { input: { uploadId: string } }>({
        query: CONFIRM_ADMIN_PRODUCT_MODEL_UPLOAD_MUTATION,
        variables: { input: { uploadId } },
      })
      state.result = confirmData.confirmAdminProductModelUpload
      setStage('success')
      return state
    },

    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.all })
      void queryClient.invalidateQueries({
        queryKey: adminProductsQueryKeys.detail(variables.productId),
      })
    },
  })

  return { uploadModel: runUpload, isPending }
}

// --- Delete mutation ---

export function useDeleteAdminProductModelAssetMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (modelAssetId: string) =>
      fetchGraphQL<{ deleteAdminProductModelAsset: boolean }, { modelAssetId: string }>({
        query: DELETE_ADMIN_PRODUCT_MODEL_ASSET_MUTATION,
        variables: { modelAssetId },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.all })
    },
  })
}

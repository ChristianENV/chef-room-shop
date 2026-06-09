import { isLocalCustomizerModelPath } from '@/src/config/public-models'
import type { CustomizerModelResolutionKind } from './model-registry'

export type CustomizerModelSourceKind = CustomizerModelResolutionKind | 'missing'

export type ModelSourceInfo = {
  modelUrl: string
  modelSource: CustomizerModelSourceKind
  usingLocalFallback: boolean
  hasProductModel3d: boolean
}

export type ModelSourceResolveInput = {
  modelUrl: string
  resolutionKind?: CustomizerModelResolutionKind
  hasProductModel3d?: boolean
}

export function resolveModelSourceInfo(input: ModelSourceResolveInput): ModelSourceInfo {
  const trimmed = input.modelUrl.trim()
  const hasProductModel3d = input.hasProductModel3d ?? false
  const usingLocalFallback =
    input.resolutionKind === 'local-fallback' || isLocalCustomizerModelPath(trimmed)

  if (!trimmed) {
    return {
      modelUrl: trimmed,
      modelSource: 'missing',
      usingLocalFallback: false,
      hasProductModel3d,
    }
  }

  if (input.resolutionKind) {
    return {
      modelUrl: trimmed,
      modelSource: input.resolutionKind,
      usingLocalFallback,
      hasProductModel3d,
    }
  }

  if (hasProductModel3d) {
    return {
      modelUrl: trimmed,
      modelSource: 'r2',
      usingLocalFallback: false,
      hasProductModel3d: true,
    }
  }

  if (usingLocalFallback) {
    return {
      modelUrl: trimmed,
      modelSource: 'local-fallback',
      usingLocalFallback: true,
      hasProductModel3d,
    }
  }

  return {
    modelUrl: trimmed,
    modelSource: 'env-fallback',
    usingLocalFallback: false,
    hasProductModel3d,
  }
}

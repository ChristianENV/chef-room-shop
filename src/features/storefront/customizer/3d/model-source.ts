import {
  CHEF_JACKET_GLTF_LOCAL,
  isLocalChefJacketGltfUrl,
} from '@/src/config/public-models'

export type ModelSourceInfo = {
  modelUrl: string
  modelSource: 'local' | 'remote'
  usingLocalFallback: boolean
}

export function resolveModelSourceInfo(modelUrl: string): ModelSourceInfo {
  const trimmed = modelUrl.trim()
  const usingLocalFallback =
    trimmed === CHEF_JACKET_GLTF_LOCAL || isLocalChefJacketGltfUrl(trimmed)

  return {
    modelUrl: trimmed,
    modelSource: usingLocalFallback ? 'local' : 'remote',
    usingLocalFallback,
  }
}

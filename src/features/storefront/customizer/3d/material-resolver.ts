import * as THREE from 'three'
import { materialNameMatchesHints } from './material-resolver-hints'
import { isThreeMesh, prepareGarmentSceneForRender } from './three-mesh-utils'

export type TintHints = {
  body: string[]
  detail?: string[]
  buttons?: string[]
  bodyMesh?: string[]
}

export type TintableMaterial = THREE.Material & { color: THREE.Color }

export type TintableMaterialGroups = {
  body: TintableMaterial[]
  detail: TintableMaterial[]
  buttons: TintableMaterial[]
}

export { materialNameMatchesHints, findMaterialsByHints } from './material-resolver-hints'

const DEFAULT_FABRIC_COLOR = '#f4f1ea'
const DEFAULT_BUTTON_COLOR = '#1f2937'
const DEBUG_MATERIAL_COLOR = '#d7263d'

export function createFabricMaterial(color: string = DEFAULT_FABRIC_COLOR): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: false,
    opacity: 1,
    depthWrite: true,
    depthTest: true,
    toneMapped: false,
  })
}

export function createButtonMaterial(color: string = DEFAULT_BUTTON_COLOR): THREE.MeshBasicMaterial {
  return createFabricMaterial(color)
}

function cloneGarmentMaterial(
  source: THREE.Material | undefined,
  tintColor: string,
): TintableMaterial {
  if (!source) return createFabricMaterial(tintColor)

  const cloned = source.clone()
  cloned.side = THREE.DoubleSide
  cloned.transparent = false
  cloned.opacity = 1
  cloned.depthWrite = true
  cloned.depthTest = true

  if ('color' in cloned && cloned.color instanceof THREE.Color) {
    cloned.color.set(tintColor)
  }

  if (cloned instanceof THREE.MeshPhysicalMaterial) {
    cloned.metalness = Math.min(cloned.metalness, 0.12)
    cloned.roughness = Math.max(cloned.roughness, 0.45)
    cloned.emissive.set(0x000000)
    cloned.emissiveIntensity = 0
    cloned.envMapIntensity = 1
  } else if (cloned instanceof THREE.MeshStandardMaterial) {
    cloned.metalness = Math.min(cloned.metalness, 0.12)
    cloned.roughness = Math.max(cloned.roughness, 0.45)
    cloned.emissive.set(0x000000)
    cloned.emissiveIntensity = 0
  }

  cloned.needsUpdate = true
  return cloned as TintableMaterial
}

function classifyMeshRole(
  meshName: string,
  materialName: string,
  hints: TintHints,
): 'body' | 'detail' | 'buttons' {
  const detailHints = hints.detail ?? []
  const buttonHints = hints.buttons ?? []
  const bodyMeshHints = hints.bodyMesh ?? []

  if (
    materialNameMatchesHints(materialName, buttonHints) ||
    materialNameMatchesHints(meshName, buttonHints)
  ) {
    return 'buttons'
  }

  if (
    materialNameMatchesHints(materialName, detailHints) ||
    materialNameMatchesHints(meshName, detailHints)
  ) {
    return 'detail'
  }

  if (
    materialNameMatchesHints(materialName, hints.body) ||
    materialNameMatchesHints(meshName, bodyMeshHints)
  ) {
    return 'body'
  }

  return 'body'
}

/**
 * Makes GLTF PBR materials visible without Environment maps (KHR_materials_specular).
 * Used as fallback when mesh tint assignment did not run.
 */
export function ensureLoadedPbrMaterialsVisible(root: THREE.Object3D): number {
  let count = 0

  root.traverse((object) => {
    if (!isThreeMesh(object)) return

    object.visible = true
    object.frustumCulled = false

    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of materials) {
      if (!material) continue
      material.side = THREE.DoubleSide
      material.transparent = false
      material.opacity = 1
      material.depthWrite = true
      material.depthTest = true

      if (material instanceof THREE.MeshPhysicalMaterial) {
        material.metalness = Math.min(material.metalness, 0.15)
        material.envMapIntensity = 1
        if (material.color.getHex() === 0x000000) {
          material.color.set(DEFAULT_FABRIC_COLOR)
        }
      }

      material.needsUpdate = true
      count += 1
    }
  })

  return count
}

/**
 * Clones each mesh material (keeps UV textures) and applies garment tint colors.
 * Same strategy as the isolated smoke scene — avoids mutating the useGLTF cache.
 */
export function assignVisibleGarmentMaterials(
  root: THREE.Object3D,
  hints: TintHints,
  colors: { baseColor: string; detailColor: string },
): TintableMaterialGroups {
  const groups: TintableMaterialGroups = { body: [], detail: [], buttons: [] }
  const meshes: THREE.Mesh[] = []

  root.traverse((object) => {
    if (!isThreeMesh(object)) return
    meshes.push(object)
  })

  for (const object of meshes) {
    const meshName = object.name
    const existingMaterials = Array.isArray(object.material) ? object.material : [object.material]
    const sourceMaterial = existingMaterials[0]
    const materialName = sourceMaterial?.name ?? ''
    const role = classifyMeshRole(meshName, materialName, hints)
    const tintColor =
      role === 'buttons' ? colors.detailColor : role === 'detail' ? colors.detailColor : colors.baseColor

    const nextMaterials = existingMaterials.map((material) => cloneGarmentMaterial(material, tintColor))
    object.material = nextMaterials.length === 1 ? nextMaterials[0]! : nextMaterials

    const primary = Array.isArray(object.material) ? object.material[0] : object.material
    if (primary && 'color' in primary) {
      groups[role].push(primary as TintableMaterial)
    }
  }

  prepareGarmentSceneForRender(root)

  if (groups.body.length === 0 && groups.detail.length === 0 && groups.buttons.length === 0) {
    ensureLoadedPbrMaterialsVisible(root)
  }

  return groups
}

/** Debug-only: solid red materials on every mesh. */
export function applyForceDebugMaterials(root: THREE.Object3D): number {
  let count = 0

  root.traverse((object) => {
    if (!isThreeMesh(object)) return
    object.material = new THREE.MeshBasicMaterial({
      color: DEBUG_MATERIAL_COLOR,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1,
      depthWrite: true,
      depthTest: true,
      toneMapped: false,
    })
    count += 1
  })

  prepareGarmentSceneForRender(root)
  return count
}

export function applyColorToMaterial(material: TintableMaterial, color: string): void {
  material.color.set(color)
  material.transparent = false
  material.opacity = 1
  material.needsUpdate = true
}

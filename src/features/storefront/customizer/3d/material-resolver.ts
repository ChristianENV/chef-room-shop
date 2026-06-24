import * as THREE from 'three'
import { materialNameMatchesHints } from './material-resolver-hints'

export type TintHints = {
  body: string[]
  detail?: string[]
  buttons?: string[]
  bodyMesh?: string[]
}

export type TintableMaterialGroups = {
  body: THREE.MeshStandardMaterial[]
  detail: THREE.MeshStandardMaterial[]
  buttons: THREE.MeshStandardMaterial[]
}

export { materialNameMatchesHints, findMaterialsByHints } from './material-resolver-hints'

const DEFAULT_FABRIC_COLOR = '#f4f1ea'
const DEFAULT_BUTTON_COLOR = '#1f2937'
const DEBUG_MATERIAL_COLOR = '#d7263d'

export function createFabricMaterial(
  color: string = DEFAULT_FABRIC_COLOR,
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.82,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: false,
    opacity: 1,
    depthWrite: true,
    depthTest: true,
  })
}

export function createButtonMaterial(
  color: string = DEFAULT_BUTTON_COLOR,
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.DoubleSide,
    transparent: false,
    opacity: 1,
    depthWrite: true,
    depthTest: true,
  })
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
 * Replaces every mesh material with fresh MeshStandardMaterial instances.
 * Does not mutate cached GLTF materials (works on a cloned scene).
 */
export function assignVisibleGarmentMaterials(
  root: THREE.Object3D,
  hints: TintHints,
  colors: { baseColor: string; detailColor: string },
): TintableMaterialGroups {
  const groups: TintableMaterialGroups = { body: [], detail: [], buttons: [] }

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return

    object.visible = true
    object.frustumCulled = true

    const meshName = object.name
    const sourceMaterial = Array.isArray(object.material) ? object.material[0] : object.material
    const materialName = sourceMaterial?.name ?? ''
    const role = classifyMeshRole(meshName, materialName, hints)

    const material =
      role === 'buttons'
        ? createButtonMaterial(colors.detailColor)
        : role === 'detail'
          ? createFabricMaterial(colors.detailColor)
          : createFabricMaterial(colors.baseColor)

    object.material = material
    groups[role].push(material)
  })

  return groups
}

/** Debug-only: solid red materials on every mesh. */
export function applyForceDebugMaterials(root: THREE.Object3D): number {
  let count = 0

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.visible = true
    object.frustumCulled = false
    object.material = new THREE.MeshStandardMaterial({
      color: DEBUG_MATERIAL_COLOR,
      roughness: 0.75,
      metalness: 0,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1,
      depthWrite: true,
      depthTest: true,
    })
    count += 1
  })

  return count
}

export function applyColorToMaterial(material: THREE.MeshStandardMaterial, color: string): void {
  material.color.set(color)
  material.transparent = false
  material.opacity = 1
  material.needsUpdate = true
}

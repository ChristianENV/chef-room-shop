import * as THREE from 'three'

/** PBR map slots that must survive a material clone/tint. */
const PRESERVED_MAP_KEYS = [
  'map',
  'normalMap',
  'roughnessMap',
  'metalnessMap',
  'aoMap',
] as const
type PreservedMapKey = (typeof PRESERVED_MAP_KEYS)[number]

export type TintHints = {
  body: string[]
  detail?: string[]
  buttons?: string[]
  /** Mesh-name hints used as a fallback for body classification. */
  bodyMesh?: string[]
}

export type TintableMaterialGroups = {
  body: THREE.MeshStandardMaterial[]
  detail: THREE.MeshStandardMaterial[]
  buttons: THREE.MeshStandardMaterial[]
}

/** Case-insensitive substring match against a list of hints. */
export function materialNameMatchesHints(name: string, hints: string[]): boolean {
  if (!name || hints.length === 0) return false
  const lower = name.toLowerCase()
  return hints.some((hint) => lower.includes(hint.toLowerCase()))
}

/**
 * Finds standard materials whose material or owning-mesh name matches any hint.
 * Returns shared references (does not clone).
 */
export function findMaterialsByHints(
  root: THREE.Object3D,
  hints: string[],
): THREE.MeshStandardMaterial[] {
  const found: THREE.MeshStandardMaterial[] = []
  const seen = new Set<string>()

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const meshName = object.name
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => {
      if (!(material instanceof THREE.MeshStandardMaterial)) return
      if (seen.has(material.uuid)) return
      if (
        materialNameMatchesHints(material.name ?? '', hints) ||
        materialNameMatchesHints(meshName, hints)
      ) {
        seen.add(material.uuid)
        found.push(material)
      }
    })
  })

  return found
}

/**
 * Clones a standard material while explicitly preserving PBR texture maps.
 * `THREE.Material.clone()` copies texture references already; we reassign the
 * known map slots defensively so tinting never drops textures.
 */
export function cloneMaterialSafely(
  material: THREE.MeshStandardMaterial,
): THREE.MeshStandardMaterial {
  const cloned = material.clone()
  for (const key of PRESERVED_MAP_KEYS) {
    const source = material[key as PreservedMapKey]
    cloned[key as PreservedMapKey] = source
  }
  return cloned
}

/** Applies a hex/css color to a material's base color, keeping maps intact. */
export function applyColorToMaterial(
  material: THREE.MeshStandardMaterial,
  color: string,
): void {
  material.color.set(color)
  material.needsUpdate = true
}

/**
 * Clones matched materials ONCE (preserving maps), replaces them on their
 * meshes so the cached GLTF materials are never mutated, and classifies them
 * into body/detail/buttons with precedence buttons > detail > body.
 *
 * Call this once per loaded scene (e.g. in a memo), then mutate the returned
 * materials' colors on swatch changes — never re-clone per render.
 */
export function resolveTintableMaterialGroups(
  root: THREE.Object3D,
  hints: TintHints,
): TintableMaterialGroups {
  const groups: TintableMaterialGroups = { body: [], detail: [], buttons: [] }
  const cloneByUuid = new Map<string, THREE.MeshStandardMaterial>()
  const detailHints = hints.detail ?? []
  const buttonHints = hints.buttons ?? []
  const bodyMeshHints = hints.bodyMesh ?? []

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const meshName = object.name
    const list = Array.isArray(object.material) ? object.material : [object.material]

    const replaced = list.map((material) => {
      if (!(material instanceof THREE.MeshStandardMaterial)) return material

      const existing = cloneByUuid.get(material.uuid)
      if (existing) return existing

      const clone = cloneMaterialSafely(material)
      cloneByUuid.set(material.uuid, clone)

      const matName = material.name ?? ''
      if (
        materialNameMatchesHints(matName, buttonHints) ||
        materialNameMatchesHints(meshName, buttonHints)
      ) {
        groups.buttons.push(clone)
      } else if (
        materialNameMatchesHints(matName, detailHints) ||
        materialNameMatchesHints(meshName, detailHints)
      ) {
        groups.detail.push(clone)
      } else if (
        materialNameMatchesHints(matName, hints.body) ||
        materialNameMatchesHints(meshName, bodyMeshHints)
      ) {
        groups.body.push(clone)
      }

      return clone
    })

    object.material = Array.isArray(object.material) ? replaced : replaced[0]!
  })

  return groups
}

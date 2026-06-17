import * as THREE from 'three'

const HERO_FABRIC_COLOR = '#f4f1ea'
const HERO_BUTTON_COLOR = '#000000'
const HERO_DEBUG_MATERIAL_COLOR = '#e8e8f0'

const BODY_MATERIAL_HINTS = ['fabric', 'cloth', 'jacket', 'chef', 'thick', '2333']
const BUTTON_MATERIAL_HINTS = ['button', 'default button', '2335']
const BODY_MESH_HINTS = ['cloth', 'fabric', 'jacket', 'chef']

export type HeroMeshInspection = {
  meshCount: number
  visibleMeshCount: number
  materialNames: string[]
  materialOpacities: number[]
  materialTransparentFlags: boolean[]
  boundsMin: [number, number, number] | null
  boundsMax: [number, number, number] | null
}

function nameMatchesHints(name: string, hints: string[]): boolean {
  const normalized = name.toLowerCase()
  return hints.some((hint) => normalized.includes(hint.toLowerCase()))
}

function classifyMeshRole(meshName: string, materialName: string): 'body' | 'buttons' {
  if (
    nameMatchesHints(materialName, BUTTON_MATERIAL_HINTS) ||
    nameMatchesHints(meshName, BUTTON_MATERIAL_HINTS)
  ) {
    return 'buttons'
  }

  if (
    nameMatchesHints(materialName, BODY_MATERIAL_HINTS) ||
    nameMatchesHints(meshName, BODY_MESH_HINTS)
  ) {
    return 'body'
  }

  return 'body'
}

function createHeroFabricMaterial(color: string = HERO_FABRIC_COLOR): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.82,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: false,
    opacity: 1,
    depthWrite: true,
    depthTest: true,
  })
  material.needsUpdate = true
  return material
}

function createHeroButtonMaterial(color: string = HERO_BUTTON_COLOR): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.75,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: false,
    opacity: 1,
    depthWrite: true,
    depthTest: true,
  })
  material.needsUpdate = true
  return material
}

/** Solid premium materials — no texture maps required for the landing hero. */
export function prepareHeroVisibleMaterials(root: THREE.Object3D): number {
  let meshCount = 0

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return

    meshCount += 1
    object.visible = true
    object.frustumCulled = false

    const meshName = object.name
    const sourceMaterial = Array.isArray(object.material) ? object.material[0] : object.material
    const materialName = sourceMaterial?.name ?? ''
    const role = classifyMeshRole(meshName, materialName)

    object.material =
      role === 'buttons' ? createHeroButtonMaterial() : createHeroFabricMaterial()
  })

  return meshCount
}

export function applyHeroDebugMaterials(root: THREE.Object3D): number {
  let meshCount = 0

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return

    meshCount += 1
    object.visible = true
    object.frustumCulled = false

    const material = new THREE.MeshStandardMaterial({
      color: HERO_DEBUG_MATERIAL_COLOR,
      roughness: 0.75,
      metalness: 0,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1,
      depthWrite: true,
      depthTest: true,
    })
    material.needsUpdate = true
    object.material = material
  })

  return meshCount
}

export function inspectHeroMeshes(root: THREE.Object3D): HeroMeshInspection {
  const materialNames: string[] = []
  const materialOpacities: number[] = []
  const materialTransparentFlags: boolean[] = []
  let meshCount = 0
  let visibleMeshCount = 0

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    meshCount += 1
    if (object.visible) visibleMeshCount += 1

    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => {
      materialNames.push(material.name || 'unnamed')
      materialOpacities.push('opacity' in material ? Number(material.opacity) : 1)
      materialTransparentFlags.push(Boolean(material.transparent))
    })
  })

  root.updateWorldMatrix(true, true)
  const box = new THREE.Box3().setFromObject(root)
  const boundsMin = box.isEmpty() ? null : (box.min.toArray() as [number, number, number])
  const boundsMax = box.isEmpty() ? null : (box.max.toArray() as [number, number, number])

  return {
    meshCount,
    visibleMeshCount,
    materialNames,
    materialOpacities,
    materialTransparentFlags,
    boundsMin,
    boundsMax,
  }
}

export function isHeroBoundsValid(bounds: {
  size: THREE.Vector3
  box: THREE.Box3
}): boolean {
  return (
    !bounds.box.isEmpty() &&
    bounds.size.x > 0 &&
    bounds.size.y > 0 &&
    bounds.size.z > 0 &&
    Number.isFinite(bounds.size.x) &&
    Number.isFinite(bounds.size.y) &&
    Number.isFinite(bounds.size.z)
  )
}

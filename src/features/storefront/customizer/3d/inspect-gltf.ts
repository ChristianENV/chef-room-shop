import * as THREE from 'three'

/** Texture map slots we care about when debugging PBR materials. */
const TEXTURE_SLOTS = [
  'map',
  'normalMap',
  'roughnessMap',
  'metalnessMap',
  'aoMap',
  'emissiveMap',
  'alphaMap',
] as const

const inspected = new Set<string>()

function shouldDebug(): boolean {
  if (process.env.NEXT_PUBLIC_CUSTOMIZER_DEBUG_3D === 'true') return true
  return process.env.NODE_ENV === 'development'
}

function listTextureMaps(material: THREE.Material): string[] {
  const present: string[] = []
  for (const slot of TEXTURE_SLOTS) {
    const value = (material as unknown as Record<string, unknown>)[slot]
    if (value instanceof THREE.Texture) present.push(slot)
  }
  return present
}

/**
 * Logs scene nodes, mesh names, material names and present texture maps.
 * Runs at most once per `id` and only when debugging is enabled
 * (`NEXT_PUBLIC_CUSTOMIZER_DEBUG_3D=true` or development).
 */
export function inspectGltf(id: string, root: THREE.Object3D): void {
  if (!shouldDebug()) return
  if (inspected.has(id)) return
  inspected.add(id)

  const meshes: { mesh: string; materials: { name: string; maps: string[] }[] }[] = []
  const childNames: string[] = []

  root.children.forEach((child) => childNames.push(`${child.type}:${child.name || '(unnamed)'}`))

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    meshes.push({
      mesh: object.name || '(unnamed)',
      materials: materials
        .filter((material): material is THREE.Material => Boolean(material))
        .map((material) => ({
          name: material.name || '(unnamed)',
          maps: listTextureMaps(material),
        })),
    })
  })

  const uniqueMaterials = [
    ...new Set(meshes.flatMap((entry) => entry.materials.map((m) => m.name))),
  ]

  console.groupCollapsed(`[customizer-3d] inspect "${id}"`)
  console.log('scene children:', childNames)
  console.log('unique materials:', uniqueMaterials)
  console.log(
    'suggested mapping — body: FABRIC/cloth/jacket | buttons: Button/default | detail: (none in this export)',
  )
  console.table(
    meshes.flatMap((entry) =>
      entry.materials.map((material) => ({
        mesh: entry.mesh,
        material: material.name,
        maps: material.maps.join(', ') || '(none)',
      })),
    ),
  )
  console.groupEnd()
}

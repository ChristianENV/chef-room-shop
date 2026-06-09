import * as THREE from 'three'

/** Case-insensitive substring match against a list of hints. */
export function materialNameMatchesHints(name: string, hints: string[]): boolean {
  if (!name || hints.length === 0) return false
  const lower = name.toLowerCase()
  return hints.some((hint) => lower.includes(hint.toLowerCase()))
}

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

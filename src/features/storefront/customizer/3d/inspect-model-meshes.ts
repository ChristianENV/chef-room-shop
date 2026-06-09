import * as THREE from 'three'

export type ModelMeshInspection = {
  meshCount: number
  visibleMeshCount: number
  materialNames: string[]
  materialTypes: string[]
  firstMeshVisible: boolean | null
  firstMeshMaterial: string | null
  firstMeshWorldPosition: [number, number, number] | null
  firstMeshWorldScale: [number, number, number] | null
}

function materialLabel(material: THREE.Material): string {
  return `${material.type}:${material.name || 'unnamed'}`
}

export function inspectModelMeshes(root: THREE.Object3D): ModelMeshInspection {
  const materialNames = new Set<string>()
  const materialTypes = new Set<string>()
  let meshCount = 0
  let visibleMeshCount = 0
  const meshes: THREE.Mesh[] = []

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    meshCount += 1
    if (object.visible) visibleMeshCount += 1
    meshes.push(object)

    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => {
      materialNames.add(material.name || 'unnamed')
      materialTypes.add(material.type)
    })
  })

  let firstMeshWorldPosition: [number, number, number] | null = null
  let firstMeshWorldScale: [number, number, number] | null = null
  let firstMeshMaterial: string | null = null
  let firstMeshVisible: boolean | null = null

  const firstMesh = meshes[0]
  if (firstMesh) {
    firstMesh.updateWorldMatrix(true, true)
    const position = new THREE.Vector3()
    const scale = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    firstMesh.matrixWorld.decompose(position, quaternion, scale)
    firstMeshWorldPosition = position.toArray() as [number, number, number]
    firstMeshWorldScale = scale.toArray() as [number, number, number]
    firstMeshVisible = firstMesh.visible
    const mat = Array.isArray(firstMesh.material) ? firstMesh.material[0] : firstMesh.material
    firstMeshMaterial = mat ? materialLabel(mat) : null
  }

  return {
    meshCount,
    visibleMeshCount,
    materialNames: [...materialNames],
    materialTypes: [...materialTypes],
    firstMeshVisible,
    firstMeshMaterial,
    firstMeshWorldPosition,
    firstMeshWorldScale,
  }
}

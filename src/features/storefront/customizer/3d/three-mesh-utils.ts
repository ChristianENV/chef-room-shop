import type * as THREE from 'three'

/** Prefer `.isMesh` over `instanceof` — avoids false negatives with bundled three copies. */
export function isThreeMesh(object: THREE.Object3D): object is THREE.Mesh {
  return (object as THREE.Mesh).isMesh === true
}

export function prepareGarmentSceneForRender(root: THREE.Object3D): void {
  root.visible = true
  root.traverse((object) => {
    object.visible = true
    if (!isThreeMesh(object)) return

    object.frustumCulled = false
    const geometry = object.geometry
    if (geometry) {
      if (!geometry.boundingSphere) geometry.computeBoundingSphere()
      if (!geometry.boundingBox) geometry.computeBoundingBox()
    }
  })
}

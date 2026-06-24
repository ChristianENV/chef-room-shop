import * as THREE from 'three'

export type ZoneId =
  | 'front-left-chest'
  | 'front-right-chest'
  | 'back-center'
  | 'left-sleeve'
  | 'right-sleeve'

export type ZoneDefinition = {
  /** Decal center in model-local space. Fallback when no anchor is calibrated. */
  position: THREE.Vector3
  /** Decal orientation (Euler XYZ, radians). */
  rotation: THREE.Euler
  /** Decal footprint [width, height, depth]. Depth should cover the mesh surface. */
  scale: THREE.Vector3
  /** Substring hints to find the target mesh. Falls back to first body mesh. */
  targetMeshHints: string[]
}

/**
 * Fallback decal zones for the local chef-jacket glTF (CLO coordinates, ~cm).
 * Calibrated from Cloth_mesh bounds (Y ≈ 91–162, front ≈ +Z).
 * Pending: anchors from ProductModelAsset.anchorsJson for the final model.
 */
export const CUSTOMIZER_ZONES: Record<ZoneId, ZoneDefinition> = {
  'front-left-chest': {
    position: new THREE.Vector3(-6, 142, 11),
    rotation: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(16, 12, 14),
    targetMeshHints: ['cloth', 'fabric', 'jacket', 'chef'],
  },
  'front-right-chest': {
    position: new THREE.Vector3(14, 142, 11),
    rotation: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(16, 12, 14),
    targetMeshHints: ['cloth', 'fabric', 'jacket', 'chef'],
  },
  'back-center': {
    position: new THREE.Vector3(7, 132, -1),
    rotation: new THREE.Euler(0, Math.PI, 0),
    scale: new THREE.Vector3(22, 16, 14),
    targetMeshHints: ['cloth', 'fabric', 'jacket', 'chef'],
  },
  'left-sleeve': {
    position: new THREE.Vector3(-18, 118, 3),
    rotation: new THREE.Euler(0, -Math.PI / 2, 0),
    scale: new THREE.Vector3(12, 10, 12),
    targetMeshHints: ['cloth', 'sleeve', 'arm', 'jacket'],
  },
  'right-sleeve': {
    position: new THREE.Vector3(25, 118, 3),
    rotation: new THREE.Euler(0, Math.PI / 2, 0),
    scale: new THREE.Vector3(12, 10, 12),
    targetMeshHints: ['cloth', 'sleeve', 'arm', 'jacket'],
  },
}

const DEFAULT_ZONE_ID: ZoneId = 'front-left-chest'

/** Map from Zustand DesignZone slugs to ZoneId. */
const ZONE_MAP: Record<string, ZoneId> = {
  pecho: 'front-left-chest',
  espalda: 'back-center',
  'manga-izquierda': 'left-sleeve',
  'manga-derecha': 'right-sleeve',
  general: 'front-left-chest',
}

export function resolveZoneId(designZone: string | undefined): ZoneId {
  if (!designZone) return DEFAULT_ZONE_ID
  return ZONE_MAP[designZone] ?? DEFAULT_ZONE_ID
}

/**
 * Finds the best matching mesh for a zone.
 * Returns the first mesh whose name contains any hint, or the first Mesh in
 * the scene if nothing matches (guarantees decals always have a surface).
 */
export function findZoneMesh(root: THREE.Object3D, hints: string[]): THREE.Mesh | null {
  let fallback: THREE.Mesh | null = null
  let found: THREE.Mesh | null = null

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    if (!fallback) fallback = object
    if (found) return
    const lower = object.name.toLowerCase()
    if (hints.some((hint) => lower.includes(hint.toLowerCase()))) {
      found = object
    }
  })

  return found ?? fallback
}

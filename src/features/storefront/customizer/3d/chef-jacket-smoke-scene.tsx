'use client'

import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import {
  CHEF_JACKET_SMOKE_CAMERA,
  CHEF_JACKET_SMOKE_MODEL_URL,
  CHEF_JACKET_SMOKE_TRANSFORM,
} from './chef-jacket-smoke-config'

export type ChefJacketSmokeDebugState = {
  loadState: 'idle' | 'loading' | 'loaded' | 'error'
  modelUrl: string
  meshCount: number
  materialCount: number
  boundsSize: [number, number, number] | null
  boundsCenter: [number, number, number] | null
  radius: number | null
  cameraPosition: [number, number, number] | null
  error: string | null
  debugMaterial: boolean
}

const INITIAL_DEBUG: ChefJacketSmokeDebugState = {
  loadState: 'loading',
  modelUrl: CHEF_JACKET_SMOKE_MODEL_URL,
  meshCount: 0,
  materialCount: 0,
  boundsSize: null,
  boundsCenter: null,
  radius: null,
  cameraPosition: null,
  error: null,
  debugMaterial: false,
}

function applyDebugMaterials(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    object.material = materials.map(
      () =>
        new THREE.MeshStandardMaterial({
          color: '#e74c3c',
          roughness: 0.8,
          metalness: 0,
          side: THREE.DoubleSide,
          transparent: false,
          opacity: 1,
        }),
    )
  })
}

function countMeshesAndMaterials(root: THREE.Object3D): {
  meshCount: number
  materialCount: number
} {
  const materials = new Set<THREE.Material>()
  let meshCount = 0
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    meshCount += 1
    const meshMaterials = Array.isArray(object.material) ? object.material : [object.material]
    meshMaterials.forEach((material) => materials.add(material))
  })
  return { meshCount, materialCount: materials.size }
}

function getWorldBounds(root: THREE.Object3D): {
  size: THREE.Vector3
  center: THREE.Vector3
  radius: number
} {
  root.updateWorldMatrix(true, true)
  const box = new THREE.Box3().setFromObject(root)
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)
  const radius = Math.max(size.x, size.y, size.z) * 0.5
  return { size, center, radius }
}

type SmokeModelProps = {
  debugMaterial: boolean
  onLoaded: (state: Partial<ChefJacketSmokeDebugState>) => void
  onError: (error: Error) => void
}

function SmokeModel({ debugMaterial, onLoaded }: SmokeModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const boxHelperRef = useRef<THREE.BoxHelper | null>(null)
  const { scene: threeScene } = useThree()
  const { scene } = useGLTF(CHEF_JACKET_SMOKE_MODEL_URL)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        object.material = materials.map((material) => material.clone())
      }
    })
    return clone
  }, [scene])

  useEffect(() => {
    if (debugMaterial) {
      applyDebugMaterials(clonedScene)
    }
  }, [clonedScene, debugMaterial])

  useLayoutEffect(() => {
    const root = groupRef.current
    if (!root) return

    root.updateWorldMatrix(true, true)
    const { meshCount, materialCount } = countMeshesAndMaterials(clonedScene)
    const bounds = getWorldBounds(root)

    if (boxHelperRef.current) {
      threeScene.remove(boxHelperRef.current)
      boxHelperRef.current.geometry.dispose()
      const helperMaterial = boxHelperRef.current.material
      if (!Array.isArray(helperMaterial)) helperMaterial.dispose()
      boxHelperRef.current = null
    }
    const helper = new THREE.BoxHelper(root, 0x00ff88)
    boxHelperRef.current = helper
    threeScene.add(helper)

    onLoaded({
      loadState: 'loaded',
      meshCount,
      materialCount,
      boundsSize: bounds.size.toArray() as [number, number, number],
      boundsCenter: bounds.center.toArray() as [number, number, number],
      radius: bounds.radius,
    })

    return () => {
      if (!boxHelperRef.current) return
      threeScene.remove(boxHelperRef.current)
      boxHelperRef.current.geometry.dispose()
      const material = boxHelperRef.current.material
      if (!Array.isArray(material)) material.dispose()
      boxHelperRef.current = null
    }
  }, [clonedScene, debugMaterial, onLoaded, threeScene])

  return (
    <group
      ref={groupRef}
      scale={CHEF_JACKET_SMOKE_TRANSFORM.scale}
      position={CHEF_JACKET_SMOKE_TRANSFORM.position}
      rotation={CHEF_JACKET_SMOKE_TRANSFORM.rotation}
    >
      <primitive object={clonedScene} />
    </group>
  )
}

type SmokeErrorBoundaryProps = {
  children: ReactNode
  onError: (error: Error) => void
}

type SmokeErrorBoundaryState = { hasError: boolean; message: string | null }

class SmokeErrorBoundary extends Component<SmokeErrorBoundaryProps, SmokeErrorBoundaryState> {
  state: SmokeErrorBoundaryState = { hasError: false, message: null }

  static getDerivedStateFromError(error: Error): SmokeErrorBoundaryState {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error) {
    this.props.onError(error)
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function SmokeCanvas({
  debugMaterial,
  onLoaded,
  onError,
}: {
  debugMaterial: boolean
  onLoaded: (state: Partial<ChefJacketSmokeDebugState>) => void
  onError: (error: Error) => void
}) {
  const { camera } = useThree()

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      onLoaded({ cameraPosition: camera.position.toArray() as [number, number, number] })
    }
  }, [camera, onLoaded])

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} />
      <gridHelper args={[20, 20, '#444466', '#222233']} position={[0, -1.5, 0]} />
      <axesHelper args={[2]} position={[0, -1.5, 0]} />
      <SmokeErrorBoundary onError={onError}>
        <Suspense fallback={null}>
          <SmokeModel debugMaterial={debugMaterial} onLoaded={onLoaded} onError={onError} />
        </Suspense>
      </SmokeErrorBoundary>
      <OrbitControls makeDefault target={CHEF_JACKET_SMOKE_CAMERA.target} enableDamping />
    </>
  )
}

type ChefJacketSmokeViewportProps = {
  className?: string
  showUi?: boolean
  canvasTestId?: string
}

export function ChefJacketSmokeViewport({
  className = 'h-[70vh] w-full',
  showUi = true,
  canvasTestId = 'chef-jacket-smoke-canvas',
}: ChefJacketSmokeViewportProps) {
  const [debug, setDebug] = useState<ChefJacketSmokeDebugState>(INITIAL_DEBUG)
  const [debugMaterial, setDebugMaterial] = useState(false)
  const [resetToken, setResetToken] = useState(0)

  const handleLoaded = useCallback((patch: Partial<ChefJacketSmokeDebugState>) => {
    setDebug((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleError = useCallback((error: Error) => {
    setDebug((prev) => ({
      ...prev,
      loadState: 'error',
      error: error.message,
    }))
  }, [])

  useEffect(() => {
    setDebug((prev) => ({ ...prev, debugMaterial }))
  }, [debugMaterial])

  return (
    <div className={className}>
      {showUi ? (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={debugMaterial}
              onChange={(event) => setDebugMaterial(event.target.checked)}
            />
            Material debug (rojo, sin texturas)
          </label>
          <button
            type="button"
            onClick={() => setResetToken((value) => value + 1)}
            className="rounded border border-white/20 bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
          >
            Reset camera
          </button>
          {debug.loadState === 'loaded' ? (
            <span data-testid="chef-jacket-smoke-loaded" className="text-sm text-emerald-400">
              Modelo cargado
            </span>
          ) : null}
          {debug.loadState === 'error' ? (
            <span data-testid="chef-jacket-smoke-error" className="text-sm text-red-400">
              Error: {debug.error}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="relative h-full min-h-[320px] rounded-lg border border-white/10 bg-[#0a0a14]">
        <Canvas
          key={resetToken}
          data-testid={canvasTestId}
          camera={{
            position: CHEF_JACKET_SMOKE_CAMERA.position,
            fov: CHEF_JACKET_SMOKE_CAMERA.fov,
            near: 0.01,
            far: 200,
          }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
        >
          <SmokeCanvas
            debugMaterial={debugMaterial}
            onLoaded={handleLoaded}
            onError={handleError}
          />
        </Canvas>
      </div>

      {showUi ? (
        <pre
          data-testid="chef-jacket-smoke-debug"
          className="mt-3 max-h-48 overflow-auto rounded-lg border border-white/10 bg-black/70 p-3 font-mono text-[11px] text-white/80"
        >
          {JSON.stringify(debug, null, 2)}
        </pre>
      ) : null}
    </div>
  )
}

useGLTF.preload(CHEF_JACKET_SMOKE_MODEL_URL)

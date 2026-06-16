'use client'

import {
  Component,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

import {
  isLandingHero3dDebugEnabled,
  isLandingHero3dDebugMaterialEnabled,
  type Hero3DModelLoadState,
} from './hero-3d-debug'
import {
  HERO_3D_CAMERA,
  HERO_3D_FLOAT_AMPLITUDE,
  HERO_3D_IDLE_ROTATION_SPEED,
  HERO_3D_JACKET_TRANSFORM,
  HERO_3D_MODEL_URL,
} from './hero-3d-config'

useGLTF.preload(HERO_3D_MODEL_URL)

export type Hero3DSceneReport = {
  modelLoadState: Hero3DModelLoadState
  meshCount: number
  boundsSize: [number, number, number] | null
  boundsCenter: [number, number, number] | null
  radius: number | null
  cameraPosition: [number, number, number] | null
  errorMessage?: string | null
}

function applyDebugMaterials(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.visible = true
    object.frustumCulled = false
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    object.material = materials.map(
      () =>
        new THREE.MeshStandardMaterial({
          color: '#e8e8f0',
          roughness: 0.8,
          metalness: 0,
          side: THREE.DoubleSide,
          transparent: false,
          opacity: 1,
        }),
    )
  })
}

/** Solid fabric materials for reliable contrast on the dark hero background. */
function prepareHeroVisibleMaterials(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return

    object.visible = true
    object.frustumCulled = false
    object.material = new THREE.MeshStandardMaterial({
      color: '#f4f1ea',
      roughness: 0.82,
      metalness: 0,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1,
      depthWrite: true,
      depthTest: true,
    })
  })
}

function countMeshes(root: THREE.Object3D): number {
  let count = 0
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) count += 1
  })
  return count
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

type HeroJacketModelProps = {
  animate: boolean
  showDebugPrimitive: boolean
  onReport: (report: Hero3DSceneReport) => void
}

function HeroJacketModel({ animate, showDebugPrimitive, onReport }: HeroJacketModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(HERO_3D_MODEL_URL)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    if (isLandingHero3dDebugMaterialEnabled()) {
      applyDebugMaterials(clone)
    } else {
      prepareHeroVisibleMaterials(clone)
    }
    return clone
  }, [scene])

  useLayoutEffect(() => {
    const root = groupRef.current
    if (!root) return

    root.updateWorldMatrix(true, true)
    const meshCount = countMeshes(clonedScene)
    const bounds = getWorldBounds(root)

    if (meshCount === 0) {
      onReport({
        modelLoadState: 'error',
        meshCount: 0,
        boundsSize: null,
        boundsCenter: null,
        radius: null,
        cameraPosition: null,
        errorMessage: 'GLTF loaded but meshCount is 0',
      })
      return
    }

    onReport({
      modelLoadState: 'loaded',
      meshCount,
      boundsSize: bounds.size.toArray() as [number, number, number],
      boundsCenter: bounds.center.toArray() as [number, number, number],
      radius: bounds.radius,
      cameraPosition: null,
    })
  }, [clonedScene, onReport])

  useFrame((state) => {
    const group = groupRef.current
    if (!group) return

    if (animate) {
      group.rotation.y =
        HERO_3D_JACKET_TRANSFORM.rotation[1] +
        Math.sin(state.clock.elapsedTime * HERO_3D_IDLE_ROTATION_SPEED) * 0.08
      group.position.y =
        HERO_3D_JACKET_TRANSFORM.position[1] +
        Math.sin(state.clock.elapsedTime * 0.85) * HERO_3D_FLOAT_AMPLITUDE
    }
  })

  return (
    <group
      ref={groupRef}
      scale={HERO_3D_JACKET_TRANSFORM.scale}
      position={HERO_3D_JACKET_TRANSFORM.position}
      rotation={HERO_3D_JACKET_TRANSFORM.rotation}
    >
      {showDebugPrimitive ? (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.35, 24, 24]} />
          <meshStandardMaterial color="#ff6b6b" emissive="#ff2222" emissiveIntensity={0.35} />
        </mesh>
      ) : null}
      <primitive object={clonedScene} />
    </group>
  )
}

function HeroSceneLights() {
  return (
    <>
      <ambientLight intensity={0.85} color="#ffffff" />
      <directionalLight position={[4.5, 6.5, 4]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[-3.5, 2.5, -2]} intensity={0.55} color="#c8d0ff" />
      <spotLight
        position={[-1.5, 2.5, -3.5]}
        angle={0.55}
        penumbra={0.85}
        intensity={1.8}
        color="#5a6fdd"
        distance={14}
      />
      <pointLight position={[0.5, 1.2, 2.5]} intensity={0.45} color="#ffffff" />
    </>
  )
}

function HeroDebugHelpers({ enabled }: { enabled: boolean }) {
  if (!enabled) return null
  return (
    <>
      <gridHelper args={[12, 12, '#4455aa', '#223366']} position={[0, -1.5, 0]} />
      <axesHelper args={[1.5]} position={[0, -0.88, 0]} />
    </>
  )
}

function CameraReporter({ onCamera }: { onCamera: (position: [number, number, number]) => void }) {
  const { camera } = useThree()

  useEffect(() => {
    onCamera(camera.position.toArray() as [number, number, number])
  }, [camera, onCamera])

  return null
}

type SceneErrorBoundaryProps = {
  children: ReactNode
  onError: (message: string) => void
}

type SceneErrorBoundaryState = { hasError: boolean; message: string | null }

class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  state: SceneErrorBoundaryState = { hasError: false, message: null }

  static getDerivedStateFromError(error: Error): SceneErrorBoundaryState {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error) {
    this.props.onError(error.message)
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

type Hero3DSceneCanvasProps = {
  animate: boolean
  dpr: number
  showDebugPrimitive: boolean
  onError: (message: string) => void
  onReport: (report: Hero3DSceneReport) => void
  onCameraPosition?: (position: [number, number, number]) => void
  onMounted?: () => void
  className?: string
}

export function Hero3DSceneCanvas({
  animate,
  dpr,
  showDebugPrimitive,
  onError,
  onReport,
  onCameraPosition,
  onMounted,
  className,
}: Hero3DSceneCanvasProps) {
  const debugEnabled = isLandingHero3dDebugEnabled()

  return (
    <Canvas
      className={className}
      dpr={dpr}
      camera={{
        position: HERO_3D_CAMERA.position,
        fov: HERO_3D_CAMERA.fov,
        near: 0.01,
        far: 100,
      }}
      gl={{
        alpha: false,
        antialias: true,
        powerPreference: 'high-performance',
      }}
      shadows={false}
      onCreated={({ camera, scene: threeScene }) => {
        threeScene.background = new THREE.Color('#0c1024')
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.lookAt(...HERO_3D_CAMERA.target)
          camera.updateProjectionMatrix()
        }
        onMounted?.()
      }}
      data-testid="landing-hero-3d-canvas"
    >
      <HeroSceneLights />
      <HeroDebugHelpers enabled={debugEnabled && showDebugPrimitive} />
      <CameraReporter onCamera={onCameraPosition ?? (() => undefined)} />
      <SceneErrorBoundary onError={onError}>
        <Suspense fallback={null}>
          <HeroJacketModel
            animate={animate}
            showDebugPrimitive={showDebugPrimitive}
            onReport={onReport}
          />
        </Suspense>
      </SceneErrorBoundary>
      <ContactShadows
        position={[0, -1.65, 0]}
        opacity={0.45}
        scale={9}
        blur={2.4}
        far={4.2}
        color="#0a0e22"
      />
    </Canvas>
  )
}

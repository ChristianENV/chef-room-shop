'use client'

import {
  Component,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, PerspectiveCamera, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

import {
  isLandingHero3dDebugEnabled,
  isLandingHero3dDebugMaterialEnabled,
  type Hero3DModelLoadState,
} from './hero-3d-debug'
import { HERO_3D_MODEL_URL, type HeroJacketComposition } from './hero-3d-config'

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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
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

function HeroSceneCamera({ composition }: { composition: HeroJacketComposition }) {
  const target = useMemo(
    () => new THREE.Vector3(...composition.cameraTarget),
    [composition.cameraTarget],
  )

  return (
    <PerspectiveCamera
      makeDefault
      position={composition.cameraPosition}
      fov={composition.cameraFov}
      near={0.01}
      far={100}
      onUpdate={(camera) => camera.lookAt(target)}
    />
  )
}

function HeroDragControls({
  composition,
  dragYawRef,
  isDraggingRef,
}: {
  composition: HeroJacketComposition
  dragYawRef: MutableRefObject<number>
  isDraggingRef: MutableRefObject<boolean>
}) {
  const { gl } = useThree()
  const lastXRef = useRef(0)

  useEffect(() => {
    const canvas = gl.domElement

    const onPointerDown = (event: PointerEvent) => {
      isDraggingRef.current = true
      lastXRef.current = event.clientX
      canvas.setPointerCapture(event.pointerId)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) return
      const delta = event.clientX - lastXRef.current
      lastXRef.current = event.clientX
      dragYawRef.current = clamp(
        dragYawRef.current + delta * composition.dragSensitivity,
        -composition.dragRotationLimit,
        composition.dragRotationLimit,
      )
    }

    const onPointerUp = (event: PointerEvent) => {
      isDraggingRef.current = false
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId)
      }
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
    }
  }, [gl, composition.dragRotationLimit, composition.dragSensitivity, dragYawRef, isDraggingRef])

  return null
}

function computeIdleYaw(composition: HeroJacketComposition, elapsedTime: number): number {
  if (composition.idleRotationMode === 'continuous') {
    return composition.idleRotationSpeed * elapsedTime
  }

  return (
    Math.sin(elapsedTime * composition.idleRotationSpeed) * composition.idleRotationAmplitude
  )
}

type HeroJacketModelProps = {
  animate: boolean
  composition: HeroJacketComposition
  showDebugPrimitive: boolean
  onReport: (report: Hero3DSceneReport) => void
  onModelRotationY?: (rotationY: number) => void
}

function HeroJacketModel({
  animate,
  composition,
  showDebugPrimitive,
  onReport,
  onModelRotationY,
}: HeroJacketModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const dragYawRef = useRef(0)
  const isDraggingRef = useRef(false)
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
    if (!group || !animate) return

    if (!isDraggingRef.current) {
      dragYawRef.current = THREE.MathUtils.lerp(
        dragYawRef.current,
        0,
        composition.dragReturnSpeed,
      )
    }

    const idleYaw = isDraggingRef.current
      ? 0
      : computeIdleYaw(composition, state.clock.elapsedTime)

    group.rotation.x = composition.modelRotationX
    group.rotation.y = composition.modelRotationY + idleYaw + dragYawRef.current
    group.position.y =
      composition.modelPosition[1] +
      Math.sin(state.clock.elapsedTime * 0.85) * composition.floatAmplitude

    onModelRotationY?.(group.rotation.y)
  })

  return (
    <>
      {animate ? (
        <HeroDragControls
          composition={composition}
          dragYawRef={dragYawRef}
          isDraggingRef={isDraggingRef}
        />
      ) : null}
      <group
        ref={groupRef}
        name="hero-jacket-group"
        scale={composition.modelScale}
        position={composition.modelPosition}
        rotation={[composition.modelRotationX, composition.modelRotationY, 0]}
      >
      {showDebugPrimitive ? (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.35, 24, 24]} />
          <meshStandardMaterial color="#ff6b6b" emissive="#ff2222" emissiveIntensity={0.35} />
        </mesh>
      ) : null}
      <primitive object={clonedScene} />
      </group>
    </>
  )
}

function HeroSceneLights() {
  return (
    <>
      <ambientLight intensity={0.72} color="#f0f2ff" />
      <directionalLight position={[4, 7, 5]} intensity={1.35} color="#ffffff" />
      <directionalLight position={[-4, 2.5, -3]} intensity={0.45} color="#9aa8ff" />
      <spotLight
        position={[-1.5, 3, -4]}
        angle={0.5}
        penumbra={0.9}
        intensity={1.4}
        color="#5a6fdd"
        distance={16}
      />
      <pointLight position={[1, 1.5, 3]} intensity={0.35} color="#ffffff" />
    </>
  )
}

function HeroDebugHelpers({ enabled }: { enabled: boolean }) {
  if (!enabled) return null
  return (
    <>
      <gridHelper args={[12, 12, '#4455aa', '#223366']} position={[0, -1.5, 0]} />
      <axesHelper args={[1.5]} position={[0, -0.75, 0]} />
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
  composition: HeroJacketComposition
  dpr: number
  showDebugPrimitive: boolean
  onError: (message: string) => void
  onReport: (report: Hero3DSceneReport) => void
  onCameraPosition?: (position: [number, number, number]) => void
  onModelRotationY?: (rotationY: number) => void
  onMounted?: () => void
  className?: string
}

export function Hero3DSceneCanvas({
  animate,
  composition,
  dpr,
  showDebugPrimitive,
  onError,
  onReport,
  onCameraPosition,
  onModelRotationY,
  onMounted,
  className,
}: Hero3DSceneCanvasProps) {
  const debugEnabled = isLandingHero3dDebugEnabled()

  return (
    <Canvas
      className={className}
      dpr={dpr}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      }}
      shadows={false}
      onCreated={({ gl, scene: threeScene }) => {
        gl.setClearColor(0x000000, 0)
        threeScene.background = null
        onMounted?.()
      }}
      data-testid="landing-hero-3d-canvas"
    >
      <HeroSceneCamera composition={composition} />
      <HeroSceneLights />
      <HeroDebugHelpers enabled={debugEnabled} />
      <CameraReporter onCamera={onCameraPosition ?? (() => undefined)} />
      <SceneErrorBoundary onError={onError}>
        <Suspense fallback={null}>
          <HeroJacketModel
            animate={animate}
            composition={composition}
            showDebugPrimitive={showDebugPrimitive && debugEnabled}
            onReport={onReport}
            onModelRotationY={onModelRotationY}
          />
        </Suspense>
      </SceneErrorBoundary>
      <ContactShadows
        position={[0, composition.pedestalShadowY, 0]}
        opacity={0.38}
        scale={8.5}
        blur={2.6}
        far={4}
        color="#060a18"
      />
    </Canvas>
  )
}

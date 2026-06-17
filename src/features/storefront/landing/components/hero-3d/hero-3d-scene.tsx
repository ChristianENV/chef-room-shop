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
  type MutableRefObject,
  type ReactNode,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, PerspectiveCamera, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

import {
  hero3dLog,
  isLandingHero3dDebugEnabled,
  isLandingHero3dDebugMaterialEnabled,
  type HeroAssetLoadState,
  type HeroBoundsFitState,
  type HeroModelPreparedState,
  type Hero3DModelLoadState,
} from './hero-3d-debug'
import {
  HERO_3D_MODEL_URL,
  HERO_FALLBACK_CAMERA,
  type HeroJacketComposition,
} from './hero-3d-config'
import {
  getCanvasFitKey,
  getCompositionFitKey,
  vectorsNearlyEqual,
} from './hero-3d-fit-key'
import {
  computeObjectBounds,
  fitObjectToPerspectiveCamera,
  type HeroFramingFitResult,
} from './hero-3d-framing'
import {
  applyHeroDebugMaterials,
  inspectHeroMeshes,
  isHeroBoundsValid,
  prepareHeroVisibleMaterials,
} from './hero-3d-materials'
import { HeroVisibilityDebug } from './hero-3d-visibility-debug'

useGLTF.preload(HERO_3D_MODEL_URL)

const MAX_BOUNDS_FIT_ATTEMPTS = 24
const MIN_FIT_DISTANCE = 0.05

export type Hero3DSceneReport = {
  assetLoadState: HeroAssetLoadState
  modelPreparedState: HeroModelPreparedState
  boundsFitState: HeroBoundsFitState
  hero3dReady: boolean
  modelLoadState: Hero3DModelLoadState
  meshCount: number
  boundsSize: [number, number, number] | null
  boundsCenter: [number, number, number] | null
  radius: number | null
  cameraPosition: [number, number, number] | null
  fittedCameraDistance: number | null
  paddingRatio: number | null
  fitCalculationCount?: number
  cameraUpdateCount?: number
  modelCloneCount?: number
  errorMessage?: string | null
  lastError?: string | null
  visibleMeshCount?: number
  materialNames?: string[]
  materialOpacities?: number[]
  materialTransparentFlags?: boolean[]
  boundsMin?: [number, number, number] | null
  boundsMax?: [number, number, number] | null
  cameraTarget?: [number, number, number] | null
}

export type HeroModelLocalBounds = {
  minY: number
  maxY: number
  height: number
  center: THREE.Vector3
  size: THREE.Vector3
  bottomOffset: number
}

const heroSceneDebugMetrics = {
  fitCalculationCount: 0,
  cameraUpdateCount: 0,
  modelCloneCount: 0,
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function countMeshes(root: THREE.Object3D): number {
  let count = 0
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) count += 1
  })
  return count
}

function getLocalModelBounds(root: THREE.Object3D): HeroModelLocalBounds {
  const bounds = computeObjectBounds(root)
  return {
    minY: bounds.min.y,
    maxY: bounds.max.y,
    height: bounds.size.y,
    center: bounds.center,
    size: bounds.size,
    bottomOffset: -bounds.min.y,
  }
}

function computeIdleYaw(composition: HeroJacketComposition, elapsedTime: number): number {
  if (composition.idleRotationMode === 'continuous') {
    return composition.idleRotationSpeed * elapsedTime
  }

  return (
    Math.sin(elapsedTime * composition.idleRotationSpeed) * composition.idleRotationAmplitude
  )
}

type FittedCameraState = {
  position: [number, number, number]
  target: [number, number, number]
  fov: number
}

function fitResultToCameraState(
  result: HeroFramingFitResult,
  fov: number,
): FittedCameraState {
  return {
    position: result.position.toArray() as [number, number, number],
    target: result.target.toArray() as [number, number, number],
    fov,
  }
}

function cameraStateNearlyEqual(a: FittedCameraState, b: FittedCameraState): boolean {
  return (
    vectorsNearlyEqual(a.position, b.position) &&
    vectorsNearlyEqual(a.target, b.target) &&
    a.fov === b.fov
  )
}

function createFallbackCameraState(fov: number = HERO_FALLBACK_CAMERA.fov): FittedCameraState {
  return {
    position: [...HERO_FALLBACK_CAMERA.position] as [number, number, number],
    target: [...HERO_FALLBACK_CAMERA.target] as [number, number, number],
    fov,
  }
}

function HeroBoundsFitCamera({
  fitRootRef,
  composition,
  onFitSuccess,
  onFitFailure,
}: {
  fitRootRef: MutableRefObject<THREE.Group | null>
  composition: HeroJacketComposition
  onFitSuccess: (result: HeroFramingFitResult) => void
  onFitFailure: (message: string) => void
}) {
  const { size } = useThree()
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const [fittedCamera, setFittedCamera] = useState<FittedCameraState>(() =>
    createFallbackCameraState(composition.cameraFov),
  )
  const appliedFitKeyRef = useRef<string | null>(null)
  const fitAttemptsRef = useRef(0)
  const compositionFitKey = getCompositionFitKey(composition)
  const canvasFitKey = getCanvasFitKey(size.width, size.height)

  useLayoutEffect(() => {
    const fitKey = `${canvasFitKey}|${compositionFitKey}`
    if (appliedFitKeyRef.current === fitKey) return
    if (size.width <= 0 || size.height <= 0) return

    let cancelled = false
    fitAttemptsRef.current = 0

    const tryFit = () => {
      if (cancelled || appliedFitKeyRef.current === fitKey) return

      const group = fitRootRef.current
      if (!group) {
        fitAttemptsRef.current += 1
        if (fitAttemptsRef.current < MAX_BOUNDS_FIT_ATTEMPTS) {
          requestAnimationFrame(tryFit)
        }
        return
      }

      group.updateWorldMatrix(true, true)
      const bounds = computeObjectBounds(group)
      if (!isHeroBoundsValid(bounds)) {
        fitAttemptsRef.current += 1
        if (fitAttemptsRef.current < MAX_BOUNDS_FIT_ATTEMPTS) {
          requestAnimationFrame(tryFit)
        }
        return
      }

      const aspect = size.width / Math.max(size.height, 1)
      const fitCamera = new THREE.PerspectiveCamera(composition.cameraFov, aspect, 0.01, 100)

      try {
        const viewDirection = new THREE.Vector3(...composition.cameraViewDirection)
        const result = fitObjectToPerspectiveCamera(group, fitCamera, viewDirection, {
          paddingRatio: composition.paddingRatio,
          fitMode: composition.fitMode,
          verticalBias: composition.verticalBias,
          rotationFitPadding: composition.rotationFitPadding,
          targetTorsoRatio: composition.targetTorsoRatio,
          preserveAspect: true,
          idleRotationAmplitude: composition.idleRotationAmplitude,
          dragRotationLimit: composition.dragRotationLimit,
        })

        if (!Number.isFinite(result.distance) || result.distance < MIN_FIT_DISTANCE) {
          throw new Error(`Invalid fit distance (${result.distance})`)
        }

        heroSceneDebugMetrics.fitCalculationCount += 1
        appliedFitKeyRef.current = fitKey

        const nextCamera = fitResultToCameraState(result, composition.cameraFov)
        setFittedCamera((previous) => {
          if (previous && cameraStateNearlyEqual(previous, nextCamera)) return previous
          heroSceneDebugMetrics.cameraUpdateCount += 1
          return nextCamera
        })

        hero3dLog(
          `camera fit success distance=${result.distance.toFixed(2)} target=${result.target.y.toFixed(2)}`,
        )
        onFitSuccess(result)
      } catch (error) {
        fitAttemptsRef.current += 1
        if (fitAttemptsRef.current < MAX_BOUNDS_FIT_ATTEMPTS) {
          requestAnimationFrame(tryFit)
          return
        }

        appliedFitKeyRef.current = fitKey
        const message = error instanceof Error ? error.message : 'Camera fit failed'
        hero3dLog(`camera fit failed: ${message}`)
        setFittedCamera((previous) => {
          const fallback = createFallbackCameraState(composition.cameraFov)
          if (cameraStateNearlyEqual(previous, fallback)) return previous
          heroSceneDebugMetrics.cameraUpdateCount += 1
          return fallback
        })
        onFitFailure(message)
      }
    }

    tryFit()

    return () => {
      cancelled = true
    }
  }, [
    fitRootRef,
    canvasFitKey,
    compositionFitKey,
    composition,
    onFitFailure,
    onFitSuccess,
    size.height,
    size.width,
  ])

  useLayoutEffect(() => {
    const camera = cameraRef.current
    if (!camera) return
    camera.position.set(...fittedCamera.position)
    camera.fov = fittedCamera.fov
    camera.aspect = size.width / Math.max(size.height, 1)
    camera.near = 0.01
    camera.far = 100
    camera.lookAt(...fittedCamera.target)
    camera.updateProjectionMatrix()
  }, [fittedCamera, size.height, size.width])

  return <PerspectiveCamera ref={cameraRef} makeDefault />
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

function buildVisibilityReport(root: THREE.Object3D): Pick<
  Hero3DSceneReport,
  | 'visibleMeshCount'
  | 'materialNames'
  | 'materialOpacities'
  | 'materialTransparentFlags'
  | 'boundsMin'
  | 'boundsMax'
> {
  const inspection = inspectHeroMeshes(root)
  return {
    visibleMeshCount: inspection.visibleMeshCount,
    materialNames: inspection.materialNames,
    materialOpacities: inspection.materialOpacities,
    materialTransparentFlags: inspection.materialTransparentFlags,
    boundsMin: inspection.boundsMin,
    boundsMax: inspection.boundsMax,
  }
}

function HeroFramingDebug({
  fitResult,
  enabled,
}: {
  fitResult: HeroFramingFitResult | null
  enabled: boolean
}) {
  if (!enabled || !fitResult) return null

  const { bounds, target } = fitResult
  const torsoY = bounds.min.y + bounds.size.y * 0.52

  return (
    <group name="hero-framing-debug">
      <mesh position={[bounds.center.x, bounds.center.y, bounds.center.z]}>
        <boxGeometry args={[bounds.size.x, bounds.size.y, bounds.size.z]} />
        <meshBasicMaterial color="#44ff88" wireframe transparent opacity={0.85} />
      </mesh>
      <mesh position={[bounds.center.x, bounds.min.y, bounds.center.z]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial color="#22ff66" />
      </mesh>
      <mesh position={[bounds.center.x, torsoY, bounds.center.z]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial color="#ffcc22" />
      </mesh>
      <mesh position={[bounds.center.x, bounds.max.y, bounds.center.z]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial color="#ff4466" />
      </mesh>
      <mesh position={[target.x, target.y, target.z]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#66ccff" />
      </mesh>
    </group>
  )
}

type HeroJacketSceneContentProps = {
  animate: boolean
  composition: HeroJacketComposition
  showDebugFraming: boolean
  onReport: (report: Hero3DSceneReport) => void
  onModelRotationY?: (rotationY: number) => void
  onPedestalYChange: (y: number) => void
}

function HeroJacketSceneContent({
  animate,
  composition,
  showDebugFraming,
  onReport,
  onModelRotationY,
  onPedestalYChange,
}: HeroJacketSceneContentProps) {
  const fitRootRef = useRef<THREE.Group>(null)
  const animatedGroupRef = useRef<THREE.Group>(null)
  const dragYawRef = useRef(0)
  const isDraggingRef = useRef(false)
  const frozenIdleYawRef = useRef(0)
  const modelPreparedReportedRef = useRef(false)
  const pedestalSetRef = useRef(false)
  const debugFitSetRef = useRef(false)
  const gltfLoadedReportedRef = useRef(false)
  const [debugFitResult, setDebugFitResult] = useState<HeroFramingFitResult | null>(null)
  const [debugModelBounds, setDebugModelBounds] = useState<{
    min: THREE.Vector3
    max: THREE.Vector3
    center: THREE.Vector3
    size: THREE.Vector3
  } | null>(null)
  const { scene } = useGLTF(HERO_3D_MODEL_URL)

  useEffect(() => {
    if (gltfLoadedReportedRef.current) return
    gltfLoadedReportedRef.current = true
    hero3dLog('loading gltf')
    hero3dLog('gltf loaded')
    onReport({
      assetLoadState: 'loaded',
      modelPreparedState: 'preparing',
      boundsFitState: 'idle',
      hero3dReady: false,
      modelLoadState: 'loading',
      meshCount: 0,
      boundsSize: null,
      boundsCenter: null,
      radius: null,
      cameraPosition: null,
      fittedCameraDistance: null,
      paddingRatio: null,
    })
  }, [onReport])

  const preparedModel = useMemo(() => {
    const clone = scene.clone(true)
    if (isLandingHero3dDebugMaterialEnabled()) {
      applyHeroDebugMaterials(clone)
    } else {
      prepareHeroVisibleMaterials(clone)
    }
    return clone
  }, [scene])

  const cloneCountedRef = useRef(false)
  useEffect(() => {
    if (cloneCountedRef.current) return
    cloneCountedRef.current = true
    heroSceneDebugMetrics.modelCloneCount += 1
  }, [preparedModel])

  const localBounds = useMemo(
    () => getLocalModelBounds(preparedModel),
    [preparedModel],
  )

  useEffect(() => {
    const meshCount = countMeshes(preparedModel)
    hero3dLog(`prepared clone meshCount=${meshCount}`)

    if (meshCount === 0) {
      if (modelPreparedReportedRef.current) return
      onReport({
        assetLoadState: 'loaded',
        modelPreparedState: 'error',
        boundsFitState: 'idle',
        hero3dReady: false,
        modelLoadState: 'error',
        meshCount: 0,
        boundsSize: null,
        boundsCenter: null,
        radius: null,
        cameraPosition: null,
        fittedCameraDistance: null,
        paddingRatio: null,
        fitCalculationCount: heroSceneDebugMetrics.fitCalculationCount,
        cameraUpdateCount: heroSceneDebugMetrics.cameraUpdateCount,
        modelCloneCount: heroSceneDebugMetrics.modelCloneCount,
        errorMessage: 'GLTF loaded but meshCount is 0',
        lastError: 'GLTF loaded but meshCount is 0',
      })
      return
    }

    if (modelPreparedReportedRef.current) return
    modelPreparedReportedRef.current = true

    const bounds = computeObjectBounds(preparedModel)
    const visibility = buildVisibilityReport(preparedModel)
    hero3dLog(
      `bounds computed size=${bounds.size.x.toFixed(2)}x${bounds.size.y.toFixed(2)}x${bounds.size.z.toFixed(2)}`,
    )
    hero3dLog('ready')

    onReport({
      assetLoadState: 'loaded',
      modelPreparedState: 'prepared',
      boundsFitState: 'fitting',
      hero3dReady: true,
      modelLoadState: 'loaded',
      meshCount,
      boundsSize: bounds.size.toArray() as [number, number, number],
      boundsCenter: bounds.center.toArray() as [number, number, number],
      radius: Math.max(bounds.size.x, bounds.size.y, bounds.size.z) * 0.5,
      cameraPosition: null,
      fittedCameraDistance: null,
      paddingRatio: composition.paddingRatio,
      fitCalculationCount: heroSceneDebugMetrics.fitCalculationCount,
      cameraUpdateCount: heroSceneDebugMetrics.cameraUpdateCount,
      modelCloneCount: heroSceneDebugMetrics.modelCloneCount,
      ...visibility,
    })
  }, [composition.paddingRatio, onReport, preparedModel])

  const handleFitSuccess = useCallback(
    (result: HeroFramingFitResult) => {
      if (showDebugFraming) {
        if (!debugFitSetRef.current) {
          debugFitSetRef.current = true
          setDebugFitResult(result)
        }
        setDebugModelBounds({
          min: result.bounds.min.clone(),
          max: result.bounds.max.clone(),
          center: result.bounds.center.clone(),
          size: result.bounds.size.clone(),
        })
      }

      const group = fitRootRef.current
      if (group && !pedestalSetRef.current) {
        const worldBounds = computeObjectBounds(group)
        const worldMin = worldBounds.min.clone()
        group.localToWorld(worldMin)
        pedestalSetRef.current = true
        onPedestalYChange(worldMin.y)
      }

      onReport({
        assetLoadState: 'loaded',
        modelPreparedState: 'prepared',
        boundsFitState: 'fitted',
        hero3dReady: true,
        modelLoadState: 'loaded',
        meshCount: countMeshes(preparedModel),
        boundsSize: result.bounds.size.toArray() as [number, number, number],
        boundsCenter: result.bounds.center.toArray() as [number, number, number],
        radius: Math.max(result.bounds.size.x, result.bounds.size.y, result.bounds.size.z) * 0.5,
        cameraPosition: result.position.toArray() as [number, number, number],
        cameraTarget: result.target.toArray() as [number, number, number],
        fittedCameraDistance: result.distance,
        paddingRatio: composition.paddingRatio,
        fitCalculationCount: heroSceneDebugMetrics.fitCalculationCount,
        cameraUpdateCount: heroSceneDebugMetrics.cameraUpdateCount,
        modelCloneCount: heroSceneDebugMetrics.modelCloneCount,
        ...buildVisibilityReport(preparedModel),
      })
    },
    [composition.paddingRatio, onPedestalYChange, onReport, preparedModel, showDebugFraming],
  )

  const handleFitFailure = useCallback(
    (message: string) => {
      onReport({
        assetLoadState: 'loaded',
        modelPreparedState: 'prepared',
        boundsFitState: 'fallback',
        hero3dReady: true,
        modelLoadState: 'loaded',
        meshCount: countMeshes(preparedModel),
        boundsSize: null,
        boundsCenter: null,
        radius: null,
        cameraPosition: [...HERO_FALLBACK_CAMERA.position],
        cameraTarget: [...HERO_FALLBACK_CAMERA.target],
        fittedCameraDistance: null,
        paddingRatio: composition.paddingRatio,
        fitCalculationCount: heroSceneDebugMetrics.fitCalculationCount,
        cameraUpdateCount: heroSceneDebugMetrics.cameraUpdateCount,
        modelCloneCount: heroSceneDebugMetrics.modelCloneCount,
        lastError: message,
        ...buildVisibilityReport(preparedModel),
      })
    },
    [composition.paddingRatio, onReport, preparedModel],
  )

  useFrame((state) => {
    const animatedGroup = animatedGroupRef.current
    if (!animatedGroup || !animate) return

    if (!isDraggingRef.current) {
      dragYawRef.current = THREE.MathUtils.lerp(
        dragYawRef.current,
        0,
        composition.dragReturnSpeed,
      )
    }

    const idleYaw = isDraggingRef.current
      ? frozenIdleYawRef.current
      : computeIdleYaw(composition, state.clock.elapsedTime)

    if (!isDraggingRef.current) {
      frozenIdleYawRef.current = idleYaw
    }

    animatedGroup.rotation.y = idleYaw + dragYawRef.current

    const floatY = Math.sin(state.clock.elapsedTime * 0.85) * composition.floatAmplitude
    const fitRoot = fitRootRef.current
    if (fitRoot) {
      fitRoot.position.set(
        composition.modelPosition[0],
        composition.modelPosition[1] + floatY,
        composition.modelPosition[2],
      )
    }

    onModelRotationY?.(composition.modelRotationY + animatedGroup.rotation.y)
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
        ref={fitRootRef}
        name="hero-jacket-fit-root"
        position={composition.modelPosition}
      >
        <group
          ref={animatedGroupRef}
          name="hero-jacket-animated"
        >
          <group
            rotation={[composition.modelRotationX, composition.modelRotationY, 0]}
            name="hero-jacket-base-pose"
          >
            <group scale={composition.modelScale}>
              <group name="hero-jacket-bottom-anchor">
                <primitive
                  object={preparedModel}
                  position={[0, localBounds.bottomOffset, 0]}
                />
              </group>
            </group>
          </group>
        </group>
      </group>
      <HeroBoundsFitCamera
        fitRootRef={fitRootRef}
        composition={composition}
        onFitSuccess={handleFitSuccess}
        onFitFailure={handleFitFailure}
      />
      <HeroVisibilityDebug
        enabled={showDebugFraming}
        fitResult={debugFitResult}
        modelBounds={debugModelBounds}
      />
      <HeroFramingDebug fitResult={debugFitResult} enabled={showDebugFraming} />
    </>
  )
}

function HeroSceneLights() {
  return (
    <>
      <ambientLight intensity={0.68} color="#eef1ff" />
      <directionalLight position={[4, 7, 5]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-4, 2.5, -3]} intensity={0.5} color="#9aa8ff" />
      <directionalLight position={[-3.5, 2.8, -4.5]} intensity={0.62} color="#7d93ff" />
      <spotLight
        position={[-1.5, 3, -4]}
        angle={0.5}
        penumbra={0.9}
        intensity={1.35}
        color="#5a6fdd"
        distance={16}
      />
      <pointLight position={[1, 1.5, 3]} intensity={0.38} color="#ffffff" />
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
  onError: (message: string) => void
  onReport: (report: Hero3DSceneReport) => void
  onModelRotationY?: (rotationY: number) => void
  onMounted?: () => void
  className?: string
}

export function Hero3DSceneCanvas({
  animate,
  composition,
  dpr,
  onError,
  onReport,
  onModelRotationY,
  onMounted,
  className,
}: Hero3DSceneCanvasProps) {
  const debugEnabled = isLandingHero3dDebugEnabled()
  const pedestalYRef = useRef(-2.5)
  const [pedestalShadowY, setPedestalShadowY] = useState(-2.5)

  const handlePedestalYChange = useCallback((y: number) => {
    if (Math.abs(y - pedestalYRef.current) < 0.001) return
    pedestalYRef.current = y
    setPedestalShadowY(y)
  }, [])

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
      <HeroSceneLights />
      <HeroDebugHelpers enabled={debugEnabled} />
      <SceneErrorBoundary onError={onError}>
        <Suspense fallback={null}>
          <HeroJacketSceneContent
            animate={animate}
            composition={composition}
            showDebugFraming={debugEnabled}
            onReport={onReport}
            onModelRotationY={onModelRotationY}
            onPedestalYChange={handlePedestalYChange}
          />
        </Suspense>
      </SceneErrorBoundary>
      <ContactShadows
        position={[0, pedestalShadowY, 0]}
        opacity={0.38}
        scale={8.5}
        blur={2.6}
        far={4}
        color="#060a18"
      />
    </Canvas>
  )
}

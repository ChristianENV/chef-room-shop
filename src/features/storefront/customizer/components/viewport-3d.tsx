'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Float,
  Html,
  OrbitControls,
  RoundedBox,
} from '@react-three/drei'
import * as THREE from 'three'
import { useCustomizerStore } from '../store/customizer.store'
import { getCustomizerModelForProduct } from '../3d/model-registry'
import { GarmentModelLoader } from '../3d/garment-model'
import { ModelCameraRig, type ModelReadyPayload } from '../3d/model-camera-rig'
import { Customizer3dDebugHud, type Customizer3dDebugSnapshot } from '../3d/customizer-3d-debug-hud'
import { ChefJacketSmokeViewport } from '../3d/chef-jacket-smoke-scene'
import {
  isCustomizer3dSafeModeEnabled,
  isCustomizerContactShadowsDisabled,
  isCustomizerEnvironmentDisabled,
  isCustomizerForceDebugMaterialEnabled,
} from '../3d/customizer-3d-flags'
import { useIsAdminUser } from '@/src/features/storefront/hooks/use-is-admin-user'
import { resolveModelSourceInfo } from '../3d/model-source'
import { toSameOriginR2Url } from '@/src/lib/assets/same-origin-r2-url'
import { ViewportCaptureBridge, type ViewportCaptureHandle } from './viewport-capture-bridge'
import { ViewportElementOverlay } from './viewport-element-overlay'

/** Shown inside the <Canvas> while the GLB is downloading. */
function GlbLoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p className="text-xs text-white/60">Cargando modelo 3D…</p>
      </div>
    </Html>
  )
}

function JacketModel() {
  const ref = useRef<THREE.Group>(null)
  const { baseColor, detailColor, viewAngle, sleeveStyle, captureInstant } = useCustomizerStore()

  useFrame(() => {
    if (!ref.current) return
    const target = viewAngle === 'back' ? Math.PI : 0
    if (captureInstant) {
      ref.current.rotation.y = target
      return
    }
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, target, 0.06)
  })

  const baseMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.75, metalness: 0.02 }),
    [baseColor],
  )
  const detailMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: detailColor, roughness: 0.6, metalness: 0.08 }),
    [detailColor],
  )

  const sleeveLength = sleeveStyle === 'corta' ? 0.3 : sleeveStyle === '3/4' ? 0.5 : 0.7

  return (
    <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.25}>
      <group ref={ref} position={[0, 0.1, 0]} scale={0.85}>
        <RoundedBox args={[1.15, 1.5, 0.45]} radius={0.08} smoothness={4}>
          <primitive object={baseMaterial} attach="material" />
        </RoundedBox>
        <RoundedBox
          args={[0.55, 0.18, 0.38]}
          radius={0.04}
          smoothness={4}
          position={[0, 0.82, 0.02]}
        >
          <primitive object={detailMaterial} attach="material" />
        </RoundedBox>
        <group position={[-0.7, 0.4, 0]} rotation={[0, 0, 0.35]}>
          <RoundedBox
            args={[sleeveLength, 0.38, 0.38]}
            radius={0.06}
            smoothness={4}
            position={[-sleeveLength / 2 + 0.1, 0, 0]}
          >
            <primitive object={baseMaterial} attach="material" />
          </RoundedBox>
        </group>
        <group position={[0.7, 0.4, 0]} rotation={[0, 0, -0.35]}>
          <RoundedBox
            args={[sleeveLength, 0.38, 0.38]}
            radius={0.06}
            smoothness={4}
            position={[sleeveLength / 2 - 0.1, 0, 0]}
          >
            <primitive object={baseMaterial} attach="material" />
          </RoundedBox>
        </group>
      </group>
    </Float>
  )
}

const INITIAL_DEBUG_SNAPSHOT: Customizer3dDebugSnapshot = {
  phase: 'idle',
  modelUrl: null,
  modelSource: null,
  productSlug: null,
  registryKey: null,
  usingLocalFallback: null,
  meshCount: null,
  visibleMeshCount: null,
  materialNames: null,
  materialTypes: null,
  firstMeshVisible: null,
  firstMeshMaterial: null,
  firstMeshWorldPosition: null,
  firstMeshWorldScale: null,
  forceDebugMaterial: false,
  debugMaterialAppliedMeshCount: null,
  appliedTransform: null,
  bounds: null,
  fitKey: null,
  canvasSize: null,
  cameraPosition: null,
  controlsTarget: null,
  lastError: null,
  fitAttempts: 0,
}

type GarmentSceneProps = {
  onGlbActive: (active: boolean) => void
  onModelReady: (payload: ModelReadyPayload) => void
  onModelError: (error: Error) => void
  onDebugUpdate: (patch: Partial<Customizer3dDebugSnapshot>) => void
  forceDebugMaterial: boolean
}

function GarmentScene({
  onGlbActive,
  onModelReady,
  onModelError,
  onDebugUpdate,
  forceDebugMaterial,
}: GarmentSceneProps) {
  const { product, baseColor, detailColor, sleeveStyle, layers } = useCustomizerStore()
  const modelConfig = useMemo(() => getCustomizerModelForProduct(product), [product])

  useEffect(() => {
    if (!modelConfig) {
      onDebugUpdate({ phase: 'procedural', modelUrl: null })
      return
    }
    const source = resolveModelSourceInfo(modelConfig.modelUrl)
    onDebugUpdate({
      phase: 'loading',
      modelUrl: source.modelUrl,
      modelSource: source.modelSource,
      usingLocalFallback: source.usingLocalFallback,
      productSlug: product?.slug ?? product?.productTypeSlug ?? null,
      registryKey: modelConfig.registryKey,
      forceDebugMaterial,
      appliedTransform: {
        scale: modelConfig.scale,
        position: modelConfig.position,
        rotation: modelConfig.rotation,
      },
      lastError: null,
    })
  }, [forceDebugMaterial, modelConfig, onDebugUpdate, product?.productTypeSlug, product?.slug])

  const handleModelLoaded = useCallback(() => {
    onGlbActive(true)
  }, [onGlbActive])

  const handleModelReady = useCallback(
    (payload: ModelReadyPayload) => {
      onGlbActive(true)
      onModelReady(payload)
    },
    [onGlbActive, onModelReady],
  )

  const handleModelError = useCallback(
    (error: Error) => {
      onGlbActive(false)
      onModelError(error)
      onDebugUpdate({ phase: 'error', lastError: error.message })
    },
    [onDebugUpdate, onGlbActive, onModelError],
  )

  if (!modelConfig) {
    return <JacketModel />
  }

  return (
    <GarmentModelLoader
      modelConfig={modelConfig}
      productSlug={product?.slug ?? product?.productTypeSlug ?? null}
      baseColor={baseColor}
      detailColor={detailColor}
      sleeveStyle={sleeveStyle}
      layers={layers}
      suspenseFallback={<GlbLoadingFallback />}
      errorFallback={<JacketModel />}
      onModelLoaded={handleModelLoaded}
      onModelReady={handleModelReady}
      onModelError={handleModelError}
      onDebugUpdate={onDebugUpdate}
      forceDebugMaterial={forceDebugMaterial}
    />
  )
}

type Viewport3DProps = {
  captureRef?: RefObject<ViewportCaptureHandle | null>
}

const Viewport3D = forwardRef<ViewportCaptureHandle, Viewport3DProps>(function Viewport3D(
  { captureRef: externalCaptureRef },
  ref,
) {
  const { viewMode, product, show3dDebugHud, setShow3dDebugHud } = useCustomizerStore()
  const isAdmin = useIsAdminUser()
  const internalCaptureRef = useRef<ViewportCaptureHandle>(null)
  const viewportRootRef = useRef<HTMLDivElement>(null)
  const [glbActive, setGlbActive] = useState(false)
  const [modelReady, setModelReady] = useState<ModelReadyPayload | null>(null)
  const [remoteModelFailed, setRemoteModelFailed] = useState(false)
  const [debugSnapshot, setDebugSnapshot] =
    useState<Customizer3dDebugSnapshot>(INITIAL_DEBUG_SNAPSHOT)
  const [forceDebugMaterial, setForceDebugMaterial] = useState(() =>
    isCustomizerForceDebugMaterialEnabled(),
  )
  const [safeRender, setSafeRender] = useState(() => isCustomizer3dSafeModeEnabled())
  const [cameraResetToken, setCameraResetToken] = useState(0)
  const prevViewModeRef = useRef(viewMode)
  const prevProductIdRef = useRef(product?.id)
  const heroImageRaw =
    product?.images.find((image) => image.isPrimary)?.url ?? product?.images[0]?.url ?? null
  const heroImage = heroImageRaw ? (toSameOriginR2Url(heroImageRaw) ?? heroImageRaw) : null

  useEffect(() => {
    const entering3D = prevViewModeRef.current !== '3D' && viewMode === '3D'
    const productChanged = prevProductIdRef.current !== product?.id
    prevViewModeRef.current = viewMode
    prevProductIdRef.current = product?.id

    if (viewMode === '3D' && (entering3D || productChanged)) {
      setGlbActive(false)
      setModelReady(null)
      setRemoteModelFailed(false)
      setDebugSnapshot(INITIAL_DEBUG_SNAPSHOT)
    }
  }, [viewMode, product?.id])

  const handleDebugUpdate = useCallback((patch: Partial<Customizer3dDebugSnapshot>) => {
    setDebugSnapshot((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleModelError = useCallback((error: Error) => {
    setGlbActive(false)
    setModelReady(null)
    setRemoteModelFailed(true)
    setDebugSnapshot((prev) => ({
      ...prev,
      phase: 'error',
      lastError: error.message,
    }))
    if (process.env.NEXT_PUBLIC_CUSTOMIZER_DEBUG_3D === 'true') {
      console.info('[customizer-3d] model-load-failed', { message: error.message })
    }
  }, [])

  const handleCameraFit = useCallback(
    (payload: {
      cameraPosition: [number, number, number]
      controlsTarget: [number, number, number]
      canvasSize: { width: number; height: number }
    }) => {
      setDebugSnapshot((prev) => ({
        ...prev,
        phase: 'camera-fit',
        cameraPosition: payload.cameraPosition,
        controlsTarget: payload.controlsTarget,
        canvasSize: payload.canvasSize,
      }))
    },
    [],
  )

  useImperativeHandle(ref, () => ({
    captureDesignPreviews: async () => {
      const bridge = externalCaptureRef?.current ?? internalCaptureRef.current
      if (!bridge) return null
      return bridge.captureDesignPreviews()
    },
  }))

  if (viewMode === '3D' && safeRender) {
    return (
      <div
        ref={viewportRootRef}
        data-testid="customizer-3d-viewport"
        data-safe-mode="true"
        className="relative h-full w-full bg-gradient-to-br from-[#080810] via-[#0c0c18] to-[#080810] p-2"
      >
        <div className="pointer-events-none absolute left-3 top-3 z-30 rounded bg-amber-500/20 px-2 py-1 text-xs text-amber-100">
          3D safe mode — escena mínima sin overlays/fit/decals
        </div>
        <ChefJacketSmokeViewport
          className="h-full w-full"
          canvasTestId="customizer-3d-safe-canvas"
        />
      </div>
    )
  }

  if (viewMode !== '3D') {
    return (
      <div
        ref={viewportRootRef}
        data-testid="customizer-2d-viewport"
        className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[#080810] via-[#0c0c18] to-[#080810]"
      >
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt={product?.name ?? 'Producto'}
            crossOrigin="anonymous"
            className="absolute inset-0 h-full w-full object-contain opacity-40"
          />
        ) : null}
        <ViewportElementOverlay />
        <div className="customizer-glass relative z-20 flex max-w-sm items-center gap-3 rounded-xl px-6 py-4 text-center text-sm text-muted-foreground">
          <span>Vista 2D con overlay de elementos. Usa 3D para vistas previas al guardar.</span>
        </div>
      </div>
    )
  }

  const disableEnvironment = isCustomizerEnvironmentDisabled()
  const disableContactShadows = isCustomizerContactShadowsDisabled()

  return (
    <div
      ref={viewportRootRef}
      data-testid="customizer-3d-viewport"
      className="customizer-viewport-bg relative h-full w-full"
    >
      {isAdmin && show3dDebugHud ? (
        <Customizer3dDebugHud
          visible
          snapshot={debugSnapshot}
          onHide={() => setShow3dDebugHud(false)}
          onToggleDebugMaterial={() => setForceDebugMaterial((value) => !value)}
          onToggleSafeRender={() => setSafeRender((value) => !value)}
          onResetCamera={() => {
            setModelReady(null)
            setCameraResetToken((value) => value + 1)
          }}
          safeRenderActive={safeRender}
        />
      ) : null}
      {!glbActive ? (
        <div className="pointer-events-none absolute inset-0 z-[15] flex items-end justify-center pb-6">
          <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/70 backdrop-blur-sm">
            Cargando modelo 3D…
          </div>
        </div>
      ) : null}
      {!glbActive && <ViewportElementOverlay />}
      {remoteModelFailed ? (
        <div
          data-testid="customizer-3d-load-error"
          className="pointer-events-none absolute bottom-4 left-1/2 z-30 max-w-md -translate-x-1/2 rounded-xl border border-amber-500/30 bg-amber-950/80 px-4 py-3 text-center text-sm text-amber-100 shadow-lg backdrop-blur-sm"
        >
          Hubo un problema cargando el modelo 3D. Puedes seguir diseñando en 2D mientras lo
          revisamos.
        </div>
      ) : null}
      <Canvas
        key={cameraResetToken}
        camera={{ position: [0, 0.3, 3.2], fov: 32, near: 0.01, far: 100 }}
        className="relative z-10"
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
        resize={{ debounce: 0, scroll: false }}
      >
        <ViewportCaptureBridge ref={internalCaptureRef} viewportRootRef={viewportRootRef} />
        <ambientLight intensity={1.0} />
        <hemisphereLight intensity={0.55} color="#ffffff" groundColor="#d4cfc4" />
        <directionalLight position={[5, 8, 5]} intensity={1.1} />
        <directionalLight position={[-3, 4, -2]} intensity={0.35} />
        <GarmentScene
          onGlbActive={setGlbActive}
          onModelReady={setModelReady}
          onModelError={handleModelError}
          onDebugUpdate={handleDebugUpdate}
          forceDebugMaterial={forceDebugMaterial}
        />
        <ModelCameraRig modelReady={modelReady} onCameraFit={handleCameraFit} />
        {!disableContactShadows ? (
          <ContactShadows position={[0, -0.85, 0]} opacity={0.25} scale={4} blur={2} far={3} />
        ) : null}
        {!disableEnvironment && modelReady?.bounds.valid ? (
          <Environment preset="studio" environmentIntensity={0.25} />
        ) : null}
        <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  )
})

export default Viewport3D
export type { ViewportCaptureHandle }

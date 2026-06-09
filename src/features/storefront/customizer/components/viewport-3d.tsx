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
import { ContactShadows, Environment, Float, Html, OrbitControls, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useCustomizerStore } from '../store/customizer.store'
import { getCustomizerModelForProduct } from '../3d/model-registry'
import { GarmentModelLoader } from '../3d/garment-model'
import { ModelCameraRig, type ModelReadyPayload } from '../3d/model-camera-rig'
import { toSameOriginR2Url } from '@/src/lib/assets/same-origin-r2-url'
import {
  ViewportCaptureBridge,
  type ViewportCaptureHandle,
} from './viewport-capture-bridge'
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
  const { baseColor, detailColor, viewAngle, sleeveStyle, captureInstant } =
    useCustomizerStore()

  useFrame(() => {
    if (!ref.current) return
    const target = viewAngle === 'back' ? Math.PI : 0
    if (captureInstant) {
      ref.current.rotation.y = target
      return
    }
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y,
      target,
      0.06,
    )
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
        <RoundedBox args={[0.55, 0.18, 0.38]} radius={0.04} smoothness={4} position={[0, 0.82, 0.02]}>
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

type GarmentSceneProps = {
  onGlbActive: (active: boolean) => void
  onModelReady: (payload: ModelReadyPayload) => void
  onModelError: (error: Error) => void
}

function GarmentScene({ onGlbActive, onModelReady, onModelError }: GarmentSceneProps) {
  const { product, baseColor, detailColor, sleeveStyle, layers } = useCustomizerStore()
  const modelConfig = useMemo(() => getCustomizerModelForProduct(product), [product])

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
    },
    [onGlbActive, onModelError],
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
      onModelReady={handleModelReady}
      onModelError={handleModelError}
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
  const { viewMode, product } = useCustomizerStore()
  const internalCaptureRef = useRef<ViewportCaptureHandle>(null)
  const viewportRootRef = useRef<HTMLDivElement>(null)
  const [glbActive, setGlbActive] = useState(false)
  const [modelReady, setModelReady] = useState<ModelReadyPayload | null>(null)
  const [remoteModelFailed, setRemoteModelFailed] = useState(false)
  const prevViewModeRef = useRef(viewMode)
  const prevProductIdRef = useRef(product?.id)
  const heroImageRaw =
    product?.images.find((image) => image.isPrimary)?.url ?? product?.images[0]?.url ?? null
  const heroImage = heroImageRaw ? toSameOriginR2Url(heroImageRaw) ?? heroImageRaw : null

  useEffect(() => {
    const entering3D = prevViewModeRef.current !== '3D' && viewMode === '3D'
    const productChanged = prevProductIdRef.current !== product?.id
    prevViewModeRef.current = viewMode
    prevProductIdRef.current = product?.id

    if (viewMode === '3D' && (entering3D || productChanged)) {
      setGlbActive(false)
      setModelReady(null)
      setRemoteModelFailed(false)
    }
  }, [viewMode, product?.id])

  const handleModelError = useCallback((error: Error) => {
    setGlbActive(false)
    setModelReady(null)
    setRemoteModelFailed(true)
    if (process.env.NEXT_PUBLIC_CUSTOMIZER_DEBUG_3D === 'true') {
      console.info('[customizer-3d] remote-model-failed', { message: error.message })
    }
  }, [])

  useImperativeHandle(ref, () => ({
    captureDesignPreviews: async () => {
      const bridge = externalCaptureRef?.current ?? internalCaptureRef.current
      if (!bridge) return null
      return bridge.captureDesignPreviews()
    },
  }))

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

  return (
    <div
      ref={viewportRootRef}
      data-testid="customizer-3d-viewport"
      className="relative h-full w-full bg-gradient-to-br from-[#080810] via-[#0c0c18] to-[#080810]"
    >
      <div className="customizer-noise absolute inset-0" />
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
        camera={{ position: [0, 0.3, 3.2], fov: 32, near: 0.01, far: 100 }}
        className="relative z-10"
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        resize={{ debounce: 0, scroll: false }}
      >
        <ViewportCaptureBridge ref={internalCaptureRef} viewportRootRef={viewportRootRef} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 4]} intensity={0.9} />
        <directionalLight position={[-4, 3, -3]} intensity={0.25} />
        <GarmentScene
          onGlbActive={setGlbActive}
          onModelReady={setModelReady}
          onModelError={handleModelError}
        />
        <ModelCameraRig modelReady={modelReady} />
        <ContactShadows position={[0, -0.85, 0]} opacity={0.35} scale={4} blur={2} far={3} />
        {modelReady?.bounds.valid ? (
          <Environment preset="studio" environmentIntensity={0.4} />
        ) : null}
        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  )
})

export default Viewport3D
export type { ViewportCaptureHandle }

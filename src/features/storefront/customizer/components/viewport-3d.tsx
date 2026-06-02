'use client'

import { forwardRef, useImperativeHandle, useMemo, useRef, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Float, OrbitControls, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useCustomizerStore } from '../store/customizer.store'
import {
  ViewportCaptureBridge,
  type ViewportCaptureHandle,
} from './viewport-capture-bridge'

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

type Viewport3DProps = {
  captureRef?: RefObject<ViewportCaptureHandle | null>
}

const Viewport3D = forwardRef<ViewportCaptureHandle, Viewport3DProps>(function Viewport3D(
  { captureRef: externalCaptureRef },
  ref,
) {
  const { viewMode, product } = useCustomizerStore()
  const internalCaptureRef = useRef<ViewportCaptureHandle>(null)
  const heroImage =
    product?.images.find((image) => image.isPrimary)?.url ?? product?.images[0]?.url ?? null

  useImperativeHandle(ref, () => ({
    captureDesignPreviews: async () => {
      const bridge = externalCaptureRef?.current ?? internalCaptureRef.current
      if (!bridge) return null
      return bridge.captureDesignPreviews()
    },
  }))

  if (viewMode !== '3D') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#080810] via-[#0c0c18] to-[#080810]">
        <div className="customizer-glass flex items-center gap-3 rounded-xl px-6 py-4 text-muted-foreground">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt={product?.name ?? 'Producto'}
              className="h-14 w-14 rounded-md object-cover"
            />
          ) : null}
          <span>Vista 2D: cambia a 3D para generar vistas previas al guardar.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-[#080810] via-[#0c0c18] to-[#080810]">
      <div className="customizer-noise absolute inset-0" />
      <Canvas
        camera={{ position: [0, 0.3, 3.2], fov: 32 }}
        className="relative z-10"
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <ViewportCaptureBridge ref={internalCaptureRef} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 4]} intensity={0.9} />
        <directionalLight position={[-4, 3, -3]} intensity={0.25} />
        <JacketModel />
        <ContactShadows position={[0, -0.85, 0]} opacity={0.35} scale={4} blur={2} far={3} />
        <Environment preset="studio" environmentIntensity={0.4} />
        <OrbitControls
          enablePan={false}
          minDistance={2.2}
          maxDistance={5}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  )
})

export default Viewport3D
export type { ViewportCaptureHandle }

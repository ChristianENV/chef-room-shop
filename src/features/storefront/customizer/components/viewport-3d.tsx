'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Float, OrbitControls, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useCustomizerStore } from '../store/customizer.store'

function JacketModel() {
  const ref = useRef<THREE.Group>(null)
  const { baseColor, detailColor, viewAngle, sleeveStyle } = useCustomizerStore()

  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y,
      viewAngle === 'back' ? Math.PI : 0,
      0.06
    )
  })

  const baseMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.75, metalness: 0.02 }),
    [baseColor]
  )
  const detailMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: detailColor, roughness: 0.6, metalness: 0.08 }),
    [detailColor]
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
          <RoundedBox args={[sleeveLength, 0.38, 0.38]} radius={0.06} smoothness={4} position={[-sleeveLength / 2 + 0.1, 0, 0]}>
            <primitive object={baseMaterial} attach="material" />
          </RoundedBox>
        </group>
        <group position={[0.7, 0.4, 0]} rotation={[0, 0, -0.35]}>
          <RoundedBox args={[sleeveLength, 0.38, 0.38]} radius={0.06} smoothness={4} position={[sleeveLength / 2 - 0.1, 0, 0]}>
            <primitive object={baseMaterial} attach="material" />
          </RoundedBox>
        </group>
      </group>
    </Float>
  )
}

export default function Viewport3D() {
  const { viewMode } = useCustomizerStore()

  if (viewMode !== '3D') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#080810] via-[#0c0c18] to-[#080810]">
        <div className="customizer-glass rounded-xl px-6 py-4 text-muted-foreground">Vista 2D - Proximamente</div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-[#080810] via-[#0c0c18] to-[#080810]">
      <div className="customizer-noise absolute inset-0" />
      <Canvas camera={{ position: [0, 0.3, 3.2], fov: 32 }} className="relative z-10">
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 4]} intensity={0.9} />
        <directionalLight position={[-4, 3, -3]} intensity={0.25} />
        <JacketModel />
        <ContactShadows position={[0, -0.85, 0]} opacity={0.35} scale={4} blur={2} far={3} />
        <Environment preset="studio" environmentIntensity={0.4} />
        <OrbitControls enablePan={false} minDistance={2.2} maxDistance={5} enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  )
}

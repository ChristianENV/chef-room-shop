'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Float, RoundedBox } from '@react-three/drei'
import { useDesignerStore } from '@/lib/store'
import * as THREE from 'three'

function ChefJacket() {
  const groupRef = useRef<THREE.Group>(null)
  const { baseColor, detailColor, viewAngle, sleeveStyle, collarStyle, buttonStyle } = useDesignerStore()
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        viewAngle === 'back' ? Math.PI : 0,
        0.05
      )
    }
  })

  const baseMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.75,
    metalness: 0.02,
  }), [baseColor])

  const detailMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: detailColor,
    roughness: 0.6,
    metalness: 0.08,
  }), [detailColor])

  const buttonMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    roughness: 0.25,
    metalness: 0.5,
  }), [])

  // Sleeve length based on style
  const sleeveLength = sleeveStyle === 'corta' ? 0.3 : sleeveStyle === '3/4' ? 0.5 : 0.7

  return (
    <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.25}>
      <group ref={groupRef} position={[0, 0.1, 0]} scale={0.85}>
        {/* Main body - torso with rounded edges */}
        <RoundedBox args={[1.15, 1.5, 0.45]} radius={0.08} smoothness={4} position={[0, 0, 0]}>
          <primitive object={baseMaterial} attach="material" />
        </RoundedBox>
        
        {/* Front placket overlay */}
        <RoundedBox args={[0.25, 1.3, 0.03]} radius={0.02} smoothness={2} position={[0.12, 0.05, 0.24]}>
          <primitive object={baseMaterial} attach="material" />
        </RoundedBox>
        
        {/* Collar based on style */}
        {collarStyle === 'mao' && (
          <RoundedBox args={[0.55, 0.18, 0.38]} radius={0.04} smoothness={4} position={[0, 0.82, 0.02]}>
            <primitive object={detailMaterial} attach="material" />
          </RoundedBox>
        )}
        {collarStyle === 'clasico' && (
          <>
            <RoundedBox args={[0.3, 0.22, 0.08]} radius={0.02} smoothness={2} position={[-0.2, 0.82, 0.18]} rotation={[0.1, 0.2, -0.25]}>
              <primitive object={detailMaterial} attach="material" />
            </RoundedBox>
            <RoundedBox args={[0.3, 0.22, 0.08]} radius={0.02} smoothness={2} position={[0.2, 0.82, 0.18]} rotation={[0.1, -0.2, 0.25]}>
              <primitive object={detailMaterial} attach="material" />
            </RoundedBox>
          </>
        )}
        {collarStyle === 'granjero' && (
          <RoundedBox args={[0.65, 0.14, 0.42]} radius={0.03} smoothness={4} position={[0, 0.82, 0.06]}>
            <primitive object={detailMaterial} attach="material" />
          </RoundedBox>
        )}
        
        {/* Shoulders */}
        <RoundedBox args={[0.35, 0.12, 0.4]} radius={0.04} smoothness={2} position={[-0.55, 0.65, 0]}>
          <primitive object={baseMaterial} attach="material" />
        </RoundedBox>
        <RoundedBox args={[0.35, 0.12, 0.4]} radius={0.04} smoothness={2} position={[0.55, 0.65, 0]}>
          <primitive object={baseMaterial} attach="material" />
        </RoundedBox>
        
        {/* Left sleeve */}
        <group position={[-0.7, 0.4, 0]} rotation={[0, 0, 0.35]}>
          <RoundedBox args={[sleeveLength, 0.38, 0.38]} radius={0.06} smoothness={4} position={[-sleeveLength/2 + 0.1, 0, 0]}>
            <primitive object={baseMaterial} attach="material" />
          </RoundedBox>
          {/* Cuff */}
          <RoundedBox args={[0.12, 0.4, 0.4]} radius={0.03} smoothness={2} position={[-sleeveLength + 0.15, 0, 0]}>
            <primitive object={detailMaterial} attach="material" />
          </RoundedBox>
        </group>
        
        {/* Right sleeve */}
        <group position={[0.7, 0.4, 0]} rotation={[0, 0, -0.35]}>
          <RoundedBox args={[sleeveLength, 0.38, 0.38]} radius={0.06} smoothness={4} position={[sleeveLength/2 - 0.1, 0, 0]}>
            <primitive object={baseMaterial} attach="material" />
          </RoundedBox>
          {/* Cuff */}
          <RoundedBox args={[0.12, 0.4, 0.4]} radius={0.03} smoothness={2} position={[sleeveLength - 0.15, 0, 0]}>
            <primitive object={detailMaterial} attach="material" />
          </RoundedBox>
        </group>
        
        {/* Buttons - only show for tradicional style */}
        {buttonStyle === 'tradicional' && [0.45, 0.15, -0.15, -0.45].map((y, i) => (
          <mesh key={i} material={buttonMaterial} position={[0.12, y, 0.25]}>
            <sphereGeometry args={[0.038, 16, 16]} />
          </mesh>
        ))}
        
        {/* Hidden buttons indicator */}
        {buttonStyle === 'ocultos' && (
          <mesh position={[0.12, 0, 0.25]}>
            <planeGeometry args={[0.02, 0.9]} />
            <meshStandardMaterial color={baseColor} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        )}
        
        {/* Automatic snap buttons */}
        {buttonStyle === 'automaticos' && [0.45, 0.15, -0.15, -0.45].map((y, i) => (
          <mesh key={i} position={[0.12, y, 0.25]}>
            <cylinderGeometry args={[0.025, 0.025, 0.015, 16]} rotation={[Math.PI/2, 0, 0]} />
            <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        
        {/* Left chest pocket */}
        <group position={[-0.32, 0.28, 0.235]}>
          {/* Pocket body */}
          <RoundedBox args={[0.22, 0.18, 0.015]} radius={0.01} smoothness={2}>
            <meshStandardMaterial color={baseColor} roughness={0.85} />
          </RoundedBox>
          {/* Pocket flap */}
          <RoundedBox args={[0.24, 0.04, 0.02]} radius={0.01} smoothness={2} position={[0, 0.11, 0.01]}>
            <meshStandardMaterial color={baseColor} roughness={0.85} />
          </RoundedBox>
        </group>
      </group>
    </Float>
  )
}

export default function Viewport3D() {
  const { viewMode } = useDesignerStore()
  
  return (
    <div className="relative h-full w-full">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#080810] via-[#0c0c18] to-[#080810]" />
      
      {/* Subtle radial glow in center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,255,255,0.04),transparent_55%)]" />
      
      {/* Secondary glow for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,rgba(180,160,130,0.03),transparent_50%)]" />
      
      {/* Noise texture */}
      <div className="noise absolute inset-0" />
      
      {viewMode === '3D' ? (
        <Canvas
          camera={{ position: [0, 0.3, 3.2], fov: 32 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="relative z-10"
          dpr={[1, 2]}
        >
          <color attach="background" args={['#080810']} />
          
          {/* Ambient fill light */}
          <ambientLight intensity={0.35} />
          
          {/* Key light - main illumination */}
          <directionalLight 
            position={[4, 6, 4]} 
            intensity={0.9} 
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          
          {/* Fill light - soften shadows */}
          <directionalLight position={[-4, 3, -3]} intensity={0.25} />
          
          {/* Rim light - edge definition */}
          <directionalLight position={[0, 2, -5]} intensity={0.4} />
          
          {/* Top spot for dramatic effect */}
          <spotLight 
            position={[0, 8, 2]} 
            intensity={0.6} 
            angle={0.4} 
            penumbra={0.8}
            castShadow
          />
          
          <ChefJacket />
          
          <ContactShadows
            position={[0, -0.85, 0]}
            opacity={0.35}
            scale={4}
            blur={2}
            far={3}
            color="#000000"
          />
          
          <Environment preset="studio" environmentIntensity={0.4} />
          
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.6}
            minDistance={2.2}
            maxDistance={5}
            enableDamping
            dampingFactor={0.05}
          />
        </Canvas>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="glass rounded-xl px-6 py-4 text-muted-foreground">
            Vista 2D - Proximamente
          </div>
        </div>
      )}
    </div>
  )
}

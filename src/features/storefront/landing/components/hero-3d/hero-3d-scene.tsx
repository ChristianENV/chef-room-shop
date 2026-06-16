'use client'

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

import {
  HERO_3D_CAMERA,
  HERO_3D_FLOAT_AMPLITUDE,
  HERO_3D_IDLE_ROTATION_SPEED,
  HERO_3D_JACKET_TRANSFORM,
  HERO_3D_MODEL_URL,
} from './hero-3d-config'

useGLTF.preload(HERO_3D_MODEL_URL)

type HeroJacketModelProps = {
  animate: boolean
  onReady?: () => void
}

function HeroJacketModel({ animate, onReady }: HeroJacketModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(HERO_3D_MODEL_URL)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || !object.material) return
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      object.material = materials.map((material) => material.clone())
    })
    return clone
  }, [scene])

  useEffect(() => {
    onReady?.()
  }, [clonedScene, onReady])

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
      <primitive object={clonedScene} />
    </group>
  )
}

function HeroSceneLights() {
  return (
    <>
      <ambientLight intensity={0.45} color="#c8d0ff" />
      <directionalLight
        position={[4.5, 6.5, 4]}
        intensity={1.35}
        color="#f4f6ff"
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <directionalLight position={[-3.5, 2.5, -2]} intensity={0.28} color="#8fa0ff" />
      <spotLight
        position={[-1.5, 2.5, -3.5]}
        angle={0.55}
        penumbra={0.85}
        intensity={1.6}
        color="#5a6fdd"
        distance={14}
      />
      <pointLight position={[0.5, 1.2, 2.5]} intensity={0.35} color="#ffffff" />
    </>
  )
}

type SceneErrorBoundaryProps = {
  children: ReactNode
  onError: () => void
}

type SceneErrorBoundaryState = { hasError: boolean }

class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  state: SceneErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

type Hero3DSceneCanvasProps = {
  animate: boolean
  dpr: number
  onError: () => void
  onReady?: () => void
  className?: string
}

export function Hero3DSceneCanvas({
  animate,
  dpr,
  onError,
  onReady,
  className,
}: Hero3DSceneCanvasProps) {
  return (
    <Canvas
      className={className}
      dpr={dpr}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      shadows
      camera={{
        position: HERO_3D_CAMERA.position,
        fov: HERO_3D_CAMERA.fov,
        near: 0.1,
        far: 100,
      }}
      data-testid="landing-hero-3d-canvas"
    >
      <HeroSceneLights />
      <SceneErrorBoundary onError={onError}>
        <Suspense fallback={null}>
          <HeroJacketModel animate={animate} onReady={onReady} />
        </Suspense>
      </SceneErrorBoundary>
      <ContactShadows
        position={[0, -1.65, 0]}
        opacity={0.42}
        scale={9}
        blur={2.4}
        far={4.2}
        color="#0a0e22"
      />
    </Canvas>
  )
}

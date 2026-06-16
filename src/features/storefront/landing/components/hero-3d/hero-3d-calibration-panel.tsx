'use client'

import { useCallback, useState } from 'react'

import {
  cloneComposition,
  compositionToCalibrationJson,
  HERO_JACKET_COMPOSITION,
  type HeroJacketComposition,
} from './hero-3d-config'
import { isLandingHero3dCalibrateEnabled } from './hero-3d-debug'

type Hero3DCalibrationPanelProps = {
  composition: HeroJacketComposition
  onChange: (next: HeroJacketComposition) => void
}

type SliderRowProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

function SliderRow({ label, value, min, max, step, onChange }: SliderRowProps) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="flex justify-between text-[10px] text-white/70">
        <span>{label}</span>
        <span className="font-mono text-emerald-200">{value.toFixed(3)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 w-full accent-emerald-400"
      />
    </label>
  )
}

type Vec3SlidersProps = {
  label: string
  value: [number, number, number]
  mins: [number, number, number]
  maxs: [number, number, number]
  step: number
  onChange: (axis: 0 | 1 | 2, next: number) => void
}

function Vec3Sliders({ label, value, mins, maxs, step, onChange }: Vec3SlidersProps) {
  const axes = ['X', 'Y', 'Z'] as const
  return (
    <fieldset className="space-y-1 rounded border border-white/10 p-2">
      <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide text-white/60">
        {label}
      </legend>
      {axes.map((axis, index) => (
        <SliderRow
          key={axis}
          label={`${label} ${axis}`}
          value={value[index]}
          min={mins[index]}
          max={maxs[index]}
          step={step}
          onChange={(next) => onChange(index as 0 | 1 | 2, next)}
        />
      ))}
    </fieldset>
  )
}

export function Hero3DCalibrationPanel({ composition, onChange }: Hero3DCalibrationPanelProps) {
  const [copied, setCopied] = useState(false)

  const update = useCallback(
    (patch: Partial<HeroJacketComposition>) => {
      onChange({ ...composition, ...patch })
    },
    [composition, onChange],
  )

  const updateModelPosition = useCallback(
    (axis: 0 | 1 | 2, next: number) => {
      const modelPosition = [...composition.modelPosition] as [number, number, number]
      modelPosition[axis] = next
      update({ modelPosition })
    },
    [composition.modelPosition, update],
  )

  const updateCameraPosition = useCallback(
    (axis: 0 | 1 | 2, next: number) => {
      const cameraPosition = [...composition.cameraPosition] as [number, number, number]
      cameraPosition[axis] = next
      update({ cameraPosition })
    },
    [composition.cameraPosition, update],
  )

  const updateCameraTarget = useCallback(
    (axis: 0 | 1 | 2, next: number) => {
      const cameraTarget = [...composition.cameraTarget] as [number, number, number]
      cameraTarget[axis] = next
      update({ cameraTarget })
    },
    [composition.cameraTarget, update],
  )

  const handleCopy = useCallback(async () => {
    const json = JSON.stringify(compositionToCalibrationJson(composition), null, 2)
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }, [composition])

  const handleReset = useCallback(() => {
    onChange(cloneComposition(HERO_JACKET_COMPOSITION))
  }, [onChange])

  if (!isLandingHero3dCalibrateEnabled()) return null

  return (
    <div
      className="pointer-events-auto absolute right-2 top-2 z-50 max-h-[min(92vh,720px)] w-[min(100%,280px)] overflow-y-auto rounded-lg border border-white/15 bg-black/85 p-3 font-sans text-xs text-white shadow-2xl backdrop-blur-sm"
      data-testid="landing-hero-3d-calibration"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
          Hero 3D calibration
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-white/80 hover:bg-white/10"
        >
          Reset
        </button>
      </div>

      <div className="space-y-2">
        <Vec3Sliders
          label="Model position"
          value={composition.modelPosition}
          mins={[-2, -5, -2]}
          maxs={[2, 0, 2]}
          step={0.05}
          onChange={updateModelPosition}
        />
        <SliderRow
          label="Model scale"
          value={composition.modelScale}
          min={0.005}
          max={0.05}
          step={0.001}
          onChange={(modelScale) => update({ modelScale })}
        />
        <SliderRow
          label="Model rotation Y"
          value={composition.modelRotationY}
          min={-Math.PI}
          max={Math.PI}
          step={0.01}
          onChange={(modelRotationY) => update({ modelRotationY })}
        />

        <Vec3Sliders
          label="Camera position"
          value={composition.cameraPosition}
          mins={[-3, -1, 2]}
          maxs={[3, 3, 10]}
          step={0.05}
          onChange={updateCameraPosition}
        />
        <SliderRow
          label="Camera FOV"
          value={composition.cameraFov}
          min={20}
          max={60}
          step={1}
          onChange={(cameraFov) => update({ cameraFov })}
        />
        <Vec3Sliders
          label="Camera target"
          value={composition.cameraTarget}
          mins={[-2, -3, -2]}
          maxs={[2, 2, 2]}
          step={0.05}
          onChange={updateCameraTarget}
        />

        <SliderRow
          label="Glow offset X"
          value={composition.glowOffsetX}
          min={-80}
          max={80}
          step={1}
          onChange={(glowOffsetX) => update({ glowOffsetX })}
        />
        <SliderRow
          label="Glow offset Y"
          value={composition.glowOffsetY}
          min={-80}
          max={80}
          step={1}
          onChange={(glowOffsetY) => update({ glowOffsetY })}
        />
        <SliderRow
          label="Pedestal offset Y"
          value={composition.pedestalOffsetY}
          min={-40}
          max={80}
          step={1}
          onChange={(pedestalOffsetY) => update({ pedestalOffsetY })}
        />
        <SliderRow
          label="Idle rotation speed"
          value={composition.idleRotationSpeed}
          min={0}
          max={0.2}
          step={0.005}
          onChange={(idleRotationSpeed) => update({ idleRotationSpeed })}
        />
      </div>

      <button
        type="button"
        onClick={() => void handleCopy()}
        className="mt-3 w-full rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500"
        data-testid="landing-hero-3d-calibration-copy"
      >
        {copied ? 'Copied!' : 'Copy config'}
      </button>
    </div>
  )
}

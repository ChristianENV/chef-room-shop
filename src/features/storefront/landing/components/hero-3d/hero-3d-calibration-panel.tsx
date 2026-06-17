'use client'

import { useCallback, useState } from 'react'

import {
  cloneComposition,
  compositionToCalibrationJson,
  HERO_JACKET_COMPOSITION,
  type HeroFitMode,
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

export function Hero3DCalibrationPanel({ composition, onChange }: Hero3DCalibrationPanelProps) {
  const [copied, setCopied] = useState(false)

  const update = useCallback(
    (patch: Partial<HeroJacketComposition>) => {
      onChange({ ...composition, ...patch })
    },
    [composition, onChange],
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
        <SliderRow
          label="Padding ratio"
          value={composition.paddingRatio}
          min={0.05}
          max={0.4}
          step={0.01}
          onChange={(paddingRatio) => update({ paddingRatio })}
        />
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] text-white/70">Fit mode</span>
          <select
            value={composition.fitMode}
            onChange={(event) => update({ fitMode: event.target.value as HeroFitMode })}
            className="rounded border border-white/20 bg-black/60 px-2 py-1 text-[11px]"
          >
            <option value="contain">contain</option>
            <option value="contain-height">contain-height</option>
          </select>
        </label>
        <SliderRow
          label="Vertical bias"
          value={composition.verticalBias}
          min={-0.25}
          max={0.25}
          step={0.01}
          onChange={(verticalBias) => update({ verticalBias })}
        />
        <SliderRow
          label="Camera FOV"
          value={composition.cameraFov}
          min={20}
          max={60}
          step={1}
          onChange={(cameraFov) => update({ cameraFov })}
        />
        <SliderRow
          label="Idle rotation speed"
          value={composition.idleRotationSpeed}
          min={0}
          max={2}
          step={0.05}
          onChange={(idleRotationSpeed) => update({ idleRotationSpeed })}
        />
        <SliderRow
          label="Idle rotation amplitude"
          value={composition.idleRotationAmplitude}
          min={0}
          max={0.4}
          step={0.01}
          onChange={(idleRotationAmplitude) => update({ idleRotationAmplitude })}
        />
        <SliderRow
          label="Rotation fit padding"
          value={composition.rotationFitPadding}
          min={0}
          max={0.2}
          step={0.01}
          onChange={(rotationFitPadding) => update({ rotationFitPadding })}
        />
        <SliderRow
          label="Target torso ratio"
          value={composition.targetTorsoRatio}
          min={0.35}
          max={0.65}
          step={0.01}
          onChange={(targetTorsoRatio) => update({ targetTorsoRatio })}
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

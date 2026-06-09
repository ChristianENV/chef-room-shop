'use client'

import { X } from 'lucide-react'

export type Customizer3dDebugSnapshot = {
  phase: 'idle' | 'loading' | 'loaded' | 'bounds-ready' | 'camera-fit' | 'error' | 'procedural'
  modelUrl: string | null
  modelSource: 'r2' | 'local-fallback' | 'env-fallback' | 'missing' | null
  productSlug: string | null
  registryKey: string | null
  hasProductModel3d: boolean | null
  usingLocalFallback: boolean | null
  meshCount: number | null
  visibleMeshCount: number | null
  materialNames: string[] | null
  materialTypes: string[] | null
  firstMeshVisible: boolean | null
  firstMeshMaterial: string | null
  firstMeshWorldPosition: [number, number, number] | null
  firstMeshWorldScale: [number, number, number] | null
  forceDebugMaterial: boolean
  debugMaterialAppliedMeshCount: number | null
  appliedTransform: {
    scale: number
    position: [number, number, number]
    rotation: [number, number, number]
  } | null
  bounds: {
    valid: boolean
    size: [number, number, number]
    center: [number, number, number]
    radius: number
  } | null
  fitKey: string | null
  canvasSize: { width: number; height: number } | null
  cameraPosition: [number, number, number] | null
  controlsTarget: [number, number, number] | null
  lastError: string | null
  fitAttempts: number
}

type Customizer3dDebugHudProps = {
  snapshot: Customizer3dDebugSnapshot
  /** When false, the HUD is not rendered (e.g. non-admin storefront users). */
  visible?: boolean
  onToggleDebugMaterial?: () => void
  onToggleSafeRender?: () => void
  onResetCamera?: () => void
  onHide?: () => void
  safeRenderActive?: boolean
}

function formatVec3(values: [number, number, number] | null): string {
  if (!values) return '—'
  return values.map((v) => v.toFixed(2)).join(', ')
}

export function Customizer3dDebugHud({
  snapshot,
  visible = false,
  onToggleDebugMaterial,
  onToggleSafeRender,
  onResetCamera,
  onHide,
  safeRenderActive = false,
}: Customizer3dDebugHudProps) {
  if (!visible) return null

  const phaseColor =
    snapshot.phase === 'error'
      ? 'text-red-300'
      : snapshot.phase === 'bounds-ready' || snapshot.phase === 'camera-fit'
        ? 'text-emerald-300'
        : snapshot.phase === 'loaded'
          ? 'text-amber-200'
          : 'text-white/70'

  const showDevControls = Boolean(onToggleDebugMaterial || onToggleSafeRender || onResetCamera)

  return (
    <div
      data-testid="customizer-3d-debug-hud"
      className="pointer-events-none absolute left-2 top-2 z-40 max-w-[min(100%,24rem)] rounded-lg border border-black/10 bg-black/80 px-3 py-2 font-mono text-[10px] leading-relaxed text-white/85 shadow-lg backdrop-blur-sm"
    >
      <div className="pointer-events-auto mb-1 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-white">3D debug</p>
        {onHide ? (
          <button
            type="button"
            data-testid="customizer-3d-debug-hud-hide"
            onClick={onHide}
            title="Ocultar panel"
            className="rounded p-0.5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
      <p>
        <span className="text-white/50">phase</span>{' '}
        <span className={phaseColor}>{snapshot.phase}</span>
      </p>
      <p className="truncate">
        <span className="text-white/50">modelUrl</span> {snapshot.modelUrl ?? '—'}
      </p>
      <p>
        <span className="text-white/50">modelSource</span> {snapshot.modelSource ?? '—'}{' '}
        <span className="text-white/50">hasProductModel3d</span>{' '}
        {snapshot.hasProductModel3d === null ? '—' : String(snapshot.hasProductModel3d)}
      </p>
      <p>
        <span className="text-white/50">product</span> {snapshot.productSlug ?? '—'}{' '}
        <span className="text-white/50">registry</span> {snapshot.registryKey ?? '—'}{' '}
        <span className="text-white/50">localFallback</span>{' '}
        {snapshot.usingLocalFallback === null ? '—' : String(snapshot.usingLocalFallback)}
      </p>
      <p>
        <span className="text-white/50">meshes</span> {snapshot.meshCount ?? '—'} / visible{' '}
        {snapshot.visibleMeshCount ?? '—'}
      </p>
      <p className="truncate">
        <span className="text-white/50">materials</span>{' '}
        {snapshot.materialNames?.join(', ') || '—'}
      </p>
      <p className="truncate">
        <span className="text-white/50">matTypes</span>{' '}
        {snapshot.materialTypes?.join(', ') || '—'}
      </p>
      <p>
        <span className="text-white/50">firstMesh</span> vis=
        {snapshot.firstMeshVisible === null ? '—' : String(snapshot.firstMeshVisible)} mat=
        {snapshot.firstMeshMaterial ?? '—'}
      </p>
      <p>
        <span className="text-white/50">firstPos</span>{' '}
        {formatVec3(snapshot.firstMeshWorldPosition)} scale=
        {formatVec3(snapshot.firstMeshWorldScale)}
      </p>
      <p>
        <span className="text-white/50">forceDebug</span>{' '}
        {String(snapshot.forceDebugMaterial)} applied=
        {snapshot.debugMaterialAppliedMeshCount ?? '—'}
      </p>
      <p>
        <span className="text-white/50">bounds</span>{' '}
        {snapshot.bounds
          ? `${snapshot.bounds.valid ? 'ok' : 'invalid'} size=${formatVec3(snapshot.bounds.size)} r=${snapshot.bounds.radius.toFixed(2)}`
          : '—'}
      </p>
      <p>
        <span className="text-white/50">camera</span> {formatVec3(snapshot.cameraPosition)}{' '}
        <span className="text-white/50">target</span> {formatVec3(snapshot.controlsTarget)}
      </p>
      <p>
        <span className="text-white/50">fitAttempts</span> {snapshot.fitAttempts}
      </p>
      {snapshot.lastError ? (
        <p className="text-red-300">
          <span className="text-white/50">error</span> {snapshot.lastError}
        </p>
      ) : null}
      {showDevControls ? (
        <div className="pointer-events-auto mt-2 flex flex-wrap gap-2 border-t border-white/10 pt-2">
          {onToggleDebugMaterial ? (
            <button
              type="button"
              data-testid="customizer-3d-debug-material-toggle"
              onClick={onToggleDebugMaterial}
              className="rounded border border-white/20 px-2 py-0.5 text-[10px] hover:bg-white/10"
            >
              {snapshot.forceDebugMaterial ? 'Materiales normales' : 'Material debug'}
            </button>
          ) : null}
          {onToggleSafeRender ? (
            <button
              type="button"
              data-testid="customizer-3d-safe-render-toggle"
              onClick={onToggleSafeRender}
              className="rounded border border-white/20 px-2 py-0.5 text-[10px] hover:bg-white/10"
            >
              {safeRenderActive ? 'Render integrado' : 'Render seguro'}
            </button>
          ) : null}
          {onResetCamera ? (
            <button
              type="button"
              onClick={onResetCamera}
              className="rounded border border-white/20 px-2 py-0.5 text-[10px] hover:bg-white/10"
            >
              Reset cámara
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

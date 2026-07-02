import type { ViewMode } from '../types/customizer.types'

/** Renderer implementations available behind the viewport host. */
export type ViewportRendererKind = '2d' | '3d'

/**
 * Decides which renderer the {@link CustomizerViewportHost} should mount for a
 * given {@link ViewMode}. Kept as a pure function so the selection logic can be
 * unit tested without rendering React / WebGL.
 */
export function resolveViewportRenderer(viewMode: ViewMode): ViewportRendererKind {
  return viewMode === '2D' ? '2d' : '3d'
}

import type { HeroJacketComposition } from './hero-3d-config'

/** Stable key for camera-fit dependencies — excludes animation/time values. */
export function getCompositionFitKey(composition: HeroJacketComposition): string {
  return [
    composition.modelScale,
    composition.modelRotationX,
    composition.modelRotationY,
    composition.cameraFov,
    composition.paddingRatio,
    composition.fitMode,
    composition.verticalBias,
    composition.rotationFitPadding,
    composition.targetTorsoRatio,
    composition.cameraViewDirection.join(','),
    composition.idleRotationAmplitude,
    composition.dragRotationLimit,
    composition.modelPosition.join(','),
  ].join('|')
}

export function getCanvasFitKey(width: number, height: number): string {
  return `${Math.round(width)}x${Math.round(height)}`
}

export const HERO_FIT_EPSILON = 0.0001

export function vectorsNearlyEqual(
  a: [number, number, number],
  b: [number, number, number],
  epsilon = HERO_FIT_EPSILON,
): boolean {
  return (
    Math.abs(a[0] - b[0]) < epsilon &&
    Math.abs(a[1] - b[1]) < epsilon &&
    Math.abs(a[2] - b[2]) < epsilon
  )
}

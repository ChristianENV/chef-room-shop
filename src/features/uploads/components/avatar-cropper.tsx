'use client'

import { useCallback, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import type { CropArea } from '../lib/image-processing'

export type AvatarCropperProps = {
  imageSrc: string
  onCropChange: (cropArea: CropArea) => void
  onRotationChange: (rotation: number) => void
  onChangeImage: () => void
}

/**
 * Circular crop UI for avatar photos.
 *
 * Exposes crop area and rotation up to the parent; does not process the image
 * itself — call {@link processAvatarImage} once the user confirms.
 */
export function AvatarCropper({
  imageSrc,
  onCropChange,
  onRotationChange,
  onChangeImage,
}: AvatarCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      onCropChange(croppedAreaPixels)
    },
    [onCropChange],
  )

  const handleRotate = useCallback(
    (delta: number) => {
      const next = (rotation + delta + 360) % 360
      setRotation(next)
      onRotationChange(next)
    },
    [rotation, onRotationChange],
  )

  const handleZoomChange = useCallback((values: number[]) => {
    setZoom(values[0] ?? 1)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      {/* Crop canvas */}
      <div
        className="relative mx-auto h-64 w-full max-w-sm overflow-hidden rounded-xl bg-black/90"
        aria-label="Área de recorte"
      >
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onZoomChange={setZoom}
          classes={{
            containerClassName: 'rounded-xl',
          }}
        />
      </div>

      {/* Controls */}
      <div className="space-y-3 px-1">
        {/* Zoom */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
            aria-label="Reducir zoom"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.05}
            onValueChange={handleZoomChange}
            aria-label="Zoom"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            aria-label="Aumentar zoom"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Rotation + change image */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => handleRotate(-90)}
              aria-label="Rotar 90° a la izquierda"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">−90°</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => handleRotate(90)}
              aria-label="Rotar 90° a la derecha"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">+90°</span>
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={onChangeImage}
          >
            Cambiar foto
          </Button>
        </div>
      </div>
    </div>
  )
}

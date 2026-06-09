'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useCustomizerStore } from '../../store/customizer.store'

export function Debug3dSection() {
  const show3dDebugHud = useCustomizerStore((state) => state.show3dDebugHud)
  const setShow3dDebugHud = useCustomizerStore((state) => state.setShow3dDebugHud)

  return (
    <div className="space-y-4 p-4" data-testid="customizer-debug-3d-section">
      <div>
        <h3 className="text-sm font-semibold text-foreground">3D debug</h3>
        <p className="text-xs text-muted-foreground">
          Herramientas de diagnóstico del visor 3D. Solo visible para administradores.
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-3 py-3">
        <div className="space-y-0.5">
          <Label htmlFor="customizer-show-3d-debug-hud" className="text-sm font-medium">
            Panel en el visor
          </Label>
          <p className="text-xs text-muted-foreground">
            Muestra u oculta el card de debug sobre el canvas 3D.
          </p>
        </div>
        <Switch
          id="customizer-show-3d-debug-hud"
          data-testid="customizer-show-3d-debug-hud-toggle"
          checked={show3dDebugHud}
          onCheckedChange={setShow3dDebugHud}
        />
      </div>
    </div>
  )
}

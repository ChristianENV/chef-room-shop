'use client'

import Link from 'next/link'
import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCustomizerStore } from '../../store/customizer.store'

export function SavedDesignsSection() {
  const { designId, lastSavedAt } = useCustomizerStore()

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Mis diseños</h3>
        <p className="text-xs text-muted-foreground">Tus diseños guardados aparecen aquí.</p>
      </div>

      {designId ? (
        <div className="rounded-lg border border-border/60 bg-card p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Bookmark className="size-4 text-primary" />
            Diseño actual
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {lastSavedAt
              ? `Guardado ${new Date(lastSavedAt).toLocaleString('es-MX')}`
              : 'Borrador en progreso'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-6 text-center">
          <Bookmark className="mx-auto size-6 text-muted-foreground/60" />
          <p className="mt-2 text-sm font-medium text-foreground">Aún no guardas este diseño</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Usa “Guardar diseño” para conservarlo y retomarlo después.
          </p>
        </div>
      )}

      <Button variant="outline" size="sm" className="w-full" asChild>
        <Link href="/account/designs">Ver todos mis diseños</Link>
      </Button>
    </div>
  )
}

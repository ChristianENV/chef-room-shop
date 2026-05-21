'use client'

import { useState } from 'react'
import { Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AdminCustomizationProduct } from './types'

type DuplicateRulesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceProduct: AdminCustomizationProduct | null
  targetProducts: AdminCustomizationProduct[]
  onConfirm: (toProductId: string, overwriteExisting: boolean) => void
  isDuplicating?: boolean
}

export function DuplicateRulesDialog({
  open,
  onOpenChange,
  sourceProduct,
  targetProducts,
  onConfirm,
  isDuplicating,
}: DuplicateRulesDialogProps) {
  const [targetId, setTargetId] = useState<string>('')
  const [overwrite, setOverwrite] = useState(false)

  const options = targetProducts.filter((p) => p.id !== sourceProduct?.id)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTargetId('')
      setOverwrite(false)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Copy className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="font-sans">Duplicar reglas</DialogTitle>
          </div>
          <DialogDescription className="font-serif">
            {sourceProduct ? (
              <>
                Origen: <strong className="text-foreground">{sourceProduct.name}</strong>.
                Se copiarán zonas, técnicas, precios y restricciones al producto destino.
              </>
            ) : (
              'Selecciona el producto destino.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="font-sans">Producto destino</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger className="font-sans">
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {options.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-2 rounded-md border border-border p-3">
            <Checkbox
              id="overwrite"
              checked={overwrite}
              onCheckedChange={(c) => setOverwrite(c === true)}
            />
            <Label htmlFor="overwrite" className="cursor-pointer font-serif text-sm leading-snug">
              Sobrescribir reglas existentes en el producto destino
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isDuplicating}>
            Cancelar
          </Button>
          <Button
            disabled={!targetId || isDuplicating}
            onClick={() => onConfirm(targetId, overwrite)}
          >
            {isDuplicating ? 'Copiando…' : 'Duplicar reglas'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type AdminCreateLabelDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (labelFormat: string) => void
  isPending?: boolean
}

/**
 * Confirmation dialog before creating a Skydropx shipping label.
 */
export function AdminCreateLabelDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: AdminCreateLabelDialogProps) {
  const [labelFormat, setLabelFormat] = useState('PDF')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-sans">Generar guía de envío</DialogTitle>
          <DialogDescription className="font-serif">
            Se creará una guía con la tarifa seleccionada durante el checkout. Esta
            acción puede descontar saldo en Skydropx.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="label-format">Formato de etiqueta</Label>
          <Select value={labelFormat} onValueChange={setLabelFormat}>
            <SelectTrigger id="label-format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PDF">PDF (recomendado)</SelectItem>
              <SelectItem value="ZPL">ZPL (térmica)</SelectItem>
              <SelectItem value="EPL">EPL (térmica)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(labelFormat)} disabled={isPending}>
            {isPending ? 'Generando…' : 'Generar guía'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

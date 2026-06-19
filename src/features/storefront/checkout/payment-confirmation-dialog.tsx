'use client'
import { routes } from '@/src/config/routes'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, Copy, Clock, Building2, Banknote } from 'lucide-react'
import { useState } from 'react'
import type { PaymentMethod } from './payment-method-tabs'

interface PaymentConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentMethod: PaymentMethod
  orderId: string
  oxxoReference?: string
  speiClabe?: string
  speiBank?: string
  total: number
  customerEmail: string
}

export function PaymentConfirmationDialog({
  open,
  onOpenChange,
  paymentMethod,
  orderId,
  oxxoReference = 'MOCK-OXXO-123456789',
  speiClabe = '012180001234567890',
  speiBank = 'STP',
  total,
  customerEmail,
}: PaymentConfirmationDialogProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Card Success */}
        {paymentMethod === 'card' && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Check className="h-8 w-8 text-success" />
              </div>
              <DialogTitle className="font-sans text-xl">Pago confirmado</DialogTitle>
              <DialogDescription className="font-serif">
                Tu pedido #{orderId} ha sido procesado exitosamente.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-secondary p-4 text-center">
                <p className="font-serif text-sm text-muted-foreground">Total pagado</p>
                <p className="font-sans text-2xl font-bold text-foreground">
                  ${total.toLocaleString('es-MX')} MXN
                </p>
              </div>

              <p className="text-center font-serif text-sm text-muted-foreground">
                Recibiras un correo de confirmacion a <strong>{customerEmail}</strong> con los
                detalles de tu pedido.
              </p>

              <div className="rounded-lg border border-border bg-card p-3">
                <p className="font-serif text-sm text-muted-foreground">
                  <Clock className="mr-1.5 inline h-4 w-4" />
                  Tiempo estimado de produccion: 5-8 dias habiles
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" asChild>
                <a href={`/pedidos/${orderId}`}>Ver pedido</a>
              </Button>
              <Button className="flex-1" asChild>
                <a href={routes.home}>Seguir comprando</a>
              </Button>
            </div>
          </>
        )}

        {/* OXXO Reference */}
        {paymentMethod === 'oxxo' && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-[#E4002B]">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="font-sans text-xl">Referencia de pago OXXO</DialogTitle>
              <DialogDescription className="font-serif">
                Pedido #{orderId} creado. Realiza el pago para iniciar la produccion.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-secondary p-4 text-center">
                <p className="font-serif text-sm text-muted-foreground">Monto a pagar</p>
                <p className="font-sans text-2xl font-bold text-foreground">
                  ${total.toLocaleString('es-MX')} MXN
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <p className="mb-2 font-serif text-sm text-muted-foreground">Referencia de pago:</p>
                <div className="flex items-center justify-between rounded-md bg-secondary px-3 py-2">
                  <code className="font-mono text-lg font-bold text-foreground">
                    {oxxoReference}
                  </code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(oxxoReference)}>
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                <p className="font-serif text-sm text-warning">
                  <Clock className="mr-1.5 inline h-4 w-4" />
                  Esta referencia expira en 72 horas
                </p>
              </div>

              <p className="text-center font-serif text-sm text-muted-foreground">
                Recibiras las instrucciones completas a <strong>{customerEmail}</strong>
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" asChild>
                <a href={`/pedidos/${orderId}`}>Ver pedido</a>
              </Button>
              <Button className="flex-1" onClick={() => onOpenChange(false)}>
                Entendido
              </Button>
            </div>
          </>
        )}

        {/* SPEI Instructions */}
        {paymentMethod === 'spei' && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Banknote className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="font-sans text-xl">Instrucciones SPEI</DialogTitle>
              <DialogDescription className="font-serif">
                Pedido #{orderId} creado. Realiza la transferencia para iniciar la produccion.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-secondary p-4 text-center">
                <p className="font-serif text-sm text-muted-foreground">Monto a transferir</p>
                <p className="font-sans text-2xl font-bold text-foreground">
                  ${total.toLocaleString('es-MX')} MXN
                </p>
              </div>

              <div className="space-y-3 rounded-lg border border-border bg-card p-4">
                <div>
                  <p className="font-serif text-xs text-muted-foreground">Banco destino</p>
                  <p className="font-sans font-medium text-foreground">{speiBank}</p>
                </div>
                <div>
                  <p className="mb-1 font-serif text-xs text-muted-foreground">
                    CLABE interbancaria
                  </p>
                  <div className="flex items-center justify-between rounded-md bg-secondary px-3 py-2">
                    <code className="font-mono text-sm font-bold text-foreground">{speiClabe}</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(speiClabe)}>
                      {copied ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="font-serif text-xs text-muted-foreground">Referencia / Concepto</p>
                  <p className="font-sans font-medium text-foreground">{orderId}</p>
                </div>
              </div>

              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="font-serif text-sm text-foreground">
                  <Clock className="mr-1.5 inline h-4 w-4 text-primary" />
                  La CLABE expira en 24 horas. El pago se confirma automaticamente.
                </p>
              </div>

              <p className="text-center font-serif text-sm text-muted-foreground">
                Recibiras las instrucciones completas a <strong>{customerEmail}</strong>
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" asChild>
                <a href={`/pedidos/${orderId}`}>Ver pedido</a>
              </Button>
              <Button className="flex-1" onClick={() => onOpenChange(false)}>
                Entendido
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CreditCard,
  Building2,
  Banknote,
  AlertCircle,
  Info,
} from 'lucide-react'

export type PaymentMethod = 'card' | 'oxxo' | 'spei'

interface PaymentMethodTabsProps {
  selectedMethod: PaymentMethod
  onMethodChange: (method: PaymentMethod) => void
  customerEmail: string
  notes?: string
  onNotesChange?: (notes: string) => void
  className?: string
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: 'Tarjeta',
  oxxo: 'OXXO',
  spei: 'SPEI',
}

export function PaymentMethodTabs({
  selectedMethod,
  onMethodChange,
  customerEmail,
  notes = '',
  onNotesChange,
  className,
}: PaymentMethodTabsProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        <h2 className="font-sans text-lg font-semibold text-foreground">
          Método de pago
        </h2>
      </div>

      <Alert className="border-warning/30 bg-warning/5">
        <AlertCircle className="h-4 w-4 text-warning" />
        <AlertDescription className="font-serif text-sm text-warning">
          Pago real pendiente de integración con Conekta. No se capturan datos bancarios en esta
          fase.
        </AlertDescription>
      </Alert>

      <Tabs
        value={selectedMethod}
        onValueChange={(value) => onMethodChange(value as PaymentMethod)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="card" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Tarjeta</span>
          </TabsTrigger>
          <TabsTrigger value="oxxo" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">OXXO</span>
          </TabsTrigger>
          <TabsTrigger value="spei" className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            <span className="hidden sm:inline">SPEI</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="card" className="mt-4 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-sans font-semibold text-foreground">
              {PAYMENT_METHOD_LABELS.card}
            </h3>
            <p className="mt-2 font-serif text-sm text-muted-foreground">
              Al confirmar se creará tu pedido en estado pendiente de pago. El cobro con tarjeta se
              habilitará cuando integremos Conekta.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="oxxo" className="mt-4 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#E4002B]">
                <span className="font-sans text-lg font-bold text-white">OXXO</span>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-foreground">Pago en OXXO</h3>
                <p className="font-serif text-sm text-muted-foreground">
                  Paga en efectivo en cualquier tienda OXXO
                </p>
              </div>
            </div>

            <div className="space-y-3 font-serif text-sm text-muted-foreground">
              <p>1. Al confirmar, se creará tu pedido pendiente de pago</p>
              <p>2. La referencia OXXO se generará en la siguiente fase (Conekta)</p>
              <p>
                3. Recibirás confirmación por correo a:{' '}
                <strong className="text-foreground">{customerEmail || 'tu correo'}</strong>
              </p>
            </div>
          </div>

          <Alert className="border-warning/30 bg-warning/5">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="font-serif text-sm text-warning">
              Tu pedido avanzará a producción cuando se confirme el pago.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="spei" className="mt-4 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Banknote className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-sans font-semibold text-foreground">Transferencia SPEI</h3>
                <p className="font-serif text-sm text-muted-foreground">
                  Paga desde tu banca en línea
                </p>
              </div>
            </div>

            <div className="space-y-3 font-serif text-sm text-muted-foreground">
              <p>1. Al confirmar, se creará tu pedido pendiente de pago</p>
              <p>2. Las instrucciones SPEI se generarán en la siguiente fase (Conekta)</p>
              <p>
                3. Recibirás confirmación por correo a:{' '}
                <strong className="text-foreground">{customerEmail || 'tu correo'}</strong>
              </p>
            </div>
          </div>

          <Alert className="border-primary/30 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="font-serif text-sm text-foreground">
              Las instrucciones bancarias estarán disponibles cuando integremos Conekta.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {onNotesChange && (
        <div>
          <Label htmlFor="orderNotes" className="font-sans text-sm font-medium">
            Notas del pedido (opcional)
          </Label>
          <Textarea
            id="orderNotes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="mt-1.5 font-serif"
            placeholder="Instrucciones especiales de entrega..."
            rows={3}
          />
        </div>
      )}
    </div>
  )
}

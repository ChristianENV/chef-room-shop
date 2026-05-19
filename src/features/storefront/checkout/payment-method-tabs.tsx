'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Building2, 
  Banknote, 
  Lock,
  AlertCircle,
  Info
} from 'lucide-react'

export type PaymentMethod = 'card' | 'oxxo' | 'spei'

export interface CardPaymentData {
  cardholderName: string
  cardNumber: string
  expirationMonth: string
  expirationYear: string
  cvv: string
  installments: number
}

interface PaymentMethodTabsProps {
  selectedMethod: PaymentMethod
  onMethodChange: (method: PaymentMethod) => void
  cardData: CardPaymentData
  onCardDataChange: (data: CardPaymentData) => void
  customerEmail: string
  errors?: Partial<Record<keyof CardPaymentData, string>>
  className?: string
}

export function PaymentMethodTabs({
  selectedMethod,
  onMethodChange,
  cardData,
  onCardDataChange,
  customerEmail,
  errors,
  className,
}: PaymentMethodTabsProps) {
  const handleCardChange = (field: keyof CardPaymentData, value: string | number) => {
    onCardDataChange({ ...cardData, [field]: value })
  }

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join(' ') : cleaned
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        <h2 className="font-sans text-lg font-semibold text-foreground">
          Metodo de pago
        </h2>
      </div>

      {/* TODO: Integrate with Conekta tokenization
          - Card payments: Use Conekta.js to tokenize card data
          - OXXO: Generate OXXO reference via Conekta API
          - SPEI: Generate SPEI instructions via Conekta API
      */}

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

        {/* Card Payment Tab */}
        <TabsContent value="card" className="mt-4 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            {/* Cardholder Name */}
            <div className="mb-4">
              <Label htmlFor="cardholderName" className="font-sans text-sm font-medium">
                Nombre en la tarjeta *
              </Label>
              <Input
                id="cardholderName"
                value={cardData.cardholderName}
                onChange={(e) => handleCardChange('cardholderName', e.target.value)}
                className={cn('mt-1.5', errors?.cardholderName && 'border-destructive')}
                placeholder="JUAN PEREZ"
              />
              {errors?.cardholderName && (
                <p className="mt-1 font-serif text-xs text-destructive">{errors.cardholderName}</p>
              )}
            </div>

            {/* Card Number */}
            <div className="mb-4">
              <Label htmlFor="cardNumber" className="font-sans text-sm font-medium">
                Numero de tarjeta *
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="cardNumber"
                  value={formatCardNumber(cardData.cardNumber)}
                  onChange={(e) => handleCardChange('cardNumber', e.target.value.replace(/\D/g, ''))}
                  className={cn('pr-12', errors?.cardNumber && 'border-destructive')}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
                <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              {errors?.cardNumber && (
                <p className="mt-1 font-serif text-xs text-destructive">{errors.cardNumber}</p>
              )}
            </div>

            {/* Expiration and CVV */}
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expirationMonth" className="font-sans text-sm font-medium">
                  Mes *
                </Label>
                <Input
                  id="expirationMonth"
                  value={cardData.expirationMonth}
                  onChange={(e) => handleCardChange('expirationMonth', e.target.value.replace(/\D/g, ''))}
                  className={cn('mt-1.5', errors?.expirationMonth && 'border-destructive')}
                  placeholder="MM"
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="expirationYear" className="font-sans text-sm font-medium">
                  Ano *
                </Label>
                <Input
                  id="expirationYear"
                  value={cardData.expirationYear}
                  onChange={(e) => handleCardChange('expirationYear', e.target.value.replace(/\D/g, ''))}
                  className={cn('mt-1.5', errors?.expirationYear && 'border-destructive')}
                  placeholder="AA"
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="cvv" className="font-sans text-sm font-medium">
                  CVV *
                </Label>
                <Input
                  id="cvv"
                  type="password"
                  value={cardData.cvv}
                  onChange={(e) => handleCardChange('cvv', e.target.value.replace(/\D/g, ''))}
                  className={cn('mt-1.5', errors?.cvv && 'border-destructive')}
                  placeholder="***"
                  maxLength={4}
                />
              </div>
            </div>

            {/* Installments Placeholder */}
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="font-serif text-sm text-muted-foreground">
                <Info className="mr-1.5 inline h-4 w-4" />
                Meses sin intereses disponibles proximamente
              </p>
            </div>
          </div>

          {/* Secure Payment Alert */}
          <Alert className="border-success/30 bg-success/5">
            <Lock className="h-4 w-4 text-success" />
            <AlertDescription className="font-serif text-sm text-success">
              Tu informacion de pago esta encriptada y segura. Procesamos pagos con Conekta.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* OXXO Payment Tab */}
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
              <p>1. Al confirmar, recibiras una referencia de pago</p>
              <p>2. Acude a cualquier tienda OXXO con tu referencia</p>
              <p>3. Indica que deseas hacer un pago de servicios Conekta</p>
              <p>4. Recibiras confirmacion por correo a: <strong className="text-foreground">{customerEmail || 'tu email'}</strong></p>
            </div>
          </div>

          <Alert className="border-warning/30 bg-warning/5">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="font-serif text-sm text-warning">
              Tu pedido avanzara a produccion cuando se confirme el pago. La referencia tiene validez de 72 horas.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* SPEI Payment Tab */}
        <TabsContent value="spei" className="mt-4 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Banknote className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-sans font-semibold text-foreground">Transferencia SPEI</h3>
                <p className="font-serif text-sm text-muted-foreground">
                  Paga desde tu banca en linea
                </p>
              </div>
            </div>

            <div className="space-y-3 font-serif text-sm text-muted-foreground">
              <p>1. Al confirmar, recibiras las instrucciones bancarias</p>
              <p>2. Realiza la transferencia desde tu banco</p>
              <p>3. El pago se confirma automaticamente via SPEI</p>
              <p>4. Recibiras confirmacion por correo a: <strong className="text-foreground">{customerEmail || 'tu email'}</strong></p>
            </div>
          </div>

          <Alert className="border-primary/30 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="font-serif text-sm text-foreground">
              Recibiras instrucciones bancarias al confirmar el pedido. La referencia tiene validez de 24 horas.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}

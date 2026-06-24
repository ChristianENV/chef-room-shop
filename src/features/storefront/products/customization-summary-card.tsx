'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PenTool, Image as ImageIcon, Type, ChevronRight } from 'lucide-react'

interface CustomizationSummaryCardProps {
  productId: string
  className?: string
}

const customizationAreas = [
  { id: 'pecho', name: 'Pecho', description: 'Lado izquierdo o derecho' },
  { id: 'espalda', name: 'Espalda', description: 'Parte superior' },
  { id: 'manga', name: 'Manga', description: 'Izquierda o derecha' },
]

const customizationOptions = [
  { id: 'bordado', name: 'Bordado', icon: PenTool, price: 199 },
  { id: 'logo', name: 'Logo', icon: ImageIcon, price: 299 },
  { id: 'texto', name: 'Texto', icon: Type, price: 149 },
]

export function CustomizationSummaryCard({ productId, className }: CustomizationSummaryCardProps) {
  // TODO: Replace with navigation to customizer
  const handleOpenCustomizer = () => {
    console.log('Open customizer for product:', productId)
  }

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between font-sans text-lg">
          Personaliza tu prenda
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Popular
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Areas Available */}
        <div className="space-y-3">
          <h4 className="font-sans text-sm font-medium text-muted-foreground">Areas disponibles</h4>
          <div className="grid grid-cols-3 gap-2">
            {customizationAreas.map((area) => (
              <div
                key={area.id}
                className="rounded-lg border border-border bg-secondary p-3 text-center"
              >
                <p className="font-sans text-sm font-medium text-foreground">{area.name}</p>
                <p className="mt-0.5 font-serif text-xs text-muted-foreground">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <h4 className="font-sans text-sm font-medium text-muted-foreground">
            Opciones de personalizacion
          </h4>
          <div className="space-y-2">
            {customizationOptions.map((option) => {
              const Icon = option.icon
              return (
                <div
                  key={option.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-sans text-sm font-medium text-foreground">
                      {option.name}
                    </span>
                  </div>
                  <span className="font-sans text-sm font-medium text-muted-foreground">
                    +${option.price}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Estimated Extra Cost */}
        <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
          <span className="font-serif text-sm text-muted-foreground">Costo estimado adicional</span>
          <span className="font-sans text-base font-bold text-foreground">Desde $149</span>
        </div>

        {/* CTA */}
        <Button size="lg" onClick={handleOpenCustomizer} className="w-full font-sans">
          Abrir configurador
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

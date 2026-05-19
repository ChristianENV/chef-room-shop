'use client'

import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export function CatalogHero() {
  return (
    <section className="border-b border-border bg-card px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-7xl text-center">
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
          Catalogo Chef Room
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-muted-foreground">
          Explora uniformes profesionales para chef y personalizalos con colores, 
          bordados, logotipos y detalles unicos.
        </p>
        <Button size="lg" className="mt-6 gap-2">
          <Sparkles className="h-4 w-4" />
          Disenar desde cero
        </Button>
      </div>
    </section>
  )
}

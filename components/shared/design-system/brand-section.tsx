'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ChefRoomLogo } from '@/components/brand'
import { CHEF_ROOM_LOGO_SRC } from '@/lib/brand'
import { AlertTriangle, Check, X } from 'lucide-react'

export function BrandSection() {
  return (
    <section id="brand" className="scroll-mt-8">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-sans text-xl">Identidad de Marca</CardTitle>
          <p className="font-serif text-muted-foreground">
            Logo y variantes oficiales de Chef Room by Bedolla
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Logo Variants */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Variantes del Logo
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Logo on Dark */}
              <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6">
                <ChefRoomLogo variant="horizontal" colorScheme="light" size="lg" />
                <span className="font-mono text-xs text-muted-foreground">
                  Horizontal / Fondo Oscuro
                </span>
              </div>

              {/* Logo on Primary */}
              <div className="flex flex-col items-center gap-3 rounded-lg bg-primary p-6">
                <ChefRoomLogo variant="horizontal" colorScheme="light" size="lg" />
                <span className="font-mono text-xs text-white/70">Horizontal / Fondo Primario</span>
              </div>

              {/* Vertical Logo */}
              <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-secondary p-6">
                <ChefRoomLogo variant="vertical" colorScheme="light" />
                <span className="font-mono text-xs text-muted-foreground">Vertical</span>
              </div>

              {/* Symbol Only */}
              <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-muted p-6">
                <ChefRoomLogo variant="wordmark" colorScheme="auto" size="xl" />
                <span className="font-mono text-xs text-muted-foreground">Simbolo</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Logo Sizes */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Tamaños
            </h3>
            <div className="flex flex-wrap items-end gap-8 rounded-lg border border-border bg-secondary p-6">
              <div className="flex flex-col items-center gap-2">
                <ChefRoomLogo variant="horizontal" colorScheme="light" size="sm" />
                <span className="font-mono text-xs text-muted-foreground">SM</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ChefRoomLogo variant="horizontal" colorScheme="light" size="md" />
                <span className="font-mono text-xs text-muted-foreground">MD</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ChefRoomLogo variant="horizontal" colorScheme="light" size="lg" />
                <span className="font-mono text-xs text-muted-foreground">LG</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ChefRoomLogo variant="horizontal" colorScheme="light" size="xl" />
                <span className="font-mono text-xs text-muted-foreground">XL</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Usage Guidelines */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Guías de Uso
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Do's */}
              <div className="rounded-lg border border-chef-success/30 bg-chef-success/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-chef-success">
                  <Check className="h-5 w-5" />
                  <span className="font-sans font-semibold">Correcto</span>
                </div>
                <ul className="space-y-2 font-serif text-sm text-foreground">
                  <li>• Usar sobre fondos de alto contraste</li>
                  <li>• Mantener proporciones originales</li>
                  <li>• Respetar área de protección</li>
                  <li>• Usar variante apropiada para cada fondo</li>
                </ul>
              </div>

              {/* Don'ts */}
              <div className="rounded-lg border border-chef-error/30 bg-chef-error/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-chef-error">
                  <X className="h-5 w-5" />
                  <span className="font-sans font-semibold">Incorrecto</span>
                </div>
                <ul className="space-y-2 font-serif text-sm text-foreground">
                  <li>• No distorsionar o estirar</li>
                  <li>• No cambiar colores arbitrariamente</li>
                  <li>• No rotar o inclinar</li>
                  <li>• No colocar sobre fondos de bajo contraste</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* File References */}
          <div className="rounded-lg bg-secondary p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" />
              <div>
                <p className="font-sans font-medium text-foreground">Archivos de Logo</p>
                <p className="mt-1 font-serif text-sm text-muted-foreground">
                  Archivo oficial del logo en la aplicación:
                </p>
                <ul className="mt-2 space-y-1 font-mono text-xs text-muted-foreground">
                  <li>{CHEF_ROOM_LOGO_SRC}</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

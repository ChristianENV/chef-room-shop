'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface TypographyExampleProps {
  label: string
  font: 'heading' | 'body'
  size: string
  weight: string
  children: React.ReactNode
}

function TypographyExample({ label, font, size, weight, children }: TypographyExampleProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex-1">
        {children}
      </div>
      <div className="flex flex-wrap gap-2 md:flex-col md:items-end md:gap-1">
        <span className="rounded-md bg-secondary px-2 py-1 font-mono text-xs text-foreground">
          {label}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {font === 'heading' ? 'Outfit' : 'Roboto'} · {weight} · {size}
        </span>
      </div>
    </div>
  )
}

export function TypographySection() {
  return (
    <section id="typography" className="scroll-mt-8">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-sans text-xl">Sistema Tipográfico</CardTitle>
          <p className="font-serif text-muted-foreground">
            Outfit para títulos y navegación, Roboto para contenido y formularios
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Headings - Outfit */}
          <div>
            <h3 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Encabezados (Outfit)
            </h3>
            <div className="space-y-3">
              <TypographyExample label="Hero" font="heading" size="48-64px" weight="Bold">
                <h1 className="font-sans text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                  Tu cocina te define
                </h1>
              </TypographyExample>
              
              <TypographyExample label="H1" font="heading" size="36-48px" weight="Bold">
                <h1 className="font-sans text-3xl font-bold text-foreground md:text-4xl">
                  Uniformes Personalizables
                </h1>
              </TypographyExample>
              
              <TypographyExample label="H2" font="heading" size="24-30px" weight="Semibold">
                <h2 className="font-sans text-2xl font-semibold text-foreground md:text-3xl">
                  Colección de Filipinas
                </h2>
              </TypographyExample>
              
              <TypographyExample label="H3" font="heading" size="20-24px" weight="Semibold">
                <h3 className="font-sans text-xl font-semibold text-foreground md:text-2xl">
                  Personalización Premium
                </h3>
              </TypographyExample>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Body Text - Roboto */}
          <div>
            <h3 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Texto de Cuerpo (Roboto)
            </h3>
            <div className="space-y-3">
              <TypographyExample label="Body" font="body" size="16px" weight="Regular">
                <p className="font-serif text-base text-foreground leading-relaxed">
                  Creamos uniformes de chef de la más alta calidad, combinando materiales premium con tecnología de confección avanzada. Cada pieza está diseñada para ofrecer comodidad y durabilidad en el ambiente más exigente.
                </p>
              </TypographyExample>
              
              <TypographyExample label="Small" font="body" size="14px" weight="Regular">
                <p className="font-serif text-sm text-muted-foreground">
                  Incluye personalización de nombre o logo. Envío gratis en pedidos mayores a $1999 MXN.
                </p>
              </TypographyExample>
              
              <TypographyExample label="Price" font="heading" size="24-32px" weight="Bold">
                <div className="flex items-baseline gap-2">
                  <span className="font-sans text-2xl font-bold text-foreground md:text-3xl">$1,299</span>
                  <span className="font-serif text-lg text-muted-foreground line-through">$1,599</span>
                  <span className="font-sans text-sm font-medium text-success">-19%</span>
                </div>
              </TypographyExample>
            </div>
          </div>

          <Separator className="my-6" />

          {/* UI Elements */}
          <div>
            <h3 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Elementos de UI
            </h3>
            <div className="space-y-3">
              <TypographyExample label="Button" font="heading" size="14-16px" weight="Medium">
                <span className="font-sans text-base font-medium text-foreground">
                  Personalizar Ahora
                </span>
              </TypographyExample>
              
              <TypographyExample label="Nav" font="heading" size="14px" weight="Medium">
                <nav className="flex gap-6">
                  <span className="font-sans text-sm font-medium text-foreground">Filipinas</span>
                  <span className="font-sans text-sm font-medium text-muted-foreground">Mandiles</span>
                  <span className="font-sans text-sm font-medium text-muted-foreground">Pantalones</span>
                </nav>
              </TypographyExample>
              
              <TypographyExample label="Form Label" font="body" size="14px" weight="Medium">
                <label className="font-serif text-sm font-medium text-foreground">
                  Nombre para bordado
                </label>
              </TypographyExample>
              
              <TypographyExample label="Caption" font="body" size="12px" weight="Regular">
                <span className="font-serif text-xs uppercase tracking-wider text-muted-foreground">
                  Filipinas · Personalizable
                </span>
              </TypographyExample>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

import { routes } from '@/src/config/routes'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  'Elige colores de la prenda',
  'Agrega tu nombre o texto personalizado',
  'Sube tu logotipo en alta resolucion',
  'Visualiza cambios en tiempo real',
  'Guarda y retoma tus disenos',
]

interface CustomizerTeaserProps {
  className?: string
}

export function CustomizerTeaser({ className }: CustomizerTeaserProps) {
  return (
    <section className={cn('bg-secondary py-20 md:py-28', className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left - Customizer UI mockup */}
          <div className="relative order-2 lg:order-1">
            <div className="relative mx-auto max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              {/* Mockup header bar */}
              <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-border" />
                <div className="h-2.5 w-2.5 rounded-full bg-border" />
                <div className="h-2.5 w-2.5 rounded-full bg-border" />
                <div className="ml-4 h-5 w-48 rounded bg-accent" />
              </div>

              {/* Mockup content */}
              <div className="grid grid-cols-5">
                {/* Sidebar panel */}
                <div className="col-span-2 border-r border-border bg-accent/50 p-4">
                  <div className="space-y-3">
                    <div className="h-3 w-16 rounded bg-muted-foreground/20" />
                    <div className="h-9 w-full rounded-lg border border-primary/30 bg-primary/5" />
                    <div className="h-9 w-full rounded-lg bg-accent" />
                    <div className="h-9 w-full rounded-lg bg-accent" />
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="h-3 w-12 rounded bg-muted-foreground/20" />
                    <div className="flex gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary" />
                      <div className="h-7 w-7 rounded-full bg-foreground" />
                      <div className="h-7 w-7 rounded-full border border-border bg-card" />
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="h-3 w-20 rounded bg-muted-foreground/20" />
                    <div className="h-9 w-full rounded-lg bg-accent" />
                  </div>
                </div>

                {/* Preview area */}
                <div className="col-span-3 flex items-center justify-center p-8">
                  <div className="relative">
                    <div className="h-44 w-32 rounded-lg bg-gradient-to-b from-primary/15 to-primary/5">
                      <div className="absolute left-1/2 top-6 h-3 w-3 -translate-x-1/2 rounded-full bg-primary/30" />
                      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded bg-card px-3 py-1 shadow-sm">
                        <span className="font-sans text-[9px] font-bold tracking-widest text-primary">
                          CHEF MARTINEZ
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <div className="mx-auto h-2 w-16 rounded bg-muted-foreground/15" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mockup footer */}
              <div className="flex items-center justify-between border-t border-border px-5 py-3">
                <div className="h-3 w-24 rounded bg-muted-foreground/15" />
                <div className="h-8 w-28 rounded-full bg-primary" />
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="order-1 lg:order-2">
            <p className="font-sans text-[13px] font-semibold tracking-[0.2em] uppercase text-primary">
              Personalizador en linea
            </p>
            <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Disena tu uniforme, exactamente como lo imaginas
            </h2>
            <p className="mt-6 font-serif text-lg leading-relaxed text-muted-foreground">
              Nuestro personalizador te permite visualizar cada cambio al instante.
              Colores, bordados, logotipos, tipografia. Todo en tiempo real antes de
              confirmar tu pedido.
            </p>

            <ul className="mt-10 space-y-4">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="font-serif text-[15px] text-foreground">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Button
                size="lg"
                className="h-12 rounded-full bg-primary px-8 font-sans text-sm font-semibold tracking-wide text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl"
                asChild
              >
                <Link href={routes.customize}>
                  Probar el personalizador
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

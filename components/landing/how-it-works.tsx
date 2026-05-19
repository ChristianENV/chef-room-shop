import { cn } from '@/lib/utils'

const steps = [
  {
    number: '01',
    title: 'Elige tu prenda',
    description:
      'Selecciona entre filipinas, mandiles, pantalones y accesorios de nuestra coleccion profesional.',
  },
  {
    number: '02',
    title: 'Personaliza',
    description:
      'Cambia colores, agrega tu nombre, logotipo y elige los detalles que te representan.',
  },
  {
    number: '03',
    title: 'Revisa tu diseno',
    description:
      'Visualiza tu creacion en tiempo real y confirma que cada detalle sea exacto.',
  },
  {
    number: '04',
    title: 'Recibe en tu cocina',
    description:
      'Produccion profesional y envio seguro directo a tu lugar de trabajo.',
  },
]

interface HowItWorksProps {
  className?: string
}

export function HowItWorks({ className }: HowItWorksProps) {
  return (
    <section className={cn('bg-card py-20 md:py-28', className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <p className="font-sans text-[13px] font-semibold tracking-[0.2em] uppercase text-primary">
            Proceso
          </p>
          <h2 className="mx-auto mt-4 max-w-lg font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Cuatro pasos para tu uniforme ideal
          </h2>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="bg-card p-8 md:p-10">
              <span className="font-sans text-3xl font-bold text-primary/20">
                {step.number}
              </span>
              <h3 className="mt-4 font-sans text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 font-serif text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

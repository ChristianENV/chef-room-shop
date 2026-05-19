import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de privacidad | Chef Room by Bedolla',
  description: 'Política de privacidad de Chef Room. Información sobre el tratamiento de datos personales.',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
      <p className="font-sans text-[13px] font-semibold tracking-[0.2em] uppercase text-primary">
        Legal
      </p>
      <h1 className="brand-underline mt-4 font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Política de privacidad
      </h1>
      <p className="mt-6 font-serif text-lg leading-relaxed text-muted-foreground">
        Esta página estará disponible próximamente con el detalle completo de nuestra política de
        privacidad y el tratamiento de datos personales.
      </p>
    </div>
  )
}

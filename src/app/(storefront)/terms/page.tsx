import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y condiciones | Chef Room by Bedolla',
  description: 'Términos y condiciones de uso del sitio y servicios de Chef Room.',
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
      <p className="font-sans text-[13px] font-semibold tracking-[0.2em] uppercase text-primary">
        Legal
      </p>
      <h1 className="brand-underline mt-4 font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Términos y condiciones
      </h1>
      <p className="mt-6 font-serif text-lg leading-relaxed text-muted-foreground">
        Esta página estará disponible próximamente con los términos y condiciones completos de uso
        del sitio y nuestros servicios.
      </p>
    </div>
  )
}

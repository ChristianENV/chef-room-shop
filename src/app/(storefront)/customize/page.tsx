import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'

export const metadata: Metadata = {
  title: 'Personaliza tu uniforme | Chef Room by Bedolla',
  description:
    'Demo tecnica del customizador. Selecciona un producto desde su detalle para personalizar con datos reales.',
}

export default function CustomizePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="font-sans text-[13px] font-semibold uppercase tracking-[0.2em] text-primary">
        Demo técnica
      </p>
      <h1 className="mt-4 font-sans text-3xl font-bold text-foreground">
        Customizador de uniformes
      </h1>
      <p className="mt-4 font-serif text-muted-foreground">
        Para personalizar un producto real, entra a su página de detalle y usa el botón
        {' '}
        <span className="font-semibold text-foreground">Personalizar</span>.
      </p>
      <div className="mt-8">
        <Button asChild>
          <Link href={routes.shop}>Ir a tienda</Link>
        </Button>
      </div>
    </div>
  )
}

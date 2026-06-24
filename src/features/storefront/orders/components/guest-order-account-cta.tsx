import Link from 'next/link'
import { UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'

type GuestOrderAccountCtaProps = {
  loginUrl: string
  registerUrl: string
  claimUrl?: string | null
}

/**
 * Prompts guest buyers to create an account or sign in from the purchase page.
 */
export function GuestOrderAccountCta({
  loginUrl,
  registerUrl,
  claimUrl,
}: GuestOrderAccountCtaProps) {
  return (
    <section
      className="rounded-xl border border-primary/20 bg-primary/5 p-6"
      aria-labelledby="guest-account-cta-title"
    >
      <div className="flex items-start gap-3">
        <UserPlus className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2
            id="guest-account-cta-title"
            className="font-sans text-lg font-semibold text-foreground"
          >
            Crea tu cuenta para guardar y consultar este pedido
          </h2>
          <p className="mt-2 font-serif text-sm text-muted-foreground">
            Después de iniciar sesión o registrarte volverás a esta compra para ver el seguimiento
            completo en tu cuenta.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button asChild className="font-sans" data-testid="guest-create-account-button">
              <Link href={registerUrl}>Crear cuenta</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="font-sans"
              data-testid="guest-login-button"
            >
              <Link href={loginUrl}>Iniciar sesión</Link>
            </Button>
            {claimUrl && (
              <Button asChild variant="secondary" className="font-sans">
                <Link href={claimUrl}>Reclamar pedido</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

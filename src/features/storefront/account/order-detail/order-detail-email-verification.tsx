import Link from 'next/link'
import { Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { VerifyEmailResend } from '@/src/features/storefront/auth/verify-email-resend'
import { routes } from '@/src/config/routes'

type OrderDetailEmailVerificationProps = {
  callbackUrl: string
}

/**
 * Blocks order detail until the user verifies their email.
 */
export function OrderDetailEmailVerification({ callbackUrl }: OrderDetailEmailVerificationProps) {
  const verifyHref = `${routes.verifyEmail}?callbackUrl=${encodeURIComponent(callbackUrl)}`

  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-3">
          <Mail className="h-8 w-8 text-primary" aria-hidden />
        </div>
        <h2 className="font-sans text-lg font-semibold text-foreground">
          Verifica tu correo para consultar el detalle de tu pedido
        </h2>
        <p className="mt-2 max-w-md font-serif text-sm text-muted-foreground">
          Por seguridad, necesitamos confirmar que eres el titular del correo asociado a esta compra
          antes de mostrar la información completa.
        </p>
        <div className="mt-6 flex w-full max-w-sm flex-col items-center gap-3">
          <VerifyEmailResend callbackURL={callbackUrl} />
          <Button asChild variant="outline" className="w-full font-sans">
            <Link href={verifyHref}>Ir a verificación de correo</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

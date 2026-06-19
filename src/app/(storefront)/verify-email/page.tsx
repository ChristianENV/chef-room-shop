'use client'

import { Suspense, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AuthLayout } from '@/src/features/storefront/auth'
import { VerifyEmailResend } from '@/src/features/storefront/auth/verify-email-resend'
import { routes } from '@/src/config/routes'
import { useSession } from '@/src/lib/auth/auth-client'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')
  const { data: session } = useSession()

  const callbackURL = useMemo(() => {
    if (callbackUrl?.startsWith('/')) return callbackUrl
    return routes.account
  }, [callbackUrl])

  const userEmail = session?.user?.email

  if (session?.user?.emailVerified) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center md:p-8">
        <h1 className="font-sans text-xl font-bold text-foreground">Correo verificado</h1>
        <p className="mt-2 font-serif text-muted-foreground">
          Tu correo ya está confirmado. Puedes continuar.
        </p>
        <Button asChild className="mt-6 font-sans">
          <Link href={callbackURL}>Continuar</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 md:p-8">
      <div className="mb-4 flex justify-center">
        <div className="rounded-full bg-primary/10 p-3">
          <Mail className="h-8 w-8 text-primary" />
        </div>
      </div>
      <h1 className="text-center font-sans text-xl font-bold text-foreground">
        Verifica tu correo
      </h1>
      <p className="mt-3 text-center font-serif text-muted-foreground">
        Te enviamos un enlace de verificación. Revisa tu bandeja de entrada
        {userEmail ? (
          <>
            {' '}
            (<span className="font-medium text-foreground">{userEmail}</span>)
          </>
        ) : null}
        .
      </p>
      <p className="mt-2 text-center font-serif text-sm text-muted-foreground">
        Necesitamos confirmar tu correo para proteger la información de tus pedidos.
      </p>

      <div className="mt-6 flex flex-col items-center gap-3">
        <VerifyEmailResend callbackURL={callbackURL} email={userEmail} />
        <Button asChild variant="ghost" className="font-sans">
          <Link href={routes.home}>Volver al inicio</Link>
        </Button>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={<p className="py-12 text-center font-serif text-muted-foreground">Cargando...</p>}
      >
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  )
}

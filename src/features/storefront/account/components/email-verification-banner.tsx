'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'
import { useSession } from '@/src/lib/auth/auth-client'

/**
 * Banner when the signed-in user has not verified their email yet.
 */
export function EmailVerificationBanner() {
  const { data: session } = useSession()

  if (!session?.user || session.user.emailVerified) {
    return null
  }

  return (
    <Alert className="mb-6 border-warning/30 bg-warning/5">
      <AlertCircle className="h-4 w-4 text-warning" />
      <AlertDescription className="flex flex-col gap-3 font-serif text-sm sm:flex-row sm:items-center sm:justify-between">
        <span>
          Verifica tu correo para proteger tu cuenta y el acceso a tus pedidos.
        </span>
        <Button asChild size="sm" variant="outline" className="shrink-0 font-sans">
          <Link href={routes.verifyEmail}>Verificar correo</Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}

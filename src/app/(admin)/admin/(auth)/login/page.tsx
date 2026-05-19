import { Suspense } from 'react'
import { LoginForm } from '@/components/shared/auth'
import { isGoogleAuthConfigured } from '@/src/lib/auth/google-enabled'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión Admin | Chef Room by Bedolla',
  description: 'Acceso al panel de administración de Chef Room.',
}

export default function AdminLoginPage() {
  const googleEnabled = isGoogleAuthConfigured()

  return (
    <Suspense
      fallback={
        <p className="py-12 text-center font-serif text-muted-foreground">
          Cargando...
        </p>
      }
    >
      <LoginForm variant="admin" googleEnabled={googleEnabled} />
    </Suspense>
  )
}

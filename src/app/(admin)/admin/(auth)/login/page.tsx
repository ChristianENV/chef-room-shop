import { Suspense } from 'react'
import { LoginForm } from '@/components/shared/auth'
import { isGoogleAuthConfigured } from '@/src/lib/auth/google-enabled'
import { redirectIfAuthenticatedAdminLogin } from '@/src/server/auth/redirect-if-authenticated'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión Admin | Chef Room by Bedolla',
  description: 'Acceso al panel de administración de Chef Room.',
}

export default async function AdminLoginPage() {
  await redirectIfAuthenticatedAdminLogin()

  const googleEnabled = isGoogleAuthConfigured()

  return (
    <Suspense
      fallback={<p className="py-12 text-center font-serif text-muted-foreground">Cargando...</p>}
    >
      <LoginForm variant="admin" googleEnabled={googleEnabled} />
    </Suspense>
  )
}

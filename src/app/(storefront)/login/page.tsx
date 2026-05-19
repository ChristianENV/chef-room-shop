import { Suspense } from 'react'
import { AuthLayout, LoginForm } from '@/src/features/storefront/auth'
import { isGoogleAuthConfigured } from '@/src/lib/auth/google-enabled'
import { redirectIfAuthenticated } from '@/src/server/auth/redirect-if-authenticated'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Chef Room by Bedolla',
  description:
    'Inicia sesión en tu cuenta de Chef Room para diseñar y comprar uniformes de chef personalizados.',
}

export default async function LoginPage() {
  await redirectIfAuthenticated('storefront-login')

  const googleEnabled = isGoogleAuthConfigured()

  return (
    <AuthLayout>
      <Suspense
        fallback={
          <p className="py-12 text-center font-serif text-muted-foreground">
            Cargando...
          </p>
        }
      >
        <LoginForm googleEnabled={googleEnabled} />
      </Suspense>
    </AuthLayout>
  )
}

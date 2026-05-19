import { Suspense } from 'react'
import { AuthLayout, RegisterForm } from '@/src/features/storefront/auth'
import { isGoogleAuthConfigured } from '@/src/lib/auth/google-enabled'
import { redirectIfAuthenticated } from '@/src/server/auth/redirect-if-authenticated'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear Cuenta | Chef Room by Bedolla',
  description:
    'Crea tu cuenta en Chef Room para diseñar uniformes de chef personalizados y acceder a ofertas exclusivas.',
}

export default async function RegisterPage() {
  await redirectIfAuthenticated('storefront-register')

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
        <RegisterForm googleEnabled={googleEnabled} />
      </Suspense>
    </AuthLayout>
  )
}

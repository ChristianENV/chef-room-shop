import { Suspense } from 'react'
import type { Metadata } from 'next'

import { AuthLayout, ForgotPasswordForm } from '@/src/features/storefront/auth'

export const metadata: Metadata = {
  title: 'Recuperar Contraseña | Chef Room by Bedolla',
  description: 'Solicita un enlace para restablecer la contraseña de tu cuenta Chef Room.',
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={<p className="py-12 text-center font-serif text-muted-foreground">Cargando...</p>}
      >
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  )
}

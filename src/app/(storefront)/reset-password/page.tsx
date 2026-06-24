import { Suspense } from 'react'
import type { Metadata } from 'next'

import { AuthLayout, ResetPasswordForm } from '@/src/features/storefront/auth'

export const metadata: Metadata = {
  title: 'Restablecer Contraseña | Chef Room by Bedolla',
  description: 'Elige una nueva contraseña para tu cuenta Chef Room.',
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={<p className="py-12 text-center font-serif text-muted-foreground">Cargando...</p>}
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  )
}

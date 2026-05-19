import { AuthLayout, RegisterForm } from '@/src/features/storefront/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear Cuenta | Chef Room by Bedolla',
  description: 'Crea tu cuenta en Chef Room para diseñar uniformes de chef personalizados y acceder a ofertas exclusivas.',
}

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
}

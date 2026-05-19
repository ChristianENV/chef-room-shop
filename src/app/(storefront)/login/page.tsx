import { AuthLayout, LoginForm } from '@/src/features/storefront/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Chef Room by Bedolla',
  description: 'Inicia sesión en tu cuenta de Chef Room para diseñar y comprar uniformes de chef personalizados.',
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}

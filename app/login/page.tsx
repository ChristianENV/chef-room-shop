import { AuthLayout, LoginForm } from '@/components/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesion | Chef Room by Bedolla',
  description: 'Inicia sesion en tu cuenta de Chef Room para disenar y comprar uniformes de chef personalizados.',
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}

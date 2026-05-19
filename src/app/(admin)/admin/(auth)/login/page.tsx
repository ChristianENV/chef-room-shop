import { LoginForm } from '@/components/shared/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión Admin | Chef Room by Bedolla',
  description: 'Acceso al panel de administración de Chef Room.',
}

export default function AdminLoginPage() {
  return <LoginForm />
}

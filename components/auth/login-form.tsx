'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

interface LoginFormProps {
  className?: string
  onSuccess?: () => void
}

export function LoginForm({ className, onSuccess }: LoginFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // TODO: Replace with real authentication
  // Integration points:
  // - JWT token storage in httpOnly cookies
  // - Session management with refresh tokens
  // - TanStack Query for auth state
  // - GraphQL mutation for login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Mock validation
    // TODO: Replace with Zod schema validation
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos')
      setIsLoading(false)
      return
    }

    if (!formData.email.includes('@')) {
      setError('Por favor ingresa un correo electronico valido')
      setIsLoading(false)
      return
    }

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock error for demo (use test@error.com to trigger)
    if (formData.email === 'test@error.com') {
      setError('Credenciales incorrectas. Por favor verifica tu correo y contrasena.')
      setIsLoading(false)
      return
    }

    // Success
    setIsLoading(false)
    onSuccess?.()
    router.push('/account')
  }

  const handleGoogleLogin = async () => {
    // TODO: Implement Google OAuth
    // Integration point: NextAuth.js or custom OAuth flow
    console.log('Google login clicked - integration pending')
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="font-sans text-2xl font-bold text-foreground">
          Bienvenido de vuelta
        </h1>
        <p className="font-serif text-muted-foreground">
          Inicia sesion para acceder a tu cuenta
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="font-sans text-sm font-medium">
            Correo electronico
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10 font-serif"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="font-sans text-sm font-medium">
              Contrasena
            </Label>
            <Link 
              href="/recuperar-contrasena" 
              className="font-serif text-xs text-accent hover:underline"
            >
              Olvidaste tu contrasena?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="********"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pl-10 pr-10 font-serif"
              disabled={isLoading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={formData.rememberMe}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, rememberMe: checked as boolean })
            }
            disabled={isLoading}
          />
          <Label 
            htmlFor="remember" 
            className="font-serif text-sm text-muted-foreground cursor-pointer"
          >
            Mantener sesion iniciada
          </Label>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full font-sans font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesion...
            </>
          ) : (
            'Iniciar Sesion'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 font-serif text-muted-foreground">
            O continua con
          </span>
        </div>
      </div>

      {/* Google Login */}
      <Button
        type="button"
        variant="outline"
        className="w-full font-sans"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continuar con Google
      </Button>

      {/* Register Link */}
      <p className="text-center font-serif text-sm text-muted-foreground">
        No tienes cuenta?{' '}
        <Link href="/register" className="font-sans font-medium text-accent hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, LogIn } from 'lucide-react'
import Link from 'next/link'

// Admin Only State
interface AdminOnlyStateProps {
  message?: string
  showContactLink?: boolean
  className?: string
}

export function AdminOnlyState({ 
  message = 'Esta seccion esta restringida a administradores.',
  showContactLink = true,
  className 
}: AdminOnlyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 text-center',
      className
    )}>
      <div className="mb-4 rounded-full bg-primary/10 p-4">
        <Shield className="h-8 w-8 text-primary" />
      </div>
      <h3 className="font-sans text-lg font-semibold text-foreground">
        Acceso de administrador requerido
      </h3>
      <p className="mt-2 max-w-md font-serif text-muted-foreground">
        {message}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Ir al inicio</Link>
        </Button>
        {showContactLink && (
          <Button variant="outline" asChild>
            <Link href="/contact">Contactar soporte</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

// Login Required State
interface LoginRequiredStateProps {
  message?: string
  returnUrl?: string
  className?: string
}

export function LoginRequiredState({ 
  message = 'Necesitas iniciar sesion para acceder a esta seccion.',
  returnUrl,
  className 
}: LoginRequiredStateProps) {
  const loginHref = returnUrl 
    ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
    : '/login'

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardContent className="py-12">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-secondary p-4">
            <LogIn className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-sans text-lg font-semibold text-foreground">
            Inicia sesion
          </h3>
          <p className="mt-2 max-w-md font-serif text-muted-foreground">
            {message}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href={loginHref}>
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar sesion
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register">Crear cuenta</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Feature Locked State
interface FeatureLockedStateProps {
  featureName: string
  description?: string
  upgradeHref?: string
  className?: string
}

export function FeatureLockedState({ 
  featureName,
  description = 'Esta funcion no esta disponible en tu plan actual.',
  upgradeHref = '/account/suscripcion',
  className 
}: FeatureLockedStateProps) {
  return (
    <Card className={cn('border-primary/30 bg-card', className)}>
      <CardContent className="py-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-sans text-lg font-semibold text-foreground">
            {featureName}
          </h3>
          <p className="mt-2 max-w-md font-serif text-muted-foreground">
            {description}
          </p>
          <Button className="mt-6" asChild>
            <Link href={upgradeHref}>Ver planes</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

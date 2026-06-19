'use client'
import { routes } from '@/src/config/routes'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Mail, Phone, User } from 'lucide-react'

export interface ContactFormData {
  email: string
  phone: string
}

interface ContactFormProps {
  data: ContactFormData
  onChange: (data: ContactFormData) => void
  errors?: Partial<Record<keyof ContactFormData, string>>
  className?: string
}

export function ContactForm({ data, onChange, errors, className }: ContactFormProps) {
  const handleChange = (field: keyof ContactFormData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-primary" />
        <h2 className="font-sans text-lg font-semibold text-foreground">Informacion de contacto</h2>
      </div>

      <p className="font-serif text-sm text-muted-foreground">
        Usaremos esta informacion para confirmaciones y actualizaciones del pedido.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Email */}
        <div className="sm:col-span-2">
          <Label htmlFor="email" className="font-sans text-sm font-medium">
            Correo electronico *
          </Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={cn('pl-10', errors?.email && 'border-destructive')}
              required
            />
          </div>
          {errors?.email && (
            <p className="mt-1 font-serif text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="sm:col-span-2">
          <Label htmlFor="phone" className="font-sans text-sm font-medium">
            Telefono *
          </Label>
          <div className="relative mt-1.5">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="+52 55 1234 5678"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={cn('pl-10', errors?.phone && 'border-destructive')}
              required
            />
          </div>
          {errors?.phone && (
            <p className="mt-1 font-serif text-xs text-destructive">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Login Suggestion */}
      <div className="rounded-lg border border-border bg-secondary/50 p-3">
        <p className="font-serif text-sm text-muted-foreground">
          Ya tienes cuenta?{' '}
          <a href={routes.login} className="font-sans font-medium text-primary hover:underline">
            Inicia sesion
          </a>{' '}
          para un checkout mas rapido.
        </p>
      </div>
    </div>
  )
}

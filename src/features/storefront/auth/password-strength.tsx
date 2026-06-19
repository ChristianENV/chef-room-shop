'use client'

import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
  password: string
  className?: string
}

type StrengthLevel = 'weak' | 'medium' | 'strong' | 'very-strong'

interface StrengthResult {
  level: StrengthLevel
  score: number
  label: string
  color: string
}

function calculateStrength(password: string): StrengthResult {
  let score = 0

  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  if (score <= 2) {
    return { level: 'weak', score: 1, label: 'Debil', color: 'bg-destructive' }
  }
  if (score <= 3) {
    return { level: 'medium', score: 2, label: 'Media', color: 'bg-warning' }
  }
  if (score <= 4) {
    return { level: 'strong', score: 3, label: 'Fuerte', color: 'bg-success' }
  }
  return { level: 'very-strong', score: 4, label: 'Muy fuerte', color: 'bg-success' }
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = calculateStrength(password)

  if (!password) return null

  return (
    <div className={cn('space-y-2', className)}>
      {/* Strength Bars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              level <= strength.score ? strength.color : 'bg-muted',
            )}
          />
        ))}
      </div>

      {/* Strength Label */}
      <p
        className={cn(
          'font-serif text-xs',
          strength.level === 'weak' && 'text-destructive',
          strength.level === 'medium' && 'text-warning',
          (strength.level === 'strong' || strength.level === 'very-strong') && 'text-success',
        )}
      >
        Seguridad: {strength.label}
      </p>

      {/* Requirements */}
      {strength.level === 'weak' && (
        <ul className="space-y-1 font-serif text-xs text-muted-foreground">
          <li className={cn(password.length >= 8 ? 'text-success' : '')}>
            {password.length >= 8 ? '✓' : '○'} Minimo 8 caracteres
          </li>
          <li className={cn(/[A-Z]/.test(password) ? 'text-success' : '')}>
            {/[A-Z]/.test(password) ? '✓' : '○'} Una mayuscula
          </li>
          <li className={cn(/[0-9]/.test(password) ? 'text-success' : '')}>
            {/[0-9]/.test(password) ? '✓' : '○'} Un numero
          </li>
        </ul>
      )}
    </div>
  )
}

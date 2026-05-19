'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  variant?: 'ghost' | 'outline'
  showLabel?: boolean
}

export function ThemeToggle({
  className,
  variant = 'ghost',
  showLabel = false,
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'
  const label = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'

  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={showLabel ? 'default' : 'icon'}
        className={cn(showLabel ? 'w-full justify-start gap-2' : 'h-9 w-9', className)}
        disabled
        aria-label="Cambiar tema"
      >
        <Sun className="h-4 w-4" />
        {showLabel && <span className="font-sans text-sm">Tema</span>}
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={showLabel ? 'default' : 'icon'}
      className={cn(
        'transition-colors',
        showLabel ? 'w-full justify-start gap-2' : 'h-9 w-9',
        className
      )}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={label}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {showLabel && <span className="font-sans text-sm">{isDark ? 'Modo claro' : 'Modo oscuro'}</span>}
    </Button>
  )
}

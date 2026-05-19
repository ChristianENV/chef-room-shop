'use client'

import { cn } from '@/lib/utils'

interface ChefRoomLogoProps {
  variant?: 'full' | 'horizontal' | 'vertical' | 'wordmark'
  colorScheme?: 'auto' | 'light' | 'dark'
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function ChefRoomLogo({
  variant = 'horizontal',
  colorScheme = 'auto',
  className,
  size = 'md',
}: ChefRoomLogoProps) {
  // auto = uses foreground color (works with both themes)
  // light = white text (for use on dark/blue backgrounds)
  // dark = brand blue text (for explicit light backgrounds)
  const primaryColor =
    colorScheme === 'light'
      ? 'text-white'
      : colorScheme === 'dark'
        ? 'text-[#2B3280]'
        : 'text-foreground'

  const secondaryColor =
    colorScheme === 'light'
      ? 'text-white/60'
      : colorScheme === 'dark'
        ? 'text-[#6B6F85]'
        : 'text-muted-foreground'

  const sizeMap = {
    sm: { main: 'text-sm', sub: 'text-[9px]', gap: 'gap-0.5' },
    md: { main: 'text-base', sub: 'text-[10px]', gap: 'gap-0.5' },
    lg: { main: 'text-lg', sub: 'text-[11px]', gap: 'gap-1' },
    xl: { main: 'text-2xl', sub: 'text-xs', gap: 'gap-1' },
  }

  const s = sizeMap[size]

  if (variant === 'wordmark') {
    return (
      <span
        className={cn(
          'font-sans font-bold tracking-[0.15em] uppercase',
          s.main,
          primaryColor,
          className
        )}
      >
        Chef Room
      </span>
    )
  }

  if (variant === 'vertical') {
    return (
      <div className={cn('flex flex-col items-center', s.gap, className)}>
        <span
          className={cn(
            'font-sans font-bold tracking-[0.15em] uppercase leading-none',
            s.main,
            primaryColor
          )}
        >
          Chef Room
        </span>
        <span
          className={cn(
            'font-serif font-light tracking-[0.25em] uppercase leading-none',
            s.sub,
            secondaryColor
          )}
        >
          by Bedolla
        </span>
      </div>
    )
  }

  // Default: horizontal
  return (
    <div className={cn('flex items-baseline', s.gap, className)}>
      <span
        className={cn(
          'font-sans font-bold tracking-[0.15em] uppercase leading-none',
          s.main,
          primaryColor
        )}
      >
        Chef Room
      </span>
      <span
        className={cn(
          'font-serif font-light tracking-[0.2em] uppercase leading-none',
          s.sub,
          secondaryColor
        )}
      >
        by Bedolla
      </span>
    </div>
  )
}

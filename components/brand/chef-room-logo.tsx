import Image from 'next/image'
import { cn } from '@/lib/utils'
import { BRAND_SHORT, CHEF_ROOM_LOGO_SRC } from '@/lib/brand'

interface ChefRoomLogoProps {
  variant?: 'full' | 'horizontal' | 'vertical' | 'wordmark'
  colorScheme?: 'auto' | 'light' | 'dark'
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  priority?: boolean
}

const LOGO_WIDTH = 963
const LOGO_HEIGHT = 222

const heightClasses = {
  sm: 'h-5',
  md: 'h-7',
  lg: 'h-9',
  xl: 'h-14',
} as const

function colorSchemeClasses(colorScheme: ChefRoomLogoProps['colorScheme']): string {
  switch (colorScheme) {
    case 'light':
      return 'mix-blend-screen'
    case 'dark':
      return 'invert'
    case 'auto':
    default:
      return 'invert dark:mix-blend-screen dark:invert-0'
  }
}

export function ChefRoomLogo({
  variant = 'horizontal',
  colorScheme = 'auto',
  className,
  size = 'md',
  priority = false,
}: ChefRoomLogoProps) {
  const resolvedSize = variant === 'wordmark' ? 'sm' : size

  return (
    <Image
      src={CHEF_ROOM_LOGO_SRC}
      alt={`${BRAND_SHORT} by Bedolla`}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      className={cn(
        'w-auto shrink-0 object-contain object-left',
        heightClasses[resolvedSize],
        colorSchemeClasses(colorScheme),
        variant === 'vertical' && 'mx-auto object-center',
        className
      )}
    />
  )
}

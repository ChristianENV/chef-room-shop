'use client'

import Image from 'next/image'

import { cn } from '@/lib/utils'

const CHEF_AVATAR_ALT = 'Chef profesional usando uniforme Chef Room'

type ChefAvatarStackProps = {
  avatars: readonly string[]
  size?: number
  overlap?: number
  className?: string
}

export function ChefAvatarStack({
  avatars,
  size = 40,
  overlap = 10,
  className,
}: ChefAvatarStackProps) {
  if (avatars.length === 0) return null

  const stackWidth = size + (avatars.length - 1) * (size - overlap)

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: stackWidth, height: size }}
      aria-hidden={false}
    >
      {avatars.map((src, index) => (
        <div
          key={src}
          className="absolute top-0 overflow-hidden rounded-full border-2 border-background bg-[#121421] shadow-md ring-1 ring-primary/20"
          style={{
            width: size,
            height: size,
            left: index * (size - overlap),
            zIndex: avatars.length - index,
          }}
        >
          <Image
            src={src}
            alt={CHEF_AVATAR_ALT}
            width={size}
            height={size}
            className="size-full object-cover"
            sizes={`${size}px`}
          />
        </div>
      ))}
    </div>
  )
}

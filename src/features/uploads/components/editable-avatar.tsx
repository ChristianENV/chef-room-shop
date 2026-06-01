'use client'

import { useCallback, useState } from 'react'
import { Pencil } from 'lucide-react'

import { UserAvatar } from '@/components/shared/user-avatar'
import { cn } from '@/lib/utils'
import type { UserDisplayInput } from '@/src/lib/user/user-display'
import { AvatarUploadDialog } from './avatar-upload-dialog'

export type EditableAvatarProps = {
  /** User data for display (image, name, initials). */
  user: UserDisplayInput | null
  className?: string
  /** Called after the server confirms the upload. Receives the new image URL. */
  onUploadSuccess?: (imageUrl: string | null) => void
}

/**
 * Large avatar with a pencil badge in the lower-right corner.
 *
 * Clicking opens the {@link AvatarUploadDialog}. The component is fully
 * keyboard-accessible: Tab to focus, Enter/Space to open the dialog.
 */
export function EditableAvatar({ user, className, onUploadSuccess }: EditableAvatarProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [optimisticImageUrl, setOptimisticImageUrl] = useState<string | null>(null)

  const displayUser: UserDisplayInput | null = optimisticImageUrl
    ? { ...user, image: optimisticImageUrl }
    : user

  const handleSuccess = useCallback(
    (imageUrl: string | null) => {
      setOptimisticImageUrl(imageUrl)
      onUploadSuccess?.(imageUrl)
    },
    [onUploadSuccess],
  )

  return (
    <>
      <button
        type="button"
        className={cn(
          'group relative inline-flex shrink-0 cursor-pointer rounded-full outline-none',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          className,
        )}
        aria-label="Editar foto de perfil"
        onClick={() => setDialogOpen(true)}
      >
        {/* Avatar */}
        <UserAvatar
          user={displayUser}
          size="xl"
          className="transition-[opacity,transform] duration-200 group-hover:opacity-85 group-hover:scale-[1.03]"
          decorative
        />

        {/* Hover overlay */}
        <span
          aria-hidden
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-full',
            'bg-black/0 transition-colors duration-200 group-hover:bg-black/20',
          )}
        >
          <span
            className={cn(
              'font-sans text-xs font-semibold text-white opacity-0 transition-opacity duration-200',
              'group-hover:opacity-100',
            )}
          >
            Editar
          </span>
        </span>

        {/* Pencil badge */}
        <span
          aria-hidden
          className={cn(
            'absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full',
            'bg-primary text-primary-foreground',
            'ring-2 ring-background',
            'transition-transform duration-200 group-hover:scale-110',
          )}
        >
          <Pencil className="h-3 w-3" />
        </span>
      </button>

      <AvatarUploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </>
  )
}

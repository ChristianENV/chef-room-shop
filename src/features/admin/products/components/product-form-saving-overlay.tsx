'use client'

import { Loader2 } from 'lucide-react'

import {
  PRODUCT_FORM_SAVE_STAGE_MESSAGES,
  PRODUCT_FORM_SAVING_DESCRIPTION,
  PRODUCT_FORM_SAVING_TITLE,
  type ProductFormSaveStage,
} from '../lib/product-form-dialog-guards'

type ProductFormSavingOverlayProps = {
  stage: ProductFormSaveStage
}

/**
 * Full-dialog blocking overlay shown while any save/upload operation runs.
 */
export function ProductFormSavingOverlay({ stage }: ProductFormSavingOverlayProps) {
  const stageMessage = stage ? PRODUCT_FORM_SAVE_STAGE_MESSAGES[stage] : null

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/92 px-6 text-center backdrop-blur-sm"
      role="status"
      aria-live="polite"
      data-testid="admin-product-form-saving-overlay"
    >
      <Loader2 className="h-9 w-9 animate-spin text-primary" />
      <p className="font-sans text-base font-medium text-foreground">{PRODUCT_FORM_SAVING_TITLE}</p>
      <p className="max-w-sm font-serif text-sm text-muted-foreground">
        {PRODUCT_FORM_SAVING_DESCRIPTION}
      </p>
      {stageMessage ? (
        <p
          className="font-mono text-xs text-muted-foreground"
          data-testid="admin-product-form-saving-stage"
        >
          {stageMessage}
        </p>
      ) : null}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import {
  isProductDeleteConfirmationValid,
  PRODUCT_DELETE_DIALOG_CANCEL_LABEL,
  PRODUCT_DELETE_DIALOG_CONFIRM_LABEL,
  PRODUCT_DELETE_DIALOG_DESCRIPTION,
  PRODUCT_DELETE_DIALOG_NAME_PROMPT,
  PRODUCT_DELETE_DIALOG_TITLE,
} from './lib/product-delete-dialog'

type DeleteProductDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: { id: string; name: string } | null
  onConfirm: () => void | Promise<void>
  isDeleting?: boolean
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
  isDeleting = false,
}: DeleteProductDialogProps) {
  const [confirmationText, setConfirmationText] = useState('')

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setConfirmationText('')
    }
    onOpenChange(nextOpen)
  }

  if (!product) return null

  const canConfirm = isProductDeleteConfirmationValid(confirmationText, product.name)

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent data-testid="admin-product-delete-dialog">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="font-sans">{PRODUCT_DELETE_DIALOG_TITLE}</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4 font-serif text-sm text-muted-foreground">
              <p>{PRODUCT_DELETE_DIALOG_DESCRIPTION}</p>
              <p>
                Producto: <strong className="font-sans text-foreground">{product.name}</strong>
              </p>
              <div className="space-y-2">
                <Label htmlFor="product-delete-confirmation" className="font-sans text-foreground">
                  {PRODUCT_DELETE_DIALOG_NAME_PROMPT}
                </Label>
                <Input
                  id="product-delete-confirmation"
                  data-testid="admin-product-delete-confirmation-input"
                  value={confirmationText}
                  onChange={(event) => setConfirmationText(event.target.value)}
                  placeholder={product.name}
                  autoComplete="off"
                  disabled={isDeleting}
                  className="font-sans"
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="font-sans">
            {PRODUCT_DELETE_DIALOG_CANCEL_LABEL}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={!canConfirm || isDeleting}
            data-testid="admin-product-delete-confirm-button"
            className="font-sans"
            onClick={() => void onConfirm()}
          >
            {isDeleting ? 'Eliminando…' : PRODUCT_DELETE_DIALOG_CONFIRM_LABEL}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

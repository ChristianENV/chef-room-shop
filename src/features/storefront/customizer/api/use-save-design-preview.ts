'use client'

import { useMutation } from '@tanstack/react-query'
import {
  saveDesignPreview,
  type SaveDesignPreviewInput,
} from './customizer-designs.api'

export function useSaveDesignPreviewMutation() {
  return useMutation({
    mutationFn: (input: SaveDesignPreviewInput) => saveDesignPreview(input),
  })
}

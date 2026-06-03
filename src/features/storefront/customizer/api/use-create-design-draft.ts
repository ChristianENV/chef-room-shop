'use client'

import { useMutation } from '@tanstack/react-query'
import { createDesignDraft, type CreateDesignDraftInput } from './customizer-designs.api'

export function useCreateDesignDraftMutation() {
  return useMutation({
    mutationFn: (input: CreateDesignDraftInput) => createDesignDraft(input),
  })
}

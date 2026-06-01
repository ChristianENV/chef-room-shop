'use client'

import { useMutation } from '@tanstack/react-query'
import { updateDesign, type UpdateDesignInput } from './customizer-designs.api'

export function useUpdateDesignMutation() {
  return useMutation({
    mutationFn: (input: UpdateDesignInput) => updateDesign(input),
  })
}

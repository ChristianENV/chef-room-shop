'use client'

import { useQuery } from '@tanstack/react-query'
import { getDesignById } from './customizer-designs.api'

export const customizerQueryKeys = {
  all: ['customizer-designs'] as const,
  detail: (designId: string) =>
    [...customizerQueryKeys.all, 'detail', designId] as const,
}

export function useDesignQuery(designId?: string | null) {
  return useQuery({
    queryKey: designId
      ? customizerQueryKeys.detail(designId)
      : [...customizerQueryKeys.all, 'detail', 'none'],
    queryFn: () => getDesignById(designId!),
    enabled: Boolean(designId),
  })
}

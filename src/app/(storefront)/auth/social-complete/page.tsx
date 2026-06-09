import type { Metadata } from 'next'

import { completeSocialAuthAndRedirect } from '@/src/server/auth/complete-social-auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Iniciando sesión | Chef Room by Bedolla',
  robots: { index: false, follow: false },
}

type SocialAuthCompletePageProps = {
  searchParams: Promise<{ callbackUrl?: string; source?: string }>
}

export default async function SocialAuthCompletePage({
  searchParams,
}: SocialAuthCompletePageProps) {
  const params = await searchParams
  await completeSocialAuthAndRedirect(params)
}

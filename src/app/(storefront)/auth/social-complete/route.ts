import { NextRequest, NextResponse } from 'next/server'

import { resolveSocialAuthCompletion } from '@/src/server/auth/complete-social-auth'
import { auth } from '@/src/server/auth/better-auth'
import { GUEST_SESSION_COOKIE_NAME } from '@/src/server/guest/guest-session.constants'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const result = await resolveSocialAuthCompletion({
    callbackUrl: searchParams.get('callbackUrl'),
    source: searchParams.get('source'),
  })

  let response: NextResponse

  if (result.signOutRequired) {
    const signOutResponse = await auth.api.signOut({
      headers: request.headers,
      asResponse: true,
    })
    response = NextResponse.redirect(new URL(result.redirectTo, request.url))
    for (const cookie of signOutResponse.headers.getSetCookie()) {
      response.headers.append('Set-Cookie', cookie)
    }
  } else {
    response = NextResponse.redirect(new URL(result.redirectTo, request.url))
  }

  if (result.clearGuestCookie) {
    response.cookies.set(GUEST_SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  }

  return response
}

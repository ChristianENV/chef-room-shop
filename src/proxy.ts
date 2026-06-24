import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routes } from '@/src/config/routes'
import { hasSessionCookieOnRequest, isAdminAuthEnforced } from '@/src/lib/auth/session'
import { canAccessAdminRoute, isProtectedAdminPath } from '@/src/server/auth/permissions'

/**
 * Admin route protection (Edge proxy).
 * Validates cookie presence only — full session/RBAC is enforced in server layouts via requireAdminSession.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtectedAdminPath(pathname)) {
    return NextResponse.next()
  }

  if (!isAdminAuthEnforced()) {
    return NextResponse.next()
  }

  const hasCookie = hasSessionCookieOnRequest(request)

  if (!canAccessAdminRoute(pathname, hasCookie)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = routes.adminLogin
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}

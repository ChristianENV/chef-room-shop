import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routes } from '@/src/config/routes'
import {
  getSessionFromRequest,
  isAdminAuthEnforced,
} from '@/src/lib/auth/session'
import {
  canAccessAdminRoute,
  isProtectedAdminPath,
} from '@/src/server/auth/permissions'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtectedAdminPath(pathname)) {
    return NextResponse.next()
  }

  // TODO: Remove bypass when JWT / session auth is production-ready.
  // Set ADMIN_AUTH_ENFORCE=true locally only when testing real redirects.
  if (!isAdminAuthEnforced()) {
    return NextResponse.next()
  }

  const session = getSessionFromRequest(request)
  const role = session?.role ?? null

  if (!canAccessAdminRoute(pathname, role)) {
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

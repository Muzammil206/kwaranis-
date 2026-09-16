import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const user = token ? await verifySessionToken(token) : null
  const { pathname } = request.nextUrl

  // Auth routes — redirect to / if already logged in
  if (pathname.startsWith('/auth') && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Protected routes — redirect to login if not authenticated
  if ((pathname.startsWith('/admin') || pathname.startsWith('/portal')) && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|api/webhooks).*)'],
}
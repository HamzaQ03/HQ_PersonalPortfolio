import { NextRequest, NextResponse } from 'next/server'

// Gates /dashboard/* (except /dashboard/login) behind a session cookie.
// Splash gating remains client-side via splashState.ts — middleware
// doesn't touch the home route.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  if (pathname === '/dashboard/login') {
    return NextResponse.next()
  }

  const cookie = req.cookies.get('dashboard_session')?.value
  const expected = process.env.DASHBOARD_PASSWORD

  if (!cookie || !expected || cookie !== expected) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/dashboard/login'
    loginUrl.search = ''
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
